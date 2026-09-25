import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { AgriAdvisory, IAgriAdvisory } from '@/models/AgriAdvisory';
import { RiskEvent, IRiskEvent } from '@/models/RiskEvent';
import { AgriNotification, AgriNotificationType, DeliveryStatus } from '@/models/AgriNotification';
import { sendPushNotificationToUser } from '@/lib/pushNotifications';

export interface DispatchNotificationResult {
  sent: boolean;
  skipped: boolean;
  deliveryStatus: DeliveryStatus;
  reason?: string;
  notificationId?: string;
}

/**
 * Dispatches event-driven, deduplicated push notifications for AgriShield 360° advisories.
 *
 * NON-FATAL TRANSPORT: If Firebase is not configured or throws, the error is caught,
 * logged, and stored as UNAVAILABLE. Advisory creation is never blocked or rolled back.
 */
export async function dispatchAdvisoryNotification(
  advisory: IAgriAdvisory,
  riskEvent: IRiskEvent
): Promise<DispatchNotificationResult> {
  await connectDB();

  const farmerId = advisory.farmerId;
  const riskStatus = advisory.riskStatus;

  // 1. Notification Policy: STABLE / LOW risk never triggers push notifications (Section 21)
  if (['STABLE', 'LOW', 'NO_CONCERN'].includes(riskStatus)) {
    return {
      sent: false,
      skipped: true,
      deliveryStatus: 'SKIPPED',
      reason: 'Push notifications are suppressed for STABLE or LOW risk conditions.',
    };
  }

  // 2. Determine Notification Type
  let notificationType: AgriNotificationType = 'ATTENTION_ALERT';
  let title = `AgriShield Alert: ${advisory.threatName}`;
  let body = advisory.advisoryHeadline;

  switch (riskStatus) {
    case 'HIGH_RISK':
      notificationType = 'HIGH_RISK_ALERT';
      title = `🚨 High Risk Alert: ${advisory.threatName}`;
      body = `${advisory.advisoryHeadline}. Check recommended actions immediately.`;
      break;

    case 'ATTENTION':
    case 'MODERATE':
      notificationType = 'ATTENTION_ALERT';
      title = `⚠️ Monitoring Alert: ${advisory.threatName}`;
      body = `${advisory.advisoryHeadline}. Preventive actions recommended.`;
      break;

    case 'INCONCLUSIVE':
      notificationType = 'INCONCLUSIVE_RESCAN';
      title = `🔍 Rescan Requested: ${advisory.threatName}`;
      body = 'Diagnostic scan was ambiguous. Please capture supplementary close-up views.';
      break;

    case 'INSUFFICIENT_DATA':
      notificationType = 'INSUFFICIENT_DATA_REQUEST';
      title = `📋 Observation Needed: ${advisory.threatName}`;
      body = 'Additional field readings needed to complete your crop risk evaluation.';
      break;
  }

  // 3. Deduplication Check
  const dedupKey = `${farmerId}_${riskEvent._id}_${notificationType}`;
  const existingNotification = await AgriNotification.findOne({ dedupKey });
  if (existingNotification) {
    return {
      sent: false,
      skipped: true,
      deliveryStatus: 'SKIPPED',
      reason: 'Notification already sent for this specific risk event (deduplicated).',
      notificationId: existingNotification._id.toString(),
    };
  }

  // 4. Non-Fatal Push Dispatch via Firebase
  let deliveryStatus: DeliveryStatus = 'UNAVAILABLE';
  let failureReason: string | null = null;
  let deliveredCount = 0;

  try {
    const pushResult = await sendPushNotificationToUser({
      title,
      body,
      userId: farmerId,
      farmerCropId: advisory.cropCycleId.toString(),
      advisoryId: advisory._id.toString(),
      data: {
        advisoryId: advisory._id.toString(),
        cropCycleId: advisory.cropCycleId.toString(),
        riskStatus: advisory.riskStatus,
        url: `/crops/${advisory.cropCycleId}`,
      },
    });

    if (pushResult.success && pushResult.delivered && pushResult.delivered > 0) {
      deliveryStatus = 'SENT';
      deliveredCount = pushResult.delivered;
    } else {
      deliveryStatus = 'UNAVAILABLE';
      failureReason = pushResult.reason || 'No active device tokens found for farmer';
    }
  } catch (pushErr: any) {
    // Non-fatal safety catch: Do NOT let Firebase transport failures bubble up
    console.warn('[AgriShieldNotifier] Firebase push delivery failed gracefully:', pushErr.message);
    deliveryStatus = 'UNAVAILABLE';
    failureReason = pushErr.message;
  }

  // 5. Persist Notification Record
  const notificationRecord = await AgriNotification.create({
    farmerId,
    cropCycleId: advisory.cropCycleId,
    advisoryId: advisory._id,
    riskEventId: riskEvent._id,
    notificationType,
    dedupKey,
    title,
    body,
    deliveryStatus,
    failureReason,
    deliveredTokenCount: deliveredCount,
  });

  return {
    sent: deliveryStatus === 'SENT',
    skipped: false,
    deliveryStatus,
    reason: failureReason || undefined,
    notificationId: notificationRecord._id.toString(),
  };
}
