// ============================================================================
// ENHANCED URDU MAGIC REACT HOOK
// Improved React hook with loading, error states, and better UX
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UrduMagicConfig, UrduMagicInstance, LangMode, ScriptType } from '../types.js';
import UrduMagic from '../UrduMagic.js';

/**
 * Translation result state
 */
export interface TranslationState {
  text: string;
  originalText: string;
  targetLang: 'ur' | 'en';
  timestamp: number;
  strategy: string;
  duration: number;
}

/**
 * Enhanced hook return type
 */
export interface UseUrduMagicReturn {
  // Core functions
  translate: (text: string, targetLang?: 'ur' | 'en') => Promise<string>;
  toUrdu: (text: string) => Promise<string>;
  toRoman: (text: string) => Promise<string>;
  autoDetectAndTranslate: (text: string) => Promise<string>;

  // Language management
  setLanguage: (lang: LangMode) => Promise<void>;
  getLanguage: () => LangMode;

  // Magic mode
  enableMagicMode: () => void;
  disableMagicMode: () => void;
  isMagicModeEnabled: () => boolean;

  // Utility
  detectScript: (text: string) => ScriptType;
  clearError: () => void;
  reset: () => void;

  // State
  currentLanguage: LangMode;
  isReady: boolean;
  loading: boolean;
  error: string | null;
  lastResult: TranslationState | null;

  // Statistics
  stats: {
    totalTranslations: number;
    successfulTranslations: number;
    failedTranslations: number;
    averageResponseTime: number;
  };
}

