import { detectScript as detectScriptImpl } from './core/detector.js';
import { toRoman as toRomanImpl, toUrdu as toUrduImpl } from './core/transliterator.js';
import {
  createManagedTranslator,
  type ManagedTranslator,
} from './core/translator.js';
import { createMagicDom } from './injector/magic.js';
import { createLanguageSwitcher } from './ui/switcher.js';
import { EnglishEngine } from './engines/englishEngine.js';

import type {
  LangMode,
  ScriptType,
  UrduMagicConfig,
} from './types.js';

export type {
  LangMode,
  ScriptType,
  UrduMagicConfig,
} from './types.js';

export interface UrduMagicInstance {
  destroy(): void;
  switchLang(lang: LangMode): void;
  getCurrentLang(): LangMode;
  translate(text: string, targetLang: 'ur' | 'en' | 'roman'): Promise<string>;
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
      debounceMs: config.performance?.debounceMs ?? config.magicMode?.debounceMs ?? 300,
      translate: (text, targetLang) => managed.translate(text, targetLang),
    });

    let current: LangMode = config.defaultLang;

    const applyAll = async (lang: LangMode): Promise<void> => {
      current = lang;
      switcher?.setActive(lang);
      await magic.applyLanguage(lang);
      
      // Dispatch global event for other components to sync
      window.dispatchEvent(new CustomEvent('urdumagic-lang-switch', { detail: { lang } }));
      
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
    void applyAll(config.defaultLang);
    return instance;
  }

  static translate(text: string, targetLang: 'ur' | 'en' | 'roman'): Promise<string> {
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
