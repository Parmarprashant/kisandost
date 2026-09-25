import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import { assignExpertToTicket } from '@/lib/expert/expertTicketService';

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

    // Only Admin and Reviewer can assign experts
    if (user.role !== 'admin' && user.role !== 'reviewer') {
      return NextResponse.json({ error: 'Forbidden: Admin or Reviewer role required to assign experts' }, { status: 403 });
    }

    const body = await req.json();
    const { expertProfileId } = body;

    if (!expertProfileId) {
      return NextResponse.json({ error: 'Missing required field: expertProfileId' }, { status: 400 });
    }

    const ticket = await assignExpertToTicket({
      ticketId: id,
      expertProfileId,
      assignedByUserId: user._id.toString(),
      assignedByUserRole: user.role === 'admin' ? 'admin' : 'reviewer',
    });

    return NextResponse.json({
      success: true,
      message: 'Expert successfully assigned to ticket',
      ticket,
    });
  } catch (error: any) {
    console.error('[API-Expert-Assign-PATCH] Error:', error);
    const status = error.message.includes('Forbidden') ? 403 : error.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
