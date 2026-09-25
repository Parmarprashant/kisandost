import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateAdvisoryVoice } from '@/lib/notifications/voiceProvider';
import { isSupportedIndicLanguage, VoiceStyle, TTS_SETTINGS } from '@/lib/tts/ttsConfig';

// Simple in-memory sliding-window rate limiter per user (e.g. max 15 voice requests / minute)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    // Rate limit check
    if (!checkRateLimit(authData.userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded: Too many voice synthesis requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { text, language, style = 'CALM', speaker, sourceNotificationId } = body;

    // 2. Validate text
    const cleanText = (text || '').trim();
    if (!cleanText) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
    }

    if (cleanText.length > TTS_SETTINGS.maxTextLength) {
      return NextResponse.json(
        { error: `Text length (${cleanText.length}) exceeds maximum allowable limit (${TTS_SETTINGS.maxTextLength} characters)` },
        { status: 400 }
      );
    }

    // 3. Validate language
    if (!isSupportedIndicLanguage(language)) {
      return NextResponse.json(
        { error: `Unsupported language: '${language}'. Supported: hi-IN, gu-IN, mr-IN` },
        { status: 400 }
      );
    }

    // 4. Generate Voice via VEXYL-TTS
    const result = await generateAdvisoryVoice({
      text: cleanText,
      language,
      style: style as VoiceStyle,
      speaker,
      sourceNotificationId
    });

    if (!result.success) {
      // Non-fatal response: voice status = UNAVAILABLE
      return NextResponse.json({
        success: false,
        status: 'UNAVAILABLE',
        error: result.error || 'TTS service temporarily unavailable',
        language
      }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      audioUrl: result.audioUrl,
      audioAssetId: result.audioAssetId,
      durationMs: result.durationMs,
      language: result.language
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
