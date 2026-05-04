import { describe, expect, it, vi } from 'vitest';
import { MemoryCache } from '../src/core/cache.js';
import { createTranslationPipeline, LibreTranslateTranslator } from '../src/core/translator.js';

describe('translator', () => {
  it('returns cached translations without calling fetch', async () => {
    const mem = new MemoryCache(1000, 60_000);
    mem.set('en:ur:hello', 'سلام');
    const plugin = new LibreTranslateTranslator('https://example.com');
    const spy = vi.spyOn(globalThis, 'fetch');
    const pipe = createTranslationPipeline(plugin, {
      memoryCache: mem,
      cacheTTL: 60_000,
      rateLimiterMs: 500,
    });
    const out = await pipe.translate('hello', 'ur');
    expect(out).toBe('سلام');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('parses successful LibreTranslate responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(JSON.stringify({ translatedText: 'ہیلو' }), { status: 200 });
      }),
    );
    const plugin = new LibreTranslateTranslator('https://lt.test');
    const mem = new MemoryCache(1000, 60_000);
    const pipe = createTranslationPipeline(plugin, {
      memoryCache: mem,
      cacheTTL: 60_000,
      rateLimiterMs: 0,
    });
    const out = await pipe.translate('hello', 'ur');
    expect(out).toBe('ہیلو');
    vi.unstubAllGlobals();
  });

  it('waits for Retry-After on 429 then retries', async () => {
    let calls = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        calls += 1;
        if (calls === 1) {
          return new Response('', { status: 429, headers: { 'Retry-After': '0' } });
        }
        return new Response(JSON.stringify({ translatedText: 'ok' }), { status: 200 });
      }),
    );
    const plugin = new LibreTranslateTranslator('https://lt.test');
    const mem = new MemoryCache(1000, 60_000);
    const pipe = createTranslationPipeline(plugin, {
      memoryCache: mem,
      cacheTTL: 60_000,
      rateLimiterMs: 0,
    });
    const out = await pipe.translate('x', 'ur');
    expect(out).toBe('ok');
    expect(calls).toBe(2);
    vi.unstubAllGlobals();
  });

  it('returns fallback marker after failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 500 })),
    );
    const plugin = new LibreTranslateTranslator('https://lt.test');
    const mem = new MemoryCache(1000, 60_000);
    const pipe = createTranslationPipeline(plugin, {
      memoryCache: mem,
      cacheTTL: 60_000,
      rateLimiterMs: 0,
    });
    const out = await pipe.translate('fail me', 'ur');
    expect(out).toBe('fail me [?]');
    vi.unstubAllGlobals();
  });
});
