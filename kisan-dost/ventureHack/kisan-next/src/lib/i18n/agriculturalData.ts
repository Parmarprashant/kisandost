/**
 * agriculturalData.ts
 * ============================================================================
 * Universal Multilingual Agricultural Data Translation Engine for KisanDost.
 * Supports English ('en'), Hindi ('hi'), Gujarati ('gu'), and Marathi ('mr').
 * Deterministically translates dynamic agricultural entities:
 * - Crop names
 * - Growth / Phenological stages
 * - Progression modes (GDD, Hybrid, DAS)
 * - Health and field statuses
 * - Composite risk levels and vector categories
 * - Threats, diseases, and pests
 * - Agricultural units (Acres, Hectares, Days, °C day)
 * ============================================================================
 */

export type SupportedLocale = 'en' | 'hi' | 'gu' | 'mr';

export function normalizeLocale(locale?: string): SupportedLocale {
  if (!locale) return 'en';
  const clean = locale.toLowerCase().split('-')[0];
  if (clean === 'hi') return 'hi';
  if (clean === 'gu') return 'gu';
  if (clean === 'mr') return 'mr';
  return 'en';
}

// ── 1. CROP NAMES ────────────────────────────────────────────────────────────
export const CROP_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
  cotton: {
    en: 'Cotton',
    hi: 'कपास',
    gu: 'કપાસ',
    mr: 'कापूस'
  },
  wheat: {
    en: 'Wheat',
    hi: 'गेहूँ',
    gu: 'ઘઉં',
    mr: 'गहू'
  },
  rice: {
    en: 'Rice (Paddy)',
    hi: 'धान (चावल)',
    gu: 'ડાંગર (ચોખા)',
    mr: 'भात (तांदूळ)'
  },
  paddy: {
    en: 'Paddy',
    hi: 'धान',
    gu: 'ડાંગર',
    mr: 'भात'
  },
  soybean: {
    en: 'Soybean',
    hi: 'सोयाबीन',
    gu: 'સોયાબીન',
    mr: 'सोयाबीन'
  },
  soyabean: {
    en: 'Soybean',
    hi: 'सोयाबीन',
    gu: 'સોયાબીન',
    mr: 'सोयाबीन'
  },
  corn: {
    en: 'Maize (Corn)',
    hi: 'मक्का',
    gu: 'મકાઈ',
    mr: 'मका'
  },
  maize: {
    en: 'Maize',
    hi: 'मक्का',
    gu: 'મકાઈ',
    mr: 'मका'
  },
  mustard: {
    en: 'Mustard',
    hi: 'सरसों',
    gu: 'રાઈ / સરસવ',
    mr: 'मोहरी'
  },
  chickpea: {
    en: 'Chickpea (Gram)',
    hi: 'चना',
    gu: 'ચણા',
    mr: 'हरभरा'
  },
  gram: {
    en: 'Gram (Chickpea)',
    hi: 'चना',
    gu: 'ચણા',
    mr: 'हरभरा'
  },
  groundnut: {
    en: 'Groundnut (Peanut)',
    hi: 'मूंगफली',
    gu: 'મગફળી',
    mr: 'भुईमूग'
  },
  peanut: {
    en: 'Peanut',
    hi: 'मूंगफली',
    gu: 'મગફળી',
    mr: 'भुईमूग'
  },
  sugarcane: {
    en: 'Sugarcane',
    hi: 'गन्ना',
    gu: 'શેરડી',
    mr: 'ऊस'
  },
  tomato: {
    en: 'Tomato',
    hi: 'टमाटर',
    gu: 'ટામેટા',
    mr: 'टोमॅटो'
  },
  potato: {
    en: 'Potato',
    hi: 'आलू',
    gu: 'બટાટા',
    mr: 'बटाटा'
  },
  onion: {
    en: 'Onion',
    hi: 'प्याज',
    gu: 'ડુંગળી',
    mr: 'कांदा'
  },
  banana: {
    en: 'Banana',
    hi: 'केला',
    gu: 'કેળા',
    mr: 'केळी'
  },
  grapes: {
    en: 'Grapes',
    hi: 'अंगूर',
    gu: 'દ્રાક્ષ',
    mr: 'द्राक्षे'
  },
  pomegranate: {
    en: 'Pomegranate',
    hi: 'अनार',
    gu: 'દાડમ',
    mr: 'डाळिंब'
  },
  apple: {
    en: 'Apple',
    hi: 'सेब',
    gu: 'સફરજન',
    mr: 'सफरचंद'
  },
  mango: {
    en: 'Mango',
    hi: 'आम',
    gu: 'કેરી',
    mr: 'आंबा'
  },
  watermelon: {
    en: 'Watermelon',
    hi: 'तरबूज',
    gu: 'તરબૂચ',
    mr: 'कलिंगड'
  },
  papaya: {
    en: 'Papaya',
    hi: 'पपीता',
    gu: 'પપૈયું',
    mr: 'पपई'
  },
  chilli: {
    en: 'Chilli',
    hi: 'मिर्च',
    gu: 'મરચાં',
    mr: 'मिरची'
  },
  chili: {
    en: 'Chilli',
    hi: 'मिर्च',
    gu: 'મરચાં',
    mr: 'मिरची'
  },
  pepper: {
    en: 'Pepper',
    hi: 'शिमला मिर्च',
    gu: 'કેપ્સીકમ મરચાં',
    mr: 'ढोबळी मिरची'
  },
  garlic: {
    en: 'Garlic',
    hi: 'लहसुन',
    gu: 'લસણ',
    mr: 'लसूण'
  },
  ginger: {
    en: 'Ginger',
    hi: 'अदरक',
    gu: 'આદુ',
    mr: 'आले'
  },
  turmeric: {
    en: 'Turmeric',
    hi: 'हल्दी',
    gu: 'હળદર',
    mr: 'हळद'
  },
  moong: {
    en: 'Moong (Green Gram)',
    hi: 'मूंग',
    gu: 'મગ',
    mr: 'मूग'
  },
  urad: {
    en: 'Urad (Black Gram)',
    hi: 'उड़द',
    gu: 'અડદ',
    mr: 'उडीद'
  },
  tur: {
    en: 'Tur (Pigeon Pea)',
    hi: 'तुअर (अरहर)',
    gu: 'તુવેર',
    mr: 'तूर'
  },
  arhar: {
    en: 'Arhar',
    hi: 'अरहर',
    gu: 'તુવેર',
    mr: 'तूर'
  },
  cumin: {
    en: 'Cumin (Jeera)',
    hi: 'जीरा',
    gu: 'જીરું',
    mr: 'जिरे'
  },
  castor: {
    en: 'Castor',
    hi: 'अरंडी',
    gu: 'દિવેલા / એરંડા',
    mr: 'एरंडी'
  },
  bajra: {
    en: 'Bajra (Pearl Millet)',
    hi: 'बाजरा',
    gu: 'બાજરી',
    mr: 'बाजरी'
  },
  jowar: {
    en: 'Jowar (Sorghum)',
    hi: 'ज्वार',
    gu: 'જુવાર',
    mr: 'ज्वारी'
  },
  cauliflower: {
    en: 'Cauliflower',
    hi: 'फूलगोभी',
    gu: 'ફુલેવર',
    mr: 'फ्लॉवर'
  },
  cabbage: {
    en: 'Cabbage',
    hi: 'पत्तागोभी',
    gu: 'કોબીજ',
    mr: 'कोबी'
  },
  carrot: {
    en: 'Carrot',
    hi: 'गाजर',
    gu: 'ગાજર',
    mr: 'गाजर'
  },
  cucumber: {
    en: 'Cucumber',
    hi: 'खीरा',
    gu: 'કાકડી',
    mr: 'काकडी'
  },
  spinach: {
    en: 'Spinach',
    hi: 'पालक',
    gu: 'પાલક',
    mr: 'पालक'
  }
};

