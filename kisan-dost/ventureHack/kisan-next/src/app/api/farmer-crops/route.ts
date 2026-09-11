import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { FarmerCrop } from '@/models/FarmerCrop';
import { sendSMS } from '@/lib/sendSMS';
import { calculateDaysAfterSowing } from '@/lib/cropStage';
import { getEnhancedAdvisory } from '@/lib/weatherAdvisory';
import { sendPushNotificationToUser } from '@/lib/pushNotifications';
import { SmsLog } from '@/models/SmsLog';

// GET all crops for the logged-in user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const crops = await FarmerCrop.find({ farmerId: userId }).sort({ createdAt: -1 });

    return NextResponse.json(crops, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching farmer crops:", error);
    return NextResponse.json({ error: "Failed to fetch crops" }, { status: 500 });
  }
}

// POST a new crop
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { cropType, plantationDate, landArea, location, phoneNumber } = body;

    // Validate inputs
    if (!cropType || !plantationDate || !landArea || !location || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const newCrop = await FarmerCrop.create({
      farmerId: userId,
      cropType,
      plantationDate: new Date(plantationDate),
      landArea: Number(landArea),
      location,
      phoneNumber,
    });

    // 1. Send a welcome SMS to confirm enrollment
    try {
      const welcomeMessage = `Welcome to KisanDost SMS Advisory! You will now receive automated pesticide and fertilizer alerts for your ${landArea}-acre ${cropType} crop.`;
      await sendSMS(phoneNumber, welcomeMessage);
    } catch (smsWelcomeErr) {
      console.error("[CROP-CREATION] Welcome SMS failed:", smsWelcomeErr);
    }

    // 2. NEW: Immediate Push Pipeline for Live-Demos using Weather-Aware logic
    try {
      const daysAfterSowing = calculateDaysAfterSowing(new Date(plantationDate));
      const enhancedBlock = await getEnhancedAdvisory(newCrop, daysAfterSowing);

      if (enhancedBlock && !newCrop.initialAdvisorySent) {
        
        let smsSuccess = false;
        let pushSuccessCount = 0;

        // Broadcast SMS independent
        try {
          const smsResult = await sendSMS(phoneNumber, enhancedBlock.enriched.message);
          if (smsResult.success) {
            smsSuccess = true;
            await SmsLog.create({
              farmerCropId: newCrop._id.toString(),
              advisoryId: enhancedBlock.advisory._id.toString(),
              phoneNumber: phoneNumber,
              status: 'success',
              messageBody: enhancedBlock.enriched.message,
            });
          }
        } catch (initialSmsErr) {
          console.error("[CROP-CREATION] Initial Advisory SMS failed:", initialSmsErr);
        }

        // Broadcast NATIVE Firebase Push
        try {
           const pushResult = await sendPushNotificationToUser({
             title: enhancedBlock.enriched.title,
             body: enhancedBlock.enriched.message,
             userId: userId,
             farmerCropId: newCrop._id.toString(),
             advisoryId: enhancedBlock.advisory._id.toString(),
             data: {
                cropId: newCrop._id.toString(),
                advisoryType: 'initial_demo_alert',
                url: '/dashboard/my-crops'
             }
           });
           if (pushResult.success) {
              pushSuccessCount = pushResult.delivered || 0;
           }
        } catch (initialPushErr) {
          console.error("[CROP-CREATION] Initial Advisory Push failed:", initialPushErr);
        }

        // Deduplicate
        if (smsSuccess || pushSuccessCount > 0) {
          await FarmerCrop.findByIdAndUpdate(newCrop._id, {
            lastAdvisorySent: enhancedBlock.advisory.stageName,
            initialAdvisorySent: true
          });
        }
      }
    } catch (advisoryErr) {
      console.error("[CROP-CREATION] Immediate Advisory pipeline failed:", advisoryErr);
    }

    return NextResponse.json(newCrop, { status: 201 });
  } catch (error: any) {
    console.error("Error creating farmer crop:", error);
    return NextResponse.json({ error: "Failed to save crop data" }, { status: 500 });
  }
}
