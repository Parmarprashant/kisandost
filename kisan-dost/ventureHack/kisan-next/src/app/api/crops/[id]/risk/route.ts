/**
 * GET /api/crops/[id]/risk
 *
 * Returns current agricultural risk evaluation for a crop.
 *
 * Security:
 * - Requires JWT session authentication
 * - Strictly verifies farmer ownership of the requested crop
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { evaluateCropRisk } from '@/lib/risk/riskEngine';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cropId = params.id;
    if (!cropId) {
      return NextResponse.json({ error: 'Crop ID is required' }, { status: 400 });
    }

    const summary = await evaluateCropRisk({
      cropId,
      farmerId: userId,
      persistEvents: true,
    });

    return NextResponse.json(summary);
  } catch (err: any) {
    const message = err?.message || 'Failed to evaluate crop risk';
    console.error(`[GET /api/crops/${params?.id}/risk] Error:`, message);

    if (message.includes('not found') || message.includes('access denied')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message.includes('Invalid')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
