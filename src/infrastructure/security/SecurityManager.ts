// ============================================================================
// SECURITY MANAGER
// XSS Prevention, Input Sanitization, and Security Auditing
// ============================================================================

import type { SecurityConfig, SecurityEvent, ValidationResult } from '../../types.js';

/**
 * Comprehensive security management system for UrduMagic
 * Handles XSS prevention, input sanitization, and security auditing
 */
export class SecurityManager {
  private static readonly DANGEROUS_PATTERNS = [
    /javascript:/gi,
    /data:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi, // onclick, onload, etc.
    /<script/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /<input/gi,
    /<textarea/gi,
    /eval\s*\(/gi,
    /function\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi
  ];

  private static readonly ALLOWED_TAGS = new Set([
    'p', 'span', 'div', 'br', 'strong', 'em', 'u', 'i', 'b',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
    'blockquote', 'code', 'pre', 'a'
  ]);

  private static readonly ALLOWED_ATTRIBUTES = new Set([
    'class', 'id', 'data-*', 'lang', 'dir', 'href', 'title', 'alt'
  ]);

  private config: SecurityConfig;
  private auditLog: SecurityEvent[] = [];
  private enabled: boolean = true;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      sanitizeInput: true,
      allowedTags: [...SecurityManager.ALLOWED_TAGS],
      allowedAttributes: [...SecurityManager.ALLOWED_ATTRIBUTES],
      maxLength: 10000,
      enableCSP: true,
      ...config
    };

