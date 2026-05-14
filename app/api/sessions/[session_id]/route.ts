/**
 * GET /api/sessions/[session_id]
 *
 * Lee la sesión + sus step_events (responses) para que el cliente pueda
 * restaurar estado al hacer reload del runtime.
 *
 * Respuesta:
 *   200 { session: {...}, responses: { [step_key]: payload } }
 *   401 { error } — no autenticado
 *   404 { error } — session no encontrada o sin permiso (RLS)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  const { session_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data: session, error: sessErr } = await supabase
    .schema("simulador")
    .from("simulation_sessions")
    .select("id, status, started_at, completed_at, case_variant_id, sprint_id")
    .eq("id", session_id)
    .maybeSingle();

  if (sessErr || !session) {
    return NextResponse.json(
      { error: "Sesión no encontrada." },
      { status: 404 },
    );
  }

  // Get latest response per step_key.
  const { data: events } = await supabase
    .schema("simulador")
    .from("simulation_step_events")
    .select("step_ordinal, case_step_id, event_type, payload_json, captured_at")
    .eq("simulation_session_id", session_id)
    .eq("event_type", "response_update")
    .order("captured_at", { ascending: true });

  // Resolver step_key por case_step_id.
  const stepIds = Array.from(new Set((events ?? []).map((e) => e.case_step_id)));
  let stepMap: Record<string, string> = {};
  if (stepIds.length > 0) {
    const { data: steps } = await supabase
      .schema("simulador")
      .from("case_steps")
      .select("id, step_key")
      .in("id", stepIds as string[]);
    stepMap = Object.fromEntries(
      (steps ?? []).map((s) => [s.id, s.step_key]),
    );
  }

  // Reduce events a último payload por step_key.
  const responses: Record<string, unknown> = {};
  for (const ev of events ?? []) {
    const key = stepMap[ev.case_step_id as string];
    if (!key) continue;
    const payload = (ev.payload_json as { response?: unknown })?.response;
    if (payload !== undefined) {
      responses[key] = payload;
    }
  }

  return NextResponse.json({ session, responses });
}