export function localizeCropName(cropName: string | undefined | null, locale?: string): string {
  if (!cropName) return '';
  const normLocale = normalizeLocale(locale);
  if (normLocale === 'en') return cropName;

  const key = cropName.trim().toLowerCase();
  for (const [k, trans] of Object.entries(CROP_TRANSLATIONS)) {
    if (key === k || key.includes(k) || k.includes(key)) {
      return trans[normLocale] || cropName;
    }
  }
  return cropName;
}

// ── 2. GROWTH / PHENOLOGICAL STAGES ──────────────────────────────────────────
export const STAGE_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
  // Generic
  'initial growth': {
    en: 'Initial Growth',
    hi: 'प्रारंभिक वृद्धि',
    gu: 'પ્રારંભિક વૃદ્ધિ',
    mr: 'सुरुवातीची वाढ'
  },
  'sowing': {
    en: 'Sowing',
    hi: 'बुवाई',
    gu: 'વાવણી',
    mr: 'पेरणी'
  },
  'germination & emergence': {
    en: 'Germination & Emergence',
    hi: 'अंकुरण व उद्भव',
    gu: 'અંકુરણ અને ઉગાવો',
    mr: 'अंकुरण आणि उगवण'
  },
  'germination & emergence (ve)': {
    en: 'Germination & Emergence (VE)',
    hi: 'अंकुरण व उद्भव (VE)',
    gu: 'અંકુરણ અને ઉગાવો (VE)',
    mr: 'अंकुरण आणि उगवण (VE)'
  },
  'early vegetative (v1 - v3)': {
    en: 'Early Vegetative (V1 - V3)',
    hi: 'प्रारंभिक वानस्पतिक अवस्था (V1 - V3)',
    gu: 'પ્રારંભિક વાનસ્પતિક તબક્કો (V1 - V3)',
    mr: 'प्राथमिक शाकीय वाढ (V1 - V3)'
  },
  'rapid vegetative growth (v4 - r1)': {
    en: 'Rapid Vegetative Growth (V4 - R1)',
    hi: 'तीव्र वानस्पतिक वृद्धि (V4 - R1)',
    gu: 'ઝડપી વાનસ્પતિક વૃદ્ધિ (V4 - R1)',
    mr: 'जलद शाकीय वाढ (V4 - R1)'
  },
  'flowering & pod formation (r2 - r4)': {
    en: 'Flowering & Pod Formation (R2 - R4)',
    hi: 'फूल आना व फली निर्माण (R2 - R4)',
    gu: 'ફૂલ આવવા અને શીંગો બનવી (R2 - R4)',
    mr: 'फुलोरा व शेंगा भरणे (R2 - R4)'
  },
  'seed filling & maturation (r5 - r7)': {
    en: 'Seed Filling & Maturation (R5 - R7)',
    hi: 'दाना भराव व परिपक्वता (R5 - R7)',
    gu: 'દાણા ભરાવા અને પાકવું (R5 - R7)',
    mr: 'दाणे भरणे आणि पक्वता (R5 - R7)'
  },
  'full maturity & harvest ready (r8)': {
    en: 'Full Maturity & Harvest Ready (R8)',
    hi: 'पूर्ण परिपक्वता व कटाई योग्य (R8)',
    gu: 'પૂર્ણ પરિપક્વતા અને કાપણી માટે તૈયાર (R8)',
    mr: 'पूर्ण पक्वता आणि काढणीस तयार (R8)'
  },
  'vegetative stage': {
    en: 'Vegetative Stage',
    hi: 'वानस्पतिक अवस्था',
    gu: 'વાનસ્પતિક તબક્કો',
    mr: 'शाकीय वाढ अवस्था'
  },
  'active vegetative growth': {
    en: 'Active Vegetative Growth',
    hi: 'सक्रिय वानस्पतिक वृद्धि',
    gu: 'સક્રિય વાનસ્પતિક વૃદ્ધિ',
    mr: 'सक्रिय शाकीय वाढ'
  },
  'vegetative & squaring': {
    en: 'Vegetative & Squaring',
    hi: 'वानस्पतिक व कली निर्माण',
    gu: 'વાનસ્પતિક અને ચાપવા બેસવા',
    mr: 'शाकीय वाढ व पात्या लागणे'
  },
  'flowering & boll development': {
    en: 'Flowering & Boll Development',
    hi: 'फूल आना व टिंडे बनना',
    gu: 'ફૂલ આવવા અને જીંડવા બનવા',
    mr: 'फुलोरा व बोंड भरणे'
  },
  'boll maturation & bursting': {
    en: 'Boll Maturation & Bursting',
    hi: 'टिंडे पकना व खिलना',
    gu: 'જીંડવા પાકવા અને ખીલવા',
    mr: 'बोंड पक्वता व फुटणे'
  },
  'crown root initiation (cri)': {
    en: 'Crown Root Initiation (CRI)',
    hi: 'शीर्ष जड़ जमाव (CRI)',
    gu: 'ક્રાઉન રૂટ ઇનિશિયેશન (CRI)',
    mr: 'मुकुट मुळे फुटणे (CRI)'
  },
  'tillering stage': {
    en: 'Tillering Stage',
    hi: 'कल्ले फूटने की अवस्था',
    gu: 'ફૂટવાની અવસ્થા',
    mr: 'फुटवे फुटण्याची अवस्था'
  },
  'jointing & booting': {
    en: 'Jointing & Booting',
    hi: 'गांठ बनना व बूटिंग',
    gu: 'ગાંઠ બનવી અને બૂટિંગ',
    mr: 'कांडी धरणे आणि पोटरी अवस्था'
  },
  'heading & flowering': {
    en: 'Heading & Flowering',
    hi: 'बाली निकलना व फूल आना',
    gu: 'ડૂંડી નીકળવી અને ફૂલ આવવા',
    mr: 'लोंब्या बाहेर पडणे व फुलोरा'
  },
  'milking & dough stage': {
    en: 'Milking & Dough Stage',
    hi: 'दुग्धावस्था व दाना भराव',
    gu: 'દૂધિયા દાણા અને લોટ અવસ્થા',
    mr: 'दुधाळ आणि दाणे भरणे अवस्था'
  },
  'ripening & maturity': {
    en: 'Ripening & Maturity',
    hi: 'पकना व परिपक्वता',
    gu: 'પાકવાની અવસ્થા',
    mr: 'पक्वता अवस्था'
  },
  'harvest window': {
    en: 'Harvest Window',
    hi: 'कटाई का समय',
    gu: 'કાપણીનો ગાળો',
    mr: 'काढणीचा कालावधी'
  },
  'harvest ready': {
    en: 'Harvest Ready',
    hi: 'कटाई योग्य',
    gu: 'કાપણી માટે તૈયાર',
    mr: 'काढणीसाठी तयार'
  },
  'pegging & pod initiation': {
    en: 'Pegging & Pod Initiation',
    hi: 'पेगिंग व फली शुरुआत',
    gu: 'સૂયા બેસવા અને શીંગો શરૂ થવી',
    mr: 'आऱ्या सुटणे आणि शेंगा सुरू होणे'
  },
  'pod development': {
    en: 'Pod Development',
    hi: 'फली विकास',
    gu: 'શીંગોનો વિકાસ',
    mr: 'शेंगांचा विकास'
  },
  'maturity & harvesting': {
    en: 'Maturity & Harvesting',
    hi: 'परिपक्वता व कटाई',
    gu: 'પરિપક્વતા અને કાપણી',
    mr: 'पक्वता आणि काढणी'
  },
  'flowering & reproductive': {
    en: 'Flowering & Reproductive',
    hi: 'फूल व जनन अवस्था',
    gu: 'ફૂલ અને પ્રજનન તબક્કો',
    mr: 'फुलोरा व पुनरुत्पादन अवस्था'
  },
  'fruit/grain development': {
    en: 'Fruit / Grain Development',
    hi: 'फल / दाना विकास',
    gu: 'ફળ / દાણાનો વિકાસ',
    mr: 'फळ / दाणे विकास'
  }
};

