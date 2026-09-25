import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Field } from '@/models/Field';
import { FarmZone } from '@/models/FarmZone';
import { generateMonitoringZones } from '@/lib/geoUtils';

// GET /api/fields/[id]/zones - List all monitoring zones for a field
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

    const zones = await FarmZone.find({
      fieldId: id,
      farmerId: userId,
      active: true,
    }).sort({ zoneCode: 1 });

    return NextResponse.json(
      {
        fieldId: field._id,
        fieldName: field.name,
        hasBoundary: Boolean(field.boundary?.coordinates?.length),
        totalZones: zones.length,
        zones,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching farm zones:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch farm zones' },
      { status: 500 }
    );
  }
}

// POST /api/fields/[id]/zones - Generate or regenerate monitoring zones
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
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty if just triggering default generation
    }
    const { regenerate } = body;

    await connectDB();

    const field = await Field.findOne({ _id: id, farmerId: userId });
    if (!field) {
      return NextResponse.json({ error: 'Field not found or access denied' }, { status: 404 });
    }

    if (!field.boundary || !field.boundary.coordinates || field.boundary.coordinates.length === 0) {
      return NextResponse.json(
        {
          error: 'Cannot generate monitoring zones: Field does not have a saved boundary polygon. Please draw and save a boundary first.',
        },
        { status: 400 }
      );
    }

    const existingZones = await FarmZone.find({
      fieldId: id,
      farmerId: userId,
      active: true,
    });

    if (existingZones.length > 0 && regenerate !== true) {
      return NextResponse.json(
        {
          message: 'Monitoring zones already exist for this field. Set regenerate: true to replace them.',
          zones: existingZones,
          isExisting: true,
        },
        { status: 200 }
      );
    }

    // Generate deterministic monitoring zones from the boundary polygon
    const generatedDescriptors = generateMonitoringZones(field.boundary, field.areaUnit);

    if (generatedDescriptors.length === 0) {
      return NextResponse.json(
        { error: 'Failed to partition boundary into monitoring zones. Polygon may be degenerate.' },
        { status: 400 }
      );
    }

    // Safely deactivate previous zones for this field (Step 10: Zone Regeneration Safety)
    if (existingZones.length > 0) {
      await FarmZone.deleteMany({ fieldId: id, farmerId: userId });
    }

    // Bulk insert new zone documents
    const createdZones = [];
    for (const desc of generatedDescriptors) {
      const newZone = await FarmZone.create({
        farmerId: userId,
        fieldId: field._id,
        zoneName: desc.zoneName,
        zoneCode: desc.zoneCode,
        polygon: desc.polygon,
        area: desc.area,
        areaUnit: field.areaUnit,
        soilVariance: '',
        active: true,
      });
      createdZones.push(newZone);
    }

    return NextResponse.json(
      {
        message: `Successfully generated ${createdZones.length} geometric monitoring zones`,
        fieldId: field._id,
        zones: createdZones,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error generating farm zones:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate farm zones' },
      { status: 500 }
    );
  }
}

// DELETE /api/fields/[id]/zones - Remove all monitoring zones for a field
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

    const deleteResult = await FarmZone.deleteMany({ fieldId: id, farmerId: userId });

    return NextResponse.json(
      {
        message: 'Monitoring zones cleared successfully',
        deletedCount: deleteResult.deletedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting farm zones:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete farm zones' },
      { status: 500 }
    );
  }
}
