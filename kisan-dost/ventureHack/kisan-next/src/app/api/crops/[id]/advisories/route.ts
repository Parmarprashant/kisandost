import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Crop } from '@/models/Crop';
import { RiskEvent } from '@/models/RiskEvent';
import { AgriAdvisory } from '@/models/AgriAdvisory';
import '@/models/AgriIpmRule';
import { resolveAdvisoryForRiskEvent } from '@/lib/advisory/advisoryResolver';
import { dispatchAdvisoryNotification } from '@/lib/advisory/advisoryNotifier';
import { evaluateCropRisk } from '@/lib/risk/riskEngine';

/**
 * GET /api/crops/[id]/advisories
 * Returns active advisories for the authenticated farmer's crop.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Verify crop ownership
    const crop = await Crop.findOne({ _id: id, farmerId: userId });
    if (!crop) {
      return NextResponse.json({ error: 'Crop not found or access denied' }, { status: 404 });
    }

    const advisories = await AgriAdvisory.find({
      cropCycleId: id,
      farmerId: userId,
      isSuperseded: false,
    })
      .sort({ createdAt: -1 })
      .populate('matchedRuleIds');

    return NextResponse.json(advisories, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/crops/[id]/advisories] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch advisories' }, { status: 500 });
  }
}

/**
 * POST /api/crops/[id]/advisories
 * Resolves and generates an advisory from a specific RiskEvent.
 * Body: { riskEventId: string }
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    let riskEventId = body.riskEventId;

    await connectDB();

    // Verify crop ownership
    const crop = await Crop.findOne({ _id: id, farmerId: userId });
    if (!crop) {
      return NextResponse.json({ error: 'Crop not found or access denied' }, { status: 404 });
    }

    // If riskEventId not provided in body, find or auto-evaluate the latest RiskEvent for this crop
    if (!riskEventId) {
      let latestEvent = await RiskEvent.findOne({ cropCycleId: id, farmerId: userId }).sort({ createdAt: -1 });
      if (!latestEvent) {
        try {
          await evaluateCropRisk({
            cropId: id,
            farmerId: userId,
            persistEvents: true,
          });
          latestEvent = await RiskEvent.findOne({ cropCycleId: id, farmerId: userId }).sort({ createdAt: -1 });
        } catch (riskErr) {
          console.error('[POST /api/crops/[id]/advisories] On-the-fly risk evaluation notice:', riskErr);
        }
      }

      // If no pre-existing RiskEvent was generated, create a robust baseline monitoring RiskEvent
      if (!latestEvent) {
        latestEvent = await RiskEvent.create({
          farmerId: userId,
          fieldId: crop.fieldId,
          cropCycleId: crop._id,
          threatId: 'GENERAL_HEALTH',
          threatName: 'General Crop Health & Preventive Management',
          ruleId: 'RULE_BASELINE_01',
          growthStageId: crop.currentStageId || 'Vegetative',
          riskStatus: 'LOW',
          riskLevel: 'LOW',
          riskScore: null,
          explanation: `Automated baseline agronomic evaluation for ${crop.cropName}. Monitoring for regional pests, optimal nutrition, and stage-specific cultural practices.`,
          contributingFactors: {
            stageVulnerability: {
              isVulnerable: false,
              stageName: crop.currentStageId || 'Vegetative',
              vulnerablePests: [],
            },
            weatherStress: { isTriggered: false, activeTriggers: [] },
            diseaseScanSignal: { hasActiveDiagnosis: false, conditionName: 'Healthy Canopy' },
            supportingEvidence: [],
            missingEvidence: [],
            mitigatingEvidence: [],
          },
          recommendedActions: [],
          evaluatedAt: new Date(),
        });
      }
      riskEventId = latestEvent._id.toString();
    }

    // Resolve advisory using deterministic agronomic rules
    const advisory = await resolveAdvisoryForRiskEvent({
      riskEventId,
      farmerId: userId,
    });

    // Fetch the risk event for notification dispatch
    const riskEvent = await RiskEvent.findById(riskEventId);
    if (riskEvent) {
      // Non-fatal notification dispatch (never throws)
      await dispatchAdvisoryNotification(advisory, riskEvent);
    }

    return NextResponse.json(advisory, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/crops/[id]/advisories] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate advisory' }, { status: 500 });
  }
}
