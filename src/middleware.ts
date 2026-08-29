import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  // Bypass middleware for API routes, robots.txt, sitemap.xml, llms.txt, and static files
  if (
    pathname.startsWith('/api') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/llms.txt' ||
    pathname === '/llms-full.txt' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const hostname = req.headers.get('host') || '';

  // Daca domeniul contine "admin" (ex: munchotella-admin.vercel.app)
  // redirectioneaza root-ul (/) sau /login catre /ro/admin
  if (hostname.includes('admin')) {
    // Only intercept root paths
    if (url.pathname === '/' || url.pathname === '/login' || url.pathname === '/ro') {
      url.pathname = '/ro/admin';
      return NextResponse.redirect(url);
    }
  }

  // Executa rutarea i18n pentru toate celelalte cazuri
  return intlMiddleware(req);
}

export const config = {
  // Match only internationalized pathnames
  // Exclude /api, /_next, /_vercel, /__, and files with an extension
  matcher: ['/', '/(ro|ru|en)/:path*', '/((?!api|_next|_vercel|__|.*\\..*).*)']
};
