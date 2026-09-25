import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { processZoneImage } from '@/lib/gdd/zoneScanService';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: cropId, zoneId } = await params;
    if (!cropId || !zoneId) {
      return NextResponse.json(
        { error: 'Crop ID and Zone ID are required' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const viewAngle = (formData.get('viewAngle') as string) || 'screening';

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided for screening scan' },
        { status: 400 }
      );
    }

    const result = await processZoneImage({
      cropId,
      zoneId,
      userId,
      file,
      viewAngle,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error processing initial zone scan:', error);
    if (
      error.message?.includes('access denied') ||
      error.message?.includes('not found') ||
      error.message?.includes('does not belong')
    ) {
      return NextResponse.json(
        { error: error.message || 'Crop or Zone not found or access denied' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to process zone image scan' },
      { status: 500 }
    );
  }
}
