# UrduMagic Usage Examples - Simple API

## 🚀 BASIC USAGE

### **Zero Configuration**
```typescript
import UrduMagic from 'urdumagic';

// Works out of the box
const um = UrduMagic.init();

// Translate text
const result = await um.translate('Hello World', 'ur');
console.log(result); // "ہیلو ورلڈ"

// Transliterate
const urdu = await um.toUrdu('salam');
console.log(urdu); // "سلام"

const roman = await um.toRoman('سلام');
console.log(roman); // "salam"
```

### **One-Liner Translation**
```typescript
import UrduMagic from 'urdumagic';

// Quick translate without instance management
const result = await UrduMagic.quickTranslate('Hello', 'ur');
console.log(result); // "ہیلو"

// Quick transliteration
const urdu = UrduMagic.quickTransliterate('salam', 'ur');
console.log(urdu); // "سلام"
```

---

## ⚙️ CONFIGURED USAGE

### **With API Key**
```typescript
import UrduMagic from 'urdumagic';

const um = UrduMagic.init({
  apiKey: 'your-libretranslate-key',
  defaultLang: 'ur',
  showSwitcher: true
});

// Better translations with API
const result = await um.translate('How are you?', 'ur');
console.log(result); // "آپ کیسے ہیں؟"
```

### **Premium Configuration**
```typescript
import UrduMagic from 'urdumagic';

const um = UrduMagic.init({
  strategy: 'google',
  googleApiKey: 'your-google-key',
  defaultLang: 'ur',
  showSwitcher: true,
  magicMode: { enabled: true }
});

// High quality translations
const result = await um.translate('Welcome to our website', 'ur');
console.log(result); // "ہمارے ویب سائٹ میں خوش آمدید"
```

---

## 🎯 REACT INTEGRATION

### **Basic React Hook**
```typescript
import React, { useState } from 'react';
import { useUrduMagic } from 'urdumagic';

function Translator() {
  const { 
    translate, 
    setLanguage, 
    currentLanguage,
    isTranslating,
    error 
  } = useUrduMagic({
    defaultLang: 'ur',
    apiKey: 'your-api-key'
  });

  const [text, setText] = useState('Hello World');
  const [translation, setTranslation] = useState('');

  const handleTranslate = async () => {
    try {
      const result = await translate(text, 'ur');
      setTranslation(result);
    } catch (err) {
      console.error('Translation failed:', err);
    }
  };

  return (
    <div>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to translate"
      />
      <button onClick={handleTranslate} disabled={isTranslating}>
        {isTranslating ? 'Translating...' : 'Translate'}
      </button>
      
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <div>
        <h3>Translation:</h3>
        <p>{translation}</p>
      </div>
      
      <div>
        <button onClick={() => setLanguage('en')}>English</button>
        <button onClick={() => setLanguage('ur')}>Urdu</button>
        <button onClick={() => setLanguage('roman')}>Roman Urdu</button>
        <span>Current: {currentLanguage}</span>
      </div>
    </div>
  );
}
```

### **React Context Provider**
```typescript
import React from 'react';
import { UrduMagicProvider, useUrduMagicContext } from 'urdumagic';

// App level provider
function App() {
  return (
    <UrduMagicProvider config={{ defaultLang: 'ur', apiKey: 'xxx' }}>
      <Header />
      <MainContent />
      <Footer />
    </UrduMagicProvider>
  );
}

// Any component can use UrduMagic
function Header() {
  const { translate, setLanguage, currentLanguage } = useUrduMagicContext();
  
  return (
    <header>
      <h1>{translate('My Website', currentLanguage)}</h1>
      <nav>
        <button onClick={() => setLanguage('en')}>English</button>
        <button onClick={() => setLanguage('ur')}>Urdu</button>
      </nav>
    </header>
  );
}
```

---

## 🪄 MAGIC MODE

### **Automatic Page Translation**
```typescript
import UrduMagic from 'urdumagic';

// Enable magic mode - automatically translates page content
const um = UrduMagic.init({
  magicMode: { enabled: true }
});

// Or enable manually
um.enableMagicMode();

// Disable magic mode
um.disableMagicMode();

// Check if magic mode is enabled
if (um.isMagicModeEnabled()) {
  console.log('Magic mode is active');
}
```

### **HTML Auto-Initialization**
```html
<!-- Add data-urdumagic attribute to auto-initialize -->
<div data-urdumagic>
  <h1>Welcome to My Site</h1>
  <p>This content will be automatically translated to Urdu.</p>
</div>

<script src="urdumagic.js"></script>
<!-- UrduMagic auto-initializes and translates -->
```

---

## 📱 VANILLA JAVASCRIPT

### **Simple HTML Integration**
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/urdumagic"></script>
</head>
<body>
  <div id="app">
    <input id="textInput" placeholder="Enter text">
    <button id="translateBtn">Translate</button>
    <div id="result"></div>
  </div>

  <script>
    // Initialize UrduMagic
    const um = UrduMagic.init({
      apiKey: 'your-api-key'
    });

    // Translate on button click
    document.getElementById('translateBtn').onclick = async () => {
      const text = document.getElementById('textInput').value;
      const result = await um.translate(text, 'ur');
      document.getElementById('result').textContent = result;
    };

    // Language switcher
    um.setLanguage('ur'); // Switch to Urdu
  </script>
