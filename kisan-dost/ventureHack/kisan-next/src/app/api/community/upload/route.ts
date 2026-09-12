import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size exceeds 5MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/community (or fallback to Base64 on Vercel read-only filesystem)
    let publicUrl = '';
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'community');
      await fs.mkdir(uploadsDir, { recursive: true });

      const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeFilename);

      await fs.writeFile(filePath, buffer);
      publicUrl = `/uploads/community/${safeFilename}`;
    } catch (fsError) {
      // On Vercel serverless read-only filesystem, fallback to Base64 Data URL
      const mimeType = file.type || 'image/jpeg';
      publicUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
