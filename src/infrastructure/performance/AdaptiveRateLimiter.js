// ============================================================================ 
// ADAPTIVE RATE LIMITER
// ============================================================================

/**
 * Adaptive Rate Limiter - Dynamic rate limiting based on system performance
 * Adjusts rate limits based on current load and response times
 */

import type { RateLimitResult } from '../../types.js';

export interface AdaptiveRateLimitConfig {
  baseLimit: number; // Base requests per minute
  maxLimit: number; // Maximum requests per minute
  minLimit: number; // Minimum requests per minute
  responseTimeThreshold: number; // Response time threshold in ms
  errorRateThreshold: number; // Error rate threshold (0-1)
  adjustmentFactor: number; // How much to adjust limits
  windowSize: number; // Time window for rate limiting in ms
}

export interface RateLimitMetrics {
  requestsInWindow: number;
  windowStartTime: number;
  averageResponseTime: number;
  errorRate: number;
  currentLimit: number;
  adjustmentHistory: Array<{
    timestamp: number;
    oldLimit: number;
    newLimit: number;
    reason: string;
  }>;
}

/**
 * Adaptive Rate Limiter that adjusts limits based on performance
 */
export class AdaptiveRateLimiter {
  private config: AdaptiveRateLimitConfig;
  private metrics: RateLimitMetrics;
  private requestHistory: Array<{
    timestamp: number;
    responseTime: number;
    success: boolean;
  }> = [];

  constructor(config: Partial<AdaptiveRateLimitConfig> = {}) {
    this.config = {
      baseLimit: 60, // 60 requests per minute
      maxLimit: 300, // 300 requests per minute
      minLimit: 10, // 10 requests per minute
      responseTimeThreshold: 1000, // 1 second
      errorRateThreshold: 0.05, // 5% error rate
      adjustmentFactor: 0.2, // 20% adjustment
      windowSize: 60000, // 1 minute
      ...config
    };

    this.metrics = {
      requestsInWindow: 0,
      windowStartTime: Date.now(),
      averageResponseTime: 0,
      errorRate: 0,
      currentLimit: this.config.baseLimit,
      adjustmentHistory: []
    };
  }

  /**
   * Check if a request should be allowed
   */
  async checkLimit(): Promise<RateLimitResult> {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.metrics.windowStartTime >= this.config.windowSize) {
      this.resetWindow();
    }

    // Check if we're over the limit
    const allowed = this.metrics.requestsInWindow < this.metrics.currentLimit;

    // Update metrics
    this.metrics.requestsInWindow++;

    return {
      allowed,
      limit: this.metrics.currentLimit,
      remaining: Math.max(0, this.metrics.currentLimit - this.metrics.requestsInWindow),
      resetTime: this.metrics.windowStartTime + this.config.windowSize,
      retryAfter: allowed ? 0 : this.config.windowSize - (now - this.metrics.windowStartTime)
    };
  }

  /**
   * Record a request completion for adaptive adjustment
   */
  recordRequest(responseTime: number, success: boolean): void {
    const now = Date.now();
    
    // Add to history
    this.requestHistory.push({
      timestamp: now,
      responseTime,
      success
    });

    // Keep only recent history (last 10 minutes)
    const tenMinutesAgo = now - 10 * 60 * 1000;
    this.requestHistory = this.requestHistory.filter(req => req.timestamp > tenMinutesAgo);

    // Update metrics
    this.updateMetrics();

    // Check if we need to adjust limits
    this.adjustLimitsIfNeeded();
  }

  /**
   * Get current rate limit metrics
   */
  getMetrics(): RateLimitMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current configuration
   */
  getConfig(): AdaptiveRateLimitConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AdaptiveRateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.metrics = {
      requestsInWindow: 0,
      windowStartTime: Date.now(),
      averageResponseTime: 0,
      errorRate: 0,
      currentLimit: this.config.baseLimit,
      adjustmentHistory: []
    };
    this.requestHistory = [];
  }

  /**
   * Reset the time window
   */
  private resetWindow(): void {
    this.metrics.requestsInWindow = 0;
    this.metrics.windowStartTime = Date.now();
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    if (this.requestHistory.length === 0) return;

    // Calculate average response time
    const totalResponseTime = this.requestHistory.reduce((sum, req) => sum + req.responseTime, 0);
    this.metrics.averageResponseTime = totalResponseTime / this.requestHistory.length;

    // Calculate error rate
    const errors = this.requestHistory.filter(req => !req.success).length;
    this.metrics.errorRate = errors / this.requestHistory.length;
  }

  /**
   * Adjust limits based on performance metrics
   */
  private adjustLimitsIfNeeded(): void {
    const oldLimit = this.metrics.currentLimit;
    let newLimit = oldLimit;
    let reason = '';

    // Check response time
    if (this.metrics.averageResponseTime > this.config.responseTimeThreshold) {
      // Response time is too high, reduce limit
      newLimit = Math.max(
        this.config.minLimit,
        Math.floor(oldLimit * (1 - this.config.adjustmentFactor))
      );
      reason = 'High response time detected';
    }
    // Check error rate
    else if (this.metrics.errorRate > this.config.errorRateThreshold) {
      // Error rate is too high, reduce limit
      newLimit = Math.max(
        this.config.minLimit,
        Math.floor(oldLimit * (1 - this.config.adjustmentFactor))
      );
      reason = 'High error rate detected';
    }
    // Check if we can increase limit
    else if (this.metrics.averageResponseTime < this.config.responseTimeThreshold * 0.5 &&
               this.metrics.errorRate < this.config.errorRateThreshold * 0.5) {
      // Performance is good, increase limit
      newLimit = Math.min(
        this.config.maxLimit,
        Math.floor(oldLimit * (1 + this.config.adjustmentFactor))
      );
      reason = 'Good performance detected';
    }

    // Apply change if needed
    if (newLimit !== oldLimit) {
      this.metrics.currentLimit = newLimit;
      this.metrics.adjustmentHistory.push({
        timestamp: Date.now(),
        oldLimit,
        newLimit,
        reason
      });

      // Keep only recent adjustment history
      if (this.metrics.adjustmentHistory.length > 100) {
        this.metrics.adjustmentHistory = this.metrics.adjustmentHistory.slice(-50);
      }
    }
  }

  /**
   * Get adjustment history
   */
  getAdjustmentHistory(): Array<{
    timestamp: number;
    oldLimit: number;
    newLimit: number;
    reason: string;
  }> {
    return [...this.metrics.adjustmentHistory];
  }

  /**
   * Get request history
   */
  getRequestHistory(): Array<{
    timestamp: number;
    responseTime: number;
    success: boolean;
  }> {
    return [...this.requestHistory];
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
    currentLimit: number;
    efficiency: number; // requests / limit
  } {
    const now = Date.now();
    const recentHistory = this.requestHistory.filter(req => now - req.timestamp < 60000); // Last minute
    
    return {
      averageResponseTime: this.metrics.averageResponseTime,
      errorRate: this.metrics.errorRate,
      requestsPerMinute: recentHistory.length,
      currentLimit: this.metrics.currentLimit,
      efficiency: this.metrics.currentLimit > 0 ? recentHistory.length / this.metrics.currentLimit : 0
    };
  }
}

export default AdaptiveRateLimiter;
