// ============================================================================
// SECURE AI STRATEGY
// Secure AI translation with proxy mode and cost protection
// ============================================================================

import type { 
  TranslationStrategy, 
  TranslationStrategyConfig,
  QuotaInfo,
  RateLimitInfo
} from '../../types.js';

/**
 * AI security modes
 */
export type AISecurityMode = 'client-safe' | 'proxy' | 'hybrid';

/**
 * Cost protection configuration
 */
export interface CostProtection {
  maxCharactersPerDay: number;
  maxCostPerDay: number;
  costPerCharacter: number;
  alertThreshold: number; // Alert when 80% of limit reached
  blockWhenExceeded: boolean;
}

/**
 * AI request context for security
 */
interface AIRequestContext {
  text: string;
  targetLang: 'ur' | 'en';
  userId?: string;
  sessionId?: string;
  timestamp: number;
  characterCount: number;
  estimatedCost: number;
}

/**
 * Secure AI strategy with multiple security modes
 */
export class SecureAIStrategy implements TranslationStrategy {
  name = 'secure-ai';
  private config: TranslationStrategyConfig;
  private securityMode: AISecurityMode;
  private costProtection: CostProtection;
  private proxyEndpoint?: string;
  private usageTracker: Map<string, number> = new Map();
  private costTracker: Map<string, number> = new Map();

  constructor(
    config: TranslationStrategyConfig = {},
    options: {
      securityMode?: AISecurityMode;
      costProtection?: Partial<CostProtection>;
      proxyEndpoint?: string;
    } = {}
  ) {
    this.config = config;
    this.securityMode = options.securityMode || 'client-safe';
    this.proxyEndpoint = options.proxyEndpoint;
    
    this.costProtection = {
      maxCharactersPerDay: 10000,
      maxCostPerDay: 1.00, // $1 per day
      costPerCharacter: 0.0001, // $0.0001 per character
      alertThreshold: 0.8,
      blockWhenExceeded: true,
      ...options.costProtection
    };

    this.validateSecurityMode();
  }

  /**
   * Translate text with security and cost protection
   */
  async translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    const context = this.createRequestContext(text, targetLang);
    
    // Security checks
    await this.performSecurityChecks(context);
    
    // Cost protection
    await this.checkCostLimits(context);
    
