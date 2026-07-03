/**
 * POST /api/practica/attempts — inicia un intento de practice beat.
 *
 * Body: { beat_slug: string }
 * 200: { attempt_id, practice_unlock_id | null }
 *
 * Resuelve el unlock vivo del usuario para ese beat (si existe) y lo marca
 * 'started'. Sin unlock también permite practicar (práctica voluntaria): el
 * intento queda ligado solo al beat.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    beat_slug?: string;
  } | null;
  const beatSlug = body?.beat_slug?.trim();
  if (!beatSlug) {
    return NextResponse.json({ error: "beat_slug requerido." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: simUser } = await admin
    .schema("simulador")
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!simUser) {
    return NextResponse.json(
      { error: "Bridge user no inicializado." },
      { status: 500 },
    );
  }

  const { data: beat } = await admin
    .schema("simulador")
    .from("practice_beats")
    .select("id")
    .eq("slug", beatSlug)
    .eq("status", "active")
    .maybeSingle();
  if (!beat) {
    return NextResponse.json({ error: "Beat no encontrado." }, { status: 404 });
  }

  const { data: unlock } = await admin
    .schema("simulador")
    .from("practice_unlocks")
    .select("id, status, sprint_id, source_session_id")
    .eq("user_id", simUser.id)
    .eq("practice_beat_id", beat.id)
    .in("status", ["unlocked", "started"])
    .order("unlocked_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: attempt, error: aErr } = await admin
    .schema("simulador")
    .from("practice_attempts")
    .insert({
      practice_beat_id: beat.id,
      practice_unlock_id: unlock?.id ?? null,
      user_id: simUser.id,
      sprint_id: unlock?.sprint_id ?? null,
      source_session_id: unlock?.source_session_id ?? null,
      status: "started",
    })
    .select("id")
    .single();
  if (aErr || !attempt) {
    console.error("[practica/attempts] insert failed", aErr);
    return NextResponse.json(
      { error: "No se pudo iniciar el intento." },
      { status: 500 },
    );
  }

  if (unlock && unlock.status === "unlocked") {
    await admin
      .schema("simulador")
      .from("practice_unlocks")
      .update({ status: "started", updated_at: new Date().toISOString() })
      .eq("id", unlock.id);
  }

  return NextResponse.json({
    attempt_id: attempt.id,
    practice_unlock_id: unlock?.id ?? null,
  });
}
