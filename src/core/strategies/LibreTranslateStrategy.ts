// ============================================================================
// LIBRETRANSLATE STRATEGY
// Built-in LibreTranslate translation strategy
// ============================================================================

import type { 
  TranslationStrategy, 
  TranslationStrategyConfig,
  QuotaInfo,
  RateLimitInfo
} from '../../types.js';

/**
 * LibreTranslate strategy implementation
 */
export class LibreTranslateStrategy implements TranslationStrategy {
  name = 'libre';
  private config: TranslationStrategyConfig;
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;
  private retries: number;

  constructor(config: TranslationStrategyConfig = {}) {
    this.config = config;
    this.baseUrl = config.libreUrl || 'https://libretranslate.com';
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 10000;
    this.retries = config.retries || 3;
  }

  /**
   * Translate text using LibreTranslate API
   */
  async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    const sourceLang = targetLang === 'ur' ? 'en' : 'ur';
    
    const body = new URLSearchParams({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    });

    if (this.apiKey) {
      body.append('api_key', this.apiKey);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await this.makeRequest('/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString()
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data.translatedText;

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
    // LibreTranslate doesn't have batch API, so translate individually
    const results = await Promise.allSettled(
      texts.map(text => this.translate(text, targetLang))
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : `${text} [translation failed]`
    );
  }

  /**
   * Check if LibreTranslate is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/languages', {
        method: 'GET',
        headers: {}
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get quota information (if API key is provided)
   */
  async getQuota(): Promise<QuotaInfo | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await this.makeRequest('/quota', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return {
        used: data.character_count || 0,
        limit: data.character_limit || 1000000,
        resetDate: new Date(Date.now() + 86400000) // Next day
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
      const response = await this.makeRequest('/quota', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return {
        requests: data.req_limit || 1000,
        window: 86400000, // 24 hours
        current: data.req_count || 0,
        resetTime: Date.now() + 86400000
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
    
    if (config.libreUrl) {
      this.baseUrl = config.libreUrl;
    }
    
    if (config.apiKey !== undefined) {
      this.apiKey = config.apiKey;
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
    const url = `${this.baseUrl}${endpoint}`;
    
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
    // No specific cleanup needed for LibreTranslate
  }
}
