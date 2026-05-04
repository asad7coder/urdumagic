import type { CacheEntry } from '../types.js';

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
