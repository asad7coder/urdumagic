import { describe, expect, it } from 'vitest';
import { ROMAN_TO_URDU_KEY_COUNT } from '../src/core/roman-urdu-dict.js';
import { toRoman, toUrdu } from '../src/core/transliterator.js';

describe('transliterator', () => {
  it('meets minimum dictionary key count', () => {
    expect(ROMAN_TO_URDU_KEY_COUNT).toBeGreaterThanOrEqual(600);
  });

  it('maps common Roman Urdu variants to Urdu script', () => {
    expect(toUrdu('acha')).toBe('اچھا');
    expect(toUrdu('theek')).toBe('ٹھیک');
    expect(toUrdu('kya')).toBe('کیا');
    expect(toUrdu('kia')).toBe('کیا');
    expect(toUrdu('hai')).toBe('ہے');
    expect(toUrdu('hay')).toBe('ہے');
    expect(toUrdu('bhai')).toBe('بھائی');
    expect(toUrdu('nahi')).toBe('نہیں');
    expect(toUrdu('nahin')).toBe('نہیں');
    expect(toUrdu('bohat')).toBe('بہت');
    expect(toUrdu('bahut')).toBe('بہت');
  });

  it('maps Urdu script to Roman Urdu', () => {
    expect(toRoman('کیا')).toBe('kya');
    expect(toRoman('ہے')).toBe('hai');
    expect(toRoman('بھائی')).toBe('bhai');
  });

  it('completes many conversions quickly', () => {
    const sentence = 'acha theek hai kya haal hai';
    const t0 = Date.now();
    for (let i = 0; i < 1000; i += 1) {
      toUrdu(sentence);
      toRoman('کیا ہے بھائی');
    }
    expect(Date.now() - t0).toBeLessThan(1000);
  });
});
