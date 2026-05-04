const NOTO_LINK_ID = 'urdumagic-noto-nastaliq';
const NOTO_HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap';

/**
 * Ensure Noto Nastaliq Urdu is loaded (idempotent).
 */
export function ensureNotoNastaliqFont(doc: Document): void {
  if (doc.getElementById(NOTO_LINK_ID) !== null) return;
  const link = doc.createElement('link');
  link.id = NOTO_LINK_ID;
  link.rel = 'stylesheet';
  link.href = NOTO_HREF;
  doc.head.appendChild(link);
}

const STYLE_ID = 'urdumagic-rtl-style';

/**
 * Inject minimal RTL + font CSS for Urdu mode.
 */
export function ensureRtlStyles(doc: Document): void {
  if (doc.getElementById(STYLE_ID) !== null) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.urdumagic-rtl, .urdumagic-rtl * {
  font-family: 'Noto Nastaliq Urdu', serif;
}
`;
  doc.head.appendChild(style);
}

/**
 * Apply RTL document direction and body class for Urdu display.
 */
export function applyUrduRtl(doc: Document): void {
  ensureNotoNastaliqFont(doc);
  ensureRtlStyles(doc);
  doc.documentElement.setAttribute('dir', 'rtl');
  doc.body.classList.add('urdumagic-rtl');
}

/**
 * Remove RTL direction markers while keeping font resources loaded.
 */
export function clearUrduRtl(doc: Document): void {
  doc.documentElement.removeAttribute('dir');
  doc.body.classList.remove('urdumagic-rtl');
}
