/**
 * UrduMagic Dictionary Loader
 * Handles lazy-loading of the 1.2MB dictionary file.
 */

let cachedDict: Map<string, string> | null = null

function normalizeKey(text: string): string {
  return text.toLowerCase().trim()
}

// ── Dictionary-update listeners ───────────────────────────────────────────────
// Returns an unsubscribe function to prevent leaks across multiple instances.
type DictUpdateCallback = (words: string[]) => void;
const dictListeners = new Set<DictUpdateCallback>();

/**
 * Subscribe to dictionary mutations (extendDictionary calls).
 * @returns An unsubscribe function — call it in instance.destroy() to avoid leaks.
 */
export function onDictionaryUpdate(cb: DictUpdateCallback): () => void {
  dictListeners.add(cb);
  return () => { dictListeners.delete(cb); };
}

// Sync version (for SSR - needed immediately)
export function getDictionarySync(): Map<string, string> {
  if (cachedDict) return cachedDict
  // For SSR, read the file synchronously
  const fs = require('fs')
  const path = require('path')
  const { fileURLToPath } = require('url')
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const fileName = 'english-urdu-dictionary-flat.json'
  const candidates = [
    path.resolve(__dirname, '../data', fileName),
    path.resolve(__dirname, fileName),
    path.resolve(__dirname, '..', fileName),
    path.resolve(process.cwd(), 'src/data', fileName),
    path.resolve(process.cwd(), 'dist', fileName),
  ]
  const filePath = candidates.find((candidate: string) => fs.existsSync(candidate))

  if (!filePath) {
    throw new Error(`UrduMagic dictionary file not found. Tried: ${candidates.join(', ')}`)
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  cachedDict = new Map(Object.entries(raw))
  return cachedDict
}

// Async version (for browser - lazy load)
export async function getDictionaryAsync(): Promise<Map<string, string>> {
  if (cachedDict) return cachedDict
  const { default: raw } = await import('../data/english-urdu-dictionary-flat.json')
  cachedDict = new Map(Object.entries(raw))
  return cachedDict
}

/**
 * Looks up a word in the dictionary.
 */
export function lookupWord(text: string): string | undefined {
  if (!cachedDict) {
    // Lazy load dictionary on first lookup (works in Node.js/SSR)
    try {
      getDictionarySync()
    } catch {
      // In browser, dictionary won't be available until loaded async
      return undefined
    }
  }
  const dict = cachedDict
  return dict?.get(normalizeKey(text))
}

/**
 * Extends the default dictionary with custom words.
 * Notifies all active listeners so they can invalidate caches and
 * remove newly-covered words from the missing-word collector.
 */
export function extendDictionary(words: Record<string, string>) {
  if (!cachedDict) {
    try {
      getDictionarySync()
    } catch {
      cachedDict = new Map()
    }
  }
  const dict = cachedDict
  if (!dict) return

  const normalizedWords: string[] = [];
  for (const [key, value] of Object.entries(words)) {
    const nk = normalizeKey(key)
    dict.set(nk, value)
    normalizedWords.push(nk)
  }

  // Notify all instance-level listeners (cache invalidation + collector cleanup)
  for (const cb of dictListeners) {
    cb(normalizedWords)
  }
}

/**
 * Tokenizes a normalized cache-key source text using the same logic as
 * EnglishEngine.cleanToken(), returning an array of clean lowercase tokens.
 *
 * This is the ONLY place that parses the normalized source segment of a
 * cache key — consumers must use this function rather than re-implementing
 * the logic to guarantee consistency.
 */
export function tokenizeNormalized(normalizedText: string): string[] {
  return normalizedText
    .split(/\s+/)
    .map(w => w.replace(/[.,/#!$%^&*;:{}=\-_`~()?[\]"']/g, '').toLowerCase().trim())
    .filter(Boolean);
}
