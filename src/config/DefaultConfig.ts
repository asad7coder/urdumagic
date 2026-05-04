// ============================================================================
// DEFAULT CONFIGURATION
// Strict defaults for zero-configuration usage
// ============================================================================

import type { UrduMagicConfig, LangMode } from '../types.js';

/**
 * Strict default configuration for UrduMagic
 * Ensures predictable behavior with zero config
 */
export const DefaultConfig: Readonly<UrduMagicConfig> = {
  // Core settings
  defaultLang: 'en',
  modes: ['en', 'ur', 'roman'],
  showSwitcher: false,

  // Translation settings (Hybrid System)
  strategy: 'libre', // Free, always available
  strategyConfig: {
    libreUrl: 'https://libretranslate.com',
    timeout: 10000,
    retries: 3
  },
  fallbackChain: {
    strategies: ['libre', 'offline'], // Libre → Offline (always works)
    strategy: 'sequential',
    timeout: 5000
  },

  // Performance settings
  performance: {
    cacheTTL: 3600000, // 1 hour
    cacheSize: 1000,
    debounceMs: 300,
    rateLimitMs: 100, // 10 requests per second
    batchSize: 5,
    webWorkers: false, // Disabled for simplicity
    prefetchEnabled: false
  },

  // Magic mode settings (conservative defaults)
  magicMode: {
    enabled: false, // Disabled by default to avoid breaking UI
    selector: 'body', // Start with body, can be refined
    skipTags: ['script', 'style', 'noscript', 'iframe', 'object', 'embed'],
    skipClasses: ['no-translate', 'code', 'pre'],
    attributes: ['title', 'alt', 'placeholder'],
    preserveOriginal: true, // Keep original text for debugging
    debounceMs: 500 // Slower to avoid performance issues
  },

  // Security settings (strict by default)
  security: {
    sanitizeInput: true,
    allowedTags: [], // No HTML allowed in translation
    allowedAttributes: [],
    maxLength: 5000, // Reasonable limit
    enableCSP: false // Disabled for simplicity
  },

  // Monitoring settings
  monitoring: {
    enabled: false, // Disabled by default
    logLevel: 'error', // Only errors by default
    healthCheckInterval: 30000 // 30 seconds
  },

  // Event callbacks (all optional)
  onLangSwitch: undefined,
  onTranslationStart: undefined,
  onTranslationComplete: undefined,
  onError: undefined,
  onStrategyChange: undefined,
  onFallbackUsed: undefined
};

/**
 * Configuration validation rules
 */
export interface ConfigValidationRule {
  field: keyof UrduMagicConfig;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  allowedValues?: any[];
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string;
}

/**
 * Validation rules for configuration
 */
export const ConfigValidationRules: ConfigValidationRule[] = [
  {
    field: 'defaultLang',
    required: true,
    type: 'string',
    allowedValues: ['en', 'ur', 'roman']
  },
  {
    field: 'modes',
    required: true,
    type: 'array',
    validator: (value) => {
      if (!Array.isArray(value)) return 'Must be an array';
      if (value.length === 0) return 'Must include at least one language';
      const validModes = ['en', 'ur', 'roman'];
      const invalidModes = value.filter(mode => !validModes.includes(mode));
      if (invalidModes.length > 0) return `Invalid modes: ${invalidModes.join(', ')}`;
      return true;
    }
  },
  {
    field: 'strategy',
    type: 'string',
    allowedValues: ['libre', 'google', 'ai', 'offline']
  },
  {
    field: 'performance',
    type: 'object',
    validator: (value) => {
      if (!value || typeof value !== 'object') return 'Must be an object';
      if (value.cacheTTL && (typeof value.cacheTTL !== 'number' || value.cacheTTL < 0)) {
        return 'cacheTTL must be a positive number';
      }
      if (value.rateLimitMs && (typeof value.rateLimitMs !== 'number' || value.rateLimitMs < 50)) {
        return 'rateLimitMs must be at least 50ms';
      }
      return true;
    }
  },
  {
    field: 'security',
    type: 'object',
    validator: (value) => {
      if (!value || typeof value !== 'object') return 'Must be an object';
      if (value.maxLength && (typeof value.maxLength !== 'number' || value.maxLength < 1)) {
        return 'maxLength must be a positive number';
      }
      return true;
    }
  }
];

