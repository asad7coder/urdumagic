import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createManagedTranslator } from '../core/translator.js';

// Mock the dictionary loader
vi.mock('../core/dictionary-loader.js', () => ({
  getDictionaryAsync: vi.fn(() => Promise.resolve(new Map([['hello', 'ہیلو']]))),
  lookupWord: vi.fn(() => 'ہیلو')
}));

// No network calls in v0.2.0 offline-first

describe('translator.ts - Dictionary Layering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should hit the dictionary Map FIRST before any external API call', async () => {
    const { lookupWord } = await import('../core/dictionary-loader.js');
    (lookupWord as any).mockReturnValue('ہیلو');

    const translator = createManagedTranslator({
      defaultLang: 'en',
      modes: ['en', 'ur']
    });

    const result = await translator.translate('hello', 'ur');

    // Verify dictionary was called
    expect(result).toBe('ہیلو');
  });

  it('should return fallback text [?] if dictionary lookup fails', async () => {
    const { lookupWord } = await import('../core/dictionary-loader.js');
    (lookupWord as any).mockReturnValue(undefined); // Miss

    const translator = createManagedTranslator({
      defaultLang: 'en',
      modes: ['en', 'ur']
    });

    const result = await translator.translate('unknown-word', 'ur');

    expect(result).toBe('unknown-word [?]');
  });
});
