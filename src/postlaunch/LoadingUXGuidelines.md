# UrduMagic Loading & UX Guidelines

## 🎯 LOADING STATES BEST PRACTICES

### **Core Principle: Never Block User Interface**
> **"Always show loading states, never make users wait without feedback."**

---

## 🔄 LOADING STATE PATTERNS

### **1. Immediate Feedback (0-100ms)**
```typescript
// Show loading state immediately, even for fast operations
function translateWithLoading(text: string) {
  // Show loading immediately
  setLoading(true);
  
  // Start translation
  UrduMagic.auto(text)
    .then(result => {
      setLoading(false);
      setResult(result);
    })
    .catch(error => {
      setLoading(false);
      setError(error);
    });
}
```

### **2. Debounced Loading (100-300ms)**
```typescript
// Prevent loading flicker for fast operations
function debouncedTranslation(text: string) {
  let loadingTimer: number;
  
  return new Promise((resolve, reject) => {
    clearTimeout(loadingTimer);
    
    // Only show loading if operation takes > 100ms
    loadingTimer = setTimeout(() => {
      setLoading(true);
    }, 100);
    
    UrduMagic.auto(text)
      .then(result => {
        clearTimeout(loadingTimer);
        setLoading(false);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(loadingTimer);
        setLoading(false);
        reject(error);
      });
  });
}
```

### **3. Progressive Loading (300ms+)**
```typescript
// Show progressive loading for longer operations
function progressiveTranslation(text: string) {
  setLoading(true);
  setProgress(0);
  
  UrduMagic.auto(text)
    .onProgress((progress) => {
      setProgress(progress);
    })
    .then(result => {
      setLoading(false);
      setProgress(100);
      setResult(result);
    })
    .catch(error => {
      setLoading(false);
      setError(error);
    });
}
```

---

## 🎪 REACT EXAMPLES

### **Complete React Hook with Loading States**
```typescript
import { useState, useCallback, useRef } from 'react';

export function useUrduMagicWithLoading() {
  const [state, setState] = useState({
    loading: false,
    progress: 0,
    result: '',
    error: null as string | null,
    lastInput: ''
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const translate = useCallback(async (text: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    if (!text || !text.trim()) {
      setState(prev => ({ 
        ...prev, 
        result: '', 
        error: null, 
        loading: false,
        lastInput: text 
      }));
      return text;
    }
    
    // Show loading immediately
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      progress: 0,
      lastInput: text 
    }));
    
    try {
      // Simulated progress for better UX
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 50);
      
      const result = await UrduMagic.auto(text);
      
      // Clean up
      clearInterval(progressInterval);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        progress: 100,
        result,
        error: null 
      }));
      
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        progress: 0,
        error: error instanceof Error ? error.message : 'Translation failed',
        result: text // Fallback
      }));
      return text;
    }
  }, []);
  
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        progress: 0 
      }));
    }
  }, []);
  
  return {
    translate,
    cancel,
    ...state,
    isTranslating: state.loading && state.lastInput !== state.result,
    canCancel: state.loading
  };
}
```

