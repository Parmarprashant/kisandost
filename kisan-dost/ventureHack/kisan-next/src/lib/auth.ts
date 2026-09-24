import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import dbConnect from './mongodb';
import User from '../models/User';

const secretKey = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
const key = new TextEncoder().encode(secretKey);

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

export const AUTH_COOKIE_NAME = '__kisan_auth_token';

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Reads the session token.
 *
 * The browser sends it as an httpOnly cookie. A mobile client cannot use
 * cookies, so an `Authorization: Bearer <jwt>` header is accepted as a
 * fallback. The cookie is checked first, so nothing about the web app's
 * behaviour changes.
 */
async function readToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (fromCookie) return fromCookie;

  const headerStore = await headers();
  const authorization = headerStore.get('authorization');
  if (!authorization) return null;

  const [scheme, value] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !value) return null;

  return value.trim() || null;
}

export async function getSession() {
  const token = await readToken();
  if (!token) return null;
  return await verifyToken(token);
}

export async function auth() {
  const session = await getSession();
  if (!session) return { userId: null };
  return { userId: session.userId as string };
}

export async function currentUser() {
  const session = await getSession();
  if (!session) return null;
  
  await dbConnect();
  try {
    const user = await User.findById(session.userId);
    return user;
  } catch(e) {
    return null;
  }
}
