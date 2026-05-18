import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, rateLimiters } from "@/lib/ratelimit";
import { getFieldTestToken } from "@/lib/simulador/field-test/security";
import {
  getFieldTestSession,
  insertFieldTestEvent,
  isFieldTestAnalyticsEvent,
  sanitizeText,
} from "@/lib/simulador/field-test/service";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  const blocked = await enforceRateLimit(req, rateLimiters.standard);
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

  let body: { event_name?: string; step_key?: string; payload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const eventName = sanitizeText(body.event_name, 80);
  if (!isFieldTestAnalyticsEvent(eventName)) {
    return NextResponse.json({ error: "event_name inválido." }, { status: 400 });
  }

  await insertFieldTestEvent({
    sessionId: session_id,
    stepKey: sanitizeText(body.step_key, 80) || null,
    eventType: eventName,
    payload: body.payload ?? {},
  });

  return NextResponse.json({ ok: true });
}
