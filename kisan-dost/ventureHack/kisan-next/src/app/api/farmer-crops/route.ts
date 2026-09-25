import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { FarmerCrop } from '@/models/FarmerCrop';
import { Field } from '@/models/Field';
import { Crop } from '@/models/Crop';
import { memoryCrops, MemoryCrop } from '@/lib/memoryStore';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await connectDB();
      const crops = await FarmerCrop.find({ farmerId: userId }).sort({ createdAt: -1 });
      return NextResponse.json(crops, { status: 200 });
    } catch (dbErr) {
      console.warn('MongoDB query failed in /api/farmer-crops GET, using memory store:', dbErr);
      const mem = memoryCrops.filter((c) => c.farmerId === userId);
      return NextResponse.json(mem, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error fetching farmer crops:', error);
    return NextResponse.json({ error: 'Failed to fetch farmer crops' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { cropType, plantationDate, landArea, location, phoneNumber, fieldId, variety } = body;

    if (!cropType || !plantationDate || !landArea || Number(landArea) <= 0) {
      return NextResponse.json(
        { error: 'Crop type, plantation date, and valid land area are required' },
        { status: 400 }
      );
    }

    const areaNum = Number(landArea);
    const normalizedCropType = cropType.toLowerCase().trim();
    const capitalizedCropName = normalizedCropType.charAt(0).toUpperCase() + normalizedCropType.slice(1);

    try {
      await connectDB();

      // 1. Create FarmerCrop for SMS advisory & background cron
      const farmerCrop = await FarmerCrop.create({
        farmerId: userId,
        cropType: normalizedCropType,
        plantationDate: new Date(plantationDate),
        landArea: areaNum,
        location: (location || '').trim(),
        phoneNumber: (phoneNumber || '').trim(),
        initialAdvisorySent: false,
      });

      // 2. Resolve target Field
      let targetField: any = null;
      if (fieldId) {
        targetField = await Field.findOne({ _id: fieldId, farmerId: userId });
      }

      if (!targetField) {
        targetField = await Field.findOne({ farmerId: userId }).sort({ createdAt: -1 });
      }

      if (!targetField) {
        // If farmer has no registered fields yet, create a default field record
        targetField = await Field.create({
          farmerId: userId,
          name: `${capitalizedCropName} Field`,
          area: areaNum,
          areaUnit: 'Acre',
          location: {
            village: location?.trim() || '',
            district: location?.trim() || '',
            latitude: 23.2156,
            longitude: 72.6369,
          },
        });
      }

      // 3. Create precision Crop linked to the target field
      const newCrop = await Crop.create({
        farmerId: userId,
        fieldId: targetField._id,
        cropName: capitalizedCropName,
        icarCropId: normalizedCropType,
        variety: variety?.trim() || 'Standard Cultivar',
        sowingDate: new Date(plantationDate),
        cultivatedArea: areaNum <= targetField.area ? areaNum : targetField.area,
        cultivatedAreaUnit: targetField.areaUnit || 'Acre',
        cultivationMethod: 'Direct Sowing',
        status: 'Active',
        notes: `Registered via advisory enrollment. Phone: ${phoneNumber || 'N/A'}`,
      });

      return NextResponse.json(
        {
          message: 'Crop successfully registered',
          farmerCrop,
          crop: newCrop,
          fieldId: targetField._id,
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn('MongoDB error in /api/farmer-crops, fallback to memory store:', dbErr);
      const memCrop: MemoryCrop = {
        _id: 'crop_' + Date.now(),
        farmerId: userId,
        fieldId: fieldId || 'field_default',
        cropName: capitalizedCropName,
        cropMasterId: '',
        variety: variety || 'Standard Cultivar',
        sowingDate: new Date(plantationDate).toISOString(),
        cultivatedArea: areaNum,
        cultivatedAreaUnit: 'Acre',
        cultivationMethod: 'Direct Sowing',
        status: 'Active',
        notes: `Phone: ${phoneNumber}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryCrops.unshift(memCrop);
      return NextResponse.json({ message: 'Crop registered in memory', crop: memCrop }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating farmer crop:', error);
    return NextResponse.json({ error: error.message || 'Failed to create crop' }, { status: 500 });
  }
}

