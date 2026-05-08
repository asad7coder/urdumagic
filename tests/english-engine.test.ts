import { describe, it, expect } from 'vitest';
import { UrduMagic } from '../src';

describe('EnglishEngine / fromEnglish', () => {
  it('should translate common phrases correctly (exact match)', () => {
    const result = UrduMagic.fromEnglish('how are you');
    expect(result.urdu).toBe('آپ کیسے ہیں');
    expect(result.confidence).toBe('full');
  });

  it('should handle case insensitivity', () => {
    const result = UrduMagic.fromEnglish('HOW ARE YOU');
    expect(result.urdu).toBe('آپ کیسے ہیں');
    expect(result.confidence).toBe('full');
  });

  it('should handle partial matches with unknown words', () => {
    const result = UrduMagic.fromEnglish('hello antigravity');
    expect(result.confidence).toBe('partial');
    expect(result.urdu).toBe('سلام'); 
  });

  it('should handle Islamic terms', () => {
    const result = UrduMagic.fromEnglish('alhamdulillah');
    expect(result.urdu).toBe('الحمدللہ');
    expect(result.confidence).toBe('full');
  });

  it('should handle technology terms', () => {
    const result = UrduMagic.fromEnglish('download software');
    expect(result.confidence).toBe('full'); 
    expect(result.urdu).toBe('ڈاؤن لوڈ سافٹ ویئر');
  });

  it('should return none for completely unknown text', () => {
    const result = UrduMagic.fromEnglish('xyzabc123');
    expect(result.confidence).toBe('none');
    expect(result.urdu).toBe('');
  });

  it('should handle mixed punctuation', () => {
    const result = UrduMagic.fromEnglish('hello!');
    expect(result.urdu).toBe('سلام');
  });
});
