/**
 * GET /api/crops/[id]/zones/[zoneId]/risk
 *
 * Returns agricultural risk evaluation isolated to a specific monitoring zone.
 *
 * Security:
 * - Requires JWT session authentication
 * - Strictly verifies farmer ownership of the crop
 * - Strictly verifies that zone belongs to the crop's field and farmer
 * - Enforces zone isolation (evidence from zone A does not leak to zone B)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { evaluateCropRisk } from '@/lib/risk/riskEngine';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; zoneId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: cropId, zoneId } = params;
    if (!cropId || !zoneId) {
      return NextResponse.json(
        { error: 'Crop ID and Zone ID are required' },
        { status: 400 }
      );
    }

    const summary = await evaluateCropRisk({
      cropId,
      farmerId: userId,
      targetZoneId: zoneId,
      persistEvents: true,
    });

    return NextResponse.json(summary);
  } catch (err: any) {
    const message = err?.message || 'Failed to evaluate zone risk';
    console.error(
      `[GET /api/crops/${params?.id}/zones/${params?.zoneId}/risk] Error:`,
      message
    );

    if (
      message.includes('not found') ||
      message.includes('access denied') ||
      message.includes('does not belong')
    ) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message.includes('Invalid')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
