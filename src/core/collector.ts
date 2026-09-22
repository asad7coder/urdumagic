/**
 * UrduMagic Missing Word Collector
 *
 * Strictly local. No network requests. No telemetry.
 *
 * - Deduplicates case-insensitively (internal key = lowercase).
 * - First-seen original casing is preserved as the display `word`.
 * - PII-like patterns are filtered before storing.
 * - Optional LocalStorage persistence under a dedicated namespace.
 * - All persistence failures are swallowed silently.
 */

import type { MissingWordRecord } from '../types.js';

const LS_KEY = 'urdumagic:missing_words';
const DEFAULT_MAX = 5000;

// ── Privacy Filters ──────────────────────────────────────────────────────────
const SKIP_PATTERNS: RegExp[] = [
  /^\s*$/,                                                // whitespace-only
  /^[^\w\u0600-\u06FF]+$/,                               // punctuation-only
  /^\d[\d,._+\-x*/%^]*$/,                               // numeric-only (starts with digit)
  /^v\d+[\d._+\-]*$/i,                                   // version strings: v0.2.0, v1.0.0-beta
  /^https?:\/\//i,                                        // URLs
  /^www\.\S+\.\S+/i,                                      // www-URLs
  /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i,       // emails
  /^(\+?\d[\d\s\-().]{7,}\d)$/,                          // phone numbers
  /^[A-Za-z0-9+/]{32,}={0,2}$/,                          // base64-like API keys
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, // UUIDs
  /^sk[-_][a-zA-Z0-9_\-]{10,}$/,                         // secret key patterns (sk-xxx, sk_live_xxx)
  /^Bearer\s+/i,                                          // auth tokens
];

function shouldSkip(token: string): boolean {
  for (const re of SKIP_PATTERNS) {
    if (re.test(token)) return true;
  }
  return false;
}

// ── LocalStorage helpers ─────────────────────────────────────────────────────
function lsAvailable(): boolean {
  try {
    if (typeof globalThis.localStorage === 'undefined') return false;
    globalThis.localStorage.setItem('urdumagic:__probe__', '1');
    globalThis.localStorage.removeItem('urdumagic:__probe__');
    return true;
  } catch {
    return false;
  }
}

function lsRead(): Map<string, { word: string; count: number }> | null {
  if (!lsAvailable()) return null;
  try {
    const raw = globalThis.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const m = new Map<string, { word: string; count: number }>();
    for (const entry of parsed) {
      if (
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as any).word === 'string' &&
        typeof (entry as any).count === 'number'
      ) {
        const w = (entry as any).word as string;
        m.set(w.toLowerCase(), { word: w, count: (entry as any).count });
      }
    }
    return m;
  } catch {
    return null;
  }
}

function lsWrite(map: Map<string, { word: string; count: number }>): void {
  if (!lsAvailable()) return;
  try {
    const arr = Array.from(map.values());
    globalThis.localStorage.setItem(LS_KEY, JSON.stringify(arr));
  } catch (e: unknown) {
    // Swallow QuotaExceededError and other storage errors silently
    if (
      typeof e === 'object' &&
      e !== null &&
      'name' in e &&
      (e as { name: string }).name === 'QuotaExceededError'
    ) return;
    // Non-quota errors are also swallowed — storage must never crash translation
  }
}

function lsClear(): void {
  if (!lsAvailable()) return;
  try { globalThis.localStorage.removeItem(LS_KEY); } catch { /* silent */ }
}

// ── Collector ────────────────────────────────────────────────────────────────
export class MissingWordCollector {
  private readonly map = new Map<string, { word: string; count: number }>();
  private readonly maxSize: number;
  private readonly persist: boolean;

  constructor(opts: { maxMissingWords?: number; persist?: boolean }) {
    this.maxSize = opts.maxMissingWords ?? DEFAULT_MAX;
    this.persist = opts.persist ?? false;

    if (this.persist) {
      const saved = lsRead();
      if (saved) {
        for (const [k, v] of saved) {
          this.map.set(k, v);
        }
      }
    }
  }

  /** Record a token as unknown/missing. PII-like values are ignored. */
  add(token: string): void {
    if (!token || shouldSkip(token)) return;

    const key = token.toLowerCase();
    const existing = this.map.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      if (this.map.size >= this.maxSize) {
        // Capacity reached — do not add new keys; existing keys may still grow.
        return;
      }
      this.map.set(key, { word: token, count: 1 });
    }

    if (this.persist) lsWrite(this.map);
  }

  /** Remove a word (used when custom dictionary resolves it). */
  remove(token: string): void {
    const key = token.toLowerCase();
    const deleted = this.map.delete(key);
    if (deleted && this.persist) lsWrite(this.map);
  }

  /** Remove all collected words. Clears persistence too if enabled. */
  clear(): void {
    this.map.clear();
    if (this.persist) lsClear();
  }

  /** Returns a snapshot copy of current missing words (no internal keys exposed). */
  getAll(): MissingWordRecord[] {
    return Array.from(this.map.values()).map(({ word, count }) => ({ word, count }));
  }

  /** Returns a JSON string of missing words suitable for export. */
  export(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /** True when the collector is active. Always true when instantiated. */
  get enabled(): boolean {
    return true;
  }

  /** Current unique-key count (for internal size checks). */
  get size(): number {
    return this.map.size;
  }
}

/** A no-op collector returned when collectMissingWords is false. */
export class NoopCollector {
  add(_token: string): void { /* disabled */ }
  remove(_token: string): void { /* disabled */ }
  clear(): void { /* disabled */ }
  getAll(): MissingWordRecord[] { return []; }
  export(): string { return '[]'; }
  get enabled(): boolean { return false; }
  get size(): number { return 0; }
}

export type AnyCollector = MissingWordCollector | NoopCollector;
