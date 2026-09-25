/**
 * fcmProvider.ts
 * ============================================================================
 * FCM Push Notification Provider wrapper for KisanDost Phase 10.
 * Reuses the existing Firebase Admin push infrastructure without creating duplicate integrations.
 * ============================================================================
 */

import { sendPushNotificationToUser } from '../pushNotifications';

export interface SendFcmParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  advisoryId?: string;
  farmerCropId?: string;
}

export interface FcmDeliveryResult {
  success: boolean;
  deliveredCount: number;
  reason?: string;
}

export async function sendFcm(params: SendFcmParams): Promise<FcmDeliveryResult> {
  try {
    const result = await sendPushNotificationToUser({
      userId: params.userId,
      title: params.title,
      body: params.body,
      data: params.data,
      advisoryId: params.advisoryId,
      farmerCropId: params.farmerCropId
    });

    return {
      success: !!result.success,
      deliveredCount: (result as any).delivered || ((result as any).success ? 1 : 0),
      reason: (result as any).reason
    };
  } catch (err: any) {
    console.error('[FcmProvider] Push delivery error:', err.message);
    return {
      success: false,
      deliveredCount: 0,
      reason: err.message
    };
  }
}
