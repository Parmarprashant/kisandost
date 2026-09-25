import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Field } from '@/models/Field';
import { FarmZone } from '@/models/FarmZone';
import { resolveGpsPoint } from '@/lib/geoUtils';

// POST /api/fields/[id]/resolve-point - Resolve a GPS coordinate against farm boundary & zones
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { latitude, longitude } = body;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Valid numeric latitude and longitude are required' },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90, Longitude between -180 and 180' },
        { status: 400 }
      );
    }

    await connectDB();

    const field = await Field.findOne({ _id: id, farmerId: userId });
    if (!field) {
      return NextResponse.json({ error: 'Field not found or access denied' }, { status: 404 });
    }

    const zones = await FarmZone.find({ fieldId: id, farmerId: userId, active: true });

    const resolution = resolveGpsPoint(
      { latitude: lat, longitude: lng },
      field.boundary,
      zones
    );

    return NextResponse.json(
      {
        fieldId: field._id,
        fieldName: field.name,
        queryPoint: { latitude: lat, longitude: lng },
        insideFarm: resolution.insideFarm,
        matchedZone: resolution.matchedZone,
        message: resolution.message,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error resolving GPS point:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve GPS coordinate' },
      { status: 500 }
    );
  }
}
