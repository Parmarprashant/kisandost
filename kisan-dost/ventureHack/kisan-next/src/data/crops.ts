export type TranslationMap = { en: string; hi: string; gu: string; mr?: string };

export interface CropDisease {
  name: TranslationMap;
  symptoms: TranslationMap;
  favorableConditions: TranslationMap;
  management: TranslationMap;
  icon: string;
}

export interface CropData {
  id: string;
  name: TranslationMap;
  image: string;
  season: TranslationMap;
  soilType: TranslationMap;
  waterNeed: TranslationMap;
  health: "Healthy" | "Moderate" | "Stress";
  ndvi: number;
  diseases: CropDisease[];
  precautions: TranslationMap;
}

export const CROPS: CropData[] = [
  {
    id: "wheat",
    name: { en: "Wheat", hi: "गेहूँ", gu: "ઘઉં", mr: "गहू" },
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80",
    season: { en: "Rabi (Winter)", hi: "रबी (सर्दी)", gu: "રવિ (શિયાળો)", mr: "रब्बी (हिवाळा)" },
    soilType: { en: "Loamy", hi: "दोमट", gu: "ગોરાડુ", mr: "गाळाची / पोयटा" },
    waterNeed: { en: "Moderate", hi: "मध्यम", gu: "મધ્યમ", mr: "मध्यम" },
    health: "Healthy",
    ndvi: 0.72,
    diseases: [
      {
        name: { en: "Yellow Rust", hi: "पीला रतुआ", gu: "પીળો ગેરુ", mr: "पिवळा तांबेरा" },
        symptoms: {
          en: "Yellow pustules arranged in long stripes on leaves.",
          hi: "पत्तियों पर लंबी धारियों में व्यवस्थित पीले फफोले।",
          gu: "પાંદડા પર લાંબી પટ્ટીઓમાં ગોઠવાયેલા પીળા ફોલ્લીઓ.",
          mr: "पानांवर लांब पट्ट्यांमध्ये पिवळे फोड."
        },
        favorableConditions: {
          en: "Cool and moist weather (10-20°C) with high humidity.",
          hi: "उच्च आर्द्रता के साथ ठंडा और नम मौसम (10-20 डिग्री सेल्सियस)।",
          gu: "ઉચ્ચ ભેજ સાથે ઠંડુ અને ભેજવાળું વાતાવરણ (૧૦-૨૦° સે).",
          mr: "थंड आणि दमट हवामान (10-20° से) उच्च आर्द्रतेसह."
        },
        management: {
          en: "Spray Propiconazole 25 EC @ 500 ml/ha.",
          hi: "प्रोपिकोनाज़ोल 25 EC का 500 मिली/हेक्टेयर की दर से छिड़काव करें।",
          gu: "પ્રોપિકોનાઝોલ ૨૫ EC @ ૫૦૦ મિલી/હેક્ટરનો છંટકાવ કરો.",
          mr: "प्रोपिकोनाझोल 25 EC 500 मिली/हेक्टर फवारा."
        },
        icon: "🦠"
      },
      {
        name: { en: "Powdery Mildew", hi: "पाउडरी मिल्ड्यू", gu: "પાવડરી માઇલ્ડ્યુ", mr: "भुरी रोग" },
        symptoms: {
          en: "White powdery growth on leaves and stems.",
          hi: "पत्तियों और तनों पर सफेद पाउडर जैसी वृद्धि।",
          gu: "પાંદડા અને દાંડી પર સફેદ પાવડર જેવી વૃદ્ધિ.",
          mr: "पाने आणि खोडावर पांढरी पावडरसारखी बुरशी."
        },
        favorableConditions: {
          en: "Warm, dry days and cool, damp nights.",
          hi: "गर्म, शुष्क दिन और ठंडी, नम रातें।",
          gu: "ગરમ, શુષ્ક દિવસો અને ઠંડી, ભીની રાતો.",
          mr: "उबदार, कोरडे दिवस आणि थंड, दमट रात्री."
        },
        management: {
          en: "Apply Sulfur-based fungicides or Dinocap.",
          hi: "सल्फर आधारित कवकनाशी या डाइनोकैप का प्रयोग करें।",
          gu: "સલ્ફર આધારિત ફૂગનાશક અથવા ડીનોકેપ લગાવો.",
          mr: "सल्फर आधारित बुरशीनाशक वापरा."
        },
        icon: "💨"
      }
    ],
    precautions: {
      en: "Maintain proper spacing and avoid waterlogging.",
      hi: "उचित दूरी बनाए रखें और जलभराव से बचें।",
      gu: "યોગ્ય અંતર જાળવો અને પાણી ભરાવવાનું ટાળો.",
      mr: "योग्य अंतर ठेवा आणि पाणी साचू देऊ नका."
    }
  },
  {
    id: "rice",
    name: { en: "Rice", hi: "चावल (धान)", gu: "ચોખા (ડાંગર)", mr: "भात (तांदूळ)" },
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
    season: { en: "Kharif (Monsoon)", hi: "खरीफ (मानसून)", gu: "ખરીફ (ચોમાસું)", mr: "खरीप (पावसाळा)" },
    soilType: { en: "Clay", hi: "चिकनी", gu: "કાંપવાળી", mr: "काळी / चिकणमाती" },
    waterNeed: { en: "High", hi: "अधिक", gu: "વધુ", mr: "जास्त" },
    health: "Moderate",
    ndvi: 0.55,
    diseases: [
      {
        name: { en: "Blast Disease", hi: "ब्लास्ट रोग", gu: "બ્લાસ્ટ રોગ", mr: "करपा रोग" },
        symptoms: {
          en: "Spindle-shaped lesions with grey centers on leaves.",
          hi: "पत्तियों पर भूरे केंद्र वाले धुरी के आकार के घाव।",
          gu: "પાંદડા પર ગ્રે કેન્દ્ર સાથે ત્રાક આકારના ટપકાં.",
          mr: "पानांवर राखाडी केंद्रासह करपा ठिपके."
        },
        favorableConditions: {
          en: "High humidity, frequent rain, and night temperatures below 20-24°C.",
          hi: "उच्च आर्द्रता, लगातार बारिश और रात का तापमान 20-24 डिग्री सेल्सियस से नीचे।",
          gu: "ઉચ્ચ ભેજ, વારંવાર વરસાદ અને રાત્રિનું તાપમાન ૨૦-૨૪°C થી નીચે.",
          mr: "उच्च आर्द्रता, वारंवार पाऊस आणि रात्रीचे तापमान 20-24°C पेक्षा कमी."
        },
        management: {
          en: "Spray Tricyclazole 75 WP @ 0.6 g/L.",
          hi: "ट्राइसाइक्लाज़ोल 75 WP का 0.6 ग्राम/लीटर की दर से छिड़काव करें।",
          gu: "ટ્રાયસાઇક્લાઝોલ ૭૫ WP @ ૦.૬ ગ્રામ/લિટરનો છંટકાવ કરો.",
          mr: "ट्रायसायक्लॅझोल 75 WP @ 0.6 ग्रॅम/लिटर फवारा."
        },
        icon: "🍂"
      }
    ],
    precautions: {
      en: "Ensure water level is maintained 2-5 cm.",
      hi: "सुनिश्चित करें कि जल स्तर 2-5 सेमी बना रहे।",
      gu: "ખાતરી કરો કે પાણીનું સ્તર ૨-૫ સેમી જળવાયેલું રહે.",
      mr: "पाण्याची पातळी 2-5 सेमी राखली जाईल याची खात्री करा."
    }
  },
  {
    id: "maize",
    name: { en: "Maize", hi: "मक्का", gu: "મકાઈ", mr: "मका" },
    image: "https://globebag.com/cdn/shop/articles/GlobeBagCompanyInc-254376-Corn-and-Maize-blogbanner1.jpg?v=1698325076",
    season: { en: "Kharif (Monsoon)", hi: "खरीफ (मानसून)", gu: "ખરીફ (ચોમાસું)", mr: "खरीप (पावसाळा)" },
    soilType: { en: "Well-drained Loamy", hi: "अच्छी जल निकासी वाली दोमट", gu: "સારી નિતારવાળી ગોરાડુ", mr: "पाण्याचा निचरा होणारी जमीन" },
    waterNeed: { en: "Moderate", hi: "मध्यम", gu: "મધ્યમ", mr: "मध्यम" },
    health: "Healthy",
    ndvi: 0.65,
    diseases: [{
      name: { en: "Stem Borer", hi: "तना छेदक", gu: "ગાભમારાની ઈયળ", mr: "खोडकिडा" },
      symptoms: {
        en: "Pin holes in leaves, dead hearts in center.",
        hi: "पत्तियों में छेद, केंद्र में 'डेड हार्ट' (सूखा केंद्र)।",
        gu: "પાંદડામાં છિદ્રો, વચમાં સુકાયેલું કેન્દ્ર (ડેડ હાર્ટ).",
        mr: "पानांवर बारीक छिद्रे आणि शेंड्यातील मर."
      },
      favorableConditions: {
        en: "Moderate temperatures and high humidity.",
        hi: "मध्यम तापमान और उच्च आर्द्रता।",
        gu: "મધ્યમ તાપમાન અને ઉચ્ચ ભેજ.",
        mr: "मध्यम तापमान आणि उच्च आर्द्रता."
      },
      management: {
        en: "Apply Carbofuran 3G @ 33 kg/ha.",
        hi: "कार्बोफ्यूरान 3G का 33 किग्रा/हेक्टेयर की दर से प्रयोग करें।",
        gu: "કાર્બોફ્યુરાન ૩જી @ ૩૩ કિગ્રા/હેક્ટરનો ઉપયોગ કરો.",
        mr: "कार्बोफ्युरॉन 3G @ 33 किलो/हेक्टर वापरा."
      },
      icon: "🐛"
    }],
    precautions: {
      en: "Apply neem oil as preventive spray.",
      hi: "निवारक स्प्रे के रूप में नीम का तेल लगाएं।",
      gu: "નિવારક સ્પ્રે તરીકે લીમડાનું તેલ લગાવો.",
      mr: "प्रतिबंधात्मक फवारणी म्हणून निंबोळी तेल वापरा."
    }
  },
  {
    id: "cotton",
    name: { en: "Cotton", hi: "कपास", gu: "કપાસ", mr: "कापूस" },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQggsehAILLPTBdlDWdULNE9Fsz3SEXjAHbcg&s",
    season: { en: "Kharif (Monsoon)", hi: "खरीफ (मानसून)", gu: "ખરીફ (ચોમાસું)", mr: "खरीप (पावसाळा)" },
    soilType: { en: "Black Soil", hi: "काली मिट्टी", gu: "કાળી માટી", mr: "काळी कसदार जमीन" },
    waterNeed: { en: "Moderate", hi: "मध्यम", gu: "મધ્યમ", mr: "मध्यम" },
    health: "Stress",
    ndvi: 0.38,
    diseases: [{
      name: { en: "Pink Bollworm", hi: "गुलाबी सुंडी", gu: "ગુલાબી ઈયળ", mr: "गुलाबी बोंडअळी" },
      symptoms: {
        en: "Rosetted flowers and holes in bolls.",
        hi: "गुलाब जैसे फूल और कपास के गोलों में छेद।",
        gu: "ગુલાબ જેવું ફૂલ અને ઝીંડવામાં છિદ્રો.",
        mr: "गुलाबासारखी फुले आणि बोंडांना छिद्रे."
      },
      favorableConditions: {
        en: "Late sowing and excessive nitrogen application.",
        hi: "देर से बुवाई और अत्यधिक नाइट्रोजन का प्रयोग।",
        gu: "મોડી વાવણી અને નાઈટ્રોજનનો વધુ પડતો ઉપયોગ.",
        mr: "उशिरा पेरणी आणि अति नत्र वापर."
      },
      management: {
        en: "Spray Profenophos 50 EC @ 2 ml/L.",
        hi: "प्रोफेनोफोस 50 EC का 2 मिली/लीटर की दर से छिड़काव करें।",
        gu: "પ્રોફેનોફોસ ૫૦ EC @ ૨ મિલી/લિટરનો છંટકાવ કરો.",
        mr: "प्रोफेनोफॉस 50 EC @ 2 मिली/लिटर फवारा."
      },
      icon: "🐛"
    }],
    precautions: {
      en: "Install pheromone traps to monitor adult moths.",
      hi: "वयस्क पतंगों की निगरानी के लिए फेरोमोन जाल स्थापित करें।",
      gu: "પુખ્ત ફૂદાંનું નિરીક્ષણ કરવા ફેરોમોન ટ્રેપ્સ લગાવો.",
      mr: "कामगंध सापळे लावा."
    }
  },
  {
    id: "tomato",
    name: { en: "Tomato", hi: "टमाटर", gu: "ટામેટા", mr: "टोमॅटो" },
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
    season: { en: "Rabi/Kharif", hi: "रबी/खरीफ", gu: "રવિ/ખરીફ", mr: "रब्बी/खरीप" },
    soilType: { en: "Well-drained Loamy", hi: "अच्छी जल निकासी वाली दोमट", gu: "સારી નિતારવાળી ગોરાડુ", mr: "पाण्याचा निचरा होणारी जमीन" },
    waterNeed: { en: "Moderate", hi: "मध्यम", gu: "મધ્યમ", mr: "मध्यम" },
    health: "Healthy",
    ndvi: 0.70,
    diseases: [{
      name: { en: "Early Blight", hi: "अगेती झुलसा", gu: "આગોતરો સુકારો", mr: "लवकर येणारा करपा" },
      symptoms: {
        en: "Small black spots on older leaves.",
        hi: "पुरानी पत्तियों पर छोटे काले धब्बे।",
        gu: "નાના કાળા ટપકાં.",
        mr: "जुन्या पानांवर लहान काळे ठिपके."
      },
      favorableConditions: {
        en: "Warm temperatures and high humidity/frequent rainfall.",
        hi: "गर्म तापमान और उच्च आर्द्रता/लगातार वर्षा।",
        gu: "ગરમ તાપમાન અને ઉચ્ચ ભેજ/વારંવાર વરસાદ.",
        mr: "उबदार तापमान आणि उच्च आर्द्रता."
      },
      management: {
        en: "Spray Mancozeb @ 2 g/L.",
        hi: "मैन्कोज़ेब का 2 ग्राम/लीटर की दर से छिड़काव करें।",
        gu: "મેન્કોઝેબ @ ૨ ગ્રામ/લિટરનો છંટકાવ કરો.",
        mr: "मॅन्कोझेब @ 2 ग्रॅम/लिटर फवारा."
      },
      icon: "🍂"
    }],
    precautions: {
      en: "Use proper staking.",
      hi: "उचित स्टेकिंग (सहारा) का उपयोग करें।",
      gu: "યોગ્ય ટેકાનો ઉપયોગ કરો.",
      mr: "झाडांना योग्य आधार द्या."
    }
  },
  {
    id: "groundnut",
    name: { en: "Groundnut", hi: "मूँगफली", gu: "મગફળી", mr: "भुईमूग" },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR883uFxIsCjqMgZzzVdoePYo0ofUUPFAk4cQ&s",
    season: { en: "Kharif/Summer", hi: "खरीफ/गर्मी", gu: "ખરીફ/ઉનાળો", mr: "खरीप/उन्हाळा" },
    soilType: { en: "Sandy Loam", hi: "रेतीली दोमट", gu: "રેતાળ ગોરાડુ", mr: "वाळूमिश्रित पोयटा" },
    waterNeed: { en: "Moderate", hi: "मध्यम", gu: "મધ્યમ", mr: "मध्यम" },
    health: "Healthy",
    ndvi: 0.68,
    diseases: [{
      name: { en: "Tikka Leaf Spot", hi: "टिक्का पत्ती धब्बा", gu: "ટીક્કા રોગ", mr: "टिक्का रोग" },
      symptoms: {
        en: "Dark brown spots on leaves with yellow halos.",
        hi: "पत्तियों पर पीले आभामंडल के साथ गहरे भूरे रंग के धब्बे।",
        gu: "પીળા તેજોવલય સાથે પાંદડા પર ઘેરા કથ્થઈ ડાઘ.",
        mr: "पानांवर पिवळ्या कडा असलेले तपकिरी ठिपके."
      },
      favorableConditions: {
        en: "Prolonged high humidity and moderate temperatures.",
        hi: "लंबे समय तक उच्च आर्द्रता और मध्यम तापमान।",
        gu: "લાંબા સમય સુધી ઉચ્ચ ભેજ અને મધ્યમ તાપમાન.",
        mr: "दीर्घकाळ उच्च आर्द्रता आणि मध्यम तापमान."
      },
      management: {
        en: "Spray Carbendazim @ 1 g/L.",
        hi: "कार्बेन्डाजिम का 1 ग्राम/लीटर की दर से छिड़काव करें।",
        gu: "કાર્બેન્ડાઝીમ @ ૧ ગ્રામ/લિટરનો છંટકાવ કરો.",
        mr: "कार्बेन्डाझिम @ 1 ग्रॅम/लिटर फवारा."
      },
      icon: "🍂"
    }],
    precautions: {
      en: "Seed treatment with Thiram.",
      hi: "थायराम के साथ बीज उपचार।",
      gu: "થાયરમ સાથે બીજ માવજત.",
      mr: "थायरमने बीजप्रक्रिया करा."
    }
  },
  {
    id: "mango",
    name: { en: "Mango", hi: "आम", gu: "કેરી", mr: "आंबा" },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThOcRxyVWvp1fOIWFQlWahs9H0j3LhYVkrdQ&s",
    season: { en: "Perennial", hi: "बारहमासी", gu: "બારમાસી", mr: "बारमाही" },
    soilType: { en: "Well-drained", hi: "अच्छी जल निकासी वाली", gu: "સારી નિતારવાળી", mr: "पाण्याचा चांगला निचरा होणारी जमीन" },
    waterNeed: { en: "Moderate", hi: "मध्यम", gu: "મધ્યમ", mr: "मध्यम" },
    health: "Healthy",
    ndvi: 0.85,
    diseases: [{ 
      name: { en: "Powdery Mildew", hi: "पाउडरी मिल्ड्यू", gu: "છાછિયો રોગ", mr: "भुरी रोग" }, 
      symptoms: { 
        en: "White powdery growth on flowers and fruits.", 
        hi: "फूलों और फलों पर सफेद पाउडर जैसी वृद्धि।", 
        gu: "ફૂલો અને ફળો પર સફેદ પાવડર જેવી વૃદ્ધિ.",
        mr: "फुले आणि फळांवर पांढरी बुरशी." 
      },
      favorableConditions: { 
        en: "High humidity and moderate temperatures.", 
        hi: "उच्च आर्द्रता और मध्यम तापमान।", 
        gu: "ઉચ્ચ ભેજ અને મધ્યમ તાપમાન.",
        mr: "उच्च आर्द्रता आणि मध्यम तापमान." 
      },
      management: { 
        en: "Spray Wettable Sulphur @ 3 g/L.", 
        hi: "वेटेबल सल्फर का 3 ग्राम/लीटर की दर से छिड़काव करें।", 
        gu: "વેટેબલ સલ્ફર @ ૩ ગ્રામ/લિટરનો છંટકાવ કરો.",
        mr: "विद्राव्य गंधक @ 3 ग्रॅम/लिटर फवारा." 
      },
      icon: "💨" 
    }],
    precautions: {
      en: "Prune affected branches.",
      hi: "प्रभावित शाखाओं की छंटाई करें।",
      gu: "અસરગ્રસ્ત ડાળીઓનો કટાવ કરો.",
      mr: "बाधित फांद्यांची छाटणी करा."
    }
  }
];
