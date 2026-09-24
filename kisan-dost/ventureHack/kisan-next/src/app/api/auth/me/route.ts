import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

function serialise(user: any) {
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    mobile: user.mobile,
    village: user.village,
    district: user.district,
    mainCrop: user.mainCrop,
  };
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: serialise(user) }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

/**
 * Updates the signed-in user's own profile.
 *
 * Added for the mobile onboarding step: Google gives us a name, an email and a
 * picture, but nothing about the farm, and there was no way to fill in the
 * rest.
 *
 * Only these five fields can be written. `email`, `username`, `password`,
 * `googleId` and `_id` are deliberately not updatable here — changing an
 * identity field through a profile form is how account takeovers happen.
 */
const EDITABLE_FIELDS = [
  'name',
  'mobile',
  'village',
  'district',
  'mainCrop',
] as const;

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, string> = {};

    for (const field of EDITABLE_FIELDS) {
      const value = body?.[field];
      if (typeof value === 'string' && value.trim()) {
        updates[field] = value.trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: serialise(user) }, { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
