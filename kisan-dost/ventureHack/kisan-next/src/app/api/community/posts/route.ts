import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FarmerPost from '@/models/FarmerPost';
import { auth, currentUser } from '@/lib/auth';
import { SEED_POSTS } from '../seed/route';

export const dynamic = 'force-dynamic';

/**
 * Keep only usable image URLs. Older records and partial uploads can leave
 * blank or null entries behind, which would otherwise render as empty tiles.
 */
function sanitizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images.filter(
    (img): img is string => typeof img === 'string' && img.trim() !== ''
  );
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Auto-seed if database is currently empty
    const totalCount = await FarmerPost.countDocuments();
    if (totalCount === 0) {
      try {
        await FarmerPost.insertMany(SEED_POSTS);
      } catch (seedErr) {
        console.warn('Auto-seed error:', seedErr);
      }
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const crop = searchParams.get('crop')?.trim() || '';
    const postType = searchParams.get('postType')?.trim() || '';
    const cropStage = searchParams.get('cropStage')?.trim() || '';
    const state = searchParams.get('state')?.trim() || '';
    const savedOnly = searchParams.get('saved') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (postType && postType !== 'All') {
      query.postType = postType;
    }

    if (crop && crop !== 'All') {
      query.crop = { $regex: new RegExp(`^${crop}$`, 'i') };
    }

    if (cropStage && cropStage !== 'All') {
      query.cropStage = cropStage;
    }

    if (state && state !== 'All') {
      query['location.state'] = { $regex: new RegExp(state, 'i') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { problem: { $regex: search, $options: 'i' } },
        { whatIDid: { $regex: search, $options: 'i' } },
        { crop: { $regex: search, $options: 'i' } },
        { symptoms: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    if (savedOnly) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
      }
      query.savedByUsers = userId;
    }

    const [posts, total] = await Promise.all([
      FarmerPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FarmerPost.countDocuments(query),
    ]);

    // Check current user's interaction state
    const { userId } = await auth();

    const formattedPosts = posts.map((post: any) => ({
      ...post,
      id: post._id.toString(),
      images: sanitizeImages(post.images),
      isHelpfulByMe: userId ? (post.helpfulUsers || []).includes(userId) : false,
      isSavedByMe: userId ? (post.savedByUsers || []).includes(userId) : false,
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('GET /api/community/posts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await currentUser();

    const body = await req.json();
    const {
      postType,
      crop,
      cropStage,
      location,
      title,
      problem,
      symptoms,
      whatIDid,
      result,
      precautions,
      images,
    } = body;

    if (!title || !crop || !problem) {
      return NextResponse.json(
        { error: 'Title, crop, and problem description are required' },
        { status: 400 }
      );
    }

    const authorName = user?.name || user?.username || body.authorName || 'Local Farmer';
    const authorId = user?._id || undefined;

    const state = location?.state || user?.district || 'Gujarat';
    const district = location?.district || user?.village || 'Local District';

    const newPost = await FarmerPost.create({
      authorId,
      authorName,
      postType: postType || 'Farmer Experience',
      crop,
      cropStage: cropStage || 'Vegetative',
      location: {
        state,
        district,
      },
      title,
      problem,
      symptoms: Array.isArray(symptoms) ? symptoms : symptoms ? [symptoms] : [],
      whatIDid: whatIDid || '',
      result: result || '',
      precautions: precautions || '',
      images: sanitizeImages(images),
      helpfulCount: 0,
      helpfulUsers: [],
      savedByUsers: [],
      commentCount: 0,
    });

    return NextResponse.json({
      success: true,
      post: {
        ...newPost.toObject(),
        id: newPost._id.toString(),
        isHelpfulByMe: false,
        isSavedByMe: false,
      },
    });
  } catch (error: any) {
    console.error('POST /api/community/posts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
