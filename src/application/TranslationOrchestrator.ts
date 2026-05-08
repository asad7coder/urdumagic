// ============================================================================
// TRANSLATION ORCHESTRATOR
// Application layer - coordinates translation workflows
// ============================================================================

import type { 
  TranslationStrategy,
  UrduMagicConfig,
  UrduMagicInstance,
  TranslationContext,
  PerformanceMetric
} from '../types.js';
import type { SmartRouter } from '../core/SmartRouter.js';
import type { StrategyRegistry } from '../core/StrategyRegistry.js';
import type { DistributedCacheManager } from '../infrastructure/cache/DistributedCacheManager.js';
import type { SecurityManager } from '../infrastructure/security/SecurityManager.js';
import type { PerformanceMonitor } from '../infrastructure/performance/PerformanceMonitor.js';
import type { EventEmitter } from '../infrastructure/events/EventEmitter.js';

/**
 * Translation request with full context
 */
export interface TranslationRequest {
  id: string;
  text: string;
  targetLang: 'ur' | 'en';
  sourceLang?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  userTier: 'free' | 'basic' | 'premium';
  userId?: string;
  sessionId?: string;
  options: {
    useCache?: boolean;
    bypassSecurity?: boolean;
    maxCost?: number;
    maxLatency?: number;
    minQuality?: number;
    preferredStrategies?: string[];
    excludedStrategies?: string[];
  };
  metadata: {
    timestamp: number;
    userAgent: string;
    referer?: string;
  };
}

/**
 * Translation result with full context
 */
export interface TranslationResult {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  strategy: string;
  responseTime: number;
  cost: number;
  quality?: number;
  success: boolean;
  error?: string;
  metadata: {
    cached: boolean;
    fallbackUsed: boolean;
    securityChecks: string[];
    performanceMetrics: PerformanceMetric;
  };
}

/**
 * Strategy selection result with fallback chain
 */
export interface RoutingDecision {
  strategy: string;
  fallbackChain: string[];
  estimatedCost: number;
  expectedLatency: number;
}

/**
 * Internal translation execution result
 */
interface ExecutionResult {
  text: string;
  success: boolean;
  fallbackUsed: boolean;
  cost: number;
  quality: number;
  error?: string;
}

/**
 * Application layer orchestrator for translation workflows
 * Coordinates between core engine, infrastructure, and presentation layers
 */
export class TranslationOrchestrator {
  private router: SmartRouter;
  private registry: StrategyRegistry;
  private cache: DistributedCacheManager;
  private security: SecurityManager;
  private performance: PerformanceMonitor;
  private events: EventEmitter;
  private config: UrduMagicConfig;
  private activeRequests: Map<string, TranslationRequest> = new Map();
  private requestHistory: TranslationResult[] = [];
  private maxHistorySize: number = 1000;

  constructor(
    router: SmartRouter,
    registry: StrategyRegistry,
    cache: DistributedCacheManager,
    security: SecurityManager,
    performance: PerformanceMonitor,
    events: EventEmitter,
    config: UrduMagicConfig
  ) {
    this.router = router;
    this.registry = registry;
    this.cache = cache;
    this.security = security;
    this.performance = performance;
    this.events = events;
    this.config = config;

    this.setupEventHandlers();
  }

  /**
   * Main translation entry point
   */
  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const startTime = performance.now();
    const result: TranslationResult = {
      id: request.id,
      originalText: request.text,
      translatedText: '',
      sourceLang: request.sourceLang || 'auto',
      targetLang: request.targetLang,
      strategy: '',
      responseTime: 0,
      cost: 0,
      success: false,
      metadata: {
        cached: false,
        fallbackUsed: false,
        securityChecks: [],
        performanceMetrics: {} as PerformanceMetric
      }
    };

