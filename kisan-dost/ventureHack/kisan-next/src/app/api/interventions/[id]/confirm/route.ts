import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { FarmerIntervention } from '@/models/FarmerIntervention';

/**
 * PATCH /api/interventions/[id]/confirm
 * Farmer confirms completion of an intervention.
 * Body: { farmerNotes?: string }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    await connectDB();

    // Verify ownership and update status
    const intervention = await FarmerIntervention.findOne({ _id: id, farmerId: userId });
    if (!intervention) {
      return NextResponse.json({ error: 'Intervention not found or access denied' }, { status: 404 });
    }

    intervention.status = 'COMPLETED';
    intervention.completedAt = new Date();
    if (body.farmerNotes) {
      intervention.farmerNotes = body.farmerNotes;
    }

    await intervention.save();

    return NextResponse.json(intervention, { status: 200 });
  } catch (error: any) {
    console.error('[PATCH /api/interventions/[id]/confirm] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to confirm intervention' }, { status: 500 });
  }
}
