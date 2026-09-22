const STYLE_ID = 'urdumagic-rtl-styles';
const FONT_LINK_ID = 'urdumagic-font-link';

/**
 * Injects the Noto Nastaliq Urdu @font-face and layout reflow CSS into <head>.
 * This ensures Urdu text is legible and the layout flips correctly.
 */
function injectStyles(doc: Document): void {
  // Inject Google Fonts link
  if (!doc.getElementById(FONT_LINK_ID)) {
    const link = doc.createElement('link');
    link.id = FONT_LINK_ID;
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    doc.head.appendChild(link);
  }

  // Inject Styles
  if (doc.getElementById(STYLE_ID)) return;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* Layout Reflow Logic */
    [dir="rtl"] {
      text-align: right;
    }
    
    /* Apply beautiful Nastaliq font to all text in Urdu mode */
    [lang="ur"] body,
    [lang="ur"] * {
      font-family: 'Noto Nastaliq Urdu', serif !important;
    }
    
    /* Optimize spacing for Nastaliq's tall cursive script */
    [lang="ur"] body {
      line-height: 2.2 !important;
    }

    [lang="ur"] h1, [lang="ur"] h2, [lang="ur"] h3, 
    [lang="ur"] h4, [lang="ur"] h5, [lang="ur"] h6 {
      line-height: 2.5 !important;
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
