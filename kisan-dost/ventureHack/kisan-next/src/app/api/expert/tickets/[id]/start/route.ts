import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import { startExpertReview } from '@/lib/expert/expertTicketService';

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

    const ticket = await startExpertReview({
      ticketId: id,
      expertUserId: user._id.toString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Expert review started',
      ticket,
    });
  } catch (error: any) {
    console.error('[API-Expert-Start-PATCH] Error:', error);
    const status = error.message.includes('Forbidden') ? 403 : error.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
