/**
 * UrduMagic Dictionary Loader
 * Handles lazy-loading of the 1.2MB dictionary file.
 */

let cachedDict: Map<string, string> | null = null

function normalizeKey(text: string): string {
  return text.toLowerCase().trim()
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

  for (const [key, value] of Object.entries(words)) {
    dict.set(normalizeKey(key), value)
  }
}
