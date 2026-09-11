import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import dbConnect from "@/lib/mongodb";
import NotificationToken from "@/models/NotificationToken";

export async function GET() {
  try {
    const authData = await auth();
    const userId = authData.userId;

    if (!userId) {
      return NextResponse.json({ enabled: false }, { status: 401 });
    }

    await dbConnect();

    // Check if user has ANY active tokens globally
    const activeTokenExists = await NotificationToken.findOne({ 
      userId: userId,
      isActive: true 
    });

    return NextResponse.json({ enabled: !!activeTokenExists });

  } catch (error: any) {
    console.error("[FCM-API] Get Token Status Error:", error);
    return NextResponse.json(
      { enabled: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
