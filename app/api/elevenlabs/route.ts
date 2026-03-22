import {NextResponse} from 'next/server';
import type {Locale} from '@/i18n/config';

const defaultVoiceByLocale: Record<Locale, string> = {
  en: process.env.ELEVENLABS_VOICE_ID_EN ?? process.env.ELEVENLABS_VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL',
  hi: process.env.ELEVENLABS_VOICE_ID_HI ?? process.env.ELEVENLABS_VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL',
  mr: process.env.ELEVENLABS_VOICE_ID_MR ?? process.env.ELEVENLABS_VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL'
};

const modelByLocale: Record<Locale, string> = {
  en: process.env.ELEVENLABS_MODEL_ID_EN ?? process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2',
  hi: process.env.ELEVENLABS_MODEL_ID_HI ?? process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2',
  mr: process.env.ELEVENLABS_MODEL_ID_MR ?? process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2'
};

type RequestPayload = {
  locale?: Locale;
  text?: string;
};

function isLocale(value: string): value is Locale {
  return value === 'en' || value === 'hi' || value === 'mr';
}

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({error: 'missing_api_key'}, {status: 503});
  }

  let payload: RequestPayload;

  try {
    payload = (await request.json()) as RequestPayload;
  } catch {
    return NextResponse.json({error: 'invalid_json'}, {status: 400});
  }

  const locale = payload.locale && isLocale(payload.locale) ? payload.locale : 'en';
  const text = payload.text?.trim();

  if (!text) {
    return NextResponse.json({error: 'missing_text'}, {status: 400});
  }

  try {
    const upstreamResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${defaultVoiceByLocale[locale]}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: modelByLocale[locale],
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      }),
      cache: 'no-store'
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        {
          error: upstreamResponse.status === 429 ? 'quota_exceeded' : 'generation_failed',
          details: errorText.slice(0, 500)
        },
        {status: upstreamResponse.status}
      );
    }

    const audioBuffer = await upstreamResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store'
      }
    });
  } catch {
    return NextResponse.json({error: 'generation_failed'}, {status: 502});
  }
}
