/**
 * ttsConfig.ts
 * ============================================================================
 * Configuration and Language Mappings for VEXYL-TTS Indic Voice Integration.
 * Strictly adheres to Phase 10 safety guidelines:
 * - hi-IN (Hindi), gu-IN (Gujarati), mr-IN (Marathi) only.
 * - Explicit fallback hierarchy (Farmer preference -> Application default -> hi-IN).
 * - No Google Cloud TTS SDK or credentials.
 * ============================================================================
 */

export type IndicLanguageCode = 'hi-IN' | 'gu-IN' | 'mr-IN';

export type VoiceStyle = 'CALM' | 'FORMAL' | 'URGENT';

export interface LanguageVoiceConfig {
  code: IndicLanguageCode;
  label: string;
  nativeLabel: string;
  defaultSpeaker: string;
  formalSpeaker: string;
  styleDescriptions: Record<VoiceStyle, string>;
}

export const SUPPORTED_INDIC_LANGUAGES: Record<IndicLanguageCode, LanguageVoiceConfig> = {
  'hi-IN': {
    code: 'hi-IN',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    defaultSpeaker: 'Divya',
    formalSpeaker: 'Rohit',
    styleDescriptions: {
      CALM: 'Divya speaks in a calm, clear, and instructional tone with moderate speed and no background noise.',
      FORMAL: 'Rohit speaks in a formal, neutral tone with precise agricultural diction and moderate speed.',
      URGENT: 'Divya speaks in an urgent, high-attention alert tone with crisp diction.'
    }
  },
  'gu-IN': {
    code: 'gu-IN',
    label: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
    defaultSpeaker: 'Neha',
    formalSpeaker: 'Yash',
    styleDescriptions: {
      CALM: 'Neha speaks in a calm, clear, and instructional tone with moderate speed and no background noise.',
      FORMAL: 'Yash speaks in a formal, neutral tone with precise agricultural diction and moderate speed.',
      URGENT: 'Neha speaks in an urgent, high-attention alert tone with crisp diction.'
    }
  },
  'mr-IN': {
    code: 'mr-IN',
    label: 'Marathi',
    nativeLabel: 'मराठी',
    defaultSpeaker: 'Sunita',
    formalSpeaker: 'Sanjay',
    styleDescriptions: {
      CALM: 'Sunita speaks in a calm, clear, and instructional tone with moderate speed and no background noise.',
      FORMAL: 'Sanjay speaks in a formal, neutral tone with precise agricultural diction and moderate speed.',
      URGENT: 'Sunita speaks in an urgent, high-attention alert tone with crisp diction.'
    }
  }
};

export const DEFAULT_TTS_LANGUAGE: IndicLanguageCode = 'hi-IN';

export const TTS_SETTINGS = {
  serviceUrl: process.env.VEXYL_TTS_URL || 'http://127.0.0.1:8092',
  apiKey: process.env.VEXYL_TTS_API_KEY || '',
  timeoutMs: 12000,
  maxTextLength: 4000,
  cacheEnabled: true,
  maxCacheEntries: 500,
  defaultStyle: 'CALM' as VoiceStyle
};

/**
 * Validates if the given string is a supported Indic TTS language code.
 */
export function isSupportedIndicLanguage(code: string): code is IndicLanguageCode {
  return Object.prototype.hasOwnProperty.call(SUPPORTED_INDIC_LANGUAGES, code);
}

/**
 * Resolves the appropriate language following the controlled fallback order:
 * 1. Farmer preferred language (if valid Indic language)
 * 2. Application default / requested language (if valid)
 * 3. hi-IN (default Indic fallback)
 * Never silently substitutes English.
 */
export function resolveTtsLanguage(
  requestedLanguage?: string,
  farmerPreference?: string
): { language: IndicLanguageCode; isFallback: boolean; originalRequested?: string } {
  if (farmerPreference && isSupportedIndicLanguage(farmerPreference)) {
    return { language: farmerPreference, isFallback: false };
  }

  if (requestedLanguage && isSupportedIndicLanguage(requestedLanguage)) {
    return { language: requestedLanguage, isFallback: false };
  }

  return {
    language: DEFAULT_TTS_LANGUAGE,
    isFallback: true,
    originalRequested: requestedLanguage || farmerPreference
  };
}