export function localizeGrowthStage(stageName: string | undefined | null, locale?: string): string {
  if (!stageName) return '';
  const normLocale = normalizeLocale(locale);
  if (normLocale === 'en') return stageName;

  const key = stageName.trim().toLowerCase();
  if (STAGE_TRANSLATIONS[key]) {
    return STAGE_TRANSLATIONS[key][normLocale];
  }
  for (const [k, trans] of Object.entries(STAGE_TRANSLATIONS)) {
    if (key.includes(k) || k.includes(key)) {
      return trans[normLocale] || stageName;
    }
  }
  return stageName;
}

// ── 3. PROGRESSION MODES ─────────────────────────────────────────────────────
export const PROGRESSION_MODES: Record<string, Record<SupportedLocale, string>> = {
  DYNAMIC_GDD: {
    en: 'Thermal Time (GDD)',
    hi: 'थर्मल समय (GDD)',
    gu: 'થર્મલ સમય (GDD)',
    mr: 'थर्मल वेळ (GDD)'
  },
  HYBRID_DAS: {
    en: 'Hybrid (DAS + Target GDD)',
    hi: 'हाइब्रिड (DAS + लक्षित GDD)',
    gu: 'હાઇબ્રિડ (DAS + લક્ષ્યાંક GDD)',
    mr: 'हायब्रिड (DAS + लक्ष्य GDD)'
  },
  DAS_ONLY: {
    en: 'DAS Tracking',
    hi: 'दिन आधारित ट्रैकिंग (DAS)',
    gu: 'દિવસ આધારિત ટ્રેકિંગ (DAS)',
    mr: 'दिवस आधारित ट्रॅकिंग (DAS)'
  }
};

