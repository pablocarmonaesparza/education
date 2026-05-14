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

export const runtime = "nodejs"; // OpenAI SDK necesita Node, no Edge.
export const maxDuration = 30; // segundos. Whisper procesa rápido.

const MAX_AUDIO_BYTES = Number(process.env.TRANSCRIBE_MAX_BYTES ?? 8 * 1024 * 1024);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = Number(process.env.TRANSCRIBE_RATE_LIMIT_PER_MINUTE ?? 6);

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientKey(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

function rateLimit(req: NextRequest) {
  const now = Date.now();
  const key = getClientKey(req);
  const bucket = rateLimitBuckets.get(key);

  for (const [bucketKey, value] of rateLimitBuckets) {
    if (value.resetAt <= now) rateLimitBuckets.delete(bucketKey);
  }

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    return Math.ceil((bucket.resetAt - now) / 1000);
  }

  bucket.count += 1;
  return null;
}

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

export async function POST(req: NextRequest) {
  if (process.env.ENABLE_TRANSCRIBE_API !== "true") {
    return json(
      { error: "Transcription is disabled on this environment." },
      { status: 404 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return json(
      { error: "OPENAI_API_KEY no configurada en el server." },
      { status: 500 },
    );
  }

  try {
    const retryAfter = rateLimit(req);
    if (retryAfter !== null) {
      return json(
        { error: "Too many transcription requests." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
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
        ? languageRaw
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
