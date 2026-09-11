import { NextResponse } from "next/server";
import { FAQ_DB, COMPLEX_KEYWORDS, CONTACT_NUMBER, KISANDOST_INFO } from "@/lib/chat/knowledgeBase";

type Locale = "en" | "hi" | "gu";

function detectLocale(message: string): Locale {
  // Detect Hindi characters
  if (/[\u0900-\u097F]/.test(message)) return "hi";
  // Detect Gujarati characters
  if (/[\u0A80-\u0AFF]/.test(message)) return "gu";
  return "en";
}

function isComplexQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return COMPLEX_KEYWORDS.some(kw => lower.includes(kw)) ||
    message.split(" ").length > 30; // very long questions likely complex
}

function findFAQAnswer(message: string, locale: Locale): string | null {
  const lower = message.toLowerCase();
  for (const entry of FAQ_DB) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.answer[locale];
    }
  }
  return null;
}

function getComplexResponse(locale: Locale): string {
  const responses = {
    en: `This question needs an expert to answer properly. 🙏\n\nPlease contact our KisanDost farming experts:\n📞 **${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 Mon–Sat, 9 AM – 6 PM\n\nOur team will give you the best advice for your specific situation!`,
    hi: `यह सवाल एक विशेषज्ञ से पूछना बेहतर होगा। 🙏\n\nकृपया हमारे किसानDost कृषि विशेषज्ञों से संपर्क करें:\n📞 **${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 सोम–शनि, सुबह 9 – शाम 6\n\nहमारी टीम आपकी स्थिति के अनुसार सबसे अच्छी सलाह देगी!`,
    gu: `આ સ wal ाल ना ं ज {\n\nKisanDost ت ī م ब ी {\n📞 **${CONTACT_NUMBER}**\n📧 support@kisandost.in\n🕐 Mon–Sat, 9 AM – 6 PM\n\nঅ ামাদের টিম আপনার জন্য সঠিক পরামর্শ দেবে!`
  };
  return responses[locale];
}

function getDefaultResponse(locale: Locale): string {
  const responses = {
    en: `I'm not sure about that specific question, but I can help you with:\n\n🌾 Crop diseases & treatments\n🧪 Fertilizer calculator\n☁️ Weather tips\n📈 Profit predictions\n🌱 Seed selection\n🏛️ Government schemes\n🐛 Pest control\n\nTry asking one of these, or **contact our expert at ${CONTACT_NUMBER}** for personalised help!`,
    hi: `मुझे इस सवाल का सटीक जवाब नहीं पता, लेकिन मैं इनमें मदद कर सकता हूँ:\n\n🌾 फसल रोग और इलाज\n🧪 खाद कैलकुलेटर\n☁️ मौसम सुझाव\n📈 लाभ अनुमान\n🌱 बीज चुनाव\n🏛️ सरकारी योजनाएं\n🐛 कीट नियंत्रण\n\nइनमें से कोई पूछें, या **${CONTACT_NUMBER} पर विशेषज्ञ से मिलें**!`,
    gu: `আম ি এই প ্ র শ ্ ন ে র উ ত ্ ত র জ ান ি ন া, ক ি ন ্ ত ু স া হ াযয ক র ত ে প ার ি:\n\n🌾 পাক রোগ\n🧪 খাতর\n☁️ হবামান\n📈 নফা অনুমান\n\nঅথবা **${CONTACT_NUMBER}** তে বিশেষজ্ঞের সাথে যোগাযোগ করুন!`
  };
  return responses[locale];
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Detect language
    const locale = detectLocale(message);

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
