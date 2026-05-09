// ============================================================================
// SMART TRANSLATOR
// Auto-detect and translate feature
// ============================================================================

import type { UrduMagicInstance, ScriptType } from '../types.js';
import { UrduMagic } from '../index.js';

/**
 * Smart translation result
 */
export interface SmartTranslationResult {
  originalText: string;
  translatedText: string;
  detectedScript: ScriptType;
  operation: 'translate' | 'transliterate-ur' | 'transliterate-roman';
  targetLang: 'ur' | 'en';
  confidence: number;
}

/**
 * Smart translator with auto-detection
 * - Detects script type automatically
 * - Chooses appropriate operation
 * - Handles mixed scripts
 */
export class SmartTranslator {
  private instance: UrduMagicInstance;

  constructor(instance: UrduMagicInstance) {
    this.instance = instance;
  }

  /**
   * Auto-detect and translate text
   * 
   * @param text - Text to process
   * @param preferredTarget - Preferred target language (optional)
   * @returns Smart translation result
   * 
   * @example
   * ```typescript
   * const smart = new SmartTranslator(instance);
   * 
   * // English to Urdu
   * const result1 = await smart.autoDetectAndTranslate('Hello World');
   * // => { operation: 'translate', targetLang: 'ur', translatedText: 'ہیلو ورلڈ' }
   * 
   * // Urdu to Roman Urdu
   * const result2 = await smart.autoDetectAndTranslate('ہیلو ورلڈ');
   * // => { operation: 'transliterate-roman', targetLang: 'en', translatedText: 'helo world' }
   * 
   * // Roman Urdu to Urdu script
   * const result3 = await smart.autoDetectAndTranslate('helo world');
   * // => { operation: 'transliterate-ur', targetLang: 'ur', translatedText: 'ہیلو ورلڈ' }
   * ```
   */
  async autoDetectAndTranslate(
    text: string,
    preferredTarget?: 'ur' | 'en'
  ): Promise<SmartTranslationResult> {
    if (!text || !text.trim()) {
      return {
        originalText: text,
        translatedText: text,
        detectedScript: 'latin',
        operation: 'translate',
        targetLang: 'en',
        confidence: 1.0
      };
    }

    const detectedScript = UrduMagic.detectScript(text);

    // Determine the best operation based on detected script
    const operation = this.determineOperation(detectedScript, preferredTarget);

    let translatedText: string;
    let targetLang: 'ur' | 'en';

    try {
      switch (operation) {
        case 'translate':
          targetLang = preferredTarget || 'ur';
          translatedText = await this.instance.translate(text, targetLang);
          break;

        case 'transliterate-ur':
          targetLang = 'ur';
          translatedText = await this.instance.toUrdu(text);
          break;

        case 'transliterate-roman':
          targetLang = 'en';
          translatedText = await this.instance.toRoman(text);
          break;

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        originalText: text,
        translatedText,
        detectedScript,
        operation,
        targetLang,
        confidence: this.calculateConfidence(detectedScript, operation)
      };

    } catch (error) {
      // Fallback to original text if operation fails
      return {
        originalText: text,
        translatedText: text,
        detectedScript,
        operation: 'translate',
        targetLang: 'en',
        confidence: 0
      };
    }
  }

  /**
   * Batch auto-detect and translate
   */
  async autoDetectAndTranslateBatch(
    texts: string[],
    preferredTarget?: 'ur' | 'en'
  ): Promise<SmartTranslationResult[]> {
    const results = await Promise.allSettled(
      texts.map(text => this.autoDetectAndTranslate(text, preferredTarget))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          originalText: texts[index],
          translatedText: texts[index],
          detectedScript: 'latin',
          operation: 'translate',
          targetLang: 'en',
          confidence: 0
        };
      }
    });
  }

  /**
   * Get translation suggestions for mixed scripts
   */
  getSuggestions(text: string): Array<{
    operation: 'translate' | 'transliterate-ur' | 'transliterate-roman';
    description: string;
    confidence: number;
  }> {
    const detectedScript = UrduMagic.detectScript(text);

    const suggestions: Array<{
      operation: 'translate' | 'transliterate-ur' | 'transliterate-roman';
      description: string;
      confidence: number;
    }> = [];

    if (detectedScript === 'english' || detectedScript === 'latin') {
      suggestions.push({
        operation: 'translate',
        description: 'Translate to Urdu',
        confidence: 0.9
      });
    }

    if (detectedScript === 'arabic') {
      suggestions.push({
        operation: 'transliterate-roman',
        description: 'Convert to Roman Urdu',
        confidence: 0.95
      });
    }

    if (detectedScript === 'roman-urdu') {
      suggestions.push({
        operation: 'transliterate-ur',
        description: 'Convert to Urdu script',
        confidence: 0.95
      });
    }

    if (detectedScript === 'mixed') {
      suggestions.push({
        operation: 'translate',
        description: 'Translate to Urdu (best effort)',
        confidence: 0.7
      });
      suggestions.push({
        operation: 'transliterate-roman',
        description: 'Convert to Roman Urdu',
        confidence: 0.8
      });
    }

    return suggestions;
  }

  /**
   * Determine the best operation for the detected script
   */
  private determineOperation(
    detectedScript: ScriptType,
    preferredTarget?: 'ur' | 'en'
  ): 'translate' | 'transliterate-ur' | 'transliterate-roman' {
    switch (detectedScript) {
      case 'english':
      case 'latin':
        return 'translate'; // Translate English to Urdu

      case 'arabic':
        return 'transliterate-roman'; // Convert Urdu to Roman Urdu

      case 'roman-urdu':
        return 'transliterate-ur'; // Convert Roman Urdu to Urdu script

      case 'mixed':
        // For mixed scripts, use preferred target or default to translation
        if (preferredTarget === 'en') {
          return 'transliterate-roman';
        }
        return 'translate';

      default:
        return 'translate';
    }
  }

  /**
   * Calculate confidence score for the operation
   */
  private calculateConfidence(
    detectedScript: ScriptType,
    operation: 'translate' | 'transliterate-ur' | 'transliterate-roman'
  ): number {
    // High confidence for clear cases
    if (detectedScript === 'english' && operation === 'translate') return 0.9;
    if (detectedScript === 'arabic' && operation === 'transliterate-roman') return 0.95;
    if (detectedScript === 'roman-urdu' && operation === 'transliterate-ur') return 0.95;

    // Lower confidence for mixed cases
    if (detectedScript === 'mixed') return 0.7;

    // Default confidence
    return 0.8;
  }
}

/**
 * Convenience function for quick smart translation
 */
async function smartTranslate(
  instance: UrduMagicInstance,
  text: string,
  preferredTarget?: 'ur' | 'en'
): Promise<SmartTranslationResult> {
  const smart = new SmartTranslator(instance);
  return await smart.autoDetectAndTranslate(text, preferredTarget);
}

/**
 * Convenience function for batch smart translation
 */
async function smartTranslateBatch(
  instance: UrduMagicInstance,
  texts: string[],
  preferredTarget?: 'ur' | 'en'
): Promise<SmartTranslationResult[]> {
  const smart = new SmartTranslator(instance);
  return await smart.autoDetectAndTranslateBatch(texts, preferredTarget);
}

// ============================================================================
// EXPORTS
// ============================================================================

export { SmartTranslator as default, smartTranslate, smartTranslateBatch };
