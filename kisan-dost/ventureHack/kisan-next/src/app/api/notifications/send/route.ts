import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { AgriAdvisory } from '@/models/AgriAdvisory';
import { buildAdvisoryPayloadFromAdvisory } from '@/lib/advisory/advisoryNarrative';
import { orchestrateAdvisoryDelivery } from '@/lib/notifications/notificationOrchestrator';

export async function POST(req: Request) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      farmerId: targetFarmerId,
      sourceType = 'ADVISORY',
      sourceId,
      payload: explicitPayload,
      channels,
      language,
      generateVoice = false
    } = body;

    await connectDB();

    // ── Strict Farmer Isolation ──────────────────────────────────────────────
    const effectiveFarmerId = targetFarmerId || authData.userId;
    if (user.role === 'farmer' && effectiveFarmerId !== authData.userId) {
      return NextResponse.json(
        { error: 'Forbidden: Farmers can only dispatch notifications for their own account' },
        { status: 403 }
      );
    }

    let payload = explicitPayload;
    if (!payload && sourceId) {
      const advisory = await AgriAdvisory.findById(sourceId);
      if (advisory) {
        payload = buildAdvisoryPayloadFromAdvisory(advisory);
      }
    }

    if (!payload) {
      return NextResponse.json(
        { error: 'Valid advisory payload or sourceId is required' },
        { status: 400 }
      );
    }

    const result = await orchestrateAdvisoryDelivery({
      farmerId: effectiveFarmerId,
      sourceType,
      sourceId: sourceId || `manual_${Date.now()}`,
      payload,
      preferredLanguage: language,
      requestedChannels: channels,
      generateVoice
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
