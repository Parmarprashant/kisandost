const fs = require('fs');

const messages = {
  en: {
    title: "Smart Crop & Weather Advisory",
    description: "Select any location in Gujarat on the map below. Our smart assistant will analyze your local district's seasonal trends, water availability, and current weather to provide real-time, actionable farming advice tailored just for you."
  },
  hi: {
    title: "स्मार्ट फसल और मौसम सलाह",
    description: "नीचे दिए गए नक्शे पर गुजरात में किसी भी स्थान का चयन करें। हमारा स्मार्ट सहायक आपके लिए वास्तविक समय में, कार्रवाई योग्य खेती की सलाह प्रदान करने के लिए आपके स्थानीय जिले के मौसमी रुझान, पानी की उपलब्धता और वर्तमान मौसम का विश्लेषण करेगा।"
  },
  gu: {
    title: "સ્માર્ટ પાક અને હવામાન સલાહ",
    description: "નીચે આપેલા નકશા પર ગુજરાતમાં કોઈપણ સ્થાન પસંદ કરો. અમારું સ્માર્ટ આસિસ્ટન્ટ તમારા માટે વાસ્તવિક સમયમાં, ઉપયોગી ખેતીની સલાહ પ્રદાન કરવા માટે તમારા સ્થાનિક જિલ્લાના મોસમી વલણો, પાણીની ઉપલબ્ધતા અને વર્તમાન હવામાનનું વિશ્લેષણ કરશે."
  }
};

for (const lang of ['en', 'hi', 'gu']) {
  const file = `./messages/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.AiSuggestion = messages[lang];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

console.log("Translations added.");
