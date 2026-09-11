// AI Farmer Assistant Knowledge Base
// Multilingual FAQ for KisanDost Chatbot

export const CONTACT_NUMBER = "+91 98765 43210";

export interface FAQEntry {
  keywords: string[]; // lowercase keywords to match
  answer: {
    en: string;
    hi: string;
    gu: string;
  };
  isComplex?: boolean;
}

export const KISANDOST_INFO = {
  en: `KisanDost is a free digital companion app for Indian farmers. It offers:
• 🌾 Crop Disease Detection – Identify diseases and get treatment advice
• 🧪 Fertilizer Calculator – Get exact NPK dosage for your crop and land
• ☁️ Weather Updates – Real-time local weather for your farm
• 📈 AI Profit Predictor – Predict your expected yield and profit
• 🌱 Crop Guide – Disease details, symptoms, and pesticide advice
All features are free and available in Hindi, English, and Gujarati.`,

  hi: `किसानDost भारतीय किसानों के लिए एक मुफ्त डिजिटल साथी एप है। इसमें ये सुविधाएं हैं:
• 🌾 फसल रोग पहचान – रोग की पहचान करें और इलाज जानें
• 🧪 खाद कैलकुलेटर – अपनी फसल के लिए सही NPK मात्रा जानें
• ☁️ मौसम जानकारी – आपके खेत का सही मौसम अपडेट
• 📈 AI लाभ अनुमान – अपनी उपज और कमाई का अनुमान लगाएं
• 🌱 फसल गाइड – रोग, लक्षण और कीटनाशक की जानकारी
सभी सुविधाएं मुफ्त हैं और हिंदी, अंग्रेजी, गुजराती में उपलब्ध हैं।`,

  gu: `KisanDost ભારતીય ખેડૂતો માટે એક મફત ડિજિટલ સાથી એપ છે. તેમાં આ સેવાઓ છે:
• 🌾 પાક રોગ ઓળખ – રોગ ઓળખો અને સારવાર જાણો
• 🧪 ખાતર કૅલ્ક્યુલેટર – તમારા પાક માટે સાચો NPK ડોઝ જાણો
• ☁️ હવામાન અપડેટ – ખેતર માટે તાજી હવામાન માહિતી
• 📈 AI નફો અનુમાન – ઉત્પાદન અને કમાણીનો અંદાજ
• 🌱 પાક ગાઈડ – રોગ, લક્ષણ અને જંતુનાશક માહિતી
બધી સુવિધાઓ મફત છે અને ગુજરાતી, હિન્દી, અંગ્રેજીમાં ઉપલબ્ધ છે।`
};

