import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Crop } from '@/models/Crop';
import { CropDiseaseScan } from '@/models/CropDiseaseScan';

// GET /api/crops/[id]/scans - Fetch disease scans for a crop cycle
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const scans = await CropDiseaseScan.find({
      cropCycleId: id,
      farmerId: userId,
    })
      .sort({ capturedAt: -1, createdAt: -1 })
      .populate('zoneId', 'zoneCode zoneName')
      .lean();

    return NextResponse.json(scans, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching crop disease scans:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch crop disease scans' },
      { status: 500 }
    );
  }
}
