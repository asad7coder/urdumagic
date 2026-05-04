// ============================================================================
// PLUGIN REGISTRY
// Central plugin management system for UrduMagic
// ============================================================================

import type { TranslatorPlugin, PluginInfo, QuotaInfo } from '../types.js';
import { EventEmitter } from '../infrastructure/events/EventEmitter.js';

/**
 * Plugin metadata
 */
interface PluginMetadata {
  plugin: TranslatorPlugin;
  enabled: boolean;
  priority: number;
  registeredAt: number;
  lastUsed: number;
  totalRequests: number;
  errorCount: number;
  totalResponseTime: number;
  quota?: QuotaInfo;
}

/**
 * Plugin registry for managing translation plugins
 * Supports registration, health monitoring, and fallback management
 */
export class PluginRegistry extends EventEmitter {
  private plugins: Map<string, PluginMetadata> = new Map();
  private fallbackChain: string[] = [];
  private healthCheckInterval: any = null;
  private healthCheckIntervalMs: number = 60000; // 1 minute
  private registryEnabled: boolean = true;

  constructor() {
    super();
    this.startHealthChecks();
  }

  /**
   * Register a new plugin
   */
  register(plugin: TranslatorPlugin, options: {
    priority?: number;
    enabled?: boolean;
  } = {}): void {
    if (!this.registryEnabled) {
      throw new Error('Plugin registry is disabled');
    }

    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }

    const metadata: PluginMetadata = {
      plugin,
      enabled: options.enabled !== false,
      priority: options.priority || 0,
      registeredAt: Date.now(),
      lastUsed: 0,
      totalRequests: 0,
      errorCount: 0,
      totalResponseTime: 0
    };

    this.plugins.set(plugin.name, metadata);
    this.updateFallbackChain();