export function localizeProgressionMode(mode: string | undefined | null, locale?: string): string {
  if (!mode) return '';
  const normLocale = normalizeLocale(locale);
  const clean = mode.toUpperCase().trim();
  if (PROGRESSION_MODES[clean]) {
    return PROGRESSION_MODES[clean][normLocale];
  }
  if (clean.includes('DYNAMIC')) return PROGRESSION_MODES.DYNAMIC_GDD[normLocale];
  if (clean.includes('HYBRID')) return PROGRESSION_MODES.HYBRID_DAS[normLocale];
  return PROGRESSION_MODES.DAS_ONLY[normLocale];
}

// ── 4. STATUS & RISK LEVELS ──────────────────────────────────────────────────
export const STATUS_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
  active: {
    en: 'Active',
    hi: 'सक्रिय',
    gu: 'સક્રિય',
    mr: 'सक्रिय'
  },
  harvested: {
    en: 'Harvested',
    hi: 'काटा गया',
    gu: 'લણણી થયેલ',
    mr: 'कापणी झाली'
  },
  completed: {
    en: 'Completed',
    hi: 'पूर्ण हुआ',
    gu: 'પૂર્ણ થયું',
    mr: 'पूर्ण झाले'
  },
  resolved: {
    en: 'Resolved',
    hi: 'समाधान हुआ',
    gu: 'ઉકેલાઈ ગયું',
    mr: 'निवारण झाले'
  },
  pending: {
    en: 'Pending',
    hi: 'लंबित',
    gu: 'બાકી',
    mr: 'प्रलंबित'
  },
  'in progress': {
    en: 'In Progress',
    hi: 'प्रगति पर',
    gu: 'ચાલુ છે',
    mr: 'प्रगतीपथावर'
  },
  healthy: {
    en: 'Healthy',
    hi: 'स्वस्थ',
    gu: 'સ્વસ્થ',
    mr: 'निरोगी'
  },
  moderate: {
    en: 'Moderate',
    hi: 'मध्यम',
    gu: 'મધ્યમ',
    mr: 'मध्यम'
  },
  stress: {
    en: 'Under Stress',
    hi: 'तनाव में',
    gu: 'તણાવ હેઠળ',
    mr: 'तणावाखाली'
  },
  potential_concern: {
    en: 'Potential Concern',
    hi: 'संभावित चिंता',
    gu: 'સંભવિત ચિંતા',
    mr: 'संभाव्य चिंता'
  },
  no_concern: {
    en: 'No Concern',
    hi: 'सुरक्षित (कोई चिंता नहीं)',
    gu: 'સુરક્ષિત (કોઈ ચિંતા નથી)',
    mr: 'सुरक्षित (कोणतीही चिंता नाही)'
  },
  inconclusive: {
    en: 'Inconclusive',
    hi: 'अनिर्णायक (समीक्षा आवश्यक)',
    gu: 'અનિર્ણિત (સમીક્ષા જરૂરી)',
    mr: 'अनिर्णित (पडताळणी आवश्यक)'
  },
  low: {
    en: 'Low Risk',
    hi: 'कम जोखिम',
    gu: 'ઓછું જોખમ',
    mr: 'कमी धोका'
  },
  high: {
    en: 'High Risk',
    hi: 'उच्च जोखिम',
    gu: 'ઊંચું જોખમ',
    mr: 'उच्च धोका'
  },
  critical: {
    en: 'Critical Risk',
    hi: 'गंभीर आपात जोखिम',
    gu: 'અત્યંત ગંભીર જોખમ',
    mr: 'अतिगंभीर धोका'
  }
};