/**
 * Configuration merger with validation
 */
export class ConfigManager {
  /**
   * Merge user config with defaults
   */
  static merge(userConfig: Partial<UrduMagicConfig> = {}): UrduMagicConfig {
    // Deep merge user config with defaults
    const merged = this.deepMerge(DefaultConfig, userConfig);
    
    // Validate merged config
    const validation = this.validate(merged);
    if (!validation.valid) {
      console.warn('UrduMagic configuration validation failed:', validation.errors);
      // Apply fixes for critical issues
      return this.fixCriticalIssues(merged, validation.errors);
    }
    
    return merged;
  }

  /**
   * Validate configuration
   */
  static validate(config: UrduMagicConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of ConfigValidationRules) {
      const value = config[rule.field];
      
      // Check required fields
      if (rule.required && (value === undefined || value === null)) {
        errors.push(`Required field '${rule.field}' is missing`);
        continue;
      }

      // Skip validation if field is not provided
      if (value === undefined) continue;

      // Type validation
      if (rule.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rule.type) {
          errors.push(`Field '${rule.field}' must be of type ${rule.type}, got ${actualType}`);
          continue;
        }
      }

      // Allowed values validation
      if (rule.allowedValues && !rule.allowedValues.includes(value)) {
        errors.push(`Field '${rule.field}' must be one of: ${rule.allowedValues.join(', ')}`);
        continue;
      }

      // Range validation
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`Field '${rule.field}' must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`Field '${rule.field}' must be at most ${rule.max}`);
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push(`Field '${rule.field}' does not match required pattern`);
      }

      // Custom validator
      if (rule.validator) {
        const result = rule.validator(value);
        if (result !== true) {
          if (typeof result === 'string') {
            errors.push(`Field '${rule.field}': ${result}`);
          } else {
            errors.push(`Field '${rule.field}' validation failed`);
          }
        }
      }
    }

    // Add warnings for non-critical issues
    if (config.strategy === 'google' && !config.strategyConfig?.googleApiKey) {
      warnings.push('Google Translate strategy selected but no API key provided');
    }
    
    if (config.strategy === 'ai' && !config.strategyConfig?.aiApiKey) {
      warnings.push('AI strategy selected but no API key provided');
    }

    if (config.magicMode?.enabled && config.magicMode?.selector === 'body') {
      warnings.push('Magic mode enabled on entire body - may impact performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Fix critical configuration issues
   */
  private static fixCriticalIssues(
    config: UrduMagicConfig, 
    errors: string[]
  ): UrduMagicConfig {
    const fixed = { ...config };

    // Fix missing required fields
    if (errors.some(error => error.includes('defaultLang'))) {
      fixed.defaultLang = 'en';
    }

    if (errors.some(error => error.includes('modes'))) {
      fixed.modes = ['en', 'ur'];
    }

    // Fix strategy without API key
    if (fixed.strategy === 'google' && !fixed.strategyConfig?.googleApiKey) {
      fixed.strategy = 'libre';
      console.warn('Switched to Libre strategy due to missing Google API key');
    }

    if (fixed.strategy === 'ai' && !fixed.strategyConfig?.aiApiKey) {
      fixed.strategy = 'libre';
      console.warn('Switched to Libre strategy due to missing AI API key');
    }

    return fixed;
  }

  /**
   * Deep merge objects
   */
  private static deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (sourceValue === undefined) continue;
      
      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = this.deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
    
    return result;
  }

  /**
   * Get configuration summary for debugging
   */
  static getSummary(config: UrduMagicConfig): {
    strategy: string;
    defaultLang: string;
    magicModeEnabled: boolean;
    hasApiKey: boolean;
    cacheEnabled: boolean;
    debugEnabled: boolean;
  } {
    return {
      strategy: config.strategy || 'libre',
      defaultLang: config.defaultLang || 'en',
      magicModeEnabled: !!config.magicMode?.enabled,
      hasApiKey: !!(
        config.strategyConfig?.apiKey ||
        config.strategyConfig?.googleApiKey ||
        config.strategyConfig?.aiApiKey
      ),
      cacheEnabled: !!config.performance?.cacheTTL && config.performance.cacheTTL > 0,
      debugEnabled: config.monitoring?.enabled === true
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { DefaultConfig, ConfigManager };
