/**
 * audioStorage.ts
 * ============================================================================
 * Audio storage abstraction for KisanDost Phase 10 multi-modal advisory delivery.
 * Stores audio assets on disk (public/uploads/audio) and returns clean URLs.
 * Large binary blobs are never stored directly in MongoDB.
 * ============================================================================
 */

import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export interface AudioAsset {
  id: string;
  sourceNotificationId?: string;
  language: string;
  contentType: string;
  storageUrl: string;
  durationMs: number;
  byteSize: number;
  provider: 'local_disk' | 'base64_fallback';
  createdAt: string;
}

export interface SaveAudioParams {
  buffer: Buffer;
  language: string;
  contentType?: string;
  durationMs?: number;
  sourceNotificationId?: string;
  customFilename?: string;
}

/**
 * Computes a deterministic hash for an audio payload to prevent duplicate file writes.
 */
export function computeAudioHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 16);
}

/**
 * Saves synthesized audio bytes to the persistent upload directory.
 * Falls back to base64 data URI if running in a read-only environment.
 */
export async function saveAudioAsset(params: SaveAudioParams): Promise<AudioAsset> {
  const {
    buffer,
    language,
    contentType = 'audio/wav',
    durationMs = 0,
    sourceNotificationId,
    customFilename
  } = params;

  const now = new Date().toISOString();
  const fileHash = computeAudioHash(buffer);
  const ext = contentType.includes('mp3') ? '.mp3' : '.wav';
  const filename = customFilename || `tts_${language}_${fileHash}${ext}`;

  try {
    const audioUploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    await fs.mkdir(audioUploadDir, { recursive: true });

    const filePath = path.join(audioUploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return {
      id: `audio_${fileHash}`,
      sourceNotificationId,
      language,
      contentType,
      storageUrl: `/uploads/audio/${filename}`,
      durationMs,
      byteSize: buffer.length,
      provider: 'local_disk',
      createdAt: now
    };
  } catch (err) {
    // Graceful fallback for serverless or read-only file systems
    const base64Audio = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64Audio}`;

    return {
      id: `audio_${fileHash}`,
      sourceNotificationId,
      language,
      contentType,
      storageUrl: dataUrl,
      durationMs,
      byteSize: buffer.length,
      provider: 'base64_fallback',
      createdAt: now
    };
  }
}
