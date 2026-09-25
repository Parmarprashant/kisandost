import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { isSupportedIndicLanguage } from '@/lib/tts/ttsConfig';

export async function GET() {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(authData.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      preferredLanguage: user.preferredLanguage || 'hi-IN',
      notificationChannels: user.notificationChannels || ['FCM', 'WHATSAPP'],
      whatsappNumber: user.whatsappNumber || user.mobile || null,
      smsNumber: user.smsNumber || user.mobile || null,
      voiceEnabled: user.voiceEnabled ?? true
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { preferredLanguage, notificationChannels, whatsappNumber, smsNumber, voiceEnabled } = body;

    await connectDB();
    const user = await User.findById(authData.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (preferredLanguage) {
      if (!isSupportedIndicLanguage(preferredLanguage)) {
        return NextResponse.json(
          { error: `Invalid language code. Supported: hi-IN, gu-IN, mr-IN` },
          { status: 400 }
        );
      }
      user.preferredLanguage = preferredLanguage;
    }

    if (Array.isArray(notificationChannels)) {
      const allowedChannels = ['FCM', 'WHATSAPP', 'SMS', 'VOICE'];
      user.notificationChannels = notificationChannels.filter(c => allowedChannels.includes(c));
    }

    if (whatsappNumber !== undefined) {
      user.whatsappNumber = whatsappNumber ? String(whatsappNumber).trim() : null;
    }

    if (smsNumber !== undefined) {
      user.smsNumber = smsNumber ? String(smsNumber).trim() : null;
    }

    if (typeof voiceEnabled === 'boolean') {
      user.voiceEnabled = voiceEnabled;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      preferences: {
        preferredLanguage: user.preferredLanguage,
        notificationChannels: user.notificationChannels,
        whatsappNumber: user.whatsappNumber,
        smsNumber: user.smsNumber,
        voiceEnabled: user.voiceEnabled
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
