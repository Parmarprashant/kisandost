import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { LocalizedNotification } from '@/models/LocalizedNotification';

export async function GET(req: Request) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const channel = searchParams.get('channel');
    const language = searchParams.get('language');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    const query: any = {};

    // ── Strict Role & Tenant Isolation ──────────────────────────────────────
    if (user.role === 'farmer') {
      query.farmerId = authData.userId;
    } else {
      const targetFarmer = searchParams.get('farmerId');
      if (targetFarmer) {
        query.farmerId = targetFarmer;
      }
    }

    if (channel && channel !== 'all') {
      query.channel = channel.toUpperCase();
    }
    if (language && language !== 'all') {
      query.language = language;
    }

    const total = await LocalizedNotification.countDocuments(query);
    const notifications = await LocalizedNotification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      total,
      limit,
      skip,
      notifications
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
