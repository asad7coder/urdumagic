# UrduMagic 🪄

[![npm version](https://img.shields.io/npm/v/urdumagic.svg)](https://www.npmjs.com/package/urdumagic)
[![bundle size](https://img.shields.io/bundlephobia/minzip/urdumagic)](https://bundlephobia.com/package/urdumagic)
[![test status](https://img.shields.io/github/actions/workflow/status/asad7coder/urdumagic/test.yml?branch=main)](https://github.com/asad7coder/urdumagic/actions)
[![SSR](https://img.shields.io/badge/SSR-Supported-green)](https://github.com/asad7coder/urdumagic)
[![Next.js](https://img.shields.io/badge/Next.js-Ready-blue)](https://github.com/asad7coder/urdumagic)
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
import { UrduMagic } from "urdumagic";

const magic = UrduMagic.init({
  defaultLang: "en",
  modes: ["en", "ur", "roman"],
  showSwitcher: true,
  strategy: "offline", // Always offline
  performance: {
    debounceMs: 300,
  },
});
```

---

## 📖 API Reference

### Static Methods

| Method        | Parameters         | Return Type       | Description                                          |
| :------------ | :----------------- | :---------------- | :--------------------------------------------------- |
| `autoTranslate`| `text, targetLang` | `Promise<string>` | Auto-detects script and translates accordingly.      |
| `detectScript`| `text: string`     | `ScriptType`      | Detects the script type of the input text.           |
| `renderToString`| `html, targetLang, config?` | `Promise<string>` | Renders HTML with UrduMagic translations for SSR.    |

### Instance Methods

| Method        | Parameters         | Return Type       | Description                                          |
| :------------ | :----------------- | :---------------- | :--------------------------------------------------- |
| `switchLang`  | `lang: LangMode`   | `void`            | Toggles the entire page to the target language.      |
| `translate`   | `text, targetLang` | `Promise<string>` | Translates a string using the offline dictionary.    |
| `toUrdu`      | `text: string`     | `string`          | **Offline** conversion of Roman Urdu to Urdu script. |
| `toRoman`     | `text: string`     | `string`          | **Offline** conversion of Urdu script to Roman Urdu. |
| `fromEnglish` | `text: string`     | `Result`          | **Offline** lookup in the 10k entry dictionary.      |
| `destroy`     | `none`             | `void`            | Cleans up UI, observers, and event listeners.        |

### Configuration Options

| Option         | Type                  | Default     | Description                              |
| :------------- | :-------------------- | :---------- | :--------------------------------------- |
| `defaultLang`  | `'en'\|'ur'\|'roman'` | `'en'`      | Initial language mode.                   |
| `showSwitcher` | `boolean`             | `true`      | Show/hide the floating toggle button.    |
| `strategy`     | `'offline'`           | `'offline'` | Must be 'offline' (v0.2.0+).             |
| `performance`  | `PerformanceConfig`   | `{...}`     | Control debounce and cache TTL.          |
| `security`     | `SecurityConfig`      | `{...}`     | Enable/disable XSS and proto protection. |

---

## 🌩️ Server-Side Rendering (v0.3.0+)

UrduMagic now supports full SSR for Next.js and Node.js environments.

### ⚡ SSR Quick Start

```ts
import { renderToString } from "urdumagic/server";

const urduHtml = await renderToString(englishHtml, "ur");
// Returns HTML with translated text and dir="rtl"
```

### ⏭️ Next.js Setup Guide

Follow these steps to enable Urdu SSR in your Next.js project:

1.  **Install**: `npm install urdumagic`
2.  **Configure**: Wrap your `next.config.js`:
    ```js
    const withUrduMagic = require("urdumagic/next");
    module.exports = withUrduMagic({
      locales: ["en", "ur", "roman"],
      defaultLocale: "en",
    });
    ```
3.  **Middleware**: UrduMagic automatically handles locale detection and cookie setting if you use the built-in middleware helper in your `middleware.ts`.
4.  **Static Params**: Use `generateUrduParams` in your pages for SSG:
    ```ts
    import { generateUrduParams } from "urdumagic/next";
    export async function generateStaticParams() {
      return generateUrduParams();
    }
    ```
5.  **Translate**: Use `renderToString` in Server Components or the `<UrduText />` component.

### ⚡ SSG Example (App Router)

```tsx
import { renderToString } from 'urdumagic/server' 

export default async function ListingsPage({ params }) {
  const { lang } = await params
  const listings = await getListings()
  
  const translatedListings = listings.map(listing => ({
    ...listing,
    title: renderToString(listing.title, lang),
  }))

  return <ListingsGrid listings={translatedListings} />
}
```

### 📚 Custom Dictionary Guide

```ts
import { extendDictionary } from "urdumagic/server";

extendDictionary({
  sahiwal: "ساہیوال",
  qurbani: "قربانی",
});
```

### 🔄 Migration: v0.2 → v0.3

- **Zero Breaking Changes**: Your existing `UrduMagic.init()` and `useUrduMagic()` work exactly as before.
- **New Exports**:
  - `urdumagic/server`: For Node.js/SSR.
  - `urdumagic/next`: For Next.js plugins and helpers.
  - `urdumagic/react-server`: For React Server Components.

---

## 🏗️ Real World Example: Atmandi

[Atmandi.com](https://atmandi.com) uses UrduMagic to provide a seamless buying/selling experience for livestock in Pakistan, with full SEO indexing of Urdu content.

---

## ⚠️ Limitations

While UrduMagic is powerful, it has some honest constraints:

- **Slang & Context**: The offline dictionary is literal; it may struggle with modern internet slang or complex poetic metaphors.
- **Dynamic Hydration**: In some SPA setups (React/Vue), heavy state updates might occasionally overwrite translations if the MutationObserver is disabled.
- **Bundle Size**: UrduMagic uses lazy loading for the 1.2MB dictionary. Core bundle is <50KB; dictionary loads only when translation is needed.
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
