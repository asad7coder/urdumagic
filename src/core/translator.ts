import type { UrduMagicConfig, TranslationStrategy, ManagedTranslator } from '../types.js';
export type { ManagedTranslator };
import { MemoryCache, readLocalStorageCache, writeLocalStorageCache, invalidateLocalStorageByToken } from './cache.js';
import { createAsyncRateLimiter } from './debounce.js';
import { toRoman, toUrdu } from './transliterator.js';
import { EnglishEngine } from '../engines/englishEngine.js';
import { getDictionaryAsync, onDictionaryUpdate } from './dictionary-loader.js';
import { MissingWordCollector, NoopCollector, type AnyCollector } from './collector.js';

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
  /**
   * Offline fallback: always return the original text unchanged.
   * This library is offline-first — there is no external API.
   * An unknown word is NOT an error; preserve it as-is.
   */
  async translate(text: string): Promise<string> {
    return text;
  }
}

function resolvePlugin(_config: UrduMagicConfig): TranslationStrategy {
  return new OfflineTranslator();
}

/**
 * Build a translator pipeline from {@link UrduMagicConfig}.
 * Optionally instantiates a missing-word collector when config.collectMissingWords is true.
 */
export function createManagedTranslator(config: UrduMagicConfig): ManagedTranslator & { collector: AnyCollector } {
  const externalStrategy = resolvePlugin(config);
  const cacheTTL = config.performance?.cacheTTL ?? DEFAULT_CACHE_TTL_MS;
  const memoryCache = new MemoryCache(1000, cacheTTL);
  const limiter = createAsyncRateLimiter(config.performance?.rateLimitMs ?? 500);

  // ── Missing-word collector setup ────────────────────────────────────────────
  const collector: AnyCollector = config.collectMissingWords
    ? new MissingWordCollector({
        maxMissingWords: config.maxMissingWords,
        persist: config.persistMissingWords ?? false,
      })
    : new NoopCollector();

  // Internal onMissing callback wired into EnglishEngine
  const onMissing = config.collectMissingWords
    ? (word: string) => (collector as MissingWordCollector).add(word)
    : undefined;

  // ── Dictionary-update listener (synchronous cache invalidation + collector cleanup) ──
  const unsubscribeDictListener = onDictionaryUpdate((updatedWords: string[]) => {
    for (const word of updatedWords) {
      // 1. Remove from active collector (word is now known — no longer missing)
      collector.remove(word);
      // 2. Targeted memory-cache invalidation — exact token match only
      memoryCache.invalidateByToken(word);
      // 3. Targeted localStorage invalidation — exact token match only
      invalidateLocalStorageByToken(word);
    }
  });

  const translateWithFallback = async (text: string, targetLang: 'ur' | 'en' | 'roman'): Promise<string> => {
    // Ensure dictionary is loaded for offline lookups
    await getDictionaryAsync();

    const source = targetLang === 'ur' ? 'en' : 'ur';
    const target = targetLang === 'ur' ? 'ur' : 'en';
    const normalizedText = text.toLowerCase().trim();
    const key = cacheKey(source, target, normalizedText);

    // 1. Dictionary Lookup (Primary)
    // EnglishEngine returns the original text when no translation is found.
    // If the result differs from the input, a real translation was found.
    // If it's the same, the word is unknown — return it unchanged (LOSSLESS).
    if (targetLang === 'ur' || targetLang === 'roman') {
      const translation = targetLang === 'ur'
        ? EnglishEngine.translateToUrdu(normalizedText, onMissing)
        : EnglishEngine.translateToRoman(normalizedText, onMissing);

      if (translation && translation !== normalizedText) {
        // Known word — return the translated result
        return translation;
      }
      // Unknown word — preserve original text (no [?], no corruption)
      return text;
    }

    // 2. Memory Cache (for 'en' reverse direction)
    const mem = memoryCache.get(key);
    if (mem !== undefined) return mem;

    // 3. LocalStorage Cache
    const ls = readLocalStorageCache(key);
    if (ls !== undefined) {
      memoryCache.set(key, ls, cacheTTL);
      return ls;
    }

    // 4. Offline strategy (returns text unchanged — no external API in this library)
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
        // Strategy failed — preserve original text, never append [?]
        return text;
      }
    }
  };

  return {
    collector,

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
      unsubscribeDictListener(); // prevent listener leak
    },

    // Mock stats for Pro analytics
    getErrorRate(): number { return 0; },
    getTotalTranslations(): number { return 0; },
    getTopTranslations(): any[] { return []; }
  } as any;
}

export { DEFAULT_CACHE_TTL_MS };
