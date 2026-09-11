import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
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

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('__kisan_auth_token')?.value;
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
