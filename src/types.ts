// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Supported language modes
 */
export type LangMode = 'en' | 'ur' | 'roman';

/**
 * Script detection result
 */
export type ScriptType = 'arabic' | 'latin' | 'roman-urdu' | 'english' | 'mixed';

/**
 * Dictionary entry structure
 */
export interface DictionaryEntry {
  urdu: string;
  roman: string;
  category: string;
}

/**
 * Translation strategy interface for internal translation providers
 */
export interface TranslationStrategy {
  name: string;
  translate(text: string, targetLang: 'ur' | 'en' | 'roman'): Promise<string>;
  translateBatch?(texts: string[], targetLang: 'ur' | 'en' | 'roman'): Promise<string[]>;
  isAvailable?(): Promise<boolean>;
  getQuota?(): Promise<QuotaInfo | null>;
  getRateLimit?(): Promise<RateLimitInfo | null>;
  destroy?(): void;
}

/**
 * Rate limit information for strategies
 */
export interface RateLimitInfo {
  requests: number;
  window: number; // in milliseconds
  current: number;
  resetTime: number;
}

/**
 * Monitoring configuration
 */
export interface QuotaInfo {
  used: number;
  limit: number;
  resetDate: Date;
}

/**
 * Result returned by transliteration operations.
 */
export interface TransliterationResult {
  input: string;
  output: string;
  lang: 'ur' | 'roman';
  ms: number;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Security configuration
 */
export interface SecurityConfig {
  sanitizeInput?: boolean;
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
  enableCSP?: boolean;
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  cacheTTL?: number;
  cacheSize?: number;
  debounceMs?: number;
  rateLimitMs?: number;
  batchSize?: number;
  webWorkers?: boolean;
  prefetchEnabled?: boolean;
}

/**
 * Magic mode configuration
 */
export interface MagicModeConfig {
  enabled?: boolean;
  selector?: string;
  skipTags?: string[];
  skipClasses?: string[];
  attributes?: string[];
  preserveOriginal?: boolean;
  debounceMs?: number;
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  enabled?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  analyticsEndpoint?: string;
  healthCheckInterval?: number;
}

/**
 * Complete UrduMagic configuration
 */
export interface UrduMagicConfig {
  defaultLang: LangMode;
  modes: LangMode[];
  showSwitcher?: boolean;
  
  strategy?: 'offline';
  
  performance?: PerformanceConfig;
  magicMode?: MagicModeConfig;
  security?: SecurityConfig;
  monitoring?: MonitoringConfig;

  onLangSwitch?: (lang: LangMode) => void;
  onTranslationStart?: (text: string, targetLang: string) => void;
  onTranslationComplete?: (original: string, translated: string, targetLang: string) => void;
  onError?: (error: Error, context: TranslationContext) => void;
}

/**
 * Translation context for error handling
 */
export interface TranslationContext {
  text: string;
  targetLang: string;
  sourceLang: string;
  plugin: string;
  timestamp: number;
}

/**
 * Managed translator interface
 */
export interface ManagedTranslator {
  translate(text: string, targetLang: 'ur' | 'en' | 'roman'): Promise<string>;
  translateBatch(texts: string[], targetLang: 'ur' | 'en' | 'roman'): Promise<string[]>;
  dispose(): void;
}

// ============================================================================
// INSTANCE TYPES
// ============================================================================

/**
 * UrduMagic instance interface
 */
export interface UrduMagicInstance {
  switchLang(lang: LangMode): void;
  getCurrentLang(): LangMode;
  translate(text: string, targetLang: 'ur' | 'en' | 'roman'): Promise<string>;
  translateBatch(texts: string[], targetLang: 'ur' | 'en' | 'roman'): Promise<string[]>;
  toRoman(text: string): string;
  toUrdu(text: string): string;
  
  snapshot(): void;
  addMagicElement(element: Element): void;
  removeMagicElement(element: Element): void;
  destroyMagic(): void;
  
  getCacheStats(): CacheStats;
  clearCache(): void;
  
  getPluginInfo(): PluginInfo[];
  addPlugin(plugin: TranslationStrategy): void;
  removePlugin(name: string): void;
  
  getAnalytics(): AnalyticsData;
  healthCheck(): Promise<HealthStatus>;
  
  destroy(): void;
}

/**
 * Cache entry stored in memory and localStorage.
 */
export interface CacheEntry {
  value: string;
  timestamp: number;
  expiresAt: number;
  accessCount?: number;
  lastAccess?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  memoryUsage: number;
}

/**
 * Plugin information
 */
export interface PluginInfo {
  name: string;
  healthy: boolean;
  lastUsed: number;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
}

/**
 * Analytics data
 */
export interface AnalyticsData {
  cacheHitRate: number;
  avgResponseTime: number;
  errorRate: number;
  activeUsers: number;
  bundleSize: number;
  memoryUsage: number;
  totalTranslations: number;
  topTranslations: Array<{ text: string; count: number }>;
}

/**
 * Health status
 */
export interface HealthStatus {
  healthy: boolean;
  services: {
    translation: boolean;
    cache: boolean;
    transliterator: boolean;
    plugins: boolean;
  };
  timestamp: number;
  uptime: number;
  version: string;
}

/**
 * Performance metric
 */
export interface PerformanceMetric {
  duration: number;
  timestamp: number;
  operation: string;
  success: boolean;
  strategy?: string;
  error?: string;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
  reason: 'ok' | 'user_limit' | 'global_limit' | 'server_load';
}

/**
 * Security event
 */
export interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  timestamp?: number;
  userAgent?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized: string | string[] | null;
}
