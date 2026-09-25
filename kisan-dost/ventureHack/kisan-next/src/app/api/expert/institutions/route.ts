import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { AgriInstitutionReference } from '@/models/AgriInstitutionReference';

export async function GET(req: Request) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    await connectDB();

    const query: any = {};
    if (state && state !== 'all') {
      query.state = { $regex: new RegExp(`^${state}$`, 'i') };
    }
    if (district && district !== 'all') {
      query.district = { $regex: new RegExp(`^${district}$`, 'i') };
    }
    if (type && type !== 'all') {
      query.institutionType = type;
    }

    const institutions = await AgriInstitutionReference.find(query)
      .limit(limit)
      .sort({ state: 1, district: 1, name: 1 })
      .lean();

    const totalCount = await AgriInstitutionReference.countDocuments(query);

    return NextResponse.json({
      success: true,
      totalCount,
      count: institutions.length,
      institutions,
    });
  } catch (error: any) {
    console.error('[API-Expert-Institutions-GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
