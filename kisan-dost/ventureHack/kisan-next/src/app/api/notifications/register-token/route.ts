import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import dbConnect from "@/lib/mongodb";
import NotificationToken from "@/models/NotificationToken";

export async function POST(req: Request) {
  try {
    const authData = await auth();
    const userId = authData.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    await dbConnect();

    // Idempotent upsert logic based on the strict token string.
    // Supports the same user enabling again on the same or multiple devices.
    await NotificationToken.findOneAndUpdate(
      { fcmToken: token }, 
      { 
        userId: userId, 
        isActive: true, 
        lastSeenAt: new Date() 
      }, 
      { upsert: true, new: true }
    );

    console.log(`[FCM-API] Successfully registered token for user: ${userId}`);

    return NextResponse.json({ success: true, message: "Token registered successfully" });

  } catch (error: any) {
    console.error("[FCM-API] Save Token Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
