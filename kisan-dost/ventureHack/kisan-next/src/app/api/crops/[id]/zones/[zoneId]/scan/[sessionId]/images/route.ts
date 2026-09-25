import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { processZoneImage } from '@/lib/gdd/zoneScanService';

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

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const viewAngle = (formData.get('viewAngle') as string) || 'supplementary_view';

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided for supplementary scan' },
        { status: 400 }
      );
    }

    // Attach supplementary image to existing session
    const result = await processZoneImage({
      cropId,
      zoneId,
      userId,
      sessionId,
      file,
      viewAngle,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error uploading supplementary zone image:', error);
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
      { error: error.message || 'Failed to process supplementary image' },
      { status: 400 }
    );
  }
}
