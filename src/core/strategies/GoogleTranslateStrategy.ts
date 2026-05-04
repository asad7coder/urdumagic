// ============================================================================
// GOOGLE TRANSLATE STRATEGY
// Built-in Google Translate translation strategy
// ============================================================================

import type {
  TranslationStrategy,
  TranslationStrategyConfig,
  QuotaInfo,
  RateLimitInfo
} from '../../types.js';

/**
 * Google Translate strategy implementation
 */
export class GoogleTranslateStrategy implements TranslationStrategy {
  name = 'google';
  private config: TranslationStrategyConfig;
  private apiKey?: string;
  private timeout: number;
  private retries: number;

  constructor(config: TranslationStrategyConfig = {}) {
    this.config = config;
    this.apiKey = config.googleApiKey;
    this.timeout = config.timeout || 10000;
    this.retries = config.retries || 3;
  }

  /**
   * Translate text using Google Translate API
   */
  async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Google Translate API key is required');
    }

    const sourceLang = targetLang === 'ur' ? 'en' : 'ur';

    const body = {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await this.makeRequest('', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || `HTTP ${response.status}`);
        }

        return data.data.translations[0].translatedText;

      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.retries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error('Translation failed after retries');
  }

  /**
   * Translate batch of texts
   */
  async translateBatch(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('Google Translate API key is required');
    }

    const sourceLang = targetLang === 'ur' ? 'en' : 'ur';

    const body = {
      q: texts,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    };

    try {
      const response = await this.makeRequest('', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return data.data.translations.map((t: any) => t.translatedText);

    } catch (error) {
      // Fallback to individual translations
      const results = await Promise.allSettled(
        texts.map(text => this.translate(text, targetLang))
      );

      return results.map((result, index) =>
        result.status === 'fulfilled' ? result.value : `${texts[index]} [translation failed]`
      );
    }
  }

  /**
   * Check if Google Translate is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await this.makeRequest('/languages', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get quota information
   */
  async getQuota(): Promise<QuotaInfo | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await this.makeRequest('', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          target: 'ur',
          q: ['test']
        })
      });

      if (!response.ok) {
        return null;
      }

      // Google Translate doesn't provide quota info in API response
      // Return estimated values based on typical Google Cloud quotas
      return {
        used: 0,
        limit: 500000, // 500K characters per month for standard tier
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Get rate limit information
   */
  async getRateLimit(): Promise<RateLimitInfo | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      // Google Translate doesn't provide rate limit info in API response
      // Return estimated values based on typical Google Cloud limits
      return {
        requests: 1000, // ~1000 requests per minute
        window: 60000, // 1 minute
        current: 0,
        resetTime: Date.now() + 60000
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TranslationStrategyConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.googleApiKey !== undefined) {
      this.apiKey = config.googleApiKey;
    }

    if (config.timeout !== undefined) {
      this.timeout = config.timeout;
    }

    if (config.retries !== undefined) {
      this.retries = config.retries;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): TranslationStrategyConfig {
    return { ...this.config };
  }

  /**
   * Make HTTP request with timeout
   */
  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const baseUrl = 'https://translation.googleapis.com/language/translate/v2';
    const url = `${baseUrl}${endpoint}`;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // No specific cleanup needed for Google Translate
  }
}
