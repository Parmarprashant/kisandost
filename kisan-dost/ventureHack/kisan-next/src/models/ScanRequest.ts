import mongoose, { Document, Schema } from 'mongoose';

export interface IScanRequest extends Document {
  farmerId: string;
  fieldId: mongoose.Types.ObjectId;
  zoneId?: mongoose.Types.ObjectId | null;
  cropCycleId: mongoose.Types.ObjectId; // References Crop._id
  triggerType:
    | 'WEATHER_ALERT'
    | 'STAGE_MILESTONE'
    | 'PEST_OUTBREAK_RISK'
    | 'SCHEDULED_SCOUTING'
    | 'MANUAL';
  reason: string;                        // Human-readable trigger explanation
  targetPlantPart?: 'leaf' | 'stem' | 'panicle' | 'canopy' | 'whole_plant';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'SUBMITTED' | 'EXPIRED' | 'CANCELLED';
  resultingScanId?: mongoose.Types.ObjectId | null; // Set when farmer completes the scan
  requestedAt: Date;
  completedAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ScanRequestSchema: Schema = new Schema(
  {
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
      index: true,
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmZone',
      default: null,
      index: true,
    },
    cropCycleId: {
      type: Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
      index: true,
    },
    triggerType: {
      type: String,
      enum: [
        'WEATHER_ALERT',
        'STAGE_MILESTONE',
        'PEST_OUTBREAK_RISK',
        'SCHEDULED_SCOUTING',
        'MANUAL',
      ],
      required: true,
      default: 'MANUAL',
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    targetPlantPart: {
      type: String,
      enum: ['leaf', 'stem', 'panicle', 'canopy', 'whole_plant'],
      default: 'leaf',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUBMITTED', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    resultingScanId: {
      type: Schema.Types.ObjectId,
      ref: 'CropDiseaseScan',
      default: null,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'scan_requests',
  }
);

ScanRequestSchema.index({ cropCycleId: 1, status: 1 });
ScanRequestSchema.index({ farmerId: 1, status: 1 });

export const ScanRequest =
  mongoose.models.ScanRequest ||
  mongoose.model<IScanRequest>('ScanRequest', ScanRequestSchema);
