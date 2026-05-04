// ============================================================================
// PRACTICAL RATE LIMITING
// Session-based and instance-based limiting for real-world usage
// ============================================================================

import type { RateLimitResult } from '../types.js';

/**
 * Simple rate limit configuration
 */
export interface SimpleRateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
  strategy?: 'queue' | 'reject' | 'throttle';
}

/**
 * Session-based rate limiter
 * - Uses browser session storage for persistence
 * - Per-tab isolation
 * - Simple and practical
 */
export class SessionRateLimiter {
  private config: SimpleRateLimitConfig;
  private storageKey: string;
  private instanceId: string;

  constructor(config: SimpleRateLimitConfig = {}) {
    this.config = {
      maxRequests: 100, // 100 requests per session
      windowMs: 3600000, // 1 hour window
      strategy: 'queue',
      ...config
    };

    // Generate unique instance ID
    this.instanceId = this.generateInstanceId();
    this.storageKey = `urdumagic-rate-limit-${this.instanceId}`;
  }

  /**
   * Check rate limit
   */
  async checkLimit(): Promise<RateLimitResult> {
    const now = Date.now();
    const sessionData = this.getSessionData();
    
    // Clean up old requests
    this.cleanupSessionData(sessionData, now);
    
    // Check if under limit
    if (sessionData.requests.length < this.config.maxRequests!) {
      sessionData.requests.push(now);
      this.saveSessionData(sessionData);
      
      return {
        allowed: true,
        retryAfter: 0,
        reason: 'ok'
      };
    }

    // Over limit - handle based on strategy
    return this.handleOverLimit(sessionData, now);
  }

  /**
   * Execute function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const result = await this.checkLimit();
    
    if (!result.allowed) {
      if (this.config.strategy === 'reject') {
        throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter}ms`);
      } else if (this.config.strategy === 'queue') {
        await this.wait(result.retryAfter);
      } else if (this.config.strategy === 'throttle') {
        await this.wait(1000); // 1 second throttle
      }
    }

    return await fn();
  }

  /**
   * Get current status
   */
  getStatus(): {
    remaining: number;
    resetTime: number;
    totalRequests: number;
  } {
    const sessionData = this.getSessionData();
    const now = Date.now();
    this.cleanupSessionData(sessionData, now);
    
    return {
      remaining: Math.max(0, this.config.maxRequests! - sessionData.requests.length),
      resetTime: this.getResetTime(sessionData, now),
      totalRequests: sessionData.requests.length
    };
  }

  /**
   * Reset rate limit
   */
  reset(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.storageKey);
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private generateInstanceId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private getSessionData(): { requests: number[]; created: number } {
    if (typeof sessionStorage === 'undefined') {
      return { requests: [], created: Date.now() };
    }

    try {
      const data = sessionStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      // Session storage not available or corrupted
    }

    return { requests: [], created: Date.now() };
  }

