// ============================================================================
// PREDICTABLE 1-LINE API
// Safe, predictable behavior with clear definitions
// ============================================================================

import UrduMagic from '../UrduMagic.js';
import type { UrduMagicInstance } from '../types.js';

/**
 * Predictable 1-line API with clear behavior
 * 
 * Design Principles:
 * - No ambiguity in function behavior
 * - Clear input-output mapping
 * - Predictable error handling
 * - Safe defaults
 */

/**
 * Auto-detect and convert text with predictable behavior
 * 
 * @param text - Text to process
 * @returns Promise with converted text
 * 
 * Behavior Rules:
 * 1. English/Latin text → Translate to Urdu script
 * 2. Roman Urdu text → Convert to Urdu script  
 * 3. Urdu script text → Convert to Roman Urdu
 * 4. Mixed/ambiguous text → Translate to Urdu script
 * 5. Empty/invalid text → Return as-is
 * 
 * @example
 * ```typescript
 * // Predictable behavior
 * const result1 = await UrduMagic.auto("Hello");        // English → Urdu script
 * const result2 = await UrduMagic.auto("salam");        // Roman Urdu → Urdu script
 * const result3 = await UrduMagic.auto("سلام");         // Urdu script → Roman Urdu
 * const result4 = await UrduMagic.auto("");             // Empty → returns ""
 * ```
 */
export async function UrduMagicAuto(text: string): Promise<string> {
  // Input validation
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  // Trim whitespace
  const trimmedText = text.trim();
  if (!trimmedText) {
    return text; // Return original (preserves spacing)
  }

  try {
    // Initialize instance
    const instance = UrduMagic.init();
    
    // Detect script type
    const script = instance.detectScript(trimmedText);
    
    // Apply predictable conversion rules
    switch (script) {
      case 'english':
      case 'latin':
        // English/Latin → Urdu script (translation)
        return await instance.translate(trimmedText, 'ur');
        
      case 'roman-urdu':
        // Roman Urdu → Urdu script (transliteration)
        return await instance.toUrdu(trimmedText);
        
      case 'arabic':
        // Urdu script → Roman Urdu (transliteration)
        return await instance.toRoman(trimmedText);
        
      case 'mixed':
      case 'unknown':
      default:
        // Mixed/ambiguous → Translate to Urdu script (best effort)
        try {
          return await instance.translate(trimmedText, 'ur');
        } catch (error) {
          // Fallback: return original if translation fails
          console.warn('Auto conversion failed, returning original:', error);
          return text;
        }
    }
    
  } catch (error) {
    // Always return original text on any error
    console.error('UrduMagic.auto failed:', error);
    return text;
  }
}

/**
 * Explicit conversion functions for predictable behavior
 */

/**
 * Convert English to Urdu script
 */
export async function UrduMagicToUrdu(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text || '';
  
  try {
    const instance = UrduMagic.init();
    return await instance.translate(text.trim(), 'ur');
  } catch (error) {
    console.error('UrduMagic.toUrdu failed:', error);
    return text;
  }
}

/**
 * Convert Urdu script to Roman Urdu
 */
export async function UrduMagicToRoman(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text || '';
  
  try {
    const instance = UrduMagic.init();
    return await instance.toRoman(text.trim());
  } catch (error) {
    console.error('UrduMagic.toRoman failed:', error);
    return text;
  }
}

/**
 * Convert Roman Urdu to Urdu script
 */
export async function UrduMagicRomanToUrdu(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text || '';
  
  try {
    const instance = UrduMagic.init();
    return await instance.toUrdu(text.trim());
  } catch (error) {
    console.error('UrduMagic.romanToUrdu failed:', error);
    return text;
  }
}

/**
 * Batch processing with predictable behavior
 */
export async function UrduMagicBatch(
  texts: string[], 
  mode: 'auto' | 'toUrdu' | 'toRoman' = 'auto'
): Promise<string[]> {
  if (!Array.isArray(texts)) return [];
  
  const results: string[] = [];
  
  for (const text of texts) {
    try {
      let result: string;
      
      switch (mode) {
        case 'auto':
          result = await UrduMagicAuto(text);
          break;
        case 'toUrdu':
          result = await UrduMagicToUrdu(text);
          break;
        case 'toRoman':
          result = await UrduMagicToRoman(text);
          break;
        default:
          result = text;
      }
      
      results.push(result);
    } catch (error) {
      // Always include original text on error
      results.push(text);
    }
  }
  
  return results;
}

