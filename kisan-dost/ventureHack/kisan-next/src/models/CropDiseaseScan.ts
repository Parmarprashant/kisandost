import mongoose, { Document, Schema } from 'mongoose';

export interface IDiagnosisDetails {
  primaryCondition: string;            // e.g. "Wheat Leaf Rust (Puccinia triticina)"
  pathogenType: string;                // "fungal" | "bacterial" | "viral" | "pest" | "deficiency" | "healthy" | "other"
  affectedPlantPart?: string;          // "leaf" | "stem" | "panicle" | "fruit" | "root" | "whole_plant"
  status: 'confirmed' | 'suspected' | 'healthy';
}

export interface IConfidenceDetails {
  level: 'High' | 'Medium' | 'Low';
  score: number;                       // 0.0 to 1.0
}

export interface ICropDiseaseScan extends Document {
  farmerId: string;
  fieldId: mongoose.Types.ObjectId;
  zoneId?: mongoose.Types.ObjectId | null;
  cropCycleId: mongoose.Types.ObjectId; // References Crop._id (runtime crop instance)
  scanSessionId?: mongoose.Types.ObjectId | null; // References ScanSession._id
  viewAngle?: string;                  // 'screening' | 'wide' | 'closeup' | 'side'
  screeningResult?: 'NO_CONCERN_DETECTED' | 'POTENTIAL_CONCERN' | 'INCONCLUSIVE';
  imageUrl: string;
  thumbnailUrl?: string;
  capturedAt: Date;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  diagnosis: IDiagnosisDetails;
  confidence: IConfidenceDetails;
  infectedAreaPct?: number | null;     // Raw area percentage from segmentation if present
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL' | null; // NULLABLE - AgriVision does NOT provide clinical severity
  cropStageAtScan?: string | null;     // Inferred phenological milestone at time of scan
  dasAtScan?: number | null;           // Days After Sowing at scan
  serviceName: string;                 // 'AgriVision Diagnostic Engine'
  serviceEndpoint: string;
  serviceVersion?: string | null;
  rawResponsePayload?: any;            // Full raw JSON response from Modal FastAPI
  remediationStatus: 'PENDING' | 'ACTION_TAKEN' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const DiagnosisSchema = new Schema(
  {
    primaryCondition: { type: String, required: true, trim: true },
    pathogenType: { type: String, required: true, default: 'other' },
    affectedPlantPart: { type: String, default: 'leaf' },
    status: {
      type: String,
      enum: ['confirmed', 'suspected', 'healthy'],
      default: 'confirmed',
    },
  },
  { _id: false }
);

const ConfidenceSchema = new Schema(
  {
    level: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      required: true,
      default: 'High',
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const CropDiseaseScanSchema: Schema = new Schema(
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
    scanSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ScanSession',
      default: null,
      index: true,
    },
    viewAngle: {
      type: String,
      default: 'screening',
    },
    screeningResult: {
      type: String,
      enum: ['NO_CONCERN_DETECTED', 'POTENTIAL_CONCERN', 'INCONCLUSIVE', null],
      default: null,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    capturedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    diagnosis: {
      type: DiagnosisSchema,
      required: true,
    },
    confidence: {
      type: ConfidenceSchema,
      required: true,
    },
    infectedAreaPct: {
      type: Number,
      default: null,
    },
    severity: {
      type: String,
      enum: ['MILD', 'MODERATE', 'SEVERE', 'CRITICAL', null],
      default: null, // Strictly null - AgriVision currently does NOT provide validated severity
    },
    cropStageAtScan: {
      type: String,
      default: null,
    },
    dasAtScan: {
      type: Number,
      default: null,
    },
    serviceName: {
      type: String,
      default: 'AgriVision Diagnostic Engine',
    },
    serviceEndpoint: {
      type: String,
      default:
        'https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run/api/v1/diagnose',
    },
    serviceVersion: {
      type: String,
      default: 'v1',
    },
    rawResponsePayload: {
      type: Schema.Types.Mixed,
      default: null,
    },
    remediationStatus: {
      type: String,
      enum: ['PENDING', 'ACTION_TAKEN', 'RESOLVED'],
      default: 'PENDING',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'crop_disease_scans',
  }
);

CropDiseaseScanSchema.index({ cropCycleId: 1, capturedAt: -1 });
CropDiseaseScanSchema.index({ fieldId: 1, capturedAt: -1 });
CropDiseaseScanSchema.index({ farmerId: 1, capturedAt: -1 });

export const CropDiseaseScan =
  mongoose.models.CropDiseaseScan ||
  mongoose.model<ICropDiseaseScan>('CropDiseaseScan', CropDiseaseScanSchema);
