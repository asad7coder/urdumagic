import { parse, HTMLElement, TextNode } from 'node-html-parser';
import { createManagedTranslator } from '../core/translator.js';
import { getDictionarySync } from '../core/dictionary-loader.js';
import { LangMode, UrduMagicConfig } from '../types.js';

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'CODE',
  'PRE',
  'KBD',
  'SAMP',
  'NOSCRIPT',
  'IFRAME',
]);

function shouldSkipElement(el: HTMLElement, isContentCheck = false): boolean {
  if (!el) return false;
  const tagName = el.tagName?.toUpperCase();

  if (SKIP_TAGS.has(tagName) || tagName === 'HEAD') return true;
  if (isContentCheck && (tagName === 'HTML' || tagName === 'BODY')) return true;

  if (el.getAttribute('data-no-translate') !== undefined || el.getAttribute('data-skip-translate') !== undefined)
    return true;
  if (el.getAttribute('lang') === 'en') return true;

  let parent = el.parentNode as HTMLElement;
  while (parent) {
    const parentTagName = parent.tagName?.toUpperCase();
    if (parentTagName === 'HEAD' || SKIP_TAGS.has(parentTagName)) return true;
    if (parent.getAttribute?.('data-no-translate') !== undefined || parent.getAttribute?.('data-skip-translate') !== undefined)
      return true;
    parent = parent.parentNode as HTMLElement;
  }

  return false;
}

/**
 * Translates an HTML string for SSR.
 * Handles text nodes, alt attributes, and placeholder attributes.
 */
export async function renderToString(
  html: string,
  targetLang: LangMode,
  config?: UrduMagicConfig
): Promise<string> {
  if (targetLang === 'en') return html;

  // Ensure dictionary is loaded
  getDictionarySync();

  const root = parse(html);
  const translator = createManagedTranslator(config ?? {
    defaultLang: 'en',
    modes: ['en', 'ur', 'roman'],
    strategy: 'offline'
  });

  const textNodes: TextNode[] = [];
  const attrNodes: Array<{ el: HTMLElement; attr: string; text: string }> = [];

  const traverse = (node: any) => {
    if (node instanceof TextNode) {
      const text = node.text.trim();
      if (text && !text.startsWith('<!') && !text.startsWith('<?') && !shouldSkipElement(node.parentNode as HTMLElement, true)) {
        textNodes.push(node);
      }
    } else if (node instanceof HTMLElement) {
      const tagName = node.tagName?.toUpperCase();

      // Handle alt and placeholder attributes
      if (!shouldSkipElement(node)) {
        const alt = node.getAttribute('alt');
        if (alt?.trim()) attrNodes.push({ el: node, attr: 'alt', text: alt.trim() });

        const placeholder = node.getAttribute('placeholder');
        if (placeholder?.trim()) attrNodes.push({ el: node, attr: 'placeholder', text: placeholder.trim() });
      }

      if (!SKIP_TAGS.has(tagName) && tagName !== 'HEAD') {
        node.childNodes.forEach(traverse);
      }
    }
  };

  root.childNodes.forEach(traverse);

  // Translate all
  const [textTranslations, attrTranslations] = await Promise.all([
    Promise.all(textNodes.map(node => translator.translate(node.text.trim(), targetLang))),
    Promise.all(attrNodes.map(node => translator.translate(node.text, targetLang)))
  ]);

  // Apply text translations
  textNodes.forEach((node, i) => {
    const original = node.text;
    const leadingWs = original.match(/^\s*/)?.[0] || '';
    const trailingWs = original.match(/\s*$/)?.[0] || '';
    (node as any).rawText = `${leadingWs}${textTranslations[i]}${trailingWs}`;
  });

  // Apply attribute translations
  attrNodes.forEach((node, i) => {
    node.el.setAttribute(node.attr, attrTranslations[i]);
  });

  // Add RTL support if Urdu
  if (targetLang === 'ur') {
    const htmlEl = root.querySelector('html');
    if (htmlEl) {
      htmlEl.setAttribute('dir', 'rtl');
    } else {
      // If it's just a fragment, we can't easily add dir="rtl" to a root that doesn't exist
      // but we can wrap it or just return as is. The requirement says adds to <html> tag.
    }
  }

  const result = root.toString();
  translator.dispose();
  return result;
}
