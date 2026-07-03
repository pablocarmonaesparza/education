/**
 * POST /api/sessions/[session_id]/complete
 *
 * Marca la sesión como submitted y corre el judge antes de responder.
 *
 * R-15 (RULES_LEDGER): la completitud se valida SERVER-SIDE — una sesión sin
 * ninguna respuesta no se puede cerrar (400). El gate por-bloque de la UI es
 * UX, no seguridad: un cliente modificado no debe poder generar un reporte al
 * manager sobre evidencia vacía. Sesiones parciales (≥1 respuesta) sí cierran:
 * el judge las maneja y la cobertura queda logueada.
 *
 * Respuesta:
 *   200 { session_id, status, evaluation_started: true }
 *   401 { error }
 *   404 { error }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateAndPersist } from "@/lib/simulador/judge/persist";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
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

  const { data: session } = await supabase
    .schema("simulador")
    .from("simulation_sessions")
    .select("id, status, case_variant_id")
    .eq("id", session_id)
    .maybeSingle();

  if (!session) {
    return NextResponse.json(
      { error: "Sesión no encontrada." },
      { status: 404 },
    );
  }

  if (
    session.status === "submitted" ||
    session.status === "evaluated" ||
    session.status === "completed"
  ) {
    return NextResponse.json({
      session_id,
      status: session.status,
      evaluation_started: false,
      message: "Sesión ya estaba cerrada.",
    });
  }

  // R-15: completitud server-side — contar respuestas reales antes de cerrar.
  const { data: responseEvents } = await supabase
    .schema("simulador")
    .from("simulation_step_events")
    .select("step_key")
    .eq("simulation_session_id", session_id)
    .eq("event_type", "response_update");

  const answeredSteps = new Set(
    (responseEvents ?? []).map((e) => e.step_key as string),
  );
  if (answeredSteps.size === 0) {
    return NextResponse.json(
      {
        error:
          "La sesión no tiene ninguna respuesta guardada — no se puede cerrar ni evaluar.",
      },
      { status: 400 },
    );
  }
  console.log(
    `[session/complete] ${session_id}: ${answeredSteps.size} steps con respuesta`,
  );

  // Update a submitted.
  const { error: updateErr } = await supabase
    .schema("simulador")
    .from("simulation_sessions")
    .update({
      status: "submitted",
      completed_at: new Date().toISOString(),
    })
    .eq("id", session_id);

  if (updateErr) {
    return NextResponse.json(
      { error: "No se pudo cerrar la sesión." },
      { status: 500 },
    );
  }

  try {
    const result = await evaluateAndPersist(session_id);
    if (result.skipped) {
      console.log(
        `[session/complete] judge skipped for ${session_id}: ${result.reason}`,
      );
    } else {
      console.log(
        `[session/complete] judge OK for ${session_id} → report ${result.report_id} status=${result.report_status}`,
      );
    }

    return NextResponse.json({
      session_id,
      status: "submitted",
      evaluation_started: false,
      evaluation_run_id: result.evaluation_run_id ?? null,
      report_id: result.report_id ?? null,
      report_status: result.report_status ?? null,
      skipped: result.skipped,
    });
  } catch (err) {
    console.error(`[session/complete] judge failed for ${session_id}:`, err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo generar el reporte.",
      },
      { status: 500 },
    );
  }
}
