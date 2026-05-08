import { debounce } from '../core/debounce.js';
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
  readonly translate: (text: string, targetLang: 'ur' | 'en' | 'roman') => Promise<string>;
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
  if (SKIP_TAGS.has(el.tagName.toUpperCase())) return true;
  if (el.closest('[contenteditable="true"]') !== null) return true;
  if (el.closest('[data-no-translate]') !== null || el.closest('[data-skip-translate]') !== null)
    return true;
  if (el.getAttribute('lang') === 'en') return true;
  return false;
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
    
    const walker = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (shouldSkipElement(parent, doc)) return NodeFilter.FILTER_REJECT;
          if (!node.textContent?.trim()) return NodeFilter.FILTER_SKIP;
          // Skip if already wrapped
          if (parent.hasAttribute(ORIGINAL_ATTR)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    textNodes.forEach(txtNode => {
      const parent = txtNode.parentElement;
      if (!parent) return;

      const originalText = txtNode.textContent || '';
      const wrapper = doc.createElement('span');
      wrapper.setAttribute(ORIGINAL_ATTR, originalText);
      wrapper.textContent = originalText;
      
      try {
        parent.replaceChild(wrapper, txtNode);
      } catch (e) {
        // Handle cases where node was removed/moved during iteration
      }
    });
  };

  const applyLanguageInner = async (lang: LangMode): Promise<void> => {
    if (cancelled) return;
    
    if (lang === 'en') {
      clearUrduRtl(doc);
      const wrappers = doc.querySelectorAll(`span[${ORIGINAL_ATTR}]`);
      wrappers.forEach(span => {
        const original = span.getAttribute(ORIGINAL_ATTR);
        if (original !== null) span.textContent = original;
      });
      return;
    }

    if (lang === 'ur') {
      applyUrduRtl(doc);
    } else {
      clearUrduRtl(doc);
    }

    const wrappers = Array.from(doc.querySelectorAll(`span[${ORIGINAL_ATTR}]`)) as HTMLElement[];
    const BATCH_SIZE = 20;

    for (let i = 0; i < wrappers.length; i += BATCH_SIZE) {
      if (cancelled) break;
      const chunk = wrappers.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        chunk.map(async (span) => {
          const original = span.getAttribute(ORIGINAL_ATTR) || '';
          const out = await opts.translate(original, lang === 'roman' ? 'roman' : 'ur');
          span.textContent = out;
        })
      );
      
      await new Promise(resolve => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(resolve);
        } else {
          setTimeout(resolve, 0);
        }
      });
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
