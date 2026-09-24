import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'Google Client ID is missing' }, { status: 500 });
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid profile email');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  // The mobile app opens this same flow in a system browser. Google still
  // redirects back to this server's registered callback — so no extra OAuth
  // client and no new redirect URI need registering — and the callback then
  // hands the token to the app through its custom scheme.
  //
  // `state` is the only field that survives the round trip to Google, and it
  // doubles as the CSRF token the web flow was missing.
  const state = buildState(req.nextUrl.searchParams.get('client') === 'mobile');
  googleAuthUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(googleAuthUrl.toString());

  // Remember the state so the callback can reject a response it did not start.
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return response;
}

export const OAUTH_STATE_COOKIE = '__kisan_oauth_state';

/** `<random>:<web|mobile>` — random half defeats CSRF, suffix picks the reply. */
function buildState(isMobile: boolean): string {
  const random = crypto.randomUUID().replace(/-/g, '');
  return `${random}:${isMobile ? 'mobile' : 'web'}`;
}
