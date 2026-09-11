import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Handle users created via Google OAuth who don't have passwords
    if (!user.password) {
      return NextResponse.json({ error: 'This account uses Google Sign-In. Please use "Continue with Google" instead.' }, { status: 403 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = await createToken({ userId: user._id.toString(), username: user.username });
    await setAuthCookie(token);

    return NextResponse.json({ message: 'Logged in successfully', user: { id: user._id, username: user.username, name: user.name } }, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
