/**
 * PATCH /api/practica/attempts/[attempt_id] — completa un intento.
 *
 * Body: { response_json?: object }
 * 200: { ok: true, unlock_completed: boolean }
 *
 * Marca el intento 'completed' y, si venía de un unlock, cierra también el
 * unlock. La completitud v1 es por finalización (el modo formativo enseña con
 * feedback por ejercicio; no bloquea por score).
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ attempt_id: string }> },
) {
  const { attempt_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    response_json?: Record<string, unknown>;
  } | null;

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

  const { data: attempt } = await admin
    .schema("simulador")
    .from("practice_attempts")
    .select("id, user_id, practice_unlock_id, status")
    .eq("id", attempt_id)
    .maybeSingle();
  if (!attempt) {
    return NextResponse.json({ error: "Intento no encontrado." }, { status: 404 });
  }
  if (attempt.user_id !== simUser.id) {
    return NextResponse.json({ error: "No es tu intento." }, { status: 403 });
  }

  const now = new Date().toISOString();
  const { error: updErr } = await admin
    .schema("simulador")
    .from("practice_attempts")
    .update({
      status: "completed",
      completed_at: now,
      updated_at: now,
      response_json: body?.response_json ?? {},
    })
    .eq("id", attempt.id);
  if (updErr) {
    console.error("[practica/attempts] complete failed", updErr);
    return NextResponse.json(
      { error: "No se pudo completar el intento." },
      { status: 500 },
    );
  }

  let unlockCompleted = false;
  if (attempt.practice_unlock_id) {
    const { error: unErr } = await admin
      .schema("simulador")
      .from("practice_unlocks")
      .update({ status: "completed", completed_at: now, updated_at: now })
      .eq("id", attempt.practice_unlock_id);
    unlockCompleted = !unErr;
    if (unErr) {
      console.warn("[practica/attempts] unlock complete warn", unErr);
    }
  }

  return NextResponse.json({ ok: true, unlock_completed: unlockCompleted });
}
