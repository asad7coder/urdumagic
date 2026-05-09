import { lookupWord } from '../core/dictionary-loader.js';
import { toRoman } from '../core/transliterator.js';

export class EnglishEngine {
  private static cleanToken(text: string): string {
    return text.replace(/[.,/#!$%^&*;:{}=\-_`~()?[\]"']/g, '').toLowerCase().trim();
  }

  /**
   * Translates English text to Urdu script using the offline dictionary.
   * Performs exact phrase lookup first, then falls back to word-by-word.
   */
  static translateToUrdu(text: string): string {
    const lower = text.toLowerCase().trim();

    // Try exact match
    const exact = lookupWord(lower) ?? lookupWord(this.cleanToken(lower));
    if (exact) return exact;

    // Try word by word
    const words = lower.split(/\s+/);
    const results = words.map(word => {
      // Remove punctuation for lookup
      const cleanWord = this.cleanToken(word);
      const match = lookupWord(cleanWord);
      return match || word;
    });
    return results.join(' ');
  }

  /**
   * Translates English text to Roman Urdu using the offline dictionary.
   */
  static translateToRoman(text: string): string {
    const lower = text.toLowerCase().trim();

    const urdu = this.translateToUrdu(lower);
    if (urdu !== lower) {
      return toRoman(urdu);
    }

    return lower;
  }

  /**
   * Returns confidence level based on dictionary coverage.
   */
  static getConfidence(text: string): 'full' | 'partial' | 'none' {
    const lower = text.toLowerCase().trim();
    if (lookupWord(lower) ?? lookupWord(this.cleanToken(lower))) return 'full';

    const words = lower.split(/\s+/).map(w => this.cleanToken(w)).filter(Boolean);
    const matched = words.filter(w => lookupWord(w));

    if (matched.length === words.length && words.length > 0) return 'full';
    if (matched.length > 0) return 'partial';
    return 'none';
  }
}
