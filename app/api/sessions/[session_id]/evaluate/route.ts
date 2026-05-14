/**
 * POST /api/sessions/[session_id]/evaluate
 *
 * Re-corre el judge sobre una sesión existente. Idempotente por default
 * (si ya hay evaluation_run, devuelve metadata del existente). Para
 * forzar re-corrida pasar query `?force=1`.
 *
 * Acceso: user dueño de la sesión OR org_admin/manager (la RLS controla,
 * pero validamos explícitamente para mejor mensaje).
 *
 * Respuesta:
 *   200 { evaluation_run_id, report_id, report_status, skipped }
 *   401 / 403 / 404 según corresponda
 *   500 si el judge falla
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateAndPersist } from "@/lib/simulador/judge/persist";

export const runtime = "nodejs";
export const maxDuration = 60; // judge puede tardar ~15-30s

export async function POST(
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

  // Verificación de existencia + permiso vía RLS (sessions_read_self_or_manager).
  const { data: session } = await supabase
    .schema("simulador")
    .from("simulation_sessions")
    .select("id, status")
    .eq("id", session_id)
    .maybeSingle();

  if (!session) {
    return NextResponse.json(
      { error: "Sesión no encontrada o sin permiso." },
      { status: 404 },
    );
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";

  try {
    const result = await evaluateAndPersist(session_id, { force });
    return NextResponse.json({
      ok: true,
      skipped: result.skipped,
      reason: result.reason ?? null,
      evaluation_run_id: result.evaluation_run_id,
      report_id: result.report_id,
      report_status: result.report_status,
    });
  } catch (err) {
    console.error("[api/sessions/evaluate] failed", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Error al ejecutar el judge.",
      },
      { status: 500 },
    );
  }
}
