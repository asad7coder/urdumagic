// ============================================================================
// STRATEGY FACTORY
// Example API for creating custom translation strategies
// ============================================================================

import type {
  TranslationStrategy,
  TranslationStrategyConfig,
  StrategyFactory,
  StrategyMetadata
} from '../types.js';
import type { QuotaInfo, RateLimitInfo } from '../types.js';

/**
 * Base strategy class for easy extension
 */
export abstract class BaseStrategy implements TranslationStrategy {
  abstract name: string;
  protected config: TranslationStrategyConfig;

  constructor(config: TranslationStrategyConfig) {
    this.config = config;
  }

  abstract translate(text: string, targetLang: 'ur' | 'en'): Promise<string>;

  async translateBatch(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]> {
    // Default implementation - translate individually
    return Promise.all(texts.map(text => this.translate(text, targetLang)));
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getQuota(): Promise<QuotaInfo | null> {
    return null;
  }

  async getRateLimit(): Promise<RateLimitInfo | null> {
    return null;
  }

  destroy(): void {
    // Default cleanup
  }
}

/**
 * Example: Custom Microsoft Translator Strategy
 */
export class MicrosoftTranslatorStrategy extends BaseStrategy {
  name = 'microsoft';
  private apiKey?: string;
  private region?: string;

  constructor(config: TranslationStrategyConfig) {
    super(config);
    this.apiKey = (config as any).microsoftApiKey;
    this.region = (config as any).microsoftRegion;
  }

  async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Microsoft Translator API key is required');
    }

    const sourceLang = targetLang === 'ur' ? 'en' : 'ur';
    const url = 'https://api.cognitive.microsofttranslator.com/translate';

    const params = new URLSearchParams({
      'api-version': '3.0',
      'from': sourceLang,
      'to': targetLang
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey!,
        'Ocp-Apim-Subscription-Region': this.region || 'global',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ text }])
    });

    if (!response.ok) {
      throw new Error(`Microsoft Translator API error: ${response.status}`);
    }

    const data = await response.json();
    return data[0]?.translations[0]?.text || text;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async getQuota(): Promise<QuotaInfo | null> {
    // Microsoft Translator pricing: $10 per 2M characters
    return {
      used: 0, // Would need to track usage
      limit: 2000000,
      resetDate: new Date(Date.now() + 86400000)
    };
  }
}

/**
 * Example: Custom DeepL Strategy
 */
export class DeepLStrategy extends BaseStrategy {
  name = 'deepl';
  private apiKey?: string;

  constructor(config: TranslationStrategyConfig) {
    super(config);
    this.apiKey = (config as any).deeplApiKey;
  }

  async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepL API key is required');
    }

    // DeepL language codes
    const targetLangCode = targetLang === 'ur' ? 'UR' : 'EN';
    const sourceLangCode = targetLang === 'ur' ? 'EN' : 'UR';

    const formData = new FormData();
    formData.append('text', text);
    formData.append('target_lang', targetLangCode);
    formData.append('source_lang', sourceLangCode);

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey!}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translations[0]?.text || text;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async getQuota(): Promise<QuotaInfo | null> {
    // DeepL Free: 500,000 characters/month
    return {
      used: 0,
      limit: 500000,
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    };
  }
}

/**
 * Strategy factory functions
 */
export const StrategyFactories = {
  /**
   * Create Microsoft Translator strategy
   */
  microsoft: (config: TranslationStrategyConfig): TranslationStrategy => {
    return new MicrosoftTranslatorStrategy(config);
  },

  /**
   * Create DeepL strategy
   */
  deepl: (config: TranslationStrategyConfig): TranslationStrategy => {
    return new DeepLStrategy(config);
  },

  /**
   * Create custom strategy from factory function
   */
  custom: (factory: StrategyFactory, metadata: StrategyMetadata): {
    factory: StrategyFactory;
    metadata: StrategyMetadata;
  } => ({
    factory,
    metadata
  })
};

/**
 * Example usage:
 *
 * ```typescript
 * import { StrategyRegistry, StrategyFactories } from './StrategyRegistry';
 *
 * const registry = new StrategyRegistry();
 *
 * // Register Microsoft Translator
 * const result = registry.registerStrategy({
 *   factory: StrategyFactories.microsoft,
 *   metadata: {
 *     name: 'microsoft',
 *     version: '1.0.0',
 *     description: 'Microsoft Translator API',
 *     author: 'UrduMagic',
 *     supportedLanguages: ['en', 'ur'],
 *     requiresApiKey: true,
 *     costPerCharacter: 0.000005, // $10 per 2M chars
 *     capabilities: {
 *       batchTranslation: true,
 *       quotaTracking: true,
 *       rateLimiting: true,
 *       healthCheck: true
 *     },
 *     security: {
 *       exposesApiKey: true,
 *       requiresProxy: false,
 *       clientSafe: false
 *     }
 *   },
 *   priority: 80
 * });
 *
 * if (result.valid) {
 *   console.log('Microsoft Translator registered successfully');
 * } else {
 *   console.error('Registration failed:', result.errors);
 * }
 * ```
 */

// ============================================================================
// EXPORTS
// ============================================================================

// All exports are already declared with 'export' keyword above
