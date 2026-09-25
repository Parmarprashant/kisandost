import mongoose, { Document, Schema } from 'mongoose';

export type ExpertAuditAction =
  | 'TICKET_CREATED'
  | 'EXPERT_ASSIGNED'
  | 'REVIEW_STARTED'
  | 'REVIEW_SUBMITTED'
  | 'EVIDENCE_REQUESTED'
  | 'EVIDENCE_UPLOADED'
  | 'TICKET_CANCELLED'
  | 'TICKET_VERIFIED'
  | 'EXPERT_APPROVED'
  | 'EXPERT_SUSPENDED'
  | 'EXPERT_REJECTED'
  | 'FINAL_RESULT_PRODUCED';

export interface IExpertAuditLog extends Document {
  actor: string;
  actorRole: string;
  action: ExpertAuditAction;
  entity: string;
  entityId: string;
  metadata?: any;
  ipAddress?: string | null;
  timestamp: Date;
  createdAt: Date;
}

const ExpertAuditLogSchema = new Schema(
  {
    actor: {
      type: String,
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
      enum: ['farmer', 'expert', 'reviewer', 'admin', 'system'],
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entity: {
      type: String,
      required: true,
      enum: ['ExpertTicket', 'ExpertReview', 'ExpertProfile', 'CropDiseaseScan', 'RiskEvent'],
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    ipAddress: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'expert_audit_logs',
  }
);

ExpertAuditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
ExpertAuditLogSchema.index({ actor: 1, timestamp: -1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.ExpertAuditLog) {
  delete mongoose.models.ExpertAuditLog;
}

export const ExpertAuditLog =
  mongoose.models.ExpertAuditLog ||
  mongoose.model<IExpertAuditLog>('ExpertAuditLog', ExpertAuditLogSchema);

export default ExpertAuditLog;
