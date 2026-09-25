/**
 * voiceProvider.ts
 * ============================================================================
 * Voice Notification Provider for KisanDost Phase 10.
 * Synthesizes localized agricultural speech via VEXYL-TTS microservice
 * and persists the audio asset safely.
 * ============================================================================
 */

import { synthesizeText, TtsSynthesisResult } from '../tts/vexylTtsProvider';
import { VoiceStyle, resolveTtsLanguage } from '../tts/ttsConfig';

export interface GenerateVoiceParams {
  text: string;
  language: string;
  style?: VoiceStyle;
  speaker?: string;
  sourceNotificationId?: string;
  farmerPreference?: string;
}

export interface VoiceDeliveryResult {
  success: boolean;
  audioUrl?: string;
  audioAssetId?: string;
  durationMs?: number;
  language: string;
  status: 'available' | 'unavailable' | 'cached';
  error?: string;
}

export async function generateAdvisoryVoice(
  params: GenerateVoiceParams
): Promise<VoiceDeliveryResult> {
  const { language, isFallback } = resolveTtsLanguage(params.language, params.farmerPreference);

  const synthesis = await synthesizeText({
    text: params.text,
    language,
    style: params.style,
    speaker: params.speaker,
    sourceNotificationId: params.sourceNotificationId
  });

  if (!synthesis.success || !synthesis.audioAsset) {
    return {
      success: false,
      language,
      status: 'unavailable',
      error: synthesis.error || 'VEXYL_TTS_UNAVAILABLE'
    };
  }

  return {
    success: true,
    audioUrl: synthesis.audioAsset.storageUrl,
    audioAssetId: synthesis.audioAsset.id,
    durationMs: synthesis.durationMs || synthesis.audioAsset.durationMs,
    language,
    status: synthesis.cached ? 'cached' : 'available'
  };
}
