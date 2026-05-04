import type { TransliterationResult } from '../types.js';
import { detectScript, isUrduScript, ROMAN_URDU_STOPWORDS } from './detector.js';
import { ROMAN_TO_URDU } from './roman-urdu-dict.js';

/** Digraph priority order from project specification. */
const DIGRAPHS: readonly [string, string][] = [
  ['kh', 'خ'],
  ['gh', 'غ'],
  ['sh', 'ش'],
  ['ch', 'چ'],
  ['ph', 'پھ'],
  ['th', 'تھ'],
  ['dh', 'دھ'],
  ['zh', 'ژ'],
  ['bh', 'بھ'],
  ['rh', 'ڑ'],
  ['nh', 'نھ'],
  ['lh', 'لھ'],
  ['mh', 'مھ'],
  ['aa', 'آ'],
  ['ee', 'ی'],
  ['ii', 'ی'],
  ['oo', 'و'],
  ['uu', 'و'],
  ['ai', 'ے'],
  ['ay', 'ے'],
  ['au', 'او'],
  ['aw', 'او'],
] as const;

const SINGLE_LOWER: Readonly<Record<string, string>> = {
  a: 'ا',
  b: 'ب',
  p: 'پ',
  t: 'ت',
  s: 'س',
  j: 'ج',
  h: 'ہ',
  d: 'د',
  z: 'ز',
  r: 'ر',
  f: 'ف',
  q: 'ق',
  k: 'ک',
  g: 'گ',
  l: 'ل',
  m: 'م',
  n: 'ن',
  w: 'و',
  v: 'و',
  o: 'و',
  u: 'ا',
  y: 'ی',
  i: 'ی',
  e: 'ے',
  "'": 'ء',
};

const URDU_TO_ROMAN: Readonly<Record<string, string>> = {
  ا: 'a',
  آ: 'aa',
  ب: 'b',
  پ: 'p',
  ت: 't',
  ٹ: 'T',
  ث: 's',
  ج: 'j',
  چ: 'ch',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ڈ: 'D',
  ذ: 'z',
  ر: 'r',
  ڑ: 'R',
  ز: 'z',
  ژ: 'zh',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'z',
  ط: 't',
  ظ: 'z',
  ع: "'",
  غ: 'gh',
  ف: 'f',
  ق: 'q',
  ک: 'k',
  گ: 'g',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ں: 'n',
  و: 'o',
  ہ: 'h',
  ھ: 'h',
  ء: "'",
  ی: 'i',
  ے: 'e',
  ئ: 'y',
  ؤ: 'w',
  ة: 't',
  أ: 'a',
  إ: 'i',
};

const DIACRITICS = new Set('ًٌٍَُِّْ');

/** Whole-word Urdu → Roman overrides for common Pakistani spellings. */
const URDU_WHOLE_TO_ROMAN: Readonly<Record<string, string>> = {
  بھائی: 'bhai',
  ہے: 'hai',
  ہیں: 'hain',
  کیا: 'kya',
  نہیں: 'nahi',
  میں: 'mein',
  وہ: 'woh',
  یہ: 'yeh',
  اور: 'aur',
  بھی: 'bhi',
  سے: 'se',
  کو: 'ko',
  کا: 'ka',
  کی: 'ki',
  کے: 'kay',
};