    try {
      this.activeRequests.set(request.id, request);

      this.events.emit('translation:start', {
        requestId: request.id,
        text: request.text,
        targetLang: request.targetLang,
        priority: request.priority
      });

      // 1. SECURITY LAYER
      await this.performSecurityValidation(request, result);

      // 2. CACHE LAYER
      if (request.options.useCache !== false) {
        const cachedResult = await this.checkCache(request);
        if (cachedResult) {
          return this.finalizeResult(result, cachedResult, 'cache', startTime, true);
        }
      }

      // 3. ROUTING LAYER
      const routingDecision: RoutingDecision = await this.selectStrategy(request);
      result.strategy = routingDecision.strategy;

      // 4. EXECUTION LAYER (with Fallback)
      const execution: ExecutionResult = await this.executeTranslation(request, routingDecision);
      
      result.translatedText = execution.text;
      result.success = execution.success;
      result.error = execution.error;
      result.metadata.fallbackUsed = execution.fallbackUsed;
      result.cost = execution.cost;
      result.quality = execution.quality;

      // 5. PERSISTENCE LAYER
      if (result.success && request.options.useCache !== false) {
        await this.cacheResult(request, result);
      }

      this.updateMetrics(result, performance.now() - startTime);

    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
      
      this.events.emit('translation:error', {
        requestId: request.id,
        error: result.error,
        context: this.createTranslationContext(request)
      });

    } finally {
      result.responseTime = performance.now() - startTime;
      this.activeRequests.delete(request.id);
      this.addToHistory(result);

      this.events.emit('translation:complete', {
        requestId: request.id,
        result: result.success ? 'success' : 'error',
        responseTime: result.responseTime,
        strategy: result.strategy
      });
    }

