const STYLE_ID = 'urdumagic-rtl-styles';
const FONT_URL = 'https://fonts.gstatic.com/s/notonastaliqurdu/v18/rax9HiS693836ZOf9IeW_mI_3o0Uun_G3VIdK89H77Y.woff2';

/**
 * Injects the Noto Nastaliq Urdu @font-face and layout reflow CSS into <head>.
 * This ensures Urdu text is legible and the layout flips correctly.
 */
function injectStyles(doc: Document): void {
  if (doc.getElementById(STYLE_ID)) return;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @font-face {
      font-family: 'Noto Nastaliq Urdu';
      src: url('${FONT_URL}') format('woff2');
      font-display: swap;
    }

    /* Layout Reflow Logic */
    [dir="rtl"] {
      text-align: right;
    }
    
    /* Urdu specific typography for translated spans */
    [lang="ur"] span[data-original-text] {
      font-family: 'Noto Nastaliq Urdu', serif !important;
      line-height: 1.8 !important;
      font-size: 1.05em;
      display: inline-block; /* Helps with line-height in some containers */
    }
  `;
  doc.head.appendChild(style);
}

/**
 * Applies RTL direction, language markers, and Urdu typography.
 */
export function applyUrduRtl(doc: Document): void {
  injectStyles(doc);

  // 1. Root element RTL
  doc.documentElement.setAttribute('dir', 'rtl');
  doc.documentElement.setAttribute('lang', 'ur');
}

/**
 * Fully restores the page to LTR and removes Urdu-specific styling.
 */
export function clearUrduRtl(doc: Document): void {
  // 1. Restore root attributes
  doc.documentElement.setAttribute('dir', 'ltr');
  doc.documentElement.setAttribute('lang', 'en');

  // 2. Remove injected styles
  const styleTag = doc.getElementById(STYLE_ID);
  if (styleTag) {
    styleTag.remove();
  }
}
