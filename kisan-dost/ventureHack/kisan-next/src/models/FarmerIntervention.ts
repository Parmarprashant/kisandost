import mongoose, { Document, Schema } from 'mongoose';

export type InterventionType =
  | 'MONITORING'
  | 'CULTURAL'
  | 'MECHANICAL'
  | 'BIOLOGICAL'
  | 'CHEMICAL'
  | 'EXPERT_REVIEW';

export type InterventionStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IFarmerIntervention extends Document {
  advisoryId: mongoose.Types.ObjectId;
  riskEventId: mongoose.Types.ObjectId;
  farmerId: string;
  fieldId: mongoose.Types.ObjectId;
  zoneId?: mongoose.Types.ObjectId | null;
  cropCycleId: mongoose.Types.ObjectId;
  interventionType: InterventionType;
  title: string;
  actionText: string;
  status: InterventionStatus;
  scheduledDate: Date;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  farmerNotes?: string | null;
  sourceRuleId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerInterventionSchema = new Schema(
  {
    advisoryId: {
      type: Schema.Types.ObjectId,
      ref: 'AgriAdvisory',
      required: true,
      index: true,
    },
    riskEventId: {
      type: Schema.Types.ObjectId,
      ref: 'RiskEvent',
      required: true,
      index: true,
    },
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmZone',
      default: null,
    },
    cropCycleId: {
      type: Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
      index: true,
    },
    interventionType: {
      type: String,
      enum: ['MONITORING', 'CULTURAL', 'MECHANICAL', 'BIOLOGICAL', 'CHEMICAL', 'EXPERT_REVIEW'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    actionText: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      required: true,
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    farmerNotes: {
      type: String,
      default: null,
      trim: true,
    },
    sourceRuleId: {
      type: Schema.Types.ObjectId,
      ref: 'AgriIpmRule',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'farmer_interventions',
  }
);

FarmerInterventionSchema.index({ farmerId: 1, cropCycleId: 1, status: 1 });
FarmerInterventionSchema.index({ scheduledDate: 1, status: 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.FarmerIntervention) {
  delete mongoose.models.FarmerIntervention;
}

export const FarmerIntervention =
  mongoose.models.FarmerIntervention ||
  mongoose.model<IFarmerIntervention>('FarmerIntervention', FarmerInterventionSchema);
