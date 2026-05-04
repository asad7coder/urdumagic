// ============================================================================
// WOW FIRST IMPRESSION API
// 1-line usage for instant adoption and excitement
// ============================================================================

import UrduMagic from '../UrduMagic.js';
import type { UrduMagicConfig } from '../types.js';

/**
 * WOW API - 1-line usage that creates excitement
 * 
 * Design Goals:
 * - Zero configuration needed
 * - Instant gratification
 * - Magical feeling
 * - Social media shareable
 */

/**
 * Main WOW function - 1-line magic
 * 
 * @param text - Text to translate/transliterate
 * @param target - Optional target ('ur', 'en', 'auto')
 * @returns Promise with result
 * 
 * @example
 * ```typescript
 * // 1-line magic - auto-detect and convert
 * const result = await UrduMagic("Hello World");
 * // → "ہیلو ورلڈ"
 * 
 * // Explicit target
 * const urdu = await UrduMagic("salam", 'ur');
 * // → "سلام"
 * 
 * // Auto-detect and convert appropriately
 * const smart = await UrduMagic.auto("helo world");
 * // → "ہیلو ورلڈ" (detected Roman Urdu → Urdu script)
 * ```
 */
async function UrduMagicWow(
  text: string, 
  target?: 'ur' | 'en' | 'auto'
): Promise<string> {
  // Auto-initialize with zero config
  const instance = UrduMagic.init();
  
  if (!target || target === 'auto') {
    // Smart auto-detect and convert
    const script = instance.detectScript(text);
    
    if (script === 'english' || script === 'latin') {
      // English → Urdu
      return await instance.translate(text, 'ur');
    } else if (script === 'arabic') {
      // Urdu → Roman Urdu
      return await instance.toRoman(text);
    } else if (script === 'roman-urdu') {
      // Roman Urdu → Urdu script
      return await instance.toUrdu(text);
    } else {
      // Default to translation
      return await instance.translate(text, 'ur');
    }
  } else {
    // Explicit target
    if (target === 'ur') {
      return await instance.translate(text, 'ur');
    } else {
      return await instance.translate(text, 'en');
    }
  }
}

/**
 * Auto-detect and convert helper
 * 
 * @param text - Text to process
 * @returns Promise with converted text
 * 
 * @example
 * ```typescript
 * // Smart conversion based on detection
 * const result1 = await UrduMagic.auto("Hello"); // → Urdu
 * const result2 = await UrduMagic.auto("ہیلو"); // → Roman Urdu
 * const result3 = await UrduMagic.auto("helo"); // → Urdu script
 * ```
 */
async function UrduMagicAuto(text: string): Promise<string> {
  return await UrduMagicWow(text, 'auto');
}

/**
 * Batch WOW API - process multiple texts
 * 
 * @param texts - Array of texts to process
 * @param target - Optional target for all
 * @returns Promise with array of results
 * 
 * @example
 * ```typescript
 * const results = await UrduMagic.batch([
 *   "Hello World",
 *   "salam", 
 *   "helo world"
 * ]);
 * // → ["ہیلو ورلڈ", "سلام", "ہیلو ورلڈ"]
 * ```
 */
async function UrduMagicBatch(
  texts: string[], 
  target?: 'ur' | 'en' | 'auto'
): Promise<string[]> {
  const instance = UrduMagic.init();
  const results: string[] = [];
  
  for (const text of texts) {
    try {
      const result = target === 'auto' 
        ? await UrduMagicAuto(text)
        : await UrduMagicWow(text, target);
      results.push(result);
    } catch (error) {
      // Keep original text on error
      results.push(text);
    }
  }
  
  return results;
}

/**
 * Magic mode WOW - instant page translation
 * 
 * @param selector - CSS selector (optional, defaults to body)
 * @param confirm - Show confirmation dialog (default: true)
 * 
 * @example
 * ```typescript
 * // One-line magic mode with confirmation
 * UrduMagic.magic(); // Shows "Translate this page?" dialog
 * 
 * // Direct magic mode (developer confirmed)
 * UrduMagic.magic('.content', false);
 * ```
 */
function UrduMagicMagic(selector: string = 'body', confirm: boolean = true): void {
  if (confirm && typeof window !== 'undefined') {
    // Show confirmation dialog
    const shouldProceed = window.confirm(
      '🪄 UrduMagic: Translate this page to Urdu?\n\n' +
      'This will convert English text to Urdu script.\n' +
      'You can undo by refreshing the page.'
    );
    
    if (!shouldProceed) return;
  }
  
  // Initialize and enable magic mode
  const instance = UrduMagic.init({
    magicMode: { 
      enabled: true, 
      selector,
      skipClasses: ['no-translate', 'code', 'pre'],
      preserveOriginal: true
    }
  });
  
  instance.enableMagicMode();
}

/**
 * Quick transliteration helpers
 */
async function UrduMagicToUrdu(text: string): Promise<string> {
  const instance = UrduMagic.init();
  return await instance.toUrdu(text);
}

async function UrduMagicToRoman(text: string): Promise<string> {
  const instance = UrduMagic.init();
  return await instance.toRoman(text);
}

/**
 * Language detection helper
 */
function UrduMagicDetect(text: string): string {
  const instance = UrduMagic.init();
  const script = instance.detectScript(text);
  
  const scriptNames = {
    'english': 'English',
    'arabic': 'Urdu Script',
    'roman-urdu': 'Roman Urdu',
    'latin': 'Latin',
    'mixed': 'Mixed Script'
  };
  
  return scriptNames[script] || 'Unknown';
}

// ============================================================================
// EXPORT WOW API
// ============================================================================

// Create the main WOW function
const UrduMagicWowMain = Object.assign(UrduMagicWow, {
  // Auto helper
  auto: UrduMagicAuto,
  
  // Batch processing
  batch: UrduMagicBatch,
  
  // Magic mode
  magic: UrduMagicMagic,
  
  // Quick helpers
  toUrdu: UrduMagicToUrdu,
  toRoman: UrduMagicToRoman,
  detect: UrduMagicDetect,
  
  // Original API (still available)
  init: UrduMagic.init.bind(UrduMagic),
  quickTranslate: UrduMagic.quickTranslate.bind(UrduMagic),
  quickTransliterate: UrduMagic.quickTransliterate.bind(UrduMagic)
});

// Export as default
export default UrduMagicWowMain;

// Also export named functions for tree-shaking
export {
  UrduMagicWow as default,
  UrduMagicAuto,
  UrduMagicBatch,
  UrduMagicMagic,
  UrduMagicToUrdu,
  UrduMagicToRoman,
  UrduMagicDetect
};

// ============================================================================
// GLOBAL REGISTRATION (for instant usage)
// ============================================================================

if (typeof window !== 'undefined') {
  // Register globally for instant usage
  (window as any).UrduMagic = UrduMagicWowMain;
  
  // Add to global for CDN usage
  (window as any).UrduMagicAuto = UrduMagicAuto;
  (window as any).UrduMagicMagic = UrduMagicMagic;
}
