// ============================================================================
// STRATEGY REGISTRY
// Controlled extensibility layer for translation strategies
// ============================================================================

import type { 
  TranslationStrategy, 
  TranslationStrategyConfig,
  StrategyStats,
  QuotaInfo,
  RateLimitInfo
} from '../types.js';

/**
 * Strategy factory function type
 */
export type StrategyFactory = (config: TranslationStrategyConfig) => TranslationStrategy;

/**
 * Strategy metadata for validation
 */
export interface StrategyMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  supportedLanguages: Array<'en' | 'ur'>;
  requiresApiKey: boolean;
  costPerCharacter?: number;
  maxTextLength?: number;
  capabilities: {
    batchTranslation: boolean;
    quotaTracking: boolean;
    rateLimiting: boolean;
    healthCheck: boolean;
  };
  security: {
    exposesApiKey: boolean;
    requiresProxy: boolean;
    clientSafe: boolean;
  };
}

/**
 * Strategy registration options
 */
export interface StrategyRegistration {
  factory: StrategyFactory;
  metadata: StrategyMetadata;
  priority?: number;
  enabled?: boolean;
}

/**
 * Validation result for strategy registration
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Controlled strategy registry
 * - Validates strategies before registration
 * - Maintains type safety
 * - Supports tree-shaking
 * - Provides security checks
 */
export class StrategyRegistry {
  private strategies: Map<string, StrategyRegistration> = new Map();
  private instances: Map<string, TranslationStrategy> = new Map();
  private config: TranslationStrategyConfig;
  private registrationEnabled: boolean = true;
  private maxStrategies: number = 10;

  constructor(config: TranslationStrategyConfig = {}) {
    this.config = config;
    this.registerBuiltinStrategies();
  }

  /**
   * Register a new strategy with validation
   */
  registerStrategy(registration: StrategyRegistration): ValidationResult {
    const result = this.validateRegistration(registration);
    
    if (!result.valid) {
      return result;
    }

    if (!this.registrationEnabled) {
      result.errors.push('Strategy registration is disabled');
      return result;
    }

    if (this.strategies.size >= this.maxStrategies) {
      result.errors.push(`Maximum strategy limit (${this.maxStrategies}) reached`);
      return result;
    }

    // Security checks
    if (!registration.metadata.security.clientSafe) {
      result.warnings.push('Strategy is not client-safe, consider using proxy mode');
    }

    if (registration.metadata.security.exposesApiKey) {
      result.warnings.push('Strategy exposes API key in client code');
    }

    // Register strategy
    this.strategies.set(registration.metadata.name, registration);
    
    console.log(`Strategy registered: ${registration.metadata.name} v${registration.metadata.version}`);
    
    return result;
  }

  /**
   * Unregister a strategy
   */
  unregisterStrategy(name: string): boolean {
    if (!this.strategies.has(name)) {
      return false;
    }

    // Clean up instance
    const instance = this.instances.get(name);
    if (instance?.destroy) {
      instance.destroy();
    }
    
    this.instances.delete(name);
    this.strategies.delete(name);
    
    console.log(`Strategy unregistered: ${name}`);
    return true;
  }

  /**
   * Get strategy instance (lazy initialization)
   */
  getStrategy(name: string): TranslationStrategy | undefined {
    const registration = this.strategies.get(name);
    if (!registration) {
      return undefined;
    }

    // Return existing instance
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    // Create new instance
    try {
      const instance = registration.factory(this.config);
      this.instances.set(name, instance);
      return instance;
    } catch (error) {
      console.error(`Failed to create strategy instance: ${name}`, error);
      return undefined;
    }
  }

