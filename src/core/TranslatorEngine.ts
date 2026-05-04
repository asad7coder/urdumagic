// ============================================================================
// TRANSLATOR ENGINE
// Hybrid translation system with built-in strategies
// ============================================================================

import type {
  TranslationStrategy,
  TranslationStrategyConfig,
  FallbackChain,
  StrategyStats,
  QuotaInfo,
  RateLimitInfo
} from '../types.js';

import { LibreTranslateStrategy } from './strategies/LibreTranslateStrategy.js';
import { GoogleTranslateStrategy } from './strategies/GoogleTranslateStrategy.js';
import { AIStrategy } from './strategies/AIStrategy.js';
import { OfflineStrategy } from './strategies/OfflineStrategy.js';

/**
 * Translation request context
 */
interface TranslationRequest {
  id: string;
  text: string;
  targetLang: 'ur' | 'en';
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  timestamp: number;
  strategy?: string;
}

/**
 * Strategy metadata for tracking
 */
interface StrategyMetadata {
  strategy: TranslationStrategy;
  stats: StrategyStats;
  lastHealthCheck: number;
  available: boolean;
}

/**
 * Hybrid Translator Engine with built-in strategies
 * Uses strategy pattern internally with automatic fallbacks
 */
export class TranslatorEngine {
  private strategies: Map<string, StrategyMetadata> = new Map();
  private currentStrategy: string = 'libre';
  private fallbackChain: FallbackChain;
  private config: TranslationStrategyConfig;
  private requestQueue: TranslationRequest[] = [];
  private isProcessing: boolean = false;
  private healthCheckInterval: any = null;
  private enabled: boolean = true;

  constructor(config: TranslationStrategyConfig = {}) {
    this.config = config;
    this.fallbackChain = {
      strategies: ['libre', 'google', 'ai', 'offline'],
      strategy: 'sequential',
      timeout: 10000
    };

    this.initializeStrategies();
    this.startHealthChecks();
  }

  /**
   * Initialize built-in translation strategies
   */
  private initializeStrategies(): void {
    // LibreTranslate Strategy
    this.strategies.set('libre', {
      strategy: new LibreTranslateStrategy(this.config),
      stats: {
        name: 'libre',
        available: false,
        healthy: false,
        totalRequests: 0,
        errorCount: 0,
        avgResponseTime: 0,
        lastUsed: 0
      },
      lastHealthCheck: 0,
      available: false
    });

    // Google Translate Strategy
    this.strategies.set('google', {
      strategy: new GoogleTranslateStrategy(this.config),
      stats: {
        name: 'google',
        available: false,
        healthy: false,
        totalRequests: 0,
        errorCount: 0,
        avgResponseTime: 0,
        lastUsed: 0
      },
      lastHealthCheck: 0,
      available: false
    });

    // AI Strategy
    this.strategies.set('ai', {
      strategy: new AIStrategy(this.config),
      stats: {
        name: 'ai',
        available: false,
        healthy: false,
        totalRequests: 0,
        errorCount: 0,
        avgResponseTime: 0,
        lastUsed: 0
      },
      lastHealthCheck: 0,
      available: false
    });

    // Offline Strategy (always available)
    this.strategies.set('offline', {
      strategy: new OfflineStrategy(),
      stats: {
        name: 'offline',
        available: true,
        healthy: true,
        totalRequests: 0,
        errorCount: 0,
        avgResponseTime: 0,
        lastUsed: 0
      },
      lastHealthCheck: 0,
      available: true
    });
  }

  /**
   * Translate text using current strategy with fallbacks
   */
  async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    if (!this.enabled) {
      throw new Error('TranslatorEngine is disabled');
    }

