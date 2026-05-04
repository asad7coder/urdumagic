import { describe, expect, it, vi } from 'vitest';
import { MemoryCache, readLocalStorageCache, writeLocalStorageCache } from '../src/core/cache.js';

describe('cache', () => {
  it('stores and retrieves memory cache entries', () => {
    const c = new MemoryCache(1000, 60_000);
    c.set('a', 'one');
    expect(c.get('a')).toBe('one');
  });

  it('expires entries after TTL', () => {
    const c = new MemoryCache(1000, 1);
    c.set('x', 'y', 1);
    expect(c.get('x')).toBe('y');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(c.get('x')).toBeUndefined();
        resolve();
      }, 20);
    });
  });

  it('evicts oldest entries at max size', () => {
    const c = new MemoryCache(3, 60_000);
    c.set('1', 'a');
    c.set('2', 'b');
    c.set('3', 'c');
    c.set('4', 'd');
    expect(c.get('1')).toBeUndefined();
    expect(c.get('4')).toBe('d');
  });

  it('persists to localStorage when available', () => {
    const store = new Map<string, string>();
    const ls = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    };
    vi.stubGlobal('localStorage', ls);
    writeLocalStorageCache('k1', 'v1', 60_000);
    expect(readLocalStorageCache('k1')).toBe('v1');
    vi.unstubAllGlobals();
  });

  it('removes corrupted localStorage entries', () => {
    const store = new Map<string, string>([['urdumagic:bad', '{not-json']]);
    const ls = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    };
    vi.stubGlobal('localStorage', ls);
    expect(readLocalStorageCache('bad')).toBeUndefined();
    expect(store.has('urdumagic:bad')).toBe(false);
    vi.unstubAllGlobals();
  });
});
