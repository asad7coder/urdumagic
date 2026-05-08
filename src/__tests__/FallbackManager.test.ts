import { describe, it, expect, vi, beforeEach } from 'vitest';
import FallbackManager from '../application/FallbackManager.js';

describe('FallbackManager.ts - Error Resilience', () => {
  it('should call Provider 2 if Provider 1 fails', async () => {
    const strategy1 = { 
      name: 'offline', 
      translate: vi.fn().mockRejectedValue(new Error('Fail')),
      isAvailable: vi.fn().mockResolvedValue(true)
    };
    const strategy2 = { 
      name: 'libre', 
      translate: vi.fn().mockResolvedValue('Success'),
      isAvailable: vi.fn().mockResolvedValue(true)
    };

    const manager = new FallbackManager([strategy1 as any, strategy2 as any], {
      defaultLang: 'en',
      modes: ['en', 'ur'],
      fallbackChain: { strategies: ['offline', 'libre'] }
    });

    const result = await manager.translateWithFallback('hello', 'ur');

    expect(strategy1.translate).toHaveBeenCalled();
    expect(strategy2.translate).toHaveBeenCalled();
    expect(result).toBe('Success');
  });

  it('should return original text if ALL providers fail', async () => {
    const strategy1 = { 
      name: 'offline', 
      translate: vi.fn().mockRejectedValue(new Error('Fail')),
      isAvailable: vi.fn().mockResolvedValue(true)
    };

    const manager = new FallbackManager([strategy1 as any], {
      defaultLang: 'en',
      modes: ['en', 'ur'],
      fallbackChain: { strategies: ['offline'] }
    });

    const result = await manager.translateWithFallback('original text', 'ur');

    expect(result).toBe('original text');
    expect(strategy1.translate).toHaveBeenCalled();
  });

  it('should skip unavailable strategies', async () => {
    const strategy1 = { 
      name: 'offline', 
      translate: vi.fn(),
      isAvailable: vi.fn().mockResolvedValue(false) // Not available
    };
    const strategy2 = { 
      name: 'libre', 
      translate: vi.fn().mockResolvedValue('Fallback Success'),
      isAvailable: vi.fn().mockResolvedValue(true)
    };

    const manager = new FallbackManager([strategy1 as any, strategy2 as any], {
      defaultLang: 'en',
      modes: ['en', 'ur'],
      fallbackChain: { strategies: ['offline', 'libre'] }
    });

    const result = await manager.translateWithFallback('hello', 'ur');

    expect(strategy1.translate).not.toHaveBeenCalled();
    expect(strategy2.translate).toHaveBeenCalled();
    expect(result).toBe('Fallback Success');
  });
});
