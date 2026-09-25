import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { ScanSession } from '@/models/ScanSession';
import { CropDiseaseScan } from '@/models/CropDiseaseScan';
import { validateZoneScoutingContext } from '@/lib/gdd/zoneScanService';

export async function GET(
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

    // Validate ownership
    await validateZoneScoutingContext(cropId, zoneId, userId);
    await connectDB();

    const session = await ScanSession.findOne({
      _id: sessionId,
      farmerId: userId,
      cropId,
      zoneId,
    }).lean();

    if (!session) {
      return NextResponse.json(
        { error: 'Scan session not found or access denied' },
        { status: 404 }
      );
    }

    const scans = await CropDiseaseScan.find({
      _id: { $in: session.scanIds },
    })
      .sort({ capturedAt: 1 })
      .lean();

    return NextResponse.json(
      {
        session: {
          sessionId: session._id,
          status: session.status,
          result: session.result,
          scanCount: session.scanCount,
          maxAdditionalImages: session.maxAdditionalImages,
          requiresAdditionalImages: session.requiresAdditionalImages,
          currentStep: session.currentStep,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          evidenceSummary: session.evidenceSummary,
        },
        scans: scans.map((s) => ({
          scanId: s._id,
          imageUrl: s.imageUrl,
          viewAngle: s.viewAngle || 'screening',
          screeningResult: s.screeningResult,
          diseaseName: s.diagnosis?.primaryCondition,
          confidence: s.confidence?.score,
          confidenceLevel: s.confidence?.level,
          capturedAt: s.capturedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching zone scan session:', error);
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
      { error: error.message || 'Failed to fetch scan session' },
      { status: 500 }
    );
  }
}
