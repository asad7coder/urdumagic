# UrduMagic Embeddable Patterns

## 🎯 REUSABLE CODE SNIPPETS

### **Pattern 1: Auto-Convert Input Field**
**Use**: Any text input that needs Urdu conversion
**Copy-paste ready**

```html
<!-- HTML -->
<input type="text" id="urdu-input" placeholder="Type in Roman Urdu...">
<div id="urdu-output" class="urdu-display"></div>

<script>
// Auto-convert input field
const input = document.getElementById('urdu-input');
const output = document.getElementById('urdu-output');

let debounceTimer;
input.addEventListener('input', async (e) => {
  clearTimeout(debounceTimer);
  
  debounceTimer = setTimeout(async () => {
    const text = e.target.value;
    if (text.trim()) {
      const converted = await UrduMagic.auto(text);
      output.textContent = converted;
      output.style.display = 'block';
    } else {
      output.style.display = 'none';
    }
  }, 300);
});
</script>

<style>
.urdu-display {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-family: 'Noto Nastaliq', sans-serif;
  direction: rtl;
  display: none;
}
</style>
```

---

### **Pattern 2: Live Transliteration While Typing**
**Use**: Chat apps, messaging, real-time conversion
**Copy-paste ready**

```javascript
// Live transliteration utility
class LiveTransliterator {
  constructor(inputSelector, outputSelector) {
    this.input = document.querySelector(inputSelector);
    this.output = document.querySelector(outputSelector);
    this.debounceTimer = null;
    this.init();
  }
  
  init() {
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('blur', () => this.commitConversion());
  }
  
  handleInput(e) {
    clearTimeout(this.debounceTimer);
    
    this.debounceTimer = setTimeout(async () => {
      const text = e.target.value;
      if (text.trim()) {
        const converted = await UrduMagic.toUrdu(text);
        this.showConversion(converted);
      } else {
        this.hideConversion();
      }
    }, 200);
  }
  
  showConversion(converted) {
    this.output.textContent = converted;
    this.output.style.opacity = '0.7';
  }
  
  hideConversion() {
    this.output.textContent = '';
  }
  
  async commitConversion() {
    const text = this.input.value;
    if (text.trim()) {
      const converted = await UrduMagic.toUrdu(text);
      this.input.value = converted;
      this.output.style.opacity = '1';
    }
  }
}

// Usage
const transliterator = new LiveTransliterator('#message-input', '#transliteration-preview');
```

---

### **Pattern 3: Toggle Language Button**
**Use**: Content switching, user preference
**Copy-paste ready**

```javascript
// Language toggle utility
class LanguageToggle {
  constructor(contentSelector, buttonSelector, storageKey = 'urdu-language') {
    this.content = document.querySelector(contentSelector);
    this.button = document.querySelector(buttonSelector);
    this.storageKey = storageKey;
    this.isUrdu = false;
    this.originalContent = '';
    this.init();
  }
  
  init() {
    this.originalContent = this.content.textContent;
    this.loadPreference();
    this.button.addEventListener('click', () => this.toggle());
  }
  
  async toggle() {
    if (!this.isUrdu) {
      // Convert to Urdu
      const converted = await UrduMagic.auto(this.originalContent);
      this.content.textContent = converted;
      this.button.textContent = 'English';
      this.isUrdu = true;
    } else {
      // Revert to original
      this.content.textContent = this.originalContent;
      this.button.textContent = 'اردو';
      this.isUrdu = false;
    }
    
    this.savePreference();
  }
  
  loadPreference() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'urdu') {
      this.toggle();
    }
  }
  
  savePreference() {
    localStorage.setItem(this.storageKey, this.isUrdu ? 'urdu' : 'english');
  }
}

// Usage
const toggle = new LanguageToggle('.article-content', '.lang-toggle');
```

---

### **Pattern 4: Batch Comment Processor**
**Use**: Comment sections, social media feeds
**Copy-paste ready**

