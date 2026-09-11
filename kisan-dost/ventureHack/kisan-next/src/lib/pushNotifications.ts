import { admin } from './firebaseAdmin';
import NotificationToken from '@/models/NotificationToken';
import { PushLog } from '@/models/PushLog';

interface PushOptions {
  title: string;
  body: string;
  data?: Record<string, string>;
  userId: string;
  farmerCropId?: string;
  advisoryId?: string;
}

export async function sendPushNotificationToUser(options: PushOptions) {
  const { title, body, data, userId, farmerCropId, advisoryId } = options;

  if (!admin) {
    console.warn('[PushNotifications] Firebase Admin uninitialized, skipping push.');
    return { success: false, reason: 'Firebase Admin not configured' };
  }

  try {
    // 1. Fetch valid tokens
    console.log(`[PushNotifications] Starting push payload for user: ${userId}`);
    const tokens = await NotificationToken.find({ userId, isActive: true });
    
    if (tokens.length === 0) {
      console.log(`[PushNotifications] HALT: No active FC tokens found for user ${userId}`);
      return { success: true, delivered: 0, reason: 'No active device tokens found for user' };
    }

    const deviceTokens = tokens.map(t => t.fcmToken);
    console.log(`[PushNotifications] Fetched ${deviceTokens.length} active tokens for user: ${userId}`);

    // 2. Prepare Payload
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens: deviceTokens,
    };

    // 3. Send Multi-cast
    console.log(`[PushNotifications] Dispatching payload:`, JSON.stringify(message, null, 2));
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`[PushNotifications] Firebase Admin Response -> Success: ${response.successCount}, Failed: ${response.failureCount}`);
    
    // 4. Safely cleanup dead tokens
    const failedTokens: string[] = [];
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          console.error(`[PushNotifications] Send failed for token ${deviceTokens[idx]}. Firebase Error Code: ${errorCode}`);
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            failedTokens.push(deviceTokens[idx]);
          }
        }
      });

      if (failedTokens.length > 0) {
        await NotificationToken.updateMany(
          { fcmToken: { $in: failedTokens } },
          { $set: { isActive: false } }
        );
        console.log(`[PushNotifications] Marked ${failedTokens.length} dead tokens inactive for user ${userId}.`);
      }
    }

    // 5. Append independent logs
    if (farmerCropId && advisoryId) {
      for (const token of deviceTokens) {
        const isFailed = failedTokens.includes(token);
        await PushLog.create({
          farmerCropId,
          advisoryId,
          userId,
          fcmToken: token,
          status: isFailed ? 'failed' : 'success',
          messageBody: body,
          errorDetail: isFailed ? 'Invalid Token' : undefined,
        });
      }
    }

    return { 
      success: true, 
      delivered: response.successCount, 
      failed: response.failureCount 
    };

  } catch (error: any) {
    console.error('[PushNotifications] Fatal Multi-cast Error:', error);
    return { success: false, reason: error.message };
  }
}
