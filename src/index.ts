import { detectScript as detectScriptImpl } from './core/detector.js';
import { toRoman as toRomanImpl, toUrdu as toUrduImpl } from './core/transliterator.js';
import {
  createManagedTranslator,
  type ManagedTranslator,
} from './core/translator.js';
import { getDictionaryAsync } from './core/dictionary-loader.js';
import { createMagicDom } from './client/dom-walker.js';
import { createLanguageSwitcher } from './client/ui-switcher.js';
import { EnglishEngine } from './engines/englishEngine.js';
import { renderToString as renderToStringImpl } from './server/renderToString.js';

import type {
  LangMode,
  ScriptType,
  UrduMagicConfig,
  UrduMagicInstance,
} from './types.js';

export type {
  LangMode,
  ScriptType,
  UrduMagicConfig,
  UrduMagicInstance,
} from './types.js';

let activeTranslator: ManagedTranslator | undefined;
let fallbackTranslator: ManagedTranslator | undefined;
let activeInstance: UrduMagicInstance | undefined;

function getFallbackTranslator(): ManagedTranslator {
  if (fallbackTranslator === undefined) {
    fallbackTranslator = createManagedTranslator({
      defaultLang: 'en',
      modes: ['en', 'ur', 'roman'],
      showSwitcher: false,
      strategy: 'offline',
    });
  }
  return fallbackTranslator;
}

function resolveTranslator(): ManagedTranslator {
  return activeTranslator ?? getFallbackTranslator();
}

/**
 * UrduMagic adds English, Urdu script, and Roman Urdu support to websites.
 */
export class UrduMagic {
  static init(config: UrduMagicConfig): UrduMagicInstance {
    const isBrowser = typeof document !== 'undefined';

    // Lazy load dictionary
    void getDictionaryAsync();

    if (!config.modes.includes(config.defaultLang)) {
      throw new Error('UrduMagicConfig.defaultLang must be included in modes');
    }

    activeInstance?.destroy();
    activeTranslator?.dispose();

    const managed = createManagedTranslator(config);
    activeTranslator = managed;

    let magic: any;
    if (isBrowser) {
      magic = createMagicDom(document, {
        debounceMs: config.performance?.debounceMs ?? config.magicMode?.debounceMs ?? 300,
        translate: (text, targetLang) => managed.translate(text, targetLang),
      });
    }

    let current: LangMode = config.defaultLang;

    const applyAll = async (lang: LangMode): Promise<void> => {
      current = lang;
      switcher?.setActive(lang);
      if (isBrowser && magic) {
        await magic.applyLanguage(lang);
        // Dispatch global event for other components to sync
        window.dispatchEvent(new CustomEvent('urdumagic-lang-switch', { detail: { lang } }));
      }

      config.onLangSwitch?.(lang);
    };

    const switcher =
      !isBrowser || config.showSwitcher === false
        ? undefined
        : createLanguageSwitcher(document, config.modes, (lang) => {
          void applyAll(lang);
        });

    const instance: UrduMagicInstance = {
      destroy(): void {
        if (isBrowser) {
          magic?.destroy();
          switcher?.destroy();
        }
        managed.dispose();
        if (activeTranslator === managed) activeTranslator = undefined;
        if (activeInstance === instance) activeInstance = undefined;
      },

      switchLang(lang: LangMode): void {
        if (!config.modes.includes(lang)) return;
        void applyAll(lang);
      },

      getCurrentLang(): LangMode {
        return current;
      },

      translate(text: string, targetLang: 'ur' | 'en' | 'roman'): Promise<string> {
        return managed.translate(text, targetLang);
      },

      toRoman(text: string): string {
        return toRomanImpl(text);
      },

      toUrdu(text: string): string {
        return toUrduImpl(text);
      },
    };

    activeInstance = instance;
    if (isBrowser) {
      void applyAll(config.defaultLang);
    } else {
      current = config.defaultLang;
    }
    return instance;
  }

  /**
   * Translates an HTML string for SSR.
   * Works in Node.js environment.
   */
  static async renderToString(html: string, targetLang: LangMode, config?: UrduMagicConfig): Promise<string> {
    return renderToStringImpl(html, targetLang, config);
  }

  static translate(text: string, targetLang: 'ur' | 'en' | 'roman'): Promise<string> {
    return resolveTranslator().translate(text, targetLang);
  }

  static async autoTranslate(text: string, targetLang: LangMode): Promise<string> {
    await getDictionaryAsync();
    // Simple auto-detect: if contains Urdu chars, transliterate, else translate
    const hasUrduChars = /[\u0600-\u06FF]/.test(text);
    if (hasUrduChars) {
      if (targetLang === 'roman') return toRomanImpl(text);
      if (targetLang === 'ur') return text;
      return text; // en
    } else {
      // Assume English, translate to Urdu
      if (targetLang === 'ur') return EnglishEngine.translateToUrdu(text);
      if (targetLang === 'roman') return EnglishEngine.translateToRoman(text);
      return text;
    }
  }

  static toRoman(text: string): string {
    return toRomanImpl(text);
  }

  static toUrdu(text: string): string {
    return toUrduImpl(text);
  }

  static detectScript(text: string): ScriptType {
    return detectScriptImpl(text);
  }

  /**
   * Performs offline English to Urdu translation.
   * No internet connection required.
   */
  static fromEnglish(text: string): { urdu: string; roman: string; confidence: 'full' | 'partial' | 'none' } {
    return {
      urdu: EnglishEngine.translateToUrdu(text),
      roman: EnglishEngine.translateToRoman(text),
      confidence: EnglishEngine.getConfidence(text),
    };
  }
}

export default UrduMagic;
