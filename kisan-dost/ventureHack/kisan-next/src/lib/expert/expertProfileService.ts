/**
 * AgriShield 360° — Phase 9 Expert Profile Service
 *
 * Manages human expert profiles, credentials, institutional affiliations,
 * admin approval workflows, and audit logging.
 */

import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { ExpertProfile, IExpertProfile, ExpertVerificationStatus, ExpertSourceType } from '@/models/ExpertProfile';
import User from '@/models/User';
import { logExpertAudit } from './expertAuditService';

export interface CreateProfileParams {
  userId?: string | null;
  fullName: string;
  institutionName: string;
  institutionType?: string;
  designation?: string | null;
  specialization?: string[];
  crops?: string[];
  districts?: string[];
  states?: string[];
  officialEmail?: string | null;
  officialPhone?: string | null;
  sourceType?: ExpertSourceType;
  sourceReference: string;
  actorId: string;
  actorRole: 'admin' | 'reviewer' | 'expert' | 'farmer';
}

/**
 * Creates an expert profile. Defaults to PENDING verification status unless created directly by admin.
 */
export async function createExpertProfile(params: CreateProfileParams): Promise<IExpertProfile> {
  const {
    userId,
    fullName,
    institutionName,
    institutionType = 'KVK',
    designation,
    specialization = [],
    crops = [],
    districts = [],
    states = [],
    officialEmail,
    officialPhone,
    sourceType = 'MANUAL_ENTRY',
    sourceReference,
    actorId,
    actorRole,
  } = params;

  await connectDB();

  // If userId is provided, ensure user exists and update user role if admin
  if (userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    if (actorRole === 'admin' && user.role !== 'admin' && user.role !== 'expert') {
      user.role = 'expert';
      await user.save();
    }
  }

  const profile = await ExpertProfile.create({
    userId: userId ? new mongoose.Types.ObjectId(userId) : null,
    fullName: fullName.trim(),
    institutionName: institutionName.trim(),
    institutionType,
    designation: designation || null,
    specialization,
    crops,
    districts,
    states,
    officialEmail: officialEmail || null,
    officialPhone: officialPhone || null,
    sourceType,
    sourceReference,
    verificationStatus: actorRole === 'admin' ? 'VERIFIED' : 'PENDING',
    verifiedBy: actorRole === 'admin' ? actorId : null,
    verifiedAt: actorRole === 'admin' ? new Date() : null,
    isActive: true,
  });

  await logExpertAudit({
    actor: actorId,
    actorRole,
    action: actorRole === 'admin' ? 'EXPERT_APPROVED' : 'TICKET_CREATED',
    entity: 'ExpertProfile',
    entityId: profile._id.toString(),
    metadata: {
      fullName,
      institutionName,
      sourceType,
      sourceReference,
      status: profile.verificationStatus,
    },
  });

  return profile;
}

/**
 * Updates an expert profile verification status (VERIFIED, REJECTED, SUSPENDED).
 * Admin only.
 */
export async function updateExpertStatus(params: {
  profileId: string;
  status: ExpertVerificationStatus;
  adminUserId: string;
  reason?: string;
}): Promise<IExpertProfile> {
  const { profileId, status, adminUserId, reason } = params;

  await connectDB();

  const profile = await ExpertProfile.findById(profileId);
  if (!profile) {
    throw new Error(`Expert profile not found: ${profileId}`);
  }

  const oldStatus = profile.verificationStatus;
  profile.verificationStatus = status;

  if (status === 'VERIFIED') {
    profile.verifiedBy = adminUserId;
    profile.verifiedAt = new Date();
    profile.isActive = true;
    profile.suspensionReason = null;

    // Promote linked User account role to 'expert'
    if (profile.userId) {
      await User.findByIdAndUpdate(profile.userId, { role: 'expert' });
    }
  } else if (status === 'SUSPENDED') {
    profile.isActive = false;
    profile.suspensionReason = reason || 'Suspended by platform administrator';
  } else if (status === 'REJECTED') {
    profile.isActive = false;
    profile.suspensionReason = reason || 'Rejected by platform administrator';
  }

  await profile.save();

  const actionName =
    status === 'VERIFIED'
      ? 'EXPERT_APPROVED'
      : status === 'SUSPENDED'
      ? 'EXPERT_SUSPENDED'
      : 'EXPERT_REJECTED';

  await logExpertAudit({
    actor: adminUserId,
    actorRole: 'admin',
    action: actionName,
    entity: 'ExpertProfile',
    entityId: profile._id.toString(),
    metadata: {
      oldStatus,
      newStatus: status,
      reason,
    },
  });

  return profile;
}

/**
 * Lists expert profiles with filters.
 */
export async function listExpertProfiles(filters: {
  status?: string;
  crop?: string;
  district?: string;
  state?: string;
  isActive?: boolean;
}): Promise<IExpertProfile[]> {
  await connectDB();

  const query: any = {};

  if (filters.status && filters.status !== 'all') {
    query.verificationStatus = filters.status;
  }
  if (filters.crop && filters.crop !== 'all') {
    query.crops = { $in: [new RegExp(`^${filters.crop}$`, 'i')] };
  }
  if (filters.district && filters.district !== 'all') {
    query.districts = { $in: [new RegExp(`^${filters.district}$`, 'i')] };
  }
  if (filters.state && filters.state !== 'all') {
    query.states = { $in: [new RegExp(`^${filters.state}$`, 'i')] };
  }
  if (typeof filters.isActive === 'boolean') {
    query.isActive = filters.isActive;
  }

  return await ExpertProfile.find(query).sort({ fullName: 1 }).lean();
}
