import { UrduMagic } from '../index.js';
import { LangMode } from '../types.js';

interface UrduTextProps {
  children: string;
  lang: LangMode;
  fallback?: string;
}

/**
 * React Server Component for translating text on the server.
 */
export async function UrduText({ children, lang, fallback }: UrduTextProps) {
  if (lang === 'en' || !children) {
    return <>{children}</>;
  }

  try {
    const translated = await UrduMagic.translate(children, lang);
    return <>{translated}</>;
  } catch (error) {
    return <>{fallback || children}</>;
  }
}
