import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { finalizeZoneScanSession, validateZoneScoutingContext } from '@/lib/gdd/zoneScanService';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; zoneId: string; sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: cropId, zoneId, sessionId } = await params;
    if (!cropId || !zoneId || !sessionId) {
      return NextResponse.json(
        { error: 'Crop ID, Zone ID, and Session ID are required' },
        { status: 400 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Validate ownership
    await validateZoneScoutingContext(cropId, zoneId, userId);

    const summary = await finalizeZoneScanSession(sessionId, userId, body.notes);

    return NextResponse.json(
      {
        message: 'Scan session completed successfully',
        summary,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error completing scan session:', error);
    if (
      error.message?.includes('access denied') ||
      error.message?.includes('not found') ||
      error.message?.includes('does not belong')
    ) {
      return NextResponse.json(
        { error: error.message || 'Crop, Zone, or Session not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to complete scan session' },
      { status: 500 }
    );
  }
}
