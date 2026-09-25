/**
 * terminology.ts
 * ============================================================================
 * Canonical Multilingual Agricultural Terminology Dictionary for KisanDost.
 * Covers hi-IN, gu-IN, mr-IN without LLM hallucinations.
 * ============================================================================
 */

import { IndicLanguageCode } from '../tts/ttsConfig';

export interface TermTranslation {
  'hi-IN': string;
  'gu-IN': string;
  'mr-IN': string;
}

export const CROP_DICTIONARY: Record<string, TermTranslation> = {
  wheat: {
    'hi-IN': 'गेहूं',
    'gu-IN': 'ઘઉં',
    'mr-IN': 'गहू'
  },
  rice: {
    'hi-IN': 'धान',
    'gu-IN': 'ડાંગર',
    'mr-IN': 'भात'
  },
  paddy: {
    'hi-IN': 'धान',
    'gu-IN': 'ડાંગર',
    'mr-IN': 'भात'
  },
  cotton: {
    'hi-IN': 'कपास',
    'gu-IN': 'કપાસ',
    'mr-IN': 'कापूस'
  },
  maize: {
    'hi-IN': 'मक्का',
    'gu-IN': 'મકાઈ',
    'mr-IN': 'मका'
  },
  mustard: {
    'hi-IN': 'सरसों',
    'gu-IN': 'રાઈ / સરસવ',
    'mr-IN': 'मोहरी'
  },
  chickpea: {
    'hi-IN': 'चना',
    'gu-IN': 'ચણા',
    'mr-IN': 'हरभरा'
  },
  soybean: {
    'hi-IN': 'सोयाबीन',
    'gu-IN': 'સોયાબીન',
    'mr-IN': 'सोयाबीन'
  },
  sugarcane: {
    'hi-IN': 'गन्ना',
    'gu-IN': 'શેરડી',
    'mr-IN': 'ऊस'
  },
  tomato: {
    'hi-IN': 'टमाटर',
    'gu-IN': 'ટામેટા',
    'mr-IN': 'टोमॅटो'
  },
  potato: {
    'hi-IN': 'आलू',
    'gu-IN': 'બટાટા',
    'mr-IN': 'बटाटा'
  },
  onion: {
    'hi-IN': 'प्याज',
    'gu-IN': 'ડુંગળી',
    'mr-IN': 'कांदा'
  },
  groundnut: {
    'hi-IN': 'मूंगफली',
    'gu-IN': 'મગફળી',
    'mr-IN': 'भुईमूग'
  }
};

export const THREAT_DICTIONARY: Record<string, TermTranslation> = {
  'powdery mildew': {
    'hi-IN': 'पाउडरी मिल्ड्यू (चूर्णी फफूंद)',
    'gu-IN': 'પાવડરી માઇલ્ડ્યુ (છારો)',
    'mr-IN': 'भुरी रोग'
  },
  'leaf blast': {
    'hi-IN': 'झुलसा रोग (लीफ ब्लास्ट)',
    'gu-IN': 'પાનનો કરપો (બ્લાસ્ટ)',
    'mr-IN': 'करपा रोग'
  },
  'blast': {
    'hi-IN': 'झुलसा रोग',
    'gu-IN': 'કરપો રોગ',
    'mr-IN': 'करपा रोग'
  },
  'bacterial blight': {
    'hi-IN': 'जीवाणु झुलसा (बैक्टीरियल ब्लाइट)',
    'gu-IN': 'બેક્ટેરિયલ બ્લાઈટ',
    'mr-IN': 'जिवाणूजन्य करपा'
  },
  'rust': {
    'hi-IN': 'गेरुआ / रतुआ (रस्ट)',
    'gu-IN': 'ગેરુ રોગ',
    'mr-IN': 'तांबेरा रोग'
  },
  'yellow rust': {
    'hi-IN': 'पीला रतुआ',
    'gu-IN': 'પીળો ગેરુ',
    'mr-IN': 'पिवळा तांबेरा'
  },
  'brown rust': {
    'hi-IN': 'भूरा रतुआ',
    'gu-IN': 'કથ્થઈ ગેરુ',
    'mr-IN': 'तांबडा तांबेरा'
  },
  'wilt': {
    'hi-IN': 'उकठा रोग (विल्ट)',
    'gu-IN': 'સુકારો',
    'mr-IN': 'मर रोग'
  },
  'aphids': {
    'hi-IN': 'माहू / चेपा (एफिड्स)',
    'gu-IN': 'મોલો મશી (એફિડ્સ)',
    'mr-IN': 'मावा कीड'
  },
  'whitefly': {
    'hi-IN': 'सफेद मक्खी',
    'gu-IN': 'સફેદ માખી',
    'mr-IN': 'पांढरी माशी'
  },
  'fall armyworm': {
    'hi-IN': 'फॉल आर्मीवर्म',
    'gu-IN': 'ફોલ આર્મીવોર્મ',
    'mr-IN': 'लष्करी अळी'
  },
  'pink bollworm': {
    'hi-IN': 'गुलाबी सुंडी (पिंक बॉलवर्म)',
    'gu-IN': 'ગુલાબી ઇયળ',
    'mr-IN': 'गुलाबी बोंडअळी'
  },
  'stem borer': {
    'hi-IN': 'तना छेदक',
    'gu-IN': 'ગાભમારાની ઈયળ',
    'mr-IN': 'खोडकिडा'
  }
};

