/**
 * /api/transcribe — proxy a OpenAI Whisper para el botón de voz del
 * AIPromptInput del Simulador. Acepta multipart/form-data con campo `audio`.
 *
 * Por qué tener un proxy en vez de llamar OpenAI desde el browser:
 * - evita exponer OPENAI_API_KEY al cliente
 * - aprovecha el server runtime para subir blobs grandes sin CORS
 *
 * Body esperado:
 *   FormData {
 *     audio: File / Blob (webm, mp3, wav, m4a…)
 *     language?: string (ISO-639-1, default "es")
 *   }
 *
 * Respuesta:
 *   200 { text: "transcribed text…" }
 *   400 { error: "Bad request" } — falta archivo
 *   500 { error: "Transcription failed" } — error de Whisper
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, rateLimitedResponse } from "@/lib/ratelimit";

export const runtime = "nodejs"; // OpenAI SDK necesita Node, no Edge.
export const maxDuration = 30; // segundos. Whisper procesa rápido.

const MAX_AUDIO_BYTES = Number(process.env.TRANSCRIBE_MAX_BYTES ?? 8 * 1024 * 1024);

function json(
  body: Record<string, unknown>,
  init: ResponseInit & { headers?: HeadersInit } = {},
) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init.headers,
    },
  });
}

function isSameOriginRequest(req: NextRequest) {
  const origin = req.headers.get("origin");
  return !origin || origin === req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  if (process.env.ENABLE_TRANSCRIBE_API !== "true") {
    return json(
      { error: "Transcription is disabled on this environment." },
      { status: 404 },
    );
  }

  if (!isSameOriginRequest(req)) {
    return json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return json({ error: "Authentication required." }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("[transcribe] OPENAI_API_KEY is not configured.");
      return json({ error: "Service unavailable." }, { status: 503 });
    }

    const limitResult = await rateLimiters.ai.limit(`transcribe:user:${user.id}`);
    if (!limitResult.success) {
      return rateLimitedResponse(
        limitResult.remaining,
        limitResult.reset,
        limitResult.limit,
      );
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      return json({ error: "Expected multipart/form-data." }, { status: 415 });
    }

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_AUDIO_BYTES) {
      return json(
        { error: "Audio file is too large." },
        { status: 413 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("audio");
    const languageRaw = formData.get("language");
    const language =
      typeof languageRaw === "string" && /^[a-z]{2}$/i.test(languageRaw)
        ? languageRaw.toLowerCase()
        : "es";

    if (!file || typeof file === "string") {
      return json(
        { error: "Falta el campo 'audio' en el FormData." },
        { status: 400 },
      );
    }

    // FormDataEntryValue puede ser File o string; ya descartamos string.
    // El SDK acepta cualquier objeto con `name` y `type`; si viene como
    // Blob sin name, lo wrappeamos en File para que el filename llegue.
    const asBlob = file as Blob & { name?: string };
    const audioFile =
      asBlob.name
        ? (asBlob as unknown as File)
        : new File([asBlob], "recording.webm", { type: asBlob.type || "audio/webm" });

    if (audioFile.size > MAX_AUDIO_BYTES) {
      return json(
        { error: "Audio file is too large." },
        { status: 413 },
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language,
      response_format: "json",
    });

    return json({ text: transcription.text ?? "" });
  } catch (err) {
    console.error("[transcribe] error:", err);
    return json({ error: "Transcription failed." }, { status: 502 });
  }
}