</body>
</html>
```

### **Dynamic Content Translation**
```html
<div id="content">
  <p>This content will be translated dynamically.</p>
</div>

<script>
  const um = UrduMagic.init();

  // Translate specific element
  async function translateElement(elementId) {
    const element = document.getElementById(elementId);
    const originalText = element.textContent;
    const translated = await um.translate(originalText, 'ur');
    element.textContent = translated;
  }

  // Translate on load
  translateElement('content');

  // Translate on user action
  document.addEventListener('click', async (e) => {
    if (e.target.matches('.translate-me')) {
      translateElement(e.target.id);
    }
  });
</script>
```

---

## 🔧 ADVANCED CONFIGURATION

### **Custom Strategy Priority**
```typescript
import UrduMagic from 'urdumagic';

const um = UrduMagic.init({
  strategy: 'libre', // Use LibreTranslate
  libreUrl: 'https://your-libre-instance.com',
  apiKey: 'your-api-key',
  fallbackChain: {
    strategies: ['libre', 'offline'], // Fallback to offline if Libre fails
    strategy: 'sequential'
  },
  performance: {
    cacheTTL: 3600000, // 1 hour cache
    debounceMs: 300
  }
});
```

### **Security Configuration**
```typescript
import UrduMagic from 'urdumagic';

const um = UrduMagic.init({
  security: {
    sanitizeInput: true,
    maxLength: 5000,
    allowedTags: ['p', 'span', 'div'],
    enableCSP: true
  }
});
```

---

## 📊 USAGE PATTERNS

### **E-commerce Site**
```typescript
// Product descriptions
const um = UrduMagic.init({ defaultLang: 'ur' });

function translateProductDescription(description: string) {
  return um.translate(description, 'ur');
}

// User reviews
function translateReview(review: string) {
  return um.translate(review, 'ur');
}
```

### **News Website**
```typescript
// Auto-translate articles
const um = UrduMagic.init({
  magicMode: { enabled: true },
  defaultLang: 'ur'
});

// Articles automatically translate to Urdu
```

### **Educational Platform**
```typescript
// Interactive learning
const um = UrduMagic.init();

function translateLesson(content: string, targetLang: 'ur' | 'en') {
  return um.translate(content, targetLang);
}

// Roman Urdu practice
function practiceRomanUrdu(text: string) {
  return um.toRoman(text);
}
```

---

## 🎯 BEST PRACTICES

### **Performance**
```typescript
// Reuse instance
const um = UrduMagic.init(); // Initialize once

// Not this:
// const um1 = UrduMagic.init();
// const um2 = UrduMagic.init(); // Bad - multiple instances
```

### **Error Handling**
```typescript
const um = UrduMagic.init();

try {
  const result = await um.translate('Hello', 'ur');
  console.log(result);
} catch (error) {
  console.error('Translation failed:', error);
  // Fallback to transliteration
  const fallback = um.toUrdu('hello');
  console.log('Fallback:', fallback);
}
```

### **Language Detection**
```typescript
const um = UrduMagic.init();

function smartTranslate(text: string) {
  const script = um.detectScript(text);
  
  if (script === 'arabic') {
    // Already Urdu, transliterate to Roman
    return um.toRoman(text);
  } else if (script === 'roman-urdu') {
    // Roman Urdu, convert to Urdu script
    return um.toUrdu(text);
  } else {
    // English, translate to Urdu
    return um.translate(text, 'ur');
  }
}
```

---

## 📦 BUNDLE SIZE OPTIMIZATION

### **Tree Shaking**
```typescript
// Only import what you need
import UrduMagic from 'urdumagic/core'; // Smaller bundle
// or
import { init, translate } from 'urdumagic'; // Even smaller
```

### **Lazy Loading**
```typescript
// Load UrduMagic only when needed
async function loadUrduMagic() {
  const { default: UrduMagic } = await import('urdumagic');
  return UrduMagic.init();
}
```

---

## 🚀 DEPLOYMENT

### **CDN Usage**
```html
<!-- Latest version -->
<script src="https://unpkg.com/urdumagic"></script>

<!-- Specific version -->
<script src="https://unpkg.com/urdumagic@1.0.0"></script>

<!-- Minified version -->
<script src="https://unpkg.com/urdumagic/dist/urdumagic.min.js"></script>
```

### **NPM Usage**
```bash
npm install urdumagic
```

```typescript
// ES6 import
import UrduMagic from 'urdumagic';

// CommonJS require
const UrduMagic = require('urdumagic');
```

---

## 🎯 SUMMARY

**UrduMagic v1 API is deliberately simple:**

1. **Initialize once** - `UrduMagic.init(config)`
2. **Translate** - `await translate(text, lang)`
3. **Switch language** - `setLanguage(lang)`
4. **Auto-translate page** - `enableMagicMode()`

All internal complexity (strategies, routing, caching, security) is **hidden** behind these simple methods.

**For advanced usage:** Use React hooks or configuration options.

**For simple use cases:** Use the static methods `quickTranslate()` and `quickTransliterate()`.
