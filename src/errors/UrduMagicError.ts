// ============================================================================
// URDU MAGIC ERROR SYSTEM
// Standardized error handling with custom error classes
// ============================================================================

/**
 * Error codes for different types of errors
 */
export enum ErrorCode {
  // Initialization errors
  INIT_FAILED = 'INIT_FAILED',
  CONFIG_INVALID = 'CONFIG_INVALID',
  INSTANCE_NOT_FOUND = 'INSTANCE_NOT_FOUND',
  
  // Translation errors
  TRANSLATION_FAILED = 'TRANSLATION_FAILED',
  STRATEGY_UNAVAILABLE = 'STRATEGY_UNAVAILABLE',
  TEXT_TOO_LONG = 'TEXT_TOO_LONG',
  INVALID_LANGUAGE = 'INVALID_LANGUAGE',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Security errors
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  INPUT_BLOCKED = 'INPUT_BLOCKED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Magic mode errors
  MAGIC_MODE_FAILED = 'MAGIC_MODE_FAILED',
  DOM_ERROR = 'DOM_ERROR',
  SELECTOR_INVALID = 'SELECTOR_INVALID',
  
  // Cache errors
  CACHE_ERROR = 'CACHE_ERROR',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error context information
 */
export interface ErrorContext {
  operation: string;
  strategy?: string;
  text?: string;
  targetLang?: string;
  userId?: string;
  timestamp: number;
  stack?: string;
  userAgent?: string;
  url?: string;
  retryAfter?: number;
  originalError?: string;
}

/**
 * Custom error class for UrduMagic
 */
export class UrduMagicError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly retryable: boolean;
  public readonly userMessage: string;

  constructor(
    code: ErrorCode,
    message: string,
    context: Partial<ErrorContext> = {},
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'UrduMagicError';
    this.code = code;
    this.severity = severity;
    this.context = {
      operation: 'unknown',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...context
    } as ErrorContext;
    this.retryable = retryable;
    this.userMessage = this.generateUserMessage(code);
    
    // Maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UrduMagicError);
    }
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(code: ErrorCode): string {
    switch (code) {
      case ErrorCode.INIT_FAILED:
        return 'Failed to initialize UrduMagic. Please check your configuration.';
      
      case ErrorCode.CONFIG_INVALID:
        return 'Invalid configuration provided. Please check your settings.';
      
      case ErrorCode.TRANSLATION_FAILED:
        return 'Translation failed. Please try again later.';
      
      case ErrorCode.STRATEGY_UNAVAILABLE:
        return 'Translation service is currently unavailable. Please try again later.';
      
      case ErrorCode.NETWORK_ERROR:
        return 'Network connection failed. Please check your internet connection.';
      
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return 'Too many requests. Please wait a moment and try again.';
      
      case ErrorCode.TEXT_TOO_LONG:
        return 'Text is too long for translation. Please use shorter text.';
      
      case ErrorCode.SECURITY_VIOLATION:
        return 'Content blocked for security reasons.';
      
      case ErrorCode.QUOTA_EXCEEDED:
        return 'Translation quota exceeded. Please try again later.';
      
      case ErrorCode.TIMEOUT_ERROR:
        return 'Request timed out. Please try again.';
      
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      severity: this.severity,
      retryable: this.retryable,
      context: this.context,
      stack: this.stack
    };
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return this.retryable;
  }

  /**
   * Check if error is user-facing
   */
  isUserFacing(): boolean {
    return this.severity !== ErrorSeverity.LOW;
  }

  /**
   * Get error category
   */
  getCategory(): 'network' | 'security' | 'config' | 'translation' | 'system' {
    if (this.code === ErrorCode.NETWORK_ERROR || 
        this.code === ErrorCode.API_ERROR || 
        this.code === ErrorCode.TIMEOUT_ERROR ||
        this.code === ErrorCode.RATE_LIMIT_EXCEEDED) {
      return 'network';
    }
    
    if (this.code === ErrorCode.SECURITY_VIOLATION || 
        this.code === ErrorCode.INPUT_BLOCKED ||
        this.code === ErrorCode.QUOTA_EXCEEDED) {
      return 'security';
    }
    
    if (this.code === ErrorCode.CONFIG_INVALID || 
        this.code === ErrorCode.INIT_FAILED) {
      return 'config';
    }
    
    if (this.code === ErrorCode.TRANSLATION_FAILED || 
        this.code === ErrorCode.STRATEGY_UNAVAILABLE ||
        this.code === ErrorCode.TEXT_TOO_LONG ||
        this.code === ErrorCode.INVALID_LANGUAGE) {
      return 'translation';
    }
    
    return 'system';
  }
}

/**
 * Error factory functions for common errors
 */
