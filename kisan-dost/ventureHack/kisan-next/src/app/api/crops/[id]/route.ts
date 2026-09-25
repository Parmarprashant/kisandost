import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Crop } from '@/models/Crop';
import { Field } from '@/models/Field';
import { evaluateCropCycle } from '@/lib/gdd/cropCycleEngine';

// GET crop details
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Dynamically evaluate and refresh crop physiological cycle (DAS, GDD, growth stage)
    try {
      await evaluateCropCycle(id, userId, { autoUpdateDb: true });
    } catch (cycleErr) {
      console.warn('[GET /api/crops/[id]] Notice: Dynamic cycle evaluation fallback:', cycleErr);
    }

    const crop = await Crop.findOne({ _id: id, farmerId: userId })
      .populate('fieldId')
      .populate('zoneId');
    if (!crop) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    return NextResponse.json(crop, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching crop:', error);
    return NextResponse.json({ error: 'Failed to fetch crop' }, { status: 500 });
  }
}

// PUT update crop details
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const crop = await Crop.findOne({ _id: id, farmerId: userId });
    if (!crop) {
      return NextResponse.json({ error: 'Crop not found or access denied' }, { status: 404 });
    }

    // If cultivated area is modified, check field area
    if (body.cultivatedArea !== undefined) {
      const field = await Field.findById(crop.fieldId);
      if (field && body.cultivatedArea > field.area) {
        return NextResponse.json(
          { error: `Crop area (${body.cultivatedArea}) cannot exceed field area (${field.area})` },
          { status: 400 }
        );
      }
      crop.cultivatedArea = Number(body.cultivatedArea);
    }

    // Handle zoneId assignment with strict field and farmer validation
    if (body.zoneId !== undefined) {
      if (body.zoneId === null || body.zoneId === '') {
        crop.zoneId = null;
      } else {
        const { FarmZone } = await import('@/models/FarmZone');
        const validZone = await FarmZone.findOne({
          _id: body.zoneId,
          fieldId: crop.fieldId,
          farmerId: userId,
          active: true,
        });
        if (!validZone) {
          return NextResponse.json(
            { error: 'Specified zone does not belong to this crop\'s field or access denied' },
            { status: 400 }
          );
        }
        crop.zoneId = validZone._id;
      }
    }

    if (body.cropName !== undefined) crop.cropName = body.cropName;
    if (body.variety !== undefined) crop.variety = body.variety;
    if (body.sowingDate !== undefined) crop.sowingDate = new Date(body.sowingDate);
    if (body.cultivatedAreaUnit !== undefined) crop.cultivatedAreaUnit = body.cultivatedAreaUnit;
    if (body.cultivationMethod !== undefined) crop.cultivationMethod = body.cultivationMethod;
    if (body.status !== undefined) crop.status = body.status;
    if (body.notes !== undefined) crop.notes = body.notes;

    await crop.save();

    const updatedCrop = await Crop.findById(crop._id)
      .populate('fieldId')
      .populate('zoneId');

    return NextResponse.json(updatedCrop, { status: 200 });
  } catch (error: any) {
    console.error('Error updating crop:', error);
    return NextResponse.json({ error: 'Failed to update crop' }, { status: 500 });
  }
}

// DELETE crop
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const crop = await Crop.findOneAndDelete({ _id: id, farmerId: userId });
    if (!crop) {
      return NextResponse.json({ error: 'Crop not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Crop deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting crop:', error);
    return NextResponse.json({ error: 'Failed to delete crop' }, { status: 500 });
  }
}
