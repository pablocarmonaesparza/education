/**
 * GET /api/practica/catalog — el catálogo de CAPACITACIÓN del viewer.
 *
 * El pilar de retención del negocio (decisión Pablo 2026-07-06): la
 * capacitación continua no es un extra del diagnóstico, es la mitad del
 * producto. Este endpoint alimenta /aprender con dos ristras:
 *
 *   - modules: módulos de TEMA (module_kind=topic en content_json) — los
 *     updates del mercado de IA que el motor educativo genera. Ordenados por
 *     frescura (created_at desc); is_new si tiene menos de 14 días.
 *   - remedial: los beats desbloqueados para el viewer por el judge
 *     (practice_unlocks), su práctica dirigida.
 *
 * Cada item trae el estado real del viewer (not_started | in_progress |
 * completed) desde practice_attempts. Dev bypass → usuario demo.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDevBypassActive } from "@/lib/dev/devBypass";

export const runtime = "nodejs";

const NEW_WINDOW_DAYS = 14;

type BeatRow = {
  id: string;
  slug: string;
  title: string;
  dimension_key: string | null;
  level: number | null;
  duration_estimate_min: number | null;
  created_at: string;
  content_json: Record<string, unknown> | null;
};

type CatalogStatus = "not_started" | "in_progress" | "completed";

function beatTopic(content: Record<string, unknown> | null): string | null {
  const t = content?.topic;
  return typeof t === "string" ? t : null;
}

function isTopicModule(content: Record<string, unknown> | null): boolean {
  return content?.module_kind === "topic";
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();

  // Resolver el simulador.users del viewer (o el demo bajo bypass).
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

  // Todos los beats activos (topic + remedial se separan por content_json).
  const { data: beats } = await admin
    .schema("simulador")
    .from("practice_beats")
    .select(
      "id, slug, title, dimension_key, level, duration_estimate_min, created_at, content_json",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const beatRows = (beats ?? []) as BeatRow[];

  // Estado del viewer por beat (attempt más reciente).
  const statusByBeat = new Map<string, CatalogStatus>();
  if (simUserId && beatRows.length > 0) {
    const { data: attempts } = await admin
      .schema("simulador")
      .from("practice_attempts")
      .select("practice_beat_id, status, created_at")
      .eq("user_id", simUserId)
      .in("practice_beat_id", beatRows.map((b) => b.id))
      .order("created_at", { ascending: false });
    for (const a of attempts ?? []) {
      const key = a.practice_beat_id as string;
      if (statusByBeat.has(key)) continue; // el más reciente gana
      statusByBeat.set(
        key,
        (a.status as string) === "completed" ? "completed" : "in_progress",
      );
    }
  }

  // Unlocks del viewer (para la ristra remedial: solo lo desbloqueado).
  const unlockedBeatIds = new Set<string>();
  if (simUserId) {
    const { data: unlocks } = await admin
      .schema("simulador")
      .from("practice_unlocks")
      .select("practice_beat_id")
      .eq("user_id", simUserId);
    for (const u of unlocks ?? []) unlockedBeatIds.add(u.practice_beat_id as string);
  }

  const now = Date.now();
  const serialize = (b: BeatRow) => ({
    slug: b.slug,
    title: b.title,
    topic: beatTopic(b.content_json),
    dimension: b.dimension_key,
    level: b.level ?? 1,
    minutes: b.duration_estimate_min ?? 5,
    published_at: b.created_at,
    is_new:
      now - new Date(b.created_at).getTime() < NEW_WINDOW_DAYS * 24 * 3600 * 1000,
    status: statusByBeat.get(b.id) ?? ("not_started" as CatalogStatus),
  });

  const modules = beatRows.filter((b) => isTopicModule(b.content_json)).map(serialize);
  const remedial = beatRows
    .filter((b) => !isTopicModule(b.content_json) && unlockedBeatIds.has(b.id))
    .map(serialize);

  return NextResponse.json({ modules, remedial });
}
