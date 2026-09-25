import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import { listExpertProfiles, createExpertProfile } from '@/lib/expert/expertProfileService';

export async function GET(req: Request) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const crop = searchParams.get('crop') || undefined;
    const district = searchParams.get('district') || undefined;
    const state = searchParams.get('state') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined;

    const profiles = await listExpertProfiles({
      status,
      crop,
      district,
      state,
      isActive,
    });

    return NextResponse.json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error: any) {
    console.error('[API-Expert-Profiles-GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      userId,
      fullName,
      institutionName,
      institutionType,
      designation,
      specialization,
      crops,
      districts,
      states,
      officialEmail,
      officialPhone,
      sourceType,
      sourceReference,
    } = body;

    if (!fullName || !institutionName || !sourceReference) {
      return NextResponse.json(
        { error: 'Missing mandatory fields: fullName, institutionName, and sourceReference are required' },
        { status: 400 }
      );
    }

    const profile = await createExpertProfile({
      userId,
      fullName,
      institutionName,
      institutionType,
      designation,
      specialization,
      crops,
      districts,
      states,
      officialEmail,
      officialPhone,
      sourceType,
      sourceReference,
      actorId: user._id.toString(),
      actorRole: user.role === 'admin' ? 'admin' : user.role === 'reviewer' ? 'reviewer' : 'farmer',
    });

    return NextResponse.json({
      success: true,
      message: 'Expert profile created successfully',
      profile,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API-Expert-Profiles-POST] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
