import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityManager } from '../infrastructure/security/SecurityManager.js';

describe('SecurityManager.ts - XSS & Proto Protection', () => {
  let security: SecurityManager;

  beforeEach(() => {
    security = new SecurityManager();
  });

  it('should neutralize <script> tags from input', () => {
    const input = '<script>alert(1)</script> Hello';
    const sanitized = security.sanitizeText(input);
    
    // It should strip the tag and encode the rest
    expect(sanitized).not.toContain('<script');
    expect(sanitized).toContain('&lt;');
  });

  it('should sanitize javascript: protocol', () => {
    const input = 'javascript:alert(1)';
    const sanitized = security.sanitizeText(input);
    expect(sanitized).not.toContain('javascript:');
  });

  it('should safely reject "__proto__" and other prototype pollution keys', () => {
    const input = '__proto__';
    const validation = security.validateInput(input);
    
    // We check if it contains suspicious content
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Text contains suspicious content');
  });

  it('should encode HTML entities for safety', () => {
    const input = '<b>Hello</b> & "World"';
    const sanitized = security.sanitizeText(input);
    
    expect(sanitized).toContain('&lt;b&gt;');
    expect(sanitized).toContain('&amp;');
    expect(sanitized).toContain('&quot;');
  });
});
