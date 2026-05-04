// ============================================================================
// SIMPLE ROUTER
// Deterministic strategy selection - no ML, no learning, just logic
// ============================================================================

import type { TranslationStrategy } from '../types.js';

/**
 * Simple routing priorities
 */
export type RoutingPriority = 'speed' | 'cost' | 'quality';

/**
 * Strategy priority configuration
 */
interface StrategyPriority {
  name: string;
  speed: number;    // 1-10 (10 = fastest)
  cost: number;     // 1-10 (10 = cheapest)
  quality: number;  // 1-10 (10 = best quality)
  available: boolean;
}

/**
 * Simple routing decision
 */
export interface SimpleRoutingDecision {
  strategy: string;
  reasoning: string;
  fallbacks: string[];
}

/**
 * Simple deterministic router
 * - No learning algorithms
 * - No historical data
 * - Just clear, predictable logic
 */
export class SimpleRouter {
  private strategies: Map<string, StrategyPriority> = new Map();
  private defaultPriority: RoutingPriority = 'speed';

  constructor() {
    this.initializeBuiltinStrategies();
  }

  /**
   * Select best strategy based on priority
   */
  selectStrategy(priority: RoutingPriority = this.defaultPriority): SimpleRoutingDecision {
    const availableStrategies = Array.from(this.strategies.entries())
      .filter(([, config]) => config.available);

    if (availableStrategies.length === 0) {
      // Fallback to offline strategy (always available)
      return {
        strategy: 'offline',
        reasoning: 'No online strategies available, using offline',
        fallbacks: []
      };
    }

    // Sort by selected priority
    const sorted = this.sortByPriority(availableStrategies, priority);
    const best = sorted[0];
    const fallbacks = sorted.slice(1).map(([name]) => name);

    return {
      strategy: best[0],
      reasoning: this.getReasoning(best[0], best[1], priority),
      fallbacks
    };
  }

  /**
   * Register a strategy with priority configuration
   */
  registerStrategy(
    name: string,
    config: Omit<StrategyPriority, 'name'>
  ): void {
    this.strategies.set(name, { name, ...config });
  }

  /**
   * Set strategy availability
   */
  setAvailability(name: string, available: boolean): void {
    const strategy = this.strategies.get(name);
    if (strategy) {
      strategy.available = available;
    }
  }

  /**
   * Get all strategies with their priorities
   */
  getStrategies(): Map<string, StrategyPriority> {
    return new Map(this.strategies);
  }

  /**
   * Set default routing priority
   */
  setDefaultPriority(priority: RoutingPriority): void {
    this.defaultPriority = priority;
  }

  /**
   * Get strategy by priority
   */
  getStrategyByPriority(priority: RoutingPriority): string | null {
    const decision = this.selectStrategy(priority);
    return decision.strategy;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeBuiltinStrategies(): void {
    // LibreTranslate - Balanced, free option
    this.strategies.set('libre', {
      name: 'libre',
      speed: 6,      // Medium speed
      cost: 9,       // Very cheap (free)
      quality: 7,    // Good quality
      available: true
    });

    // Google Translate - Fast and high quality
    this.strategies.set('google', {
      name: 'google',
      speed: 9,      // Very fast
      cost: 5,       // Medium cost
      quality: 9,    // Excellent quality
      available: false // Requires API key
    });

    // AI Strategy - Best quality, slower, expensive
    this.strategies.set('ai', {
      name: 'ai',
      speed: 3,      // Slow
      cost: 2,       // Expensive
      quality: 10,   // Best quality
      available: false // Requires API key
    });

    // Offline Strategy - Always available, basic quality
    this.strategies.set('offline', {
      name: 'offline',
      speed: 10,     // Instant
      cost: 10,      // Free
      quality: 4,    // Basic (transliteration only)
      available: true
    });
  }

  private sortByPriority(
    strategies: Array<[string, StrategyPriority]>,
    priority: RoutingPriority
  ): Array<[string, StrategyPriority]> {
    return strategies.sort(([, a], [, b]) => {
      switch (priority) {
        case 'speed':
          return b.speed - a.speed; // Higher speed first
        case 'cost':
          return b.cost - a.cost;   // Lower cost first (higher number = cheaper)
        case 'quality':
          return b.quality - a.quality; // Higher quality first
        default:
          return 0;
      }
    });
  }

  private getReasoning(
    strategyName: string,
    config: StrategyPriority,
    priority: RoutingPriority
  ): string {
    const priorityText = {
      speed: 'fastest response time',
      cost: 'lowest cost',
      quality: 'best translation quality'
    };

    const characteristics = [];
    
    if (config.speed >= 8) characteristics.push('very fast');
    else if (config.speed >= 6) characteristics.push('moderately fast');
    else characteristics.push('slow');

    if (config.cost >= 8) characteristics.push('free');
    else if (config.cost >= 6) characteristics.push('affordable');
    else characteristics.push('expensive');

    if (config.quality >= 8) characteristics.push('excellent quality');
    else if (config.quality >= 6) characteristics.push('good quality');
    else characteristics.push('basic quality');

    return `Selected ${strategyName} for ${priorityText[priority]} (${characteristics.join(', ')})`;
  }
}

// ============================================================================
// PRIORITY-BASED SELECTION EXAMPLES
// ============================================================================

/**
 * Examples of how the simple router works:
 */

// Speed priority: libre (6) → google (9) → offline (10) → ai (3)
// Result: google (fastest available with API key)

// Cost priority: libre (9) → offline (10) → google (5) → ai (2)
// Result: libre (cheapest available)

// Quality priority: ai (10) → google (9) → libre (7) → offline (4)
// Result: ai (best quality, if API key available)

// Fallback behavior:
// If google is not available (no API key), it falls to next in line

// ============================================================================
// WHY THIS IS BETTER FOR V1
// ============================================================================

/**
 * 1. **Predictable** - Same input always gives same output
 * 2. **Debuggable** - Clear reasoning for each decision
 * 3. **Fast** - No complex calculations or ML models
 * 4. **Understandable** - Developers can reason about the behavior
 * 5. **Maintainable** - Simple logic, easy to modify
 * 6. **Testable** - Easy to write unit tests
 * 
 * The learning-based router can be added in v2 when we have real data.
 * For v1, deterministic logic is the right choice.
 */

// ============================================================================
// EXPORTS
// ============================================================================

export { SimpleRouter as default };
