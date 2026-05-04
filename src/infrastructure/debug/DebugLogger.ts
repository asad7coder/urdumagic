// ============================================================================
// DEBUG LOGGER
// Structured logging system for UrduMagic
// ============================================================================

import type { UrduMagicConfig } from '../../config/DefaultConfig.js';

/**
 * Log levels in order of severity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
  id: string;
}

/**
 * Debug logger configuration
 */
export interface DebugConfig {
  enabled: boolean;
  level: LogLevel;
  maxEntries: number;
  categories: string[];
  outputToConsole: boolean;
  persistToStorage: boolean;
  storageKey: string;
}

/**
 * Structured debug logger for UrduMagic
 * - Category-based filtering
 * - Performance tracking
 * - Error aggregation
 * - Storage persistence
 */
export class DebugLogger {
  private config: DebugConfig;
  private logs: LogEntry[] = [];
  private counters: Map<string, number> = new Map();
  private timers: Map<string, number> = new Map();
  private errorCounts: Map<string, number> = new Map();

  constructor(config: Partial<DebugConfig> = {}) {
    this.config = {
      enabled: false,
      level: 'error', // Only errors by default
      maxEntries: 1000,
      categories: ['all'],
      outputToConsole: true,
      persistToStorage: false,
      storageKey: 'urdumagic-debug-logs',
      ...config
    };

    // Load existing logs from storage
    if (this.config.persistToStorage) {
      this.loadFromStorage();
    }
  }

  /**
   * Log a debug message
   */
  debug(category: string, message: string, data?: any): void {
    this.log('debug', category, message, data);
  }

  /**
   * Log an info message
   */
  info(category: string, message: string, data?: any): void {
    this.log('info', category, message, data);
  }

  /**
   * Log a warning
   */
  warn(category: string, message: string, data?: any): void {
    this.log('warn', category, message, data);
  }

  /**
   * Log an error
   */
  error(category: string, message: string, error?: Error | any): void {
    const data = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;

    this.log('error', category, message, data);
    
    // Track error counts
    const key = `${category}:${message}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }

  /**
   * Log a message with level and category
   */
  private log(level: LogLevel, category: string, message: string, data?: any): void {
    if (!this.shouldLog(level, category)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      id: this.generateId()
    };

    // Add to memory
    this.logs.push(entry);
    
    // Trim if too many entries
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    // Output to console
    if (this.config.outputToConsole) {
      this.outputToConsole(entry);
    }

    // Persist to storage
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Start a performance timer
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End a performance timer and log the duration
   */
  endTimer(name: string, category: string = 'performance'): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      this.warn(category, `Timer '${name}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    this.info(category, `Timer '${name}' completed`, { duration: `${duration.toFixed(2)}ms` });
    
    return duration;
  }

  /**
   * Increment a counter
   */
  increment(category: string, counter: string, value: number = 1): void {
    const key = `${category}:${counter}`;
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  /**
   * Get counter value
   */
  getCount(category: string, counter: string): number {
    const key = `${category}:${counter}`;
    return this.counters.get(key) || 0;
  }

  /**
   * Get logs with filtering
   */
  getLogs(filter?: {
    level?: LogLevel;
    category?: string;
    since?: number;
    limit?: number;
  }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      const levelOrder = { debug: 0, info: 1, warn: 2, error: 3 };
      const minLevel = levelOrder[filter.level];
      filtered = filtered.filter(log => levelOrder[log.level] >= minLevel);
    }

    if (filter?.category) {
      filtered = filtered.filter(log => log.category === filter.category);
    }

    if (filter?.since) {
      filtered = filtered.filter(log => log.timestamp >= filter.since);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered.reverse(); // Most recent first
  }

  /**
   * Get error summary
   */
  getErrorSummary(): Array<{
    key: string;
    count: number;
    lastOccurrence: number;
    sample: LogEntry;
  }> {
    const summary: Array<{
      key: string;
      count: number;
      lastOccurrence: number;
      sample: LogEntry;
    }> = [];

    for (const [key, count] of this.errorCounts) {
      const [category, message] = key.split(':');
      const sample = this.logs.find(log => 
        log.category === category && log.message === message && log.level === 'error'
      );
      
      if (sample) {
        summary.push({
          key,
          count,
          lastOccurrence: sample.timestamp,
          sample
        });
      }
    }

    return summary.sort((a, b) => b.count - a.count);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalOperations: number;
    averageResponseTime: number;
    slowestOperations: Array<{
      category: string;
      duration: number;
      timestamp: number;
    }>;
  } {
    const perfLogs = this.logs.filter(log => 
      log.category === 'performance' && 
      log.data?.duration
    );

    const totalOperations = perfLogs.length;
    const totalDuration = perfLogs.reduce((sum, log) => 
      sum + parseFloat(log.data.duration), 0
    );
    const averageResponseTime = totalOperations > 0 ? totalDuration / totalOperations : 0;

    const slowestOperations = perfLogs
      .map(log => ({
        category: log.message,
        duration: parseFloat(log.data.duration),
        timestamp: log.timestamp
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalOperations,
      averageResponseTime,
      slowestOperations
    };
  }

  /**
   * Export logs for analysis
   */
  exportLogs(): string {
    return JSON.stringify({
      version: '1.0.0',
      timestamp: Date.now(),
      config: this.config,
      logs: this.logs,
      counters: Object.fromEntries(this.counters),
      errorCounts: Object.fromEntries(this.errorCounts)
    }, null, 2);
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    this.counters.clear();
    this.timers.clear();
    this.errorCounts.clear();
    
    if (this.config.persistToStorage) {
      localStorage.removeItem(this.config.storageKey);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if should log based on level and category
   */
  private shouldLog(level: LogLevel, category: string): boolean {
    if (!this.config.enabled) return false;

    // Check level
    const levelOrder = { debug: 0, info: 1, warn: 2, error: 3 };
    const minLevel = levelOrder[this.config.level];
    const currentLevel = levelOrder[level];
    
    if (currentLevel < minLevel) return false;

    // Check categories
    if (!this.config.categories.includes('all') && 
        !this.config.categories.includes(category)) {
      return false;
    }

    return true;
  }

  /**
   * Output to console with formatting
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.data);
        break;
      case 'info':
        console.info(prefix, entry.message, entry.data);
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.data);
        break;
      case 'error':
        console.error(prefix, entry.message, entry.data);
        break;
    }
  }

  /**
   * Generate unique ID for log entries
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Save logs to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        logs: this.logs.slice(-100), // Save only last 100 entries
        counters: Object.fromEntries(this.counters),
        errorCounts: Object.fromEntries(this.errorCounts)
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save debug logs to storage:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.config.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.logs = parsed.logs || [];
        this.counters = new Map(Object.entries(parsed.counters || {}));
        this.errorCounts = new Map(Object.entries(parsed.errorCounts || {}));
      }
    } catch (error) {
      console.warn('Failed to load debug logs from storage:', error);
    }
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create debug logger from UrduMagic config
 */
export function createDebugLogger(config: UrduMagicConfig): DebugLogger {
  return new DebugLogger({
    enabled: config.monitoring?.enabled || false,
    level: config.monitoring?.logLevel || 'error',
    categories: ['translation', 'strategy', 'cache', 'magic-mode', 'performance'],
    outputToConsole: true,
    persistToStorage: false
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export { DebugLogger as default };