```javascript
// Batch comment processor
class CommentProcessor {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.processedComments = new Set();
    this.observer = null;
    this.init();
  }
  
  init() {
    this.processExistingComments();
    this.observeNewComments();
  }
  
  processExistingComments() {
    const comments = this.container.querySelectorAll('.comment-text');
    comments.forEach(comment => this.processComment(comment));
  }
  
  observeNewComments() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const comment = node.querySelector('.comment-text');
            if (comment) this.processComment(comment);
          }
        });
      });
    });
    
    this.observer.observe(this.container, {
      childList: true,
      subtree: true
    });
  }
  
  async processComment(commentElement) {
    const text = commentElement.textContent;
    if (!text || this.processedComments.has(commentElement)) return;
    
    this.processedComments.add(commentElement);
    
    try {
      const converted = await UrduMagic.auto(text);
      commentElement.textContent = converted;
      commentElement.classList.add('urdu-converted');
    } catch (error) {
      console.warn('Comment processing failed:', error);
    }
  }
}

// Usage
const processor = new CommentProcessor('.comments-section');
```

---

### **Pattern 5: Search Enhancement**
**Use**: Search boxes, autocomplete, filtering
**Copy-paste ready**

```javascript
// Search enhancement utility
class SearchEnhancer {
  constructor(inputSelector, resultsSelector, dataProvider) {
    this.input = document.querySelector(inputSelector);
    this.results = document.querySelector(resultsSelector);
    this.dataProvider = dataProvider;
    this.debounceTimer = null;
    this.init();
  }
  
  init() {
    this.input.addEventListener('input', (e) => this.handleSearch(e));
  }
  
  handleSearch(e) {
    clearTimeout(this.debounceTimer);
    
    this.debounceTimer = setTimeout(async () => {
      const query = e.target.value.trim();
      if (query.length < 2) {
        this.clearResults();
        return;
      }
      
      // Convert to Urdu for searching
      const urduQuery = await UrduMagic.toUrdu(query);
      const results = await this.dataProvider.search(urduQuery);
      this.displayResults(results, query, urduQuery);
    }, 300);
  }
  
  displayResults(results, originalQuery, urduQuery) {
    this.results.innerHTML = '';
    
    results.forEach(item => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result';
      
      // Highlight matching parts
      const highlightedText = this.highlightText(
        item.text, 
        originalQuery, 
        urduQuery
      );
      
      resultItem.innerHTML = `
        <div class="result-title">${item.title}</div>
        <div class="result-text">${highlightedText}</div>
        <div class="result-meta">
          Searched for: "${originalQuery}" → "${urduQuery}"
        </div>
      `;
      
      this.results.appendChild(resultItem);
    });
  }
  
  highlightText(text, original, urdu) {
    // Simple highlight implementation
    const regex = new RegExp(`(${urdu}|${original})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  clearResults() {
    this.results.innerHTML = '';
  }
}

// Usage with custom data provider
const search = new SearchEnhancer(
  '#search-input',
  '#search-results',
  {
    search: async (query) => {
      // Your search implementation
      return await yourSearchAPI.search(query);
    }
  }
);
```

---

### **Pattern 6: Form Field Enhancement**
**Use**: Contact forms, registration, user input
**Copy-paste ready**

```javascript
// Form field enhancement
class FormEnhancer {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.enhancedFields = new Map();
    this.init();
  }
  
  init() {
    this.enhanceTextFields();
    this.addLanguageToggle();
    this.setupFormSubmission();
  }
  
  enhanceTextFields() {
    const textFields = this.form.querySelectorAll('input[type="text"], textarea');
    
    textFields.forEach(field => {
      const enhancement = this.createFieldEnhancement(field);
      this.enhancedFields.set(field, enhancement);
    });
  }
  
  createFieldEnhancement(field) {
    const wrapper = document.createElement('div');
    wrapper.className = 'urdu-field-wrapper';
    
    const preview = document.createElement('div');
    preview.className = 'urdu-field-preview';
    
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'urdu-field-toggle';
    toggle.textContent = 'اردو';
    
    // Insert wrapper
    field.parentNode.insertBefore(wrapper, field);
    wrapper.appendChild(field);
    wrapper.appendChild(preview);
    wrapper.appendChild(toggle);
    
    let isUrdu = false;
    let originalValue = '';
    
    // Preview functionality
    field.addEventListener('input', async (e) => {
      const value = e.target.value;
      if (value.trim() && !isUrdu) {
        const converted = await UrduMagic.toUrdu(value);
        preview.textContent = converted;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    });
    
    // Toggle functionality
    toggle.addEventListener('click', async () => {
      if (!isUrdu) {
        originalValue = field.value;
        const converted = await UrduMagic.toUrdu(originalValue);
        field.value = converted;
        toggle.textContent = 'English';
        preview.style.display = 'none';
        isUrdu = true;
      } else {
        field.value = originalValue;
        toggle.textContent = 'اردو';
        isUrdu = false;
      }
    });
    
    return { field, preview, toggle, isUrdu: () => isUrdu };
  }
  
  addLanguageToggle() {
    const toggleAll = document.createElement('button');
    toggleAll.type = 'button';
    toggleAll.className = 'urdu-form-toggle';
    toggleAll.textContent = 'Convert All to Urdu';
    
    this.form.insertBefore(toggleAll, this.form.firstChild);
    
    toggleAll.addEventListener('click', async () => {
      for (const [field, enhancement] of this.enhancedFields) {
        if (!enhancement.isUrdu()) {
          const converted = await UrduMagic.toUrdu(field.value);
          field.value = converted;
        }
      }
    });
  }
  
  setupFormSubmission() {
    this.form.addEventListener('submit', (e) => {
      // Add Urdu language indicator to form data
      const hasUrduFields = Array.from(this.enhancedFields.values())
        .some(enhancement => enhancement.isUrdu());
      
      if (hasUrduFields) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'urdu_fields_used';
        hiddenInput.value = 'true';
        this.form.appendChild(hiddenInput);
      }
    });
  }
}

