import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FarmerPost from '@/models/FarmerPost';
import { auth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Please log in to mark posts as helpful' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const post = await FarmerPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const alreadyHelpful = post.helpfulUsers.includes(userId);

    let updatedPost;
    if (alreadyHelpful) {
      // Remove helpful
      updatedPost = await FarmerPost.findByIdAndUpdate(
        id,
        {
          $pull: { helpfulUsers: userId },
          $inc: { helpfulCount: -1 },
        },
        { new: true }
      );
    } else {
      // Add helpful
      updatedPost = await FarmerPost.findByIdAndUpdate(
        id,
        {
          $addToSet: { helpfulUsers: userId },
          $inc: { helpfulCount: 1 },
        },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      helpfulCount: Math.max(0, updatedPost.helpfulCount),
      isHelpfulByMe: !alreadyHelpful,
    });
  } catch (error: any) {
    console.error('POST /api/community/posts/[id]/helpful error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
