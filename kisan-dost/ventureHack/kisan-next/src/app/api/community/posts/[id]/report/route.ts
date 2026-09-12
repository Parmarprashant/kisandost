import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FarmerPost from '@/models/FarmerPost';
import CommunityReport from '@/models/CommunityReport';
import { currentUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const user = await currentUser();

    const { id } = await params;
    const post = await FarmerPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await req.json();
    const { reason, details } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'Please select a reason for reporting' },
        { status: 400 }
      );
    }

    await CommunityReport.create({
      postId: post._id,
      reportedBy: user?._id || undefined,
      reporterName: user?.name || user?.username || 'Community Member',
      reason,
      details: details || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Report received. Our moderation team will review this post.',
    });
  } catch (error: any) {
    console.error('POST /api/community/posts/[id]/report error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