export function localizeStatus(status: string | undefined | null, locale?: string): string {
  if (!status) return '';
  const normLocale = normalizeLocale(locale);
  const key = status.trim().toLowerCase().replace(/\s+/g, '_');
  if (STATUS_TRANSLATIONS[key]) {
    return STATUS_TRANSLATIONS[key][normLocale];
  }
  const spaceKey = status.trim().toLowerCase();
  if (STATUS_TRANSLATIONS[spaceKey]) {
    return STATUS_TRANSLATIONS[spaceKey][normLocale];
  }
  return status;
}

// ── 5. THREATS, DISEASES & PESTS ─────────────────────────────────────────────
export const THREAT_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
  'powdery mildew': {
    en: 'Powdery Mildew',
    hi: 'पाउडरी मिल्ड्यू (चूर्णी फफूंद)',
    gu: 'પાવડરી માઇલ્ડ્યુ (છારો)',
    mr: 'भुरी रोग'
  },
  'leaf blast': {
    en: 'Leaf Blast',
    hi: 'झुलसा रोग (लीफ ब्लास्ट)',
    gu: 'પાનનો કરપો (બ્લાસ્ટ)',
    mr: 'करपा रोग'
  },
  'blast': {
    en: 'Blast Disease',
    hi: 'झुलसा रोग',
    gu: 'કરપો રોગ',
    mr: 'करपा रोग'
  },
  'bacterial blight': {
    en: 'Bacterial Blight',
    hi: 'जीवाणु झुलसा (बैक्टीरियल ब्लाइट)',
    gu: 'બેક્ટેરિયલ બ્લાઈટ',
    mr: 'जिवाणूजन्य करपा'
  },
  'rust': {
    en: 'Rust',
    hi: 'गेरुआ / रतुआ (रस्ट)',
    gu: 'ગેરુ રોગ',
    mr: 'तांबेरा रोग'
  },
  'yellow rust': {
    en: 'Yellow Rust',
    hi: 'पीला रतुआ (येलो रस्ट)',
    gu: 'પીળો ગેરુ',
    mr: 'पिवळा तांबेरा'
  },
  'brown rust': {
    en: 'Brown Rust',
    hi: 'भूरा रतुआ (ब्राउन रस्ट)',
    gu: 'કથ્થઈ ગેરુ',
    mr: 'तांबडा तांबेरा'
  },
  'wilt': {
    en: 'Wilt Disease',
    hi: 'उकठा रोग (विल्ट)',
    gu: 'સુકારો રોગ',
    mr: 'मर रोग'
  },
  'aphids': {
    en: 'Aphids',
    hi: 'माहू / चेपा (एफिड्स)',
    gu: 'મોલો મશી (એફિડ્સ)',
    mr: 'मावा कीड'
  },
  'whitefly': {
    en: 'Whitefly',
    hi: 'सफेद मक्खी',
    gu: 'સફેદ માખી',
    mr: 'पांढरी माशी'
  },
  'fall armyworm': {
    en: 'Fall Armyworm',
    hi: 'फॉल आर्मीवर्म',
    gu: 'ફોલ આર્મીવોર્મ',
    mr: 'लष्करी अळी'
  },
  'pink bollworm': {
    en: 'Pink Bollworm',
    hi: 'गुलाबी सुंडी (पिंक बॉलवर्म)',
    gu: 'ગુલાબી ઇયળ',
    mr: 'गुलाबी बोंडअळी'
  },
  'stem borer': {
    en: 'Stem Borer',
    hi: 'तना छेदक',
    gu: 'ગાભમારાની ઈયળ',
    mr: 'खोडकिडा'
  },
  'boll rot': {
    en: 'Boll Rot',
    hi: 'टिंडा सड़न',
    gu: 'જીંડવા સડો',
    mr: 'बोंड सड'
  },
  'early blight': {
    en: 'Early Blight',
    hi: 'अगेती झुलसा',
    gu: 'અગેતી સુકારો',
    mr: 'लवकर येणारा करपा'
  },
  'late blight': {
    en: 'Late Blight',
    hi: 'पछेती झुलसा',
    gu: 'પાછોતરો સુકારો',
    mr: 'उशिरा येणारा करपा'
  }
};

