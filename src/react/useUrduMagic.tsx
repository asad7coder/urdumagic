// ============================================================================
// USE URDU MAGIC REACT HOOK
// Simple React integration for UrduMagic
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UrduMagicConfig, UrduMagicInstance, LangMode } from '../types.js';
import { UrduMagic } from '../index.js';

/**
 * React hook for UrduMagic functionality
 * 
 * @param config - Optional configuration
 * @returns UrduMagic methods and state
 */
export function useUrduMagic(config: Partial<UrduMagicConfig> = {}) {
  const [instance, setInstance] = useState<UrduMagicInstance | null>(null);
  const [currentLanguage, setCurrentLanguageState] = useState<LangMode>(
    config.defaultLang || 'en'
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const instanceRef = useRef<UrduMagicInstance | null>(null);

  // Initialize UrduMagic on mount
  useEffect(() => {
    // Ensure required config properties are present
    const fullConfig: UrduMagicConfig = {
      defaultLang: config.defaultLang || 'en',
      modes: config.modes || ['en', 'ur', 'roman'],
      ...config
    };

    const umInstance = UrduMagic.init(fullConfig);
    instanceRef.current = umInstance;
    setInstance(umInstance);
    setCurrentLanguageState(umInstance.getCurrentLang());

    return () => {
      umInstance.destroy();
    };
  }, []);

  // Translation function with loading state
  const translate = useCallback(async (
    text: string, 
    targetLang: 'ur' | 'en' | 'roman'
  ): Promise<string> => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    setIsTranslating(true);
    setError(null);

    try {
      const result = await instanceRef.current.translate(text, targetLang);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Transliteration functions
  const toUrdu = useCallback((text: string): string => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }
    return instanceRef.current.toUrdu(text);
  }, []);

  const toRoman = useCallback((text: string): string => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }
    return instanceRef.current.toRoman(text);
  }, []);

  // Language management
  const switchLang = useCallback((lang: LangMode): void => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    try {
      instanceRef.current.switchLang(lang);
      setCurrentLanguageState(lang);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Language change failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Script detection
  const detectScript = useCallback((text: string) => {
    return UrduMagic.detectScript(text);
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    // Core functions
    translate,
    toUrdu,
    toRoman,
    switchLang,
    currentLanguage,
    isTranslating,
    error,
    clearError,
    detectScript,
    instance,
    isReady: instance !== null
  };
}

// ============================================================================
// PROVIDER HOOK (for React Context)
// ============================================================================

import { createContext, useContext } from 'react';

/**
 * UrduMagic context for app-wide usage
 */
const UrduMagicContext = createContext<ReturnType<typeof useUrduMagic> | null>(null);

/**
 * Provider component for UrduMagic context
 */
export function UrduMagicProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode; 
  config?: Partial<UrduMagicConfig>;
}) {
  const urduMagic = useUrduMagic(config);

  return (
    <UrduMagicContext.Provider value={urduMagic}>
      {children}
    </UrduMagicContext.Provider>
  );
}

/**
 * Hook to use UrduMagic context
 * Must be used within UrduMagicProvider
 */
export function useUrduMagicContext() {
  const context = useContext(UrduMagicContext);
  
  if (!context) {
    throw new Error('useUrduMagicContext must be used within UrduMagicProvider');
  }
  
  return context;
}

export default useUrduMagic;
