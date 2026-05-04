import { useCallback, useEffect, useRef, useState } from 'react';
import {
  UrduMagic,
  type UrduMagicConfig,
  type UrduMagicInstance,
} from '../../src/index.ts';

export interface UseUrduMagicResult {
  lang: 'en' | 'ur' | 'roman';
  switchLang: (lang: 'en' | 'ur' | 'roman') => void;
  translate: (text: string, targetLang: 'ur' | 'en') => Promise<string>;
  toRoman: (text: string) => string;
  toUrdu: (text: string) => string;
  isReady: boolean;
}

/**
 * React hook that initializes UrduMagic on mount and cleans up on unmount.
 *
 * @param config - Same options as {@link UrduMagic.init}
 * @returns Controls and transliteration helpers
 */
export function useUrduMagic(config: UrduMagicConfig): UseUrduMagicResult {
  const instanceRef = useRef<UrduMagicInstance | undefined>(undefined);
  const [lang, setLang] = useState<'en' | 'ur' | 'roman'>(config.defaultLang);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const inst = UrduMagic.init({
      ...config,
      onLangSwitch: (l) => {
        setLang(l as 'en' | 'ur' | 'roman');
        config.onLangSwitch?.(l);
      },
    });
    instanceRef.current = inst;
    setLang(inst.getCurrentLang());
    setIsReady(true);
    return () => {
      inst.destroy();
      instanceRef.current = undefined;
      setIsReady(false);
    };
  }, []);

  const switchLang = useCallback((l: 'en' | 'ur' | 'roman') => {
    instanceRef.current?.switchLang(l);
    setLang(l);
  }, []);

  const translate = useCallback((text: string, targetLang: 'ur' | 'en') => {
    return UrduMagic.translate(text, targetLang);
  }, []);

  const toRoman = useCallback((text: string) => UrduMagic.toRoman(text), []);
  const toUrdu = useCallback((text: string) => UrduMagic.toUrdu(text), []);

  return {
    lang,
    switchLang,
    translate,
    toRoman,
    toUrdu,
    isReady,
  };
}
