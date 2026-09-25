import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Field } from '@/models/Field';
import { Crop } from '@/models/Crop';
import { memoryFields, memoryCrops, MemoryCrop } from '@/lib/memoryStore';

// GET crops for a field
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: fieldId } = await params;

    try {
      await connectDB();
      const crops = await Crop.find({ fieldId, farmerId: userId }).sort({ sowingDate: -1 });
      return NextResponse.json(crops, { status: 200 });
    } catch (dbErr) {
      const fieldCrops = memoryCrops.filter((c) => c.fieldId === fieldId && c.farmerId === userId);
      return NextResponse.json(fieldCrops, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error fetching field crops:', error);
    return NextResponse.json({ error: 'Failed to fetch crops' }, { status: 500 });
  }
}

// POST create crop inside a field
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: fieldId } = await params;
    const body = await req.json();
    const {
      cropName,
      cropMasterId,
      variety,
      sowingDate,
      cultivatedArea,
      cultivatedAreaUnit,
      cultivationMethod,
      zoneId,
      notes,
    } = body;

    if (!cropName || !sowingDate || !cultivatedArea || Number(cultivatedArea) <= 0) {
      return NextResponse.json(
        { error: 'Crop name, valid sowing date, and cultivated area (> 0) are required' },
        { status: 400 }
      );
    }

    const areaNum = Number(cultivatedArea);

    try {
      await connectDB();

      const field = await Field.findOne({ _id: fieldId, farmerId: userId });
      if (!field) {
        return NextResponse.json({ error: 'Field not found or access denied' }, { status: 404 });
      }

      const effectiveArea = areaNum > field.area ? field.area : areaNum;

      let validatedZoneId = null;
      if (zoneId) {
        const { FarmZone } = await import('@/models/FarmZone');
        const validZone = await FarmZone.findOne({
          _id: zoneId,
          fieldId: field._id,
          farmerId: userId,
          active: true,
        });
        if (!validZone) {
          return NextResponse.json(
            { error: 'Specified zone does not belong to this field or access denied' },
            { status: 400 }
          );
        }
        validatedZoneId = validZone._id;
      }

      const newCrop = await Crop.create({
        farmerId: userId,
        fieldId: field._id,
        zoneId: validatedZoneId,
        cropName,
        cropMasterId: cropMasterId || '',
        icarCropId: cropName.toLowerCase().trim(),
        variety: variety || '',
        sowingDate: new Date(sowingDate),
        cultivatedArea: effectiveArea,
        cultivatedAreaUnit: cultivatedAreaUnit || field.areaUnit || 'Acre',
        cultivationMethod: cultivationMethod || 'Direct Sowing',
        status: 'Active',
        notes: notes || '',
      });

      // Synchronize to FarmerCrop for advisory alerts
      try {
        const { FarmerCrop } = await import('@/models/FarmerCrop');
        await FarmerCrop.create({
          farmerId: userId,
          cropType: cropName.toLowerCase().trim(),
          plantationDate: new Date(sowingDate),
          landArea: effectiveArea,
          location: [field.location?.village, field.location?.district].filter(Boolean).join(', ') || 'Farm',
          phoneNumber: body.phoneNumber || '',
          initialAdvisorySent: false,
        });
      } catch (fcErr) {
        // Non-blocking advisory synchronization
      }

      return NextResponse.json(newCrop, { status: 201 });
    } catch (dbErr) {
      console.warn('MongoDB failed, registering crop in memory store:', dbErr);
      const memField = memoryFields.find((f) => f._id === fieldId && f.farmerId === userId);
      if (memField && areaNum > memField.area) {
        return NextResponse.json(
          { error: `Crop area (${areaNum} ${cultivatedAreaUnit || 'Acre'}) cannot exceed field area (${memField.area} ${memField.areaUnit})` },
          { status: 400 }
        );
      }

      const newMemCrop: MemoryCrop = {
        _id: 'crop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        farmerId: userId,
        fieldId,
        cropName,
        cropMasterId: cropMasterId || '',
        variety: variety || '',
        sowingDate: new Date(sowingDate).toISOString(),
        cultivatedArea: areaNum,
        cultivatedAreaUnit: cultivatedAreaUnit || 'Acre',
        cultivationMethod: cultivationMethod || 'Direct Sowing',
        status: 'Active',
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryCrops.unshift(newMemCrop);
      return NextResponse.json(newMemCrop, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating crop:', error);
    return NextResponse.json({ error: error.message || 'Failed to create crop' }, { status: 500 });
  }
}
