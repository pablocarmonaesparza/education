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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY no configurada en el server." },
      { status: 500 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("audio");
    const languageRaw = formData.get("language");
    const language =
      typeof languageRaw === "string" && languageRaw.length === 2
        ? languageRaw
        : "es";

    if (!file || typeof file === "string") {
      return NextResponse.json(
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

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language,
      response_format: "json",
    });

    return NextResponse.json({ text: transcription.text ?? "" });
  } catch (err) {
    console.error("[transcribe] error:", err);
    const message =
      err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
