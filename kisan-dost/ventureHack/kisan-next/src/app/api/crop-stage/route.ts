import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CropAdvisory } from '@/models/CropAdvisory';
import { calculateDaysAfterSowing, getActiveAdvisory } from '@/lib/cropStage';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cropType = searchParams.get('cropType');
    const plantationDateStr = searchParams.get('plantationDate');

    if (!cropType || !plantationDateStr) {
      return NextResponse.json({ error: 'Missing cropType or plantationDate params' }, { status: 400 });
    }

    const daysAfterSowing = calculateDaysAfterSowing(new Date(plantationDateStr));

    await connectDB();

    // Find the active advisory stage for this crop
    const currentAdvisory = await getActiveAdvisory(cropType, daysAfterSowing);

    // Also fetch the *next* advisory stage 
    const nextAdvisory = await CropAdvisory.findOne({
      cropType: cropType.toLowerCase(),
      daysAfterSowingStart: { $gt: daysAfterSowing }
    }).sort({ daysAfterSowingStart: 1 });

    return NextResponse.json({
      daysAfterSowing,
      currentStage: currentAdvisory ? currentAdvisory.stageName : 'Transitioning',
      currentAdvisory: currentAdvisory || null,
      nextAdvisory: nextAdvisory || null
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching crop stage:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
