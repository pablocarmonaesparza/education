/**
 * POST /api/admin/review/[queue_id]
 *
 * Resuelve un item de la cola: opcionalmente sobreescribe la recomendación
 * o las dimensiones, marca status='resolved', y publica el report (cambia
 * report.status a 'published').
 *
 * Body (todos opcionales):
 *   {
 *     override_recommendation?: "pilotar"|"entrenar"|"pausar"|"escalar",
 *     override_dimension_scores?: [{id, band, rationale, confidence}],
 *     resolver_notes?: string
 *   }
 *
 * Si no se mandan overrides → publica con el output del judge tal cual.
 *
 * Acceso: solo staff de Itera (isStaffEmail).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffEmail } from "@/lib/simulador/is-staff";

export const runtime = "nodejs";

interface OverrideDimension {
  id: string;
  band: "A" | "M" | "B";
  rationale?: string;
  confidence?: number;
}

interface ResolveBody {
  override_recommendation?: "pilotar" | "entrenar" | "pausar" | "escalar";
  override_dimension_scores?: OverrideDimension[];
  resolver_notes?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ queue_id: string }> },
) {
  const { queue_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  if (!isStaffEmail(user.email)) {
    return NextResponse.json(
      { error: "Acceso restringido a staff de Itera." },
      { status: 403 },
    );
  }

  let body: ResolveBody;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const admin = createAdminClient();

  // Cargar el item + run + report.
  const { data: item } = await admin
    .schema("simulador")
    .from("human_review_queue")
    .select("id, evaluation_run_id, status")
    .eq("id", queue_id)
    .maybeSingle();

  if (!item) {
    return NextResponse.json(
      { error: "Item de queue no encontrado." },
      { status: 404 },
    );
  }
  if (item.status !== "queued" && item.status !== "in_review") {
    return NextResponse.json(
      { error: `Item ya está en status=${item.status}.` },
      { status: 400 },
    );
  }

  const { data: evalRun } = await admin
    .schema("simulador")
    .from("evaluation_runs")
    .select("id, simulation_session_id")
    .eq("id", item.evaluation_run_id)
    .maybeSingle();

  if (!evalRun) {
    return NextResponse.json(
      { error: "evaluation_run no encontrado." },
      { status: 500 },
    );
  }

  const { data: report } = await admin
    .schema("simulador")
    .from("reports")
    .select("id, payload_json")
    .eq("simulation_session_id", evalRun.simulation_session_id)
    .eq("report_type", "participant_mirror")
    .maybeSingle();

  if (!report) {
    return NextResponse.json(
      { error: "Report no encontrado para esta sesión." },
      { status: 500 },
    );
  }

  // Aplicar overrides al payload si vinieron.
  const payload =
    (report.payload_json as Record<string, unknown>) ?? {};

  if (body.override_dimension_scores) {
    payload.dimensions = body.override_dimension_scores.map((d) => ({
      id: d.id,
      band: d.band,
      rationale: d.rationale ?? "(override staff)",
      confidence: d.confidence ?? 1.0,
    }));
  }
  if (body.override_recommendation) {
    const rec =
      (payload.recommendation as Record<string, unknown>) ?? {};
    payload.recommendation = { ...rec, action: body.override_recommendation };
  }

  // Update report → published.
  const { error: rUpdErr } = await admin
    .schema("simulador")
    .from("reports")
    .update({
      status: "published",
      payload_json: payload,
      generated_at: new Date().toISOString(),
    })
    .eq("id", report.id);

  if (rUpdErr) {
    console.error("[admin/review/resolve] report update failed", rUpdErr);
    return NextResponse.json(
      { error: "No se pudo publicar el report." },
      { status: 500 },
    );
  }

  // Marcar queue item resuelto.
  const { error: qUpdErr } = await admin
    .schema("simulador")
    .from("human_review_queue")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolver_notes: body.resolver_notes ?? null,
      override_dimension_scores_json: body.override_dimension_scores ?? null,
      override_recommendation: body.override_recommendation ?? null,
    })
    .eq("id", queue_id);

  if (qUpdErr) {
    console.warn(
      "[admin/review/resolve] queue update failed (report ya publicado)",
      qUpdErr,
    );
  }

  return NextResponse.json({
    ok: true,
    report_id: report.id,
    status: "published",
  });
}
