import path from 'path';
import fs from 'fs/promises';

export const MAX_SCAN_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB limit
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export interface StoredImageInfo {
  url: string;
  provider: 'local_disk' | 'base64_fallback';
  byteSize: number;
  mimeType: string;
  filename?: string;
}

/**
 * Validates an image file against mime type and size constraints.
 */
export function validateImageFile(file: { type?: string; size: number }): { valid: boolean; error?: string } {
  if (!file) return { valid: false, error: 'No image file provided' };
  const mimeType = (file.type || 'image/jpeg').toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported image type: ${mimeType}. Allowed formats are JPEG, PNG, and WebP.`,
    };
  }
  if (file.size > MAX_SCAN_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image size exceeds the maximum allowed limit of 5MB.`,
    };
  }
  return { valid: true };
}

/**
 * Validates and saves an uploaded crop scan image.
 * Uses public/uploads/scans/ on persistent disks, with fallback to Base64 Data URL
 * on read-only serverless hosts. Large binaries are NOT stored in MongoDB.
 */
export async function saveScanImage(file: File | Blob & { name?: string; type?: string; size: number }): Promise<StoredImageInfo> {
  const check = validateImageFile(file);
  if (!check.valid) {
    throw new Error(check.error);
  }

  const mimeType = file.type || 'image/jpeg';

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'scans');
    await fs.mkdir(uploadsDir, { recursive: true });

    const rawName = (file as any).name || 'scan.jpg';
    const safeExt = path.extname(rawName) || (mimeType === 'image/png' ? '.png' : '.jpg');
    const safeBase = path.basename(rawName, safeExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeBase}${safeExt}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    return {
      url: `/uploads/scans/${filename}`,
      provider: 'local_disk',
      byteSize: file.size,
      mimeType,
      filename,
    };
  } catch (fsError) {
    // Graceful fallback to Data URL on read-only file systems (e.g. Vercel lambdas)
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    return {
      url: dataUrl,
      provider: 'base64_fallback',
      byteSize: file.size,
      mimeType,
    };
  }
}
