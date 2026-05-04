You are a world-class TypeScript library developer and Urdu language expert.

Build a complete, production-ready, open-source npm package called **urdumagic**.
This is a serious library for the Pakistani developer community.
Do NOT rush any file. Every file must be complete, production-quality, and fully implemented.
No placeholders. No "TODO" comments. No empty functions.

════════════════════════════════════════
🎯 GOAL
════════════════════════════════════════
A super-lightweight, plug-and-play TypeScript library that lets any developer
add full English + Urdu + Roman Urdu support to any website with 3-4 lines of code.

════════════════════════════════════════
⚠️ STRICT ORIGINALITY RULES
════════════════════════════════════════
- Study these for ideas ONLY: urdin, @ai4bharat/indic-transliterate,
  romanUrdu2UrduTranslitration, sanscript, transliteration
- ❌ Do NOT copy any code, logic, or mappings from them
- ✅ Build a 100% original implementation

════════════════════════════════════════
🔷 TYPESCRIPT INTERFACES (Define first, use everywhere, export all)
════════════════════════════════════════

/**
 * Plugin interface for translation providers.
 * Any custom translator must implement this.
 */
interface TranslatorPlugin {
  name: string;
  translate(text: string, targetLang: 'ur' | 'en'): Promise<string>;
}

/**
 * Result returned by transliteration operations.
 */
interface TransliterationResult {
  input: string;
  output: string;
  lang: 'ur' | 'roman';
  ms: number;
}

/**
 * Cache entry stored in memory and localStorage.
 */
