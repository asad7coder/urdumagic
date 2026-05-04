// ============================================================================
// EVENT EMITTER
// Type-safe event system for UrduMagic
// ============================================================================

/**
 * Event listener function type
 */
type EventListener<T = any> = (data: T) => void;

/**
 * Event listener with metadata
 */
interface EventListenerMetadata<T = any> {
  listener: EventListener<T>;
  once: boolean;
  priority: number;
  id: string;
}

/**
 * Type-safe event emitter for UrduMagic
 * Supports prioritized listeners, once events, and wildcard patterns
 */
export class EventEmitter {
  private listeners: Map<string, EventListenerMetadata[]> = new Map();
  private wildcardListeners: EventListenerMetadata[] = [];
  private maxListeners: number = 100;
  private enabled: boolean = true;
  private eventHistory: Array<{ event: string; data: any; timestamp: number }> = [];
  private maxHistorySize: number = 1000;

  /**
   * Add event listener
   */
  on<T = any>(event: string, listener: EventListener<T>, options: {
    once?: boolean;
    priority?: number;
  } = {}): () => void {
    if (!this.enabled) return () => {};

    const metadata: EventListenerMetadata<T> = {
      listener,
      once: options.once || false,
      priority: options.priority || 0,
      id: this.generateListenerId()
    };

    // Handle wildcard events
    if (event.includes('*')) {
      this.wildcardListeners.push(metadata);
      this.sortListeners(this.wildcardListeners);
      return () => this.removeListener(event, metadata.id);
    }

    // Handle specific events
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const eventListeners = this.listeners.get(event)!;
    eventListeners.push(metadata);
    this.sortListeners(eventListeners);

    // Check max listeners warning
    if (eventListeners.length > this.maxListeners) {
      console.warn(`EventEmitter: Possible memory leak detected. ${eventListeners.length} listeners added for event '${event}'`);
    }

    return () => this.removeListener(event, metadata.id);
  }

  /**
   * Add one-time event listener
   */
  once<T = any>(event: string, listener: EventListener<T>): () => void {
    return this.on(event, listener, { once: true });
  }

  /**
   * Add prioritized event listener
   */
  prioritize<T = any>(event: string, listener: EventListener<T>, priority: number): () => void {
    return this.on(event, listener, { priority });
  }

  /**
   * Emit event to all listeners
   */
  emit<T = any>(event: string, data?: T): void {
    if (!this.enabled) return;

    // Add to history
    this.addToHistory(event, data);

    // Emit to specific event listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const listenersToRemove: string[] = [];
      
      for (const metadata of eventListeners) {
        try {
          metadata.listener(data);
          
          if (metadata.once) {
            listenersToRemove.push(metadata.id);
          }
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      }

      // Remove once listeners
      listenersToRemove.forEach(id => this.removeListener(event, id));
    }

    // Emit to wildcard listeners
    this.wildcardListeners.forEach(metadata => {
      try {
        if (this.matchesWildcard(event, metadata.listener.toString())) {
          metadata.listener({ event, data });
          
          if (metadata.once) {
            this.removeListener('*', metadata.id);
          }
        }
      } catch (error) {
        console.error(`Error in wildcard event listener:`, error);
      }
    });
  }

