import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Crop } from '@/models/Crop';
import { AgriAdvisory } from '@/models/AgriAdvisory';
import { RiskEvent } from '@/models/RiskEvent';
import { FarmerIntervention } from '@/models/FarmerIntervention';

/**
 * GET /api/crops/[id]/interventions
 * Lists all interventions scheduled or completed for a crop.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const crop = await Crop.findOne({ _id: id, farmerId: userId });
    if (!crop) {
      return NextResponse.json({ error: 'Crop not found or access denied' }, { status: 404 });
    }

    const interventions = await FarmerIntervention.find({
      cropCycleId: id,
      farmerId: userId,
    })
      .sort({ scheduledDate: -1, createdAt: -1 })
      .populate('advisoryId');

    return NextResponse.json(interventions, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/crops/[id]/interventions] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch interventions' }, { status: 500 });
  }
}

/**
 * POST /api/crops/[id]/interventions
 * Farmer chooses and schedules an intervention from an advisory.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      advisoryId,
      riskEventId,
      interventionType,
      title,
      actionText,
      scheduledDate,
      farmerNotes,
      sourceRuleId,
    } = body;

    if (!advisoryId || !riskEventId || !interventionType || !title || !actionText) {
      return NextResponse.json(
        { error: 'advisoryId, riskEventId, interventionType, title, and actionText are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify crop ownership
    const crop = await Crop.findOne({ _id: id, farmerId: userId });
    if (!crop) {
      return NextResponse.json({ error: 'Crop not found or access denied' }, { status: 404 });
    }

    // Verify advisory ownership
    const advisory = await AgriAdvisory.findOne({ _id: advisoryId, farmerId: userId });
    if (!advisory) {
      return NextResponse.json({ error: 'Advisory not found or access denied' }, { status: 404 });
    }

    // Verify risk event ownership
    const riskEvent = await RiskEvent.findOne({ _id: riskEventId, farmerId: userId });
    if (!riskEvent) {
      return NextResponse.json({ error: 'Risk event not found or access denied' }, { status: 404 });
    }

    const intervention = await FarmerIntervention.create({
      advisoryId,
      riskEventId,
      farmerId: userId,
      fieldId: crop.fieldId,
      zoneId: crop.zoneId || null,
      cropCycleId: crop._id,
      interventionType,
      title,
      actionText,
      status: 'SCHEDULED',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      farmerNotes: farmerNotes || null,
      sourceRuleId: sourceRuleId || null,
    });

    return NextResponse.json(intervention, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/crops/[id]/interventions] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to schedule intervention' }, { status: 500 });
  }
}
