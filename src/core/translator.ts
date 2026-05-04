import type { TranslatorPlugin, UrduMagicConfig } from '../types.js';
import { MemoryCache, readLocalStorageCache, writeLocalStorageCache } from './cache.js';
import { createAsyncRateLimiter } from './debounce.js';

const DEFAULT_LIBRE_URL = 'https://libretranslate.com';
const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * LibreTranslate-backed translator plugin. Throws on non-recoverable HTTP errors
 * so outer retry logic can run; handles 429 with `Retry-After`.
 */
export class LibreTranslateTranslator implements TranslatorPlugin {
  readonly name = 'libretranslate';

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey?: string,
  ) {}

  async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    const source = targetLang === 'ur' ? 'en' : 'ur';
    const target = targetLang === 'ur' ? 'ur' : 'en';
    const url = `${normalizeBaseUrl(this.baseUrl)}/translate`;

    const doFetch = async (): Promise<Response> => {
      const body: Record<string, string> = {
        q: text,
        source,
        target,
        format: 'text',
      };
      if (this.apiKey !== undefined && this.apiKey.length > 0) {
        body.api_key = this.apiKey;
      }
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    };

    let res = await doFetch();

    if (res.status === 429) {
      const ra = res.headers.get('Retry-After');
      const seconds = ra !== null ? Number.parseInt(ra, 10) : 1;
      const waitMs = (Number.isFinite(seconds) ? Math.max(0, seconds) : 1) * 1000;
      await delay(waitMs);
      res = await doFetch();
    }

    if (res.status >= 500) {
      throw new Error(`LibreTranslate server error: ${res.status}`);
    }

    if (!res.ok) {
      throw new Error(`LibreTranslate request failed: ${res.status}`);
    }

    const jsonUnknown: unknown = await res.json();
    if (!isTranslateResponse(jsonUnknown)) {
      throw new Error('LibreTranslate: invalid response shape');
    }
    return jsonUnknown.translatedText;
  }
}

function isTranslateResponse(v: unknown): v is { translatedText: string } {
  return (
    typeof v === 'object' &&
    v !== null &&
    'translatedText' in v &&
    typeof (v as { translatedText: unknown }).translatedText === 'string'
  );
}

function cacheKey(source: string, target: string, text: string): string {
  return `${source}:${target}:${text}`;
}

function resolvePlugin(config: UrduMagicConfig): TranslatorPlugin {
  if (config.translator === 'custom' && config.customTranslator !== undefined) {
    return config.customTranslator;
  }
  const url = config.libreUrl ?? DEFAULT_LIBRE_URL;
  return new LibreTranslateTranslator(url, config.apiKey);
}

export interface TranslationPipelineOptions {
  readonly memoryCache: MemoryCache;
  readonly cacheTTL: number;
  readonly rateLimiterMs: number;
}

/**
 * Full translation pipeline: memory cache → localStorage → API with rate limit,
 * single 300ms retry, and guaranteed string fallback.
 */
export function createTranslationPipeline(
  plugin: TranslatorPlugin,
  opts: TranslationPipelineOptions,
): {
  translate(text: string, targetLang: 'ur' | 'en'): Promise<string>;
} {
  const limiter = createAsyncRateLimiter(opts.rateLimiterMs);

  const callApiOnce = async (text: string, targetLang: 'ur' | 'en'): Promise<string> => {
    const source = targetLang === 'ur' ? 'en' : 'ur';
    const target = targetLang === 'ur' ? 'ur' : 'en';
    const out = await limiter.schedule(() => plugin.translate(text, targetLang));
    const key = cacheKey(source, target, text);
    opts.memoryCache.set(key, out, opts.cacheTTL);
    writeLocalStorageCache(key, out, opts.cacheTTL);
    return out;
  };

  return {
    async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
      const source = targetLang === 'ur' ? 'en' : 'ur';
      const target = targetLang === 'ur' ? 'ur' : 'en';
      const key = cacheKey(source, target, text);

      const mem = opts.memoryCache.get(key);
      if (mem !== undefined) return mem;

      const ls = readLocalStorageCache(key);
      if (ls !== undefined) {
        opts.memoryCache.set(key, ls, opts.cacheTTL);
        return ls;
      }

      try {
        return await callApiOnce(text, targetLang);
      } catch {
        await delay(300);
        try {
          return await callApiOnce(text, targetLang);
        } catch {
          return `${text} [?]`;
        }
      }
    },
  };
}

export interface ManagedTranslator {
  readonly translate: (text: string, targetLang: 'ur' | 'en') => Promise<string>;
  readonly dispose: () => void;
}

/**
 * Build a translator pipeline from {@link UrduMagicConfig}.
 */
export function createManagedTranslator(config: UrduMagicConfig): ManagedTranslator {
  const plugin = resolvePlugin(config);
  const cacheTTL = config.cacheTTL ?? DEFAULT_CACHE_TTL_MS;
  const memoryCache = new MemoryCache(1000, cacheTTL);
  const pipeline = createTranslationPipeline(plugin, {
    memoryCache,
    cacheTTL,
    rateLimiterMs: 500,
  });

  return {
    translate: (text: string, targetLang: 'ur' | 'en') => pipeline.translate(text, targetLang),
    dispose: (): void => {
      memoryCache.clear();
    },
  };
}

export { DEFAULT_LIBRE_URL, DEFAULT_CACHE_TTL_MS };
