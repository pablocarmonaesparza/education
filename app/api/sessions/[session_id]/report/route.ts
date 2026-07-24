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
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isDevBypassActive } from "@/lib/dev/devBypass";
import { getMockReport } from "@/lib/simulador/reports/mock";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ReportRow = {
  id: string;
  status: string;
  payload_json: unknown;
  generated_at: string | null;
  shared_at: string | null;
};

function isLocalSupabaseProject() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!rawUrl) return false;

  try {
    const { hostname } = new URL(rawUrl);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

async function resolveLocalSessionId(sessionId: string) {
  if (!isLocalSupabaseProject()) return null;
  if (UUID_RE.test(sessionId)) return sessionId;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .schema("simulador")
      .from("simulation_sessions")
      .select("id")
      .contains("metadata", { demo_alias: sessionId })
      .maybeSingle();

    if (error) {
      console.warn("No se pudo resolver alias demo local de sesión", {
        sessionId,
        error: error.message,
      });
      return null;
    }

    return data?.id ?? null;
  } catch (error) {
    console.warn("No se pudo inicializar admin client para alias demo local", {
      sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

type PracticeEntry = {
  slug: string;
  title: string;
  duration_min: number;
  status: string;
  dimension_key: string | null;
  gap_key: string | null;
  completed_at: string | null;
};

/**
 * Práctica desbloqueada por esta sesión (gap → beat). Se lee con admin client
 * DESPUÉS de que RLS validó el acceso al report: si puedes ver el reporte,
 * puedes ver su práctica. Nunca rompe el envelope — a lo sumo devuelve [].
 */
async function fetchPracticeForSession(
  sessionId: string,
): Promise<PracticeEntry[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .schema("simulador")
      .from("practice_unlocks")
      .select(
        "status, gap_key, dimension_key, completed_at, practice_beats(slug, title, duration_estimate_min)",
      )
      .eq("source_session_id", sessionId)
      .order("unlocked_at", { ascending: true });
    return (data ?? [])
      .map((row) => {
        const beatRaw = (row as { practice_beats: unknown }).practice_beats;
        const beat = (Array.isArray(beatRaw) ? beatRaw[0] : beatRaw) as {
          slug?: string;
          title?: string;
          duration_estimate_min?: number;
        } | null;
        if (!beat?.slug || !beat.title) return null;
        return {
          slug: beat.slug,
          title: beat.title,
          duration_min: beat.duration_estimate_min ?? 5,
          status: String(row.status ?? "unlocked"),
          dimension_key: (row.dimension_key as string | null) ?? null,
          gap_key: (row.gap_key as string | null) ?? null,
          completed_at: (row.completed_at as string | null) ?? null,
        };
      })
      .filter((e): e is PracticeEntry => e !== null);
  } catch {
    return [];
  }
}

function toReportEnvelope(report: ReportRow, practice: PracticeEntry[] = []) {
  return {
    status: report.status,
    report_id: report.id,
    generated_at: report.generated_at,
    shared_at: report.shared_at,
    payload: report.payload_json,
    practice,
  };
}

async function fetchReport(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<ReportRow | null> {
  const { data: report, error } = await supabase
    .schema("simulador")
    .from("reports")
    .select("id, status, payload_json, generated_at, shared_at")
    .eq("simulation_session_id", sessionId)
    .eq("report_type", "participant_mirror")
    .maybeSingle();

  if (error) {
    console.warn("No se pudo leer report de sesión", {
      sessionId,
      error: error.message,
    });
    return null;
  }

  return report as ReportRow | null;
}

async function fetchSessionStatus(supabase: SupabaseClient, sessionId: string) {
  const { data: session, error } = await supabase
    .schema("simulador")
    .from("simulation_sessions")
    .select("id, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    console.warn("No se pudo leer estado de sesión", {
      sessionId,
      error: error.message,
    });
    return null;
  }

  return session;
}

function reportPendingResponse(session: { status?: string | null } | null) {
  return NextResponse.json(
    {
      status: "none",
      session_status: session?.status ?? null,
      message:
        session?.status === "submitted"
          ? "Scoring in progress. Try again in a few seconds."
          : "This session has not been submitted for scoring yet.",
    },
    { status: session ? 200 : 404 },
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  const { session_id } = await params;
  const localSessionId = await resolveLocalSessionId(session_id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Dev-only: con el bypass activo servimos un reporte mock para QA visual
    // del ReportShell. `isDevBypassActive` es false en producción.
    const cookieStore = await cookies();
    if (isDevBypassActive(cookieStore.get("itera_dev_bypass")?.value)) {
      if (localSessionId) {
        try {
          const admin = createAdminClient();
          const report = await fetchReport(admin, localSessionId);
          if (report) {
            const practice = await fetchPracticeForSession(localSessionId);
            return NextResponse.json(toReportEnvelope(report, practice));
          }

          const session = await fetchSessionStatus(admin, localSessionId);
          if (session) return reportPendingResponse(session);
        } catch (error) {
          console.warn("No se pudo leer reporte demo real; usando mock", {
            sessionId: session_id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      return NextResponse.json(getMockReport(session_id));
    }
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const effectiveSessionId = localSessionId ?? session_id;
  if (!UUID_RE.test(effectiveSessionId)) {
    return reportPendingResponse(null);
  }

  // RLS scopes esto al user/manager/admin autorizado.
  const report = await fetchReport(supabase, effectiveSessionId);

  if (!report) {
    // No hay report aún — el cliente debe seguir polleando.
    const session = await fetchSessionStatus(supabase, effectiveSessionId);
    return reportPendingResponse(session);
  }

  const practice = await fetchPracticeForSession(effectiveSessionId);
  return NextResponse.json(toReportEnvelope(report, practice));
}