/**
 * Safe magic mode with predictable behavior
 */
export function UrduMagicMagic(selector: string = 'body'): void {
  if (typeof window === 'undefined') {
    console.warn('UrduMagic.magic() only works in browser environment');
    return;
  }

  // Show confirmation dialog for safety
  const confirmed = window.confirm(
    '🪄 UrduMagic: Translate this page to Urdu?\n\n' +
    'This will convert English text to Urdu script.\n' +
    'Original text will be preserved.\n' +
    'You can undo by refreshing the page.\n\n' +
    'Continue?'
  );

  if (!confirmed) return;

  try {
    const instance = UrduMagic.init({
      defaultLang: 'en',
      modes: ['en', 'ur', 'roman'],
      magicMode: {
        enabled: true,
        selector,
        skipTags: ['script', 'style', 'noscript'],
        skipClasses: ['no-translate', 'code', 'pre'],
        preserveOriginal: true,
        debounceMs: 500
      }
    });

    instance.enableMagicMode();
    
    // Show success notification
    showSuccessNotification(selector);
    
  } catch (error) {
    console.error('UrduMagic.magic() failed:', error);
    showErrorNotification(error);
  }
}

/**
 * Utility functions
 */

/**
 * Detect script type (predictable behavior)
 */
export function UrduMagicDetect(text: string): string {
  if (!text || typeof text !== 'string') return 'unknown';
  
  try {
    const instance = UrduMagic.init();
    const script = instance.detectScript(text.trim());
    
    const scriptNames = {
      'english': 'English',
      'arabic': 'Urdu Script',
      'roman-urdu': 'Roman Urdu',
      'latin': 'Latin Script',
      'mixed': 'Mixed Script',
      'unknown': 'Unknown'
    };
    
    return scriptNames[script] || 'Unknown';
  } catch (error) {
    console.error('UrduMagic.detect() failed:', error);
    return 'Unknown';
  }
}

/**
 * Check if UrduMagic is available
 */
export function UrduMagicAvailable(): boolean {
  try {
    const instance = UrduMagic.init();
    return !!instance;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function showSuccessNotification(selector: string): void {
  if (typeof document === 'undefined') return;

  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 300px;
  `;
  
  const isBody = selector === 'body';
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 18px;">✨</span>
      <div>
        <div style="font-weight: 600;">UrduMagic Active</div>
        <div style="font-size: 12px; opacity: 0.9;">
          ${isBody ? 'Entire page' : `"${selector}"`} is now in Urdu
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

function showErrorNotification(error: any): void {
  if (typeof document === 'undefined') return;

  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 300px;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 18px;">❌</span>
      <div>
        <div style="font-weight: 600;">UrduMagic Error</div>
        <div style="font-size: 12px; opacity: 0.9;">
          ${error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// ============================================================================
// MAIN API OBJECT
// ============================================================================

/**
 * Main UrduMagic API object with predictable behavior
 */
const UrduMagicAPI = {
  // Primary auto-detection function
  auto: UrduMagicAuto,
  
  // Explicit conversion functions
  toUrdu: UrduMagicToUrdu,
  toRoman: UrduMagicToRoman,
  romanToUrdu: UrduMagicRomanToUrdu,
  
  // Batch processing
  batch: UrduMagicBatch,
  
  // Magic mode
  magic: UrduMagicMagic,
  
  // Utilities
  detect: UrduMagicDetect,
  available: UrduMagicAvailable,
  
  // Original API (still available)
  init: UrduMagic.init.bind(UrduMagic),
  quickTranslate: UrduMagic.quickTranslate.bind(UrduMagic),
  quickTransliterate: UrduMagic.quickTransliterate.bind(UrduMagic)
};

// ============================================================================
// EXPORTS
// ============================================================================

export default UrduMagicAPI;
export {
  UrduMagicAuto as auto,
  UrduMagicToUrdu as toUrdu,
  UrduMagicToRoman as toRoman,
  UrduMagicRomanToUrdu as romanToUrdu,
  UrduMagicBatch as batch,
  UrduMagicMagic as magic,
  UrduMagicDetect as detect,
  UrduMagicAvailable as available
};

// ============================================================================
// GLOBAL REGISTRATION
// ============================================================================

if (typeof window !== 'undefined') {
  (window as any).UrduMagic = UrduMagicAPI;
}
