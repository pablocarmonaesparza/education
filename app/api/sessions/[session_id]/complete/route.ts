/**
 * POST /api/sessions/[session_id]/complete
 *
 * Marca la sesión como submitted (lista para evaluación) y dispara el
 * judge LLM en background via Next.js `after()`.
 *
 * Pre: el user ya guardó respuestas en todos los step_keys del caso
 * (validación liviana — el judge maneja sessions parciales también).
 *
 * Respuesta:
 *   200 { session_id, status, evaluation_started: true }
 *   401 { error }
 *   404 { error }
 */

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateAndPersist } from "@/lib/simulador/judge/persist";

export const runtime = "nodejs";

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

  // Background: judge LLM corre fuera del request/response cycle.
  // No bloqueamos al cliente — el report aparece via polling de /api/sessions/[id]/report.
  after(async () => {
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
    } catch (err) {
      console.error(
        `[session/complete] background judge failed for ${session_id}:`,
        err,
      );
    }
  });

  return NextResponse.json({
    session_id,
    status: "submitted",
    evaluation_started: true,
  });
}
