import { detectScript as detectScriptImpl } from './core/detector.js';
import { toRoman as toRomanImpl, toUrdu as toUrduImpl } from './core/transliterator.js';
import {
  createManagedTranslator,
  type ManagedTranslator,
} from './core/translator.js';
import { createMagicDom } from './injector/magic.js';
import { createLanguageSwitcher } from './ui/switcher.js';

import type {
  LangMode,
  ScriptType,
  UrduMagicConfig,
} from './types.js';

export type {
  CacheEntry,
  LangMode,
  ScriptType,
  TransliterationResult,
  TranslatorPlugin,
  UrduMagicConfig,
} from './types.js';

export { transliterateWithTiming, processMixedAuto } from './core/transliterator.js';
export { detectScript, hasUrduWords, isRomanUrdu, isUrduScript } from './core/detector.js';
export { LibreTranslateTranslator, createManagedTranslator } from './core/translator.js';
export { MemoryCache, readLocalStorageCache, writeLocalStorageCache } from './core/cache.js';
export { debounce, createAsyncRateLimiter } from './core/debounce.js';
export { ROMAN_TO_URDU, ROMAN_TO_URDU_KEY_COUNT } from './core/roman-urdu-dict.js';

export interface UrduMagicInstance {
  destroy(): void;
  switchLang(lang: LangMode): void;
  getCurrentLang(): LangMode;
  translate(text: string, targetLang: 'ur' | 'en'): Promise<string>;
  toRoman(text: string): string;
  toUrdu(text: string): string;
}

let activeTranslator: ManagedTranslator | undefined;
let fallbackTranslator: ManagedTranslator | undefined;
let activeInstance: UrduMagicInstance | undefined;

function getFallbackTranslator(): ManagedTranslator {
  if (fallbackTranslator === undefined) {
    fallbackTranslator = createManagedTranslator({
      defaultLang: 'en',
      modes: ['en', 'ur', 'roman'],
      showSwitcher: false,
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
    if (typeof document === 'undefined') {
      throw new Error('UrduMagic.init() requires a browser document');
    }
    if (!config.modes.includes(config.defaultLang)) {
      throw new Error('UrduMagicConfig.defaultLang must be included in modes');
    }

    activeInstance?.destroy();
    activeTranslator?.dispose();

    const managed = createManagedTranslator(config);
    activeTranslator = managed;

    const magic = createMagicDom(document, {
      debounceMs: config.debounceMs ?? 300,
      translate: (text, targetLang) => managed.translate(text, targetLang),
    });

    let current: LangMode = config.defaultLang;

    const applyAll = async (lang: LangMode): Promise<void> => {
      current = lang;
      switcher?.setActive(lang);
      await magic.applyLanguage(lang);
      config.onLangSwitch?.(lang);
    };

    const switcher =
      config.showSwitcher === false
        ? undefined
        : createLanguageSwitcher(document, config.modes, (lang) => {
            void applyAll(lang);
          });

    const instance: UrduMagicInstance = {
      destroy(): void {
        magic.destroy();
        switcher?.destroy();
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

      translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
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
    void applyAll(config.defaultLang);
    return instance;
  }

  static translate(text: string, targetLang: 'ur' | 'en'): Promise<string> {
    return resolveTranslator().translate(text, targetLang);
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

  static getActiveInstance(): UrduMagicInstance | undefined {
    return activeInstance;
  }
}

export default UrduMagic;