  private saveSessionData(data: { requests: number[]; created: number }): void {
    if (typeof sessionStorage === 'undefined') return;

    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      // Session storage full or not available
      console.warn('Failed to save rate limit data:', error);
    }
  }

  private cleanupSessionData(data: { requests: number[]; created: number }, now: number): void {
    const cutoff = now - this.config.windowMs!;
    data.requests = data.requests.filter(timestamp => timestamp > cutoff);
  }

  private handleOverLimit(sessionData: { requests: number[]; created: number }, now: number): RateLimitResult {
    const retryAfter = this.getRetryAfter(sessionData, now);
    
    switch (this.config.strategy) {
      case 'reject':
        return {
          allowed: false,
          retryAfter,
          reason: 'user_limit'
        };
        
      case 'queue':
      case 'throttle':
        return {
          allowed: true, // Allow but will be delayed
          retryAfter,
          reason: 'ok'
        };
        
      default:
        return {
          allowed: false,
          retryAfter,
          reason: 'user_limit'
        };
    }
  }

  private getRetryAfter(sessionData: { requests: number[]; created: number }, now: number): number {
    if (sessionData.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...sessionData.requests);
    const resetTime = oldestRequest + this.config.windowMs!;
    return Math.max(0, resetTime - now);
  }

  private getResetTime(sessionData: { requests: number[]; created: number }, now: number): number {
    if (sessionData.requests.length === 0) return now;
    
    const oldestRequest = Math.min(...sessionData.requests);
    return oldestRequest + this.config.windowMs!;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Instance-based rate limiter (in-memory only)
 */
export class InstanceRateLimiter {
  private config: SimpleRateLimitConfig;
  private requests: number[] = [];
  private startTime: number;

  constructor(config: SimpleRateLimitConfig = {}) {
    this.config = {
      maxRequests: 60, // 60 requests per instance
      windowMs: 60000, // 1 minute window
      strategy: 'queue',
      ...config
    };

    this.startTime = Date.now();
  }

  /**
   * Check rate limit
   */
  async checkLimit(): Promise<RateLimitResult> {
    const now = Date.now();
    
    // Clean up old requests
    this.cleanup(now);
    
    // Check if under limit
    if (this.requests.length < this.config.maxRequests!) {
      this.requests.push(now);
      
      return {
        allowed: true,
        retryAfter: 0,
        reason: 'ok'
      };
    }

    // Over limit
    const retryAfter = this.getRetryAfter(now);
    
    return {
      allowed: false,
      retryAfter,
      reason: 'user_limit'
    };
  }

  /**
   * Execute function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const result = await this.checkLimit();
    
    if (!result.allowed) {
      await this.wait(result.retryAfter);
    }

    return await fn();
  }

  /**
   * Get status
   */
  getStatus(): {
    remaining: number;
    resetTime: number;
    totalRequests: number;
  } {
    const now = Date.now();
    this.cleanup(now);
    
    return {
      remaining: Math.max(0, this.config.maxRequests! - this.requests.length),
      resetTime: this.getResetTime(now),
      totalRequests: this.requests.length
    };
  }

  /**
   * Reset
   */
  reset(): void {
    this.requests = [];
    this.startTime = Date.now();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private cleanup(now: number): void {
    const cutoff = now - this.config.windowMs!;
    this.requests = this.requests.filter(timestamp => timestamp > cutoff);
  }

  private getRetryAfter(now: number): number {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const resetTime = oldestRequest + this.config.windowMs!;
    return Math.max(0, resetTime - now);
  }

  private getResetTime(now: number): number {
    if (this.requests.length === 0) return now;
    
    const oldestRequest = Math.min(...this.requests);
    return oldestRequest + this.config.windowMs!;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Practical rate limiter factory
 * - Chooses best strategy based on environment
 * - Simple API for common use cases
 */
export class PracticalRateLimiter {
  private static sessionLimiter: SessionRateLimiter | null = null;
  private static instanceLimiter: InstanceRateLimiter | null = null;

  /**
   * Get session-based limiter (persists across page reloads)
   */
  static getSessionLimiter(config?: SimpleRateLimitConfig): SessionRateLimiter {
    if (!this.sessionLimiter) {
      this.sessionLimiter = new SessionRateLimiter(config);
    }
    return this.sessionLimiter;
  }

  /**
   * Get instance-based limiter (in-memory only)
   */
  static getInstanceLimiter(config?: SimpleRateLimitConfig): InstanceRateLimiter {
    if (!this.instanceLimiter) {
      this.instanceLimiter = new InstanceRateLimiter(config);
    }
    return this.instanceLimiter;
  }

  /**
   * Auto-choose best limiter for current environment
   */
  static getBestLimiter(config?: SimpleRateLimitConfig): SessionRateLimiter | InstanceRateLimiter {
    // Use session limiter if available (browser environment)
    if (typeof sessionStorage !== 'undefined') {
      return this.getSessionLimiter(config);
    }
    
    // Fall back to instance limiter
    return this.getInstanceLimiter(config);
  }

  /**
   * Quick rate limit check
   */
  static async checkLimit(config?: SimpleRateLimitConfig): Promise<RateLimitResult> {
    const limiter = this.getBestLimiter(config);
    return await limiter.checkLimit();
  }

  /**
   * Execute with rate limiting
   */
  static async execute<T>(fn: () => Promise<T>, config?: SimpleRateLimitConfig): Promise<T> {
    const limiter = this.getBestLimiter(config);
    return await limiter.execute(fn);
  }

  /**
   * Get status
   */
  static getStatus(config?: SimpleRateLimitConfig): any {
    const limiter = this.getBestLimiter(config);
    return limiter.getStatus();
  }

  /**
   * Reset all limiters
   */
  static reset(): void {
    this.sessionLimiter?.reset();
    this.instanceLimiter?.reset();
    this.sessionLimiter = null;
    this.instanceLimiter = null;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick rate limiting for common use cases
 */
export const rateLimit = {
  /**
   * Check if request is allowed
   */
  check: (config?: SimpleRateLimitConfig) => PracticalRateLimiter.checkLimit(config),
  
  /**
   * Execute function with rate limiting
   */
  execute: <T>(fn: () => Promise<T>, config?: SimpleRateLimitConfig) => 
    PracticalRateLimiter.execute(fn, config),
  
  /**
   * Get current status
   */
  status: (config?: SimpleRateLimitConfig) => PracticalRateLimiter.getStatus(config),
  
  /**
   * Reset rate limiting
   */
  reset: () => PracticalRateLimiter.reset()
};

// ============================================================================
// EXPORTS
// ============================================================================

export { SessionRateLimiter, InstanceRateLimiter, PracticalRateLimiter, rateLimit };
export default PracticalRateLimiter;
