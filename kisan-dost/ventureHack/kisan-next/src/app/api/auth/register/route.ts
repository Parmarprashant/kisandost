import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { username, password, name, mobile, mainCrop } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    
    const newUser = await User.create({
      username,
      password: hashedPassword,
      name,
      mobile,
      mainCrop,
    });

    const token = await createToken({ userId: newUser._id.toString(), username: newUser.username });
    await setAuthCookie(token);

    return NextResponse.json({ message: 'User registered successfully', user: { id: newUser._id, username: newUser.username, name: newUser.name } }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