    if (this.config.enableCSP && typeof document !== 'undefined') {
      this.injectCSP();
    }
  }

  /**
   * Sanitize text input to prevent XSS attacks
   */
  sanitizeText(text: string): string {
    if (!this.enabled || !this.config.sanitizeInput) {
      return text;
    }

    if (typeof text !== 'string') {
      this.logSecurityEvent('invalid_input_type', 'high', {
        actualType: typeof text,
        expectedType: 'string'
      });
      return '';
    }

    // Remove null bytes and control characters
    let sanitized = text.replace(/[\x00-\x1F\x7F]/g, '');

    // Remove dangerous patterns
    for (const pattern of SecurityManager.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // HTML entity encode
    sanitized = this.encodeHTML(sanitized);

    // Length validation
    if (sanitized.length > (this.config.maxLength || 10000)) {
      this.logSecurityEvent('input_too_long', 'medium', {
        actualLength: sanitized.length,
        maxLength: this.config.maxLength
      });
      sanitized = sanitized.substring(0, this.config.maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHTML(html: string): string {
    if (!this.enabled) {
      return html;
    }

    // Create a temporary div to safely parse HTML
    const div = document.createElement('div');
    div.textContent = html; // This automatically escapes HTML
    return div.innerHTML;
  }

  /**
   * Validate input text comprehensively
   */
  validateInput(text: string, targetLang?: string): ValidationResult {
    const errors: string[] = [];

    // Type checking
    if (typeof text !== 'string') {
      errors.push('Input must be a string');
      return { isValid: false, errors, sanitized: null };
    }

    // Length validation
    if (text.length === 0) {
      errors.push('Text cannot be empty');
    }

    if (text.length > (this.config.maxLength || 10000)) {
      errors.push(`Text too long (max ${this.config.maxLength} characters)`);
    }

    // Content validation
    if (this.containsSuspiciousContent(text)) {
      errors.push('Text contains suspicious content');
      this.logSecurityEvent('suspicious_content_detected', 'high', {
        text: text.substring(0, 100), // Log first 100 chars
        targetLang
      });
    }

    // Language validation
    if (targetLang && !['en', 'ur', 'roman'].includes(targetLang)) {
      errors.push('Invalid target language');
    }

    const sanitized = errors.length === 0 ? this.sanitizeText(text) : null;

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate batch input
   */
  validateBatchInput(texts: string[], targetLang?: string): ValidationResult {
    const errors: string[] = [];
    const maxBatchSize = 100;

    if (!Array.isArray(texts)) {
      errors.push('Input must be an array');
      return { isValid: false, errors, sanitized: null };
    }

    if (texts.length > maxBatchSize) {
      errors.push(`Batch too large (max ${maxBatchSize} items)`);
    }

    if (texts.length === 0) {
      errors.push('Batch cannot be empty');
    }

    // Validate each text
    texts.forEach((text, index) => {
      const validation = this.validateInput(text, targetLang);
      if (!validation.isValid) {
        errors.push(`Item ${index}: ${validation.errors.join(', ')}`);
      }
    });

    const sanitized = errors.length === 0 ? texts.map(t => this.sanitizeText(t)) : null;

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Safe DOM text content setting
   */
  safeSetTextContent(element: Element, text: string): void {
    const sanitized = this.sanitizeText(text);
    
    // Always use textContent to prevent XSS
    element.textContent = sanitized;
  }

  /**
   * Safe attribute setting
   */
  safeSetAttribute(element: Element, name: string, value: string): void {
    // Validate attribute name
    if (!this.isValidAttributeName(name)) {
      this.logSecurityEvent('invalid_attribute', 'medium', {
        attributeName: name
      });
      return;
    }

    // Never set event handlers
    if (name.startsWith('on')) {
      this.logSecurityEvent('event_handler_blocked', 'high', {
        attributeName: name
      });
      return;
    }

    const sanitized = this.sanitizeText(value);
    element.setAttribute(name, sanitized);
  }

  /**
   * Validate translation result for security
   */
  validateTranslation(original: string, result: string, context: any): void {
    // Check for injection attempts in result
    if (result.includes('<script') || result.includes('javascript:')) {
      this.logSecurityEvent('translation_injection_attempt', 'critical', {
        original: original.substring(0, 100),
        result: result.substring(0, 100),
        context
      });
    }

    // Check for unusual length changes (potential data exfiltration)
    const ratio = result.length / original.length;
    if (ratio > 10 || ratio < 0.1) {
      this.logSecurityEvent('unusual_translation_ratio', 'medium', {
        originalLength: original.length,
        resultLength: result.length,
        ratio
      });
    }
  }

  /**
   * Enable/disable security features
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Update security configuration
   */
  updateConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get security audit log
   */
  getAuditLog(): SecurityEvent[] {
    return [...this.auditLog];
  }

  /**
   * Clear security audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalEvents: number;
    criticalEvents: number;
    highSeverityEvents: number;
    mediumSeverityEvents: number;
    lowSeverityEvents: number;
    recentEvents: SecurityEvent[];
  } {
    const totalEvents = this.auditLog.length;
    const criticalEvents = this.auditLog.filter(e => e.severity === 'critical').length;
    const highSeverityEvents = this.auditLog.filter(e => e.severity === 'high').length;
    const mediumSeverityEvents = this.auditLog.filter(e => e.severity === 'medium').length;
    const lowSeverityEvents = this.auditLog.filter(e => e.severity === 'low').length;
    
    const recentEvents = this.auditLog
      .filter(e => Date.now() - (e.timestamp || 0) < 3600000) // Last hour
      .slice(-10); // Last 10 events

    return {
      totalEvents,
      criticalEvents,
      highSeverityEvents,
      mediumSeverityEvents,
      lowSeverityEvents,
      recentEvents
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private containsSuspiciousContent(text: string): boolean {
    return SecurityManager.DANGEROUS_PATTERNS.some(pattern => pattern.test(text));
  }

  private encodeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private isValidAttributeName(name: string): boolean {
    const validPattern = /^[a-zA-Z][a-zA-Z0-9\-_]*$/;
    return validPattern.test(name) && !name.startsWith('on');
  }

  private logSecurityEvent(type: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, any>): void {
    const event: SecurityEvent = {
      type,
      severity,
      details,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };

    this.auditLog.push(event);

    // Keep only last 1000 events
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }

    // Log critical events to console
    if (severity === 'critical' || severity === 'high') {
      console.error(`UrduMagic Security Alert [${severity}]: ${type}`, details);
    }

    // In production, send to security monitoring service
    if (severity === 'critical' && typeof fetch !== 'undefined') {
      this.reportToSecurityService(event).catch(() => {
        // Silently fail to avoid breaking functionality
      });
    }
  }

  private async reportToSecurityService(event: SecurityEvent): Promise<void> {
    try {
      await fetch('/api/security/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      // Silently fail
    }
  }

  private injectCSP(): void {
    if (typeof document === 'undefined') return;

    // Check if CSP already exists
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) return;

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = this.generateCSP();
    document.head.appendChild(meta);
  }

  private generateCSP(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://libretranslate.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://libretranslate.com https://translation.googleapis.com https://api.openai.com",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ];

    return directives.join('; ');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { SecurityManager as default };
