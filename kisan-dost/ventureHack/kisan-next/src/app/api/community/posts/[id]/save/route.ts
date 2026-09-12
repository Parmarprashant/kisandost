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
        { error: 'Please log in to save posts to your bookmarks' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const post = await FarmerPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const alreadySaved = (post.savedByUsers || []).includes(userId);

    if (alreadySaved) {
      await FarmerPost.findByIdAndUpdate(id, {
        $pull: { savedByUsers: userId },
      });
    } else {
      await FarmerPost.findByIdAndUpdate(id, {
        $addToSet: { savedByUsers: userId },
      });
    }

    return NextResponse.json({
      success: true,
      isSavedByMe: !alreadySaved,
      message: alreadySaved ? 'Post removed from bookmarks' : 'Post saved to bookmarks',
    });
  } catch (error: any) {
    console.error('POST /api/community/posts/[id]/save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
