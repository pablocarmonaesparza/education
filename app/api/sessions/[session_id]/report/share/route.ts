import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  createReportShareToken,
  hashReportShareToken,
  reportShareExpiresAt,
  reportShareUrl,
} from "@/lib/simulador/reports/share-links";

export const runtime = "nodejs";

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

  // RLS valida que el caller pueda ver este reporte.
  const { data: report, error } = await supabase
    .schema("simulador")
    .from("reports")
    .select("id, status, payload_json")
    .eq("simulation_session_id", session_id)
    .eq("report_type", "participant_mirror")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No pudimos leer el reporte." },
      { status: 500 },
    );
  }

  if (!report) {
    return NextResponse.json(
      { error: "El reporte no existe o no tienes permiso de verlo." },
      { status: 404 },
    );
  }

  if (report.status !== "published" && report.status !== "shared") {
    return NextResponse.json(
      {
        error:
          "El link compartible estará disponible cuando el reporte quede publicado.",
      },
      { status: 409 },
    );
  }

  const { data: bridgeUser } = await supabase
    .schema("simulador")
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const token = createReportShareToken();
  const expiresAt = reportShareExpiresAt();
  const admin = createAdminClient();

  const { data: shareLink, error: insertError } = await admin
    .schema("simulador")
    .from("report_share_links")
    .insert({
      report_id: report.id,
      token_hash: hashReportShareToken(token),
      created_by_user_id: bridgeUser?.id ?? null,
      expires_at: expiresAt,
    })
    .select("id, expires_at")
    .single();

  if (insertError || !shareLink) {
    return NextResponse.json(
      { error: "No pudimos generar el link compartible." },
      { status: 500 },
    );
  }

  await admin
    .schema("simulador")
    .from("reports")
    .update({ shared_at: new Date().toISOString() })
    .eq("id", report.id);

  const origin =
    req.headers.get("origin") ??
    `${req.headers.get("x-forwarded-proto") ?? "https"}://${req.headers.get("host")}`;

  return NextResponse.json({
    share_link_id: shareLink.id,
    share_url: reportShareUrl(origin, token),
    expires_at: shareLink.expires_at,
  });
}
