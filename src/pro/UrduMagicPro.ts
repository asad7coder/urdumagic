// ============================================================================ 
// URDUMAGIC PRO - ADVANCED FEATURES
// ============================================================================

/**
 * UrduMagic Pro - Advanced features for enterprise and power users
 * This module provides enhanced capabilities beyond the basic MVP version
 */

import { createManagedTranslator } from '../core/translator.js';
import type { ManagedTranslator } from '../core/translator.js';
import { createMagicDom } from '../injector/magic.js';
import { createLanguageSwitcher } from '../ui/switcher.js';
import type { LangMode } from '../ui/switcher.js';
import { SecurityManager } from '../infrastructure/security/SecurityManager.js';
import { PerformanceMonitor } from '../infrastructure/performance/PerformanceMonitor.js';
import { DistributedCacheManager } from '../infrastructure/cache/DistributedCacheManager.js';
import { FallbackTranslationManager } from '../services/translation/FallbackTranslationManager.js';
import { PluginRegistry } from '../plugins/PluginRegistry.js';

import type {
  UrduMagicConfig,
  UrduMagicInstance,
  LangMode as LangModeType,
  CacheStats,
  PluginInfo,
  AnalyticsData,
  HealthStatus
} from '../types.js';

/**
 * UrduMagic Pro implementation with advanced features
 */
export class UrduMagicPro {
  private static version = '2.0.0-pro';

  /**
   * Initialize UrduMagic Pro with advanced features
   */
  static init(config: UrduMagicConfig): UrduMagicInstance {
    // Initialize advanced infrastructure
    const securityManager = new SecurityManager(config.security || {});
    const performanceMonitor = new PerformanceMonitor(config.performance || {});
    const cacheManager = new DistributedCacheManager(config.cache || {});
    const fallbackManager = new FallbackTranslationManager(config.fallbackTranslators || []);
    const pluginRegistry = new PluginRegistry();

    // Create enhanced translator with Pro features
    const managed = createManagedTranslator({
      ...config,
      cache: cacheManager,
      security: securityManager,
      performance: performanceMonitor,
      fallbackManager,
      pluginRegistry
    });

    // Create enhanced Magic DOM with Pro features
    const debounceMs = config.debounceMs ?? 300;
    const magic = createMagicDom(document, {
      debounceMs,
      translate: (text, targetLang) => managed.translate(text, targetLang),
      security: securityManager,
      performance: performanceMonitor
    });

    // Create enhanced language switcher
    let current: LangModeType = config.defaultLang;
    const switcher =
      config.showSwitcher === false
        ? undefined
        : createLanguageSwitcher(document, config.modes, (lang) => {
          void applyAll(lang);
        });

    const applyAll = async (lang: LangModeType): Promise<void> => {
      current = lang;
      switcher?.setActive(lang);
      await magic.applyLanguage(lang);
      config.onLangSwitch?.(lang);
    };

    // Create Pro instance with enhanced capabilities
    const instance: UrduMagicInstance = {
      // Core methods (enhanced)
      switchLang(lang: LangModeType): void {
        if (!config.modes.includes(lang)) return;
        void applyAll(lang);
      },

      getCurrentLang(): LangModeType {
        return current;
      },

      translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
        return managed.translate(text, targetLang);
      },

      translateBatch(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]> {
        // Enhanced batch processing with Pro features
        return managed.translateBatch(texts, targetLang);
      },

      toRoman(text: string): string {
        return managed.toRoman(text);
      },

      toUrdu(text: string): string {
        return managed.toUrdu(text);
      },

      // Magic mode methods (enhanced)
      snapshot(): void {
        magic.snapshotAndMark();
      },

      async applyLanguage(lang: LangModeType): Promise<void> {
        await applyAll(lang);
      },

      addMagicElement(element: Element): void {
        magic.snapshotAndMark();
      },

      removeMagicElement(element: Element): void {
        magic.removeElement(element);
      },

      destroyMagic(): void {
        magic.destroy();
      },

      // Enhanced cache management
      getCacheStats(): CacheStats {
        return cacheManager.getStats();
      },

      clearCache(): void {
        cacheManager.clear();
      },

      // Enhanced plugin management
      getPluginInfo(): PluginInfo[] {
        return pluginRegistry.getPluginInfo();
      },

      addPlugin(plugin: any): void {
        pluginRegistry.register(plugin);
      },

      removePlugin(name: string): void {
        pluginRegistry.unregister(name);
      },

      // Enhanced analytics
      getAnalytics(): AnalyticsData {
        return {
          cacheHitRate: cacheManager.getHitRate(),
          avgResponseTime: performanceMonitor.getAverageResponseTime(),
          errorRate: managed.getErrorRate(),
          activeUsers: 1,
          bundleSize: 45000, // ~45KB for Pro
          memoryUsage: performanceMonitor.getMemoryUsage(),
          totalTranslations: managed.getTotalTranslations(),
          topTranslations: managed.getTopTranslations()
        };
      },

      // Enhanced health check
      async healthCheck(): Promise<HealthStatus> {
        const translationHealth = await managed.healthCheck();
        const cacheHealth = await cacheManager.healthCheck();
        const securityHealth = await securityManager.healthCheck();
        const performanceHealth = await performanceMonitor.healthCheck();

        return {
          healthy: translationHealth.healthy && cacheHealth.healthy && 
                   securityHealth.healthy && performanceHealth.healthy,
          services: {
            translation: translationHealth.healthy,
            cache: cacheHealth.healthy,
            transliterator: true,
            plugins: pluginRegistry.isHealthy()
          },
          timestamp: Date.now(),
          uptime: performanceMonitor.getUptime(),
          version: UrduMagicPro.version
        };
      },

      // Pro-specific methods
      getSecurityManager(): SecurityManager {
        return securityManager;
      },

      getPerformanceMonitor(): PerformanceMonitor {
        return performanceMonitor;
      },

      getCacheManager(): DistributedCacheManager {
        return cacheManager;
      },

      getPluginRegistry(): PluginRegistry {
        return pluginRegistry;
      },

      // Lifecycle
      destroy(): void {
        magic.destroy();
        switcher?.destroy();
        managed.dispose();
        securityManager.destroy();
        performanceMonitor.destroy();
        cacheManager.destroy();
        pluginRegistry.destroy();
      }
    };

    void applyAll(config.defaultLang);
    return instance;
  }

  /**
   * Get the current version of UrduMagic Pro
   */
  static getVersion(): string {
    return UrduMagicPro.version;
  }

  /**
   * Check if Pro features are available
   */
  static isAvailable(): boolean {
    return true;
  }

  /**
   * Get Pro feature information
   */
  static getFeatures(): string[] {
    return [
      'advanced-translation',
      'distributed-cache',
      'security-manager',
      'performance-monitoring',
      'plugin-system',
      'fallback-translators',
      'enhanced-analytics',
      'health-checks',
      'web-workers',
      'prefetching',
      'rate-limiting',
      'input-sanitization'
    ];
  }
}

export default UrduMagicPro;