/**
 * Enhanced React hook for UrduMagic with better UX
 * 
 * @param config - Optional configuration
 * @returns Enhanced hook interface
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const {
 *     translate,
 *     toUrdu,
 *     setLanguage,
 *     currentLanguage,
 *     loading,
 *     error,
 *     lastResult,
 *     stats
 *   } = useUrduMagicEnhanced({
 *     defaultLang: 'ur',
 *     apiKey: 'your-api-key'
 *   });
 * 
 *   const handleTranslate = async () => {
 *     try {
 *       const result = await translate('Hello World');
 *       console.log(result);
 *     } catch (err) {
 *       console.error(err);
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleTranslate} disabled={loading}>
 *         {loading ? 'Translating...' : 'Translate'}
 *       </button>
 *       
 *       {error && <div className="error">{error}</div>}
 *       
 *       {lastResult && (
 *         <div>
 *           <p>Original: {lastResult.originalText}</p>
 *           <p>Translation: {lastResult.text}</p>
 *           <p>Strategy: {lastResult.strategy}</p>
 *           <p>Duration: {lastResult.duration}ms</p>
 *         </div>
 *       )}
 *       
 *       <div>
 *         <button onClick={() => setLanguage('en')}>English</button>
 *         <button onClick={() => setLanguage('ur')}>Urdu</button>
 *         <button onClick={() => setLanguage('roman')}>Roman Urdu</button>
 *       </div>
 *       
 *       <div>
 *         <p>Current: {currentLanguage}</p>
 *         <p>Translations: {stats.totalTranslations}</p>
 *         <p>Success Rate: {stats.successfulTranslations}/{stats.totalTranslations}</p>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUrduMagicEnhanced(config: UrduMagicConfig = {}): UseUrduMagicReturn {
  const [instance, setInstance] = useState<UrduMagicInstance | null>(null);
  const [currentLanguage, setCurrentLanguageState] = useState<LangMode>(
    config.defaultLang || 'en'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<TranslationState | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalTranslations: 0,
    successfulTranslations: 0,
    failedTranslations: 0,
    averageResponseTime: 0
  });

  const instanceRef = useRef<UrduMagicInstance | null>(null);
  const responseTimesRef = useRef<number[]>([]);

  // Initialize UrduMagic on mount
  useEffect(() => {
    const umInstance = UrduMagic.init(config);
    instanceRef.current = umInstance;
    setInstance(umInstance);
    setCurrentLanguageState(umInstance.getLanguage());
    setIsReady(true);

    return () => {
      umInstance.destroy();
    };
  }, []);

  // Update statistics
  const updateStats = useCallback((duration: number, success: boolean) => {
    responseTimesRef.current.push(duration);

    // Keep only last 100 response times
    if (responseTimesRef.current.length > 100) {
      responseTimesRef.current.shift();
    }

    const avgResponseTime = responseTimesRef.current.reduce((sum, time) => sum + time, 0) / responseTimesRef.current.length;

    setStats(prev => ({
      totalTranslations: prev.totalTranslations + 1,
      successfulTranslations: success ? prev.successfulTranslations + 1 : prev.successfulTranslations,
      failedTranslations: success ? prev.failedTranslations : prev.failedTranslations + 1,
      averageResponseTime: avgResponseTime
    }));
  }, []);

  // Translation function with loading state
  const translate = useCallback(async (
    text: string,
    targetLang: 'ur' | 'en' = 'ur'
  ): Promise<string> => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    if (!text || !text.trim()) {
      return text;
    }

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const result = await instanceRef.current.translate(text, targetLang);
      const duration = performance.now() - startTime;

      // Update last result
      setLastResult({
        text: result,
        originalText: text,
        targetLang,
        timestamp: Date.now(),
        strategy: instanceRef.current.getCurrentStrategy(),
        duration
      });

      updateStats(duration, true);
      return result;

    } catch (err) {
      const duration = performance.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      updateStats(duration, false);
      throw err;

    } finally {
      setLoading(false);
    }
  }, [updateStats]);

  // Transliteration functions
  const toUrdu = useCallback(async (text: string): Promise<string> => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    if (!text || !text.trim()) {
      return text;
    }

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const result = await instanceRef.current.toUrdu(text);
      const duration = performance.now() - startTime;

      setLastResult({
        text: result,
        originalText: text,
        targetLang: 'ur',
        timestamp: Date.now(),
        strategy: 'transliteration',
        duration
      });

      updateStats(duration, true);
      return result;

    } catch (err) {
      const duration = performance.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Transliteration failed';
      setError(errorMessage);
      updateStats(duration, false);
      throw err;

    } finally {
      setLoading(false);
    }
  }, [updateStats]);

  const toRoman = useCallback(async (text: string): Promise<string> => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    if (!text || !text.trim()) {
      return text;
    }

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const result = await instanceRef.current.toRoman(text);
      const duration = performance.now() - startTime;

      setLastResult({
        text: result,
        originalText: text,
        targetLang: 'en',
        timestamp: Date.now(),
        strategy: 'transliteration',
        duration
      });

      updateStats(duration, true);
      return result;

    } catch (err) {
      const duration = performance.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Transliteration failed';
      setError(errorMessage);
      updateStats(duration, false);
      throw err;

    } finally {
      setLoading(false);
    }
  }, [updateStats]);

  // Auto-detect and translate function
  const autoDetectAndTranslate = useCallback(async (text: string): Promise<string> => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    if (!text || !text.trim()) {
      return text;
    }

    const script = instanceRef.current.detectScript(text);

    // If already in Urdu script, convert to Roman Urdu
    if (script === 'arabic') {
      return await toRoman(text);
    }

    // If Roman Urdu, convert to Urdu script
    if (script === 'roman-urdu') {
      return await toUrdu(text);
    }

    // If English, translate to Urdu
    if (script === 'english' || script === 'latin') {
      return await translate(text, 'ur');
    }

    // Mixed script - default to translation
    return await translate(text, 'ur');
  }, [translate, toUrdu, toRoman]);

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

  const getLanguage = useCallback((): LangMode => {
    return instanceRef.current?.getLanguage() || 'en';
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

  const isMagicModeEnabled = useCallback((): boolean => {
    return instanceRef.current?.isMagicModeEnabled() || false;
  }, []);

  // Script detection
  const detectScript = useCallback((text: string): ScriptType => {
    if (!instanceRef.current) {
      throw new Error('UrduMagic not initialized');
    }

    return instanceRef.current.detectScript(text);
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Reset all state
  const reset = useCallback((): void => {
    setError(null);
    setLastResult(null);
    setLoading(false);
    setStats({
      totalTranslations: 0,
      successfulTranslations: 0,
      failedTranslations: 0,
      averageResponseTime: 0
    });
    responseTimesRef.current = [];
  }, []);

  return {
    // Core functions
    translate,
    toUrdu,
    toRoman,
    autoDetectAndTranslate,

    // Language management
    setLanguage,
    getLanguage,

    // Magic mode
    enableMagicMode,
    disableMagicMode,
    isMagicModeEnabled,

    // Utility
    detectScript,
    clearError,
    reset,

    // State
    currentLanguage,
    isReady,
    loading,
    error,
    lastResult,

    // Statistics
    stats
  };
}

// ============================================================================
// PROVIDER HOOK (for React Context)
// ============================================================================

import { createContext, useContext } from 'react';

/**
 * Enhanced UrduMagic context for app-wide usage
 */
const UrduMagicEnhancedContext = createContext<UseUrduMagicEnhancedReturn | null>(null);

/**
 * Provider component for enhanced UrduMagic context
 */
export function UrduMagicEnhancedProvider({
  children,
  config
}: {
  children: React.ReactNode;
  config?: UrduMagicConfig;
}) {
  const urduMagic = useUrduMagicEnhanced(config);

  return (
    <UrduMagicEnhancedContext.Provider value= { urduMagic } >
    { children }
    </UrduMagicEnhancedContext.Provider>
  );
}

/**
 * Hook to use enhanced UrduMagic context
 */
export function useUrduMagicEnhancedContext() {
  const context = useContext(UrduMagicEnhancedContext);

  if (!context) {
    throw new Error('useUrduMagicEnhancedContext must be used within UrduMagicEnhancedProvider');
  }

  return context;
}
