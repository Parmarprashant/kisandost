/**
 * vexylTtsProvider.ts
 * ============================================================================
 * Backend VEXYL-TTS Client Provider with In-Memory Caching & Non-Fatal Fallback.
 * Connects Next.js to self-hosted VEXYL-TTS Indic speech microservice.
 * ============================================================================
 */

import crypto from 'crypto';
import {
  IndicLanguageCode,
  VoiceStyle,
  SUPPORTED_INDIC_LANGUAGES,
  DEFAULT_TTS_LANGUAGE,
  TTS_SETTINGS,
  isSupportedIndicLanguage
} from './ttsConfig';
import { saveAudioAsset, AudioAsset } from '../audioStorage';

export interface SynthesizeTextParams {
  text: string;
  language: string;
  style?: VoiceStyle;
  speaker?: string;
  sourceNotificationId?: string;
  useCache?: boolean;
}

export interface TtsSynthesisResult {
  success: boolean;
  audioBuffer?: Buffer;
  audioAsset?: AudioAsset;
  contentType?: string;
  durationMs?: number;
  language?: string;
  provider?: string;
  cached?: boolean;
  error?: string;
}

interface CacheRecord {
  audioBuffer: Buffer;
  audioAsset: AudioAsset;
  contentType: string;
  durationMs: number;
  createdAt: number;
}

// In-memory bounded cache for repeated advisories
const localCache = new Map<string, CacheRecord>();
const MAX_CACHE_RECORDS = TTS_SETTINGS.maxCacheEntries;

/**
 * Normalizes text and parameters into a unique deterministic cache key.
 */
export function computeTtsCacheKey(
  text: string,
  language: string,
  style: string,
  speaker: string
): string {
  const normalizedText = text.trim().replace(/\s+/g, ' ').toLowerCase();
  const rawKey = `${normalizedText}|${language}|${style.toUpperCase()}|${speaker}`;
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Evicts oldest items if cache capacity is exceeded.
 */
function pruneCacheIfNeeded(): void {
  if (localCache.size >= MAX_CACHE_RECORDS) {
    const oldestKey = localCache.keys().next().value;
    if (oldestKey) {
      localCache.delete(oldestKey);
    }
  }
}

/**
 * Synthesizes text into Indic speech audio via VEXYL-TTS microservice.
 * Adheres strictly to non-fatal failure rules: if service is unreachable,
 * it returns success: false with error details, without crashing caller.
 */
export async function synthesizeText(
  params: SynthesizeTextParams
): Promise<TtsSynthesisResult> {
  const {
    text,
    language: requestedLang,
    style = TTS_SETTINGS.defaultStyle,
    speaker: customSpeaker,
    sourceNotificationId,
    useCache = TTS_SETTINGS.cacheEnabled
  } = params;

  // 1. Text input validation
  const cleanText = (text || '').trim();
  if (!cleanText) {
    return {
      success: false,
      error: 'Text payload cannot be empty',
      provider: 'vexyl-tts'
    };
  }

  if (cleanText.length > TTS_SETTINGS.maxTextLength) {
    return {
      success: false,
      error: `Text length (${cleanText.length}) exceeds maximum allowable limit (${TTS_SETTINGS.maxTextLength})`,
      provider: 'vexyl-tts'
    };
  }

  // 2. Language validation & controlled fallback
  let language: IndicLanguageCode = DEFAULT_TTS_LANGUAGE;
  if (isSupportedIndicLanguage(requestedLang)) {
    language = requestedLang;
  } else {
    // Controlled fallback to hi-IN
    language = DEFAULT_TTS_LANGUAGE;
  }

  const langConfig = SUPPORTED_INDIC_LANGUAGES[language];
  const speaker = customSpeaker || (style === 'FORMAL' ? langConfig.formalSpeaker : langConfig.defaultSpeaker);

  // 3. Cache lookup
  const cacheKey = computeTtsCacheKey(cleanText, language, style, speaker);
  if (useCache && localCache.has(cacheKey)) {
    const cached = localCache.get(cacheKey)!;
    return {
      success: true,
      audioBuffer: cached.audioBuffer,
      audioAsset: cached.audioAsset,
      contentType: cached.contentType,
      durationMs: cached.durationMs,
      language,
      provider: 'vexyl-tts',
      cached: true
    };
  }

  // 4. Dispatch request to VEXYL-TTS microservice
  const serviceEndpoint = `${TTS_SETTINGS.serviceUrl.replace(/\/+$/, '')}/synthesize`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TTS_SETTINGS.timeoutMs);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (TTS_SETTINGS.apiKey) {
      headers['X-API-Key'] = TTS_SETTINGS.apiKey;
    }

    const payload = {
      text: cleanText,
      lang: language,
      style,
      speaker
    };

    const response = await fetch(serviceEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        success: false,
        error: `VEXYL-TTS returned HTTP ${response.status}: ${errText.substring(0, 120)}`,
        provider: 'vexyl-tts'
      };
    }

    const data = await response.json();
    if (!data.success || !data.audio_base64) {
      return {
        success: false,
        error: data.error || 'VEXYL-TTS returned invalid or empty audio payload',
        provider: 'vexyl-tts'
      };
    }

    const audioBuffer = Buffer.from(data.audio_base64, 'base64');
    const contentType = data.content_type || 'audio/wav';
    const durationMs = Number(data.duration_ms) || 1000;

    // 5. Persist to storage abstraction
    const audioAsset = await saveAudioAsset({
      buffer: audioBuffer,
      language,
      contentType,
      durationMs,
      sourceNotificationId
    });

    // 6. Cache entry
    if (useCache) {
      pruneCacheIfNeeded();
      localCache.set(cacheKey, {
        audioBuffer,
        audioAsset,
        contentType,
        durationMs,
        createdAt: Date.now()
      });
    }

    return {
      success: true,
      audioBuffer,
      audioAsset,
      contentType,
      durationMs,
      language,
      provider: 'vexyl-tts',
      cached: false
    };
  } catch (netErr: any) {
    // Non-fatal error handling: log warning and return safe structured failure
    const isAbort = netErr.name === 'AbortError';
    const errMsg = isAbort
      ? `VEXYL-TTS request timed out after ${TTS_SETTINGS.timeoutMs}ms`
      : `VEXYL-TTS service unavailable (${netErr.message || 'connection failed'})`;

    return {
      success: false,
      error: errMsg,
      provider: 'vexyl-tts'
    };
  }
}

/**
 * Clears the in-memory TTS cache (useful for testing).
 */
export function clearTtsCache(): void {
  localCache.clear();
}