  /**
   * Get all registered strategy names
   */
  getStrategyNames(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Get strategy metadata
   */
  getStrategyMetadata(name: string): StrategyMetadata | undefined {
    return this.strategies.get(name)?.metadata;
  }

  /**
   * Get all strategy metadata
   */
  getAllMetadata(): Record<string, StrategyMetadata> {
    const result: Record<string, StrategyMetadata> = {};
    
    for (const [name, registration] of this.strategies) {
      result[name] = registration.metadata;
    }
    
    return result;
  }

  /**
   * Get available strategies (enabled and healthy)
   */
  async getAvailableStrategies(): Promise<string[]> {
    const available: string[] = [];
    
    for (const [name, registration] of this.strategies) {
      if (!registration.enabled) continue;
      
      const instance = this.getStrategy(name);
      if (!instance) continue;
      
      try {
        const isAvailable = instance.isAvailable ? await instance.isAvailable() : true;
        if (isAvailable) {
          available.push(name);
        }
      } catch (error) {
        console.warn(`Strategy availability check failed: ${name}`, error);
      }
    }
    
    return available;
  }

  /**
   * Enable/disable strategy
   */
  setStrategyEnabled(name: string, enabled: boolean): boolean {
    const registration = this.strategies.get(name);
    if (!registration) {
      return false;
    }
    
    registration.enabled = enabled !== false;
    
    // Clean up instance if disabled
    if (!enabled) {
      const instance = this.instances.get(name);
      if (instance?.destroy) {
        instance.destroy();
      }
      this.instances.delete(name);
    }
    
    return true;
  }

  /**
   * Set strategy priority
   */
  setStrategyPriority(name: string, priority: number): boolean {
    const registration = this.strategies.get(name);
    if (!registration) {
      return false;
    }
    
    registration.priority = priority;
    return true;
  }

  /**
   * Get strategies sorted by priority
   */
  getStrategiesByPriority(): string[] {
    return Array.from(this.strategies.entries())
      .sort(([, a], [, b]) => (b.priority || 0) - (a.priority || 0))
      .map(([name]) => name);
  }

  /**
   * Get strategy statistics
   */
  async getStrategyStats(): Promise<Record<string, StrategyStats>> {
    const stats: Record<string, StrategyStats> = {};
    
    for (const [name, registration] of this.strategies) {
      const instance = this.getStrategy(name);
      if (!instance) continue;
      
      try {
        const quota = instance.getQuota ? await instance.getQuota() : null;
        const rateLimit = instance.getRateLimit ? await instance.getRateLimit() : null;
        const available = instance.isAvailable ? await instance.isAvailable() : true;
        
        stats[name] = {
          name,
          available,
          healthy: available,
          totalRequests: 0, // Would need to track in actual implementation
          errorCount: 0,
          avgResponseTime: 0,
          lastUsed: 0,
          quota: quota || undefined
        };
      } catch (error) {
        stats[name] = {
          name,
          available: false,
          healthy: false,
          totalRequests: 0,
          errorCount: 0,
          avgResponseTime: 0,
          lastUsed: 0
        };
      }
    }
    
    return stats;
  }

  /**
   * Enable/disable registration
   */
  setRegistrationEnabled(enabled: boolean): void {
    this.registrationEnabled = enabled;
  }

  /**
   * Set maximum strategies
   */
  setMaxStrategies(max: number): void {
    this.maxStrategies = max;
  }

  /**
   * Clear all strategies
   */
  clear(): void {
    // Clean up all instances
    for (const instance of this.instances.values()) {
      if (instance.destroy) {
        instance.destroy();
      }
    }
    
    this.instances.clear();
    this.strategies.clear();
  }

  /**
   * Validate strategy registration
   */
  private validateRegistration(registration: StrategyRegistration): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check required fields
    if (!registration.metadata.name) {
      result.errors.push('Strategy name is required');
      result.valid = false;
    }

    if (!registration.factory) {
      result.errors.push('Strategy factory is required');
      result.valid = false;
    }

    // Check for duplicates
    if (this.strategies.has(registration.metadata.name)) {
      result.errors.push(`Strategy '${registration.metadata.name}' already registered`);
      result.valid = false;
    }

    // Validate metadata
    const meta = registration.metadata;
    
    if (!meta.version) {
      result.warnings.push('Strategy version is missing');
    }

    if (!meta.supportedLanguages.includes('en') || !meta.supportedLanguages.includes('ur')) {
      result.warnings.push('Strategy should support both English and Urdu');
    }

    if (meta.requiresApiKey && !this.config.apiKey && !this.config.googleApiKey && !this.config.aiApiKey) {
      result.warnings.push('Strategy requires API key but none provided in config');
    }

    // Validate factory
    try {
      const testInstance = registration.factory(this.config);
      if (!testInstance.translate) {
        result.errors.push('Strategy factory must return object with translate method');
        result.valid = false;
      }
    } catch (error) {
      result.errors.push(`Strategy factory failed: ${error}`);
      result.valid = false;
    }

    return result;
  }

  /**
   * Register built-in strategies
   */
  private registerBuiltinStrategies(): void {
    // Built-in strategies are registered in the TranslatorEngine
    // This method can be used to register any core strategies
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { StrategyRegistry as default };
