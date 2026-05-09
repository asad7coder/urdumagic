// Note: This is a helper, not an automatic injector.
// Users should import this in their middleware.ts

import { NextRequest, NextResponse } from 'next/server';

/**
 * UrduMagic Middleware helper to handle locale detection and redirection.
 */
export function urduMagicMiddleware(request: NextRequest, locales: string[], defaultLocale: string) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = request.cookies.get('lang')?.value || defaultLocale;
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }
  
  // Set lang cookie if present in URL
  const localeInPath = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  const response = NextResponse.next();
  if (localeInPath) {
    response.cookies.set('lang', localeInPath);
  }
  
  return response;
}
