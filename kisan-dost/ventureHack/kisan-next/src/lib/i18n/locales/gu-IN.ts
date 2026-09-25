/**
 * gu-IN.ts (Gujarati Locale Templates)
 * ============================================================================
 * Deterministic agricultural advisory templates for Gujarati.
 * Zero LLM translation in the critical agronomic safety path.
 * ============================================================================
 */

export const guInLocale = {
  languageCode: 'gu-IN' as const,
  languageName: 'ગુજરાતી',

  titleTemplate: (p: { riskLevel: string; crop: string; threat: string }) =>
    `${p.riskLevel} ચેતવણી: ${p.crop}માં ${p.threat}`,

  verificationStatement: (p: { status: string; expertVerified: boolean }) => {
    if (p.expertVerified || p.status === 'VERIFIED') {
      return 'આ નિદાન કૃષિ નિષ્ણાત દ્વારા ચકાસવામાં અને પ્રમાણિત કરવામાં આવ્યું છે.';
    }
    if (p.status === 'NEEDS_MORE_EVIDENCE') {
      return 'કૃષિ નિષ્ણાતે સ્પષ્ટ ઓળખ માટે વધુ ફોટા અથવા લક્ષણોની વિગતો માંગી છે.';
    }
    if (p.status === 'IN_REVIEW') {
      return 'આ સ્કેન હાલમાં કૃષિ નિષ્ણાતની સમીક્ષા હેઠળ છે.';
    }
    return 'આ ઓટોમેટેડ એઆઈ પ્રાથમિક વિશ્લેષણ છે.';
  },

  whyAlertStatement: (reason: string) =>
    `ચેતવણીનું કારણ: ${reason}`,

  actionsHeader: 'ભલામણ કરેલ રક્ષણાત્મક પગલાં:',

  chemicalIntro: 'પ્રમાણિત રાસાયણિક નિયંત્રણ (કેન્દ્રીય જંતુનાશક બોર્ડ - CIB&RC મુજબ):',

  chemicalStatement: (p: {
    activeIngredient: string;
    formulation?: string;
    dosage?: string;
    unit?: string;
    dilution?: string;
    applicationMethod?: string;
    phiDays?: number | null;
    safetyPrecaution?: string;
  }) => {
    let text = `દવા: ${p.activeIngredient}`;
    if (p.formulation) text += ` (${p.formulation})`;
    if (p.dosage && p.unit) text += `, માત્રા: ${p.dosage} ${p.unit}`;
    if (p.dilution) text += ` પ્રતિ ${p.dilution}`;
    if (p.applicationMethod) text += `, છંટકાવ પદ્ધતિ: ${p.applicationMethod}`;
    if (p.phiDays != null && p.phiDays > 0) text += `। લણણી પૂર્વે પ્રતીક્ષા સમય (PHI): ${p.phiDays} દિવસ`;
    if (p.safetyPrecaution) text += `। સાવચેતી: ${p.safetyPrecaution}`;
    return text;
  },

  recheckStatement: (interval: string) =>
    `નિરીક્ષણ: ભલામણ કરેલ સમય ${interval} પછી ખેતરનું ફરીથી નિરીક્ષણ કરો.`,

  safetyFootnote: 'તમામ રાસાયણિક સૂચનો CIB&RC માન્ય નિયમો આધારિત છે. ભલામણ કરેલ માત્રા કરતા વધુ દવા વાપરવી નહીં.',

  evidenceRequestedPrompt: 'કૃષિ નિષ્ણાતને વધુ સચોટ સલાહ આપવા માટે અસરગ્રસ્ત પાંદડાનો સ્પષ્ટ ફોટો મોકલો.',

  listenButton: {
    idle: 'અવાજમાં સાંભળો',
    generating: 'ઓડિયો તૈયાર થઈ રહ્યો છે...',
    playing: 'વાગી રહ્યું છે...',
    retry: 'ફરી પ્રયાસ કરો',
    unavailable: 'ઓડિયો અનુપલબ્ધ'
  }
};
