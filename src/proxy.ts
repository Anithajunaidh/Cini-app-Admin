import { detectBot } from '@arcjet/next';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

/**
 * Pathname segments that require an authenticated session.
 * Checked after stripping the locale prefix (e.g. /en/dashboard → /dashboard).
 */
const PROTECTED_SEGMENTS = ['/dashboard', '/platforms', '/sync', '/users', '/comments', '/reports'];

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix: /en/dashboard → /dashboard
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
  return PROTECTED_SEGMENTS.some(
    (seg) => withoutLocale === seg || withoutLocale.startsWith(`${seg}/`),
  );
}

export default async function proxy(request: NextRequest) {
  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { pathname } = request.nextUrl;

  // Route guard — only enforced in production.
  // In development, the dashboard can be accessed directly to speed up iteration.
  if (process.env.NODE_ENV !== 'development' && isProtectedPath(pathname)) {
    const token = request.cookies.get('access_token')?.value;
    if (!token) {
      const signInUrl = request.nextUrl.clone();
      signInUrl.pathname = '/sign-in';
      return NextResponse.redirect(signInUrl);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|api|.*\\..*).*)',
};
