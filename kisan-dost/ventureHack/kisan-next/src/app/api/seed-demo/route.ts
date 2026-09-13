import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Field } from '@/models/Field';
import { Crop } from '@/models/Crop';
import { memoryFields, memoryCrops, MemoryField, MemoryCrop } from '@/lib/memoryStore';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await connectDB();

      const northField = await Field.create({
        farmerId: userId,
        name: 'North Field',
        area: 2.5,
        areaUnit: 'Acre',
        location: {
          village: 'Sanand',
          taluka: 'Sanand',
          district: 'Ahmedabad',
          state: 'Gujarat',
          latitude: 23.003,
          longitude: 72.384,
        },
        soil: {
          type: 'Black Soil',
          soilTestAvailable: true,
          pH: 7.2,
          nitrogen: 140,
          phosphorus: 35,
          potassium: 220,
          organicCarbon: 0.65,
        },
        irrigation: {
          method: 'Drip',
          waterSource: 'Borewell',
          frequency: 'Every 2–3 days',
        },
        previousCrop: 'Wheat',
      });

      await Crop.create({
        farmerId: userId,
        fieldId: northField._id,
        cropName: 'Cotton',
        variety: 'Bt Cotton (RCH 2)',
        sowingDate: new Date('2026-08-10'),
        cultivatedArea: 2.0,
        cultivatedAreaUnit: 'Acre',
        cultivationMethod: 'Direct Sowing',
        status: 'Active',
        notes: 'Planted after first monsoon rain.',
      });

      const southField = await Field.create({
        farmerId: userId,
        name: 'South Field',
        area: 3.0,
        areaUnit: 'Acre',
        location: {
          village: 'Bavla',
          taluka: 'Bavla',
          district: 'Ahmedabad',
          state: 'Gujarat',
          latitude: 22.836,
          longitude: 72.361,
        },
        soil: {
          type: 'Loamy Soil',
          soilTestAvailable: false,
        },
        irrigation: {
          method: 'Sprinkler',
          waterSource: 'Canal',
          frequency: 'Weekly',
        },
        previousCrop: 'Mustard',
      });

      await Crop.create({
        farmerId: userId,
        fieldId: southField._id,
        cropName: 'Groundnut',
        variety: 'GG 20',
        sowingDate: new Date('2026-08-15'),
        cultivatedArea: 2.5,
        cultivatedAreaUnit: 'Acre',
        cultivationMethod: 'Direct Sowing',
        status: 'Active',
        notes: 'Seeded with gypsum application.',
      });

      return NextResponse.json(
        { message: 'Demo data seeded successfully!', fields: [northField, southField] },
        { status: 201 }
      );
    } catch (dbErr) {
      console.warn('MongoDB failed, seeding memory store:', dbErr);

      const f1Id = 'field_demo_north_' + Date.now();
      const f2Id = 'field_demo_south_' + Date.now();

      const f1: MemoryField = {
        _id: f1Id,
        farmerId: userId,
        name: 'North Field',
        area: 2.5,
        areaUnit: 'Acre',
        location: { village: 'Sanand', taluka: 'Sanand', district: 'Ahmedabad', state: 'Gujarat', latitude: 23.003, longitude: 72.384 },
        soil: { type: 'Black Soil', soilTestAvailable: true, pH: 7.2, nitrogen: 140, phosphorus: 35, potassium: 220, organicCarbon: 0.65 },
        irrigation: { method: 'Drip', waterSource: 'Borewell', frequency: 'Every 2–3 days' },
        previousCrop: 'Wheat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const c1: MemoryCrop = {
        _id: 'crop_demo_cotton_' + Date.now(),
        farmerId: userId,
        fieldId: f1Id,
        cropName: 'Cotton',
        variety: 'Bt Cotton (RCH 2)',
        sowingDate: '2026-08-10',
        cultivatedArea: 2.0,
        cultivatedAreaUnit: 'Acre',
        cultivationMethod: 'Direct Sowing',
        status: 'Active',
        notes: 'Planted after first monsoon rain.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const f2: MemoryField = {
        _id: f2Id,
        farmerId: userId,
        name: 'South Field',
        area: 3.0,
        areaUnit: 'Acre',
        location: { village: 'Bavla', taluka: 'Bavla', district: 'Ahmedabad', state: 'Gujarat', latitude: 22.836, longitude: 72.361 },
        soil: { type: 'Loamy Soil', soilTestAvailable: false },
        irrigation: { method: 'Sprinkler', waterSource: 'Canal', frequency: 'Weekly' },
        previousCrop: 'Mustard',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const c2: MemoryCrop = {
        _id: 'crop_demo_groundnut_' + Date.now(),
        farmerId: userId,
        fieldId: f2Id,
        cropName: 'Groundnut',
        variety: 'GG 20',
        sowingDate: '2026-08-15',
        cultivatedArea: 2.5,
        cultivatedAreaUnit: 'Acre',
        cultivationMethod: 'Direct Sowing',
        status: 'Active',
        notes: 'Seeded with gypsum application.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryFields.unshift(f1, f2);
      memoryCrops.unshift(c1, c2);

      return NextResponse.json(
        { message: 'Demo data seeded in memory store!', fields: [f1, f2] },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json({ error: 'Failed to seed demo data' }, { status: 500 });
  }
}
