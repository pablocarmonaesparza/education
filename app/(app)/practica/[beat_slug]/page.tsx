// Player de practice beats — el runtime EDUCATIVO productivo.
//
// Server component: carga el beat activo desde simulador.practice_beats
// (content_json.slides, mismo shape formativo que validó /aprender-demo) y
// resuelve si el usuario puede persistir intentos. Sin usuario (QA con
// bypass), corre en preview: jugable, sin escribir practice_attempts.

import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { parsePracticeBeatContent } from "@/lib/simulador/practice-beats";
import { PracticeBeatClient } from "./PracticeBeatClient";

export default async function PracticeBeatPage({
  params,
}: {
  params: Promise<{ beat_slug: string }>;
}) {
  const { beat_slug } = await params;
  const admin = createAdminClient();
  const { data: beat, error: beatErr } = await admin
    .schema("simulador")
    .from("practice_beats")
    .select("slug, title, dimension_key, duration_estimate_min, content_json")
    .eq("slug", beat_slug)
    .eq("status", "active")
    .maybeSingle();
  if (beatErr) {
    console.error("[practica] beat query failed", beatErr);
  }
  if (!beat) {
    console.warn("[practica] beat no encontrado en BD", { beat_slug });
    notFound();
  }

  const playable = parsePracticeBeatContent(beat);
  if (!playable) {
    console.warn("[practica] content_json sin slides parseables", {
      beat_slug,
      keys: Object.keys((beat.content_json as object) ?? {}),
    });
    notFound();
  }

  let canPersist = false;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: simUser } = await admin
      .schema("simulador")
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    canPersist = Boolean(simUser);
  }

  return <PracticeBeatClient beat={playable} previewOnly={!canPersist} />;
}
