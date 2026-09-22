import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createManagedTranslator } from '../core/translator.js';

// Mock the dictionary loader — only "hello" is in the dictionary.
// Use importOriginal so new real exports (onDictionaryUpdate, tokenizeNormalized)
// are not accidentally excluded by the mock.
vi.mock('../core/dictionary-loader.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../core/dictionary-loader.js')>();
  return {
    ...actual,
    getDictionaryAsync: vi.fn(() => Promise.resolve(new Map([['hello', 'ہیلو']]))),
    lookupWord: vi.fn(() => 'ہیلو'),
  };
});

// ─── Helper ───────────────────────────────────────────────────────────────────
function makeTranslator() {
  return createManagedTranslator({ defaultLang: 'en', modes: ['en', 'ur', 'roman'] });
}

describe('translator.ts - Dictionary Layering + Lossless Fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Known word ───────────────────────────────────────────────────────────────
  it('1. Known word: "hello" → translates to Urdu', async () => {
    const { lookupWord } = await import('../core/dictionary-loader.js');
    (lookupWord as any).mockReturnValue('ہیلو');

    const translator = makeTranslator();
    const result = await translator.translate('hello', 'ur');
    expect(result).toBe('ہیلو');
  });

  // ── Unknown word — must return original, NEVER [?] ────────────────────────
  it('2. Unknown word: returns original word, NEVER appends "[?]"', async () => {
    const { lookupWord } = await import('../core/dictionary-loader.js');
    (lookupWord as any).mockReturnValue(undefined);

    const translator = makeTranslator();
    const result = await translator.translate('unknown-word', 'ur');

    // LOSSLESS: unknown word must be preserved, never appended with [?]
    expect(result).toBe('unknown-word');
    expect(result).not.toContain('[?]');
  });

  // ── Technical terms — must be preserved ──────────────────────────────────
  it('3. Technical terms preserved: React, SaaS, GitHub, npm, API, MIT', async () => {
    const { lookupWord } = await import('../core/dictionary-loader.js');
    (lookupWord as any).mockReturnValue(undefined);

    const translator = makeTranslator();
    const terms = ['React', 'SaaS', 'GitHub', 'npm', 'API', 'MIT', 'TypeScript', 'Next.js'];
    for (const term of terms) {
      const result = await translator.translate(term, 'ur');
      expect(result, `"${term}" must not produce [?]`).not.toContain('[?]');
    }
  });

  // ── Product name ─────────────────────────────────────────────────────────
  it('4. Product name "UrduMagic" preserved as-is', async () => {
    const { lookupWord } = await import('../core/dictionary-loader.js');
    (lookupWord as any).mockReturnValue(undefined);

    const translator = makeTranslator();
    const result = await translator.translate('UrduMagic', 'ur');
    expect(result).toBe('UrduMagic');
    expect(result).not.toContain('[?]');
  });

  // ── Version strings ───────────────────────────────────────────────────────
  it('5. Version string "v0.2.0" preserved as-is', async () => {
    const { lookupWord } = await import('../core/dictionary-loader.js');
    (lookupWord as any).mockReturnValue(undefined);

    const translator = makeTranslator();
    const result = await translator.translate('v0.2.0', 'ur');
    expect(result).toBe('v0.2.0');
    expect(result).not.toContain('[?]');
  });

  // ── Numbers with symbols ─────────────────────────────────────────────────
  it('6. "10,000+" preserved as-is', async () => {
    const { lookupWord } = await import('../core/dictionary-loader.js');
    (lookupWord as any).mockReturnValue(undefined);

    const translator = makeTranslator();
    const result = await translator.translate('10,000+', 'ur');
    expect(result).toBe('10,000+');
    expect(result).not.toContain('[?]');
  });

  // ── Empty string ─────────────────────────────────────────────────────────
  it('7. Empty string returns empty string', async () => {
    const translator = makeTranslator();
    const result = await translator.translate('', 'ur');
    expect(result).toBe('');
    expect(result).not.toContain('[?]');
  });

  // ── Roman mode — unknown word must also not [?] ───────────────────────────
  it('8. Unknown word in roman mode: returns original, never [?]', async () => {
    const { lookupWord } = await import('../core/dictionary-loader.js');
    (lookupWord as any).mockReturnValue(undefined);

    const translator = makeTranslator();
    const result = await translator.translate('SaaS', 'roman');
    expect(result).not.toContain('[?]');
  });

  // ── Batch translate — no [?] for any unknown word ─────────────────────────
  it('9. translateBatch: no [?] for any unknown word', async () => {
    const { lookupWord } = await import('../core/dictionary-loader.js');
    (lookupWord as any).mockReturnValue(undefined);

    const translator = makeTranslator();
    const inputs = ['UrduMagic', 'SaaS', 'React', '10K+', 'v0.2.0', 'MIT', 'GitHub'];
    const results = await translator.translateBatch(inputs, 'ur');
    results.forEach((r, i) => {
      expect(r, `index ${i} ("${inputs[i]}") must not produce [?]`).not.toContain('[?]');
    });
  });
});
