import { extendDictionary as extend } from '../core/dictionary-loader.js';

/**
 * Allows users to extend the dictionary with custom words.
 * Works for both client and server translations.
 */
export function extendDictionary(words: Record<string, string>) {
  extend(words);
}
