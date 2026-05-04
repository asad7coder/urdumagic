// ============================================================================
// OFFLINE TRANSLATION STRATEGY
// Built-in offline translation using transliteration
// ============================================================================

import type { 
  TranslationStrategy, 
  TranslationStrategyConfig,
  QuotaInfo,
  RateLimitInfo
} from '../../types.js';

import { toUrdu as toUrduImpl, toRoman as toRomanImpl } from '../transliterator.js';

/**
 * Offline translation strategy using transliteration
 */
export class OfflineStrategy implements TranslationStrategy {
  name = 'offline';
  private config: TranslationStrategyConfig;

  constructor(config: TranslationStrategyConfig = {}) {
    this.config = config;
  }

  /**
   * Translate text using offline transliteration
   */
  async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    // For offline strategy, we can only do transliteration
    // English to Urdu: Use transliteration
    // Urdu to English: Return transliterated Roman Urdu
    
    if (targetLang === 'ur') {
      // English to Urdu script
      return toUrduImpl(text);
    } else {
      // Urdu to English (return as Roman Urdu since we can't actually translate)
      const detectedScript = this.detectScript(text);
      if (detectedScript === 'arabic' || detectedScript === 'roman-urdu') {
        return toRomanImpl(text);
      }
      // If it's already English, return as-is
      return text;
    }
  }

  /**
   * Translate batch of texts
   */
  async translateBatch(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]> {
    return Promise.all(texts.map(text => this.translate(text, targetLang)));
  }

  /**
   * Offline strategy is always available
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }

  /**
   * Offline strategy has no quota limits
   */
  async getQuota(): Promise<QuotaInfo | null> {
    return {
      used: 0,
      limit: Infinity,
      resetDate: new Date(Date.now() + 86400000)
    };
  }

  /**
   * Offline strategy has no rate limits
   */
  async getRateLimit(): Promise<RateLimitInfo | null> {
    return {
      requests: Infinity,
      window: 86400000,
      current: 0,
      resetTime: Date.now() + 86400000
    };
  }

  /**
   * Update configuration (no-op for offline)
   */
  updateConfig(config: Partial<TranslationStrategyConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): TranslationStrategyConfig {
    return { ...this.config };
  }

  /**
   * Simple script detection
   */
  private detectScript(text: string): 'arabic' | 'latin' | 'roman-urdu' | 'english' | 'mixed' {
    const urduChars = /[\u0600-\u06FF]/;
    const latinChars = /[a-zA-Z]/;
    
    const hasUrdu = urduChars.test(text);
    const hasLatin = latinChars.test(text);
    
    if (hasUrdu && hasLatin) {
      return 'mixed';
    } else if (hasUrdu) {
      return 'arabic';
    } else if (hasLatin) {
      // Simple heuristic to detect Roman Urdu vs English
      const romanUrduWords = /\b(aap|tum|main|hai|hain|ki|ka|ke|ko|se|mein|par|tak|liye|wala|vali|bhi|hi|or|aur|lekin|magar|kyunki|qki|jab|tab|agar|agr|toh|phir|fir|yah|ye|woh|vo|unhein|unko|inhain|inko|iska|iske|uska|uske|unki|unke|jiska|jiske|jiske|apna|apne|apki|apke|tera|tere|teri|tumhara|tumhare|unka|unki|unke)\b/i;
      
      if (romanUrduWords.test(text)) {
        return 'roman-urdu';
      }
      return 'english';
    }
    
    return 'latin';
  }

  /**
   * Cleanup resources (no-op for offline)
   */
  destroy(): void {
    // No cleanup needed for offline strategy
  }
}
