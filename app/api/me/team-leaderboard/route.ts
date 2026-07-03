/**
 * GET /api/me/team-leaderboard — ranking del equipo del viewer (F4, mata el
 * mock LEADERBOARD de /team).
 *
 * Para cada miembro del/los equipo(s) del viewer: promedio de score (0-100) de
 * sus reportes visibles, convertido a escala 0-10, ordenado desc. Marca al
 * viewer con is_current_user. Miembros sin reportes quedan al final con score 0.
 *
 * Cortes/score representativo salen de config (R-13). Dev bypass → equipo demo.
 * 200 { leaderboard: [...] } · 401 sin sesión.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDevBypassActive } from "@/lib/dev/devBypass";
import { BAND_REPRESENTATIVE_SCORE, type BandKey } from "@/lib/simulador/config";

export const runtime = "nodejs";

function initialsFrom(name: string | null, email: string): string {
  const base = (name ?? email).trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

/** Score representativo 0-100 de un reporte = promedio de sus dimensiones. */
function reportScore(payload: unknown): number | null {
  const dims = (payload as { dimensions?: { band?: string }[] })?.dimensions;
  if (!dims?.length) return null;
  let sum = 0;
  let n = 0;
  for (const d of dims) {
    if (d.band === "A" || d.band === "M" || d.band === "B") {
      sum += BAND_REPRESENTATIVE_SCORE[d.band as BandKey];
      n += 1;
    }
  }
  return n > 0 ? sum / n : null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();

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
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }
    const { data: demo } = await admin
      .schema("simulador")
      .from("users")
      .select("id")
      .ilike("email", "ana.demo@%")
      .limit(1)
      .maybeSingle();
    simUserId = (demo?.id as string) ?? null;
  }

  if (!simUserId) return NextResponse.json({ leaderboard: [] });

  // Equipos del viewer → todos los miembros.
  const { data: myTeams } = await admin
    .schema("simulador")
    .from("team_memberships")
    .select("team_id")
    .eq("user_id", simUserId);
  const teamIds = (myTeams ?? []).map((t) => t.team_id as string);
  if (teamIds.length === 0) return NextResponse.json({ leaderboard: [] });

  const { data: members } = await admin
    .schema("simulador")
    .from("team_memberships")
    .select("user_id")
    .in("team_id", teamIds);
  const memberIds = Array.from(
    new Set((members ?? []).map((m) => m.user_id as string)),
  );
  if (memberIds.length === 0) return NextResponse.json({ leaderboard: [] });

  const [{ data: profiles }, { data: sessions }] = await Promise.all([
    admin
      .schema("simulador")
      .from("users")
      .select("id, full_name, email")
      .in("id", memberIds),
    admin
      .schema("simulador")
      .from("simulation_sessions")
      .select("id, user_id")
      .in("user_id", memberIds),
  ]);

  const sessionOwner = new Map(
    (sessions ?? []).map((s) => [s.id as string, s.user_id as string]),
  );
  const sessionIds = [...sessionOwner.keys()];

  // Promedio de score por usuario (a partir de sus reportes).
  const scoresByUser = new Map<string, number[]>();
  if (sessionIds.length > 0) {
    const { data: reports } = await admin
      .schema("simulador")
      .from("reports")
      .select("simulation_session_id, payload_json")
      .in("simulation_session_id", sessionIds);
    for (const r of reports ?? []) {
      const owner = sessionOwner.get(r.simulation_session_id as string);
      if (!owner) continue;
      const sc = reportScore(r.payload_json);
      if (sc === null) continue;
      const arr = scoresByUser.get(owner) ?? [];
      arr.push(sc);
      scoresByUser.set(owner, arr);
    }
  }

  const leaderboard = (profiles ?? [])
    .map((p) => {
      const scores = scoresByUser.get(p.id as string) ?? [];
      const avg100 =
        scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return {
        name: (p.full_name as string) ?? (p.email as string),
        initials: initialsFrom(p.full_name as string, p.email as string),
        score: Math.round((avg100 / 10) * 10) / 10, // 0-10, 1 decimal
        has_reports: scores.length > 0,
        is_current_user: (p.id as string) === simUserId,
      };
    })
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({ leaderboard });
}
