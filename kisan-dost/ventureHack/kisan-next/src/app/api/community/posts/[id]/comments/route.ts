import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FarmerPost from '@/models/FarmerPost';
import CommunityComment from '@/models/CommunityComment';
import { currentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const comments = await CommunityComment.find({ postId: id })
      .sort({ createdAt: 1 })
      .lean();

    const formatted = comments.map((c: any) => ({
      ...c,
      id: c._id.toString(),
    }));

    return NextResponse.json({ comments: formatted });
  } catch (error: any) {
    console.error('GET comments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content cannot be empty' },
        { status: 400 }
      );
    }

    const authorName = user?.name || user?.username || body.authorName || 'Local Farmer';
    const authorLocation = user?.district ? `${user.district}` : 'India';

    const comment = await CommunityComment.create({
      postId: post._id,
      authorId: user?._id || undefined,
      authorName,
      authorLocation,
      content: content.trim(),
      helpfulCount: 0,
    });

    // Increment comment count on post
    await FarmerPost.findByIdAndUpdate(id, {
      $inc: { commentCount: 1 },
    });

    return NextResponse.json({
      success: true,
      comment: {
        ...comment.toObject(),
        id: comment._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('POST comment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
