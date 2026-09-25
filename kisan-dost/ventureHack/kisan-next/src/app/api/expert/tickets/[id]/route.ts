import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { ExpertTicket } from '@/models/ExpertTicket';
import { ExpertReview } from '@/models/ExpertReview';
import { ExpertAuditLog } from '@/models/ExpertAuditLog';
import { CropDiseaseScan } from '@/models/CropDiseaseScan';
import { WeatherObservation } from '@/models/WeatherObservation';
import { RiskEvent } from '@/models/RiskEvent';
import { ExpertProfile } from '@/models/ExpertProfile';

export async function GET(
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

    await connectDB();

    const ticket = await ExpertTicket.findById(id)
      .populate('assignedExpertId')
      .lean();

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // ── Tenant & Role Authorization ─────────────────────────────────────────
    if (user.role === 'farmer') {
      if (ticket.farmerId !== user._id.toString()) {
        return NextResponse.json(
          { error: 'Forbidden: Access denied to other farmers tickets' },
          { status: 403 }
        );
      }
    } else if (user.role === 'expert') {
      const expertProfile = await ExpertProfile.findOne({ userId: user._id });
      const isAssignedUser = ticket.assignedUserId && ticket.assignedUserId.toString() === user._id.toString();
      const isAssignedProfile = expertProfile && ticket.assignedExpertId && ticket.assignedExpertId._id.toString() === expertProfile._id.toString();

      if (!isAssignedUser && !isAssignedProfile) {
        return NextResponse.json(
          { error: 'Forbidden: You are not authorized to view this ticket' },
          { status: 403 }
        );
      }
    }
    // Reviewer and Admin have full access

    // Fetch related diagnostic scan
    const scan = await CropDiseaseScan.findById(ticket.scanId).lean();

    // Fetch review if completed
    let review = null;
    if (ticket.completedReviewId) {
      review = await ExpertReview.findById(ticket.completedReviewId)
        .populate('expertId', 'fullName institutionName designation')
        .lean();
    }

    // Fetch recent weather observations for the crop cycle / field
    const weatherObservations = await WeatherObservation.find({
      cropCycleId: ticket.cropCycleId,
    })
      .sort({ observationDate: -1 })
      .limit(5)
      .lean();

    // Fetch linked RiskEvent if exists
    const riskEvent = ticket.riskEventId
      ? await RiskEvent.findById(ticket.riskEventId).lean()
      : null;

    // Fetch audit trail for this ticket
    const auditLogs = await ExpertAuditLog.find({
      entity: 'ExpertTicket',
      entityId: ticket._id.toString(),
    })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      ticket,
      scan,
      review,
      weatherObservations,
      riskEvent,
      auditLogs,
    });
  } catch (error: any) {
    console.error('[API-Expert-Tickets-Detail-GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
