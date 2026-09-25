import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { AgriAdvisory } from '@/models/AgriAdvisory';
import { buildAdvisoryPayloadFromAdvisory } from '@/lib/advisory/advisoryNarrative';
import { renderLocalizedAdvisory } from '@/lib/i18n/advisoryRenderer';
import { isSupportedIndicLanguage, DEFAULT_TTS_LANGUAGE } from '@/lib/tts/ttsConfig';

export async function POST(req: Request) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { advisoryId, payload: customPayload, language = DEFAULT_TTS_LANGUAGE } = body;

    let payload = customPayload;

    if (advisoryId) {
      await connectDB();
      const advisory = await AgriAdvisory.findById(advisoryId);
      if (!advisory) {
        return NextResponse.json({ error: 'Advisory not found' }, { status: 404 });
      }
      payload = buildAdvisoryPayloadFromAdvisory(advisory);
    }

    if (!payload || !payload.crop || !payload.threat) {
      return NextResponse.json(
        { error: 'Valid advisory payload or advisoryId is required' },
        { status: 400 }
      );
    }

    const targetLang = isSupportedIndicLanguage(language) ? language : DEFAULT_TTS_LANGUAGE;
    const localized = renderLocalizedAdvisory(payload, targetLang);

    return NextResponse.json({
      success: true,
      language: targetLang,
      preview: localized
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
