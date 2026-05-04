// ============================================================================
// SMART ROUTER
// Intelligent strategy selection based on performance, cost, and quality
// ============================================================================

import type { 
  TranslationStrategy, 
  TranslationStrategyConfig,
  StrategyStats,
  QuotaInfo,
  RateLimitInfo
} from '../types.js';
import type { StrategyRegistry } from './StrategyRegistry.js';

/**
 * Strategy performance metrics
 */
export interface StrategyMetrics {
  name: string;
  avgResponseTime: number;
  successRate: number;
  qualityScore: number;
  costPerCharacter: number;
  availability: number;
  lastUsed: number;
  totalRequests: number;
  errorRate: number;
}

/**
 * Routing criteria weights
 */
export interface RoutingWeights {
  speed: number;        // 0-1, importance of speed
  cost: number;        // 0-1, importance of cost
  quality: number;     // 0-1, importance of quality
  availability: number; // 0-1, importance of availability
}

/**
 * Routing decision context
 */
export interface RoutingContext {
  text: string;
  targetLang: 'ur' | 'en';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  userTier: 'free' | 'basic' | 'premium';
  maxCost?: number;
  maxLatency?: number;
  minQuality?: number;
  preferredStrategies?: string[];
  excludedStrategies?: string[];
}

/**
 * Routing decision result
 */
export interface RoutingDecision {
  strategy: string;
  confidence: number;
  reasoning: string[];
  alternatives: Array<{
    strategy: string;
    score: number;
    reasoning: string;
  }>;
  estimatedCost: number;
  estimatedLatency: number;
  fallbackChain: string[];
}

/**
 * Smart strategy router with intelligent selection
 */
export class SmartRouter {
  private registry: StrategyRegistry;
  private metrics: Map<string, StrategyMetrics> = new Map();
  private weights: RoutingWeights;
  private learningEnabled: boolean;
  private performanceHistory: Map<string, number[]> = new Map();
  private qualityHistory: Map<string, number[]> = new Map();

  constructor(
    registry: StrategyRegistry,
    options: {
      weights?: Partial<RoutingWeights>;
      learningEnabled?: boolean;
    } = {}
  ) {
    this.registry = registry;
    this.learningEnabled = options.learningEnabled ?? true;
    
    this.weights = {
      speed: 0.3,
      cost: 0.2,
      quality: 0.3,
      availability: 0.2,
      ...options.weights
    };

    this.initializeMetrics();
  }

  /**
   * Select best strategy for translation request
   */
  async selectStrategy(context: RoutingContext): Promise<RoutingDecision> {
    const availableStrategies = await this.getAvailableStrategies(context);
    
    if (availableStrategies.length === 0) {
      throw new Error('No strategies available for routing');
    }

    // Score each strategy
    const scoredStrategies = await this.scoreStrategies(availableStrategies, context);
    
    // Sort by score
    scoredStrategies.sort((a, b) => b.score - a.score);
    
    const best = scoredStrategies[0];
    const alternatives = scoredStrategies.slice(1, 3); // Top 3 alternatives
    
    // Create fallback chain
    const fallbackChain = scoredStrategies
      .slice(1)
      .map(s => s.strategy)
      .filter(s => !context.excludedStrategies?.includes(s));

    const decision: RoutingDecision = {
      strategy: best.strategy,
      confidence: best.confidence,
      reasoning: best.reasoning,
      alternatives: alternatives.map(alt => ({
        strategy: alt.strategy,
        score: alt.score,
        reasoning: alt.reasoning.join(', ')
      })),
      estimatedCost: best.estimatedCost,
      estimatedLatency: best.estimatedLatency,
      fallbackChain
    };

    // Log decision for learning
    if (this.learningEnabled) {
      this.logRoutingDecision(decision, context);
    }

    return decision;
  }

