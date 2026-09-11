import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { FarmerCrop } from '@/models/FarmerCrop';
import { SmsLog } from '@/models/SmsLog';
import { sendSMS } from '@/lib/sendSMS';
import { calculateDaysAfterSowing } from '@/lib/cropStage';
import { sendPushNotificationToUser } from '@/lib/pushNotifications';
import { getEnhancedAdvisory } from '@/lib/weatherAdvisory';

export async function GET(req: Request) {
  try {
    await connectDB();

    console.log('[CRON] Starting daily crop advisory processing at 6 AM...');
    const crops = await FarmerCrop.find({});
    let smsSentCount = 0;
    
    for (const crop of crops) {
      const daysAfterSowing = calculateDaysAfterSowing(crop.plantationDate);

      // Find matching enhanced advisory with dynamic weather
      const enhancedBlock = await getEnhancedAdvisory(crop, daysAfterSowing);

      if (!enhancedBlock) continue;

      const advisory = enhancedBlock.advisory;
      const message = enhancedBlock.enriched.message;

      // Prevent duplicate alerts in same stage
      if (crop.lastAdvisorySent === advisory.stageName) {
        continue;
      }
        
      // Independent Trackers
      let smsSuccess = false;
      let pushDeliveredCount = 0;

      // ========================
      // 1. SMS PIPELINE
      // ========================
      try {
        const smsResult = await sendSMS(crop.phoneNumber, message);
        if (smsResult.success) {
          smsSuccess = true;
          smsSentCount++;
          await SmsLog.create({
            farmerCropId: crop._id.toString(),
            advisoryId: advisory._id.toString(),
            phoneNumber: crop.phoneNumber,
            status: 'success',
            messageBody: message,
          });
        } else {
          await SmsLog.create({
            farmerCropId: crop._id.toString(),
            advisoryId: advisory._id.toString(),
            phoneNumber: crop.phoneNumber,
            status: 'failed',
            messageBody: message,
          });
        }
      } catch (smsErr) {
        console.error(`[CRON] SMS failed for crop ${crop._id}:`, smsErr);
      }

      // ========================
      // 2. FCM PUSH PIPELINE 
      // ========================
      try {
        // Only run if the farmerCrop is tied back to a user (farmerId)
        if (crop.farmerId) {
           const pushResult = await sendPushNotificationToUser({
             title: enhancedBlock.enriched.title,
             body: message,
             userId: crop.farmerId,
             farmerCropId: crop._id.toString(),
             advisoryId: advisory._id.toString(),
             data: {
                cropId: crop._id.toString(),
                advisoryType: 'weather_aware_alert',
                url: '/dashboard/my-crops'
             }
           });
           
           if (pushResult.success) {
             pushDeliveredCount = pushResult.delivered || 0;
           }
        }
      } catch (pushErr) {
        console.error(`[CRON] Push failed for crop ${crop._id}:`, pushErr);
      }

      // ========================
      // 3. DEDUPLICATION
      // ========================
      // Only advance the deduplication cursor if AT LEAST ONE pipeline natively triggered or passed successfully
      // to ensure total isolation blockages don't cause infinite re-loops.
      if (smsSuccess || pushDeliveredCount > 0) {
        await FarmerCrop.findByIdAndUpdate(crop._id, {
          lastAdvisorySent: advisory.stageName
        });
      }
    }

    console.log(`[CRON] Complete. Dispatched ${smsSentCount} advisories.`);
    return NextResponse.json({ 
      success: true, 
      smsSent: smsSentCount 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[CRON] Fatal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
