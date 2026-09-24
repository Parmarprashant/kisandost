import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createToken, setAuthCookie } from '@/lib/auth';
import { OAUTH_STATE_COOKIE } from '../route';

/** Custom scheme the Flutter app registers for the OAuth hand-back. */
const MOBILE_CALLBACK_SCHEME = 'kisandost://auth/callback';

/** Mobile failures go to the app, not to a web page it cannot display. */
function mobileError(reason: string) {
  return NextResponse.redirect(
    `${MOBILE_CALLBACK_SCHEME}?error=${encodeURIComponent(reason)}`
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state') ?? '';

  // The state was issued by /api/auth/google and echoed back by Google. It
  // says who started this flow, and whether to answer the browser or the app.
  const expectedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const isMobile = state.endsWith(':mobile');
  const stateIsValid = Boolean(expectedState) && state === expectedState;

  const baseUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (error || !code) {
    console.error('Google OAuth Callback Error:', error);
    return isMobile
      ? mobileError('google_auth_failed')
      : NextResponse.redirect(`${baseUrl}/auth?error=google_auth_failed`);
  }

  // Reject a callback this server did not start. Without this an attacker can
  // complete a flow in someone else's browser and sign them into an account
  // they do not own.
  if (!stateIsValid) {
    console.error('Google OAuth Callback: state mismatch');
    return isMobile
      ? mobileError('state_mismatch')
      : NextResponse.redirect(`${baseUrl}/auth?error=state_mismatch`);
  }

  try {
    // 1. Exchange authorization code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Failed to exchange code for token:', tokenData);
      return isMobile
        ? mobileError('token_exchange_failed')
        : NextResponse.redirect(`${baseUrl}/auth?error=token_exchange_failed`);
    }

    // 2. Fetch user profile from Google UserInfo API
    const userProfileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userProfileResponse.json();

    if (!profile || !profile.id) {
      console.error('Failed to fetch Google profile:', profile);
      return isMobile
        ? mobileError('profile_fetch_failed')
        : NextResponse.redirect(`${baseUrl}/auth?error=profile_fetch_failed`);
    }

    const { id: googleId, email, name, picture } = profile;

    // 3. Connect to MongoDB and find/create User
    await dbConnect();

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (!user) {
      // Generate a unique fallback username based on name or email
      const baseUsername = email ? email.split('@')[0] : (name || 'farmer').toLowerCase().replace(/\s+/g, '_');
      let uniqueUsername = baseUsername;
      let counter = 1;

      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${baseUsername}_${counter}`;
        counter++;
      }

      user = await User.create({
        googleId,
        email,
        name: name || 'Kisan User',
        username: uniqueUsername,
        avatar: picture || '',
      });
    } else {
      // Update existing user with googleId/avatar if missing
      if (!user.googleId) user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }

    // 4. Create JWT Token & set HTTP-only cookie
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email || '',
    };

    const jwtToken = await createToken(tokenPayload);

    // 5a. Mobile: hand the JWT to the app through its custom scheme. The app
    // stores it and sends it as `Authorization: Bearer <jwt>` from then on,
    // because a native client cannot use the httpOnly cookie the web uses.
    if (isMobile) {
      const response = NextResponse.redirect(
        `${MOBILE_CALLBACK_SCHEME}?token=${encodeURIComponent(jwtToken)}`
      );
      response.cookies.delete(OAUTH_STATE_COOKIE);
      return response;
    }

    // 5b. Web: unchanged — cookie, then back to the auth page.
    await setAuthCookie(jwtToken);
    const response = NextResponse.redirect(`${baseUrl}/auth?success=google_login`);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;

  } catch (err: any) {
    console.error('Google Auth Route Error:', err);
    return isMobile
      ? mobileError('server_error')
      : NextResponse.redirect(`${baseUrl}/auth?error=server_error`);
  }
}