    return result;
  }

  private finalizeResult(
    result: TranslationResult,
    text: string,
    strategy: string,
    startTime: number,
    cached: boolean
  ): TranslationResult {
    result.translatedText = text;
    result.strategy = strategy;
    result.success = true;
    result.metadata.cached = cached;
    result.responseTime = performance.now() - startTime;

    this.events.emit('translation:complete', {
      requestId: result.id,
      result: 'cached',
      responseTime: result.responseTime
    });

    return result;
  }

  /**
   * Batch translation with optimized processing
   */
  async translateBatch(requests: TranslationRequest[]): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];
    const chunkSize = this.config.performance?.batchSize || 5;

    for (let i = 0; i < requests.length; i += chunkSize) {
      const chunk = requests.slice(i, i + chunkSize);
      const chunkResults = await Promise.allSettled(
        chunk.map(request => this.translate(request))
      );
      
      results.push(...chunkResults.map((result, idx) => 
        result.status === 'fulfilled' ? result.value : this.createErrorResult(chunk[idx], result.reason)
      ));
    }
    
    return results;
  }

  private createErrorResult(request: TranslationRequest, error: any): TranslationResult {
    return {
      id: request.id,
      originalText: request.text,
      translatedText: '',
      sourceLang: 'auto',
      targetLang: request.targetLang,
      strategy: 'error',
      responseTime: 0,
      cost: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      metadata: {
        cached: false,
        fallbackUsed: false,
        securityChecks: [],
        performanceMetrics: {} as PerformanceMetric
      }
    };
  }

  /**
   * Get active requests
   */
  getActiveRequests(): TranslationRequest[] {
    return Array.from(this.activeRequests.values());
  }

  /**
   * Get request history
   */
  getRequestHistory(limit?: number): TranslationResult[] {
    const history = [...this.requestHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get orchestrator statistics
   */
  getStats(): {
    activeRequests: number;
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    cacheHitRate: number;
    topStrategies: Array<{ strategy: string; count: number }>;
  } {
    const totalRequests = this.requestHistory.length;
    const successfulRequests = this.requestHistory.filter(r => r.success).length;
    const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;
    
    const avgResponseTime = totalRequests > 0 
      ? this.requestHistory.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests 
      : 0;

    const cacheHits = this.requestHistory.filter(r => r.metadata.cached).length;
    const cacheHitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;

    const strategyCounts = new Map<string, number>();
    for (const result of this.requestHistory) {
      const count = strategyCounts.get(result.strategy) || 0;
      strategyCounts.set(result.strategy, count + 1);
    }

    const topStrategies = Array.from(strategyCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([strategy, count]) => ({ strategy, count }));

    return {
      activeRequests: this.activeRequests.size,
      totalRequests,
      successRate,
      averageResponseTime: avgResponseTime,
      cacheHitRate,
      topStrategies
    };
  }

  /**
   * Clear history and active requests
   */
  clear(): void {
    this.activeRequests.clear();
    this.requestHistory = [];
  }

  /**
   * Destroy orchestrator
   */
  destroy(): void {
    this.clear();
    this.events.removeAllListeners('translation:start');
    this.events.removeAllListeners('translation:complete');
    this.events.removeAllListeners('translation:error');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private setupEventHandlers(): void {
    this.events.on('translation:start', (data: { requestId: string }) => {
      this.performance.startTimer(`translation_${data.requestId}`);
    });

    this.events.on('translation:complete', (data: { requestId: string; result: string; strategy?: string }) => {
      this.performance.endTimer(`translation_${data.requestId}`, {
        operation: 'translation',
        success: data.result !== 'error',
        strategy: data.strategy
      });
    });
  }

  private async performSecurityValidation(
    request: TranslationRequest,
    result: TranslationResult
  ): Promise<void> {
    if (request.options.bypassSecurity) {
      result.metadata.securityChecks.push('bypassed');
      return;
    }

    const checks: string[] = [];

    const validation = this.security.validateInput(request.text);
    if (!validation.isValid) {
      throw new Error(`Security validation failed: ${validation.errors.join(', ')}`);
    }
    checks.push('input_validated');

    const rateLimitResult = await this.security.checkRateLimit(request.userId || 'anonymous');
    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`);
    }
    checks.push('rate_limited');

    const contentCheck = this.security.filterContent(request.text);
    if (!contentCheck.safe) {
      throw new Error(`Content blocked: ${contentCheck.reason}`);
    }
    checks.push('content_filtered');

    result.metadata.securityChecks = checks;
  }

  private async checkCache(request: TranslationRequest): Promise<string | null> {
    const cacheKey = this.generateCacheKey(request);
    return await this.cache.get(cacheKey);
  }

  private async selectStrategy(request: TranslationRequest): Promise<RoutingDecision> {
    const routingContext = {
      text: request.text,
      targetLang: request.targetLang,
      priority: request.priority,
      userTier: request.userTier,
      maxCost: request.options.maxCost,
      maxLatency: request.options.maxLatency,
      minQuality: request.options.minQuality,
      preferredStrategies: request.options.preferredStrategies,
      excludedStrategies: request.options.excludedStrategies
    };

    return await this.router.selectStrategy(routingContext) as RoutingDecision;
  }

  private async executeTranslation(
    request: TranslationRequest,
    routingDecision: RoutingDecision
  ): Promise<ExecutionResult> {
    const strategy = this.registry.getStrategy(routingDecision.strategy);
    
    if (!strategy) {
      throw new Error(`Strategy not found: ${routingDecision.strategy}`);
    }

    try {
      const startTime = performance.now();
      const translatedText = await strategy.translate(request.text, request.targetLang);
      const responseTime = performance.now() - startTime;

      this.router.updateMetrics(routingDecision.strategy, responseTime, true);

      return {
        text: translatedText,
        success: true,
        fallbackUsed: false,
        cost: routingDecision.estimatedCost,
        quality: 0.9
      };

    } catch (error) {
      this.router.updateMetrics(routingDecision.strategy, 0, false);

      for (const fallbackStrategy of routingDecision.fallbackChain) {
        try {
          const fallbackInstance = this.registry.getStrategy(fallbackStrategy);
          if (!fallbackInstance) continue;

          const translatedText = await fallbackInstance.translate(request.text, request.targetLang);
          
          return {
            text: translatedText,
            success: true,
            fallbackUsed: true,
            cost: 0,
            quality: 0.7
          };

        } catch (fallbackError) {
          console.warn(`Fallback strategy ${fallbackStrategy} failed:`, fallbackError);
        }
      }

      return {
        text: '',
        success: false,
        fallbackUsed: false,
        cost: 0,
        quality: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async cacheResult(request: TranslationRequest, result: TranslationResult): Promise<void> {
    const cacheKey = this.generateCacheKey(request);
    const ttl = this.config.performance?.cacheTTL || 3600000;
    await this.cache.set(cacheKey, result.translatedText, ttl);
  }

  private updateMetrics(result: TranslationResult, responseTime: number): void {
    this.performance.recordMetric('translation', responseTime, result.success);
  }

  private generateCacheKey(request: TranslationRequest): string {
    const hash = btoa(request.text).substring(0, 16);
    return `translation:${request.targetLang}:${hash}`;
  }

  private createTranslationContext(request: TranslationRequest): TranslationContext {
    return {
      text: request.text,
      targetLang: request.targetLang,
      sourceLang: request.sourceLang || 'auto',
      plugin: request.strategy,
      timestamp: request.metadata.timestamp
    };
  }

  private addToHistory(result: TranslationResult): void {
    this.requestHistory.push(result);
    if (this.requestHistory.length > this.maxHistorySize) {
      this.requestHistory.shift();
    }
  }
}

export { TranslationOrchestrator as default };
