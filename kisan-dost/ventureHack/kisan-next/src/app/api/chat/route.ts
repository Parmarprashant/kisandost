import { NextResponse } from "next/server";
import { FAQ_DB, COMPLEX_KEYWORDS, CONTACT_NUMBER, KISANDOST_INFO } from "@/lib/chat/knowledgeBase";

type Locale = "en" | "hi" | "gu" | "mr";

function detectLocale(message: string, reqLocale?: string): Locale {
  if (reqLocale && ["en", "hi", "gu", "mr"].includes(reqLocale)) {
    return reqLocale as Locale;
  }
  if (/[\u0900-\u097F]/.test(message)) return "mr"; // Default Devanagari to mr if specified
  if (/[\u0A80-\u0AFF]/.test(message)) return "gu";
  return "en";
}

function isComplexQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return COMPLEX_KEYWORDS.some(kw => lower.includes(kw)) ||
    message.split(" ").length > 30;
}

function findFAQAnswer(message: string, locale: Locale): string | null {
  const lower = message.toLowerCase();
  for (const entry of FAQ_DB) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.answer[locale] || entry.answer.en;
    }
  }
  return null;
}

function getComplexResponse(locale: Locale): string {
  const responses: Record<Locale, string> = {
    en: `This question needs an expert to answer properly. 🙏\n\nPlease contact our KisanDost farming experts:\n📞 **${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 Mon–Sat, 9 AM – 6 PM\n\nOur team will give you the best advice for your specific situation!`,
    hi: `यह सवाल एक विशेषज्ञ से पूछना बेहतर होगा। 🙏\n\nकृपया हमारे किसानDost कृषि विशेषज्ञों से संपर्क करें:\n📞 **${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 सोम–शनि, सुबह 9 – शाम 6\n\nहमारी टीम आपकी स्थिति के अनुसार सबसे अच्छी सलाह देगी!`,
    gu: `આ પ્રશ્ન માટે નિષ્ણાતનો સંપર્ક કરવો વધુ સારો રહેશે. 🙏\n\nકૃપા કરીને અમારા KisanDost કૃષિ નિષ્ણાતોનો સંપર્ક કરો:\n📞 **${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 સોમ-શનિ, સવારે 9 – સાંજે 6`,
    mr: `या प्रश्नासाठी कृषी तज्ञांचा सल्ला घेणे योग्य ठरेल. 🙏\n\nकृपया आमच्या किसानदोस्त कृषी तज्ञांशी संपर्क साधा:\n📞 **${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 सोम-शनिवार, सकाळी ९ - संध्याकाळी ६\n\nआमची टीम तुमच्या परिस्थितीनुसार सर्वोत्तम सल्ला देईल!`
  };
  return responses[locale] || responses.en;
}

function getDefaultResponse(locale: Locale): string {
  const responses: Record<Locale, string> = {
    en: `I'm not sure about that specific question, but I can help you with:\n\n🌾 Crop diseases & treatments\n🧪 Fertilizer calculator\n☁️ Weather tips\n📈 Profit predictions\n🌱 Seed selection\n🏛️ Government schemes\n🐛 Pest control\n\nTry asking one of these, or **contact our expert at ${CONTACT_NUMBER}** for personalised help!`,
    hi: `मुझे इस सवाल का सटीक जवाब नहीं पता, लेकिन मैं इनमें मदद कर सकता हूँ:\n\n🌾 फसल रोग और इलाज\n🧪 खाद कैलकुलेटर\n☁️ मौसम सुझाव\n📈 लाभ अनुमान\n🌱 बीज चुनाव\n🏛️ सरकारी योजनाएं\n🐛 कीट नियंत्रण\n\nइनमें से कोई पूछें, या **${CONTACT_NUMBER} पर विशेषज्ञ से मिलें**!`,
    gu: `મને આ વિશે પૂરી માહિતી નથી, પણ હું મદદ કરી શકું છું:\n\n🌾 પાક રોગ અને સારવાર\n🧪 ખાતર કૅલ્ક્યુલેટર\n☁️ હવામાન ટીપ્સ\n📈 નફા અનુમાન\n🏛️ સરકારી યોજનાઓ\n\n**${CONTACT_NUMBER}** પર નિષ્ણાતનો સંપર્ક કરો!`,
    mr: `मला या विशिष्ट प्रश्नाची खात्री नाही, परंतु मी तुम्हाला यामध्ये मदत करू शकतो:\n\n🌾 पीक रोग आणि उपचार\n🧪 खत कॅल्क्युलेटर\n☁️ हवामान टिप्स\n📈 नफा अंदाज\n🌱 बियाणे निवड\n🏛️ शासकीय योजना\n🐛 कीटक नियंत्रण\n\nयापैकी एक विचारून पहा, किंवा वैयक्तिक मदतीसाठी **${CONTACT_NUMBER} वर तज्ञांशी संपर्क साधा**!`
  };
  return responses[locale] || responses.en;
}

export async function POST(req: Request) {
  try {
    const { message, locale: reqLocale } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const locale = detectLocale(message, reqLocale);

    // 2. Check if complex question
    if (isComplexQuery(message)) {
      return NextResponse.json({
        reply: getComplexResponse(locale),
        isComplex: true,
        contactNumber: CONTACT_NUMBER,
        locale
      });
    }

    // 3. Search FAQ knowledge base
    const faqAnswer = findFAQAnswer(message, locale);
    if (faqAnswer) {
      return NextResponse.json({
        reply: faqAnswer,
        isComplex: false,
        locale
      });
    }

    // 4. No match — return default prompt
    return NextResponse.json({
      reply: getDefaultResponse(locale),
      isComplex: false,
      locale
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
