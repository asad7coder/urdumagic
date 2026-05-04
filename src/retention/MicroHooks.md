# UrduMagic Micro-Hooks for React

## 🎯 SIMPLE HOOKS API

### **Hooks that developers reuse everywhere**
- Minimal API surface
- Zero configuration needed
- Framework-agnostic patterns
- Reusable across projects

---

## 🪄 HOOK 1: useTransliterationInput

### **Live transliteration while typing**
```typescript
import { useState, useCallback, useRef } from 'react';
import UrduMagic from 'urdumagic';

interface UseTransliterationInputOptions {
  debounceMs?: number;
  showPreview?: boolean;
  autoCommit?: boolean;
  onConvert?: (original: string, converted: string) => void;
}

interface UseTransliterationInputReturn {
  value: string;
  converted: string;
  isConverting: boolean;
  preview: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCommit: () => void;
  reset: () => void;
}

export function useTransliterationInput(
  initialValue: string = '',
  options: UseTransliterationInputOptions = {}
): UseTransliterationInputReturn {
  const { debounceMs = 300, showPreview = true, autoCommit = false, onConvert } = options;
  
  const [value, setValue] = useState(initialValue);
  const [converted, setConverted] = useState('');
  const [preview, setPreview] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  
  const debounceRef = useRef<number>();
  const lastInputRef = useRef('');
  
  const transliterate = useCallback(async (text: string) => {
    if (!text.trim()) {
      setConverted('');
      setPreview('');
      return;
    }
    
    setIsConverting(true);
    try {
      const result = await UrduMagic.toUrdu(text);
      setConverted(result);
      
      if (showPreview && !autoCommit) {
        setPreview(result);
      }
      
      onConvert?.(text, result);
    } catch (error) {
      console.error('Transliteration failed:', error);
    } finally {
      setIsConverting(false);
    }
  }, [showPreview, autoCommit, onConvert]);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setValue(text);
    lastInputRef.current = text;
    
    clearTimeout(debounceRef.current);
    
    if (autoCommit) {
      // Immediate commit for auto-commit mode
      transliterate(text);
    } else {
      // Debounced for preview mode
      debounceRef.current = window.setTimeout(() => {
        transliterate(text);
      }, debounceMs);
    }
  }, [debounceMs, autoCommit, transliterate]);
  
  const handleCommit = useCallback(() => {
    if (converted) {
      setValue(converted);
      setPreview('');
      onConvert?.(value, converted);
    }
  }, [converted, value, onConvert]);
  
  const reset = useCallback(() => {
    setValue(initialValue);
    setConverted('');
    setPreview('');
    setIsConverting(false);
    clearTimeout(debounceRef.current);
  }, [initialValue]);
  
  return {
    value,
    converted,
    isConverting,
    preview,
    handleChange,
    handleCommit,
    reset
  };
}
```

### **Usage Example**
```typescript
function ChatInput() {
  const {
    value,
    preview,
    isConverting,
    handleChange,
    handleCommit,
    reset
  } = useTransliterationInput('', {
    debounceMs: 200,
    showPreview: true,
    onConvert: (original, converted) => {
      console.log(`${original} → ${converted}`);
    }
  });
  
  return (
    <div className="chat-input">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type Roman Urdu..."
        className="urdu-input"
      />
      
      {preview && (
        <div className="urdu-preview">
          {preview}
        </div>
      )}
      
      <div className="input-actions">
        <button onClick={handleCommit} disabled={!preview}>
          Commit Urdu
        </button>
        <button onClick={reset}>
          Clear
        </button>
      </div>
      
      {isConverting && (
        <div className="converting-indicator">
          Converting...
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 HOOK 2: useAutoTranslate

### **Auto-detect and translate**
```typescript
import { useState, useCallback, useEffect } from 'react';
import UrduMagic from 'urdumagic';

interface UseAutoTranslateOptions {
  targetLanguage?: 'ur' | 'en' | 'auto';
  cache?: boolean;
  onTranslate?: (original: string, translated: string) => void;
}

interface UseAutoTranslateReturn {
  translate: (text: string) => Promise<string>;
  translateBatch: (texts: string[]) => Promise<string[]>;
  isTranslating: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAutoTranslate(
  options: UseAutoTranslateOptions = {}
): UseAutoTranslateReturn {
  const { targetLanguage = 'auto', cache = true, onTranslate } = options;
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheMap] = useState(() => new Map<string, string>());
  