    // Execute based on security mode
    switch (this.securityMode) {
      case 'client-safe':
        return await this.translateClientSafe(context);
      case 'proxy':
        return await this.translateViaProxy(context);
      case 'hybrid':
        return await this.translateHybrid(context);
      default:
        throw new Error(`Unknown security mode: ${this.securityMode}`);
    }
  }

  /**
   * Batch translation with enhanced security
   */
  async translateBatch(texts: string[], targetLang: 'ur' | 'en'): Promise<string[]> {
    const totalCharacters = texts.reduce((sum, text) => sum + text.length, 0);
    const totalCost = totalCharacters * this.costProtection.costPerCharacter;
    
    // Check batch limits
    if (totalCharacters > this.costProtection.maxCharactersPerDay) {
      throw new Error(`Batch exceeds daily character limit: ${totalCharacters} > ${this.costProtection.maxCharactersPerDay}`);
    }
    
    if (totalCost > this.costProtection.maxCostPerDay) {
      throw new Error(`Batch exceeds daily cost limit: $${totalCost.toFixed(4)} > $${this.costProtection.maxCostPerDay.toFixed(2)}`);
    }
    
    // Process in smaller chunks for better control
    const results: string[] = [];
    const chunkSize = 5; // Process 5 texts at a time
    
    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map(text => this.translate(text, targetLang))
      );
      results.push(...chunkResults);
    }
    
    return results;
  }

  /**
   * Check if AI service is available
   */
  async isAvailable(): Promise<boolean> {
    switch (this.securityMode) {
      case 'client-safe':
        return !!this.config.aiApiKey;
      case 'proxy':
        return !!this.proxyEndpoint;
      case 'hybrid':
        return !!this.config.aiApiKey || !!this.proxyEndpoint;
      default:
        return false;
    }
  }

  /**
   * Get quota information with cost tracking
   */
  async getQuota(): Promise<QuotaInfo | null> {
    const today = new Date().toDateString();
    const usedChars = this.usageTracker.get(today) || 0;
    const usedCost = this.costTracker.get(today) || 0;
    
    return {
      used: usedChars,
      limit: this.costProtection.maxCharactersPerDay,
      resetDate: new Date(new Date().setHours(24, 0, 0, 0))
    };
  }

  /**
   * Get rate limit information
   */
  async getRateLimit(): Promise<RateLimitInfo | null> {
    // AI services typically have rate limits based on cost
    const dailyLimit = Math.floor(this.costProtection.maxCostPerDay / this.costProtection.costPerCharacter);
    const today = new Date().toDateString();
    const used = this.usageTracker.get(today) || 0;
    
    return {
      requests: dailyLimit,
      window: 86400000, // 24 hours
      current: used,
      resetTime: new Date(new Date().setHours(24, 0, 0, 0)).getTime()
    };
  }

  /**
   * Update security mode
   */
  setSecurityMode(mode: AISecurityMode): void {
    this.securityMode = mode;
    this.validateSecurityMode();
  }

  /**
   * Update cost protection settings
   */
  setCostProtection(protection: Partial<CostProtection>): void {
    this.costProtection = { ...this.costProtection, ...protection };
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): {
    today: { characters: number; cost: number; requests: number };
    limits: { characters: number; cost: number };
    alerts: { characterAlert: boolean; costAlert: boolean };
  } {
    const today = new Date().toDateString();
    const usedChars = this.usageTracker.get(today) || 0;
    const usedCost = this.costTracker.get(today) || 0;
    
    const characterAlert = usedChars > (this.costProtection.maxCharactersPerDay * this.costProtection.alertThreshold);
    const costAlert = usedCost > (this.costProtection.maxCostPerDay * this.costProtection.alertThreshold);
    
    return {
      today: {
        characters: usedChars,
        cost: usedCost,
        requests: Math.floor(usedChars / 100) // Estimate
      },
      limits: {
        characters: this.costProtection.maxCharactersPerDay,
        cost: this.costProtection.maxCostPerDay
      },
      alerts: {
        characterAlert,
        costAlert
      }
    };
  }

  /**
   * Clear usage data
   */
  clearUsageData(): void {
    this.usageTracker.clear();
    this.costTracker.clear();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearUsageData();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private validateSecurityMode(): void {
    if (this.securityMode === 'proxy' && !this.proxyEndpoint) {
      throw new Error('Proxy endpoint is required for proxy security mode');
    }
    
    if (this.securityMode === 'client-safe' && !this.config.aiApiKey) {
      console.warn('Client-safe mode requires AI API key');
    }
  }

  private createRequestContext(text: string, targetLang: 'ur' | 'en'): AIRequestContext {
    return {
      text,
      targetLang,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
      characterCount: text.length,
      estimatedCost: text.length * this.costProtection.costPerCharacter
    };
  }

  private async performSecurityChecks(context: AIRequestContext): Promise<void> {
    // Input validation
    if (context.text.length > 5000) {
      throw new Error('Text too long for AI translation (max 5000 characters)');
    }
    
    // Content filtering (basic)
    if (this.containsMaliciousContent(context.text)) {
      throw new Error('Content blocked by security filter');
    }
    
    // Rate limiting per user
    await this.checkUserRateLimit(context);
  }

  private async checkCostLimits(context: AIRequestContext): Promise<void> {
    const today = new Date().toDateString();
    const usedChars = this.usageTracker.get(today) || 0;
    const usedCost = this.costTracker.get(today) || 0;
    
    const newTotalChars = usedChars + context.characterCount;
    const newTotalCost = usedCost + context.estimatedCost;
    
    // Check character limit
    if (newTotalChars > this.costProtection.maxCharactersPerDay) {
      if (this.costProtection.blockWhenExceeded) {
        throw new Error(`Daily character limit exceeded: ${newTotalChars} > ${this.costProtection.maxCharactersPerDay}`);
      } else {
        console.warn(`Daily character limit exceeded: ${newTotalChars} > ${this.costProtection.maxCharactersPerDay}`);
      }
    }
    
    // Check cost limit
    if (newTotalCost > this.costProtection.maxCostPerDay) {
      if (this.costProtection.blockWhenExceeded) {
        throw new Error(`Daily cost limit exceeded: $${newTotalCost.toFixed(4)} > $${this.costProtection.maxCostPerDay.toFixed(2)}`);
      } else {
        console.warn(`Daily cost limit exceeded: $${newTotalCost.toFixed(4)} > $${this.costProtection.maxCostPerDay.toFixed(2)}`);
      }
    }
    
    // Update tracking
    this.usageTracker.set(today, newTotalChars);
    this.costTracker.set(today, newTotalCost);
  }

  private async translateClientSafe(context: AIRequestContext): Promise<string> {
    if (!this.config.aiApiKey) {
      throw new Error('AI API key required for client-safe mode');
    }
    
    // Direct API call with rate limiting
    return await this.makeDirectAICall(context);
  }

  private async translateViaProxy(context: AIRequestContext): Promise<string> {
    if (!this.proxyEndpoint) {
      throw new Error('Proxy endpoint required for proxy mode');
    }
    
    // Proxy server handles API keys and rate limiting
    const response = await fetch(this.proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: context.text,
        targetLang: context.targetLang,
        provider: this.config.aiProvider || 'openai',
        model: this.config.aiModel || 'gpt-3.5-turbo'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Proxy translation failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.translation || context.text + ' [translation failed]';
  }

  private async translateHybrid(context: AIRequestContext): Promise<string> {
    // Try client-safe first, fallback to proxy
    try {
      if (this.config.aiApiKey) {
        return await this.translateClientSafe(context);
      }
    } catch (error) {
      console.warn('Client-safe translation failed, trying proxy:', error);
    }
    
    // Fallback to proxy
    return await this.translateViaProxy(context);
  }

  private async makeDirectAICall(context: AIRequestContext): Promise<string> {
    const provider = this.config.aiProvider || 'openai';
    
    switch (provider) {
      case 'openai':
        return await this.makeOpenAICall(context);
      case 'anthropic':
        return await this.makeAnthropicCall(context);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  private async makeOpenAICall(context: AIRequestContext): Promise<string> {
    const prompt = `Translate the following text to ${context.targetLang === 'ur' ? 'Urdu' : 'English'}. Only return the translated text:\n\n${context.text}`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.aiApiKey!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.aiModel || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: Math.min(context.text.length * 2, 1000),
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || context.text;
  }

  private async makeAnthropicCall(context: AIRequestContext): Promise<string> {
    const prompt = `Translate the following text to ${context.targetLang === 'ur' ? 'Urdu' : 'English'}. Only return the translated text:\n\n${context.text}`;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.aiApiKey!,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.aiModel || 'claude-3-haiku-20240307',
        max_tokens: Math.min(context.text.length * 2, 1000),
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || context.text;
  }

  private containsMaliciousContent(text: string): boolean {
    // Basic content filtering
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(text));
  }

  private async checkUserRateLimit(context: AIRequestContext): Promise<void> {
    if (!context.userId) return;
    
    const key = `${context.userId}:${new Date().toDateString()}`;
    const userRequests = this.usageTracker.get(key) || 0;
    
    // Simple per-user rate limit
    const maxUserRequests = 100;
    if (userRequests > maxUserRequests) {
      throw new Error('User rate limit exceeded');
    }
    
    this.usageTracker.set(key, userRequests + 1);
  }

  private getUserId(): string {
    // In a real implementation, this would get from auth system
    return localStorage.getItem('urdumagic_user_id') || 'anonymous';
  }

  private getSessionId(): string {
    // In a real implementation, this would get from session management
    let sessionId = sessionStorage.getItem('urdumagic_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('urdumagic_session_id', sessionId);
    }
    return sessionId;
  }
}
