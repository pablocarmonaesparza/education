/**
 * GET /api/cases/[slug]/team-review — vista de caso para el MANAGER (F3).
 *
 * Scope: el/los equipo(s) del viewer. Devuelve quién de su equipo completó
 * este caso (con su banda y link al reporte) y las fortalezas observadas
 * agregadas de esos reportes. `slug` puede ser global u org-scoped: se resuelve
 * al caso base y se agregan todos sus templates.
 *
 * No expone datos fuera del equipo del viewer (se scopea a team_memberships).
 * En dev bypass usa el equipo de la org demo. Service role para agregar.
 *
 * 200 { case, completions, strengths } · 401 sin sesión.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDevBypassActive } from "@/lib/dev/devBypass";
import type { Band } from "@/lib/simulador/case-catalog";

export const runtime = "nodejs";

const COMPLETED_STATUSES = new Set([
  "completed",
  "submitted",
  "evaluated",
  "evidence_emitted",
]);

function baseCaseId(slug: string): string {
  const m = slug.match(/^[0-9a-f-]{36}__(.+)__v\d+$/);
  return m ? m[1] : slug;
}

function dominantBand(payload: unknown): Band | null {
  const dims = (payload as { dimensions?: { band?: string }[] })?.dimensions;
  if (!dims?.length) return null;
  const counts: Record<string, number> = {};
  for (const d of dims) if (d.band) counts[d.band] = (counts[d.band] ?? 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return top === "A" || top === "M" || top === "B" ? top : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ case_id: string }> },
) {
  const { case_id: slug } = await params;
  const base = baseCaseId(slug);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();

  // Resolver el simUser del viewer (o el demo bajo bypass).
  let simUserId: string | null = null;
  if (user) {
    const { data: su } = await admin
      .schema("simulador")
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    simUserId = (su?.id as string) ?? null;
  } else {
    const cookieStore = await cookies();
    if (!isDevBypassActive(cookieStore.get("itera_dev_bypass")?.value)) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const { data: demo } = await admin
      .schema("simulador")
      .from("users")
      .select("id")
      .ilike("email", "%demo%")
      .limit(1)
      .maybeSingle();
    simUserId = (demo?.id as string) ?? null;
  }

  if (!simUserId) {
    return NextResponse.json({
      case: { base_case_id: base, title: null },
      completions: [],
      strengths: [],
    });
  }

  // Equipos del viewer → miembros de esos equipos.
  const { data: myTeams } = await admin
    .schema("simulador")
    .from("team_memberships")
    .select("team_id")
    .eq("user_id", simUserId);
  const teamIds = (myTeams ?? []).map((t) => t.team_id as string);

  if (teamIds.length === 0) {
    return NextResponse.json({
      case: { base_case_id: base, title: null },
      completions: [],
      strengths: [],
    });
  }

  const { data: teamMembers } = await admin
    .schema("simulador")
    .from("team_memberships")
    .select("user_id")
    .in("team_id", teamIds);
  const memberIds = Array.from(
    new Set((teamMembers ?? []).map((m) => m.user_id as string)),
  );

  // Templates del caso base → variants.
  const { data: templates } = await admin
    .schema("simulador")
    .from("case_templates")
    .select("id, title")
    .or(`slug.eq.${base},slug.like.%__${base}__v%`)
    .order("version", { ascending: false });
  const templateIds = (templates ?? []).map((t) => t.id as string);
  const caseTitle = (templates ?? [])[0]?.title ?? null;

  if (templateIds.length === 0 || memberIds.length === 0) {
    return NextResponse.json({
      case: { base_case_id: base, title: caseTitle },
      completions: [],
      strengths: [],
    });
  }

  const { data: variants } = await admin
    .schema("simulador")
    .from("case_variants")
    .select("id")
    .in("case_template_id", templateIds);
  const variantIds = (variants ?? []).map((v) => v.id as string);

  if (variantIds.length === 0) {
    return NextResponse.json({
      case: { base_case_id: base, title: caseTitle },
      completions: [],
      strengths: [],
    });
  }

  // Sesiones completadas de los miembros del equipo en este caso.
  const { data: sessions } = await admin
    .schema("simulador")
    .from("simulation_sessions")
    .select("id, status, user_id, completed_at")
    .in("case_variant_id", variantIds)
    .in("user_id", memberIds);

  const completedSessions = (sessions ?? []).filter((s) =>
    COMPLETED_STATUSES.has(s.status as string),
  );

  if (completedSessions.length === 0) {
    return NextResponse.json({
      case: { base_case_id: base, title: caseTitle },
      completions: [],
      strengths: [],
    });
  }

  // Perfiles de los completadores + reportes (banda + strengths).
  const completerIds = Array.from(
    new Set(completedSessions.map((s) => s.user_id as string)),
  );
  const sessionIds = completedSessions.map((s) => s.id as string);

  const [{ data: profiles }, { data: reports }] = await Promise.all([
    admin
      .schema("simulador")
      .from("users")
      .select("id, full_name, email")
      .in("id", completerIds),
    admin
      .schema("simulador")
      .from("reports")
      .select("simulation_session_id, payload_json")
      .in("simulation_session_id", sessionIds),
  ]);

  const profileById = new Map(
    (profiles ?? []).map((p) => [
      p.id as string,
      { name: (p.full_name as string) ?? null, email: p.email as string },
    ]),
  );
  const reportBySession = new Map(
    (reports ?? []).map((r) => [r.simulation_session_id as string, r.payload_json]),
  );

  const strengthsCount = new Map<string, number>();
  const completions = completedSessions.map((s) => {
    const payload = reportBySession.get(s.id as string);
    const band = dominantBand(payload);
    const strengths = (payload as { strengths?: string[] })?.strengths ?? [];
    for (const st of strengths) {
      const key = st.trim();
      if (key) strengthsCount.set(key, (strengthsCount.get(key) ?? 0) + 1);
    }
    const prof = profileById.get(s.user_id as string);
    return {
      session_id: s.id as string,
      user_name: prof?.name ?? prof?.email ?? "Participante",
      band,
      completed_at: (s.completed_at as string) ?? null,
      has_report: reportBySession.has(s.id as string),
    };
  });

  // Fortalezas agregadas del equipo (las más frecuentes primero).
  const strengths = [...strengthsCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([text, count]) => ({ text, count }));

  return NextResponse.json({
    case: { base_case_id: base, title: caseTitle },
    completions: completions.sort((a, b) =>
      (b.completed_at ?? "").localeCompare(a.completed_at ?? ""),
    ),
    strengths,
  });
}
