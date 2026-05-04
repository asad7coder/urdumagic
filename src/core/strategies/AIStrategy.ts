// ============================================================================
// AI TRANSLATION STRATEGY
// Built-in AI translation strategy (OpenAI, Anthropic, etc.)
// ============================================================================

import type { 
  TranslationStrategy, 
  TranslationStrategyConfig,
  QuotaInfo,
  RateLimitInfo
} from '../../types.js';

/**
 * AI translation strategy implementation
 */
export class AIStrategy implements TranslationStrategy {
  name = 'ai';
  private config: TranslationStrategyConfig;
  private provider: 'openai' | 'anthropic' | 'custom';
  private apiKey?: string;
  private model?: string;
  private timeout: number;
  private retries: number;

  constructor(config: TranslationStrategyConfig = {}) {
    this.config = config;
    this.provider = config.aiProvider || 'openai';
    this.apiKey = config.aiApiKey;
    this.model = config.aiModel || this.getDefaultModel();
    this.timeout = config.timeout || 15000; // AI requests take longer
    this.retries = config.retries || 2;
  }

  /**
   * Translate text using AI API
   */
  async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('AI API key is required');
    }

    const prompt = this.buildPrompt(text, targetLang);
    
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await this.makeRequest(prompt);
        return this.parseResponse(response, targetLang);

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.retries - 1) {
          await this.delay(Math.pow(2, attempt) * 2000);
        }
      }
    }

    throw lastError || new Error('AI translation failed after retries');
  }

  /**
   * Translate batch of texts
   */
  async translateBatch(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('AI API key is required');
    }

    // For AI, translate individually to avoid context mixing
    const results = await Promise.allSettled(
      texts.map(text => this.translate(text, targetLang))
    );

    return results.map((result, index) => 
      result.status === 'fulfilled' ? result.value : `${texts[index]} [translation failed]`
    );
  }

  /**
   * Check if AI service is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      // Test with a simple translation
      await this.translate('hello', 'ur');
      return true;
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
      // Different providers have different quota endpoints
      switch (this.provider) {
        case 'openai':
          return await this.getOpenAIQuota();
        case 'anthropic':
          return await this.getAnthropicQuota();
        default:
          return null;
      }
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
      // Different providers have different rate limits
      switch (this.provider) {
        case 'openai':
          return {
            requests: 3500, // ~3500 requests per hour for gpt-3.5
            window: 3600000, // 1 hour
            current: 0,
            resetTime: Date.now() + 3600000
          };
        case 'anthropic':
          return {
            requests: 1000, // ~1000 requests per hour
            window: 3600000, // 1 hour
            current: 0,
            resetTime: Date.now() + 3600000
          };
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TranslationStrategyConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.aiProvider !== undefined) {
      this.provider = config.aiProvider;
    }
    
    if (config.aiApiKey !== undefined) {
      this.apiKey = config.aiApiKey;
    }
    
    if (config.aiModel !== undefined) {
      this.model = config.aiModel;
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
   * Build prompt for AI translation
   */
  private buildPrompt(text: string, targetLang: 'ur' | 'en'): string {
    const targetLanguage = targetLang === 'ur' ? 'Urdu' : 'English';
    const sourceLanguage = targetLang === 'ur' ? 'English' : 'Urdu';
    
    return `Translate the following ${sourceLanguage} text to ${targetLanguage}. Only return the translated text, no explanations:

${text}`;
  }

  /**
   * Parse AI response
   */
  private parseResponse(response: any, targetLang: 'ur' | 'en'): string {
    switch (this.provider) {
      case 'openai':
        return response.choices?.[0]?.message?.content?.trim() || '';
      case 'anthropic':
        return response.content?.[0]?.text?.trim() || '';
      default:
        return response?.trim() || '';
    }
  }

  /**
   * Make AI API request
   */
  private async makeRequest(prompt: string): Promise<any> {
    switch (this.provider) {
      case 'openai':
        return await this.makeOpenAIRequest(prompt);
      case 'anthropic':
        return await this.makeAnthropicRequest(prompt);
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Make OpenAI API request
   */
  private async makeOpenAIRequest(prompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Make Anthropic API request
   */
  private async makeAnthropicRequest(prompt: string): Promise<any> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey!,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model || 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get OpenAI quota
   */
  private async getOpenAIQuota(): Promise<QuotaInfo | null> {
    try {
      const response = await fetch('https://api.openai.com/v1/usage', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return {
        used: data.total_usage || 0,
        limit: 1000000, // Default limit
        resetDate: new Date(Date.now() + 86400000)
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Get Anthropic quota
   */
  private async getAnthropicQuota(): Promise<QuotaInfo | null> {
    // Anthropic doesn't provide quota info in API
    return {
      used: 0,
      limit: 1000000,
      resetDate: new Date(Date.now() + 86400000)
    };
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(): string {
    switch (this.provider) {
      case 'openai':
        return 'gpt-3.5-turbo';
      case 'anthropic':
        return 'claude-3-haiku-20240307';
      default:
        return 'gpt-3.5-turbo';
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
    // No specific cleanup needed for AI strategy
  }
}