  /**
   * Update strategy metrics after translation
   */
  updateMetrics(
    strategyName: string,
    responseTime: number,
    success: boolean,
    quality?: number,
    cost?: number
  ): void {
    const existing = this.metrics.get(strategyName);
    
    if (!existing) {
      return;
    }

    // Update response time
    const newAvgTime = this.updateAverage(
      existing.avgResponseTime,
      existing.totalRequests,
      responseTime
    );
    existing.avgResponseTime = newAvgTime;

    // Update success rate
    existing.totalRequests++;
    if (!success) {
      existing.errorRate = (existing.errorRate * (existing.totalRequests - 1) + 1) / existing.totalRequests;
    } else {
      existing.errorRate = (existing.errorRate * (existing.totalRequests - 1)) / existing.totalRequests;
    }
    existing.successRate = 1 - existing.errorRate;

    // Update quality score if provided
    if (quality !== undefined && this.learningEnabled) {
      const history = this.qualityHistory.get(strategyName) || [];
      history.push(quality);
      
      // Keep last 100 quality scores
      if (history.length > 100) {
        history.shift();
      }
      
      this.qualityHistory.set(strategyName, history);
      existing.qualityScore = history.reduce((sum, q) => sum + q, 0) / history.length;
    }

    // Update performance history
    if (this.learningEnabled) {
      const history = this.performanceHistory.get(strategyName) || [];
      history.push(responseTime);
      
      // Keep last 100 response times
      if (history.length > 100) {
        history.shift();
      }
      
      this.performanceHistory.set(strategyName, history);
    }

    existing.lastUsed = Date.now();
  }

  /**
   * Get routing statistics
   */
  getRoutingStats(): {
    totalStrategies: number;
    availableStrategies: number;
    averageResponseTime: number;
    averageSuccessRate: number;
    averageQualityScore: number;
    routingWeights: RoutingWeights;
    learningEnabled: boolean;
  } {
    const allMetrics = Array.from(this.metrics.values());
    
    return {
      totalStrategies: this.metrics.size,
      availableStrategies: allMetrics.filter(m => m.availability > 0.5).length,
      averageResponseTime: this.calculateAverage(allMetrics.map(m => m.avgResponseTime)),
      averageSuccessRate: this.calculateAverage(allMetrics.map(m => m.successRate)),
      averageQualityScore: this.calculateAverage(allMetrics.map(m => m.qualityScore)),
      routingWeights: this.weights,
      learningEnabled: this.learningEnabled
    };
  }

  /**
   * Update routing weights
   */
  updateWeights(weights: Partial<RoutingWeights>): void {
    this.weights = { ...this.weights, ...weights };
    
    // Normalize weights to sum to 1
    const total = Object.values(this.weights).reduce((sum, weight) => sum + weight, 0);
    if (total > 0) {
      for (const key in this.weights) {
        (this.weights as any)[key] = (this.weights as any)[key] / total;
      }
    }
  }

  /**
   * Enable/disable learning
   */
  setLearningEnabled(enabled: boolean): void {
    this.learningEnabled = enabled;
  }

  /**
   * Get strategy metrics
   */
  getStrategyMetrics(): Map<string, StrategyMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.performanceHistory.clear();
    this.qualityHistory.clear();
    this.initializeMetrics();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async getAvailableStrategies(context: RoutingContext): Promise<string[]> {
    const allStrategies = this.registry.getStrategyNames();
    const available: string[] = [];

    for (const strategyName of allStrategies) {
      // Skip excluded strategies
      if (context.excludedStrategies?.includes(strategyName)) {
        continue;
      }

      // Check if strategy is available
      const strategy = this.registry.getStrategy(strategyName);
      if (!strategy) continue;

      try {
        const isAvailable = strategy.isAvailable ? await strategy.isAvailable() : true;
        if (isAvailable) {
          available.push(strategyName);
        }
      } catch (error) {
        console.warn(`Strategy availability check failed: ${strategyName}`, error);
      }
    }

    return available;
  }

  private async scoreStrategies(
    strategies: string[],
    context: RoutingContext
  ): Promise<Array<{
    strategy: string;
    score: number;
    confidence: number;
    reasoning: string[];
    estimatedCost: number;
    estimatedLatency: number;
  }>> {
    const scored = [];

    for (const strategyName of strategies) {
      const score = await this.calculateStrategyScore(strategyName, context);
      scored.push(score);
    }

    return scored;
  }

