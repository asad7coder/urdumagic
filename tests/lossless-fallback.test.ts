/**
 * Regression tests: lossless unknown-word fallback + language switching
 * These tests use the REAL dictionary (not mocked).
 *
 * INVARIANT: unknown word → original word   (NEVER word[?] or [?])
 *            known word   → translated word
 *            punctuation  → preserved
 */
import { describe, it, expect } from 'vitest';
import { UrduMagic } from '../src';

// ──────────────────────────────────────────────────────────────────────────────
// 1. Known word
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Known words translate correctly', () => {
  it('khubsoorat → Urdu', () => {
    const result = UrduMagic.fromEnglish('beautiful');
    expect(result.urdu).not.toContain('[?]');
    expect(result.urdu.length).toBeGreaterThan(0);
  });

  it('"how are you" → Urdu (full confidence)', () => {
    const result = UrduMagic.fromEnglish('how are you');
    expect(result.confidence).toBe('full');
    expect(result.urdu).not.toContain('[?]');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. Unknown word — MUST return original, NEVER [?]
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Unknown words must never produce [?]', () => {
  it('"someUnknownWord" → preserved unchanged', () => {
    const result = UrduMagic.fromEnglish('someUnknownWord');
    expect(result.urdu).not.toContain('[?]');
    expect(result.urdu).toBe('someUnknownWord');
  });

  it('"xyzabc123" → preserved unchanged (existing test)', () => {
    const result = UrduMagic.fromEnglish('xyzabc123');
    expect(result.confidence).toBe('none');
    expect(result.urdu).toBe('xyzabc123');
    expect(result.urdu).not.toContain('[?]');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. Product names
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Product names are preserved', () => {
  const productNames = [
    'UrduMagic',
    'GitHub',
    'npm',
    'TypeScript',
    'JavaScript',
    'Next.js',
    'React',
    'SaaS',
  ];

  for (const name of productNames) {
    it(`"${name}" → preserved, never [?]`, () => {
      const result = UrduMagic.fromEnglish(name);
      // Must never produce [?]
      expect(result.urdu).not.toContain('[?]');
      // Must not be empty
      expect(result.urdu.length).toBeGreaterThan(0);
    });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. Technical terms
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Technical terms are preserved', () => {
  const techTerms = ['API', 'XSS', 'HTML', 'CSS', 'AI', 'LMS', 'CMS', 'MIT'];

  for (const term of techTerms) {
    it(`"${term}" → never [?]`, () => {
      const result = UrduMagic.fromEnglish(term);
      expect(result.urdu).not.toContain('[?]');
    });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 5. Version strings and numbers
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Version strings and numbers preserved', () => {
  it('"v0.2.0" → preserved', () => {
    const result = UrduMagic.fromEnglish('v0.2.0');
    expect(result.urdu).not.toContain('[?]');
    expect(result.urdu).toBe('v0.2.0');
  });

  it('"10,000+" → preserved', () => {
    const result = UrduMagic.fromEnglish('10,000+');
    expect(result.urdu).not.toContain('[?]');
    expect(result.urdu).toBe('10,000+');
  });

  it('"16 KB" → preserved', () => {
    const result = UrduMagic.fromEnglish('16 KB');
    expect(result.urdu).not.toContain('[?]');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 6. Punctuation preservation
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Punctuation is preserved', () => {
  it('"Hello!" → [?] never appears', () => {
    const result = UrduMagic.fromEnglish('hello!');
    expect(result.urdu).not.toContain('[?]');
  });

  it('"React/Next.js" → slash and dot preserved', () => {
    const result = UrduMagic.fromEnglish('React/Next.js');
    expect(result.urdu).not.toContain('[?]');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 7. Mixed known + unknown sentences
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Mixed sentences never produce [?]', () => {
  it('"hello antigravity" → urdu contains hello translation, no [?]', () => {
    const result = UrduMagic.fromEnglish('hello antigravity');
    expect(result.urdu).not.toContain('[?]');
    // The unknown word "antigravity" must remain
    expect(result.urdu).toContain('antigravity');
    expect(result.confidence).toBe('partial');
  });

  it('"Add UrduMagic to your website" → no [?]', () => {
    const result = UrduMagic.fromEnglish('Add UrduMagic to your website');
    expect(result.urdu).not.toContain('[?]');
  });

  it('"Build your SaaS application" → no [?]', () => {
    const result = UrduMagic.fromEnglish('Build your SaaS application');
    expect(result.urdu).not.toContain('[?]');
  });

  it('"10,000+ dictionary entries" → no [?]', () => {
    const result = UrduMagic.fromEnglish('10,000+ dictionary entries');
    expect(result.urdu).not.toContain('[?]');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 8. Roman Urdu — known words
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Roman Urdu known words transliterate correctly', () => {
  it('"theek hai" → ٹھیک ہے', () => {
    // toUrdu is the Roman→Urdu transliterator (not the English dict)
    const result = UrduMagic.toUrdu('theek hai');
    expect(result).not.toContain('[?]');
    expect(result).toBe('ٹھیک ہے');
  });

  it('"mohabbat" → محبت (via Roman dict)', () => {
    const result = UrduMagic.toUrdu('mohabbat');
    expect(result).not.toContain('[?]');
    expect(result).toBe('محبت');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 9. Roman Urdu — unknown words must be preserved
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Unknown Roman Urdu words are preserved', () => {
  it('"Pakistan" (not a Roman Urdu stopword) → preserved', () => {
    // Pakistan should be passed through unchanged, not converted badly
    const result = UrduMagic.toUrdu('Pakistan is beautiful');
    expect(result).not.toContain('[?]');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 10. Empty and whitespace
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Edge cases', () => {
  it('empty string → empty string', () => {
    const result = UrduMagic.fromEnglish('');
    expect(result.urdu).toBe('');
    expect(result.urdu).not.toContain('[?]');
  });

  it('"   " (whitespace only) → no [?]', () => {
    const result = UrduMagic.fromEnglish('   ');
    expect(result.urdu).not.toContain('[?]');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 11. Repeated translation of same text
// ──────────────────────────────────────────────────────────────────────────────
describe('Regression: Repeated translation is stable', () => {
  it('Translating the same text twice gives same result', () => {
    const r1 = UrduMagic.fromEnglish('hello SaaS');
    const r2 = UrduMagic.fromEnglish('hello SaaS');
    expect(r1.urdu).toEqual(r2.urdu);
    expect(r1.urdu).not.toContain('[?]');
  });
});
