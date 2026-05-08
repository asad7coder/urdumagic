import { ENGLISH_URDU_DICT } from '../data/english-urdu-dictionary.js';

export class EnglishEngine {
  
  /**
   * Translates English text to Urdu script using the offline dictionary.
   * Performs exact phrase lookup first, then falls back to word-by-word.
   */
  static translateToUrdu(text: string): string {
    const lower = text.toLowerCase().trim();
    
    // Try exact match
    const exact = ENGLISH_URDU_DICT.get(lower);
    if (exact) return exact.urdu;
    
    // Try word by word
    const words = lower.split(/\s+/);
    const results = words.map(word => {
      // Remove punctuation for lookup
      const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      const match = ENGLISH_URDU_DICT.get(cleanWord.toLowerCase());
      return match ? match.urdu : "";
    });
    return results.filter(Boolean).join(' ');
  }
  
  /**
   * Translates English text to Roman Urdu using the offline dictionary.
   */
  static translateToRoman(text: string): string {
    const lower = text.toLowerCase().trim();
    
    const exact = ENGLISH_URDU_DICT.get(lower);
    if (exact) return exact.roman;
    
    const words = lower.split(/\s+/);
    const results = words.map(word => {
      const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      const match = ENGLISH_URDU_DICT.get(cleanWord.toLowerCase());
      return match ? match.roman : "";
    });
    return results.filter(Boolean).join(' ');
  }
  
  /**
   * Returns confidence level based on dictionary coverage.
   */
  static getConfidence(text: string): 'full' | 'partial' | 'none' {
    const lower = text.toLowerCase().trim();
    if (ENGLISH_URDU_DICT.has(lower)) return 'full';
    
    const words = lower.split(/\s+/).map(w => w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase());
    const matched = words.filter(w => ENGLISH_URDU_DICT.has(w));
    
    if (matched.length === words.length && words.length > 0) return 'full';
    if (matched.length > 0) return 'partial';
    return 'none';
  }
}
