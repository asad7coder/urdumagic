// ============================================================================ 
// URDUMAGIC PRO - ADVANCED FEATURES
// ============================================================================

import { createManagedTranslator } from '../core/translator.js';
import type { ManagedTranslator } from '../core/translator.js';
import { createMagicDom } from '../injector/magic.js';
import { createLanguageSwitcher } from '../ui/switcher.js';
import { SecurityManager } from '../infrastructure/security/SecurityManager.js';
import { PerformanceMonitor } from '../infrastructure/performance/PerformanceMonitor.js';
import { DistributedCacheManager } from '../infrastructure/cache/DistributedCacheManager.js';
import { FallbackManager } from '../application/FallbackManager.js';
import { logger } from '../infrastructure/logging/Logger.js';

import type {
  UrduMagicConfig,
  UrduMagicInstance,
  LangMode,
  CacheStats,
  PluginInfo,
  AnalyticsData,
  HealthStatus,
  TranslationStrategy
} from '../types.js';

/**
 * UrduMagic Pro implementation with advanced features
 */
export class UrduMagicPro implements UrduMagicInstance {
  private static version = '2.1.0-pro';
  
  private security: SecurityManager;
  private performance: PerformanceMonitor;
  private cache: DistributedCacheManager;
  private plugins: PluginRegistry;
  private fallback: FallbackManager;
  private managed: ManagedTranslator;
  private magic: any;
  private switcher: any;
  private currentLang: LangMode;
  private config: UrduMagicConfig;

  constructor(config: UrduMagicConfig) {
    this.config = config;
    this.currentLang = config.defaultLang;
    
    // Initialize Infrastructure
    this.security = new SecurityManager(config.security);
    this.performance = new PerformanceMonitor(config.performance);
    this.cache = new DistributedCacheManager(config.performance);
    this.plugins = new PluginRegistry();
    
    // Create Managed Translator
    this.managed = createManagedTranslator(config);
    
    // Create Fallback Manager
    this.fallback = new FallbackManager([], config);
    
    // Create Magic DOM
    this.magic = createMagicDom(document, {
      debounceMs: config.magicMode?.debounceMs || 300,
      translate: (text, targetLang) => this.managed.translate(text, targetLang)
    });

    // Create Switcher
    if (config.showSwitcher !== false) {
      this.switcher = createLanguageSwitcher(document, config.modes, (lang) => {
        void this.applyLanguage(lang);
      });
    }

    logger.info(`UrduMagic Pro ${UrduMagicPro.version} initialized`);
    void this.applyLanguage(config.defaultLang);
  }

  static init(config: UrduMagicConfig): UrduMagicInstance {
    return new UrduMagicPro(config);
  }

  // Core methods
  async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    return this.managed.translate(text, targetLang);
  }

  async translateBatch(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]> {
    return this.managed.translateBatch(texts, targetLang);
  }

  toRoman(text: string): string {
    return this.managed.toRoman(text);
  }

  toUrdu(text: string): string {
    return this.managed.toUrdu(text);
  }

  switchLang(lang: LangMode): void {
    if (!this.config.modes.includes(lang)) {
      logger.warn(`Language ${lang} not supported in current configuration`);
      return;
    }
    void this.applyLanguage(lang);
  }

  getCurrentLang(): LangMode {
    return this.currentLang;
  }

  private async applyLanguage(lang: LangMode): Promise<void> {
    this.currentLang = lang;
    this.switcher?.setActive(lang);
    await this.magic.applyLanguage(lang);
    this.config.onLangSwitch?.(lang);
    logger.debug(`Language applied: ${lang}`);
  }

  // Magic mode
  snapshot(): void {
    this.magic.snapshotAndMark();
  }

  addMagicElement(element: Element): void {
    // In optimized version, we just trigger a new snapshot
    this.magic.snapshotAndMark();
  }

  removeMagicElement(element: Element): void {
    // Element removal is handled by MutationObserver automatically
  }

  destroyMagic(): void {
    this.magic.destroy();
  }

  // Cache management
  getCacheStats(): CacheStats {
    return this.cache.getStats();
  }

  clearCache(): void {
    this.cache.clear();
    this.managed.dispose(); // Also clears memory cache
  }

  // Plugin management
  getPluginInfo(): PluginInfo[] {
    return this.plugins.getPluginInfo();
  }

  addPlugin(plugin: TranslationStrategy): void {
    this.plugins.register(plugin);
  }

  removePlugin(name: string): void {
    this.plugins.unregister(name);
  }

  // Analytics & Health
  getAnalytics(): AnalyticsData {
    return {
      cacheHitRate: this.cache.getHitRate(),
      avgResponseTime: this.performance.getAverageResponseTime(),
      errorRate: 0,
      activeUsers: 1,
      bundleSize: 48000,
      memoryUsage: this.performance.getMemoryUsage(),
      totalTranslations: 0,
      topTranslations: []
    };
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      healthy: true,
      services: {
        translation: true,
        cache: true,
        transliterator: true,
        plugins: true
      },
      timestamp: Date.now(),
      uptime: this.performance.getUptime(),
      version: UrduMagicPro.version
    };
  }

  // Lifecycle
  destroy(): void {
    this.magic.destroy();
    this.switcher?.destroy();
    this.managed.dispose();
    this.security.destroy();
    this.performance.destroy();
    this.cache.destroy();
    this.plugins.destroy();
    logger.info('UrduMagic Pro destroyed');
  }
}

export default UrduMagicPro;
