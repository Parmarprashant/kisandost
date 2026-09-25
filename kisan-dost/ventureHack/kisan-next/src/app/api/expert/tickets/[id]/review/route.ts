import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import { submitExpertReview } from '@/lib/expert/expertTicketService';

export async function POST(
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

    const body = await req.json();
    const {
      expertDecision,
      finalDiagnosis,
      expertNotes,
      evidenceReviewed,
      additionalEvidenceRequested,
    } = body;

    if (!expertDecision) {
      return NextResponse.json({ error: 'Missing required field: expertDecision' }, { status: 400 });
    }

    if (!expertNotes) {
      return NextResponse.json({ error: 'Missing required field: expertNotes' }, { status: 400 });
    }

    const result = await submitExpertReview({
      ticketId: id,
      expertUserId: user._id.toString(),
      expertDecision,
      finalDiagnosis,
      expertNotes,
      evidenceReviewed: evidenceReviewed || [],
      additionalEvidenceRequested,
    });

    return NextResponse.json({
      success: true,
      message: 'Expert review submitted successfully',
      ticket: result.ticket,
      review: result.review,
    });
  } catch (error: any) {
    console.error('[API-Expert-Review-POST] Error:', error);
    const status = error.message.includes('Forbidden') ? 403 : error.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
