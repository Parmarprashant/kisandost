import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

/**
 * Allow the Flutter app to call this API from a browser during development.
 *
 * `flutter run -d chrome` serves the app from a random localhost port, which
 * makes every /api call cross-origin. Without these headers the browser blocks
 * the response and the app only ever sees a failure.
 *
 * Deliberately narrow:
 * - development only, so production behaviour is unchanged
 * - localhost / 127.0.0.1 origins only, on any port
 * - the origin is echoed back rather than using `*`
 *
 * None of this affects the released mobile app: CORS is a browser rule, and a
 * native Android client is not subject to it.
 */
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function devCorsHeaders(origin: string | null): Record<string, string> | null {
  if (process.env.NODE_ENV === 'production') return null;
  if (!origin || !LOCALHOST_ORIGIN.test(origin)) return null;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export default function middleware(req: any) {
  if (req.nextUrl.pathname.startsWith('/api')) {
    const cors = devCorsHeaders(req.headers.get('origin'));

    // The browser sends a preflight before any request carrying a custom
    // header. It must be answered with the CORS headers, not just a 204.
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: cors ?? {} });
    }

    const response = NextResponse.next();
    if (cors) {
      for (const [key, value] of Object.entries(cors)) {
        response.headers.set(key, value);
      }
    }
    return response;
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
