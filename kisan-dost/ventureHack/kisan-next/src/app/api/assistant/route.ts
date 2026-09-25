import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";

/**
 * A real assistant, as opposed to /api/chat.
 *
 * /api/chat matches keywords against a hardcoded FAQ and answers "call our
 * expert" for anything it does not recognise. It is honest enough as a
 * fallback but it is not an assistant, and a farmer asking a real question in
 * their own words gets nothing from it.
 *
 * This route sends the question to Gemini with the farmer's own context —
 * district, crops, language — so the answer is about their field rather than
 * agriculture in general.
 */

const MAX_QUESTION = 1000;
const MAX_HISTORY = 8;

/**
 * Tried in order. A pinned model first so behaviour does not change under us,
 * then the moving alias as a spare: Gemini returns a 503 on an overloaded
 * model often enough that a single name is a demo waiting to fail.
 */
const MODELS = ["gemini-2.5-flash", "gemini-flash-latest"];

/** Language names Gemini understands, keyed by the app's locale codes. */
const LANGUAGES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  gu: "Gujarati",
  mr: "Marathi",
};

interface Turn {
  role: "user" | "model";
  text: string;
}

function buildSystemPrompt(opts: {
  language: string;
  district?: string;
  crops?: string[];
}) {
  const { language, district, crops } = opts;

  const context: string[] = [];
  if (district) context.push(`They farm in ${district} district, India.`);
  if (crops && crops.length > 0) {
    context.push(`Their current crops: ${crops.join(", ")}.`);
  }

  return `You are a practical farming advisor for smallholder farmers in India.

${context.join(" ")}

Rules you must follow:
- Reply ONLY in ${language}. Do not translate or repeat yourself in English.
- Keep it under 120 words. A farmer is reading this on a phone, outdoors.
- Give concrete steps and quantities per acre where you can.
- Use plain words. No jargon, no markdown headings, no bullet symbols.
- If the question needs to see the plant, say so and tell them to use the
  disease scanner in this app.
- If you are not confident, say you are not sure and suggest they ask their
  local Krishi Vigyan Kendra. Never invent a pesticide name, a dose or a
  government scheme.
- Never recommend a quantity of pesticide without telling them to check the
  label on the pack.`;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Assistant is not configured" },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const question = String(body.question ?? "").trim();
    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }
    if (question.length > MAX_QUESTION) {
      return NextResponse.json({ error: "question too long" }, { status: 400 });
    }

    const locale = String(body.locale ?? "en");
    const language = LANGUAGES[locale] ?? LANGUAGES.en;

    const district =
      typeof body.district === "string" && body.district.trim()
        ? body.district.trim()
        : undefined;

    const crops = Array.isArray(body.crops)
      ? body.crops.filter((c: unknown) => typeof c === "string").slice(0, 6)
      : undefined;

    // Only the last few turns. The whole thread would cost tokens for
    // context the farmer has already moved past.
    const history: Turn[] = Array.isArray(body.history)
      ? body.history
          .filter(
            (t: any) =>
              t &&
              (t.role === "user" || t.role === "model") &&
              typeof t.text === "string" &&
              t.text.trim()
          )
          .slice(-MAX_HISTORY)
          .map((t: any) => ({ role: t.role, text: String(t.text).slice(0, MAX_QUESTION) }))
      : [];

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = buildSystemPrompt({ language, district, crops });
    const chatHistory = history.map((t) => ({
      role: t.role,
      parts: [{ text: t.text }],
    }));

    let answer = "";
    let lastError: unknown = null;

    for (const name of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: name, systemInstruction });
        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            // Headroom, not answer length. Gemini 2.5 spends "thinking"
            // tokens out of this same budget, so a tight cap here truncates
            // the reply mid-sentence rather than making it concise. Brevity
            // is enforced by the system prompt instead.
            maxOutputTokens: 2048,
            temperature: 0.4,
          },
        });

        const result = await chat.sendMessage(question);
        answer = result.response.text().trim();
        if (answer) break;
      } catch (err) {
        console.warn(`[Assistant] ${name} failed:`, (err as Error)?.message);
        lastError = err;
      }
    }

    if (!answer) {
      console.error("[Assistant] every model failed:", lastError);
      return NextResponse.json(
        { error: "The assistant is busy. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json({ answer, language: locale });
  } catch (error: any) {
    console.error("[Assistant] Error:", error?.message ?? error);
    return NextResponse.json(
      { error: "Assistant failed" },
      { status: 500 }
    );
  }
}
