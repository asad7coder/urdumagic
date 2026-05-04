// ============================================================================
// RATE LIMITER
// Client-side rate limiting and abuse protection
// ============================================================================

import type { RateLimitResult } from '../../types.js';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  strategy: 'queue' | 'reject' | 'throttle';
  maxQueueSize?: number;
  throttleDelay?: number;
}

/**
 * Rate limiter for preventing API abuse
 * - Per-user rate limiting
 * - Request queuing or rejection
 * - Lightweight client-side implementation
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private requests: number[] = []; // Timestamps of requests
  private queue: Array<() => void> = [];
  private userId: string;
  private stats = {
    totalRequests: 0,
    rejectedRequests: 0,
    queuedRequests: 0,
    averageWaitTime: 0
  };

  constructor(
    userId: string = 'anonymous',
    config: Partial<RateLimitConfig> = {}
  ) {
    this.userId = userId;

    // Default configuration for UrduMagic
    this.config = {
      maxRequests: 60, // 60 requests per minute
      windowMs: 60000, // 1 minute window
      strategy: 'queue', // Queue excess requests
      maxQueueSize: 100, // Max 100 queued requests
      throttleDelay: 1000, // 1 second delay for throttling
      ...config
    };

    // Clean up old requests periodically
    this.startCleanup();
  }

  /**
   * Check if request is allowed and handle rate limiting
   */
  async checkLimit(): Promise<RateLimitResult> {
    const now = Date.now();

    // Clean up old requests
    this.cleanup(now);

    // Check if under limit
    if (this.requests.length < this.config.maxRequests) {
      this.requests.push(now);
      this.stats.totalRequests++;

      return {
        allowed: true,
        retryAfter: 0,
        reason: 'ok'
      };
    }

    // Over limit - handle based on strategy
    return this.handleOverLimit(now);
  }

  /**
   * Execute a rate-limited function
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const result = await this.checkLimit();

    if (!result.allowed) {
      if (this.config.strategy === 'reject') {
        throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter}ms`);
      } else if (this.config.strategy === 'queue') {
        await this.waitForSlot();
      } else if (this.config.strategy === 'throttle') {
        await this.throttle();
      }
    }

    // Execute the function
    return await fn();
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    remaining: number;
    resetTime: number;
    totalRequests: number;
    rejectedRequests: number;
    queuedRequests: number;
    averageWaitTime: number;
  } {
    const now = Date.now();
    this.cleanup(now);

    return {
      remaining: Math.max(0, this.config.maxRequests - this.requests.length),
      resetTime: this.getResetTime(now),
      totalRequests: this.stats.totalRequests,
      rejectedRequests: this.stats.rejectedRequests,
      queuedRequests: this.stats.queuedRequests,
      averageWaitTime: this.stats.averageWaitTime
    };
  }

  /**
   * Reset rate limiter
   */
  reset(): void {
    this.requests = [];
    this.queue = [];
    this.stats = {
      totalRequests: 0,
      rejectedRequests: 0,
      queuedRequests: 0,
      averageWaitTime: 0
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private handleOverLimit(now: number): RateLimitResult {
    switch (this.config.strategy) {
      case 'reject':
        this.stats.rejectedRequests++;
        return {
          allowed: false,
          retryAfter: this.getRetryAfter(now),
          reason: 'user_limit'
        };

      case 'queue':
        if (this.queue.length >= (this.config.maxQueueSize || 100)) {
          this.stats.rejectedRequests++;
          return {
            allowed: false,
            retryAfter: this.getRetryAfter(now),
            reason: 'user_limit'
          };
        }
        this.stats.queuedRequests++;
        return {
          allowed: false,
          retryAfter: this.getRetryAfter(now),
          reason: 'user_limit'
        };

      case 'throttle':
        return {
          allowed: true, // Allow but will be throttled
          retryAfter: this.config.throttleDelay || 1000,
          reason: 'ok'
        };

      default:
        return {
          allowed: false,
          retryAfter: this.getRetryAfter(now),
          reason: 'user_limit'
        };
    }
  }

  private async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve);

      // Process queue
      this.processQueue();
    });
  }

  private async throttle(): Promise<void> {
    const delay = this.config.throttleDelay || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;

    const now = Date.now();
    this.cleanup(now);

    // Check if we can process more requests
    while (this.queue.length > 0 && this.requests.length < this.config.maxRequests) {
      const resolve = this.queue.shift();
      if (resolve) {
        this.requests.push(now);
        this.stats.totalRequests++;
        resolve();
      }
    }
  }

  private cleanup(now: number): void {
    const cutoff = now - this.config.windowMs;
    this.requests = this.requests.filter(timestamp => timestamp > cutoff);
  }

  private getRetryAfter(now: number): number {
    if (this.requests.length === 0) return 0;

    const oldestRequest = this.requests[0];
    const resetTime = oldestRequest + this.config.windowMs;
    return Math.max(0, resetTime - now);
  }

  private getResetTime(now: number): number {
    if (this.requests.length === 0) return now;

    const oldestRequest = this.requests[0];
    return oldestRequest + this.config.windowMs;
  }

  private startCleanup(): void {
    // Clean up every minute
    setInterval(() => {
      this.cleanup(Date.now());
    }, 60000);
  }
}

