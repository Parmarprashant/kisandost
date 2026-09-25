/**
 * mr-IN.ts (Marathi Locale Templates)
 * ============================================================================
 * Deterministic agricultural advisory templates for Marathi.
 * Zero LLM translation in the critical agronomic safety path.
 * ============================================================================
 */

export const mrInLocale = {
  languageCode: 'mr-IN' as const,
  languageName: 'मराठी',

  titleTemplate: (p: { riskLevel: string; crop: string; threat: string }) =>
    `${p.riskLevel} इशारा: ${p.crop} पिकावर ${p.threat}`,

  verificationStatement: (p: { status: string; expertVerified: boolean }) => {
    if (p.expertVerified || p.status === 'VERIFIED') {
      return 'हे निदान कृषी तज्ज्ञांनी काळजीपूर्वक पडताळून प्रमाणित केले आहे.';
    }
    if (p.status === 'NEEDS_MORE_EVIDENCE') {
      return 'कृषी तज्ज्ञांनी अचूक निदानासाठी अधिक स्पष्ट फोटो किंवा लक्षणांची मागणी केली आहे.';
    }
    if (p.status === 'IN_REVIEW') {
      return 'हे स्कॅन सध्या कृषी तज्ज्ञांच्या पुनरावलोकनाखाली आहे.';
    }
    return 'हे स्वयंचलित एआय प्राथमिक विश्लेषण आहे.';
  },

  whyAlertStatement: (reason: string) =>
    `इशाऱ्याचे कारण: ${reason}`,

  actionsHeader: 'शिफारस केलेल्या संरक्षणात्मक उपाययोजना:',

  chemicalIntro: 'प्रमाणित रासायनिक नियंत्रण (केंद्रीय कीटकनाशक मंडळ - CIB&RC नुसार):',

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
    let text = `औषध: ${p.activeIngredient}`;
    if (p.formulation) text += ` (${p.formulation})`;
    if (p.dosage && p.unit) text += `, प्रमाण: ${p.dosage} ${p.unit}`;
    if (p.dilution) text += ` प्रति ${p.dilution}`;
    if (p.applicationMethod) text += `, फवारणी पद्धत: ${p.applicationMethod}`;
    if (p.phiDays != null && p.phiDays > 0) text += `। काढणीपूर्व प्रतीक्षा कालावधी (PHI): ${p.phiDays} दिवस`;
    if (p.safetyPrecaution) text += `। खबरदारी: ${p.safetyPrecaution}`;
    return text;
  },

  recheckStatement: (interval: string) =>
    `देखरेख: शिफारस केलेला कालावधी ${interval} नंतर शेताची पुन्हा पाहणी करा.`,

  safetyFootnote: 'सर्व रासायनिक सूचना CIB&RC मान्यताप्राप्त नियमांवर आधारित आहेत. शिफारस केलेल्या प्रमाणापेक्षा जास्त वापर करू नये.',

  evidenceRequestedPrompt: 'कृषी तज्ज्ञांना अचूक सल्ला देण्यासाठी बाधित पानांचे स्पष्ट फोटो पाठवा.',

  listenButton: {
    idle: 'आवाजात ऐका',
    generating: 'ऑडिओ तयार होत आहे...',
    playing: 'सुरू आहे...',
    retry: 'पुन्हा प्रयत्न करा',
    unavailable: 'ऑडिओ अनुपलब्ध'
  }
};
