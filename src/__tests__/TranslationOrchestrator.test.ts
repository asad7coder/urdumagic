import { describe, it, expect, vi, beforeEach } from 'vitest';
import TranslationOrchestrator from '../application/TranslationOrchestrator.js';

describe('TranslationOrchestrator.ts - Pipeline Logic', () => {
  let mockRouter: any;
  let mockRegistry: any;
  let mockCache: any;
  let mockSecurity: any;
  let mockPerformance: any;
  let mockEvents: any;
  let orchestrator: TranslationOrchestrator;

  beforeEach(() => {
    mockRouter = { selectStrategy: vi.fn(), updateMetrics: vi.fn() };
    mockRegistry = { getStrategy: vi.fn() };
    mockCache = { get: vi.fn(), set: vi.fn() };
    mockSecurity = { 
      validateInput: vi.fn().mockReturnValue({ isValid: true, errors: [] }),
      checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
      filterContent: vi.fn().mockReturnValue({ safe: true })
    };
    mockPerformance = { startTimer: vi.fn(), endTimer: vi.fn(), recordMetric: vi.fn() };
    mockEvents = { emit: vi.fn(), on: vi.fn(), removeAllListeners: vi.fn() };

    orchestrator = new TranslationOrchestrator(
      mockRouter,
      mockRegistry,
      mockCache,
      mockSecurity,
      mockPerformance,
      mockEvents,
      { defaultLang: 'en', modes: ['en', 'ur'] }
    );
  });

  it('should short-circuit if cache hit occurs', async () => {
    mockCache.get.mockResolvedValue('Cached Translation');

    const request: any = {
      id: 'test-1',
      text: 'hello',
      targetLang: 'ur',
      options: { useCache: true },
      metadata: { timestamp: Date.now() }
    };

    const result = await orchestrator.translate(request);

    // Verify cache was checked
    expect(mockCache.get).toHaveBeenCalled();
    expect(result.translatedText).toBe('Cached Translation');
    expect(result.metadata.cached).toBe(true);

    // Verify Router and Execution layers were NOT called
    expect(mockRouter.selectStrategy).not.toHaveBeenCalled();
    expect(mockRegistry.getStrategy).not.toHaveBeenCalled();
  });

  it('should continue to execution if cache miss occurs', async () => {
    mockCache.get.mockResolvedValue(null);
    mockRouter.selectStrategy.mockResolvedValue({ strategy: 'test-strategy', fallbackChain: [] });
    mockRegistry.getStrategy.mockReturnValue({ translate: vi.fn().mockResolvedValue('Translated') });

    const request: any = {
      id: 'test-2',
      text: 'hello',
      targetLang: 'ur',
      options: { useCache: true },
      metadata: { timestamp: Date.now() }
    };

    const result = await orchestrator.translate(request);

    expect(mockCache.get).toHaveBeenCalled();
    expect(mockRouter.selectStrategy).toHaveBeenCalled();
    expect(result.translatedText).toBe('Translated');
    expect(result.metadata.cached).toBe(false);
  });
});
