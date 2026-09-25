import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import { cancelExpertTicket } from '@/lib/expert/expertTicketService';

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

    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    const ticket = await cancelExpertTicket({
      ticketId: id,
      cancelledByUserId: user._id.toString(),
      cancelledByUserRole: user.role === 'admin' ? 'admin' : user.role === 'reviewer' ? 'reviewer' : 'farmer',
      reason,
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket cancelled successfully',
      ticket,
    });
  } catch (error: any) {
    console.error('[API-Expert-Cancel-PATCH] Error:', error);
    const status = error.message.includes('Forbidden') ? 403 : error.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
