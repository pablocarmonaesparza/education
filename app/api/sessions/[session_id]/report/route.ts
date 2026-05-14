/**
 * GET /api/sessions/[session_id]/report
 *
 * Lee el report individual asociado a la sesión.
 *
 * Estados posibles:
 *   - `published`: payload completo + visible al participante y managers.
 *   - `pending_review`: hay risk high; el manager ve banner "esperando review",
 *     payload incluido pero UI puede ocultarlo si lo desea.
 *   - `null` (404 con status=none): aún no se corrió evaluate. UI debe hacer
 *     polling cada 3-5s hasta que aparezca.
 *
 * Acceso vía RLS:
 *   - User dueño de la session
 *   - Managers del team
 *   - org_admin
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

  // RLS scopes esto al user/manager/admin autorizado.
  const { data: report } = await supabase
    .schema("simulador")
    .from("reports")
    .select("id, status, payload_json, generated_at, shared_at")
    .eq("simulation_session_id", session_id)
    .eq("report_type", "participant_mirror")
    .maybeSingle();

  if (!report) {
    // No hay report aún — el cliente debe seguir polleando.
    const { data: session } = await supabase
      .schema("simulador")
      .from("simulation_sessions")
      .select("id, status")
      .eq("id", session_id)
      .maybeSingle();

    return NextResponse.json(
      {
        status: "none",
        session_status: session?.status ?? null,
        message:
          session?.status === "submitted"
            ? "Evaluación en curso. Reintenta en unos segundos."
            : "Esta sesión aún no fue enviada para evaluación.",
      },
      { status: session ? 200 : 404 },
    );
  }

  return NextResponse.json({
    status: report.status,
    report_id: report.id,
    generated_at: report.generated_at,
    shared_at: report.shared_at,
    payload: report.payload_json,
  });
}