function transliterateRomanStem(stem: string): string {
  let i = 0;
  const lower = stem.toLowerCase();
  let out = '';
  while (i < stem.length) {
    let matched = false;
    const slice = lower.slice(i);
    for (const [d, u] of DIGRAPHS) {
      if (slice.startsWith(d)) {
        out += u;
        i += d.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const ch = stem[i];
    if (ch === undefined) break;
    if (ch === 'T') {
      out += 'ٹ';
      i += 1;
      continue;
    }
    if (ch === 'D') {
      out += 'ڈ';
      i += 1;
      continue;
    }
    if (ch === 'R') {
      out += 'ڑ';
      i += 1;
      continue;
    }

    const lc = ch.toLowerCase();
    const mapped = SINGLE_LOWER[lc];
    if (mapped !== undefined) {
      out += mapped;
    } else if (/[0-9]/.test(ch)) {
      out += ch;
    }
    i += 1;
  }
  return out;
}

function applyEndRules(romanCore: string, urdu: string): string {
  let u = urdu;
  const core = romanCore.toLowerCase();

  if (/(ain|ayn)$/.test(core)) return u;
  if (/(oon|on)$/.test(core) && core.length >= 3) return u;

  if (/a$/.test(core) && !/aa$/.test(core) && !/(ai|ay|au|aw)$/.test(core)) {
    if (u.endsWith('ا')) u = `${u.slice(0, -1)}ہ`;
  }
  return u;
}

function romanWordToUrdu(word: string): string {
  const leading = word.match(/^[^A-Za-z0-9']*/)?.[0] ?? '';
  const trailing = word.match(/[^A-Za-z0-9']*$/)?.[0] ?? '';
  const coreRaw = word.slice(leading.length, word.length - trailing.length);
  if (coreRaw.length === 0) return word;

  const lowerKey = coreRaw.toLowerCase();
  const dictHit = ROMAN_TO_URDU.get(lowerKey);
  if (dictHit !== undefined) return `${leading}${dictHit}${trailing}`;

  let core = coreRaw;
  let suffix = '';

  if (/(ain|ayn)$/i.test(core)) {
    suffix = 'یں';
    core = core.replace(/(ain|ayn)$/i, '');
  } else if (/oon$/i.test(core)) {
    suffix = 'وں';
    core = core.replace(/oon$/i, '');
  } else if (/on$/i.test(core) && core.length > 3) {
    suffix = 'وں';
    core = core.replace(/on$/i, '');
  }

  let urdu = transliterateRomanStem(core) + suffix;
  urdu = applyEndRules(core.toLowerCase(), urdu);
  return `${leading}${urdu}${trailing}`;
}

/**
 * Convert Roman Urdu text to Urdu script using dictionary-first hybrid rules.
 *
 * @param text - Roman Urdu input
 * @returns Urdu script string
 */
export function toUrdu(text: string): string {
  const parts = text.split(/(\s+)/);
  return parts.map((p) => (/\s+/.test(p) ? p : romanWordToUrdu(p))).join('');
}

function stripDiacriticsAndShadda(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (c === undefined) continue;
    if (c === 'ّ') {
      const next = s[i + 1];
      if (next !== undefined) {
        const map = URDU_TO_ROMAN[next];
        if (map !== undefined) out += map + map;
        else out += next;
        i += 1;
      }
      continue;
    }
    if (DIACRITICS.has(c)) continue;
    out += c;
  }
  return out;
}

function mapUrduWordToRoman(word: string): string {
  const stripped = stripDiacriticsAndShadda(word);
  const whole = URDU_WHOLE_TO_ROMAN[stripped];
  if (whole !== undefined) return whole;
  let out = '';
  for (const c of stripped) {
    const m = URDU_TO_ROMAN[c];
    out += m ?? c;
  }
  return out;
}

/**
 * Convert Urdu script to Roman Urdu using the project character map.
 *
 * @param text - Urdu script input
 * @returns Roman Urdu string
 */
export function toRoman(text: string): string {
  const parts = text.split(/(\s+)/);
  return parts.map((p) => (/\s+/.test(p) ? p : mapUrduWordToRoman(p))).join('');
}

/**
 * Measure transliteration timing for diagnostics.
 *
 * @param text - Input text
 * @param direction - Target script form
 */
export function transliterateWithTiming(
  text: string,
  direction: 'toUrdu' | 'toRoman',
): TransliterationResult {
  const t0 = performance.now();
  const output = direction === 'toUrdu' ? toUrdu(text) : toRoman(text);
  const ms = performance.now() - t0;
  return {
    input: text,
    output,
    lang: direction === 'toUrdu' ? 'ur' : 'roman',
    ms,
  };
}

function tokenizeMixed(text: string): string[] {
  return text.split(/(\s+|[.,!?;:،۔]+)/);
}

/**
 * For mixed strings: Urdu tokens → Roman; Roman tokens with stopwords → Urdu; English-like Latin unchanged.
 *
 * @param text - Mixed-language input
 * @returns Best-effort harmonized string (Roman Urdu + English + Urdu kept per rules)
 */
export function processMixedToRomanUrdu(text: string): string {
  const tokens = tokenizeMixed(text);
  const out: string[] = [];
  for (const tok of tokens) {
    if (tok.trim() === '' || /^[.,!?;:،۔]+$/.test(tok)) {
      out.push(tok);
      continue;
    }
    if (isUrduScript(tok)) {
      out.push(toRoman(tok));
      continue;
    }
    if (/[A-Za-z]/.test(tok)) {
      const w = tok.replace(/[^A-Za-z0-9']/g, '').toLowerCase();
      if (w.length > 0 && ROMAN_URDU_STOPWORDS.has(w)) {
        out.push(toUrdu(tok));
        continue;
      }
    }
    out.push(tok);
  }
  return out.join('');
}

/**
 * Convert mixed input toward Urdu script where Roman Urdu stopwords appear.
 *
 * @param text - Mixed-language input
 */
export function processMixedToUrduScript(text: string): string {
  const tokens = tokenizeMixed(text);
  const out: string[] = [];
  for (const tok of tokens) {
    if (tok.trim() === '' || /^[.,!?;:،۔]+$/.test(tok)) {
      out.push(tok);
      continue;
    }
    if (isUrduScript(tok)) {
      out.push(tok);
      continue;
    }
    if (/[A-Za-z]/.test(tok)) {
      const w = tok.replace(/[^A-Za-z0-9']/g, '').toLowerCase();
      if (w.length > 0 && ROMAN_URDU_STOPWORDS.has(w)) {
        out.push(toUrdu(tok));
        continue;
      }
    }
    out.push(tok);
  }
  return out.join('');
}

/**
 * Classify and convert mixed-language strings based on dominant script.
 *
 * @param text - Mixed text
 */
export function processMixedAuto(text: string): string {
  const kind = detectScript(text);
  if (kind === 'arabic' || kind === 'mixed') return processMixedToRomanUrdu(text);
  if (kind === 'roman-urdu') return toUrdu(text);
  return text;
}
