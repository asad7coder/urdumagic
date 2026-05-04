// ============================================================================
// URDU MAGIC - FINAL PUBLIC API
// Simple on the outside, powerful on the inside
// ============================================================================

import type { UrduMagicConfig, UrduMagicInstance, LangMode } from './types.js';
import { TranslationEngine } from './core/TranslationEngine.js';
import { MagicModeController } from './ui/MagicModeController.js';
import { LanguageSwitcher } from './ui/LanguageSwitcher.js';

/**
 * UrduMagic - Simple multilingual library for the web
 * 
 * Features:
 * - English ↔ Urdu ↔ Roman Urdu translation
 * - Automatic page translation (Magic Mode)
 * - Multiple translation strategies
 * - Zero configuration required
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const um = UrduMagic.init();
 * const result = await um.translate('Hello', 'ur');
 * 
 * // With configuration
 * const um = UrduMagic.init({
 *   defaultLang: 'ur',
 *   apiKey: 'your-api-key'
 * });
 * ```
 */
export class UrduMagic {
  private static instance: UrduMagicInstance | null = null;
  private static engine: TranslationEngine | null = null;
  private static magicMode: MagicModeController | null = null;
  private static languageSwitcher: LanguageSwitcher | null = null;

  /**
   * Initialize UrduMagic with optional configuration
   * 
   * @param config - Optional configuration
   * @returns UrduMagic instance
   * 
   * @example
   * ```typescript
   * // Zero config - works out of the box
   * const um = UrduMagic.init();
   * 
   * // With API key for better translations
   * const um = UrduMagic.init({
   *   apiKey: 'your-libretranslate-key',
   *   defaultLang: 'ur'
   * });
   * 
   * // Premium configuration
   * const um = UrduMagic.init({
   *   strategy: 'google',
   *   googleApiKey: 'your-google-key',
   *   showSwitcher: true
   * });
   * ```
   */
  static init(config: UrduMagicConfig = {}): UrduMagicInstance {
    // Clean up existing instance
    if (UrduMagic.instance) {
      UrduMagic.instance.destroy();
    }

    // Create translation engine (hides all complexity)
    UrduMagic.engine = new TranslationEngine(config);

    // Create UI components
    UrduMagic.magicMode = new MagicModeController(UrduMagic.engine);
    UrduMagic.languageSwitcher = new LanguageSwitcher(config);

    // Create public instance
    UrduMagic.instance = {
      // Core translation methods
      translate: async (text: string, targetLang: 'ur' | 'en') => {
        if (!UrduMagic.engine) throw new Error('UrduMagic not initialized');
        return await UrduMagic.engine.translate(text, targetLang);
      },

      // Transliteration methods
      toUrdu: async (text: string) => {
        if (!UrduMagic.engine) throw new Error('UrduMagic not initialized');
        return await UrduMagic.engine.transliterate(text, 'ur');
      },

      toRoman: async (text: string) => {
        if (!UrduMagic.engine) throw new Error('UrduMagic not initialized');
        return await UrduMagic.engine.transliterate(text, 'roman');
      },

      // Language management
      setLanguage: async (lang: LangMode) => {
        if (!UrduMagic.engine) throw new Error('UrduMagic not initialized');
        await UrduMagic.engine.setLanguage(lang);
        UrduMagic.languageSwitcher?.setCurrentLanguage(lang);
        config.onLangSwitch?.(lang);
      },

      getLanguage: () => {
        return UrduMagic.engine?.getCurrentLanguage() || 'en';
      },

      // Magic mode (automatic page translation)
      enableMagicMode: () => {
        if (!UrduMagic.magicMode) throw new Error('UrduMagic not initialized');
        UrduMagic.magicMode.enable();
      },

      disableMagicMode: () => {
        if (!UrduMagic.magicMode) throw new Error('UrduMagic not initialized');
        UrduMagic.magicMode.disable();
      },

      isMagicModeEnabled: () => {
        return UrduMagic.magicMode?.isEnabled() || false;
      },

      // Utility methods
      detectScript: (text: string) => {
        return UrduMagic.engine?.detectScript(text) || 'latin';
      },

      // Lifecycle
      destroy: () => {
        UrduMagic.engine?.destroy();
        UrduMagic.magicMode?.destroy();
        UrduMagic.languageSwitcher?.destroy();
        UrduMagic.instance = null;
        UrduMagic.engine = null;
        UrduMagic.magicMode = null;
        UrduMagic.languageSwitcher = null;
      }
    };

    // Auto-enable features based on config
    if (config.magicMode?.enabled) {
      UrduMagic.instance.enableMagicMode();
    }

    if (config.showSwitcher) {
      UrduMagic.languageSwitcher?.show();
    }

    return UrduMagic.instance;
  }