export function localizeThreatName(threatName: string | undefined | null, locale?: string): string {
  if (!threatName) return '';
  const normLocale = normalizeLocale(locale);
  if (normLocale === 'en') return threatName;

  const key = threatName.trim().toLowerCase();
  if (THREAT_TRANSLATIONS[key]) {
    return THREAT_TRANSLATIONS[key][normLocale];
  }
  for (const [k, trans] of Object.entries(THREAT_TRANSLATIONS)) {
    if (key.includes(k) || k.includes(key)) {
      return trans[normLocale] || threatName;
    }
  }
  return threatName;
}

// ── 6. AGRICULTURAL UNITS & TERMS ────────────────────────────────────────────
export const UNIT_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
  acre: {
    en: 'Acre',
    hi: 'एकड़',
    gu: 'એકર',
    mr: 'एकर'
  },
  acres: {
    en: 'Acres',
    hi: 'एकड़',
    gu: 'એકર',
    mr: 'एकर'
  },
  hectare: {
    en: 'Hectare',
    hi: 'हेक्टेयर',
    gu: 'હેક્ટર',
    mr: 'हेक्टर'
  },
  hectares: {
    en: 'Hectares',
    hi: 'हेक्टेयर',
    gu: 'હેક્ટર',
    mr: 'हेक्टर'
  },
  day: {
    en: 'Day',
    hi: 'दिन',
    gu: 'દિવસ',
    mr: 'दिवस'
  },
  days: {
    en: 'Days',
    hi: 'दिन',
    gu: 'દિવસ',
    mr: 'दिवस'
  },
  'days after sowing': {
    en: 'Days After Sowing (DAS)',
    hi: 'बुवाई के बाद के दिन (DAS)',
    gu: 'વાવણી પછીના દિવસો (DAS)',
    mr: 'पेरणीनंतरचे दिवस (DAS)'
  },
  '°c day': {
    en: '°C day',
    hi: '°C दिन',
    gu: '°C દિવસ',
    mr: '°C दिवस'
  },
  zone: {
    en: 'Zone',
    hi: 'क्षेत्र / ज़ोन',
    gu: 'ઝોન',
    mr: 'झोन / क्षेत्र'
  },
  'monitoring zone': {
    en: 'Monitoring Zone',
    hi: 'निगरानी क्षेत्र',
    gu: 'મોનિટરિંગ ઝોન',
    mr: 'निरीक्षण क्षेत्र'
  },
  'zone not assigned': {
    en: 'Zone not assigned',
    hi: 'क्षेत्र आवंटित नहीं',
    gu: 'ઝોન ફાળવેલ નથી',
    mr: 'झोन नियुक्त नाही'
  },
  'boundary ready': {
    en: 'Boundary Ready',
    hi: 'सीमा तैयार',
    gu: 'સીમા તૈયાર',
    mr: 'हद्द तयार'
  },
  'no boundary': {
    en: 'No Boundary',
    hi: 'कोई सीमा नहीं',
    gu: 'કોઈ સીમા નથી',
    mr: 'हद्द नाही'
  }
};