/**
 * Global rate limiter for all users
 */
export class GlobalRateLimiter extends RateLimiter {
  constructor(config?: Partial<RateLimitConfig>) {
    super('global', {
      maxRequests: 1000, // Higher limit for global
      windowMs: 60000,
      strategy: 'reject',
      ...config
    });
  }

  async checkLimit(): Promise<RateLimitResult> {
    const result = await super.checkLimit();

    if (!result.allowed) {
      return {
        ...result,
        reason: 'global_limit'
      };
    }

    return result;
  }
}

/**
 * Rate limiter factory
 */
export class RateLimiterFactory {
  private static userLimiters = new Map<string, RateLimiter>();
  private static globalLimiter = new GlobalRateLimiter();

  /**
   * Get or create user rate limiter
   */
  static getUserLimiter(userId: string = 'anonymous'): RateLimiter {
    if (!this.userLimiters.has(userId)) {
      this.userLimiters.set(userId, new RateLimiter(userId));
    }

    return this.userLimiters.get(userId)!;
  }

  /**
   * Get global rate limiter
   */
  static getGlobalLimiter(): GlobalRateLimiter {
    return this.globalLimiter;
  }

  /**
   * Check both user and global limits
   */
  static async checkLimits(userId: string = 'anonymous'): Promise<RateLimitResult> {
    const userLimiter = this.getUserLimiter(userId);
    const globalLimiter = this.getGlobalLimiter();

    // Check user limit first
    const userResult = await userLimiter.checkLimit();
    if (!userResult.allowed) {
      return userResult;
    }

    // Check global limit
    const globalResult = await globalLimiter.checkLimit();
    if (!globalResult.allowed) {
      return globalResult;
    }

    return {
      allowed: true,
      retryAfter: 0,
      reason: 'ok'
    };
  }

  /**
   * Execute function with both rate limits
   */
  static async executeWithLimits<T>(
    userId: string = 'anonymous',
    fn: () => Promise<T>
  ): Promise<T> {
    const userLimiter = this.getUserLimiter(userId);
    const globalLimiter = this.getGlobalLimiter();

    // Check user limit
    await userLimiter.checkLimit();

    // Check global limit
    await globalLimiter.checkLimit();

    // Execute function
    return await fn();
  }

  /**
   * Reset all limiters
   */
  static resetAll(): void {
    this.userLimiters.forEach(limiter => limiter.reset());
    this.globalLimiter.reset();
    this.userLimiters.clear();
  }

  /**
   * Get statistics for all limiters
   */
  static getStats(): {
    global: any;
    users: Record<string, any>;
  } {
    const userStats: Record<string, any> = {};

    for (const [userId, limiter] of this.userLimiters) {
      userStats[userId] = limiter.getStatus();
    }

    return {
      global: this.globalLimiter.getStatus(),
      users: userStats
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// All exports are already declared with 'export' keyword above