interface CacheEntry {
  value: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Script detection result.
 */
type ScriptType = 'arabic' | 'latin' | 'roman-urdu' | 'english' | 'mixed';

/**
 * Controller instance returned by UrduMagic.init()
 */
interface UrduMagicInstance {
  /** Destroy all observers, listeners, UI elements */
  destroy(): void;
  /** Switch active language */
  switchLang(lang: 'en' | 'ur' | 'roman'): void;
  /** Get current active language */
  getCurrentLang(): 'en' | 'ur' | 'roman';
  /** Translate text programmatically */
  translate(text: string, targetLang: 'ur' | 'en'): Promise<string>;
  /** Convert Urdu script to Roman Urdu — offline */
  toRoman(text: string): string;
  /** Convert Roman Urdu to Urdu script — offline */
  toUrdu(text: string): string;
}

/**
 * Configuration passed to UrduMagic.init()
 */
interface UrduMagicConfig {
  defaultLang: 'en' | 'ur' | 'roman';
  modes: Array<'en' | 'ur' | 'roman'>;
  showSwitcher?: boolean;           // default true
  translator?: 'libretranslate' | 'custom';
  libreUrl?: string;
  apiKey?: string;                  // for LibreTranslate hosted
  customTranslator?: TranslatorPlugin;
  cacheTTL?: number;                // cache expiry in ms, default 24hrs
  debounceMs?: number;              // debounce for magic mode, default 300ms
  onLangSwitch?: (lang: string) => void;  // callback on language change
}

════════════════════════════════════════
✅ FEATURE 1: TRANSLITERATION ENGINE
════════════════════════════════════════
This is the most critical feature. Must be 100% offline and under 5ms per sentence.
Build a hybrid engine: dictionary-first, then rule-based.

── ROMAN URDU → URDU SCRIPT ──────────────────

Step 1: Dictionary lookup (word level)
Build a dictionary of minimum 600 common Pakistani Urdu words with ALL spelling variants.
The dictionary must cover these categories:

GREETINGS & COMMON PHRASES:
assalam o alaikum → السلام علیکم
walaikum assalam → وعلیکم السلام
shukriya → شکریہ
mehrbani → مہربانی
khuda hafiz → خدا حافظ
allah hafiz → اللہ حافظ
inshallah → انشاءاللہ
mashallah → ماشاءاللہ

EVERYDAY WORDS (with ALL Pakistani spelling variants):
acha/achha/acha → اچھا
theek/teek/thiik/thik → ٹھیک
kya/kia/kyaa → کیا
hai/hay/he → ہے
hain/hayn/hen → ہیں
nahi/nahin/naheen/nai → نہیں
bhai/bhay/bhayi → بھائی
yaar/yar → یار
dost → دوست
ghar → گھر
kam/kaam → کام
paisa/pesa → پیسہ
waqt/wakt/vaqt → وقت
din → دن
raat/rat → رات
khana/khaana → کھانا
pani/paani → پانی
chai/chay → چائے
kitab/kitaab → کتاب
school/skool → اسکول
gari/gaari → گاڑی
bacha/bachha → بچہ
log → لوگ
aadmi/aadmee → آدمی
aurat → عورت
baccha/bacha → بچہ
baat/bat → بات
kuch/kuch → کچھ
sab → سب
ap/aap → آپ
mein/main/me → میں
tum → تم
woh/wo/voh → وہ
hum → ہم
yeh/ye/yay → یہ
koi/koyi → کوئی
kahan/kahan → کہاں
kyun/kiun/kun → کیوں
kab → کب
kaisa/kaesa → کیسا
kitna/kitney → کتنا
bohat/bahut/bohot → بہت
sirf/sarf → صرف
phir/fer → پھر
ab → اب
pehle/pahle → پہلے
baad → بعد
saath/sath → ساتھ
andar → اندر
bahar → باہر
upar → اوپر
neeche/neche → نیچے
idhar/ithar → ادھر
udhar/uthar → ادھر
kal → کل
aaj → آج
parso → پرسوں
subah/subha → صبح
dopahar/dopeher → دوپہر
sham/shaam → شام

VERBS:
karna/krna → کرنا
jana/jaana → جانا
aana/ana → آنا
dena/daina → دینا
lena/laina → لینا
bolna → بولنا
sochna → سوچنا
dekhna/dekhna → دیکھنا
sunna/sunna → سننا
padhna/parhna → پڑھنا
likhna → لیکھنا
khana/khaana → کھانا
peena/pina → پینا
sona/sowna → سونا
uthna/uthna → اٹھنا
baith jana → بیٹھ جانا
chalna → چلنا
dorna/bhagna → دوڑنا
rona → رونا
hasna → ہنسنا

NUMBERS:
ek → ایک
do → دو
teen → تین
char → چار
panch → پانچ
chhe/chhey → چھ
saat → سات
aath → آٹھ
nau → نو
das → دس
bis → بیس
tees → تیس
chalis → چالیس
pachas → پچاس
sau → سو
hazar → ہزار
lakh → لاکھ

EMOTIONS & DESCRIPTIONS:
khush → خوش
udas/udasd → اداس
gussa/ghussa → غصہ
dard → درد
pyar/piyar → پیار
mohabbat → محبت
nafrat → نفرت
darr/dar → ڈر
umeed → امید
yaqeen/yakeen → یقین
shak → شک
zindagi → زندگی
maut → موت
khwab/khwaab → خواب
azadi → آزادی

Step 2: Rule-based character mapping
Apply digraph rules FIRST (before single letters):

DIGRAPHS (apply in this priority order):
"kh" → "خ"
"gh" → "غ"
"sh" → "ش"
"ch" → "چ"
"ph" → "پھ"
"th" → "تھ"
"dh" → "دھ"
"zh" → "ژ"
"bh" → "بھ"
"rh" → "ڑ"
"nh" → "نھ"
"lh" → "لھ"
"mh" → "مھ"
"aa" → "آ"
"ee" → "ی"
"ii" → "ی"
"oo" → "و"
"uu" → "و"
"ai" → "ے"
"ay" → "ے"
"au" → "او"
"aw" → "او"

SINGLE LETTERS (apply after digraphs):
"a" → "ا"
"b" → "ب"
"p" → "پ"
"t" → "ت"
"T" → "ٹ"   (capital T = retroflex)
"s" → "س"
"j" → "ج"
"h" → "ہ"
"d" → "د"
"D" → "ڈ"   (capital D = retroflex)
"z" → "ز"
"r" → "ر"
"R" → "ڑ"   (capital R = retroflex)
"f" → "ف"
"q" → "ق"
"k" → "ک"
"g" → "گ"
"l" → "ل"
"m" → "م"
"n" → "ن"
"w" → "و"
"v" → "و"
"o" → "و"
"u" → "ا"
"y" → "ی"
"i" → "ی"
"e" → "ے"
"'" → "ء"   (apostrophe = hamza)

WORD-END RULES:
- If word ends in "i" or "ee" → use "ی" (bari-ye)
- If word ends in "a" → use "ہ" (choti he)
- If word ends in "on" or "oon" → use "وں"
- If word ends in "ain" or "ayn" → use "یں"

── URDU SCRIPT → ROMAN URDU ──────────────────

Full character map — every Urdu letter to its most common Pakistani Roman representation:

"ا" → "a"
"آ" → "aa"
"ب" → "b"
"پ" → "p"
"ت" → "t"
"ٹ" → "T"
"ث" → "s"
"ج" → "j"
"چ" → "ch"
"ح" → "h"
"خ" → "kh"
"د" → "d"
"ڈ" → "D"
"ذ" → "z"
"ر" → "r"
"ڑ" → "R"
"ز" → "z"
"ژ" → "zh"
"س" → "s"
"ش" → "sh"
"ص" → "s"
"ض" → "z"
"ط" → "t"
"ظ" → "z"
"ع" → "'"
"غ" → "gh"
"ف" → "f"
"ق" → "q"
"ک" → "k"
"گ" → "g"
"ل" → "l"
"م" → "m"
"ن" → "n"
"ں" → "n"
"و" → "o"
"ہ" → "h"
"ھ" → "h"
"ء" → "'"
"ی" → "i"
"ے" → "e"
"ئ" → "y"
"ؤ" → "w"
"ة" → "t"
"أ" → "a"
"إ" → "i"

DIACRITICS (ignore/strip):
"َ" (zabar) → ""
"ِ" (zer) → ""
"ُ" (pesh) → ""
"ّ" (shadda) → double the next consonant
"ْ" (jazm) → ""
"ً" → ""
"ٍ" → ""
"ٌ" → ""

── MIXED LANGUAGE HANDLING ──────────────────

Algorithm for mixed strings:
1. Split text into tokens (words) by whitespace and punctuation
2. For each token, classify as:
   - Urdu script → apply urduToRoman or keep as Urdu
   - Roman Urdu → check against 200-word Roman Urdu stopword list
   - English → leave as-is or translate via API
3. Roman Urdu stopword list must include at minimum:
   hai, hain, nahi, nahin, kya, kyun, kab, kahan, kaisa,
   acha, theek, bohat, sirf, phir, ab, aaj, kal, yeh, woh,
   hum, tum, aap, mein, bhai, yaar, dost, ghar, kam, din,
   raat, khana, pani, chai, baat, kuch, sab, koi, aur, ya,
   lekin, magar, kyunke, isliye, phir, warna, agar, toh,
   jo, jab, jahan, jaisa, jitna, bilkul, zaroor, shayad,
   matlab, samajh, pata, lagta, lagti, rehna, milna, aana,
   jana, dena, lena, karna, bolna, sochna, dekhna, sunna

════════════════════════════════════════
✅ FEATURE 2: TRANSLATION SYSTEM
════════════════════════════════════════

── TRANSLATOR PLUGIN SYSTEM ──────────────────

LibreTranslate plugin (default):
- Constructor accepts url and optional apiKey
- Check response.ok — if false, throw error with status code
- Handle status 429: read Retry-After header, wait that duration
- Handle status 500+: throw immediately for retry logic to catch

Custom plugin support:
- Accept any object implementing TranslatorPlugin interface
- Document clearly with JSDoc how to implement custom plugin

── RETRY LOGIC (mandatory) ──────────────────

Every translation call must follow this exact retry chain:
1. Check memory cache → return if found (skip API entirely)
2. Check localStorage cache → return if found (skip API entirely)
3. Try API call
4. If fails → wait 300ms → retry once
5. If retry fails → return original text + append " [?]" indicator
6. Never throw to the caller — always return a string

── CACHE SYSTEM ──────────────────

Memory cache:
- Simple Map<string, CacheEntry>
- Key format: `{sourceLang}:{targetLang}:{text}`
- Default TTL: 24 hours
- Max entries: 1000 (LRU eviction — remove oldest when full)

localStorage cache:
- Prefix all keys with "urdumagic:"
- On read: check expiresAt, delete if expired
- On write: catch QuotaExceededError silently
- On parse error: delete corrupted entry silently

── DEBOUNCE & RATE LIMITING ──────────────────

- Debounce: 300ms (configurable via debounceMs in config)
- Rate limiter: minimum 500ms between API calls
- If multiple calls queue up during debounce: only execute the last one

════════════════════════════════════════
✅ FEATURE 3: SCRIPT DETECTOR
════════════════════════════════════════

detectScript(text: string): ScriptType

Logic:
1. If text contains Unicode range \u0600-\u06FF AND Latin letters → 'mixed'
2. If text contains ONLY \u0600-\u06FF → 'arabic'
3. If text contains Latin AND 2+ words match Roman Urdu stopword list → 'roman-urdu'
4. If text contains Latin AND no Roman Urdu matches → 'english'
5. Default → 'latin'

Also export:
isRomanUrdu(text: string): boolean
isUrduScript(text: string): boolean
hasUrduWords(text: string): boolean  ← checks against stopword list

════════════════════════════════════════
✅ FEATURE 4: MAGIC MODE (DOM AUTO-TRANSLATION)
════════════════════════════════════════

Uses MutationObserver to watch for new content.

── ELEMENTS TO SKIP (never translate these) ──
- <script>, <style>, <code>, <pre>, <kbd>, <samp>
- <input>, <textarea>, <select>, <button>
- Elements with: lang="en", data-no-translate, data-skip-translate
- Elements with contenteditable="true"
- Elements inside <head>
- Text nodes with only whitespace or numbers

── SAFE TRANSLATION ALGORITHM ──────────────────
1. On init: snapshot all text nodes → store original in data-original-text attribute
2. When language switches to Urdu/Roman: translate/transliterate each text node
3. When switching back to English: restore from data-original-text
4. MutationObserver: watch for added nodes → translate new content automatically
5. Debounce observer callback by 300ms to batch rapid DOM changes
6. Never modify text nodes directly — always use element.textContent

── RTL SUPPORT ──────────────────
When Urdu mode active:
- Set document.documentElement.setAttribute('dir', 'rtl')
- Add class 'urdumagic-rtl' to body
- Load Noto Nastaliq Urdu font from Google Fonts if not already loaded:
  https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap
- Apply font to Urdu text elements via CSS class

When switching back to English/Roman:
- Remove dir="rtl"
- Remove class 'urdumagic-rtl'
- Do NOT remove font (already loaded, no need to unload)

════════════════════════════════════════
✅ FEATURE 5: FLOATING UI SWITCHER
════════════════════════════════════════

Position: fixed bottom-right (24px from edges)
Design: minimal pill-shaped button group
Colors: white background, subtle shadow, border
Active language: highlighted with accent color (#1a56db)

HTML structure:
<div id="urdumagic-switcher" role="toolbar" aria-label="Language switcher">
  <button data-lang="en" aria-pressed="true">English</button>
  <button data-lang="ur" aria-pressed="false">اردو</button>
  <button data-lang="roman" aria-pressed="false">Roman</button>
</div>

Accessibility requirements (mandatory):
- All buttons must have aria-pressed (true/false)
- Tab navigation must work between buttons
- Enter and Space must activate buttons
- Focus ring must be visible (outline: 2px solid #1a56db)
- aria-live="polite" region for announcing language changes to screen readers

Mobile requirements:
- Touch-friendly: minimum 44x44px tap target
- On screens <400px: show icons only (EN / UR / R) to save space
- Do not overlap page content: add 80px padding-bottom to body

Disable option:
- If showSwitcher: false → do not render UI at all
- Still expose switchLang() on the instance for manual control

════════════════════════════════════════
✅ FEATURE 6: PUBLIC API
════════════════════════════════════════

/**
 * Initialize UrduMagic. Must be called before any other method.
 * @param config - UrduMagicConfig configuration object
 * @returns UrduMagicInstance controller
 */
static init(config: UrduMagicConfig): UrduMagicInstance

/**
 * Translate text to target language via configured plugin.
 * Follows full retry + cache chain.
 * @param text - Input text
 * @param targetLang - 'ur' for Urdu, 'en' for English
 * @returns Promise resolving to translated string (never rejects)
 */
static translate(text: string, targetLang: 'ur' | 'en'): Promise<string>

/**
 * Convert Urdu script to Roman Urdu. 100% offline.
 * @param text - Urdu script text
 * @returns Roman Urdu string
 */
static toRoman(text: string): string

/**
 * Convert Roman Urdu to Urdu script. 100% offline.
 * @param text - Roman Urdu text (handles all Pakistani spelling variants)
 * @returns Urdu script string
 */
static toUrdu(text: string): string

/**
 * Detect the script type of input text.
 * @param text - Any text
 * @returns ScriptType: 'arabic' | 'latin' | 'roman-urdu' | 'english' | 'mixed'
 */
static detectScript(text: string): ScriptType

════════════════════════════════════════
⚙️ TECHNICAL REQUIREMENTS
════════════════════════════════════════

Language: TypeScript (strict: true, no "any" anywhere)
Build tool: Vite 5+
Outputs:
  - ESM: dist/urdumagic.es.js
  - UMD: dist/urdumagic.umd.js
  - CDN: dist/urdumagic.js (single file, self-contained)
  - Types: dist/index.d.ts

Bundle size: under 30KB gzipped (transliteration dictionary is the exception)
Zero production dependencies (no lodash, no axios, no i18next)
Works in: Chrome, Firefox, Safari, Edge (last 2 versions), Node.js 18+

TypeScript rules:
- strict: true
- noImplicitAny: true
- strictNullChecks: true
- No "any" type anywhere — use "unknown" and type guards instead
- Every public function and interface must have full JSDoc
  (@param, @returns, @example where useful)
- Export every interface from src/index.ts

Versioning:
- Start at v0.1.0
- Follow semver strictly
- Include CHANGELOG.md

════════════════════════════════════════
📁 PROJECT STRUCTURE (generate ALL files)
════════════════════════════════════════

urdumagic/
├── src/
│   ├── core/
│   │   ├── transliterator.ts    ← full dictionary + rule engine
│   │   ├── translator.ts        ← plugin system + retry logic
│   │   ├── cache.ts             ← memory + localStorage + TTL + LRU
│   │   ├── detector.ts          ← script detection + stopwords
│   │   └── debounce.ts          ← debounce + rate limiter utilities
│   ├── ui/
│   │   ├── switcher.ts          ← floating language switcher
│   │   └── rtl.ts               ← RTL + font management
│   ├── injector/
│   │   └── magic.ts             ← MutationObserver DOM translator
│   └── index.ts                 ← main entry, static API, exports
├── tests/
│   ├── transliterator.test.ts   ← test every mapping + variant
│   ├── translator.test.ts       ← test retry, cache, fallback
│   ├── detector.test.ts         ← test script detection
│   └── cache.test.ts            ← test TTL, LRU, localStorage
├── demo/
│   ├── plain-html/
│   │   └── index.html           ← full working demo (CDN import)
│   └── react/
│       ├── App.tsx              ← React demo with hook
│       └── useUrduMagic.ts      ← custom React hook
├── dist/                        ← built output (do not generate)
├── .github/
│   └── workflows/
│       └── publish.yml          ← GitHub Actions: test → build → publish
├── vite.config.ts
├── tsconfig.json
├── package.json
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE

════════════════════════════════════════
🧪 TESTS (mandatory — no placeholders)
════════════════════════════════════════

Use Vitest (works natively with Vite).

transliterator.test.ts must verify:
- toUrdu("acha") === "اچھا"
- toUrdu("theek") === "ٹھیک"
- toUrdu("kya") === "کیا"
- toUrdu("kia") === "کیا"  ← spelling variant
- toUrdu("hai") === "ہے"
- toUrdu("hay") === "ہے"   ← spelling variant
- toUrdu("bhai") === "بھائی"
- toUrdu("nahi") === "نہیں"
- toUrdu("nahin") === "نہیں" ← variant
- toUrdu("bohat") === "بہت"
- toUrdu("bahut") === "بہت"  ← variant
- toRoman("کیا") === "kya"
- toRoman("ہے") === "hai"
- toRoman("بھائی") === "bhai"
- Performance: 1000 conversions complete in under 1 second

detector.test.ts must verify:
- detectScript("آپ کیسے ہیں") === "arabic"
- detectScript("acha theek hai") === "roman-urdu"
- detectScript("hello world") === "english"
- detectScript("hello آپ کیسے") === "mixed"
- isRomanUrdu("kya haal hai") === true
- isRomanUrdu("what is this") === false

cache.test.ts must verify:
- Set and get from memory cache
- TTL expiry works correctly
- LRU eviction at 1000 entries
- localStorage fallback works
- Corrupted localStorage entry is handled silently

════════════════════════════════════════
📚 README.md REQUIREMENTS
════════════════════════════════════════

Must include all of the following sections:

1. Title + badges (npm version, bundle size, license)
2. What is UrduMagic? (2-3 sentences, beginner-friendly)
3. Quick Start — CDN (1 script tag + 3 lines of JS)
4. Quick Start — npm
5. Magic Mode example (auto-translate entire website)
6. React example with useUrduMagic hook
7. Next.js example
8. Plain HTML example
9. Custom translator plugin example
10. Full API reference table (method, params, return type, description)
11. Configuration reference table (all UrduMagicConfig options)
12. Supported spelling variants (show Pakistani users their words work)
13. Bundle size breakdown
14. Contributing section (link to CONTRIBUTING.md)
15. License
16. اردو میں مختصر تعارف (brief Urdu introduction section at bottom)

Language: Simple, friendly, beginner-appropriate for Pakistani developers.
No jargon. If a concept needs explanation, explain it in one sentence.

════════════════════════════════════════
🔧 REACT HOOK: useUrduMagic.ts
════════════════════════════════════════

export function useUrduMagic(config: UrduMagicConfig) {
  // Returns: { lang, switchLang, translate, toRoman, toUrdu, isReady }
  // Handles init on mount, destroy on unmount
  // Exposes translate as async function usable in components
  // isReady: boolean — true after init() completes
}

════════════════════════════════════════
🚀 GITHUB ACTIONS: publish.yml
════════════════════════════════════════

Trigger: on push to main + on release tag (v*)
Steps:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Run tests (vitest)
5. Build (vite build)
6. Check bundle size < 30KB gzipped
7. Publish to npm (use NPM_TOKEN secret)
8. Create GitHub release with changelog notes

════════════════════════════════════════
🔥 FINAL OUTPUT INSTRUCTION
════════════════════════════════════════

Generate EVERY file listed in the project structure.
For every file, output it as a separate code block
with the exact filename as a comment at the top:

// src/core/transliterator.ts
[complete code — no placeholders, no TODOs]

Rules:
- No file may be empty or contain placeholder comments
- No "// implement later" or "// TODO" anywhere
- The transliteration dictionary must have minimum 600 word entries
- Every test must have real assertions — no empty test blocks
- README must be complete and publication-ready
- package.json must have correct, current dependency versions
- vite-plugin-dts must be version ^4.0.0 or higher

The final library must be:
✅ Installable with: npm install urdumagic
✅ Usable via CDN with one script tag
✅ Fully typed with zero TypeScript errors
✅ All tests passing
✅ Loved by Pakistani developers