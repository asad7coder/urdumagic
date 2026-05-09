import type { UrduMagicConfig, TranslationStrategy, ManagedTranslator } from '../types.js';
export type { ManagedTranslator };
import { MemoryCache, readLocalStorageCache, writeLocalStorageCache } from './cache.js';
import { createAsyncRateLimiter } from './debounce.js';
import { toRoman, toUrdu } from './transliterator.js';
import { EnglishEngine } from '../engines/englishEngine.js';
import { getDictionaryAsync } from './dictionary-loader.js';

const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cacheKey(source: string, target: string, text: string): string {
  return `${source}:${target}:${text.toLowerCase().trim()}`;
}

/**
 * Offline-only strategy that does not make any network calls.
 */
export class OfflineTranslator implements TranslationStrategy {
  readonly name = 'offline';
  async translate(text: string): Promise<string> {
    return `${text} [?]`; // Fallback for when dictionary fails in offline mode
  }
}

function resolvePlugin(_config: UrduMagicConfig): TranslationStrategy {
  return new OfflineTranslator();
}

/**
 * Build a translator pipeline from {@link UrduMagicConfig}.
 */
export function createManagedTranslator(config: UrduMagicConfig): ManagedTranslator {
  const externalStrategy = resolvePlugin(config);
  const cacheTTL = config.performance?.cacheTTL ?? DEFAULT_CACHE_TTL_MS;
  const memoryCache = new MemoryCache(1000, cacheTTL);
  const limiter = createAsyncRateLimiter(config.performance?.rateLimitMs ?? 500);

  const translateWithFallback = async (text: string, targetLang: 'ur' | 'en' | 'roman'): Promise<string> => {
    // Ensure dictionary is loaded for offline lookups
    await getDictionaryAsync();

    const source = targetLang === 'ur' ? 'en' : 'ur';
    const target = targetLang === 'ur' ? 'ur' : 'en';
    const normalizedText = text.toLowerCase().trim();
    const key = cacheKey(source, target, normalizedText);

    // 1. Dictionary Lookup (Primary)
    if (targetLang === 'ur' || targetLang === 'roman') {
      const translation = targetLang === 'ur'
        ? EnglishEngine.translateToUrdu(normalizedText)
        : EnglishEngine.translateToRoman(normalizedText);

      if (translation && translation !== normalizedText) {
        return translation;
      }
    }

    // 2. Memory Cache
    const mem = memoryCache.get(key);
    if (mem !== undefined) return mem;

    // 3. LocalStorage Cache
    const ls = readLocalStorageCache(key);
    if (ls !== undefined) {
      memoryCache.set(key, ls, cacheTTL);
      return ls;
    }

    // 4. External API with Rate Limiting and Retry
    const callApi = async (): Promise<string> => {
      const out = await limiter.schedule(() => externalStrategy.translate(text, targetLang));
      memoryCache.set(key, out, cacheTTL);
      writeLocalStorageCache(key, out, cacheTTL);
      return out;
    };

    try {
      return await callApi();
    } catch {
      await delay(300);
      try {
        return await callApi();
      } catch {
        return `${text} [?]`;
      }
    }
  };

  return {
    translate: translateWithFallback,

    async translateBatch(texts: string[], targetLang: 'ur' | 'en' | 'roman'): Promise<string[]> {
      return Promise.all(texts.map(t => translateWithFallback(t, targetLang)));
    },

    toRoman(text: string): string {
      return toRoman(text);
    },

    toUrdu(text: string): string {
      return toUrdu(text);
    },

    async healthCheck(): Promise<{ healthy: boolean }> {
      return { healthy: true };
    },

    dispose(): void {
      memoryCache.clear();
    },

    // Mock stats for Pro analytics
    getErrorRate(): number { return 0; },
    getTotalTranslations(): number { return 0; },
    getTopTranslations(): any[] { return []; }
  } as any; // Cast to any to satisfy temporary gaps while refactoring
}

export { DEFAULT_CACHE_TTL_MS };
