// ============================================================================
// PERFORMANCE MONITOR
// Real-time performance tracking and analytics for UrduMagic
// ============================================================================

import type { PerformanceMetric, PerformanceStats, AnalyticsData } from '../../types.js';

/**
 * Performance monitoring system for UrduMagic
 * Tracks metrics, provides analytics, and performance insights
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private startTime: number = Date.now();
  private enabled: boolean = true;
  private maxMetricsPerOperation: number = 100;
  private activeTimers: Map<string, number> = new Map();

  constructor(config: any = {}) {
    this.initializeThresholds();
    this.startCleanupInterval();
  }

  /**
   * Start timing an operation with a unique ID
   */
  startTimer(id: string): void {
    if (!this.enabled) return;
    this.activeTimers.set(id, performance.now());
  }

  /**
   * End timing an operation and record the metric
   */
  endTimer(id: string, metadata: { operation: string; success: boolean; strategy?: string }): void {
    if (!this.enabled) return;
    
    const startTime = this.activeTimers.get(id);
    if (startTime === undefined) return;
    
    const duration = performance.now() - startTime;
    this.activeTimers.delete(id);
    
    this.recordMetric(metadata.operation, duration, metadata.success, undefined, metadata.strategy);
  }

  /**
   * Record a performance metric
   */
  recordMetric(operation: string, duration: number, success: boolean = true, error?: string, strategy?: string): void {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      duration,
      timestamp: Date.now(),
      operation,
      success,
      strategy,
      error
    };

    // Store metric
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const operationMetrics = this.metrics.get(operation)!;
    operationMetrics.push(metric);

    // Keep only recent metrics
    if (operationMetrics.length > this.maxMetricsPerOperation) {
      operationMetrics.shift();
    }

    // Check performance threshold
    const threshold = this.operationThresholds.get(operation);
    if (threshold && duration > threshold) {
      console.warn(`Performance warning: ${operation} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }

    // Log errors
    if (!success && error) {
      console.error(`Performance error in ${operation}:`, error);
    }
  }

  /**
   * Record an error for an operation
   */
  recordError(operation: string, error: Error | string): void {
    const errorMessage = error instanceof Error ? error.message : error;
    this.recordMetric(operation, 0, false, errorMessage);
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operation: string): PerformanceStats | null {
    const operationMetrics = this.metrics.get(operation);
    if (!operationMetrics || operationMetrics.length === 0) {
      return null;
    }

    const durations = operationMetrics.map(m => m.duration);
    const successfulMetrics = operationMetrics.filter(m => m.success);
    const errorRate = (operationMetrics.length - successfulMetrics.length) / operationMetrics.length;

    return {
      count: operationMetrics.length,
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      p95: this.percentile(durations, 0.95)
    };
  }

  /**
   * Get all performance statistics
   */
  getAllStats(): Record<string, PerformanceStats> {
    const allStats: Record<string, PerformanceStats> = {};

    for (const operation of this.metrics.keys()) {
      const stats = this.getStats(operation);
      if (stats) {
        allStats[operation] = stats;
      }
    }

    return allStats;
  }

  /**
   * Get comprehensive analytics data
   */
  getAnalytics(): AnalyticsData {
    const allStats = this.getAllStats();
    const totalOperations = Object.values(allStats).reduce((sum, stats) => sum + stats.count, 0);
    const totalErrors = Object.values(allStats).reduce((sum, stats) => {
      const operationMetrics = this.metrics.get(Object.keys(allStats).find(op => this.getStats(op) === stats) || '') || [];
      const errorCount = operationMetrics.filter(m => !m.success).length;
      return sum + errorCount;
    }, 0);

    // Calculate average response time across all operations
    const avgResponseTimes = Object.values(allStats).map(stats => stats.avg);
    const avgResponseTime = avgResponseTimes.length > 0 
      ? avgResponseTimes.reduce((a, b) => a + b, 0) / avgResponseTimes.length 
      : 0;

    // Calculate cache hit rate (placeholder - would be integrated with cache system)
    const cacheHitRate = this.calculateCacheHitRate();

    // Calculate error rate
    const errorRate = totalOperations > 0 ? totalErrors / totalOperations : 0;

    // Estimate memory usage
    const memoryUsage = this.estimateMemoryUsage();

    return {
      cacheHitRate,
      avgResponseTime,
      errorRate,
      activeUsers: 1, // Would be tracked across sessions
      bundleSize: this.estimateBundleSize(),
      memoryUsage,
      totalTranslations: this.getOperationCount('translation'),
      topTranslations: this.getTopTranslations()
    };
  }

  /**
   * Get operation count for a specific operation type
   */
  getOperationCount(operation: string): number {
    const operationMetrics = this.metrics.get(operation);
    return operationMetrics ? operationMetrics.length : 0;
  }

  /**
   * Get average response time for an operation
   */
  getAverageResponseTime(operation?: string): number {
    if (operation) {
      const stats = this.getStats(operation);
      return stats ? stats.avg : 0;
    }

    // Average across all operations
    const allStats = this.getAllStats();
    const avgTimes = Object.values(allStats).map(stats => stats.avg);
    return avgTimes.length > 0 ? avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length : 0;
  }

  /**
   * Get error rate for an operation
   */
  getErrorRate(operation?: string): number {
    if (operation) {
      const operationMetrics = this.metrics.get(operation);
      if (!operationMetrics || operationMetrics.length === 0) return 0;
      
      const errorCount = operationMetrics.filter(m => !m.success).length;
      return errorCount / operationMetrics.length;
    }

    // Error rate across all operations
    const allStats = this.getAllStats();
    let totalErrors = 0;
    let totalOperations = 0;

    for (const [opName, stats] of Object.entries(allStats)) {
      const operationMetrics = this.metrics.get(opName) || [];
      const errorCount = operationMetrics.filter(m => !m.success).length;
      totalErrors += errorCount;
      totalOperations += stats.count;
    }

    return totalOperations > 0 ? totalErrors / totalOperations : 0;
  }

  /**
   * Get cache hit rate (placeholder - would integrate with actual cache system)
   */
  getCacheHitRate(): number {
    // This would be integrated with the actual cache system
    // For now, return a reasonable default
    return 0.75;
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): number {
    return this.estimateMemoryUsage();
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Clear all performance metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.startTime = Date.now();
  }

  /**
   * Clear metrics for a specific operation
   */
  clearOperationMetrics(operation: string): void {
    this.metrics.delete(operation);
  }

  /**
   * Get uptime in milliseconds
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Export performance data for analysis
   */
  exportData(): {
    timestamp: number;
    uptime: number;
    metrics: Record<string, PerformanceMetric[]>;
    analytics: AnalyticsData;
  } {
    return {
      timestamp: Date.now(),
      uptime: this.getUptime(),
      metrics: Object.fromEntries(this.metrics),
      analytics: this.getAnalytics()
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeThresholds(): void {
    this.operationThresholds.set('transliteration', 10); // 10ms
    this.operationThresholds.set('translation', 2000); // 2s
    this.operationThresholds.set('cache_lookup', 1); // 1ms
    this.operationThresholds.set('dom_update', 16); // 60fps
    this.operationThresholds.set('plugin_init', 100); // 100ms
    this.operationThresholds.set('batch_translation', 5000); // 5s
  }

  private startCleanupInterval(): void {
    // Clean up old metrics every 5 minutes
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000);
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - 3600000; // Keep only last hour

    for (const [operation, metrics] of this.metrics) {
      const filteredMetrics = metrics.filter(metric => metric.timestamp > cutoffTime);
      this.metrics.set(operation, filteredMetrics);
    }
  }

  private percentile(values: number[], p: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateCacheHitRate(): number {
    // This would be integrated with the actual cache system
    // For now, simulate based on recent metrics
    const cacheMetrics = this.metrics.get('cache_lookup');
    if (!cacheMetrics || cacheMetrics.length === 0) return 0;

    const hitCount = cacheMetrics.filter(m => m.success).length;
    return hitCount / cacheMetrics.length;
  }

  private estimateMemoryUsage(): number {
    // Rough estimate based on stored metrics
    let totalSize = 0;
    
    for (const metrics of this.metrics.values()) {
      totalSize += metrics.length * 200; // Rough estimate per metric
    }

    return totalSize;
  }

  private estimateBundleSize(): number {
    // Would be calculated during build time
    // For now, return current estimate
    return 25000; // ~25KB
  }

  private getTopTranslations(): Array<{ text: string; count: number }> {
    // This would track actual translation requests
    // For now, return placeholder data
    return [
      { text: 'hello world', count: 10 },
      { text: 'good morning', count: 8 },
      { text: 'thank you', count: 6 }
    ];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { PerformanceMonitor as default };
