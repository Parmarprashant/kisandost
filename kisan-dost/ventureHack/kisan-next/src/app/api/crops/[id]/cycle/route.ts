import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { evaluateCropCycle } from '@/lib/gdd/cropCycleEngine';

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
    if (!id) {
      return NextResponse.json({ error: 'Crop ID is required' }, { status: 400 });
    }

    // Evaluate crop cycle without forced re-accumulation
    const cycleState = await evaluateCropCycle(id, userId, { autoUpdateDb: true });

    return NextResponse.json(cycleState, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching crop cycle state:', error);
    if (error.message?.includes('access denied') || error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Crop not found or access denied' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to evaluate crop cycle progression' },
      { status: 500 }
    );
  }
}
