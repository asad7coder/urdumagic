// ============================================================================
// DISTRIBUTED CACHE MANAGER
// Multi-level caching with memory, localStorage, and SharedWorker support
// ============================================================================

import type { CacheEntry, CacheStats } from '../../types.js';

/**
 * Cache entry with additional metadata
 */
interface InternalCacheEntry extends CacheEntry {
  accessCount: number;
  lastAccess: number;
  size: number;
}

/**
 * Access pattern for cache optimization
 */
interface AccessPattern {
  count: number;
  lastAccess: number;
  frequency: number;
}

/**
 * Advanced distributed caching system
 * Supports memory, localStorage, and SharedWorker for cross-tab synchronization
 */
export class DistributedCacheManager {
  private memoryCache: Map<string, InternalCacheEntry> = new Map();
  private sharedWorker: SharedWorker | null = null;
  private cacheStats: CacheStats;
  private maxMemoryEntries: number;
  private defaultTTL: number;
  private enabled: boolean = true;
  private accessPatterns: Map<string, AccessPattern> = new Map();
  private prefetchQueue: Set<string> = new Set();

  constructor(options: {
    memorySize?: number;
    localStorageEnabled?: boolean;
    sharedWorkerEnabled?: boolean;
    ttl?: number;
  } = {}) {
    this.maxMemoryEntries = options.memorySize || 1000;
    this.defaultTTL = options.ttl || 86400000; // 24 hours
    this.cacheStats = {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
      memoryUsage: 0
    };

    if (options.sharedWorkerEnabled) {
      this.initializeSharedWorker();
    }
  }

  /**
   * Get value from cache (checks memory, then shared, then localStorage)
   */
  async get(key: string): Promise<string | undefined> {
    if (!this.enabled) return undefined;

    const startTime = performance.now();

    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && !this.isExpired(memoryEntry)) {
        this.updateAccessPattern(key);
        this.updateMemoryAccess(memoryEntry);
        this.recordHit();
        return memoryEntry.value;
      }

      // Check shared cache (cross-tab)
      if (this.sharedWorker) {
        const sharedValue = await this.getFromSharedCache(key);
        if (sharedValue && !this.isExpired(sharedValue)) {
          // Promote to memory cache
          this.setMemoryCache(key, sharedValue);
          this.updateAccessPattern(key);
          this.recordHit();
          return sharedValue.value;
        }
      }

      // Check localStorage as fallback
      const lsValue = this.getFromLocalStorage(key);
      if (lsValue && !this.isExpired(lsValue)) {
        // Promote to memory cache
        this.setMemoryCache(key, lsValue);
        this.updateAccessPattern(key);
        this.recordHit();
        return lsValue.value;
      }

