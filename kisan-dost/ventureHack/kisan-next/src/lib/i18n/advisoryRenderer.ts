/**
 * advisoryRenderer.ts
 * ============================================================================
 * Multilingual Advisory Renderer for KisanDost / AgriShield 360°.
 * Deterministically renders structured agronomic narratives into Hindi, Gujarati,
 * and Marathi without LLM hallucinations.
 * ============================================================================
 */

import { IndicLanguageCode, DEFAULT_TTS_LANGUAGE, isSupportedIndicLanguage } from '../tts/ttsConfig';
import { StructuredAdvisoryPayload } from '../advisory/advisoryNarrative';
import {
  translateCrop,
  translateThreat,
  translateRiskLevel,
  translateVerifiedStatus
} from './terminology';
import { hiInLocale } from './locales/hi-IN';
import { guInLocale } from './locales/gu-IN';
import { mrInLocale } from './locales/mr-IN';

export interface LocalizedAdvisoryResult {
  language: IndicLanguageCode;
  languageLabel: string;
  title: string;
  summary: string;
  fullText: string;
  speechText: string;
  whatsappText: string;
  smsText: string;
  cropLocalized: string;
  threatLocalized: string;
  riskLevelLocalized: string;
  verifiedStatusLocalized: string;
  actions: string[];
  chemicalInstruction?: string;
  safetyFootnote: string;
}

const LOCALES = {
  'hi-IN': hiInLocale,
  'gu-IN': guInLocale,
  'mr-IN': mrInLocale
};

/**
 * Deterministically renders a StructuredAdvisoryPayload into the target Indic language.
 */
export function renderLocalizedAdvisory(
  payload: StructuredAdvisoryPayload,
  targetLanguage: string = DEFAULT_TTS_LANGUAGE
): LocalizedAdvisoryResult {
  const lang: IndicLanguageCode = isSupportedIndicLanguage(targetLanguage)
    ? targetLanguage
    : DEFAULT_TTS_LANGUAGE;

  const locale = LOCALES[lang];

  // 1. Localize core terminology
  const cropLocalized = translateCrop(payload.crop, lang);
  const threatLocalized = translateThreat(payload.threat, lang);
  const riskLevelLocalized = translateRiskLevel(payload.riskLevel, lang);
  const verifiedStatusLocalized = translateVerifiedStatus(payload.verifiedStatus, lang);

  // 2. Build Title
  const title = locale.titleTemplate({
    riskLevel: riskLevelLocalized,
    crop: cropLocalized,
    threat: threatLocalized
  });

  // 3. Build Verification statement
  const verificationStatement = locale.verificationStatement({
    status: payload.verifiedStatus,
    expertVerified: payload.expertVerified
  });

  // 4. Build Why Alert statement
  const whyAlert = locale.whyAlertStatement(payload.whyAlert || '');

  // 5. Build Actions List
  const actions = payload.recommendedActions || [];

  // 6. Build Chemical statement if offered from Phase 8 validated rules
  let chemicalInstruction: string | undefined = undefined;
  if (payload.chemicalAction && payload.chemicalAction.offered && payload.chemicalAction.activeIngredient) {
    chemicalInstruction = locale.chemicalStatement({
      activeIngredient: payload.chemicalAction.activeIngredient,
      formulation: payload.chemicalAction.formulation || undefined,
      dosage: payload.chemicalAction.dosage || undefined,
      unit: payload.chemicalAction.unit || undefined,
      dilution: payload.chemicalAction.dilution || undefined,
      applicationMethod: payload.chemicalAction.applicationMethod || undefined,
      phiDays: payload.chemicalAction.phiDays,
      safetyPrecaution: payload.chemicalAction.safetyPrecaution || undefined
    });
  }

  // 7. Recheck interval statement
  const recheckStatement = locale.recheckStatement(payload.nextCheck || '5-7 दिन');

  // 8. Build Full Text (for Dashboard UI)
  const fullTextParts: string[] = [
    title,
    verificationStatement,
    whyAlert,
    '',
    locale.actionsHeader,
    ...actions.map((act, i) => `${i + 1}. ${act}`)
  ];

  if (chemicalInstruction) {
    fullTextParts.push('', locale.chemicalIntro, chemicalInstruction);
  }

  fullTextParts.push('', recheckStatement, '', locale.safetyFootnote);
  const fullText = fullTextParts.join('\n');

  // 9. Build Summary (1-2 sentences for notifications & cards)
  const summary = `${title}। ${verificationStatement}`;

  // 10. Build Speech Text (tuned for natural, clear cadence on Vexyl-TTS)
  // Omits bullet points, special formatting, and symbols to ensure clean pronunciation
  const speechParts: string[] = [
    title + '।',
    verificationStatement,
    whyAlert + '।'
  ];
  if (actions.length > 0) {
    speechParts.push(locale.actionsHeader);
    actions.slice(0, 2).forEach(act => speechParts.push(act + '।'));
  }
  if (chemicalInstruction) {
    speechParts.push(chemicalInstruction + '।');
  }
  speechParts.push(recheckStatement);
  const speechText = speechParts.join(' ');

  // 11. Build WhatsApp Text (formatted with markdown, emojis, structured blocks)
  const riskEmoji = payload.riskLevel === 'HIGH' || payload.riskLevel === 'CRITICAL' ? '⚠️' : 'ℹ️';
  const whatsappParts: string[] = [
    `${riskEmoji} *${title}*`,
    `_${verificationStatement}_`,
    '',
    `📌 *${whyAlert}*`,
    '',
    `🛠️ *${locale.actionsHeader}*`,
    ...actions.map(act => `• ${act}`)
  ];
  if (chemicalInstruction) {
    whatsappParts.push('', `🧪 *${locale.chemicalIntro}*`, chemicalInstruction);
  }
  whatsappParts.push('', `🗓️ *${recheckStatement}*`, '', `_KisanDost AgriShield 360°_`);
  const whatsappText = whatsappParts.join('\n');

  // 12. Build SMS Text (concise, clear, < 160 characters when possible)
  const smsText = `KisanDost: ${cropLocalized} में ${threatLocalized} का ${riskLevelLocalized}। ${verificationStatement} सलाह ऐप में देखें।`;

  return {
    language: lang,
    languageLabel: locale.languageName,
    title,
    summary,
    fullText,
    speechText,
    whatsappText,
    smsText,
    cropLocalized,
    threatLocalized,
    riskLevelLocalized,
    verifiedStatusLocalized,
    actions,
    chemicalInstruction,
    safetyFootnote: locale.safetyFootnote
  };
}
