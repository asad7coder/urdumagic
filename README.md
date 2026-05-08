# UrduMagic 🪄

[![npm version](https://img.shields.io/npm/v/urdumagic.svg)](https://www.npmjs.com/package/urdumagic)
[![bundle size](https://img.shields.io/bundlephobia/minzip/urdumagic)](https://bundlephobia.com/package/urdumagic)
[![test status](https://img.shields.io/github/actions/workflow/status/asad7coder/urdumagic/test.yml?branch=main)](https://github.com/asad7coder/urdumagic/actions)
[![license](https://img.shields.io/npm/l/urdumagic.svg)](https://github.com/asad7coder/urdumagic/blob/main/LICENSE)

**UrduMagic** is a high-performance, enterprise-grade JavaScript library for **100% Offline Whole-Site Translation**. 

It instantly transforms your entire website into **Urdu script**, **Roman Urdu**, or **English** with zero configuration. Powered by a massive **10,000+ entry offline dictionary**, it provides blazingly fast, context-accurate translations without the latency of network calls, API keys, or privacy concerns.

---

## 🚀 How It Works

UrduMagic uses a modular middleware architecture designed for speed and security. It scans your DOM using a non-recursive `TreeWalker` and translates content through a dictionary-driven pipeline.

```text
[ Browser Context ]
       |
[ UrduMagic.init() ] <----------------------- [ Core Instance ]
       |                                             |
       +-----> [ UI Switcher ] ---------------------> [ Layout & RTL ]
       |          (Top-Right Toggle)                 (Noto Nastaliq Fonts)
       |                                             |
       +-----> [ Magic DOM ] -----------------------> [ Mutation Observer ]
       |          (TreeWalker Scanning)              (Live Content Sync)
       |                                             |
       +-----> [ Translation Pipeline ] ------------> [ Offline Engine ]
                  (10k Dictionary)                   (Zero Network Calls)
```

---

## 📦 Installation

### npm
```bash
npm install urdumagic
```

### CDN
```html
<script src="https://unpkg.com/urdumagic/dist/urdumagic.umd.js"></script>
```

---

## 🛠️ Quick Start

```ts
import { UrduMagic } from 'urdumagic';

const magic = UrduMagic.init({
  defaultLang: 'en',
  modes: ['en', 'ur', 'roman'],
  showSwitcher: true,
  strategy: 'offline', // Always offline
  performance: {
    debounceMs: 300
  }
});
```

---

## 📖 API Reference

### Instance Methods
| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `switchLang` | `lang: LangMode` | `void` | Toggles the entire page to the target language. |
| `translate` | `text, targetLang` | `Promise<string>` | Translates a string using the offline dictionary. |
| `toUrdu` | `text: string` | `string` | **Offline** conversion of Roman Urdu to Urdu script. |
| `toRoman` | `text: string` | `string` | **Offline** conversion of Urdu script to Roman Urdu. |
| `fromEnglish`| `text: string` | `Result` | **Offline** lookup in the 10k entry dictionary. |
| `destroy` | `none` | `void` | Cleans up UI, observers, and event listeners. |

### Configuration Options
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultLang` | `'en'\|'ur'\|'roman'` | `'en'` | Initial language mode. |
| `showSwitcher`| `boolean` | `true` | Show/hide the floating toggle button. |
| `strategy` | `'offline'` | `'offline'` | Must be 'offline' (v0.2.0+). |
| `performance` | `PerformanceConfig`| `{...}` | Control debounce and cache TTL. |
| `security` | `SecurityConfig` | `{...}` | Enable/disable XSS and proto protection. |

---

## ⚛️ Framework Usage

### React Hook
```tsx
import { useUrduMagic } from 'urdumagic/react';

function App() {
  const { lang, switchLang } = useUrduMagic({ defaultLang: 'en' });
  return <button onClick={() => switchLang('ur')}>Switch to Urdu</button>;
}
```

### Next.js (App Router)
Ensure you initialize in a client component and use `transpilePackages: ['urdumagic']` in your `next.config.js`.

---

## ⚠️ Limitations

While UrduMagic is powerful, it has some honest constraints:
- **Slang & Context**: The offline dictionary is literal; it may struggle with modern internet slang or complex poetic metaphors.
- **Dynamic Hydration**: In some SPA setups (React/Vue), heavy state updates might occasionally overwrite translations if the MutationObserver is disabled.
- **Bundle Size**: Including the 10,000-entry dictionary adds ~1MB (uncompressed) to your bundle.
- **Language Scope**: Currently strictly supports English-Urdu pairs only.

---

## 🔧 Extending UrduMagic

UrduMagic is built to be modular. You can easily extend its capabilities:
1.  **New Words**: Add entries directly to the dictionary Map in `src/data/english-urdu-dictionary.ts`.
2.  **Custom Logic**: Modify the `OfflineTranslator` class to handle specific brand-voice translations.
3.  **UI Theming**: Override the CSS in `src/ui/switcher.ts` to match your brand's look and feel.
4.  **Web Workers**: Future support for moving the 1MB dictionary lookup off the main thread for ultra-low-end devices.

---

## 🤝 Contributing

We welcome contributions from the Pakistani developer community! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

---

**Built with ❤️ for a more accessible Urdu web.**
