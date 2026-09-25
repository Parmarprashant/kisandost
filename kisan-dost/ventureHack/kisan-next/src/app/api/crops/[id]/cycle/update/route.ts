import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { evaluateCropCycle } from '@/lib/gdd/cropCycleEngine';

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
    if (!id) {
      return NextResponse.json({ error: 'Crop ID is required' }, { status: 400 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Optional body
      body = {};
    }

    const newWeatherRecords = Array.isArray(body?.weatherRecords) ? body.weatherRecords : undefined;

    // Force cycle evaluation, update Crop and GddLogs
    const updatedState = await evaluateCropCycle(id, userId, {
      autoUpdateDb: true,
      newWeatherRecords,
    });

    return NextResponse.json(
      {
        message: 'Crop cycle progression updated successfully',
        cycle: updatedState,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating crop cycle:', error);
    if (error.message?.includes('access denied') || error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Crop not found or access denied' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update crop cycle progression' },
      { status: 500 }
    );
  }
}
