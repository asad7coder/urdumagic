import { useState } from 'react';
import { useUrduMagic } from './useUrduMagic';

export function App(): JSX.Element {
  const { lang, switchLang, translate, toRoman, toUrdu, isReady } = useUrduMagic({
    defaultLang: 'en',
    modes: ['en', 'ur', 'roman'],
    showSwitcher: true,
    translator: 'libretranslate',
    libreUrl: 'https://libretranslate.com',
  });

  const [apiLine, setApiLine] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const runTranslate = async (): Promise<void> => {
    setBusy(true);
    try {
      const t = await translate('Good morning', 'ur');
      setApiLine(t);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ maxWidth: 520, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui' }}>
      <h1>UrduMagic + React</h1>
      <p>Ready: {isReady ? 'yes' : 'no'}</p>
      <p>Active language: {lang}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button type="button" onClick={() => switchLang('en')}>
          English
        </button>
        <button type="button" onClick={() => switchLang('ur')}>
          Urdu
        </button>
        <button type="button" onClick={() => switchLang('roman')}>
          Roman
        </button>
      </div>
      <p>
        Offline: <code>{toUrdu('theek')}</code> · <code>{toRoman('ٹھیک')}</code>
      </p>
      <p>
        <button type="button" disabled={busy} onClick={() => void runTranslate()}>
          Translate sample (API)
        </button>
      </p>
      {apiLine ? <p>API: {apiLine}</p> : null}
    </main>
  );
}