      this.recordMiss();
      this.schedulePrefetch(key);
      return undefined;

    } finally {
      // Track performance
      const duration = performance.now() - startTime;
      if (duration > 10) {
        console.warn(`Cache get took ${duration.toFixed(2)}ms for key: ${key}`);
      }
    }
  }

  /**
   * Set value in all cache layers
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.enabled) return;

    const actualTTL = ttl || this.defaultTTL;
    const entry: InternalCacheEntry = {
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + actualTTL,
      accessCount: 1,
      lastAccess: Date.now(),
      size: this.calculateSize(value)
    };

    // Set in memory cache
    this.setMemoryCache(key, entry);

    // Set in shared cache
    if (this.sharedWorker) {
      this.setInSharedCache(key, entry);
    }

    // Set in localStorage
    this.setToLocalStorage(key, entry);

    this.updateStats();
  }

  /**
   * Delete key from all cache layers
   */
  async delete(key: string): Promise<void> {
    // Delete from memory
    this.memoryCache.delete(key);

    // Delete from shared cache
    if (this.sharedWorker) {
      this.sharedWorker.port.postMessage({
        type: 'DELETE',
        payload: { key }
      });
    }

    // Delete from localStorage
    localStorage.removeItem(`urdumagic:cache:${key}`);

    this.updateStats();
  }

  /**
   * Clear all cache layers
   */
  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear shared cache
    if (this.sharedWorker) {
      this.sharedWorker.port.postMessage({
        type: 'CLEAR'
      });
    }

    // Clear localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('urdumagic:cache:'));
    keys.forEach(key => localStorage.removeItem(key));

    // Reset stats
    this.cacheStats = {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
      memoryUsage: 0
    };

    this.accessPatterns.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.cacheStats };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    return this.cacheStats.hitRate;
  }

  /**
   * Enable/disable caching
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Prefetch related keys based on access patterns
   */
  async prefetchRelated(key: string): Promise<void> {
    const relatedKeys = this.getRelatedKeys(key);
    const prefetchPromises = relatedKeys.map(relatedKey => 
      this.get(relatedKey).catch(() => undefined)
    );

    await Promise.all(prefetchPromises);
  }

  /**
   * Health check for cache system
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test memory cache
      const testKey = 'health-check-test';
      await this.set(testKey, 'test-value', 1000);
      const value = await this.get(testKey);
      await this.delete(testKey);

      return value === 'test-value';
    } catch (error) {
      console.error('Cache health check failed:', error);
      return false;
    }
  }

  /**
   * Export cache data for backup
   */
  exportData(): {
    timestamp: number;
    memoryCache: Record<string, InternalCacheEntry>;
    stats: CacheStats;
  } {
    return {
      timestamp: Date.now(),
      memoryCache: Object.fromEntries(this.memoryCache),
      stats: this.cacheStats
    };
  }

  /**
   * Import cache data from backup
   */
  importData(data: {
    memoryCache: Record<string, InternalCacheEntry>;
  }): void {
    this.memoryCache.clear();
    
    for (const [key, entry] of Object.entries(data.memoryCache)) {
      if (!this.isExpired(entry)) {
        this.memoryCache.set(key, entry);
      }
    }

    this.updateStats();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeSharedWorker(): void {
    try {
      this.sharedWorker = new SharedWorker('/workers/cache-worker.js');
      this.sharedWorker.port.onmessage = this.handleSharedWorkerMessage.bind(this);
      this.sharedWorker.port.start();
    } catch (error) {
      console.warn('SharedWorker not supported, falling back to localStorage:', error);
    }
  }

  private handleSharedWorkerMessage(e: MessageEvent): void {
    const { type, payload } = e.data;
    
    switch (type) {
      case 'GET_RESPONSE':
        // Handle shared cache response
        break;
      case 'SET_RESPONSE':
        // Handle set response
        break;
      case 'DELETE_RESPONSE':
        // Handle delete response
        break;
    }
  }

  private async getFromSharedCache(key: string): Promise<InternalCacheEntry | null> {
    if (!this.sharedWorker) return null;

    return new Promise((resolve) => {
      const messageId = this.generateMessageId();
      
      const timeout = setTimeout(() => {
        resolve(null);
      }, 1000);

      const handler = (e: MessageEvent) => {
        if (e.data.id === messageId) {
          clearTimeout(timeout);
          this.sharedWorker!.port.removeEventListener('message', handler);
          resolve(e.data.payload || null);
        }
      };

      this.sharedWorker!.port.addEventListener('message', handler);
      this.sharedWorker!.port.postMessage({
        type: 'GET',
        id: messageId,
        payload: { key }
      });
    });
  }

  private setInSharedCache(key: string, entry: InternalCacheEntry): void {
    if (!this.sharedWorker) return;

    this.sharedWorker.port.postMessage({
      type: 'SET',
      payload: { key, entry }
    });
  }

  private getFromLocalStorage(key: string): InternalCacheEntry | null {
    try {
      const fullKey = `urdumagic:cache:${key}`;
      const raw = localStorage.getItem(fullKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as InternalCacheEntry;
      if (this.isExpired(parsed)) {
        localStorage.removeItem(fullKey);
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  private setToLocalStorage(key: string, entry: InternalCacheEntry): void {
    try {
      const fullKey = `urdumagic:cache:${key}`;
      localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        this.handleQuotaExceeded();
      } else {
        console.warn('Failed to write to localStorage:', error);
      }
    }
  }

  private setMemoryCache(key: string, entry: InternalCacheEntry): void {
    // Remove oldest entries if cache is full
    while (this.memoryCache.size >= this.maxMemoryEntries) {
      this.evictLRU();
    }

    this.memoryCache.set(key, entry);
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  private updateMemoryAccess(entry: InternalCacheEntry): void {
    entry.accessCount++;
    entry.lastAccess = Date.now();
  }

  private updateAccessPattern(key: string): void {
    const pattern = this.accessPatterns.get(key) || {
      count: 0,
      lastAccess: 0,
      frequency: 0
    };

    pattern.count++;
    pattern.lastAccess = Date.now();
    pattern.frequency = pattern.count / (Date.now() - (pattern.lastAccess || Date.now()));

    this.accessPatterns.set(key, pattern);
  }

  private schedulePrefetch(key: string): void {
    if (this.prefetchQueue.has(key)) return;

    this.prefetchQueue.add(key);

    setTimeout(() => {
      this.prefetchRelated(key);
      this.prefetchQueue.delete(key);
    }, 1000);
  }

  private getRelatedKeys(key: string): string[] {
    const parts = key.split(':');
    const related: string[] = [];

    if (parts.length >= 3) {
      const source = parts[0];
      const target = parts[1];
      const text = parts.slice(2).join(':');

      // Same text, different target language
      related.push(`${source}:${target === 'ur' ? 'en' : 'ur'}:${text}`);
    }

    return related.filter(k => k !== key);
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private calculateSize(value: string): number {
    return value.length * 2; // Rough estimate (UTF-16)
  }

  private updateStats(): void {
    this.cacheStats.size = this.memoryCache.size;
    this.cacheStats.memoryUsage = this.calculateMemoryUsage();
    this.cacheStats.hitRate = this.cacheStats.hits + this.cacheStats.misses > 0
      ? this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)
      : 0;
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  private recordHit(): void {
    this.cacheStats.hits++;
  }

  private recordMiss(): void {
    this.cacheStats.misses++;
  }

  private isQuotaExceededError(error: unknown): boolean {
    return (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    );
  }

  private handleQuotaExceeded(): void {
    logger.warn('Cache quota exceeded, initiating cleanup');
    
    // Clear expired entries first
    const now = Date.now();
    for (const [key, entry] of this.memoryCache) {
      if (entry.expiresAt < now) {
        this.memoryCache.delete(key);
      }
    }

    // If still full, evict 20% of oldest entries
    if (this.memoryCache.size >= this.maxMemoryEntries * 0.8) {
      const sortedKeys = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.lastAccess - b.lastAccess)
        .map(([key]) => key);
      
      const toEvict = sortedKeys.slice(0, Math.floor(this.memoryCache.size * 0.2));
      toEvict.forEach(key => this.memoryCache.delete(key));
    }

    // Clear localStorage
    const lsKeys = Object.keys(localStorage).filter(key => key.startsWith('urdumagic:cache:'));
    lsKeys.forEach(lsKey => {
      try {
        const raw = localStorage.getItem(lsKey);
        if (raw) {
          const entry = JSON.parse(raw);
          if (entry.expiresAt < now) {
            localStorage.removeItem(lsKey);
          }
        }
      } catch (error) {
        localStorage.removeItem(lsKey);
      }
    });
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  destroy(): void {
    this.memoryCache.clear();
    this.accessPatterns.clear();
    this.sharedWorker = null;
    this.enabled = false;
  }
}

export { DistributedCacheManager as default };
