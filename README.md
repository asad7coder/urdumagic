# UrduMagic

[![npm version](https://img.shields.io/npm/v/urdumagic.svg)](https://www.npmjs.com/package/urdumagic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Bundle size](https://img.shields.io/badge/gzip%20ESM-%3C%2030KB-blue.svg)](https://github.com/muhammadasad/urdumagic)

## What is UrduMagic?

UrduMagic is a small TypeScript library that helps you add **English**, **Urdu script**, and **Roman Urdu** to a website with a few lines of code. It can transliterate offline between Roman Urdu and Urdu, optionally translate through [LibreTranslate](https://libretranslate.com), and can walk your page to keep new content in sync (“magic” mode).

## Quick start — CDN

After `npm run build`, serve the **project root** so `/dist/urdumagic.js` is reachable. Some tools (for example `serve`) may hide folders that appear in `.gitignore` such as `dist/`; if `UrduMagic.init` is undefined in the console, try `npm run demo:plain` or `npx http-server . -p 3000` instead.

Then include:

```html
<script src="./dist/urdumagic.js"></script>
<script>
  UrduMagic.init({
    defaultLang: 'en',
    modes: ['en', 'ur', 'roman'],
    translator: 'libretranslate',
    libreUrl: 'https://libretranslate.com',
  });
</script>
```

Three lines in the second block are enough to attach the switcher and magic mode on a static page.

## Quick start — npm

```bash
npm install urdumagic
```

```ts
import { UrduMagic } from 'urdumagic';

const app = UrduMagic.init({
  defaultLang: 'en',
  modes: ['en', 'ur', 'roman'],
});
```

## Magic mode (auto-translate the page)

Magic mode snapshots visible text, stores the original in `data-original-text`, and when you pick **Urdu** it translates via your configured backend; **Roman** shows Roman Urdu (Urdu script result passed through offline `toRoman`). **English** restores the snapshot. Skipped tags include `script`, `style`, `code`, `pre`, form controls, `lang="en"`, `data-no-translate`, and `contenteditable` regions.

## React example (`useUrduMagic`)

See [demo/react/useUrduMagic.ts](demo/react/useUrduMagic.ts) and [demo/react/App.tsx](demo/react/App.tsx).

```tsx
import { useUrduMagic } from './useUrduMagic';

export function Demo() {
  const { lang, switchLang, translate, toRoman, toUrdu, isReady } = useUrduMagic({
    defaultLang: 'en',
    modes: ['en', 'ur', 'roman'],
  });
  return (
    <div>
      <p>Ready: {String(isReady)}</p>
      <p>Language: {lang}</p>
      <button type="button" onClick={() => switchLang('ur')}>
        Urdu
      </button>
    </div>
  );
}
```

Run the demo dev server from the repo root:

```bash
npm run demo:react
```

## Next.js example

Use the same `UrduMagic.init` or `useUrduMagic` inside a **client component** so `document` exists:

```tsx
'use client';

import { useEffect } from 'react';
import { UrduMagic } from 'urdumagic';

export function UrduMagicClient() {
  useEffect(() => {
    const inst = UrduMagic.init({
      defaultLang: 'en',
      modes: ['en', 'ur', 'roman'],
      showSwitcher: true,
    });
    return () => inst.destroy();
  }, []);
  return null;
}
```

Place `<UrduMagicClient />` in your root layout or a page wrapper.

## Plain HTML example

Open [demo/plain-html/index.html](demo/plain-html/index.html) in a browser after building the library.

## Custom translator plugin

Implement `TranslatorPlugin` and pass it with `translator: 'custom'`:

```ts
import { UrduMagic, type TranslatorPlugin } from 'urdumagic';

const myPlugin: TranslatorPlugin = {
  name: 'my-api',
  async translate(text, targetLang) {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });
    const data = (await res.json()) as { t: string };
    return data.t;
  },
};

UrduMagic.init({
  defaultLang: 'en',
  modes: ['en', 'ur', 'roman'],
  translator: 'custom',
  customTranslator: myPlugin,
});
```

## API reference

| Method / export | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `UrduMagic.init` | `UrduMagicConfig` | `UrduMagicInstance` | Start magic mode, switcher, and translation pipeline in the browser. |
| `instance.destroy` | — | `void` | Remove observers, switcher, and release caches. |
| `instance.switchLang` | `lang: 'en' \| 'ur' \| 'roman'` | `void` | Change active UI + page language mode. |
| `instance.getCurrentLang` | — | `'en' \| 'ur' \| 'roman'` | Current language. |
| `instance.translate` | `text`, `targetLang: 'ur' \| 'en'` | `Promise<string>` | Translate with cache, rate limit, and retry; never rejects (falls back to `text + " [?]"`). |
| `instance.toRoman` | Urdu script `text` | `string` | Offline Urdu → Roman Urdu. |
| `instance.toUrdu` | Roman `text` | `string` | Offline Roman → Urdu script. |
| `UrduMagic.translate` | same as instance | `Promise<string>` | Uses the last `init` pipeline or a lightweight default. |
| `UrduMagic.toRoman` / `toUrdu` | same as instance | `string` | Static transliteration helpers. |
| `UrduMagic.detectScript` | `text` | `ScriptType` | `arabic`, `latin`, `roman-urdu`, `english`, or `mixed`. |
| `isRomanUrdu`, `isUrduScript`, `hasUrduWords` | `text` | `boolean` | Heuristics built on script ranges and Roman Urdu stopwords. |

## Configuration (`UrduMagicConfig`)

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultLang` | `'en' \| 'ur' \| 'roman'` | required | Initial language. Must appear in `modes`. |
| `modes` | array of languages | required | Languages shown in the switcher. |
| `showSwitcher` | `boolean` | `true` | Floating pill UI; set `false` to control language only via API. |
| `translator` | `'libretranslate' \| 'custom'` | `'libretranslate'` | Backend selection. |
| `libreUrl` | `string` | `https://libretranslate.com` | LibreTranslate base URL. |
| `apiKey` | `string` | — | Optional API key for hosted instances. |
| `customTranslator` | `TranslatorPlugin` | — | Required when `translator === 'custom'`. |
| `cacheTTL` | `number` (ms) | `86400000` (24h) | Memory + `localStorage` entry lifetime. |
| `debounceMs` | `number` | `300` | Debounce for mutation-driven magic updates. |
| `onLangSwitch` | `(lang: string) => void` | — | Fires after the active language changes. |

## Supported spelling variants (Roman Urdu)

The offline dictionary accepts many Pakistani spellings, for example **acha / achha**, **theek / teek / thik**, **kya / kia**, **hai / hay**, **nahi / nahin**, **mein / main**, **paisa / pesa**, **waqt / wakt**, and hundreds more. If a word is missing, the rule engine still maps letters and common digraphs (`kh`, `gh`, `sh`, `ch`, …).

## Bundle size breakdown

Typical production build (see `npm run build`):

| File | Approx. gzip |
| --- | ---: |
| `dist/urdumagic.es.js` | ~17 KB |
| `dist/urdumagic.umd.js` | ~17.5 KB |
| `dist/urdumagic.js` (CDN IIFE) | ~17.5 KB |

The Roman Urdu dictionary is the largest part of the payload; the rest is translation, cache, DOM, and UI logic.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md). Pull requests and issues are welcome.

## License

MIT — see [LICENSE](LICENSE).

---

## اردو میں مختصر تعارف

**UrduMagic** ایک ہلکی اور سادہ TypeScript لائبریری ہے جو ویب سائٹ پر **انگریزی، اردو رسم الخط، اور رومن اردو** لانے میں مدد دیتی ہے۔ یہ آف لائن رومن ↔ اردو تبدیلی کر سکتی ہے، اختیاری طور پر LibreTranslate سے ترجمہ کر سکتی ہے، اور صفحے کے متن کو خودکار طور پر اپ ڈیٹ کر سکتی ہے۔ تنصیب: `npm install urdumagic`۔
