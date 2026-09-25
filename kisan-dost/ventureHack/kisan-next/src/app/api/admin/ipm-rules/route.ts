import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { AgriIpmRule, IpmValidationStatus } from '@/models/AgriIpmRule';

export async function GET(req: Request) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const user = await currentUser();
    // Only users with admin or reviewer roles are allowed to access knowledge governance
    if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
      return NextResponse.json({ error: 'Forbidden: Reviewer or Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const crop = searchParams.get('crop');

    await dbConnect();

    const query: any = {};
    if (status && status !== 'all') {
      query.validationStatus = status;
    }
    if (crop) {
      query.cropName = { $regex: new RegExp(`^${crop}$`, 'i') };
    }

    const rules = await AgriIpmRule.find(query).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: rules.length,
      rules,
    });
  } catch (error: any) {
    console.error('[Admin-IPM-Rules] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const user = await currentUser();
    // Authorized reviewer or admin only
    if (!user || (user.role !== 'admin' && user.role !== 'reviewer')) {
      return NextResponse.json({ error: 'Forbidden: Reviewer or Admin permissions required' }, { status: 403 });
    }

    const body = await req.json();
    const { ruleId, action, notes, supersededByRuleId } = body;

    if (!ruleId || !action) {
      return NextResponse.json({ error: 'Missing ruleId or action' }, { status: 400 });
    }

    await dbConnect();

    const rule = await AgriIpmRule.findById(ruleId);
    if (!rule) {
      return NextResponse.json({ error: 'IPM Rule not found' }, { status: 404 });
    }

    let newStatus: IpmValidationStatus;
    let isCurrent = rule.isCurrent ?? true;
    let supersededBy = rule.supersededBy ?? null;
    let conflictDetails = rule.conflictDetails ?? null;

    switch (action) {
      case 'validate':
        newStatus = 'VALIDATED';
        isCurrent = true;
        break;
      case 'reject':
        newStatus = 'REJECTED';
        isCurrent = false;
        break;
      case 'flag_conflict':
        newStatus = 'CONFLICTING_SOURCES';
        conflictDetails = notes || 'Conflicting recommendations detected between agricultural sources.';
        break;
      case 'supersede':
        newStatus = 'SUPERSEDED';
        isCurrent = false;
        supersededBy = supersededByRuleId || null;
        break;
      default:
        return NextResponse.json({ error: `Invalid governance action: ${action}` }, { status: 400 });
    }

    rule.validationStatus = newStatus;
    rule.isCurrent = isCurrent;
    rule.supersededBy = supersededBy;
    rule.conflictDetails = conflictDetails;
    rule.reviewedBy = user ? (user.name || user.email || authData.userId) : authData.userId;
    rule.reviewedAt = new Date();
    if (notes) {
      rule.validationNotes = notes;
    }

    await rule.save();

    return NextResponse.json({
      success: true,
      message: `Rule ${rule.ruleCode} successfully transitioned to ${newStatus}`,
      rule,
    });
  } catch (error: any) {
    console.error('[Admin-IPM-Rules] Patch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
