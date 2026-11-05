import { NextResponse, type NextRequest } from 'next/server';

// Deny-by-default gate for API routes and private pages.
//
// Sessions use the Prisma (database) strategy, so there is no JWT to verify at the edge.
// The middleware only checks that a session cookie is present; every private route still
// validates the session itself with getServerSession(). This keeps unknown/new routes
// closed unless they are explicitly listed as public below.

// Readable by anyone (GET-only data, auth flow, embeds).
const PUBLIC_API_PREFIXES = [
  '/api/auth',
  '/api/leaderboard',
  '/api/total-trainers',
  '/api/event-participants-count',
  '/api/event-commits',
  '/api/events/damage-stream',
  '/api/embed',
];

// Machine-only: Vercel Cron / internal calls with `Authorization: Bearer $CRON_SECRET`.
const CRON_API_PREFIXES = ['/api/cron', '/api/events/quick-sync', '/api/sync-event-commits'];

// Pages that require a signed-in user.
const PRIVATE_PAGES = ['/onboarding'];

const SESSION_COOKIES = ['__Secure-next-auth.session-token', 'next-auth.session-token'];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

function hasSessionCookie(req: NextRequest) {
  return SESSION_COOKIES.some(name => !!req.cookies.get(name)?.value);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/')) {
    if (matches(pathname, PUBLIC_API_PREFIXES)) return NextResponse.next();

    if (matches(pathname, CRON_API_PREFIXES)) {
      const secret = process.env.CRON_SECRET;
      if (secret && req.headers.get('authorization') === `Bearer ${secret}`) {
        return NextResponse.next();
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (hasSessionCookie(req)) return NextResponse.next();
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (matches(pathname, PRIVATE_PAGES) && !hasSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/onboarding'],
};