// Usage
const formEnhancer = new FormEnhancer('#contact-form');
```

---

## 🎨 STYLES FOR ALL PATTERNS

```css
/* Common styles for UrduMagic patterns */
.urdu-field-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.urdu-field-preview {
  margin-top: 4px;
  padding: 4px 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-family: 'Noto Nastaliq', sans-serif;
  direction: rtl;
  font-size: 0.9em;
  color: #64748b;
  display: none;
}

.urdu-field-toggle,
.urdu-form-toggle {
  position: absolute;
  right: 8px;
  top: 8px;
  padding: 4px 8px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.urdu-field-toggle:hover,
.urdu-form-toggle:hover {
  background: #059669;
}

.urdu-converted {
  background: #f0fdf4;
  padding: 2px 4px;
  border-radius: 2px;
}

.search-result {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.search-result mark {
  background: #fef3c7;
  padding: 1px 2px;
  border-radius: 2px;
}

.result-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.result-text {
  color: #6b7280;
  margin-bottom: 4px;
}

.result-meta {
  font-size: 0.75rem;
  color: #9ca3af;
}
```

---

## 🚀 USAGE EXAMPLES

### **Quick Start - Copy Paste**
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/urdumagic/dist/urdumagic.min.js"></script>
  <link href="styles.css" rel="stylesheet">
</head>
<body>
  <!-- Auto-convert input -->
  <input id="quick-input" placeholder="Type Roman Urdu...">
  <div id="quick-output"></div>
  
  <script>
    // Quick auto-convert
    const input = document.getElementById('quick-input');
    const output = document.getElementById('quick-output');
    
    input.addEventListener('input', async (e) => {
      const text = e.target.value;
      if (text.trim()) {
        output.textContent = await UrduMagic.auto(text);
      }
    });
  </script>
</body>
</html>
```

### **React Integration**
```javascript
// React wrapper for patterns
import UrduMagic from 'urdumagic';

export const UrduInput = ({ onConvert, ...props }) => {
  const [value, setValue] = useState('');
  const [converted, setConverted] = useState('');
  
  const handleChange = async (e) => {
    const text = e.target.value;
    setValue(text);
    
    if (text.trim()) {
      const result = await UrduMagic.auto(text);
      setConverted(result);
      onConvert?.(result);
    }
  };
  
  return (
    <div className="urdu-field-wrapper">
      <input {...props} value={value} onChange={handleChange} />
      {converted && (
        <div className="urdu-field-preview">{converted}</div>
      )}
    </div>
  );
};
```

These embeddable patterns make it easy for developers to add Urdu functionality to any project with minimal effort, encouraging repeated use across different applications.
