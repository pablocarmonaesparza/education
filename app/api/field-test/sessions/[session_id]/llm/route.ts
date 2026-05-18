import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, rateLimiters } from "@/lib/ratelimit";
import {
  assertFieldTestRateLimitConfigured,
  getFieldTestToken,
} from "@/lib/simulador/field-test/security";
import {
  generateFieldTestModelResponse,
  getFieldTestSession,
  insertFieldTestEvent,
  sanitizeText,
} from "@/lib/simulador/field-test/service";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  assertFieldTestRateLimitConfigured();
  const blocked = await enforceRateLimit(req, rateLimiters.ai);
  if (blocked) return blocked;

  const { session_id } = await params;
  const token = getFieldTestToken(req);
  if (!token) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
  }

  const session = await getFieldTestSession({ sessionId: session_id, token });
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
  }
  if (session.status !== "in_progress") {
    return NextResponse.json(
      { error: "La sesión ya fue enviada." },
      { status: 400 },
    );
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const prompt = sanitizeText(body.prompt, 5000);
  if (prompt.length < 6) {
    return NextResponse.json({ error: "Prompt demasiado corto." }, { status: 400 });
  }

  await insertFieldTestEvent({
    sessionId: session_id,
    stepKey: "llm_beat",
    eventType: "llm_prompt_submitted",
    payload: { prompt },
  });

  try {
    const generated = await generateFieldTestModelResponse({
      sessionId: session_id,
      userPrompt: prompt,
    });

    await insertFieldTestEvent({
      sessionId: session_id,
      stepKey: "llm_beat",
      eventType: "llm_response_received",
      payload: {
        model_response: generated.text,
        model: generated.model,
        mock: generated.mock,
      },
      metrics: {
        llm_latency_ms: generated.durationMs,
        llm_cost_usd: null,
      },
    });

    return NextResponse.json({
      model_response: generated.text,
      model: generated.model,
      mock: generated.mock,
      duration_ms: generated.durationMs,
    });
  } catch (err) {
    console.error("[field-test/llm] generation failed", err);
    return NextResponse.json(
      { error: "No se pudo obtener respuesta del modelo." },
      { status: 500 },
    );
  }
}
