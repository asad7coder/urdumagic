// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Translation strategy interface for internal translation providers
 */
export interface TranslationStrategy {
  name: string;
  translate(text: string, targetLang: 'ur' | 'en'): Promise<string>;
  translateBatch?(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]>;
  isAvailable?(): Promise<boolean>;
  getQuota?(): Promise<QuotaInfo | null>;
  getRateLimit?(): Promise<RateLimitInfo | null>;
  destroy?(): void;
}

/**
 * Translation strategy configuration
 */
export interface TranslationStrategyConfig {
  libreUrl?: string;
  apiKey?: string;
  googleApiKey?: string;
  aiProvider?: 'openai' | 'anthropic' | 'custom';
  aiApiKey?: string;
  aiModel?: string;
  timeout?: number;
  retries?: number;
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
 * Fallback chain configuration
 */
export interface FallbackChain {
  strategies: Array<'libre' | 'google' | 'ai' | 'offline'>;
  strategy?: 'sequential' | 'parallel';
  timeout?: number;
}

/**
 * Quota information for translation services
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
 * Script detection result.
 */
export type ScriptType = 'arabic' | 'latin' | 'roman-urdu' | 'english' | 'mixed';

/**
 * Language mode for UI
 */
export type LangMode = 'en' | 'ur' | 'roman';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Legacy plugin interface (deprecated in favor of TranslationStrategy)
 * @deprecated Use TranslationStrategy instead
 */
export interface TranslatorPlugin {
  name: string;
  translate(text: string, targetLang: 'ur' | 'en'): Promise<string>;
  translateBatch?(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]>;
  healthCheck?(): Promise<boolean>;
  getQuota?(): Promise<QuotaInfo>;
}

/**
 * Enhanced translator plugin with advanced features
 * @deprecated Use TranslationStrategy instead
 */
export interface AdvancedTranslatorPlugin extends TranslatorPlugin {
  supportedLanguages: Array<'en' | 'ur'>;
  rateLimit?: {
    requests: number;
    window: number; // in milliseconds
  };
  pricing?: {
    costPerCharacter: number;
    freeCharactersPerMonth?: number;
  };
}

/**
 * Fallback translator configuration
 */
export interface FallbackTranslator {
  name: string;
  url?: string;
  apiKey?: string;
  weight?: number;
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
  // Basic settings
  defaultLang: LangMode;
  modes: LangMode[];
  showSwitcher?: boolean;

  // MVP translation settings
  translator?: 'libretranslate' | 'custom';
  libreUrl?: string;
  apiKey?: string;
  customTranslator?: TranslatorPlugin;
  cacheTTL?: number;
  debounceMs?: number;

  // Translation settings (Hybrid System)
  strategy?: 'libre' | 'google' | 'ai' | 'offline';
  strategyConfig?: TranslationStrategyConfig;
  fallbackChain?: FallbackChain;
  defaultStrategy?: 'libre' | 'google' | 'ai' | 'offline';

  // Performance settings
  performance?: PerformanceConfig;

  // Magic mode settings
  magicMode?: MagicModeConfig;

  // Security settings
  security?: SecurityConfig;

  // Monitoring settings
  monitoring?: MonitoringConfig;

  // Event callbacks
  onLangSwitch?: (lang: string) => void;
  onTranslationStart?: (text: string, targetLang: string) => void;
  onTranslationComplete?: (original: string, translated: string, targetLang: string) => void;
  onError?: (error: Error, context: TranslationContext) => void;
  onStrategyChange?: (oldStrategy: string, newStrategy: string) => void;
  onFallbackUsed?: (strategy: string, originalStrategy: string) => void;
}

// ============================================================================
// INSTANCE TYPES
// ============================================================================

/**
 * UrduMagic instance interface
 */
export interface UrduMagicInstance {
  // Core methods
  translate(text: string, targetLang: 'ur' | 'en'): Promise<string>;
  translateBatch?(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]>;
  toUrdu(text: string): Promise<string>;
  toRoman(text: string): Promise<string>;
  detectScript(text: string): ScriptType;

  // Language management
  setLanguage(lang: LangMode): Promise<void>;
  getLanguage(): LangMode;

  // Magic mode
  enableMagicMode(): void;
  disableMagicMode(): void;
  isMagicModeEnabled(): boolean;

  // Strategy management
  setStrategy(strategy: 'libre' | 'google' | 'ai' | 'offline'): void;
  getCurrentStrategy(): string;
  getAvailableStrategies(): string[];
  getStrategyStats(): Record<string, StrategyStats>;

  // Lifecycle
  destroy(): void;
}

/**
 * Strategy statistics
 */
export interface StrategyStats {
  name: string;
  available: boolean;
  healthy: boolean;
  totalRequests: number;
  errorCount: number;
  avgResponseTime: number;
  lastUsed: number;
  quota?: QuotaInfo;
}

/**
 * Strategy factory function type
 */
export type StrategyFactory = (config: TranslationStrategyConfig) => TranslationStrategy;

/**
 * Strategy metadata for validation
 */
export interface StrategyMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  supportedLanguages: Array<'en' | 'ur'>;
  requiresApiKey: boolean;
  costPerCharacter?: number;
  maxTextLength?: number;
  capabilities: {
    batchTranslation: boolean;
    quotaTracking: boolean;
    rateLimiting: boolean;
    healthCheck: boolean;
  };
  security: {
    exposesApiKey: boolean;
    requiresProxy: boolean;
    clientSafe: boolean;
  };
}

// ============================================================================
// INFRASTRUCTURE TYPES
// ============================================================================

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
 * Rate limiting result
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
 * Performance metric
 */
export interface PerformanceMetric {
  duration: number;
  timestamp: number;
  operation: string;
  success: boolean;
  error?: string;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  count: number;
  avg: number;
  min: number;
  max: number;
  p95: number;
}

/**
 * API endpoint configuration
 */
export interface APIEndpoint {
  url: string;
  weight: number;
  region: string;
  healthy?: boolean;
  latency?: number;
}

/**
 * User limit configuration
 */
export interface UserLimit {
  requests: number;
  window: number;
  current: number;
  resetTime: number;
}

/**
 * Global limit configuration
 */
export interface GlobalLimit {
  requests: number;
  window: number;
  current: number;
  resetTime: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized: string | string[] | null;
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * @deprecated Use UrduMagicInstance instead
 */
export interface LegacyUrduMagicInstance {
  destroy(): void;
  switchLang(lang: 'en' | 'ur' | 'roman'): void;
  getCurrentLang(): 'en' | 'ur' | 'roman';
  translate(text: string, targetLang: 'ur' | 'en'): Promise<string>;
  toRoman(text: string): string;
  toUrdu(text: string): string;
}