  const translate = useCallback(async (text: string): Promise<string> => {
    if (!text.trim()) return text;
    
    // Check cache first
    if (cache && cacheMap.has(text)) {
      const cached = cacheMap.get(text)!;
      onTranslate?.(text, cached);
      return cached;
    }
    
    setIsTranslating(true);
    setError(null);
    
    try {
      let result: string;
      
      if (targetLanguage === 'auto') {
        result = await UrduMagic.auto(text);
      } else {
        result = await UrduMagic.translate(text, targetLanguage);
      }
      
      // Cache result
      if (cache) {
        cacheMap.set(text, result);
      }
      
      onTranslate?.(text, result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      return text; // Return original on error
    } finally {
      setIsTranslating(false);
    }
  }, [targetLanguage, cache, cacheMap, onTranslate]);
  
  const translateBatch = useCallback(async (texts: string[]): Promise<string[]> => {
    const results: string[] = [];
    
    for (const text of texts) {
      const result = await translate(text);
      results.push(result);
    }
    
    return results;
  }, [translate]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    translate,
    translateBatch,
    isTranslating,
    error,
    clearError
  };
}
```

### **Usage Example**
```typescript
function CommentSection({ comments }: { comments: string[] }) {
  const { translateBatch, isTranslating, error } = useAutoTranslate({
    targetLanguage: 'auto',
    onTranslate: (original, translated) => {
      analytics.track('comment_translated', { 
        original: original.substring(0, 50),
        translated: translated.substring(0, 50)
      });
    }
  });
  
  const [translatedComments, setTranslatedComments] = useState<string[]>([]);
  
  useEffect(() => {
    const translateComments = async () => {
      const translated = await translateBatch(comments);
      setTranslatedComments(translated);
    };
    
    translateComments();
  }, [comments, translateBatch]);
  
  return (
    <div className="comment-section">
      {isTranslating && <div className="loading">Translating comments...</div>}
      {error && <div className="error">{error}</div>}
      
      {translatedComments.map((comment, index) => (
        <div key={index} className="comment">
          {comment}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎮 HOOK 3: useUrduToggle

### **Language toggle for content**
```typescript
import { useState, useCallback, useEffect } from 'react';
import UrduMagic from 'urdumagic';

interface UseUrduToggleOptions {
  storageKey?: string;
  defaultLanguage?: 'en' | 'ur';
  onToggle?: (language: 'en' | 'ur', content: string) => void;
}

interface UseUrduToggleReturn {
  language: 'en' | 'ur';
  content: string;
  toggle: () => void;
  setLanguage: (lang: 'en' | 'ur') => void;
  setContent: (content: string) => void;
  isToggling: boolean;
}

export function useUrduToggle(
  initialContent: string = '',
  options: UseUrduToggleOptions = {}
): UseUrduToggleReturn {
  const { storageKey = 'urdu-language', defaultLanguage = 'en', onToggle } = options;
  
  const [language, setLanguageState] = useState<'en' | 'ur'>(defaultLanguage);
  const [content, setContentState] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [urduContent, setUrduContent] = useState('');
  const [isToggling, setIsToggling] = useState(false);
  
  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as 'en' | 'ur' | null;
    if (saved) {
      setLanguageState(saved);
    }
  }, [storageKey]);
  
  // Generate Urdu content when original changes
  useEffect(() => {
    const generateUrdu = async () => {
      if (originalContent.trim()) {
        try {
          const converted = await UrduMagic.auto(originalContent);
          setUrduContent(converted);
        } catch (error) {
          console.error('Failed to generate Urdu content:', error);
          setUrduContent(originalContent);
        }
      } else {
        setUrduContent('');
      }
    };
    
    generateUrdu();
  }, [originalContent]);
  
  const toggle = useCallback(async () => {
    setIsToggling(true);
    
    const newLanguage = language === 'en' ? 'ur' : 'en';
    const newContent = newLanguage === 'ur' ? urduContent : originalContent;
    
    setLanguageState(newLanguage);
    setContentState(newContent);
    localStorage.setItem(storageKey, newLanguage);
    
    onToggle?.(newLanguage, newContent);
    
    // Small delay for visual feedback
    setTimeout(() => {
      setIsToggling(false);
    }, 100);
  }, [language, urduContent, originalContent, storageKey, onToggle]);
  
  const setLanguage = useCallback((lang: 'en' | 'ur') => {
    setLanguageState(lang);
    const newContent = lang === 'ur' ? urduContent : originalContent;
    setContentState(newContent);
    localStorage.setItem(storageKey, lang);
  }, [urduContent, originalContent, storageKey]);
  
  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
    setOriginalContent(newContent);
    
    // Generate Urdu version
    if (newContent.trim()) {
      UrduMagic.auto(newContent).then(converted => {
        setUrduContent(converted);
      }).catch(error => {
        console.error('Failed to generate Urdu content:', error);
        setUrduContent(newContent);
      });
    } else {
      setUrduContent('');
    }
  }, []);
  
  return {
    language,
    content,
    toggle,
    setLanguage,
    setContent,
    isToggling
  };
}
```

### **Usage Example**
```typescript
function Article({ articleContent }: { articleContent: string }) {
  const { language, content, toggle, isToggling } = useUrduToggle(articleContent, {
    storageKey: 'article-language',
    onToggle: (lang, content) => {
      analytics.track('language_toggled', { language: lang });
    }
  });
  
  return (
    <article className="article">
      <div className="article-header">
        <h1>Article Title</h1>
        <button 
          onClick={toggle} 
          disabled={isToggling}
          className="language-toggle"
        >
          {isToggling ? '...' : language === 'en' ? 'اردو' : 'English'}
        </button>
      </div>
      
      <div className={`article-content ${isToggling ? 'toggling' : ''}`}>
        {content}
      </div>
    </article>
  );
}
```

---

## 🔍 HOOK 4: useUrduSearch

### **Search with Urdu enhancement**
```typescript
import { useState, useCallback, useEffect } from 'react';
import UrduMagic from 'urdumagic';

interface UseUrduSearchOptions<T> {
  searchFunction: (query: string) => Promise<T[]>;
  debounceMs?: number;
  minQueryLength?: number;
  onSearch?: (query: string, results: T[]) => void;
}

interface UseUrduSearchReturn<T> {
  query: string;
  results: T[];
  isSearching: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  clearResults: () => void;
}

export function useUrduSearch<T>(
  searchFunction: UseUrduSearchOptions<T>['searchFunction'],
  options: Omit<UseUrduSearchOptions<T>, 'searchFunction'> = {}
): UseUrduSearchReturn<T> {
  const { debounceMs = 300, minQueryLength = 2, onSearch } = options;
  
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Convert to Urdu for better search
      const urduQuery = await UrduMagic.toUrdu(searchQuery);
      
      // Search with both original and Urdu query
      const [originalResults, urduResults] = await Promise.all([
        searchFunction(searchQuery),
        searchFunction(urduQuery)
      ]);
      
      // Combine and deduplicate results
      const combinedResults = [...originalResults, ...urduResults];
      const uniqueResults = Array.from(
        new Map(combinedResults.map(item => [JSON.stringify(item), item])).values()
      );
      
      setResults(uniqueResults);
      onSearch?.(searchQuery, uniqueResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchFunction, minQueryLength, onSearch]);
  
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);
  
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [query, debounceMs, search]);
  
  return {
    query,
    results,
    isSearching,
    error,
    setQuery,
    clearResults
  };
}
```

### **Usage Example**
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
}

function ProductSearch() {
  const { query, results, isSearching, error, setQuery } = useUrduSearch<Product>(
    async (searchQuery) => {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    {
      debounceMs: 400,
      minQueryLength: 3,
      onSearch: (query, results) => {
        analytics.track('product_search', { query, resultCount: results.length });
      }
    }
  );
  
  return (
    <div className="product-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="search-input"
      />
      
      {isSearching && <div className="searching">Searching...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="search-results">
        {results.map(product => (
          <div key={product.id} className="product-item">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📝 HOOK 5: useUrduForm

### **Form with Urdu field enhancement**
```typescript
import { useState, useCallback } from 'react';
import UrduMagic from 'urdumagic';

interface UseUrduFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T, urduFields: Record<string, string>) => void;
  urduFields?: (keyof T)[];
  debounceMs?: number;
}

interface UseUrduFormReturn<T> {
  values: T;
  urduValues: Record<string, string>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: string) => void;
  handleUrduToggle: (field: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
}

export function useUrduForm<T extends Record<string, any>>(
  options: UseUrduFormOptions<T>
): UseUrduFormReturn<T> {
  const { initialValues, onSubmit, urduFields = [], debounceMs = 300 } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [urduValues, setUrduValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const debounceRefs = useRef<Record<string, number>>({});
  
  const handleChange = useCallback((field: keyof T, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate Urdu for specified fields
    if (urduFields.includes(field)) {
      clearTimeout(debounceRefs.current[field as string]);
      
      debounceRefs.current[field as string] = window.setTimeout(async () => {
        try {
          const urduValue = await UrduMagic.auto(value);
          setUrduValues(prev => ({ ...prev, [field as string]: urduValue }));
        } catch (error) {
          console.error(`Failed to generate Urdu for field ${field}:`, error);
        }
      }, debounceMs);
    }
    
    // Clear error for this field
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  }, [urduFields, debounceMs, errors]);
  
  const handleUrduToggle = useCallback((field: keyof T) => {
    const currentUrduValue = urduValues[field as string];
    if (currentUrduValue) {
      setValues(prev => ({ ...prev, [field]: currentUrduValue }));
      setUrduValues(prev => ({ ...prev, [field as string]: '' }));
    }
  }, [urduValues]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await onSubmit(values, urduValues);
    } catch (error) {
      // Handle validation errors
      if (error instanceof Error && error.message.includes('validation')) {
        const validationErrors = JSON.parse(error.message);
        setErrors(validationErrors);
      } else {
        console.error('Form submission failed:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, urduValues, onSubmit]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setUrduValues({});
    setErrors({});
    setIsSubmitting(false);
    
    // Clear debounce timers
    Object.values(debounceRefs.current).forEach(timer => clearTimeout(timer));
  }, [initialValues]);
  
  return {
    values,
    urduValues,
    errors,
    isSubmitting,
    handleChange,
    handleUrduToggle,
    handleSubmit,
    reset
  };
}
```

### **Usage Example**
```typescript
interface ContactForm {
  name: string;
  email: string;
  message: string;
}

function ContactFormComponent() {
  const {
    values,
    urduValues,
    errors,
    isSubmitting,
    handleChange,
    handleUrduToggle,
    handleSubmit,
    reset
  } = useUrduForm<ContactForm>({
    initialValues: { name: '', email: '', message: '' },
    urduFields: ['name', 'message'],
    onSubmit: async (values, urduFields) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, urduFields })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error.errors || {}));
      }
      
      alert('Form submitted successfully!');
      reset();
    }
  });
  
  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={errors.name ? 'error' : ''}
        />
        {urduValues.name && (
          <div className="urdu-preview">
            {urduValues.name}
            <button 
              type="button" 
              onClick={() => handleUrduToggle('name')}
              className="use-urdu-btn"
            >
              Use Urdu
            </button>
          </div>
        )}
        {errors.name && <div className="error">{errors.name}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <div className="error">{errors.email}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          value={values.message}
          onChange={(e) => handleChange('message', e.target.value)}
          className={errors.message ? 'error' : ''}
          rows={4}
        />
        {urduValues.message && (
          <div className="urdu-preview">
            {urduValues.message}
            <button 
              type="button" 
              onClick={() => handleUrduToggle('message')}
              className="use-urdu-btn"
            >
              Use Urdu
            </button>
          </div>
        )}
        {errors.message && <div className="error">{errors.message}</div>}
      </div>
      
      <button type="submit" disabled={isSubmitting} className="submit-btn">
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

---

## 🎯 USAGE SUMMARY

### **Import All Hooks**
```typescript
import {
  useTransliterationInput,
  useAutoTranslate,
  useUrduToggle,
  useUrduSearch,
  useUrduForm
} from 'urdumagic/react';
```

### **Quick Start Examples**
```typescript
// 1. Live transliteration input
const { value, preview, handleChange } = useTransliterationInput();

// 2. Auto-translate content
const { translate, isTranslating } = useAutoTranslate();

// 3. Language toggle
const { language, content, toggle } = useUrduToggle(articleText);

// 4. Enhanced search
const { query, results, isSearching } = useUrduSearch(searchFunction);

// 5. Urdu-enhanced form
const { values, urduValues, handleChange, handleSubmit } = useUrduForm({
  initialValues: formData,
  urduFields: ['name', 'message']
});
```

These micro-hooks provide simple, reusable patterns that developers can drop into any React project with minimal setup, encouraging repeated usage across different applications.