  private async calculateStrategyScore(
    strategyName: string,
    context: RoutingContext
  ): Promise<{
    strategy: string;
    score: number;
    confidence: number;
    reasoning: string[];
    estimatedCost: number;
    estimatedLatency: number;
  }> {
    const metrics = this.metrics.get(strategyName);
    const metadata = this.registry.getStrategyMetadata(strategyName);
    
    if (!metrics || !metadata) {
      return {
        strategy: strategyName,
        score: 0,
        confidence: 0,
        reasoning: ['Strategy not found or no metrics'],
        estimatedCost: 0,
        estimatedLatency: 0
      };
    }

    const reasoning: string[] = [];
    let score = 0;
    let confidence = 0;

    // Speed score
    const speedScore = this.calculateSpeedScore(metrics.avgResponseTime, context);
    score += speedScore * this.weights.speed;
    reasoning.push(`Speed: ${speedScore.toFixed(2)} (${metrics.avgResponseTime.toFixed(0)}ms)`);

    // Cost score
    const costScore = this.calculateCostScore(metadata.costPerCharacter || 0, context);
    score += costScore * this.weights.cost;
    reasoning.push(`Cost: ${costScore.toFixed(2)} ($${((metadata.costPerCharacter || 0) * context.text.length).toFixed(4)})`);

    // Quality score
    const qualityScore = this.calculateQualityScore(metrics.qualityScore, context);
    score += qualityScore * this.weights.quality;
    reasoning.push(`Quality: ${qualityScore.toFixed(2)} (${metrics.qualityScore.toFixed(2)})`);

    // Availability score
    const availabilityScore = metrics.availability;
    score += availabilityScore * this.weights.availability;
    reasoning.push(`Availability: ${availabilityScore.toFixed(2)}`);

    // User tier adjustments
    if (context.userTier === 'free' && metadata.costPerCharacter && metadata.costPerCharacter > 0.0001) {
      score *= 0.5; // Penalize expensive strategies for free users
      reasoning.push('Penalized for free user (cost)');
    }

    // Priority adjustments
    if (context.priority === 'urgent') {
      score = score * 0.7 + speedScore * 0.3; // Favor speed for urgent requests
      reasoning.push('Urgent priority - speed favored');
    }

    // Preferred strategies bonus
    if (context.preferredStrategies?.includes(strategyName)) {
      score *= 1.2; // 20% bonus for preferred strategies
      reasoning.push('Preferred strategy bonus');
    }

    // Calculate confidence based on data availability
    const dataPoints = metrics.totalRequests;
    if (dataPoints > 100) {
      confidence = 0.9;
    } else if (dataPoints > 10) {
      confidence = 0.7;
    } else if (dataPoints > 0) {
      confidence = 0.5;
    } else {
      confidence = 0.3;
    }

    return {
      strategy: strategyName,
      score: Math.min(score, 1), // Cap at 1.0
      confidence,
      reasoning,
      estimatedCost: (metadata.costPerCharacter || 0) * context.text.length,
      estimatedLatency: metrics.avgResponseTime
    };
  }

  private calculateSpeedScore(avgResponseTime: number, context: RoutingContext): number {
    // Lower response time = higher score
    const maxLatency = context.maxLatency || 5000; // 5 seconds default
    
    if (avgResponseTime <= 1000) return 1.0; // Excellent
    if (avgResponseTime <= 2000) return 0.8; // Good
    if (avgResponseTime <= 3000) return 0.6; // Fair
    if (avgResponseTime <= maxLatency) return 0.4; // Poor
    return 0.1; // Very poor
  }

  private calculateCostScore(costPerChar: number, context: RoutingContext): number {
    const totalCost = costPerChar * context.text.length;
    const maxCost = context.maxCost || 0.01; // $0.01 default
    
    if (totalCost === 0) return 1.0; // Free is best
    if (totalCost <= 0.001) return 0.9; // Very cheap
    if (totalCost <= 0.005) return 0.7; // Cheap
    if (totalCost <= maxCost) return 0.5; // Acceptable
    return 0.2; // Expensive
  }

  private calculateQualityScore(qualityScore: number, context: RoutingContext): number {
    const minQuality = context.minQuality || 0.7;
    
    if (qualityScore >= minQuality) return 1.0;
    if (qualityScore >= 0.8) return 0.9;
    if (qualityScore >= 0.7) return 0.7;
    if (qualityScore >= 0.6) return 0.5;
    return 0.3;
  }

  private updateAverage(currentAvg: number, count: number, newValue: number): number {
    return (currentAvg * (count - 1) + newValue) / count;
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private initializeMetrics(): void {
    const strategies = this.registry.getAllMetadata();
    
    for (const [name, metadata] of Object.entries(strategies)) {
      this.metrics.set(name, {
        name,
        avgResponseTime: 1000, // Default 1 second
        successRate: 0.95, // Default 95% success
        qualityScore: 0.8, // Default 80% quality
        costPerCharacter: metadata.costPerCharacter || 0,
        availability: 1.0, // Assume available initially
        lastUsed: 0,
        totalRequests: 0,
        errorRate: 0.05
      });
    }
  }

  private logRoutingDecision(decision: RoutingDecision, context: RoutingContext): void {
    // In a real implementation, this would send to analytics
    console.log('Routing decision:', {
      strategy: decision.strategy,
      score: decision.confidence,
      context: {
        textLength: context.text.length,
        priority: context.priority,
        userTier: context.userTier
      }
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { SmartRouter as default };
