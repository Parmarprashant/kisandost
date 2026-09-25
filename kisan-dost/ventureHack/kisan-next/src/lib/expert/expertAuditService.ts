/**
 * AgriShield 360° — Phase 9 Expert Audit Service
 *
 * Persists immutable audit records for every verification workflow event.
 */

import connectDB from '@/lib/mongodb';
import { ExpertAuditLog, ExpertAuditAction } from '@/models/ExpertAuditLog';

export interface AuditParams {
  actor: string;
  actorRole: 'farmer' | 'expert' | 'reviewer' | 'admin' | 'system';
  action: ExpertAuditAction;
  entity: 'ExpertTicket' | 'ExpertReview' | 'ExpertProfile' | 'CropDiseaseScan' | 'RiskEvent';
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
}

export async function logExpertAudit(params: AuditParams): Promise<void> {
  try {
    await connectDB();
    await ExpertAuditLog.create({
      actor: params.actor,
      actorRole: params.actorRole,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata || {},
      ipAddress: params.ipAddress || null,
      timestamp: new Date(),
    });
  } catch (err: any) {
    // Non-fatal logging failure: print warning so core business transaction does not fail
    console.warn(`[ExpertAuditService] Failed to record audit log: ${err.message}`, params);
  }
}
