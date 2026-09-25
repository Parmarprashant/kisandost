import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Field } from '@/models/Field';
import { Crop } from '@/models/Crop';

// GET field by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const field = await Field.findOne({ _id: id, farmerId: userId });
    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    const crops = await Crop.find({ fieldId: id, farmerId: userId }).sort({ sowingDate: -1 });
    const fieldObj = field.toObject() as any;
    fieldObj.crops = crops;

    return NextResponse.json(fieldObj, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching field:', error);
    return NextResponse.json({ error: 'Failed to fetch field' }, { status: 500 });
  }
}

// PUT update field
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const field = await Field.findOne({ _id: id, farmerId: userId });
    if (!field) {
      return NextResponse.json({ error: 'Field not found or access denied' }, { status: 404 });
    }

    if (body.name !== undefined) field.name = body.name;
    if (body.area !== undefined && body.area > 0) field.area = Number(body.area);
    if (body.areaUnit !== undefined) field.areaUnit = body.areaUnit;
    if (body.location !== undefined) field.location = { ...field.location, ...body.location };
    if (body.soil !== undefined) field.soil = { ...field.soil, ...body.soil };
    if (body.irrigation !== undefined) field.irrigation = { ...field.irrigation, ...body.irrigation };
    if (body.previousCrop !== undefined) field.previousCrop = body.previousCrop;

    await field.save();

    return NextResponse.json(field, { status: 200 });
  } catch (error: any) {
    console.error('Error updating field:', error);
    return NextResponse.json({ error: 'Failed to update field' }, { status: 500 });
  }
}

// DELETE field and associated crops
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const field = await Field.findOneAndDelete({ _id: id, farmerId: userId });
    if (!field) {
      return NextResponse.json({ error: 'Field not found or access denied' }, { status: 404 });
    }

    // Delete all crops linked to this field
    await Crop.deleteMany({ fieldId: id, farmerId: userId });

    return NextResponse.json({ message: 'Field and crops deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting field:', error);
    return NextResponse.json({ error: 'Failed to delete field' }, { status: 500 });
  }
}