### **React Component with Loading UI**
```typescript
export function UrduTranslator() {
  const { 
    translate, 
    cancel, 
    loading, 
    progress, 
    result, 
    error, 
    isTranslating,
    canCancel 
  } = useUrduMagicWithLoading();
  
  const [input, setInput] = useState('');
  
  const handleTranslate = () => {
    translate(input);
  };
  
  return (
    <div className="urdu-translator">
      <div className="input-section">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type text to translate..."
          disabled={loading}
        />
        <div className="actions">
          <button 
            onClick={handleTranslate}
            disabled={loading || !input.trim()}
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>
          {canCancel && (
            <button onClick={cancel} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {loading && (
        <div className="loading-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="loading-text">
            {progress < 30 ? 'Initializing...' :
             progress < 60 ? 'Detecting language...' :
             progress < 90 ? 'Translating...' :
             'Finalizing...'}
          </p>
        </div>
      )}
      
      {error && (
        <div className="error-section">
          <p className="error-message">{error}</p>
          <small className="error-hint">
            Using original text due to translation failure
          </small>
        </div>
      )}
      
      {result && !loading && (
        <div className="result-section">
          <h3>Translation Result:</h3>
          <p className="result-text">{result}</p>
          <button 
            onClick={() => navigator.clipboard.writeText(result)}
            className="copy-btn"
          >
            Copy Result
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 📱 VANILLA JAVASCRIPT EXAMPLES

### **Complete Vanilla JS Implementation**
```typescript
export class UrduMagicUI {
  private container: HTMLElement;
  private input: HTMLTextAreaElement;
  private translateBtn: HTMLButtonElement;
  private resultDiv: HTMLDivElement;
  private loadingDiv: HTMLDivElement;
  private progressBar: HTMLDivElement;
  
  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
    this.setupUI();
    this.bindEvents();
  }
  
  private setupUI(): void {
    this.container.innerHTML = `
      <div class="urdu-magic-ui">
        <div class="input-section">
          <textarea 
            id="urdu-input" 
            placeholder="Type text to translate..."
            rows="4"
          ></textarea>
          <div class="actions">
            <button id="translate-btn" disabled>Translate</button>
            <button id="cancel-btn" class="hidden">Cancel</button>
          </div>
        </div>
        
        <div id="loading-section" class="hidden">
          <div class="progress-bar">
            <div id="progress-fill" class="progress-fill"></div>
          </div>
          <p id="loading-text">Initializing...</p>
        </div>
        
        <div id="error-section" class="hidden">
          <p id="error-message"></p>
          <small>Using original text due to translation failure</small>
        </div>
        
        <div id="result-section" class="hidden">
          <h3>Translation Result:</h3>
          <p id="result-text"></p>
          <button id="copy-btn">Copy Result</button>
        </div>
      </div>
    `;
    
    this.input = this.container.querySelector('#urdu-input')!;
    this.translateBtn = this.container.querySelector('#translate-btn')!;
    this.resultDiv = this.container.querySelector('#result-section')!;
    this.loadingDiv = this.container.querySelector('#loading-section')!;
    this.progressBar = this.container.querySelector('#progress-fill')!;
  }
  
  private bindEvents(): void {
    this.translateBtn.addEventListener('click', () => this.translate());
    this.input.addEventListener('input', () => this.validateInput());
    
    // Copy button
    const copyBtn = this.container.querySelector('#copy-btn')!;
    copyBtn.addEventListener('click', () => this.copyResult());
    
    // Cancel button
    const cancelBtn = this.container.querySelector('#cancel-btn')!;
    cancelBtn.addEventListener('click', () => this.cancel());
  }
  
  private validateInput(): void {
    const hasText = this.input.value.trim().length > 0;
    this.translateBtn.disabled = !hasText;
  }
  
  private async translate(): Promise<void> {
    const text = this.input.value.trim();
    if (!text) return;
    
    this.showLoading();
    
    try {
      const progressInterval = this.startProgress();
      
      const result = await UrduMagic.auto(text);
      
      clearInterval(progressInterval);
      this.setProgress(100);
      
      setTimeout(() => {
        this.showResult(result);
      }, 200);
      
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Translation failed');
    }
  }
  
  private showLoading(): void {
    this.translateBtn.disabled = true;
    this.translateBtn.textContent = 'Translating...';
    this.container.querySelector('#cancel-btn')?.classList.remove('hidden');
    this.loadingDiv.classList.remove('hidden');
    this.resultDiv.classList.add('hidden');
    this.container.querySelector('#error-section')?.classList.add('hidden');
    this.setProgress(0);
  }
  
  private startProgress(): number {
    return setInterval(() => {
      const currentProgress = parseInt(this.progressBar.style.width || '0');
      const newProgress = Math.min(currentProgress + 10, 90);
      this.setProgress(newProgress);
      this.updateLoadingText(newProgress);
    }, 50);
  }
  
  private setProgress(progress: number): void {
    this.progressBar.style.width = `${progress}%`;
  }
  
  private updateLoadingText(progress: number): void {
    const loadingText = this.container.querySelector('#loading-text')!;
    if (progress < 30) {
      loadingText.textContent = 'Initializing...';
    } else if (progress < 60) {
      loadingText.textContent = 'Detecting language...';
    } else if (progress < 90) {
      loadingText.textContent = 'Translating...';
    } else {
      loadingText.textContent = 'Finalizing...';
    }
  }
  
  private showResult(result: string): void {
    this.loadingDiv.classList.add('hidden');
    this.resultDiv.classList.remove('hidden');
    this.container.querySelector('#result-text')!.textContent = result;
    this.translateBtn.disabled = false;
    this.translateBtn.textContent = 'Translate';
    this.container.querySelector('#cancel-btn')?.classList.add('hidden');
  }
  
  private showError(error: string): void {
    this.loadingDiv.classList.add('hidden');
    this.container.querySelector('#error-section')!.classList.remove('hidden');
    this.container.querySelector('#error-message')!.textContent = error;
    this.translateBtn.disabled = false;
    this.translateBtn.textContent = 'Translate';
    this.container.querySelector('#cancel-btn')?.classList.add('hidden');
  }
  
  private copyResult(): void {
    const result = this.container.querySelector('#result-text')!.textContent;
    navigator.clipboard.writeText(result).then(() => {
      // Show copied feedback
      const copyBtn = this.container.querySelector('#copy-btn')!;
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    });
  }
  
  private cancel(): void {
    // Implementation for canceling ongoing translation
    this.showLoading();
    this.showError('Translation cancelled');
  }
}
```

---

## 🎨 UX BEST PRACTICES

### **1. Loading State Design**
```css
/* Loading states should be subtle but informative */
.progress-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #8b5cf6);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
  margin: 5px 0;
}

