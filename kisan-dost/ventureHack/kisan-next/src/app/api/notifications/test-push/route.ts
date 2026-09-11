import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import { sendPushNotificationToUser } from "@/lib/pushNotifications";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const authData = await auth();
    const userId = authData.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Send a test broadcast
    const pushResult = await sendPushNotificationToUser({
      title: "KisanDost Platform",
      body: "This is a test advisory notification verifying your FCM pipeline.",
      userId: userId,
      data: {
        test: "true",
        url: "/dashboard/my-crops"
      }
    });

    return NextResponse.json({ 
      success: true, 
      delivered: pushResult.delivered,
      failed: pushResult.failed,
      reason: pushResult.reason
    });

  } catch (error: any) {
    console.error("[TEST-PUSH] Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
