import { lookupWord } from '../core/dictionary-loader.js';
import { toRoman } from '../core/transliterator.js';

export class EnglishEngine {
  private static cleanToken(text: string): string {
    return text.replace(/[.,/#!$%^&*;:{}=\-_`~()?[\]"']/g, '').toLowerCase().trim();
  }

  /**
   * Translates English text to Urdu script using the offline dictionary.
   * Performs exact phrase lookup first, then falls back to word-by-word.
   *
   * @param text        The source text to translate.
   * @param onMissing   Optional internal callback invoked for each token that
   *                    is NOT found in the dictionary. The original token
   *                    (with casing) is passed. Return type remains `string`.
   */
  static translateToUrdu(text: string, onMissing?: (word: string) => void): string {
    const lower = text.toLowerCase().trim();

    // Try exact match (phrase-level)
    const exact = lookupWord(lower) ?? lookupWord(this.cleanToken(lower));
    if (exact) return exact;

    // Try word by word — preserve original casing for fallback
    const words = text.trim().split(/\s+/);
    const results = words.map(word => {
      // Remove punctuation for lookup
      const cleanWord = this.cleanToken(word);
      const match = lookupWord(cleanWord);
      if (match) return match;
      // Unknown — invoke the collector callback, then return original unchanged
      onMissing?.(word);
      return word;
    });
    return results.join(' ');
  }

  /**
   * Translates English text to Roman Urdu using the offline dictionary.
   *
   * Roman Urdu is derived by first finding the Urdu equivalent via
   * translateToUrdu(), then transliterating it. Any tokens that miss the
   * dictionary miss via the same lookup path, so the same onMissing
   * callback is valid and semantically correct here.
   *
   * @param text        The source text.
   * @param onMissing   Optional internal callback for unknown tokens.
   */
  static translateToRoman(text: string, onMissing?: (word: string) => void): string {
    const lower = text.toLowerCase().trim();

    // Pass original text (not lower) to preserve casing in fallback/collection
    const urdu = this.translateToUrdu(text, onMissing);
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
