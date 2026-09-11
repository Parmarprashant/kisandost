import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkMembership } from '@/lib/checkMembership';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasActiveMembership = await checkMembership(userId);

    return NextResponse.json({ hasActiveMembership }, { status: 200 });
  } catch (error: any) {
    console.error('Membership check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