  /**
   * Quick translate - one-liner for simple use cases
   * 
   * @param text - Text to translate
   * @param targetLang - Target language
   * @param config - Optional configuration
   * @returns Translated text
   * 
   * @example
   * ```typescript
   * // One-liner translation
   * const result = await UrduMagic.quickTranslate('Hello', 'ur');
   * 
   * // With API key
   * const result = await UrduMagic.quickTranslate('Hello', 'ur', {
   *   apiKey: 'your-key'
   * });
   * ```
   */
  static async quickTranslate(
    text: string, 
    targetLang: 'ur' | 'en',
    config: UrduMagicConfig = {}
  ): Promise<string> {
    const tempInstance = UrduMagic.init(config);
    const result = await tempInstance.translate(text, targetLang);
    tempInstance.destroy();
    return result;
  }

  /**
   * Quick transliteration - one-liner for Roman Urdu conversion
   * 
   * @param text - Text to transliterate
   * @param toLang - Target script ('ur' or 'roman')
   * @returns Transliterated text
   * 
   * @example
   * ```typescript
   * // Roman Urdu to Urdu script
   * const urdu = UrduMagic.quickTransliterate('salam', 'ur');
   * 
   * // Urdu script to Roman Urdu
   * const roman = UrduMagic.quickTransliterate('سلام', 'roman');
   * ```
   */
  static quickTransliterate(
    text: string,
    toLang: 'ur' | 'roman'
  ): string {
    // Direct transliteration without initialization
    // Uses built-in transliteration engine
    const tempInstance = UrduMagic.init();
    
    if (toLang === 'ur') {
      return tempInstance.toUrdu(text);
    } else {
      return tempInstance.toRoman(text);
    }
  }

  /**
   * Get current instance
   * 
   * @returns Current UrduMagic instance or null
   */
  static getInstance(): UrduMagicInstance | null {
    return UrduMagic.instance;
  }

  /**
   * Check if UrduMagic is initialized
   * 
   * @returns True if initialized
   */
  static isInitialized(): boolean {
    return UrduMagic.instance !== null;
  }

  /**
   * Get library version
   * 
   * @returns Version string
   */
  static getVersion(): string {
    return '1.0.0'; // Will be updated by build process
  }

  /**
   * Get supported languages
   * 
   * @returns Array of supported language codes
   */
  static getSupportedLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'en', name: 'English' },
      { code: 'ur', name: 'Urdu' },
      { code: 'roman', name: 'Roman Urdu' }
    ];
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default UrduMagic;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { UrduMagicConfig, UrduMagicInstance, LangMode };

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Create UrduMagic instance with React hook support
 * 
 * @param config - Configuration
 * @returns React hook and instance
 * 
 * @example
 * ```typescript
 * import { createUrduMagicReact } from 'urdumagic';
 * 
 * const { useUrduMagic, instance } = createUrduMagicReact({
 *   defaultLang: 'ur'
 * });
 * 
 * // In React component
 * function MyComponent() {
 *   const { translate, setLanguage } = useUrduMagic();
 *   // ...
 * }
 * ```
 */
export function createUrduMagicReact(config: UrduMagicConfig = {}) {
  const instance = UrduMagic.init(config);
  
  const useUrduMagic = () => {
    // This would be implemented in a separate React hooks file
    // For now, return basic functionality
    return {
      translate: instance.translate,
      setLanguage: instance.setLanguage,
      getLanguage: instance.getLanguage,
      enableMagicMode: instance.enableMagicMode,
      disableMagicMode: instance.disableMagicMode,
      isMagicModeEnabled: instance.isMagicModeEnabled
    };
  };

  return { useUrduMagic, instance };
}

// ============================================================================
// GLOBAL INITIALIZATION (Optional)
// ============================================================================

/**
 * Auto-initialize UrduMagic if data-urdumagic attribute is found
 * This allows zero-configuration usage:
 * 
 * ```html
 * <div data-urdumagic>
 *   <p>Hello World</p>
 * </div>
 * ```
 */
(() => {
  if (typeof window !== 'undefined') {
    const autoInitElements = document.querySelectorAll('[data-urdumagic]');
    
    if (autoInitElements.length > 0) {
      // Auto-initialize with default settings
      UrduMagic.init({
        magicMode: { enabled: true }
      });
    }
  }
})();