/* Buttons should show state clearly */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.loading {
  position: relative;
  padding-left: 30px;
}

button.loading::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}
```

### **2. Error State Design**
```css
.error-section {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  margin: 10px 0;
}

.error-message {
  color: #dc2626;
  font-weight: 500;
  margin: 0 0 5px 0;
}

.error-hint {
  color: #7f1d1d;
  font-size: 12px;
}
```

### **3. Result State Design**
```css
.result-section {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 16px;
  margin: 10px 0;
}

.result-text {
  font-size: 16px;
  line-height: 1.5;
  margin: 10px 0;
  color: #1f2937;
}

.copy-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.copy-btn:hover {
  background: #059669;
}
```

---

## 📱 MOBILE UX CONSIDERATIONS

### **Touch-Friendly Loading**
```css
/* Larger touch targets for mobile */
@media (max-width: 768px) {
  button {
    min-height: 44px;
    min-width: 44px;
    font-size: 16px;
  }
  
  .progress-bar {
    height: 6px; /* Slightly thicker for mobile */
  }
  
  .loading-text {
    font-size: 16px; /* Larger for mobile readability */
  }
}
```

### **Network-Aware Loading**
```typescript
// Adjust loading expectations based on network
function getLoadingTimeout(): number {
  const connection = (navigator as any).connection;
  
  if (!connection) {
    return 5000; // Default 5 seconds
  }
  
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 10000; // 10 seconds for slow networks
    case '3g':
      return 7000; // 7 seconds for 3G
    case '4g':
      return 3000; // 3 seconds for 4G
    default:
      return 5000;
  }
}
```

---

## 🎯 LOADING UX CHECKLIST

### **Before Showing Loading**
- [ ] Input validation completed
- [ ] Previous request cancelled (if any)
- [ ] Loading state shown immediately
- [ ] UI elements properly disabled

### **During Loading**
- [ ] Progress indicator shown (if > 100ms)
- [ ] Cancel option available (if > 500ms)
- [ ] Network status considered
- [ ] Error handling prepared

### **After Loading**
- [ ] Loading state cleared
- [ ] Result displayed or error shown
- [ ] UI elements re-enabled
- [ ] Success feedback provided

### **Error Handling**
- [ ] User-friendly error message
- [ ] Fallback result provided
- [ ] Retry mechanism available
- [ ] Context preserved

---

## 🎪 FINAL LOADING UX POLICY

> **"UrduMagic provides clear, responsive loading states that never block the user interface. All operations show immediate feedback, progressive updates, and graceful error handling."**

### **Loading Guarantees**
1. **Immediate feedback** for all user actions
2. **Progressive loading** for longer operations
3. **Cancel capability** for extended operations
4. **Network-aware** timeout expectations
5. **Mobile-optimized** touch targets and feedback
6. **Graceful degradation** on errors

This loading and UX system ensures users always know what's happening and never feel stuck waiting without feedback.