export class ErrorFactory {
  /**
   * Create initialization error
   */
  static initFailed(reason: string, context?: Partial<ErrorContext>): UrduMagicError {
    return new UrduMagicError(
      ErrorCode.INIT_FAILED,
      `Initialization failed: ${reason}`,
      context,
      ErrorSeverity.HIGH,
      false
    );
  }

  /**
   * Create configuration error
   */
  static configInvalid(field: string, value: any, context?: Partial<ErrorContext>): UrduMagicError {
    return new UrduMagicError(
      ErrorCode.CONFIG_INVALID,
      `Invalid configuration for ${field}: ${value}`,
      context,
      ErrorSeverity.MEDIUM,
      false
    );
  }

  /**
   * Create translation error
   */
  static translationFailed(reason: string, context?: Partial<ErrorContext>): UrduMagicError {
    return new UrduMagicError(
      ErrorCode.TRANSLATION_FAILED,
      `Translation failed: ${reason}`,
      context,
      ErrorSeverity.MEDIUM,
      true
    );
  }

  /**
   * Create network error
   */
  static networkError(status: number, message: string, context?: Partial<ErrorContext>): UrduMagicError {
    return new UrduMagicError(
      ErrorCode.NETWORK_ERROR,
      `Network error (${status}): ${message}`,
      context,
      ErrorSeverity.MEDIUM,
      true
    );
  }

  /**
   * Create rate limit error
   */
  static rateLimitExceeded(retryAfter: number, context?: Partial<ErrorContext>): UrduMagicError {
    return new UrduMagicError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      `Rate limit exceeded. Retry after ${retryAfter}ms`,
      { ...context, retryAfter },
      ErrorSeverity.MEDIUM,
      true
    );
  }

  /**
   * Create security error
   */
  static securityViolation(reason: string, context?: Partial<ErrorContext>): UrduMagicError {
    return new UrduMagicError(
      ErrorCode.SECURITY_VIOLATION,
      `Security violation: ${reason}`,
      context,
      ErrorSeverity.HIGH,
      false
    );
  }

  /**
   * Create timeout error
   */
  static timeoutError(operation: string, timeout: number, context?: Partial<ErrorContext>): UrduMagicError {
    return new UrduMagicError(
      ErrorCode.TIMEOUT_ERROR,
      `${operation} timed out after ${timeout}ms`,
      context,
      ErrorSeverity.MEDIUM,
      true
    );
  }

  /**
   * Create text too long error
   */
  static textTooLong(length: number, maxLength: number, context?: Partial<ErrorContext>): UrduMagicError {
    return new UrduMagicError(
      ErrorCode.TEXT_TOO_LONG,
      `Text too long: ${length} characters (max: ${maxLength})`,
      context,
      ErrorSeverity.LOW,
      false
    );
  }

  /**
   * Create strategy unavailable error
   */
  static strategyUnavailable(strategy: string, context?: Partial<ErrorContext>): UrduMagicError {
    return new UrduMagicError(
      ErrorCode.STRATEGY_UNAVAILABLE,
      `Strategy unavailable: ${strategy}`,
      context,
      ErrorSeverity.MEDIUM,
      true
    );
  }

  /**
   * Create quota exceeded error
   */
  static quotaExceeded(quota: number, context?: Partial<ErrorContext>): UrduMagicError {
    return new UrduMagicError(
      ErrorCode.QUOTA_EXCEEDED,
      `Quota exceeded: ${quota} requests`,
      context,
      ErrorSeverity.MEDIUM,
      true
    );
  }

  /**
   * Create unknown error from generic error
   */
  static fromError(error: Error, context?: Partial<ErrorContext>): UrduMagicError {
    if (error instanceof UrduMagicError) {
      return error;
    }

    return new UrduMagicError(
      ErrorCode.UNKNOWN_ERROR,
      error.message,
      {
        ...context,
        originalError: error.name,
        stack: error.stack
      },
      ErrorSeverity.MEDIUM,
      true
    );
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Handle error with logging and user feedback
   */
  static handle(error: Error, context?: Partial<ErrorContext>): UrduMagicError {
    const urduError = ErrorFactory.fromError(error, context);
    
    // Log error
    console.error('UrduMagic Error:', urduError.toJSON());
    
    return urduError;
  }

  /**
   * Check if error should be retried
   */
  static shouldRetry(error: Error): boolean {
    const urduError = ErrorFactory.fromError(error);
    return urduError.isRetryable();
  }

  /**
   * Get user-friendly message
   */
  static getUserMessage(error: Error): string {
    const urduError = ErrorFactory.fromError(error);
    return urduError.userMessage;
  }

  /**
   * Get error category
   */
  static getCategory(error: Error): string {
    const urduError = ErrorFactory.fromError(error);
    return urduError.getCategory();
  }
}

export { UrduMagicError as default };
