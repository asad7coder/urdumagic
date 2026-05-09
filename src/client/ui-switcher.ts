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
  top: 80px;
  right: 20px;
  z-index: 2147483646;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
#urdumagic-switcher .urdumagic-switcher-bar {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}
#urdumagic-switcher .urdumagic-switcher-btn {
  min-width: 60px;
  height: 40px;
  padding: 0 20px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
#urdumagic-switcher .urdumagic-switcher-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
#urdumagic-switcher .urdumagic-switcher-btn[aria-pressed="true"] {
  background: #f59e0b;
  border-color: #f59e0b;
  color: #0f172a;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
#urdumagic-switcher .urdumagic-switcher-btn:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 4px;
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
    },
  };
}
