import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import { submitExpertReview } from '@/lib/expert/expertTicketService';

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

    const body = await req.json();
    const {
      requestedEvidence,
      requestedPlantPart,
      requestedPhotoAngle,
      requestedSymptoms,
      requestedContext,
      expertNotes,
    } = body;

    if (!requestedEvidence) {
      return NextResponse.json(
        { error: 'Missing required field: requestedEvidence' },
        { status: 400 }
      );
    }

    const result = await submitExpertReview({
      ticketId: id,
      expertUserId: user._id.toString(),
      expertDecision: 'NEEDS_MORE_IMAGES',
      expertNotes: expertNotes || `Additional photographs requested: ${requestedEvidence}`,
      additionalEvidenceRequested: {
        requestedEvidence,
        requestedPlantPart,
        requestedPhotoAngle,
        requestedSymptoms,
        requestedContext,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Additional evidence requested from farmer',
      ticket: result.ticket,
      review: result.review,
    });
  } catch (error: any) {
    console.error('[API-Expert-RequestEvidence-PATCH] Error:', error);
    const status = error.message.includes('Forbidden') ? 403 : error.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
