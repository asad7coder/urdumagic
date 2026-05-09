import { LangMode } from '../types.js';

/**
 * Helper for generateStaticParams to support multilingual routes.
 */
export function generateUrduParams(locales: LangMode[] = ['en', 'ur', 'roman']) {
  return locales.map(lang => ({ lang }));
}