    const request: TranslationRequest = {
      id: this.generateRequestId(),
      text,
      targetLang,
      resolve: () => { },
      reject: () => { },
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      request.resolve = resolve;
      request.reject = reject;

      this.requestQueue.push(request);
      this.processQueue();
    });
  }

  /**
   * Translate batch of texts
   */
  async translateBatch(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]> {
    if (!this.enabled) {
      throw new Error('TranslatorEngine is disabled');
    }

    // Try current strategy first
    const currentStrategy = this.strategies.get(this.currentStrategy);
    if (currentStrategy?.strategy.translateBatch) {
      try {
        const result = await this.executeStrategyBatch(
          currentStrategy.strategy,
          texts,
          targetLang
        );
        this.updateStrategyStats(this.currentStrategy, texts.length * 100, true);
        return result;
      } catch (error) {
        console.warn(`Batch translation failed with ${this.currentStrategy}:`, error);
      }
    }

    // Fallback to individual translations
    const results = await Promise.allSettled(
      texts.map(text => this.translate(text, targetLang))
    );

    return results.map((result, index) =>
      result.status === 'fulfilled' ? result.value : `${texts[index]} [translation failed]`
    );
  }

  /**
   * Set translation strategy
   */
  setStrategy(strategy: 'libre' | 'google' | 'ai' | 'offline'): void {
    if (!this.strategies.has(strategy)) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }

    const oldStrategy = this.currentStrategy;
    this.currentStrategy = strategy;

    console.log(`Translation strategy changed: ${oldStrategy} → ${strategy}`);
  }

  /**
   * Get current strategy name
   */
  getCurrentStrategy(): string {
    return this.currentStrategy;
  }

  /**
   * Get available strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys()).filter(name => {
      const metadata = this.strategies.get(name);
      return metadata?.available || name === 'offline';
    });
  }

  /**
   * Get strategy statistics
   */
  getStrategyStats(): Record<string, StrategyStats> {
    const stats: Record<string, StrategyStats> = {};

    for (const [name, metadata] of this.strategies) {
      stats[name] = { ...metadata.stats };
    }

    return stats;
  }

  /**
   * Set fallback chain configuration
   */
  setFallbackChain(chain: FallbackChain): void {
    this.fallbackChain = { ...this.fallbackChain, ...chain };
  }

  /**
   * Get fallback chain
   */
  getFallbackChain(): FallbackChain {
    return { ...this.fallbackChain };
  }

  /**
   * Check if strategy is available
   */
  async isStrategyAvailable(strategy: string): Promise<boolean> {
    const metadata = this.strategies.get(strategy);
    if (!metadata) return false;

    if (metadata.strategy.isAvailable) {
      return await metadata.strategy.isAvailable();
    }

    return metadata.available;
  }

  /**
   * Get quota information for strategy
   */
  async getStrategyQuota(strategy: string): Promise<QuotaInfo | null> {
    const metadata = this.strategies.get(strategy);
    if (!metadata?.strategy.getQuota) return null;

    try {
      return await metadata.strategy.getQuota();
    } catch (error) {
      console.warn(`Failed to get quota for ${strategy}:`, error);
      return null;
    }
  }

  /**
   * Get rate limit information for strategy
   */
  async getStrategyRateLimit(strategy: string): Promise<RateLimitInfo | null> {
    const metadata = this.strategies.get(strategy);
    if (!metadata?.strategy.getRateLimit) return null;

    try {
      return await metadata.strategy.getRateLimit();
    } catch (error) {
      console.warn(`Failed to get rate limit for ${strategy}:`, error);
      return null;
    }
  }

  /**
   * Enable/disable translator engine
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Perform health check on all strategies
   */
  async performHealthCheck(): Promise<void> {
    for (const [name, metadata] of this.strategies) {
      try {
        const isAvailable = metadata.strategy.isAvailable
          ? await metadata.strategy.isAvailable()
          : true;

        metadata.available = isAvailable;
        metadata.stats.available = isAvailable;
        metadata.stats.healthy = isAvailable;
        metadata.lastHealthCheck = Date.now();

      } catch (error) {
        metadata.available = false;
        metadata.stats.available = false;
        metadata.stats.healthy = false;
        metadata.lastHealthCheck = Date.now();

        console.warn(`Health check failed for ${name}:`, error);
      }
    }
  }

  /**
   * Get engine statistics
   */
  getEngineStats(): {
    totalRequests: number;
    totalErrors: number;
    avgResponseTime: number;
    currentStrategy: string;
    availableStrategies: string[];
    queueSize: number;
  } {
    let totalRequests = 0;
    let totalErrors = 0;
    let totalResponseTime = 0;

    for (const metadata of this.strategies.values()) {
      totalRequests += metadata.stats.totalRequests;
      totalErrors += metadata.stats.errorCount;
      totalResponseTime += metadata.stats.avgResponseTime * metadata.stats.totalRequests;
    }

    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

    return {
      totalRequests,
      totalErrors,
      avgResponseTime,
      currentStrategy: this.currentStrategy,
      availableStrategies: this.getAvailableStrategies(),
      queueSize: this.requestQueue.length
    };
  }

  /**
   * Clear all statistics
   */
  clearStats(): void {
    for (const metadata of this.strategies.values()) {
      metadata.stats.totalRequests = 0;
      metadata.stats.errorCount = 0;
      metadata.stats.avgResponseTime = 0;
      metadata.stats.lastUsed = 0;
    }
  }

  /**
   * Destroy translator engine
   */
  destroy(): void {
    this.enabled = false;
    this.requestQueue = [];

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Cleanup strategies if needed
    for (const metadata of this.strategies.values()) {
      if (metadata.strategy.destroy) {
        metadata.strategy.destroy();
      }
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const request = this.requestQueue.shift()!;
      await this.processRequest(request);
    } finally {
      this.isProcessing = false;

      // Process next request if queue is not empty
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), 10);
      }
    }
  }

  private async processRequest(request: TranslationRequest): Promise<void> {
    const startTime = performance.now();
    let lastError: Error | null = null;

    // Try current strategy first
    try {
      const result = await this.executeStrategy(
        this.strategies.get(this.currentStrategy)!.strategy,
        request.text,
        request.targetLang
      );

      const duration = performance.now() - startTime;
      this.updateStrategyStats(this.currentStrategy, duration, true);

      request.resolve(result);
      return;
    } catch (error) {
      lastError = error as Error;
      this.updateStrategyStats(this.currentStrategy, performance.now() - startTime, false);
    }

    // Try fallback chain
    for (const strategyName of this.fallbackChain.strategies) {
      if (strategyName === this.currentStrategy) continue;

      const metadata = this.strategies.get(strategyName);
      if (!metadata?.available) continue;

      try {
        const result = await this.executeStrategy(
          metadata.strategy,
          request.text,
          request.targetLang
        );

        const duration = performance.now() - startTime;
        this.updateStrategyStats(strategyName, duration, true);

        console.log(`Fallback used: ${this.currentStrategy} → ${strategyName}`);
        request.resolve(result);
        return;
      } catch (error) {
        lastError = error as Error;
        this.updateStrategyStats(strategyName, performance.now() - startTime, false);
      }
    }

    // All strategies failed
    request.reject(lastError || new Error('All translation strategies failed'));
  }

  private async executeStrategy(
    strategy: TranslationStrategy,
    text: string,
    targetLang: 'ur' | 'en'
  ): Promise<string> {
    return await strategy.translate(text, targetLang);
  }

  private async executeStrategyBatch(
    strategy: TranslationStrategy,
    texts: string[],
    targetLang: 'ur' | 'en'
  ): Promise<string[]> {
    if (!strategy.translateBatch) {
      throw new Error('Strategy does not support batch translation');
    }
    return await strategy.translateBatch(texts, targetLang);
  }

  private updateStrategyStats(strategyName: string, duration: number, success: boolean): void {
    const metadata = this.strategies.get(strategyName);
    if (!metadata) return;

    const stats = metadata.stats;
    stats.totalRequests++;
    stats.lastUsed = Date.now();

    if (!success) {
      stats.errorCount++;
    }

    // Update average response time
    const totalResponseTime = stats.avgResponseTime * (stats.totalRequests - 1) + duration;
    stats.avgResponseTime = totalResponseTime / stats.totalRequests;
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute

    // Initial health check
    this.performHealthCheck();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { TranslatorEngine as default };