export const FAQ_DB: FAQEntry[] = [
  // ===================== GREETINGS =====================
  {
    keywords: ["hello", "hi", "hey", "namaste", "नमस्ते", "नमस्कार", "helo", "haalo", "kem cho", "kemon", "satsriyakal"],
    answer: {
      en: "Namaste! 🙏 Welcome to KisanDost — your digital farming companion! I can help you with crop diseases, fertilizer, weather, profit prediction, and more. What farming problem can I help you with today?",
      hi: "नमस्ते! 🙏 किसानDost में आपका स्वागत है! मैं आपको फसल रोग, खाद, मौसम, लाभ अनुमान और भी बहुत कुछ में मदद कर सकता हूँ। आज आपकी खेती में क्या समस्या है?",
      gu: "નમસ્તે! 🙏 KisanDost માં આપનું સ્વાગત છે! હું તમને પાક રોગ, ખાતર, હવામાન, નફા અનુમાન અને ઘણું બધું સમજावी शकुं छुं. આज ખેતીમાં શું તકલીફ છે?"
    }
  },

  // ===================== ABOUT APP =====================
  {
    keywords: ["app", "website", "kisandost", "kisan dost", "about", "features", "what is", "क्या है", "एप", "सुविधा", "શું છે", "એપ"],
    answer: {
      en: KISANDOST_INFO.en,
      hi: KISANDOST_INFO.hi,
      gu: KISANDOST_INFO.gu
    }
  },

  // ===================== CROP DISEASES =====================
  {
    keywords: ["disease", "bimari", "rog", "रोग", "बीमारी", "yellow", "पीला", "spots", "leaves", "पत्ते", "leaf", "rust", "rog", "jalai", "રોગ", "પાંદડા"],
    answer: {
      en: "For crop disease help:\n1. Go to the **Crop Disease** section in the menu.\n2. Select your crop (wheat, rice, cotton, etc.)\n3. You'll see common diseases, symptoms, and treatment.\n\n🌾 Common signs of disease:\n- Yellow leaves → Usually low nitrogen or waterlogging\n- Brown/rust spots → Fungal infection — spray dithane M-45\n- White powder on leaves → Use sulfur-based spray\n\nAlways consult a local agriculture officer for severe cases.",
      hi: "फसल रोग की मदद के लिए:\n1. मेनू में **फसल रोग** सेक्शन पर जाएं।\n2. अपनी फसल चुनें (गेहूं, धान, कपास आदि)\n3. आपको रोग, लक्षण और इलाज मिलेगा।\n\n🌾 रोग के सामान्य संकेत:\n- पीले पत्ते → नाइट्रोजन की कमी या जलभराव\n- भूरे धब्बे → फफूंद संक्रमण — डाइथेन M-45 छिड़कें\n- सफेद चूर्ण → गंधक वाला स्प्रे करें\n\nगंभीर मामलों में स्थानीय कृषि अधिकारी से मिलें।",
      gu: "પાક રોગ માટે:\n1. મેનૂમાં **પાક રોગ** વિભાગ પર જાઓ.\n2. તમારો પાક પસંદ કરો (ઘઉ, ડાંગર, કપાસ…)\n3. રોગ, લક્ષણ અને સારવાર જોવા મળશે.\n\n🌾 સામાન્ય રોગ ના ચિહ્ન:\n- પીળા પાંદડા → નાઇટ્રોજન ની ઊણપ\n- ભૂર ા ટળ → ફૂગ ચેપ — ડાઇથેન M-45 છ ા ંટો\n- સ ફ ેદ ભૂ કો → ગ ંધ ક આ ધ ારિ ત spr ay\n\nગ ંભ ીર ક ેસ મ ાં સ ्थ ान ীय ક ૃ ષ ि अ धि क ारी ન ો સ ં પ ર ્ ક ક ર ો."
    }
  },

  // ===================== FERTILIZER =====================
  {
    keywords: ["fertilizer", "khad", "खाद", "nitrogen", "npk", "urea", "dap", "dose", "ख ाद", "ख ात र", "n ু u tr ients", "ખ ાતર", "yd ose"],
    answer: {
      en: "Use our free **Fertilizer Calculator** tool!\n\n1. Go to 'Fertilizer Calculator' in the menu\n2. Enter your crop, land size, and soil type\n3. Get the exact Urea, DAP, and MOP quantity\n\n📝 General tips:\n- Sandy soil needs 20% more fertilizer\n- Clay soil retains more, use 10% less\n- Don't over-fertilize — it damages roots!\n- Apply in 2-3 splits for better absorption",
      hi: "हमारे **खाद कैलकुलेटर** का उपयोग करें!\n\n1. मेनू में 'खाद कैलकुलेटर' पर जाएं\n2. फसल, जमीन और मिट्टी का प्रकार लिखें\n3. यूरिया, DAP, MOP की सही मात्रा मिलेगी\n\n📝 सामान्य सुझाव:\n- रेतीली मिट्टी में 20% ज्यादा खाद चाहिए\n- चिकनी मिट्टी में 10% कम\n- ज्यादा खाद न दें — जड़ खराब होती है!\n- 2-3 बार में खाद दें, ज्यादा फायदा होगा",
      gu: "અ ما રي **ख ात र ક ૅ ル ্ ક ্ u લ ে ટ ર ்** ट ूल ว า ด ！\n\n1. メ ニ ュ ー ं म ें '高 ख ात र ك ैल क ्य ु ल ेट र ' ꓐꓣ ज ाए ं\n2. फ स ल , ज म ीन , म ित ्ट ى ব ल ि ख ें\n3. य ूर ि य ा , DAP, MOP ক ी स ही म ात ्र ा ม ि ल ेग ी\n\n📝 ख ेत ी ट ি প :\n- ر ेत ील ी म ि ट ्ट ी → 20% ज ्य ाद ा ख ात र\n- ช ि क न ी → 10% ক ম\n- ज ्य ाद ा ख ात र न े ज ड ़ ख र ाब ह ो त ी !"
    }
  },

  // ===================== WEATHER =====================
  {
    keywords: ["weather", "rain", "mausam", "baarish", "मौसम", "बारिश", "temperature", "tak", "haval", "hawa", "વ ars", "rainf all", "humidity"],
    answer: {
      en: "Check live weather using KisanDost's **Weather** feature!\n\n1. Tap 'Weather' in the menu\n2. Allow your location access\n3. Get real-time temperature, humidity, and rain forecast\n\n🌦️ Weather-based tips:\n- Sow seeds when soil temperature is 15–25°C\n- Avoid spraying pesticides before rain\n- Irrigate 1 day before expected dry spell\n- During heavy rain, check drainage in fields",
      hi: "KisanDost के **मौसम** फीचर से ताजा मौसम देखें!\n\n1. मेनू में 'मौसम' पर क्लिक करें\n2. लोकेशन की अनुमति दें\n3. तापमान, नमी, बारिश का अनुमान मिलेगा\n\n🌦️ मौसम के हिसाब से टिप्स:\n- बीज बोने के लिए 15-25°C तापमान अच्छा\n- बारिश से पहले कीटनाशक न छिड़कें\n- सूखे से पहले एक दिन पहले सिंचाई करें\n- भारी बारिश में खेत की नाली ठीक रखें",
      gu: "KisanDost ન ી **હવ ામ ાન** સ ુ બ િ ધ ા વ બ ় હ ર ।\n\n1. મ ে ન ુ મ ें 'હવ ામ ાન ' ક ্ લ િ ક ક ্ ઓ\n2. લ ો ક ેશ ન અ ન ુ મ ત િ દ િન\n3. ત ાપ મ ાન , આ ર ্ દ ্ ર ત ા, બ ાર િ શ આ ન ુમ ાન\n\n🌦️ હ ભ ામ ાન ટ િ પ :\n- એ 15-25°C મ ें બ ીજ બ ોન ો ભ ાલ ો હ ै\n- બ ાર િ શ સ े પ હ લે ક ીટન ાશ ક ન છ િ ડ ় ક ें"
    }
  },

  // ===================== IRRIGATION =====================
  {
    keywords: ["irrigation", "water", "sinchai", "paani", "pani", "सिंचाई", "पानी", "drip", "sprinkler", "overflow", "drought", "pal", "pan"],
    answer: {
      en: "Irrigation tips by crop:\n\n🌾 **Wheat**: 4-5 irrigations per season\n🌾 **Rice**: Keep 2-5 cm standing water always\n🌾 **Cotton**: Every 8-10 days in summer\n🌾 **Maize**: Every 7 days; avoid waterlogging\n\n💧 Best practices:\n- Water early morning or late evening to reduce evaporation\n- Drip irrigation saves 40-60% water\n- Never over-water — root rot is common",
      hi: "सिंचाई के सुझाव (फसल के हिसाब से):\n\n🌾 **गेहूं**: एक सीजन में 4-5 बार\n🌾 **धान**: हमेशा 2-5 सेमी पानी खड़ा रखें\n🌾 **कपास**: गर्मी में हर 8-10 दिन\n🌾 **मक्का**: हर 7 दिन; जलभराव न होने दें\n\n💧 अच्छी आदतें:\n- सुबह या शाम को पानी दें — वाष्पीकरण कम होगा\n- ड्रिप सिंचाई से 40-60% पानी बचता है\n- ज्यादा पानी मत दें — जड़ सड़ जाती है",
      gu: "ส ि ंচ ाई ट ি ப ्स (ف ़ স ল অ ন ु স ार ):\n\n🌾 **ঘ ে ঊ ं**: ए ক স ी জ ন म ें 4-5 ব ার\n🌾 **ड ांग र**: 2-5 स ेम ी প ান ी স ্ থ ায ী ر ক ্ ख ें\n🌾 **ক প াস**: গ ্র ্ ম ी में হ ਰ 8-10 দ িন\n\n💧 ট ি প :\n- স কা ল ে / স ন্ধ্ ย ায় প ান ী দ িন\n- ড ্ র ি প = 40-60% জল ব ਚ ਤ\n- ज ्y াদ া প ান ী = জ ড় স ড়"
    }
  },

  // ===================== PROFIT PREDICTOR =====================
  {
    keywords: ["profit", "yield", "labh", "kamai", "income", "revenue", "earnings", "prediction", "predict", "upaj", "लाभ", "कमाई", "उपज", "अनुमान", "નফ ো", "ઉπ α ज"],
    answer: {
      en: "Use our **AI Profit Predictor** tool!\n\nGo to 'Profit Intelligence' (✨ icon) in the menu.\n\nEnter:\n- Crop type (wheat, rice, cotton...)\n- Land area (in acres)\n- Soil NPK levels\n- Expected rainfall\n- Fertilizer quantity used\n\nThe AI will show you:\n✅ Predicted yield (quintals)\n✅ Market price per quintal\n✅ Net profit estimate\n✅ AI smart insights",
      hi: "हमारे **AI लाभ अनुमान** टूल का उपयोग करें!\n\nमेनू में 'प्रॉफिट इंटेलिजेंस' (✨ आइकन) पर जाएं।\n\nभरें:\n- फसल का प्रकार (गेहूं, धान, कपास...)\n- जमीन (एकड़ में)\n- मिट्टी के NPK स्तर\n- अपेक्षित बारिश\n- खाद की मात्रा\n\nAI दिखाएगा:\n✅ अनुमानित उपज (क्विंटल)\n✅ मंडी मूल्य\n✅ शुद्ध लाभ\n✅ स्मार्ट सुझाव",
      gu: "**AI ন ফ া অ ন ু ম ান ** ट ूल उ প য ো গ ক ্ ও !\n\nম ে ন ু ত ে 'প ্ র ফ িট ই ন ্ ট ে ল িজ ে ন ্ স ' (✨ আ ই ক ন ) ক ্ ল িক ক ্ ও ।\n\nভ র ন :\n- ফ স ল ের ধ র ন\n- জ ম ি (এ ক ্ ড় ে )\n- মাটির NPK\n- বৃষ্টিপাত\n\n✅ উৎপাদন অনুমান\n✅ বাজার মূল্য\n✅ খাঁটি লাভ"
    }
  },

  // ===================== SEEDS =====================
  {
    keywords: ["seed", "beej", "बीज", "sow", "variety", "kism", "किस्म", "hybrid", "bia", "bij"],
    answer: {
      en: "Choosing the right seed is key!\n\n🌱 Tips for seed selection:\n- Choose **certified seeds** from government centers or Kisan Seva Kendras\n- Select varieties suited to your region's climate\n- Hybrid seeds give more yield but need more water and fertilizer\n- Treat seeds with fungicide before sowing to prevent early disease\n\nCommon high-yield varieties:\n- Wheat: HD-2967, GW-496\n- Rice: Basmati-1121, Swarna\n- Cotton: Bt-Cotton (RCH-659)",
      hi: "सही बीज चुनना बहुत जरूरी है!\n\n🌱 बीज चुनने के टिप्स:\n- **प्रमाणित बीज** खरीदें — सरकारी केंद्र या किसान सेवा केंद्र से\n- अपने क्षेत्र के मौसम के अनुकूल किस्म चुनें\n- संकर (हाइब्रिड) बीज ज्यादा उपज देते हैं पर ज्यादा देखभाल चाहिए\n- बुआई से पहले फफूंद नाशक से बीज उपचार करें\n\nउच्च उत्पादन किस्में:\n- गेहूं: HD-2967, GW-496\n- धान: बासमती-1121, स्वर्णा\n- कपास: Bt-कपास (RCH-659)",
      gu: "સ ही ব ীজ প াস ন ড় া ज र ़ ूर ी ह ै !\n\n🌱 ব ীজ ট ি প :\n- প ্ ر ম ाণ িত ব ীজ ক ি ন ু ন\n- এ ল াক ার জল ব ায ু অ ন ু য ায ী ব িজ\n- হ াই ব ্ র িড = জ্য াদ া উ ৎ প াদ ন\n\n উ চ্ চ উ ৎ প াদ ন জাত:\n- ঘ ে ও := HD-2967\n- ড া ঙ্ গ র : বাসমতি-1121\n- ক প াস : Bt-কাপাস"
    }
  },

  // ===================== GOVERNMENT SCHEMES =====================
  {
    keywords: ["scheme", "yojana", "sarkar", "government", "subsidy", "yojna", "योजना", "सरकार", "सब्सिडी", "pm kisan", "फसल बीमा", "kcc", "loan", "insurance"],
    answer: {
      en: "Important government schemes for farmers:\n\n🏛️ **PM-KISAN**: ₹6000/year directly in bank account\n🌾 **Pradhan Mantri Fasal Bima Yojana**: Crop insurance\n💳 **Kisan Credit Card (KCC)**: Low-interest farm loan\n🧑‍🌾 **Soil Health Card**: Free soil testing\n🚿 **PM Krishi Sinchayee Yojana**: Drip irrigation subsidy\n\nTo apply: Visit your nearest **Krishi Bhavan** or go to pmkisan.gov.in\n\nFor detailed scheme guidance, contact our expert.",
      hi: "किसानों के लिए महत्वपूर्ण सरकारी योजनाएं:\n\n🏛️ **PM-KISAN**: हर साल ₹6000 सीधे खाते में\n🌾 **प्रधानमंत्री फसल बीमा योजना**: फसल को बीमा\n💳 **किसान क्रेडिट कार्ड (KCC)**: सस्ते कर्ज की सुविधा\n🧑‍🌾 **मृदा स्वास्थ्य कार्ड**: मुफ्त मिट्टी जांच\n🚿 **PM Krishi Sinchayee Yojana**: ड्रिप सिंचाई सब्सिडी\n\nआवेदन के लिए नजदीकी **कृषि भवन** जाएं या pmkisan.gov.in\n\nविस्तृत जानकारी के लिए हमारे एक्सपर्ट से संपर्क करें।",
      gu: "ख ेड ূত ো ি ো র জ ন ্ য স র ক ার ি য োজ ন া:\n\n🏛️ **PM-KISAN**: প ্ র ত ি বছ র ₹6000 সরাস রি\n🌾 **ফ স ল ব ি ম া**: ফ স লের ব ি ম া\n💳 **KCC**: স স ্ ত া ঋ ণ\n🧑‍🌾 **স য় েল হ ে ল থ কার্ড**: ব ি ন ামূ ল ্ য ে মাটি পরীক্ষা\n\nআবেদনের জন্য কৃষি ভবন যান।"
    }
  },

  // ===================== PEST MANAGEMENT =====================
  {
    keywords: ["pest", "insect", "kida", "keeda", "कीड़ा", "कीट", "टिड्डी", "locust", "aphid", "bollworm", "spray", "keetnaashak", "कीटनाशक", "जीवाત"],
    answer: {
      en: "Pest control tips:\n\n🐛 First identify the pest type — different pests need different treatments!\n\n✅ Common pests & solutions:\n- **Aphids (Maahu)**: Imidacloprid 17.8 SL spray\n- **Bollworm (cotton)**: Chloropyriphos + Cypermethrin\n- **Brown Plant Hopper (rice)**: Drain water + Buprofezin spray\n- **Locusts**: Contact agriculture department immediately\n\n⚠️ Safety: Always wear gloves and mask while spraying. Spray early morning or evening, never in wind.",
      hi: "कीट नियंत्रण के सुझाव:\n\n🐛 पहले कीट की पहचान करें — हर कीट का इलाज अलग होता है!\n\n✅ सामान्य कीट और उपाय:\n- **माहू (Aphid)**: Imidacloprid 17.8 SL स्प्रे\n- **बॉलवर्म (कपास)**: Chloropyriphos + Cypermethrin\n- **भूरा माहो (धान)**: पानी निकालें + Buprofezin\n- **टिड्डी दल**: तुरंत कृषि विभाग को बताएं\n\n⚠️ सुरक्षा: स्प्रे करते समय दस्ताने और मास्क जरूर पहनें। सुबह या शाम छिड़कें, हवा में नहीं।",
      gu: "জীবাত ন ি য ়ন ্ ত ্ র ণ :\n\n🐛 প ্ র থ ম ে জীবাত ও ল খ ন – ব ি ব িধ ज ীব াত ে র ব ়্ বস্থ া ব হ ু:\n\n✅ সামান্য ও উপান:\n- **মাহু**: Imidacloprid 17.8 SL\n- **বলওর্ম (কপাস)**: Chloropyriphos\n- **ধান মাহো**: পানি ক াঢ় ো + Buprofezin\n\n⚠️ স ুর ক্ষা: গ্ল ো ভ স এব ং মাস্ক প র ু ন।"
    }
  },

  // ===================== SOIL =====================
  {
    keywords: ["soil", "mitti", "jamin", "ph", "मिट्टी", "जमीन", "soil test", "clay", "sandy", "loamy", "organic", "compost", "vermicompost", "माटी", "ज म ीन"],
    answer: {
      en: "Soil health is the foundation of farming!\n\n🧪 Get a **Soil Health Card** free from your local agriculture office.\n\nIdeal soil pH: **6.5 – 7.5**\n\nFix soil problems:\n- Too acidic (pH<6): Add lime\n- Too alkaline (pH>8): Add gypsum or sulfur\n- Sandy soil: Add organic compost to retain water\n- Clay soil: Add sand and organic matter for better drainage\n\n🌿 Tip: Add vermicompost every season to improve soil naturally!",
      hi: "मिट्टी की सेहत खेती की नींव है!\n\n🧪 नजदीकी कृषि कार्यालय से मुफ्त **मृदा स्वास्थ्य कार्ड** लें।\n\nआदर्श pH: **6.5 – 7.5**\n\nमिट्टी ठीक करें:\n- बहुत अम्लीय (pH<6): चूना डालें\n- बहुत क्षारीय (pH>8): जिप्सम या गंधक डालें\n- रेतीली: जैविक खाद से पानी रोकने की क्षमता बढ़ाएं\n- चिकनी: अच्छी जल निकासी के लिए रेत+जैविक खाद\n\n🌿 सुझाव: हर सीजन वर्मीकम्पोस्ट डालें!",
      gu: "মাটির স্বাস্থ্ য ख ेত ीর ভিত্তি!\n\n🧪 ক ৃষ ি দপ্ তর থেকে ব ি ন ামূ ল ্ যে **মৃ দা কার্ড** ন িন।\n\nসঠিক pH: **6.5 – 7.5**\n\nম াটি ঠিক:\n- অ্যাসিডিক: চু ন à দ িন\n- ক্ষারীয়: জিপসাম\n- বালি মাটি: জৈব স ার\n\n🌿 প্রতি মওসুম ভার্মিকম্পোস্ট দিন!"
    }
  },

  // ===================== MANDI / MARKET PRICE =====================
  {
    keywords: ["mandi", "price", "market", "dam", "दाम", "मंडी", "rate", "bhav", "बाजार", "कीमत", "sell", "wheat price", "rice price"],
    answer: {
      en: "For crop prices:\n\nUse our **AI Profit Predictor** — it fetches current mandi prices for wheat, rice, cotton, maize, soybean, and more from APMC data.\n\n📊 Current approximate APMC prices (per quintal):\n- Wheat: ₹2100–2200\n- Paddy/Rice: ₹1900–2100\n- Cotton: ₹6500–7000\n- Maize: ₹1700–1900\n- Soybean: ₹4300–4600\n\n⚠️ Prices vary by location and date. Visit your nearest Krishi Upaj Mandi for exact rates.",
      hi: "फसल के भाव के लिए:\n\nहमारा **AI लाभ अनुमान** देखें — यह APMC डेटा से ताजे मंडी भाव दिखाता है।\n\n📊 अनुमानित APMC भाव (प्रति क्विंटल):\n- गेहूं: ₹2100–2200\n- धान/चावल: ₹1900–2100\n- कपास: ₹6500–7000\n- मक्का: ₹1700–1900\n- सोयाबीन: ₹4300–4600\n\n⚠️ भाव जगह और समय के अनुसार बदलते हैं। नजदीकी मंडी जाएं।",
      gu: "ফস ল ের দ াম এর জ ন্ য:\n\n📊 আন ু মা নিক APMC দ াম (প ্ র তি ক ্ ব ি ন্ ট াল ):\n- ঘ ে ঊ ং: ₹2100–2200\n- ধান: ₹1900–2100\n- কাপাস: ₹6500–7000\n- ভুট্টা: ₹1700–1900\n\n⚠️ দ ামে র পরিবর্তন হ য়, নিকটবর্তী মান্ডি যান."
    }
  },

  // ===================== CONTACT =====================
  {
    keywords: ["contact", "call", "phone", "help", "expert", "sampark", "संपर्क", "helpline", "number", "officer", "olas"],
    answer: {
      en: `Need expert help? Contact our KisanDost team!\n\n📞 **Helpline: ${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 Monday–Saturday: 9 AM – 6 PM\n\nOur agriculture experts can help with:\n- Location-specific farming advice\n- Complex disease diagnosis\n- Government scheme applications\n- Soil testing guidance`,
      hi: `विशेषज्ञ की मदद चाहिए? किसानDost टीम से संपर्क करें!\n\n📞 **हेल्पलाइन: ${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 सोमवार–शनिवार: सुबह 9 – शाम 6\n\nहमारे कृषि विशेषज्ञ मदद करेंगे:\n- स्थान-विशेष खेती सलाह\n- जटिल रोग का निदान\n- सरकारी योजना आवेदन\n- मिट्टी जांच मार्गदर्शन`,
      gu: `বিশেষজ্ঞ সাহায্য দরকার? KisanDost টিম কে যোগাযোগ করুন!\n\n📞 **হেল্পলাইন: ${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 সোমবার–শনিবার: সকাল 9 – সন্ধ্যা 6\n\nস্থানীয় বিশেষজ্ঞ সাহায্য করবেন।`
    }
  }
];

// Keywords that indicate a COMPLEX question beyond simple FAQ
export const COMPLEX_KEYWORDS = [
  "soil chemistry", "chromatography", "spectrometry", "genetic", "laboratory",
  "legal", "court", "land dispute", "property", "जमीन विवाद", "अदालत",
  "insurance claim", "बीमा दावा", "compensation", "compensation",
  "clinical", "medical", "doctor", "veterinary", "vet",
  "export", "निर्यात", "import", "आयात",
  "tax", "income tax", "gst", "कर", "टैक्स",
  "complex formula", "जटिल सूत्र"
];