export const RISK_LEVEL_DICTIONARY: Record<string, TermTranslation> = {
  LOW: {
    'hi-IN': 'निम्न जोखिम',
    'gu-IN': 'ઓછું જોખમ',
    'mr-IN': 'कमी धोका'
  },
  MEDIUM: {
    'hi-IN': 'मध्यम जोखिम',
    'gu-IN': 'મધ્યમ જોખમ',
    'mr-IN': 'मध्यम धोका'
  },
  HIGH: {
    'hi-IN': 'उच्च जोखिम',
    'gu-IN': 'ઊંચું જોખમ',
    'mr-IN': 'उच्च धोका'
  },
  CRITICAL: {
    'hi-IN': 'गंभीर आपात जोखिम',
    'gu-IN': 'અત્યંત ગંભીર જોખમ',
    'mr-IN': 'अतिगंभीर धोका'
  }
};

export const VERIFIED_STATUS_DICTIONARY: Record<string, TermTranslation> = {
  VERIFIED: {
    'hi-IN': 'कृषि विशेषज्ञ द्वारा सत्यापित',
    'gu-IN': 'કૃષિ નિષ્ણાત દ્વારા પ્રમાણિત',
    'mr-IN': 'कृषी तज्ज्ञांकडून पडताळणी पूर्ण'
  },
  NEEDS_MORE_EVIDENCE: {
    'hi-IN': 'विशेषज्ञ ने अतिरिक्त जानकारी मांगी है',
    'gu-IN': 'નિષ્ણાતે વધુ પુરાવા માંગ્યા છે',
    'mr-IN': 'तज्ज्ञांनी अधिक पुरावे मागवले आहेत'
  },
  IN_REVIEW: {
    'hi-IN': 'विशेषज्ञ समीक्षा प्रगति पर है',
    'gu-IN': 'નિષ્ણાત સમીક્ષા ચાલુ છે',
    'mr-IN': 'तज्ज्ञांचे पुनरावलोकन सुरू आहे'
  },
  AI_ONLY: {
    'hi-IN': 'स्वचालित एआई प्रारंभिक विश्लेषण',
    'gu-IN': 'ઓટોમેટેડ એઆઈ પ્રાથમિક વિશ્લેષણ',
    'mr-IN': 'स्वयंचलित एआय प्राथमिक विश्लेषण'
  }
};

/**
 * Translates crop name safely using dictionary lookup.
 */
export function translateCrop(cropName: string, lang: IndicLanguageCode): string {
  const key = (cropName || '').trim().toLowerCase();
  return CROP_DICTIONARY[key]?.[lang] || cropName;
}

/**
 * Translates threat/disease name safely using dictionary lookup.
 */
export function translateThreat(threatName: string, lang: IndicLanguageCode): string {
  const key = (threatName || '').trim().toLowerCase();
  return THREAT_DICTIONARY[key]?.[lang] || threatName;
}

/**
 * Translates risk level safely.
 */
export function translateRiskLevel(riskLevel: string, lang: IndicLanguageCode): string {
  const key = (riskLevel || '').trim().toUpperCase();
  return RISK_LEVEL_DICTIONARY[key]?.[lang] || riskLevel;
}

/**
 * Translates expert verification status safely.
 */
export function translateVerifiedStatus(status: string, lang: IndicLanguageCode): string {
  const key = (status || '').trim().toUpperCase();
  return VERIFIED_STATUS_DICTIONARY[key]?.[lang] || status;
}