    this.emit('plugin:registered', { name: plugin.name, metadata });
    console.log(`Plugin '${plugin.name}' registered successfully`);
  }

  /**
   * Unregister a plugin
   */
  unregister(name: string): boolean {
    if (!this.plugins.has(name)) {
      return false;
    }

    this.plugins.delete(name);
    this.updateFallbackChain();

    this.emit('plugin:unregistered', { name });
    console.log(`Plugin '${name}' unregistered`);
    return true;
  }

  /**
   * Get plugin by name
   */
  get(name: string): TranslatorPlugin | undefined {
    const metadata = this.plugins.get(name);
    return metadata?.enabled ? metadata.plugin : undefined;
  }

  /**
   * Get all registered plugins
   */
  getAll(): TranslatorPlugin[] {
    return Array.from(this.plugins.values())
      .filter(metadata => metadata.enabled)
      .map(metadata => metadata.plugin);
  }

  /**
   * Get plugin metadata
   */
  getMetadata(name: string): PluginMetadata | undefined {
    return this.plugins.get(name);
  }

  /**
   * Enable/disable a plugin
   */
  setPluginEnabled(name: string, enabled: boolean): boolean {
    const metadata = this.plugins.get(name);
    if (!metadata) {
      return false;
    }

    metadata.enabled = enabled;
    this.updateFallbackChain();

    this.emit('plugin:status-changed', { name, enabled });
    return true;
  }

  /**
   * Set plugin priority
   */
  setPriority(name: string, priority: number): boolean {
    const metadata = this.plugins.get(name);
    if (!metadata) {
      return false;
    }

    metadata.priority = priority;
    this.updateFallbackChain();

    this.emit('plugin:priority-changed', { name, priority });
    return true;
  }

  /**
   * Get plugin information for analytics
   */
  async getPluginInfo(): Promise<PluginInfo[]> {
    const info: PluginInfo[] = [];

    for (const [name, metadata] of this.plugins) {
      const avgResponseTime = metadata.totalRequests > 0
        ? metadata.totalResponseTime / metadata.totalRequests
        : 0;

      const errorRate = metadata.totalRequests > 0
        ? metadata.errorCount / metadata.totalRequests
        : 0;

      info.push({
        name,
        healthy: await this.isHealthy(name),
        lastUsed: metadata.lastUsed,
        totalRequests: metadata.totalRequests,
        errorRate,
        avgResponseTime
      });
    }

    return info;
  }

  /**
   * Get fallback chain (ordered by priority and health)
   */
  getFallbackChain(): string[] {
    return [...this.fallbackChain];
  }

  /**
   * Execute translation with fallback support
   */
  async translateWithFallback(
    text: string,
    targetLang: 'ur' | 'en',
    options: {
      maxAttempts?: number;
      skipPlugins?: string[];
      preferredPlugin?: string;
    } = {}
  ): Promise<string> {
    const maxAttempts = options.maxAttempts || this.fallbackChain.length;
    const skipPlugins = new Set(options.skipPlugins || []);
    let lastError: Error | null = null;

    // Try preferred plugin first
    if (options.preferredPlugin) {
      const preferredMetadata = this.plugins.get(options.preferredPlugin);
      if (preferredMetadata?.enabled && !skipPlugins.has(options.preferredPlugin)) {
        try {
          const result = await this.executePlugin(preferredMetadata, text, targetLang);
          return result;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Preferred plugin '${options.preferredPlugin}' failed:`, error);
        }
      }
    }

    // Try fallback chain
    let attempts = 0;
    for (const pluginName of this.fallbackChain) {
      if (attempts >= maxAttempts) break;
      if (skipPlugins.has(pluginName)) continue;

      const metadata = this.plugins.get(pluginName);
      if (!metadata?.enabled) continue;

      try {
        const result = await this.executePlugin(metadata, text, targetLang);
        return result;
      } catch (error) {
        lastError = error as Error;
        metadata.errorCount++;
        console.warn(`Plugin '${pluginName}' failed:`, error);
        attempts++;
      }
    }

    // All plugins failed
    const errorMessage = lastError?.message || 'All translation plugins failed';
    this.emit('translation:failed', { text, targetLang, error: errorMessage });
    return `${text} [translation failed]`;
  }

  /**
   * Execute batch translation with fallback
   */
  async translateBatchWithFallback(
    texts: string[],
    targetLang: 'ur' | 'en',
    options: {
      maxAttempts?: number;
      skipPlugins?: string[];
      preferredPlugin?: string;
    } = {}
  ): Promise<string[]> {
    const maxAttempts = options.maxAttempts || this.fallbackChain.length;
    const skipPlugins = new Set(options.skipPlugins || []);

    // Try preferred plugin first
    if (options.preferredPlugin) {
      const preferredMetadata = this.plugins.get(options.preferredPlugin);
      if (preferredMetadata?.enabled && !skipPlugins.has(options.preferredPlugin) && preferredMetadata.plugin.translateBatch) {
        try {
          const result = await preferredMetadata.plugin.translateBatch!(texts, targetLang);
          this.updatePluginStats(preferredMetadata, texts.length * 100); // Estimate response time
          return result;
        } catch (error) {
          console.warn(`Preferred plugin batch translation failed:`, error);
        }
      }
    }

    // Try fallback chain
    for (const pluginName of this.fallbackChain) {
      const metadata = this.plugins.get(pluginName);
      if (!metadata?.enabled) continue;

      if (metadata.plugin.translateBatch) {
        try {
          const result = await metadata.plugin.translateBatch!(texts, targetLang);
          this.updatePluginStats(metadata, texts.length * 100); // Estimate response time
          return result;
        } catch (error) {
          metadata.errorCount++;
          console.warn(`Plugin '${pluginName}' batch translation failed:`, error);
          continue;
        }
      }

      // Fallback to individual translations
      try {
        const results = await Promise.all(
          texts.map(text => this.translateWithFallback(text, targetLang, {
            maxAttempts: 1,
            skipPlugins: Array.from(skipPlugins).concat([pluginName])
          }))
        );
        return results;
      } catch (error) {
        metadata.errorCount++;
        continue;
      }
    }

    // All plugins failed
    return texts.map(text => `${text} [translation failed]`);
  }

  /**
   * Check if a plugin is healthy
   */
  async isHealthy(name: string): Promise<boolean> {
    const metadata = this.plugins.get(name);
    if (!metadata || !metadata.enabled) {
      return false;
    }

    try {
      if (metadata.plugin.healthCheck) {
        return await metadata.plugin.healthCheck();
      }

      // Basic health check - try a simple translation
      await metadata.plugin.translate('test', 'ur');
      return true;
    } catch (error) {
      metadata.errorCount++;
      return false;
    }
  }

  /**
   * Get quota information for a plugin
   */
  async getQuota(name: string): Promise<QuotaInfo | null> {
    const metadata = this.plugins.get(name);
    if (!metadata || !metadata.enabled) {
      return null;
    }

    try {
      if (metadata.plugin.getQuota) {
        const quota = await metadata.plugin.getQuota();
        metadata.quota = quota;
        return quota;
      }
    } catch (error) {
      console.warn(`Failed to get quota for plugin '${name}':`, error);
    }

    return metadata.quota || null;
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.healthCheckIntervalMs);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Enable/disable plugin registry
   */
  setRegistryEnabled(enabled: boolean): void {
    this.registryEnabled = enabled;
    if (!enabled) {
      this.stopHealthChecks();
    } else {
      this.startHealthChecks();
    }
  }

  /**
   * Get registry statistics
   */
  getRegistryStats(): {
    totalPlugins: number;
    enabledPlugins: number;
    healthyPlugins: number;
    totalRequests: number;
    totalErrors: number;
    avgResponseTime: number;
  } {
    const plugins = Array.from(this.plugins.values());
    const enabledPlugins = plugins.filter(p => p.enabled);
    const totalRequests = plugins.reduce((sum, p) => sum + p.totalRequests, 0);
    const totalErrors = plugins.reduce((sum, p) => sum + p.errorCount, 0);
    const totalResponseTime = plugins.reduce((sum, p) => sum + p.totalResponseTime, 0);
    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

    return {
      totalPlugins: plugins.length,
      enabledPlugins: enabledPlugins.length,
      healthyPlugins: 0, // Would need async health check
      totalRequests,
      totalErrors,
      avgResponseTime
    };
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    this.plugins.clear();
    this.fallbackChain = [];
    this.emit('plugin:cleared');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private updateFallbackChain(): void {
    const enabledPlugins = Array.from(this.plugins.entries())
      .filter(([_, metadata]) => metadata.enabled)
      .sort(([_, a], [__, b]) => b.priority - a.priority);

    this.fallbackChain = enabledPlugins.map(([name, _]) => name);
    this.emit('fallback-chain-updated', { chain: this.fallbackChain });
  }

  private async executePlugin(
    metadata: PluginMetadata,
    text: string,
    targetLang: 'ur' | 'en'
  ): Promise<string> {
    const startTime = performance.now();

    try {
      const result = await metadata.plugin.translate(text, targetLang);
      const duration = performance.now() - startTime;

      this.updatePluginStats(metadata, duration);
      this.emit('plugin:success', { name: metadata.plugin.name, duration });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      metadata.errorCount++;

      this.emit('plugin:error', {
        name: metadata.plugin.name,
        error: error as Error,
        duration
      });

      throw error;
    }
  }

  private updatePluginStats(metadata: PluginMetadata, responseTime: number): void {
    metadata.lastUsed = Date.now();
    metadata.totalRequests++;
    metadata.totalResponseTime += responseTime;
  }

  private async performHealthChecks(): Promise<void> {
    const healthPromises = Array.from(this.plugins.keys()).map(async name => {
      const healthy = await this.isHealthy(name);
      this.emit('plugin:health-checked', { name, healthy });
    });

    await Promise.allSettled(healthPromises);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { PluginRegistry as default };
