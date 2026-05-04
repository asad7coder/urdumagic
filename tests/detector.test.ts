import { describe, expect, it } from 'vitest';
import { detectScript, isRomanUrdu } from '../src/core/detector.js';

describe('detector', () => {
  it('classifies script types', () => {
    expect(detectScript('آپ کیسے ہیں')).toBe('arabic');
    expect(detectScript('acha theek hai')).toBe('roman-urdu');
    expect(detectScript('hello world')).toBe('english');
    expect(detectScript('hello آپ کیسے')).toBe('mixed');
  });

  it('detects Roman Urdu heuristics', () => {
    expect(isRomanUrdu('kya haal hai')).toBe(true);
    expect(isRomanUrdu('what is this')).toBe(false);
  });
});
