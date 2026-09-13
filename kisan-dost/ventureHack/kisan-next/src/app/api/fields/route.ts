import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Field } from '@/models/Field';
import { Crop } from '@/models/Crop';
import { memoryFields, memoryCrops, MemoryField } from '@/lib/memoryStore';

// GET all fields for the authenticated farmer (including populated crops)
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await connectDB();
      const fields = await Field.find({ farmerId: userId }).sort({ createdAt: -1 });
      const fieldIds = fields.map((f) => f._id);
      const crops = await Crop.find({ fieldId: { $in: fieldIds } }).sort({ sowingDate: -1 });

      const fieldsWithCrops = fields.map((field) => {
        const fieldObj = field.toObject();
        fieldObj.crops = crops.filter((c) => c.fieldId.toString() === field._id.toString());
        return fieldObj;
      });

      return NextResponse.json(fieldsWithCrops, { status: 200 });
    } catch (dbErr) {
      console.warn('MongoDB connection failed, using memory store fallback:', dbErr);
      const userFields = memoryFields.filter((f) => f.farmerId === userId);
      const result = userFields.map((f) => ({
        ...f,
        crops: memoryCrops.filter((c) => c.fieldId === f._id),
      }));
      return NextResponse.json(result, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error fetching fields:', error);
    return NextResponse.json({ error: 'Failed to fetch fields' }, { status: 500 });
  }
}

// POST create a new field
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, area, areaUnit, location, soil, irrigation, previousCrop } = body;

    if (!name || !area || area <= 0 || !areaUnit) {
      return NextResponse.json(
        { error: 'Field name, area (> 0), and area unit are required' },
        { status: 400 }
      );
    }

    try {
      await connectDB();
      const newField = await Field.create({
        farmerId: userId,
        name,
        area: Number(area),
        areaUnit: areaUnit || 'Acre',
        location: location || {},
        soil: soil || {},
        irrigation: irrigation || {},
        previousCrop: previousCrop || 'None',
      });
      return NextResponse.json(newField, { status: 201 });
    } catch (dbErr) {
      console.warn('MongoDB connection failed, creating field in memory store:', dbErr);
      const newMemField: MemoryField = {
        _id: 'field_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        farmerId: userId,
        name,
        area: Number(area),
        areaUnit: areaUnit || 'Acre',
        location: location || {},
        soil: soil || {},
        irrigation: irrigation || {},
        previousCrop: previousCrop || 'None',
        crops: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryFields.unshift(newMemField);
      return NextResponse.json(newMemField, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating field:', error);
    return NextResponse.json({ error: error.message || 'Failed to create field' }, { status: 500 });
  }
}
