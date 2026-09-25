import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { ExpertTicket } from '@/models/ExpertTicket';
import { ExpertProfile } from '@/models/ExpertProfile';
import { createExpertTicket } from '@/lib/expert/expertTicketService';

export async function GET(req: Request) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const crop = searchParams.get('crop');
    const priority = searchParams.get('priority');

    const query: any = {};

    // ── Strict Role & Tenant Isolation ──────────────────────────────────────
    if (user.role === 'farmer') {
      // Farmer can ONLY see their own tickets
      query.farmerId = user._id.toString();
    } else if (user.role === 'expert') {
      // Expert can only see tickets assigned to them
      const expertProfile = await ExpertProfile.findOne({ userId: user._id });
      const expertProfileId = expertProfile?._id;

      query.$or = [
        { assignedUserId: user._id },
        ...(expertProfileId ? [{ assignedExpertId: expertProfileId }] : []),
      ];
    }
    // Reviewer and Admin can inspect all tickets across all tenants

    if (status && status !== 'all') {
      query.status = status;
    }
    if (crop && crop !== 'all') {
      query.cropName = { $regex: new RegExp(`^${crop}$`, 'i') };
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const tickets = await ExpertTicket.find(query)
      .populate('assignedExpertId', 'fullName institutionName designation')
      .populate('completedReviewId', 'expertDecision finalDiagnosis expertNotes createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error: any) {
    console.error('[API-Expert-Tickets-GET] Error:', error);
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
    const { scanId, requestedReason, triggerType } = body;

    if (!scanId) {
      return NextResponse.json({ error: 'Missing required field: scanId' }, { status: 400 });
    }

    const ticket = await createExpertTicket({
      scanId,
      farmerId: user._id.toString(),
      triggerType: triggerType || (user.role === 'farmer' ? 'FARMER_REQUEST' : 'REVIEWER_REQUEST'),
      requestedReason,
      actorId: user._id.toString(),
      actorRole: user.role === 'admin' ? 'admin' : user.role === 'reviewer' ? 'reviewer' : 'farmer',
    });

    return NextResponse.json({
      success: true,
      message: 'Expert verification ticket created successfully',
      ticket,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API-Expert-Tickets-POST] Error:', error);
    const status = error.message.includes('Forbidden') ? 403 : error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
