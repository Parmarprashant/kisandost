/**
 * hi-IN.ts (Hindi Locale Templates)
 * ============================================================================
 * Deterministic agricultural advisory templates for Hindi.
 * Zero LLM translation in the critical agronomic safety path.
 * ============================================================================
 */

export const hiInLocale = {
  languageCode: 'hi-IN' as const,
  languageName: 'हिन्दी',

  titleTemplate: (p: { riskLevel: string; crop: string; threat: string }) =>
    `${p.riskLevel} चेतावनी: ${p.crop} में ${p.threat}`,

  verificationStatement: (p: { status: string; expertVerified: boolean }) => {
    if (p.expertVerified || p.status === 'VERIFIED') {
      return 'यह निदान कृषि विशेषज्ञ द्वारा सत्यापित किया गया है।';
    }
    if (p.status === 'NEEDS_MORE_EVIDENCE') {
      return 'कृषि विशेषज्ञ ने स्पष्ट पहचान के लिए अतिरिक्त फोटो या लक्षणों का अनुरोध किया है।';
    }
    if (p.status === 'IN_REVIEW') {
      return 'यह स्कैन वर्तमान में कृषि विशेषज्ञ की समीक्षा में है।';
    }
    return 'यह प्रारंभिक एआई विश्लेषण है।';
  },

  whyAlertStatement: (reason: string) =>
    `अलर्ट का कारण: ${reason}`,

  actionsHeader: 'अनुशंसित सुरक्षात्मक कार्य:',

  chemicalIntro: 'प्रमाणित रासायनिक उपचार (केंद्रीय कीटनाशक बोर्ड - CIB&RC अनुसार):',

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
    let text = `दवा: ${p.activeIngredient}`;
    if (p.formulation) text += ` (${p.formulation})`;
    if (p.dosage && p.unit) text += `, मात्रा: ${p.dosage} ${p.unit}`;
    if (p.dilution) text += ` प्रति ${p.dilution}`;
    if (p.applicationMethod) text += `, प्रयोग विधि: ${p.applicationMethod}`;
    if (p.phiDays != null && p.phiDays > 0) text += `। तुड़ाई पूर्व प्रतीक्षा अवधि (PHI): ${p.phiDays} दिन`;
    if (p.safetyPrecaution) text += `। सावधानी: ${p.safetyPrecaution}`;
    return text;
  },

  recheckStatement: (interval: string) =>
    `निगरानी: अनुशंसित अंतराल ${interval} के बाद खेत का पुनः निरीक्षण करें।`,

  safetyFootnote: 'सभी रासायनिक निर्देश CIB&RC स्वीकृत नियमों पर आधारित हैं। अनुशंसित मात्रा से अधिक प्रयोग न करें।',

  evidenceRequestedPrompt: 'कृषि विशेषज्ञ को अधिक सटीक सलाह देने के लिए प्रभावित पत्तियों की साफ फोटो भेजें।',

  listenButton: {
    idle: 'आवाज में सुनें',
    generating: 'ऑडियो तैयार हो रहा है...',
    playing: 'चल रहा है...',
    retry: 'पुनः प्रयास करें',
    unavailable: 'ऑडियो अनुपलब्ध'
  }
};
