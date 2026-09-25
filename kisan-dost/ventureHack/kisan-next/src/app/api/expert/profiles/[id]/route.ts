import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import { updateExpertStatus } from '@/lib/expert/expertProfileService';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only Admin can verify, reject, or suspend expert profiles
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Platform Administrator privileges required to manage expert credentials' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, reason } = body;

    if (!status || !['VERIFIED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid or missing status. Valid values: VERIFIED, REJECTED, SUSPENDED, PENDING' },
        { status: 400 }
      );
    }

    const profile = await updateExpertStatus({
      profileId: id,
      status,
      adminUserId: user._id.toString(),
      reason,
    });

    return NextResponse.json({
      success: true,
      message: `Expert profile successfully updated to ${status}`,
      profile,
    });
  } catch (error: any) {
    console.error('[API-Expert-Profile-Update-PATCH] Error:', error);
    const statusCode = error.message.includes('Forbidden') ? 403 : error.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status: statusCode });
  }
}
