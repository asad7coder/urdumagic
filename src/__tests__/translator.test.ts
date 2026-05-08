import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createManagedTranslator } from '../core/translator.js';
import { ENGLISH_URDU_DICT } from '../data/english-urdu-dictionary.js';

// Mock the dictionary
vi.mock('../data/english-urdu-dictionary.js', () => ({
  ENGLISH_URDU_DICT: {
    get: vi.fn()
  }
}));

// Mock the fetch API for LibreTranslate
global.fetch = vi.fn();

describe('translator.ts - Dictionary Layering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should hit the dictionary Map FIRST before any external API call', async () => {
    const mockDict = ENGLISH_URDU_DICT as any;
    mockDict.get.mockReturnValue({ urdu: 'ہیلو', roman: 'hello', category: 'greetings' });

    const translator = createManagedTranslator({
      defaultLang: 'en',
      modes: ['en', 'ur']
    });

    const result = await translator.translate('hello', 'ur');

    // Verify dictionary was called
    expect(mockDict.get).toHaveBeenCalledWith('hello');
    expect(result).toBe('ہیلو');

    // Verify fetch was NOT called (short-circuit)
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should call external API if dictionary lookup fails', async () => {
    const mockDict = ENGLISH_URDU_DICT as any;
    mockDict.get.mockReturnValue(undefined); // Miss

    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ translatedText: 'ہیلو (API)' })
    });

    const translator = createManagedTranslator({
      defaultLang: 'en',
      modes: ['en', 'ur'],
      libreUrl: 'https://api.test'
    });

    const result = await translator.translate('hello', 'ur');

    expect(mockDict.get).toHaveBeenCalledWith('hello');
    expect(fetch).toHaveBeenCalled();
    expect(result).toBe('ہیلو (API)');
  });
});
