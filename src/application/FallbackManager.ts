// ============================================================================
// FALLBACK MANAGER
// Orchestrates multi-provider fallback logic
// ============================================================================

import type { TranslationStrategy, UrduMagicConfig } from '../types.js';
import { logger } from '../infrastructure/logging/Logger.js';

export class FallbackManager {
  private strategies: TranslationStrategy[] = [];
  private config: UrduMagicConfig;

  constructor(strategies: TranslationStrategy[], config: UrduMagicConfig) {
    this.strategies = strategies;
    this.config = config;
  }

  async translateWithFallback(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    const chain = this.config.fallbackChain?.strategies || ['offline', 'libre'];
    
    for (const strategyName of chain) {
      try {
        const strategy = this.strategies.find(s => s.name === strategyName);
        if (!strategy) continue;

        const available = strategy.isAvailable ? await strategy.isAvailable() : true;
        if (!available) continue;

        const result = await strategy.translate(text, targetLang);
        if (result && result !== text) {
          return result;
        }
      } catch (error) {
        logger.warn(`Strategy ${strategyName} failed during fallback`, { error });
      }
    }

    return text; // Return original if everything fails
  }

  addStrategy(strategy: TranslationStrategy): void {
    if (!this.strategies.find(s => s.name === strategy.name)) {
      this.strategies.push(strategy);
    }
  }

  removeStrategy(name: string): void {
    this.strategies = this.strategies.filter(s => s.name !== name);
  }

  getAvailableStrategies(): string[] {
    return this.strategies.map(s => s.name);
  }
}

export default FallbackManager;
