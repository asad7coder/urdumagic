// ============================================================================
// USE URDU MAGIC REACT HOOK
// Simple React integration for UrduMagic
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UrduMagicConfig, UrduMagicInstance, LangMode } from '../types.js';
import UrduMagic from '../UrduMagic.js';

/**
 * React hook for UrduMagic functionality
 * 
 * @param config - Optional configuration
 * @returns UrduMagic methods and state
 * 
 * @example
 * ```typescript
 * import { useUrduMagic } from 'urdumagic';
 * 
 * function MyComponent() {
 *   const { 
 *     translate, 
 *     setLanguage, 
 *     currentLanguage,
 *     isTranslating,
 *     enableMagicMode 
 *   } = useUrduMagic({
 *     defaultLang: 'ur',
 *     apiKey: 'your-api-key'
 *   });
 * 
 *   const handleTranslate = async () => {
 *     const result = await translate('Hello World', 'ur');
 *     console.log(result);
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleTranslate}>Translate</button>
 *       <button onClick={() => setLanguage('en')}>English</button>
 *       <button onClick={() => setLanguage('ur')}>Urdu</button>
 *       <button onClick={enableMagicMode}>Enable Magic Mode</button>
 *       <p>Current: {currentLanguage}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUrduMagic(config: UrduMagicConfig = {}) {
  const [instance, setInstance] = useState<UrduMagicInstance | null>(null);
  const [currentLanguage, setCurrentLanguageState] = useState<LangMode>(
    config.defaultLang || 'en'
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const instanceRef = useRef<UrduMagicInstance | null>(null);

  // Initialize UrduMagic on mount
  useEffect(() => {
    const umInstance = UrduMagic.init(config);
    instanceRef.current = umInstance;
    setInstance(umInstance);
    setCurrentLanguageState(umInstance.getLanguage());

    return () => {
      umInstance.destroy();
    };
  }, []);

  // Translation function with loading state
  const translate = useCallback(async (
    text: string, 
    targetLang: 'ur' | 'en'
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
  const toUrdu = useCallback(async (text: string): Promise<string> => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    setIsTranslating(true);
    setError(null);

    try {
      const result = await instanceRef.current.toUrdu(text);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transliteration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const toRoman = useCallback(async (text: string): Promise<string> => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    setIsTranslating(true);
    setError(null);

    try {
      const result = await instanceRef.current.toRoman(text);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transliteration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Language management
  const setLanguage = useCallback(async (lang: LangMode): Promise<void> => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    try {
      await instanceRef.current.setLanguage(lang);
      setCurrentLanguageState(lang);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Language change failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Magic mode functions
  const enableMagicMode = useCallback((): void => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    try {
      instanceRef.current.enableMagicMode();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable magic mode';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const disableMagicMode = useCallback((): void => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    try {
      instanceRef.current.disableMagicMode();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable magic mode';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Script detection
  const detectScript = useCallback((text: string) => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    return instanceRef.current.detectScript(text);
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
    setLanguage,
    enableMagicMode,
    disableMagicMode,
    detectScript,
    clearError,

    // State
    currentLanguage,
    isTranslating,
    error,
    isReady: instance !== null,
    isMagicModeEnabled: instance?.isMagicModeEnabled() || false
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
 * 
 * @example
 * ```typescript
 * function App() {
 *   return (
 *     <UrduMagicProvider config={{ defaultLang: 'ur' }}>
 *       <MyComponent />
 *     </UrduMagicProvider>
 *   );
 * }
 * 
 * function MyComponent() {
 *   const { translate, setLanguage } = useUrduMagicContext();
 *   // Use UrduMagic functions without initializing
 * }
 * ```
 */
export function UrduMagicProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode; 
  config?: UrduMagicConfig;
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

// ============================================================================
// EXPORTS
// ============================================================================

export { useUrduMagic as default, UrduMagicProvider, useUrduMagicContext };
