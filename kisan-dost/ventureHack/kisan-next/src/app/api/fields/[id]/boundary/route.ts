import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Field } from '@/models/Field';
import { FarmZone } from '@/models/FarmZone';
import { validateGeoPolygon, calculateGeodesicArea, convertArea } from '@/lib/geoUtils';

// GET /api/fields/[id]/boundary - Retrieve field boundary
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

    const field = await Field.findOne({ _id: id, farmerId: userId });
    if (!field) {
      return NextResponse.json({ error: 'Field not found or access denied' }, { status: 404 });
    }

    const hasBoundary = Boolean(
      field.boundary &&
      field.boundary.coordinates &&
      field.boundary.coordinates.length > 0
    );

    let calculatedArea = null;
    if (hasBoundary && field.boundary?.coordinates?.[0]) {
      const areaSqM = calculateGeodesicArea(field.boundary.coordinates[0]);
      calculatedArea = convertArea(areaSqM, field.areaUnit);
    }

    // Check if monitoring zones exist
    const zoneCount = await FarmZone.countDocuments({ fieldId: id, farmerId: userId, active: true });

    return NextResponse.json(
      {
        fieldId: field._id,
        fieldName: field.name,
        hasBoundary,
        boundary: field.boundary || null,
        area: field.area,
        areaUnit: field.areaUnit,
        calculatedArea,
        zoneCount,
        location: field.location,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching field boundary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch field boundary' },
      { status: 500 }
    );
  }
}

// POST /api/fields/[id]/boundary - Save or update field boundary
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
    const { boundary, updateFieldArea } = body;

    if (!boundary) {
      return NextResponse.json(
        { error: 'Boundary GeoJSON Polygon is required' },
        { status: 400 }
      );
    }

    // Strict GeoJSON validation
    const validation = validateGeoPolygon(boundary);
    if (!validation.valid || !validation.normalizedPolygon) {
      return NextResponse.json(
        { error: validation.error || 'Invalid GeoJSON polygon' },
        { status: 400 }
      );
    }

    await connectDB();

    const field = await Field.findOne({ _id: id, farmerId: userId });
    if (!field) {
      return NextResponse.json({ error: 'Field not found or access denied' }, { status: 404 });
    }

    // Calculate boundary area
    const areaSqM = calculateGeodesicArea(validation.normalizedPolygon.coordinates[0]);
    const boundaryArea = convertArea(areaSqM, field.areaUnit);

    // Save normalized boundary polygon
    field.boundary = validation.normalizedPolygon;

    // Optionally update field area if requested by farmer
    if (updateFieldArea === true && boundaryArea > 0) {
      field.area = boundaryArea;
    }

    await field.save();

    // Check if existing zones exist that need regeneration
    const existingZones = await FarmZone.find({ fieldId: id, farmerId: userId, active: true });
    const zonesRequireRegeneration = existingZones.length > 0;

    return NextResponse.json(
      {
        message: 'Farm boundary polygon saved successfully',
        fieldId: field._id,
        boundary: field.boundary,
        calculatedArea: boundaryArea,
        areaUnit: field.areaUnit,
        zonesRequireRegeneration,
        existingZoneCount: existingZones.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving field boundary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save field boundary' },
      { status: 500 }
    );
  }
}

// DELETE /api/fields/[id]/boundary - Remove field boundary
export async function DELETE(
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

    const field = await Field.findOne({ _id: id, farmerId: userId });
    if (!field) {
      return NextResponse.json({ error: 'Field not found or access denied' }, { status: 404 });
    }

    field.boundary = undefined;
    await field.save();

    // Deactivate associated monitoring zones
    await FarmZone.updateMany(
      { fieldId: id, farmerId: userId },
      { $set: { active: false } }
    );

    return NextResponse.json(
      { message: 'Field boundary and monitoring zones removed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting field boundary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete field boundary' },
      { status: 500 }
    );
  }
}
