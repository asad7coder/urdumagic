export type LangMode = 'en' | 'ur' | 'roman';

export interface SwitcherController {
  readonly root: HTMLDivElement;
  setActive(lang: LangMode): void;
  destroy(): void;
}

/**
 * Create the floating language switcher UI.
 */
export function createLanguageSwitcher(
  doc: Document,
  modes: readonly LangMode[],
  onSelect: (lang: LangMode) => void,
): SwitcherController {
  const prevPadding = doc.body.style.paddingBottom;
  doc.body.style.paddingBottom = '80px';

  const root = doc.createElement('div');
  root.id = 'urdumagic-switcher';
  root.setAttribute('role', 'toolbar');
  root.setAttribute('aria-label', 'Language switcher');
  root.setAttribute('data-no-translate', 'true');

  const live = doc.createElement('div');
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  live.className = 'urdumagic-sr-only';
  live.style.position = 'absolute';
  live.style.width = '1px';
  live.style.height = '1px';
  live.style.padding = '0';
  live.style.margin = '-1px';
  live.style.overflow = 'hidden';
  live.style.clip = 'rect(0,0,0,0)';
  live.style.whiteSpace = 'nowrap';
  live.style.border = '0';

  const bar = doc.createElement('div');
  bar.className = 'urdumagic-switcher-bar';

  const buttons: Partial<Record<LangMode, HTMLButtonElement>> = {};

  const labelFor = (lang: LangMode): string => {
    if (lang === 'en') return 'English';
    if (lang === 'ur') return 'اردو';
    return 'Roman';
  };

  const shortFor = (lang: LangMode): string => {
    if (lang === 'en') return 'EN';
    if (lang === 'ur') return 'UR';
    return 'R';
  };

  for (const lang of modes) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.dataset.lang = lang;
    btn.textContent = labelFor(lang);
    btn.className = 'urdumagic-switcher-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      onSelect(lang);
    });
    buttons[lang] = btn;
    bar.appendChild(btn);
  }

  let style = doc.getElementById('urdumagic-switcher-styles') as HTMLStyleElement | null;
  if (style === null) {
    style = doc.createElement('style');
    style.id = 'urdumagic-switcher-styles';
    style.textContent = `
#urdumagic-switcher {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2147483646;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
#urdumagic-switcher .urdumagic-switcher-bar {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}
#urdumagic-switcher .urdumagic-switcher-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
#urdumagic-switcher .urdumagic-switcher-btn[aria-pressed="true"] {
  background: rgba(26, 86, 219, 0.12);
  border-color: rgba(26, 86, 219, 0.35);
  color: #1a56db;
}
#urdumagic-switcher .urdumagic-switcher-btn:focus-visible {
  outline: 2px solid #1a56db;
  outline-offset: 2px;
}
`;
    doc.head.appendChild(style);
  }

  root.appendChild(bar);
  root.appendChild(live);
  doc.body.appendChild(root);

  const mq = doc.defaultView?.matchMedia('(max-width: 399px)');
  const applyCompact = (): void => {
    const compact = mq?.matches === true;
    for (const lang of modes) {
      const b = buttons[lang];
      if (b === undefined) continue;
      b.textContent = compact ? shortFor(lang) : labelFor(lang);
    }
  };
  applyCompact();
  mq?.addEventListener('change', applyCompact);

  let active: LangMode = modes[0] ?? 'en';

  const setActive = (lang: LangMode): void => {
    active = lang;
    for (const m of modes) {
      const b = buttons[m];
      if (b === undefined) continue;
      b.setAttribute('aria-pressed', m === lang ? 'true' : 'false');
    }
    live.textContent = `Language changed to ${lang}`;
    applyCompact();
  };

  setActive(active);

  return {
    root,
    setActive,
    destroy(): void {
      mq?.removeEventListener('change', applyCompact);
      root.remove();
      doc.body.style.paddingBottom = prevPadding;
    },
  };
}
