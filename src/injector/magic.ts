import { debounce } from '../core/debounce.js';
import { toRoman } from '../core/transliterator.js';
import type { LangMode } from '../ui/switcher.js';
import { applyUrduRtl, clearUrduRtl } from '../ui/rtl.js';

const ORIGINAL_ATTR = 'data-original-text';

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'CODE',
  'PRE',
  'KBD',
  'SAMP',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'BUTTON',
  'NOSCRIPT',
  'IFRAME',
]);

export interface MagicDomOptions {
  readonly debounceMs: number;
  readonly translate: (text: string, targetLang: 'ur' | 'en') => Promise<string>;
}

export interface MagicDomController {
  snapshotAndMark(): void;
  applyLanguage(lang: LangMode): Promise<void>;
  destroy(): void;
}

function isInHead(el: Element, doc: Document): boolean {
  return doc.head.contains(el);
}

function shouldSkipElement(el: Element, doc: Document): boolean {
  if (!(el instanceof HTMLElement)) return true;
  if (isInHead(el, doc)) return true;
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.closest('[contenteditable="true"]') !== null) return true;
  if (el.closest('[data-no-translate]') !== null || el.closest('[data-skip-translate]') !== null)
    return true;
  if (el.getAttribute('lang') === 'en') return true;
  return false;
}

function hasElementChildren(el: Element): boolean {
  return el.children.length > 0;
}

function isIgnorableText(text: string): boolean {
  const t = text.trim();
  if (t.length === 0) return true;
  if (/^\d+$/.test(t)) return true;
  return false;
}

function markLeafIfNeeded(el: HTMLElement, doc: Document): void {
  if (shouldSkipElement(el, doc)) return;
  if (hasElementChildren(el)) return;
  const txt = el.textContent ?? '';
  if (isIgnorableText(txt)) return;
  if (!el.hasAttribute(ORIGINAL_ATTR)) {
    el.setAttribute(ORIGINAL_ATTR, txt);
  }
}

function walkForMark(root: Element, doc: Document): void {
  if (shouldSkipElement(root, doc)) return;
  if (!hasElementChildren(root)) {
    markLeafIfNeeded(root as HTMLElement, doc);
    return;
  }
  for (let i = 0; i < root.children.length; i += 1) {
    const child = root.children[i];
    if (child !== undefined) walkForMark(child, doc);
  }
}

function collectMarked(doc: Document): HTMLElement[] {
  return Array.from(doc.querySelectorAll(`[${ORIGINAL_ATTR}]`)) as HTMLElement[];
}

/**
 * Create a DOM translation controller that snapshots text into {@link ORIGINAL_ATTR}
 * and reapplies translations using `element.textContent` only.
 */
export function createMagicDom(doc: Document, opts: MagicDomOptions): MagicDomController {
  let observer: MutationObserver | undefined;
  let cancelled = false;
  let currentLang: LangMode = 'en';

  const snapshotAndMark = (): void => {
    if (doc.body === null) return;
    walkForMark(doc.body, doc);
  };

  const applyLanguageInner = async (lang: LangMode): Promise<void> => {
    if (cancelled) return;
    const nodes = collectMarked(doc);
    if (lang === 'ur') {
      applyUrduRtl(doc);
      await Promise.all(
        nodes.map(async (el) => {
          const original = el.getAttribute(ORIGINAL_ATTR) ?? el.textContent ?? '';
          const out = await opts.translate(original, 'ur');
          el.textContent = out;
        }),
      );
      return;
    }

    clearUrduRtl(doc);

    if (lang === 'roman') {
      await Promise.all(
        nodes.map(async (el) => {
          const original = el.getAttribute(ORIGINAL_ATTR) ?? el.textContent ?? '';
          const ur = await opts.translate(original, 'ur');
          el.textContent = toRoman(ur);
        }),
      );
      return;
    }

    for (const el of nodes) {
      const original = el.getAttribute(ORIGINAL_ATTR) ?? '';
      el.textContent = original;
    }
  };

  const debouncedHandleMutations = debounce(() => {
    if (cancelled || doc.body === null) return;
    snapshotAndMark();
    void applyLanguageInner(currentLang);
  }, opts.debounceMs);

  const applyLanguage = async (lang: LangMode): Promise<void> => {
    currentLang = lang;
    await applyLanguageInner(lang);
  };

  const startObserver = (): void => {
    if (doc.body === null) return;
    observer = new MutationObserver(() => {
      debouncedHandleMutations();
    });
    observer.observe(doc.body, { subtree: true, childList: true, characterData: true });
  };

  snapshotAndMark();
  startObserver();

  return {
    snapshotAndMark,
    applyLanguage,
    destroy(): void {
      cancelled = true;
      debouncedHandleMutations.cancel();
      observer?.disconnect();
      observer = undefined;
      clearUrduRtl(doc);
    },
  };
}
