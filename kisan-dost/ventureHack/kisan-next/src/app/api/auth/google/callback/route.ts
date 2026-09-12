import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (error || !code) {
    console.error('Google OAuth Callback Error:', error);
    return NextResponse.redirect(`${baseUrl}/auth?error=google_auth_failed`);
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
      return NextResponse.redirect(`${baseUrl}/auth?error=token_exchange_failed`);
    }

    // 2. Fetch user profile from Google UserInfo API
    const userProfileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userProfileResponse.json();

    if (!profile || !profile.id) {
      console.error('Failed to fetch Google profile:', profile);
      return NextResponse.redirect(`${baseUrl}/auth?error=profile_fetch_failed`);
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
    await setAuthCookie(jwtToken);

    // 5. Redirect back to auth page (triggers language selection modal & login state)
    return NextResponse.redirect(`${baseUrl}/auth?success=google_login`);

  } catch (err: any) {
    console.error('Google Auth Route Error:', err);
    return NextResponse.redirect(`${baseUrl}/auth?error=server_error`);
  }
}
