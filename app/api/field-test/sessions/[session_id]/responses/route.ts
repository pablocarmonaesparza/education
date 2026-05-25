import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, rateLimiters } from "@/lib/ratelimit";
import { getFieldTestToken } from "@/lib/simulador/field-test/security";
import { tryParseExercisePayload } from "@/lib/simulador/exercise-payload-schemas";
import {
  getFieldTestSession,
  insertFieldTestEvent,
  isFieldTestStepKey,
} from "@/lib/simulador/field-test/service";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  const blocked = await enforceRateLimit(req, rateLimiters.burst);
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

  let body: {
    step_key?: string;
    payload?: Record<string, unknown>;
    metrics?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  if (!body.step_key || !isFieldTestStepKey(body.step_key)) {
    return NextResponse.json({ error: "step_key inválido." }, { status: 400 });
  }

  // Frente A — validación tipada para payloads de bloques canónicos.
  // Legacy field-test steps (sin block_id) pasan sin validar.
  const exerciseValidation = tryParseExercisePayload(body.payload);
  if (exerciseValidation.kind === "invalid") {
    return NextResponse.json(
      {
        error: "Payload de bloque malformado.",
        details: exerciseValidation.error.format(),
      },
      { status: 422 },
    );
  }

  // Frente A — persistir payload PARSEADO cuando sea bloque canónico.
  const responseToPersist =
    exerciseValidation.kind === "valid"
      ? exerciseValidation.data
      : body.payload ?? {};

  await insertFieldTestEvent({
    sessionId: session_id,
    stepKey: body.step_key,
    eventType: "response_update",
    payload: { response: responseToPersist },
    metrics: body.metrics ?? {},
  });

  return NextResponse.json({ ok: true });
}
