// ============================================================================
// SIMPLE DEBUG SYSTEM
// debug: true - that's it
// ============================================================================

import type { UrduMagicConfig } from '../types.js';
import { DebugLogger, createDebugLogger } from '../infrastructure/debug/DebugLogger.js';

/**
 * Simple debug configuration
 * Maps debug: true to full logging system
 */
export interface SimpleDebugConfig {
  debug?: boolean;
}

/**
 * Simple debug manager
 * - Converts debug: true to full logging configuration
 * - Provides clean developer experience
 * - Handles all complexity internally
 */
export class SimpleDebugManager {
  private static logger: DebugLogger | null = null;
  private static enabled: boolean = false;

  /**
   * Initialize debug system from simple config
   * 
   * @param config - Simple debug config (debug: true)
   * @returns UrduMagic config with full debug settings
   * 
   * @example
   * ```typescript
   * // Simple usage
   * const config = SimpleDebugManager.init({ debug: true });
   * 
   * // Result: Full debug configuration
   * // {
   * //   monitoring: {
   * //     enabled: true,
   * //     logLevel: 'info',
   * //     categories: ['translation', 'strategy', 'cache', 'magic-mode']
   * //   }
   * // }
   * ```
   */
  static init(config: SimpleDebugConfig): Partial<UrduMagicConfig> {
    const debugEnabled = config.debug === true;
    
    if (debugEnabled) {
      // Enable full debug logging
      this.enabled = true;
      this.logger = createDebugLogger({
        monitoring: {
          enabled: true,
          logLevel: 'info', // Good balance of detail
          categories: ['translation', 'strategy', 'cache', 'magic-mode', 'performance']
        }
      } as UrduMagicConfig);

      // Log initialization
      this.logger?.info('debug', 'UrduMagic debug mode enabled');
      
      // Return full debug configuration
      return {
        monitoring: {
          enabled: true,
          logLevel: 'info',
          categories: ['translation', 'strategy', 'cache', 'magic-mode', 'performance']
        }
      };
    } else {
      // Debug disabled - return minimal config
      this.enabled = false;
      return {
        monitoring: {
          enabled: false,
          logLevel: 'error' // Only errors
        }
      };
    }
  }

  /**
   * Get debug logger instance
   */
  static getLogger(): DebugLogger | null {
    return this.logger;
  }

  /**
   * Check if debug is enabled
   */
  static isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Log message (convenience method)
   */
  static log(category: string, message: string, data?: any): void {
    if (this.logger) {
      this.logger.info(category, message, data);
    }
  }

  /**
   * Log error
   */
  static error(category: string, message: string, error?: any): void {
    if (this.logger) {
      this.logger.error(category, message, error);
    } else {
      // Always log errors to console
      console.error(`[UrduMagic] [${category}] ${message}`, error);
    }
  }

  /**
   * Log warning
   */
  static warn(category: string, message: string, data?: any): void {
    if (this.logger) {
      this.logger.warn(category, message, data);
    } else {
      console.warn(`[UrduMagic] [${category}] ${message}`, data);
    }
  }

  /**
   * Get debug statistics
   */
  static getStats(): any {
    if (!this.logger) return null;
    
    return {
      logs: this.logger.getLogs({ limit: 50 }),
      errors: this.logger.getErrorSummary(),
      performance: this.logger.getPerformanceSummary()
    };
  }

  /**
   * Export debug data
   */
  static exportData(): string {
    if (!this.logger) return 'Debug not enabled';
    
    return this.logger.exportLogs();
  }

  /**
   * Clear debug data
   */
  static clear(): void {
    if (this.logger) {
      this.logger.clear();
    }
  }
}

/**
 * Convenience function for debug initialization
 * 
 * @param debug - Debug enabled flag
 * @returns UrduMagic config with debug settings
 * 
 * @example
 * ```typescript
 * // In UrduMagic.init()
 * const config = {
 *   ...otherConfig,
 *   ...enableDebug(true)
 * };
 * ```
 */
export function enableDebug(debug: boolean = true): Partial<UrduMagicConfig> {
  return SimpleDebugManager.init({ debug });
}

/**
 * Global debug access (for console debugging)
 * 
 * @example
 * ```typescript
 * // In browser console
 * UrduMagicDebug.log('translation', 'Hello world');
 * UrduMagicDebug.getStats();
 * ```
 */
export const UrduMagicDebug = {
  log: (category: string, message: string, data?: any) => SimpleDebugManager.log(category, message, data),
  error: (category: string, message: string, error?: any) => SimpleDebugManager.error(category, message, error),
  warn: (category: string, message: string, data?: any) => SimpleDebugManager.warn(category, message, data),
  getStats: () => SimpleDebugManager.getStats(),
  exportData: () => SimpleDebugManager.exportData(),
  clear: () => SimpleDebugManager.clear(),
  isEnabled: () => SimpleDebugManager.isEnabled()
};

// ============================================================================
// GLOBAL REGISTRATION (for browser console access)
// ============================================================================

if (typeof window !== 'undefined') {
  // Register globally for debugging
  (window as any).UrduMagicDebug = UrduMagicDebug;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SimpleDebugManager;
