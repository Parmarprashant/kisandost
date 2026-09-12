// AI Farmer Assistant Knowledge Base
// Multilingual FAQ for KisanDost Chatbot

export const CONTACT_NUMBER = "+91 98765 43210";

export interface FAQEntry {
  keywords: string[]; // lowercase keywords to match
  answer: {
    en: string;
    hi: string;
    gu: string;
    mr: string;
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
All features are free and available in Hindi, English, Gujarati, and Marathi.`,

  hi: `किसानDost भारतीय किसानों के लिए एक मुफ्त डिजिटल साथी एप है। इसमें ये सुविधाएं हैं:
• 🌾 फसल रोग पहचान – रोग की पहचान करें और इलाज जानें
• 🧪 खाद कैलकुलेटर – अपनी फसल के लिए सही NPK मात्रा जानें
• ☁️ मौसम जानकारी – आपके खेत का सही मौसम अपडेट
• 📈 AI लाभ अनुमान – अपनी उपज और कमाई का अनुमान लगाएं
• 🌱 फसल गाइड – रोग, लक्षण और कीटनाशक की जानकारी
सभी सुविधाएं मुफ्त हैं और हिंदी, अंग्रेजी, गुजराती और मराठी में उपलब्ध हैं।`,

  gu: `KisanDost ભારતીય ખેડૂતો માટે એક મફત ડિજિટલ સાથી એપ છે. તેમાં આ સેવાઓ છે:
• 🌾 પાક રોગ ઓળખ – રોગ ઓળખો અને સારવાર જાણો
• 🧪 ખાતર કૅલ્ક્યુલેટર – તમારા પાક માટે સાચો NPK ડોઝ જાણો
• ☁️ હવામાન અપડેટ – ખેતર માટે તાજી હવામાન માહિતી
• 📈 AI નફો અનુમાન – ઉત્પાદન અને કમાણીનો અંદાજ
• 🌱 પાક ગાઈડ – રોગ, લક્ષણ અને જંતુનાશક માહિતી
બધી સુવિધાઓ મફત છે અને મરાઠી, ગુજરાતી, હિન્દી, અંગ્રેજીમાં ઉપલબ્ધ છે।`,

  mr: `किसानदोस्त हा भारतीय शेतकऱ्यांसाठी एक मोफत डिजिटल सोबती ॲप आहे. यामध्ये खालील सेवा उपलब्ध आहेत:
• 🌾 पीक रोग निदान – रोग ओळखा आणि उपचारांचा सल्ला मिळवा
• 🧪 खत कॅल्क्युलेटर – आपल्या पिकासाठी अचूक NPK डोस मिळवा
• ☁️ हवामान अंदाज – तुमच्या शेतासाठी रिअल-टाइम स्थानिक हवामान
• 📈 AI नफा अंदाज – अपेक्षित उत्पन्न आणि नफ्याचा अंदाज लावा
• 🌱 पीक मार्गदर्शिका – रोगांचे तपशील, लक्षणे आणि औषध सल्ला
सर्व वैशिष्ट्ये मोफत आहेत आणि मराठी, हिंदी, इंग्रजी, गुजरातीमध्ये उपलब्ध आहेत.`
};

export const FAQ_DB: FAQEntry[] = [
  // ===================== GREETINGS =====================
  {
    keywords: ["hello", "hi", "hey", "namaste", "नमस्ते", "नमस्कार", "helo", "haalo", "kem cho", "kemon", "satsriyakal", "namaskar"],
    answer: {
      en: "Namaste! 🙏 Welcome to KisanDost — your digital farming companion! I can help you with crop diseases, fertilizer, weather, profit prediction, and more. What farming problem can I help you with today?",
      hi: "नमस्ते! 🙏 किसानDost में आपका स्वागत है! मैं आपको फसल रोग, खाद, मौसम, लाभ अनुमान और भी बहुत कुछ में मदद कर सकता हूँ। आज आपकी खेती में क्या समस्या है?",
      gu: "નમસ્તે! 🙏 KisanDost માં આપનું સ્વાગત છે! હું તમને પાક રોગ, ખાતર, હવામાન, નફા અનુમાન અને ઘણું બધું સમજાવી શકું છું. આજે ખેતીમાં શું તકલીફ છે?",
      mr: "नमस्कार! 🙏 किसानदोस्त मध्ये आपले स्वागत आहे! मी तुम्हाला पिकांचे रोग, खते, हवामान, नफ्याचा अंदाज आणि इतर अनेक गोष्टींमध्ये मदत करू शकतो. आज तुम्हाला शेतीत काय मदत हवी आहे?"
    }
  },

  // ===================== ABOUT APP =====================
  {
    keywords: ["app", "website", "kisandost", "kisan dost", "about", "features", "what is", "क्या है", "एप", "सुविधा", "શું છે", "એપ", "काय आहे"],
    answer: {
      en: KISANDOST_INFO.en,
      hi: KISANDOST_INFO.hi,
      gu: KISANDOST_INFO.gu,
      mr: KISANDOST_INFO.mr
    }
  },

  // ===================== CROP DISEASES =====================
  {
    keywords: ["disease", "bimari", "rog", "रोग", "बीमारी", "yellow", "पीला", "spots", "leaves", "पत्ते", "leaf", "rust", "rog", "jalai", "રોગ", "પાંદડા", "किड", "पाने"],
    answer: {
      en: "For crop disease help:\n1. Go to the **Crop Disease** section in the menu.\n2. Select your crop (wheat, rice, cotton, etc.)\n3. You'll see common diseases, symptoms, and treatment.\n\n🌾 Common signs of disease:\n- Yellow leaves → Usually low nitrogen or waterlogging\n- Brown/rust spots → Fungal infection — spray dithane M-45\n- White powder on leaves → Use sulfur-based spray\n\nAlways consult a local agriculture officer for severe cases.",
      hi: "फसल रोग की मदद के लिए:\n1. मेनू में **फसल रोग** सेक्शन पर जाएं।\n2. अपनी फसल चुनें (गेहूं, धान, कपास आदि)\n3. आपको रोग, लक्षण और इलाज मिलेगा।\n\n🌾 रोग के सामान्य संकेत:\n- पीले पत्ते → नाइट्रोजन की कमी या जलभराव\n- भूरे धब्बे → फफूंद संक्रमण — डाइथेन M-45 छिड़कें\n- सफेद चूर्ण → गंधक वाला स्प्रे करें\n\nगंभीर मामलों में स्थानीय कृषि अधिकारी से मिलें।",
      gu: "પાક રોગ માટે:\n1. મેનૂમાં **પાક રોગ** વિભાગ પર જાઓ.\n2. તમારો પાક પસંદ કરો (ઘઉં, ડાંગર, કપાસ…)\n3. રોગ, લક્ષણ અને સારવાર જોવા મળશે.\n\n🌾 સામાન્ય રોગ ના ચિહ્ન:\n- પીળા પાંદડા → નાઇટ્રોજન ની ઊણપ\n- ભૂરા ટપકાં → ફૂગ ચેપ — ડાઇથેન M-45 છાંટો\n- સફેદ ભૂકો → ગંધક આધારિત સ્પ્રે\n\nગંભીર કેસમાં સ્થાનિક કૃષિ અધિકારીનો સંપર્ક કરો.",
      mr: "पीक रोगाच्या मदतीसाठी:\n१. मेनूमधील **पीक रोग** विभागात जा.\n२. तुमचे पीक निवडा (गहू, भात, कापूस इ.)\n३. तुम्हाला रोग, लक्षणे आणि उपचार दिसतील.\n\n🌾 रोगाची सामान्य लक्षणे:\n- पिवळी पाने → नायट्रोजनची कमतरता किंवा पाणी साचणे\n- तपकिरी धब्बे → बुरशीजन्य संसर्ग — डायथेन M-45 फवारा\n- पानांवर पांढरी पावडर → सल्फर आधारित फवारणी वापरा\n\nगंभीर प्रसंगी नेहमी स्थानिक कृषी अधिकाऱ्याचा सल्ला घ्या."
    }
  },

  // ===================== FERTILIZER =====================
  {
    keywords: ["fertilizer", "khad", "खाद", "nitrogen", "npk", "urea", "dap", "dose", "खत", "खताची मात्रा", "खाતર"],
    answer: {
      en: "Use our free **Fertilizer Calculator** tool!\n\n1. Go to 'Fertilizer Calculator' in the menu\n2. Enter your crop, land size, and soil type\n3. Get the exact Urea, DAP, and MOP quantity\n\n📝 General tips:\n- Sandy soil needs 20% more fertilizer\n- Clay soil retains more, use 10% less\n- Don't over-fertilize — it damages roots!\n- Apply in 2-3 splits for better absorption",
      hi: "हमारे **खाद कैलकुलेटर** का उपयोग करें!\n\n1. मेनू में 'खाद कैलकुलेटर' पर जाएं\n2. फसल, जमीन और मिट्टी का प्रकार लिखें\n3. यूरिया, DAP, MOP की सही मात्रा मिलेगी\n\n📝 सामान्य सुझाव:\n- रेतीली मिट्टी में 20% ज्यादा खाद चाहिए\n- चिकनी मिट्टी में 10% कम\n- ज्यादा खाद न दें — जड़ खराब होती है!\n- 2-3 बार में खाद दें, ज्यादा फायदा होगा",
      gu: "અમારા **ખાતર કૅલ્ક્યુલેટર** ટૂલનો ઉપયોગ કરો!\n\n1. મેનૂમાં 'ખાતર કૅલ્ક્યુલેટર' પર જાઓ\n2. પાક, જમીન અને માટીનો પ્રકાર લખો\n3. યુરિયા, DAP, MOP ની સાચી માત્રા મળશે\n\n📝 ખેતી ટીપ્સ:\n- રેતાળ માટી → 20% વધારે ખાતર\n- કાંપવાળી → 10% ઓછું\n- વધારે ખાતર ન આપવું — મૂળ બગડે છે!",
      mr: "आमच्या मोफत **खत कॅल्क्युलेटर** टूलचा वापर करा!\n\n१. मेनूमधील 'खत कॅल्क्युलेटर' वर जा\n२. तुमचे पीक, जमिनीचे क्षेत्रफळ आणि मातीचा प्रकार टाका\n३. युरिया, DAP आणि MOP ची अचूक मात्रा मिळवा\n\n📝 सामान्य टीपा:\n- वालुकामय मातीला २०% जास्त खत लागते\n- काळ्या मातीत १०% कमी खत वापरा\n- जास्त खत देऊ नका — मुळे खराब होतात!\n- चांगल्या शोषणासाठी २-३ टप्प्यात खत द्या"
    }
  },

  // ===================== WEATHER =====================
  {
    keywords: ["weather", "rain", "mausam", "baarish", "मौसम", "बारिश", "temperature", "havaman", "पाऊस", "हवामान"],
    answer: {
      en: "Check live weather using KisanDost's **Weather** feature!\n\n1. Tap 'Weather' in the menu\n2. Allow your location access\n3. Get real-time temperature, humidity, and rain forecast",
      hi: "KisanDost के **मौसम** फीचर से ताजा मौसम देखें!\n\n1. मेनू में 'मौसम' पर क्लिक करें\n2. लोकेशन की अनुमति दें\n3. तापमान, नमी, बारिश का अनुमान मिलेगा",
      gu: "KisanDost ની **હવામાન** સુવિધા વાપરો!\n\n1. મેનૂમાં 'હવામાન' ક્લિક કરો\n2. લોકેશન પરવાનગી આપો\n3. તાપમાન, ભેજ, વરસાદ અનુમાન મેળવો",
      mr: "किसानदोस्तच्या **हवामान** वैशिष्ट्याचा वापर करून थेट हवामान तपासा!\n\n१. मेनूमध्ये 'हवामान' वर क्लिक करा\n२. तुमचे स्थान ॲक्सेस करण्याची अनुमती द्या\n३. रिअल-टाइम तापमान, आर्द्रता आणि पावसाचा अंदाज मिळवा"
    }
  },

  // ===================== IRRIGATION =====================
  {
    keywords: ["irrigation", "water", "sinchai", "paani", "pani", "सिंचाई", "पानी", "drip", "sprinkler", "पाणी", "सिंचन"],
    answer: {
      en: "Irrigation tips by crop:\n\n🌾 **Wheat**: 4-5 irrigations per season\n🌾 **Rice**: Keep 2-5 cm standing water always\n🌾 **Cotton**: Every 8-10 days in summer",
      hi: "सिंचाई के सुझाव (फसल के हिसाब से):\n\n🌾 **गेहूं**: एक सीजन में 4-5 बार\n🌾 **धान**: हमेशा 2-5 सेमी पानी खड़ा रखें",
      gu: "સિંચાઈ ટીપ્સ (પાક મુજબ):\n\n🌾 **ઘઉં**: સીઝનમાં 4-5 વાર\n🌾 **ડાંગર**: 2-5 સેમી પાણી ઊભું રાખો",
      mr: "पिकानुसार सिंचनासाठी टीपा:\n\n🌾 **गहू**: एका हंगामात ४-५ वेळा पाणी द्या\n🌾 **भात**: सतत २-५ सेमी पाणी साचवून ठेवा\n🌾 **कापूस**: उन्हाळ्यात दर ८-१० दिवसांनी पाणी द्या"
    }
  },

  // ===================== PROFIT PREDICTOR =====================
  {
    keywords: ["profit", "yield", "labh", "kamai", "income", "revenue", "earnings", "prediction", "predict", "upaj", "लाभ", "कमाई", "उपज", "अनुमान", "નફો", "नफा", "उत्पन्न"],
    answer: {
      en: "Use our **AI Profit Predictor** tool!\n\nGo to 'Profit Intelligence' (✨ icon) in the menu.",
      hi: "हमारे **AI लाभ अनुमान** टूल का उपयोग करें!\n\nमेनू में 'प्रॉफिट इंटेलिजेंस' (✨ आइकन) पर जाएं।",
      gu: "**AI નફા અનુમાન** ટૂલ ઉપયોગ કરો!\n\nમેનૂમાં 'પ્રોફિટ ઇન્ટેલિજન્સ' પર જાઓ.",
      mr: "आमच्या **AI नफा अंदाज** टूलचा वापर करा!\n\nमेनूमधील 'नफा बुद्धिमत्ता' (✨ चिन्ह) वर जा आणि माहिती टाका."
    }
  },

  // ===================== SEEDS =====================
  {
    keywords: ["seed", "beej", "बीज", "sow", "variety", "kism", "किस्म", "hybrid", "बियाणे"],
    answer: {
      en: "Choosing the right seed is key!\n\n🌱 Tips for seed selection:\n- Choose **certified seeds** from government centers",
      hi: "सही बीज चुनना बहुत जरूरी है!\n\n🌱 बीज चुनने के टिप्स:\n- **प्रमाणित बीज** खरीदें",
      gu: "સાચું બીજ પસંદ કરવું જરૂરી છે!\n\n🌱 બીજ ટીપ્સ:\n- **પ્રમાણિત બીજ** ખરીદો",
      mr: "योग्य बियाणे निवडणे अत्यंत महत्त्वाचे आहे!\n\n🌱 बियाणे निवडीसाठी टीपा:\n- सरकारी केंद्रांमधून नेहमी **प्रमाणित बियाणे** निवडा"
    }
  },

  // ===================== GOVERNMENT SCHEMES =====================
  {
    keywords: ["scheme", "yojana", "sarkar", "government", "subsidy", "yojna", "योजना", "सरकार", "सब्सिडी", "pm kisan", "फसल बीमा", "kcc", "loan", "insurance", "शासकीय योजना"],
    answer: {
      en: "Important government schemes for farmers:\n\n🏛️ **PM-KISAN**: ₹6000/year directly in bank account\n🌾 **Pradhan Mantri Fasal Bima Yojana**: Crop insurance",
      hi: "किसानों के लिए महत्वपूर्ण सरकारी योजनाएं:\n\n🏛️ **PM-KISAN**: हर साल ₹6000 सीधे खाते में",
      gu: "ખેડૂતો માટે યોજનાઓ:\n\n🏛️ **PM-KISAN**: દર વર્ષે ₹6000 સીધા ખાતામાં",
      mr: "शेतकऱ्यांसाठी महत्त्वाच्या शासकीय योजना:\n\n🏛️ **PM-KISAN**: दरवर्षी ₹६००० थेट बँक खात्यात\n🌾 **प्रधानमंत्री पीक विमा योजना**: पीक विमा संरक्षण\n💳 **किसान क्रेडिट कार्ड (KCC)**: कमी व्याजाचे शेती कर्ज"
    }
  },

  // ===================== PEST MANAGEMENT =====================
  {
    keywords: ["pest", "insect", "kida", "keeda", "कीड़ा", "कीट", "टिड्डी", "locust", "aphid", "bollworm", "spray", "keetnaashak", "कीटनाशक", "जीवाત"],
    answer: {
      en: "Pest control tips:\n\n🐛 First identify the pest type — different pests need different treatments!\n\n✅ Common pests & solutions:\n- **Aphids (Maahu)**: Imidacloprid 17.8 SL spray\n- **Bollworm (cotton)**: Chloropyriphos + Cypermethrin\n- **Brown Plant Hopper (rice)**: Drain water + Buprofezin spray\n- **Locusts**: Contact agriculture department immediately\n\n⚠️ Safety: Always wear gloves and mask while spraying. Spray early morning or evening, never in wind.",
      hi: "कीट नियंत्रण के सुझाव:\n\n🐛 पहले कीट की पहचान करें — हर कीट का इलाज अलग होता है!\n\n✅ सामान्य कीट और उपाय:\n- **माहू (Aphid)**: Imidacloprid 17.8 SL स्प्रे\n- **बॉलवर्म (कपास)**: Chloropyriphos + Cypermethrin\n- **भूरा माहो (धान)**: पानी निकालें + Buprofezin\n- **टिड्डी दल**: तुरंत कृषि विभाग को बताएं\n\n⚠️ सुरक्षा: स्प्रे करते समय दस्ताने और मास्क जरूर पहनें। सुबह या शाम छिड़कें, हवा में नहीं।",
      gu: "જીવાત નિયંત્રણ ટિપ્સ:\n\n🐛 પહેલા જીવાતનો પ્રકાર ઓળખો — દરેક જીવાતની સારવાર અલગ હોય છે!\n\n✅ સામાન્ય જીવાત અને ઉપાય:\n- **માહો (Aphids)**: ઇમિડાક્લોપ્રિડ (Imidacloprid) 17.8 SL નો છંટકાવ\n- **ઇયળ (Bollworm)**: ક્લોરોપાયરીફોસ (Chloropyriphos)\n- **ભૂરો માહો (Brown Plant Hopper)**: પાણી કાઢો + બુપ્રોફેઝીન (Buprofezin) નો છંટકાવ\n\n⚠️ સલામતી: છંટકાવ કરતી વખતે હંમેશા મોજા અને માસ્ક પહેરો.",
      mr: "कीटक नियंत्रणासाठी टीपा:\n\n🐛 प्रथम कीटकाचा प्रकार ओळखा — वेगवेगळ्या कीटकांसाठी वेगवेगळे उपचार आवश्यक असतात!\n\n✅ सामान्य कीटक आणि उपाय:\n- **मावा (Aphids)**: इमिडाक्लोप्रिड (Imidacloprid) 17.8 SL ची फवारणी\n- **बोंडअळी (Bollworm)**: क्लोरोपायरीफॉस (Chloropyriphos)\n- **तपकिरी तुडतुडे (Brown Plant Hopper)**: पाणी काढून टाका + बुप्रोफेझिन (Buprofezin) ची फवारणी\n\n⚠️ सुरक्षितता: फवारणी करताना नेहमी हातमोजे आणि मास्क घाला."
    }
  },

  // ===================== SOIL =====================
  {
    keywords: ["soil", "mitti", "jamin", "ph", "मिट्टी", "जमीन", "soil test", "clay", "sandy", "loamy", "organic", "compost", "vermicompost", "माटी", "ज म ीन"],
    answer: {
      en: "Soil health is the foundation of farming!\n\n🧪 Get a **Soil Health Card** free from your local agriculture office.\n\nIdeal soil pH: **6.5 – 7.5**\n\nFix soil problems:\n- Too acidic (pH<6): Add lime\n- Too alkaline (pH>8): Add gypsum or sulfur\n- Sandy soil: Add organic compost to retain water\n- Clay soil: Add sand and organic matter for better drainage\n\n🌿 Tip: Add vermicompost every season to improve soil naturally!",
      hi: "मिट्टी की सेहत खेती की नींव है!\n\n🧪 नजदीकी कृषि कार्यालय से मुफ्त **मृदा स्वास्थ्य कार्ड** लें।\n\nआदर्श pH: **6.5 – 7.5**\n\nमिट्टी ठीक करें:\n- बहुत अम्लीय (pH<6): चूना डालें\n- बहुत क्षारीय (pH>8): जिप्सम या गंधक डालें\n- रेतीली: जैविक खाद से पानी रोकने की क्षमता बढ़ाएं\n- चिकनी: अच्छी जल निकासी के लिए रेत+जैविक खाद\n\n🌿 सुझाव: हर सीजन वर्मीकम्पोस्ट डालें!",
      gu: "જમીનનું સ્વાસ્થ્ય ખેતીનો પાયો છે!\n\n🧪 નજીકની કૃષિ કચેરીમાંથી મફત **સોઇલ હેલ્થ કાર્ડ (Soil Health Card)** મેળવો.\n\nઆદર્શ pH: **6.5 – 7.5**\n\nજમીનની સમસ્યાઓ સુધારો:\n- વધુ એસિડિક (pH<6): ચૂનો ઉમેરો\n- વધુ આલ્કલાઇન (pH>8): જિપ્સમ અથવા સલ્ફર ઉમેરો\n- રેતાળ જમીન: ભેજ જાળવી રાખવા માટે સેન્દ્રિય ખાતર ઉમેરો\n\n🌿 ટિપ: કુદરતી રીતે જમીન સુધારવા દર સીઝનમાં અળસિયાનું ખાતર (Vermicompost) ઉમેરો!",
      mr: "मातीचे आरोग्य हा शेतीचा पाया आहे!\n\n🧪 तुमच्या जवळच्या कृषी कार्यालयातून मोफत **मृदा आरोग्य पत्रिका (Soil Health Card)** मिळवा.\n\nआदर्श pH: **6.5 – 7.5**\n\nमातीच्या समस्या सोडवा:\n- जास्त आम्लयुक्त (pH<6): चुना मिसळा\n- जास्त अल्कधर्मी (pH>8): जिप्सम किंवा गंधक मिसळा\n- वालुकामय माती: ओलावा टिकवून ठेवण्यासाठी सेंद्रिय खत वापरा\n\n🌿 टीप: माती नैसर्गिकरित्या सुधारण्यासाठी दर हंगामात गांडूळ खत (Vermicompost) वापरा!"
    }
  },

  // ===================== MANDI / MARKET PRICE =====================
  {
    keywords: ["mandi", "price", "market", "dam", "दाम", "मंडी", "rate", "bhav", "बाजार", "कीमत", "sell", "wheat price", "rice price"],
    answer: {
      en: "For crop prices:\n\nUse our **AI Profit Predictor** — it fetches current mandi prices for wheat, rice, cotton, maize, soybean, and more from APMC data.\n\n📊 Current approximate APMC prices (per quintal):\n- Wheat: ₹2100–2200\n- Paddy/Rice: ₹1900–2100\n- Cotton: ₹6500–7000\n- Maize: ₹1700–1900\n- Soybean: ₹4300–4600\n\n⚠️ Prices vary by location and date. Visit your nearest Krishi Upaj Mandi for exact rates.",
      hi: "फसल के भाव के लिए:\n\nहमारा **AI लाभ अनुमान** देखें — यह APMC डेटा से ताजे मंडी भाव दिखाता है।\n\n📊 अनुमानित APMC भाव (प्रति क्विंटल):\n- गेहूं: ₹2100–2200\n- धान/चावल: ₹1900–2100\n- कपास: ₹6500–7000\n- मक्का: ₹1700–1900\n- सोयाबीन: ₹4300–4600\n\n⚠️ भाव जगह और समय के अनुसार बदलते हैं। नजदीकी मंडी जाएं।",
      gu: "પાકના ભાવ માટે:\n\nઅમારા **AI નફા અનુમાન (AI Profit Predictor)** ટૂલનો ઉપયોગ કરો — જે APMC ડેટા પરથી ઘઉં, ડાંગર, કપાસ વગેરેના વર્તમાન મંડી ભાવ બતાવે છે.\n\n📊 વર્તમાન અંદાજિત APMC ભાવ (પ્રતિ ક્વિન્ટલ):\n- ઘઉં: ₹2100–2200\n- ડાંગર/ચોખા: ₹1900–2100\n- કપાસ: ₹6500–7000\n- મકાઈ: ₹1700–1900\n\n⚠️ ભાવ સ્થળ અને તારીખ મુજબ બદલાય છે. ચોક્કસ ભાવ માટે તમારી નજીકની કૃષિ ઉપજ મંડીની મુલાકાત લો.",
      mr: "पिकांच्या भावासाठी:\n\nआमच्या **AI नफा अंदाज (AI Profit Predictor)** टूलचा वापर करा — जे APMC डेटावरून गहू, भात, कापूस, मका इत्यादींचे सध्याचे बाजारभाव दाखवते.\n\n📊 सध्याचे अंदाजित APMC भाव (प्रति क्विंटल):\n- गहू: ₹२१००–२२००\n- भात/तांदूळ: ₹१९००–२१००\n- कापूस: ₹६५००–७०००\n- मका: ₹१७००–१९००\n\n⚠️ भाव ठिकाण आणि तारखेनुसार बदलतात. अचूक भावासाठी तुमच्या जवळच्या कृषी उत्पन्न बाजार समितीला (मंडी) भेट द्या."
    }
  },

  // ===================== CONTACT =====================
  {
    keywords: ["contact", "call", "phone", "help", "expert", "sampark", "संपर्क", "helpline", "number", "officer", "olas"],
    answer: {
      en: `Need expert help? Contact our KisanDost team!\n\n📞 **Helpline: ${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 Monday–Saturday: 9 AM – 6 PM\n\nOur agriculture experts can help with:\n- Location-specific farming advice\n- Complex disease diagnosis\n- Government scheme applications\n- Soil testing guidance`,
      hi: `विशेषज्ञ की मदद चाहिए? किसानDost टीम से संपर्क करें!\n\n📞 **हेल्पलाइन: ${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 सोमवार–शनिवार: सुबह 9 – शाम 6\n\nहमारे कृषि विशेषज्ञ मदद करेंगे:\n- स्थान-विशेष खेती सलाह\n- जटिल रोग का निदान\n- सरकारी योजना आवेदन\n- मिट्टी जांच मार्गदर्शन`,
      gu: `નિષ્ણાતની મદદ જોઈએ છે? અમારી KisanDost ટીમનો સંપર્ક કરો!\n\n📞 **હેલ્પલાઇન: ${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 સોમવાર-શનિવાર: સવારે 9 - સાંજે 6\n\nઅમારા કૃષિ નિષ્ણાતો આ બાબતોમાં મદદ કરી શકે છે:\n- સ્થાન મુજબ ખેતીની સલાહ\n- જટિલ રોગ નિદાન\n- સરકારી યોજનાની અરજીઓ`,
      mr: `तज्ञांच्या मदतीची आवश्यकता आहे? आमच्या किसानदोस्त टीमशी संपर्क साधा!\n\n📞 **हेल्पलाईन: ${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 सोमवार-शनिवार: सकाळी ९ - संध्याकाळी ६\n\nआमचे कृषी तज्ञ या बाबतीत मदत करू शकतात:\n- स्थानानुसार शेतीचा सल्ला\n- गुंतागुंतीच्या रोगांचे निदान\n- सरकारी योजनांचे अर्ज`
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
