import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Crop } from '@/models/Crop';
import { memoryCrops } from '@/lib/memoryStore';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await connectDB();
      const crops = await Crop.find({ farmerId: userId })
        .populate('fieldId', 'name area areaUnit location')
        .sort({ sowingDate: -1 });
      return NextResponse.json(crops, { status: 200 });
    } catch (dbErr) {
      const userCrops = memoryCrops.filter((c) => c.farmerId === userId);
      return NextResponse.json(userCrops, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error fetching my-crops:', error);
    return NextResponse.json({ error: 'Failed to fetch crops' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return NextResponse.json({ message: "Use /api/fields/[id]/crops or /api/farmer-crops to create crops" }, { status: 400 });
}