  /**
   * Remove event listener
   */
  removeListener(event: string, listenerId: string): void {
    // Remove from specific event listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.findIndex(l => l.id === listenerId);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }

    // Remove from wildcard listeners
    const wildcardIndex = this.wildcardListeners.findIndex(l => l.id === listenerId);
    if (wildcardIndex !== -1) {
      this.wildcardListeners.splice(wildcardIndex, 1);
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
      this.wildcardListeners = [];
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event?: string): number {
    if (event) {
      const eventListeners = this.listeners.get(event);
      return eventListeners ? eventListeners.length : 0;
    }

    // Count all listeners
    let total = this.wildcardListeners.length;
    for (const eventListeners of this.listeners.values()) {
      total += eventListeners.length;
    }
    return total;
  }

  /**
   * Get all event names
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Set maximum listeners before warning
   */
  setMaxListeners(max: number): void {
    this.maxListeners = max;
  }

  /**
   * Enable/disable event emitter
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get event history
   */
  getEventHistory(): Array<{ event: string; data: any; timestamp: number }> {
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Wait for an event to be emitted
   */
  waitFor<T = any>(event: string, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      let timeoutId: number | undefined;

      const cleanup = this.once(event, (data: T) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(data);
      });

      if (timeout) {
        timeoutId = window.setTimeout(() => {
          cleanup();
          reject(new Error(`Timeout waiting for event '${event}'`));
        }, timeout);
      }
    });
  }

  /**
   * Create a sub-emitter for namespaced events
   */
  namespace(namespace: string): EventEmitter {
    const subEmitter = new EventEmitter();
    
    // Forward events to parent with namespace prefix
    this.on('*', (data) => {
      subEmitter.emit(`${namespace}:${data.event}`, data.data);
    });

    // Forward events from sub-emitter to parent
    subEmitter.on('*', (data) => {
      this.emit(`${namespace}:${data.event}`, data.data);
    });

    return subEmitter;
  }

  /**
   * Pipe events from another emitter
   */
  pipe(from: EventEmitter, eventMap?: Record<string, string>): void {
    from.on('*', (data) => {
      const targetEvent = eventMap?.[data.event] || data.event;
      this.emit(targetEvent, data.data);
    });
  }

  /**
   * Get emitter statistics
   */
  getStats(): {
    totalListeners: number;
    eventCount: number;
    historySize: number;
    enabled: boolean;
    maxListeners: number;
  } {
    return {
      totalListeners: this.listenerCount(),
      eventCount: this.listeners.size,
      historySize: this.eventHistory.length,
      enabled: this.enabled,
      maxListeners: this.maxListeners
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private sortListeners(listeners: EventListenerMetadata[]): void {
    listeners.sort((a, b) => b.priority - a.priority);
  }

  private matchesWildcard(event: string, pattern: string): boolean {
    // Simple wildcard matching - can be enhanced
    if (pattern === '*') return true;
    
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(event);
    }
    
    return false;
  }

  private generateListenerId(): string {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToHistory(event: string, data: any): void {
    this.eventHistory.push({
      event,
      data,
      timestamp: Date.now()
    });

    // Keep history size in check
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

// ============================================================================
// SPECIALIZED EVENT EMITTERS
// ============================================================================

/**
 * Translation-specific event emitter
 */
export class TranslationEventEmitter extends EventEmitter {
  /**
   * Emit translation start event
   */
  emitTranslationStart(text: string, targetLang: string): void {
    this.emit('translation:start', { text, targetLang, timestamp: Date.now() });
  }

  /**
   * Emit translation complete event
   */
  emitTranslationComplete(original: string, translated: string, targetLang: string): void {
    this.emit('translation:complete', { original, translated, targetLang, timestamp: Date.now() });
  }

  /**
   * Emit translation error event
   */
  emitTranslationError(error: Error, context: any): void {
    this.emit('translation:error', { error, context, timestamp: Date.now() });
  }

  /**
   * Wait for translation completion
   */
  waitForTranslation(timeout?: number): Promise<{ original: string; translated: string; targetLang: string }> {
    return this.waitFor('translation:complete', timeout);
  }
}

/**
 * Cache-specific event emitter
 */
export class CacheEventEmitter extends EventEmitter {
  /**
   * Emit cache hit event
   */
  emitCacheHit(key: string, value: string): void {
    this.emit('cache:hit', { key, value, timestamp: Date.now() });
  }

  /**
   * Emit cache miss event
   */
  emitCacheMiss(key: string): void {
    this.emit('cache:miss', { key, timestamp: Date.now() });
  }

  /**
   * Emit cache set event
   */
  emitCacheSet(key: string, value: string, ttl: number): void {
    this.emit('cache:set', { key, value, ttl, timestamp: Date.now() });
  }

  /**
   * Emit cache eviction event
   */
  emitCacheEviction(key: string, reason: string): void {
    this.emit('cache:eviction', { key, reason, timestamp: Date.now() });
  }
}

/**
 * Performance-specific event emitter
 */
export class PerformanceEventEmitter extends EventEmitter {
  /**
   * Emit performance metric event
   */
  emitMetric(operation: string, duration: number, success: boolean): void {
    this.emit('performance:metric', { operation, duration, success, timestamp: Date.now() });
  }

  /**
   * Emit performance warning event
   */
  emitPerformanceWarning(operation: string, duration: number, threshold: number): void {
    this.emit('performance:warning', { operation, duration, threshold, timestamp: Date.now() });
  }

  /**
   * Emit memory usage event
   */
  emitMemoryUsage(used: number, total: number): void {
    this.emit('performance:memory', { used, total, timestamp: Date.now() });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { EventEmitter as default };
