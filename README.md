# UrduMagic

[![npm version](https://img.shields.io/npm/v/urdumagic.svg)](https://www.npmjs.com/package/urdumagic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Bundle size](https://img.shields.io/badge/gzip%20ESM-16.33KB-blue.svg)](https://github.com/muhammadasad/urdumagic)

## What is UrduMagic?

UrduMagic is a small TypeScript library for adding English, Urdu script, and Roman Urdu support to websites. It can transliterate offline between Roman Urdu and Urdu, optionally translate through LibreTranslate or a custom translator, and update visible page text with a built-in language switcher.

## Install

```bash
npm install urdumagic
```

## Quick Start - npm

```ts
import { UrduMagic } from 'urdumagic';

const app = UrduMagic.init({
  defaultLang: 'en',
  modes: ['en', 'ur', 'roman'],
});

await app.translate('Hello', 'ur');
app.toUrdu('salam');
app.toRoman('سلام');
```

## Quick Start - CDN

After building the package, serve the project root so `/dist/urdumagic.js` is reachable:

```bash
npm run build
npx http-server . -p 3000
```

Then include the browser build:

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

## Magic Mode

Magic mode snapshots visible text, stores the original text, and lets users switch between English, Urdu, and Roman Urdu. Urdu mode translates through the configured backend. Roman mode uses offline transliteration. English restores the original text.

Skipped content includes `script`, `style`, `code`, `pre`, form controls, `lang="en"`, `data-no-translate`, and `contenteditable` regions.

## React Example

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

Run the demo from the repo root:

```bash
npm run demo:react
```

## Next.js Example

Use UrduMagic inside a client component so `document` exists:

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

## Plain HTML Example

Open [demo/plain-html/index.html](demo/plain-html/index.html) in a browser after building the library.

## Custom Translator

Pass a custom translator object with `translator: 'custom'`:

```ts
import { UrduMagic } from 'urdumagic';

const myPlugin = {
  name: 'my-api',
  async translate(text: string, targetLang: 'ur' | 'en') {
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

## API Reference

| Method | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `UrduMagic.init` | `UrduMagicConfig` | `UrduMagicInstance` | Starts the browser instance, language switcher, and translation pipeline. |
| `UrduMagic.translate` | `text`, `targetLang: 'ur' \| 'en'` | `Promise<string>` | Uses the active instance pipeline or a lightweight default translator. |
| `UrduMagic.toUrdu` | Roman Urdu text | `string` | Converts Roman Urdu to Urdu script offline. |
| `UrduMagic.toRoman` | Urdu script text | `string` | Converts Urdu script to Roman Urdu offline. |
| `UrduMagic.detectScript` | `text` | `ScriptType` | Returns `arabic`, `latin`, `roman-urdu`, `english`, or `mixed`. |

## Instance API

| Method | Parameters | Returns | Description |
| --- | --- | --- | --- |
| `instance.destroy` | none | `void` | Removes observers, switcher UI, and runtime resources. |
| `instance.switchLang` | `'en' \| 'ur' \| 'roman'` | `void` | Changes the active page language mode. |
| `instance.getCurrentLang` | none | `'en' \| 'ur' \| 'roman'` | Returns the current language mode. |
| `instance.translate` | `text`, `targetLang: 'ur' \| 'en'` | `Promise<string>` | Translates with cache, rate limit, and fallback handling. |
| `instance.toUrdu` | Roman Urdu text | `string` | Converts Roman Urdu to Urdu script offline. |
| `instance.toRoman` | Urdu script text | `string` | Converts Urdu script to Roman Urdu offline. |

## Configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultLang` | `'en' \| 'ur' \| 'roman'` | required | Initial language. Must be included in `modes`. |
| `modes` | `Array<'en' \| 'ur' \| 'roman'>` | required | Languages shown in the switcher. |
| `showSwitcher` | `boolean` | `true` | Shows the floating language switcher. |
| `translator` | `'libretranslate' \| 'custom'` | `'libretranslate'` | Translation backend selection. |
| `libreUrl` | `string` | `https://libretranslate.com` | LibreTranslate base URL. |
| `apiKey` | `string` | none | Optional API key for hosted LibreTranslate instances. |
| `customTranslator` | object | none | Required when `translator` is `'custom'`. |
| `cacheTTL` | `number` | `86400000` | Cache lifetime in milliseconds. |
| `debounceMs` | `number` | `300` | Debounce for mutation-driven page updates. |
| `onLangSwitch` | `(lang: string) => void` | none | Runs after the active language changes. |

## Roman Urdu Support

The offline dictionary accepts many Pakistani spellings, including:

- `acha`, `achha`, `accha`
- `theek`, `teek`, `thik`
- `kya`, `kia`
- `hai`, `hay`
- `nahi`, `nahin`
- `mein`, `main`
- `paisa`, `pesa`
- `waqt`, `wakt`

If a word is missing from the dictionary, UrduMagic still applies rule-based transliteration for common letters and digraphs such as `kh`, `gh`, `sh`, and `ch`.

## Bundle Size

Current production build:

| File | Gzip |
| --- | ---: |
| `dist/urdumagic.es.js` | 16.33 kB |
| `dist/urdumagic.umd.js` | 16.76 kB |
| `dist/urdumagic.js` | 16.56 kB |

## Development

```bash
npm run test:run
npm run build
npm run demo:react
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md). Pull requests and issues are welcome.

## License

MIT. See [LICENSE](LICENSE).
