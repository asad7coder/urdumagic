import type { CacheEntry } from '../types.js';
import { tokenizeNormalized } from './dictionary-loader.js';

const LS_PREFIX = 'urdumagic:';

function isQuotaExceededError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'name' in e &&
    (e as { name: string }).name === 'QuotaExceededError'
  );
}

/**
 * In-memory LRU cache with TTL and a maximum entry count.
 */
export class MemoryCache {
  private readonly map = new Map<string, CacheEntry>();
  private readonly order: string[] = [];
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;

  constructor(maxEntries: number, defaultTtlMs: number) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key: string): string | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.deleteKey(key);
      return undefined;
    }
    this.touch(key);
    return entry.value;
  }

  set(key: string, value: string, ttlMs?: number): void {
    const now = Date.now();
    const ttl = ttlMs ?? this.defaultTtlMs;
    const expiresAt = now + ttl;

    if (this.map.has(key)) {
      this.map.set(key, { value, timestamp: now, expiresAt });
      this.touch(key);
      return;
    }

    while (this.order.length >= this.maxEntries) {
      const oldest = this.order.shift();
      if (oldest !== undefined) this.map.delete(oldest);
    }

    this.map.set(key, { value, timestamp: now, expiresAt });
    this.order.push(key);
  }

  clear(): void {
    this.map.clear();
    this.order.length = 0;
  }

  /**
   * Parses a cache key of the form `source:target:normalizedText` and
   * returns its three segments. Returns null if the key is malformed.
   */
  static parseCacheKey(key: string): { source: string; target: string; normalizedText: string } | null {
    const firstColon = key.indexOf(':');
    if (firstColon === -1) return null;
    const secondColon = key.indexOf(':', firstColon + 1);
    if (secondColon === -1) return null;
    return {
      source: key.slice(0, firstColon),
      target: key.slice(firstColon + 1, secondColon),
      normalizedText: key.slice(secondColon + 1),
    };
  }

  /**
   * Invalidates every cache entry whose source text contains `word` as an
   * exact token (not a substring of another word).
   *
   * Uses `tokenizeNormalized()` — the same tokenizer as EnglishEngine — so
   * "app" will NOT accidentally invalidate "apple" or "application".
   */
  invalidateByToken(word: string): void {
    const normalizedWord = word.toLowerCase().trim();
    const toDelete: string[] = [];
    for (const key of this.map.keys()) {
      const parsed = MemoryCache.parseCacheKey(key);
      if (!parsed) continue;
      const tokens = tokenizeNormalized(parsed.normalizedText);
      if (tokens.includes(normalizedWord)) toDelete.push(key);
    }
    for (const key of toDelete) this.deleteKey(key);
  }

  private touch(key: string): void {
    const i = this.order.indexOf(key);
    if (i >= 0) this.order.splice(i, 1);
    this.order.push(key);
  }

  private deleteKey(key: string): void {
    this.map.delete(key);
    const i = this.order.indexOf(key);
    if (i >= 0) this.order.splice(i, 1);
  }
}

function localStorageAvailable(): boolean {
  try {
    if (typeof globalThis.localStorage === 'undefined') return false;
    const k = `${LS_PREFIX}__probe__`;
    globalThis.localStorage.setItem(k, '1');
    globalThis.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a cache entry from localStorage; removes expired or corrupted keys.
 */
export function readLocalStorageCache(key: string): string | undefined {
  if (!localStorageAvailable()) return undefined;
  const full = `${LS_PREFIX}${key}`;
  const raw = globalThis.localStorage.getItem(full);
  if (raw === null) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    globalThis.localStorage.removeItem(full);
    return undefined;
  }
  if (!isCacheEntry(parsed)) {
    globalThis.localStorage.removeItem(full);
    return undefined;
  }
  if (Date.now() > parsed.expiresAt) {
    globalThis.localStorage.removeItem(full);
    return undefined;
  }
  return parsed.value;
}

/**
 * Write a cache entry to localStorage. Swallows quota errors.
 */
export function writeLocalStorageCache(
  key: string,
  value: string,
  ttlMs: number,
): void {
  if (!localStorageAvailable()) return;
  const now = Date.now();
  const entry: CacheEntry = {
    value,
    timestamp: now,
    expiresAt: now + ttlMs,
  };
  const full = `${LS_PREFIX}${key}`;
  try {
    globalThis.localStorage.setItem(full, JSON.stringify(entry));
  } catch (e) {
    if (isQuotaExceededError(e)) return;
    throw e;
  }
}

function isCacheEntry(v: unknown): v is CacheEntry {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.value === 'string' &&
    typeof o.timestamp === 'number' &&
    typeof o.expiresAt === 'number'
  );
}

/**
 * Invalidates localStorage cache entries whose source text contains `word`
 * as an exact token — using the same parseCacheKey + tokenizeNormalized logic
 * as MemoryCache.invalidateByToken().
 *
 * Only touches keys with the `urdumagic:` prefix; the `urdumagic:missing_words`
 * key is separate and is never touched here.
 */
export function invalidateLocalStorageByToken(word: string): void {
  try {
    if (typeof globalThis.localStorage === 'undefined') return;
    const ls = globalThis.localStorage;
    const normalizedWord = word.toLowerCase().trim();
    const keysToRemove: string[] = [];

    for (let i = 0; i < ls.length; i++) {
      const fullKey = ls.key(i);
      if (!fullKey || !fullKey.startsWith(LS_PREFIX)) continue;
      // Never touch the dedicated missing-words storage key
      if (fullKey === `${LS_PREFIX}missing_words`) continue;

      // Strip the prefix to get the raw cache key, then parse it
      const rawKey = fullKey.slice(LS_PREFIX.length);
      const parsed = MemoryCache.parseCacheKey(rawKey);
      if (!parsed) continue;

      const tokens = tokenizeNormalized(parsed.normalizedText);
      if (tokens.includes(normalizedWord)) keysToRemove.push(fullKey);
    }

    for (const key of keysToRemove) {
      try { ls.removeItem(key); } catch { /* silent */ }
    }
  } catch {
    // localStorage unavailable or restricted — swallow silently
  }
}
