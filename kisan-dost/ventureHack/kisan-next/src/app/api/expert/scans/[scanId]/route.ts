import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { CropDiseaseScan } from '@/models/CropDiseaseScan';
import { Crop } from '@/models/Crop';
import { Field } from '@/models/Field';
import { FarmZone } from '@/models/FarmZone';
import { ExpertTicket } from '@/models/ExpertTicket';
import { ExpertProfile } from '@/models/ExpertProfile';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { scanId } = await params;
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await connectDB();

    const scan = await CropDiseaseScan.findById(scanId).lean();
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    // ── Tenant & Role Check ─────────────────────────────────────────────────
    if (user.role === 'farmer') {
      if (scan.farmerId !== user._id.toString()) {
        return NextResponse.json({ error: 'Forbidden: Access denied to other farmers scan records' }, { status: 403 });
      }
    } else if (user.role === 'expert') {
      // Expert can view if ticket is assigned to them
      const expertProfile = await ExpertProfile.findOne({ userId: user._id });
      const ticket = await ExpertTicket.findOne({
        scanId: scan._id,
        $or: [
          { assignedUserId: user._id },
          ...(expertProfile ? [{ assignedExpertId: expertProfile._id }] : []),
        ],
      });

      if (!ticket) {
        return NextResponse.json(
          { error: 'Forbidden: You are not authorized to view this scan unless assigned as expert' },
          { status: 403 }
        );
      }
    }

    // Fetch crop, field, zone context
    const crop = await Crop.findById(scan.cropCycleId).lean();
    const field = await Field.findById(scan.fieldId).lean();
    const zone = scan.zoneId ? await FarmZone.findById(scan.zoneId).lean() : null;

    return NextResponse.json({
      success: true,
      scan,
      crop,
      field,
      zone,
    });
  } catch (error: any) {
    console.error('[API-Expert-Scans-GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