export function localizeUnits(unit: string | undefined | null, locale?: string): string {
  if (!unit) return '';
  const normLocale = normalizeLocale(locale);
  if (normLocale === 'en') return unit;

  const key = unit.trim().toLowerCase();
  if (UNIT_TRANSLATIONS[key]) {
    return UNIT_TRANSLATIONS[key][normLocale];
  }
  return unit;
}

// ── 7. SCOUTING ANGLES & INTERVENTIONS ───────────────────────────────────────
export const SCOUTING_ANGLES: Record<string, Record<SupportedLocale, string>> = {
  screening: {
    en: 'Canopy Screening',
    hi: 'कैनोपी स्क्रीनिंग',
    gu: 'કેનોપી સ્ક્રીનિંગ',
    mr: 'कॅनॉपी तपासणी'
  },
  canopy: {
    en: 'Upper Canopy',
    hi: 'ऊपरी कैनोपी',
    gu: 'ઉપરની કેનોપી',
    mr: 'वरची कॅनॉपी'
  },
  stem: {
    en: 'Stem Base',
    hi: 'तना आधार',
    gu: 'થડ / દાંડી',
    mr: 'खोडाचा भाग'
  },
  'close-up': {
    en: 'Close-up Leaf',
    hi: 'पत्ती क्लोज़-अप',
    gu: 'પાન ક્લોઝ-અપ',
    mr: 'पानाचे क्लोज-अप'
  }
};

export function localizeScoutingAngle(angle: string | undefined | null, locale?: string): string {
  if (!angle) return '';
  const normLocale = normalizeLocale(locale);
  const key = angle.trim().toLowerCase();
  return SCOUTING_ANGLES[key]?.[normLocale] || angle;
}
