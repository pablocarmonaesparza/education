/**
 * PATCH /api/sessions/[session_id]/responses
 *
 * Persiste respuestas + eventos del runtime step-by-step. Llamado con
 * debounce desde el cliente al avanzar entre pantallas del caso.
 *
 * Body: {
 *   step_key: string,          // 'data_scope' | 'llm_beat' | ...
 *   payload: Record<string, unknown>,  // shape varía por step_key
 *   metrics?: { time_on_step_ms, prompt_iterations, voice_used, ... }
 * }
 *
 * Inserta en simulador.simulation_step_events (event_type='response_update').
 * Idempotente: múltiples PATCH del mismo step solo agregan rows (audit
 * trail completo en lugar de overwrite — facilita debug y judge eval).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
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

  if (!body.step_key) {
    return NextResponse.json({ error: "Falta step_key." }, { status: 400 });
  }

  // Verificar que la session es del user actual (RLS también lo bloquea
  // pero damos error explícito).
  const { data: session } = await supabase
    .schema("simulador")
    .from("simulation_sessions")
    .select("id, status, case_variant_id")
    .eq("id", session_id)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
  }

  if (
    session.status === "completed" ||
    session.status === "submitted" ||
    session.status === "evaluated"
  ) {
    return NextResponse.json(
      { error: "Sesión ya cerrada. No se pueden modificar respuestas." },
      { status: 400 },
    );
  }

  // Resolver case_step_id por step_key.
  const { data: caseVariant } = await supabase
    .schema("simulador")
    .from("case_variants")
    .select("case_template_id")
    .eq("id", session.case_variant_id)
    .maybeSingle();

  if (!caseVariant) {
    return NextResponse.json(
      { error: "Case variant no encontrado." },
      { status: 500 },
    );
  }

  const { data: step } = await supabase
    .schema("simulador")
    .from("case_steps")
    .select("id, ordinal")
    .eq("case_template_id", caseVariant.case_template_id)
    .eq("step_key", body.step_key)
    .maybeSingle();

  if (!step) {
    return NextResponse.json(
      { error: `step_key "${body.step_key}" no encontrado en este caso.` },
      { status: 400 },
    );
  }

  // Insertar evento.
  const { error: insErr } = await supabase
    .schema("simulador")
    .from("simulation_step_events")
    .insert({
      simulation_session_id: session_id,
      case_step_id: step.id,
      step_ordinal: step.ordinal,
      event_type: "response_update",
      payload_json: {
        response: body.payload ?? {},
        metrics: body.metrics ?? {},
        timestamp: new Date().toISOString(),
      },
    });

  if (insErr) {
    console.error("[api/sessions/responses] insert failed:", insErr);
    return NextResponse.json(
      { error: "No se pudo guardar la respuesta." },
      { status: 500 },
    );
  }

  // Update last_event_at en la sesión.
  await supabase
    .schema("simulador")
    .from("simulation_sessions")
    .update({ last_event_at: new Date().toISOString() })
    .eq("id", session_id);

  return NextResponse.json({ ok: true });
}
