// ============================================================================
// DEFAULT CONFIGURATION
// Strict defaults for zero-configuration usage
// ============================================================================

import type { UrduMagicConfig } from '../types.js';

/**
 * Strict default configuration for UrduMagic
 * Ensures predictable behavior with zero config
 */
export const DefaultConfig: Readonly<UrduMagicConfig> = {
  // Core settings
  defaultLang: 'en',
  modes: ['en', 'ur', 'roman'],
  showSwitcher: false,

  // Translation settings (Strictly Offline)
  strategy: 'offline',

  // Performance settings
  performance: {
    cacheTTL: 3600000, // 1 hour
    cacheSize: 1000,
    debounceMs: 300,
    rateLimitMs: 100, 
    batchSize: 20,
    webWorkers: false
  },

  // Magic mode settings
  magicMode: {
    debounceMs: 300
  },

  // Security settings
  security: {
    sanitizeInput: true,
    maxLength: 5000
  },

  // Monitoring settings
  monitoring: {
    enabled: false,
    logLevel: 'error'
  }
};

/**
 * Configuration merger
 */
export class ConfigManager {
  static merge(userConfig: Partial<UrduMagicConfig> = {}): UrduMagicConfig {
    return {
      ...DefaultConfig,
      ...userConfig,
      performance: { ...DefaultConfig.performance, ...userConfig.performance },
      magicMode: { ...DefaultConfig.magicMode, ...userConfig.magicMode },
      security: { ...DefaultConfig.security, ...userConfig.security },
      monitoring: { ...DefaultConfig.monitoring, ...userConfig.monitoring },
    };
  }
}
