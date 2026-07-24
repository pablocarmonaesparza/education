import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { parsePracticeBeatContent } from "@/lib/simulador/practice-beats";
import { PracticeBeatClient } from "../(app)/practica/[beat_slug]/PracticeBeatClient";

/**
 * /aprender-demo — DEMO PÚBLICO del motor educativo.
 *
 * Antes usaba un módulo hardcodeado (module-data.ts, que /motores aún referencia
 * como muestra). Ahora carga un practice beat REAL de simulador.practice_beats y
 * lo renderiza con el MISMO PracticeBeatClient que el producto usa en
 * /practica/[beat_slug] — para que el demo educativo sea un caso real del
 * sistema, simétrico con el demo operativo (/case-demo). previewOnly: no escribe
 * intentos. closeHref a la landing. noindex (robots.ts + aquí).
 */
export const metadata: Metadata = {
  title: "Demo · Itera practice engine",
  robots: { index: false, follow: false },
};

const FEATURED_BEAT = "module_claude5_fable_n1";

export default async function AprenderDemoPage() {
  const admin = createAdminClient();

  let { data: beat } = await admin
    .schema("simulador")
    .from("practice_beats")
    .select("slug, title, dimension_key, duration_estimate_min, content_json")
    .eq("slug", FEATURED_BEAT)
    .eq("status", "active")
    .maybeSingle();

  if (!beat) {
    const { data: fallback } = await admin
      .schema("simulador")
      .from("practice_beats")
      .select("slug, title, dimension_key, duration_estimate_min, content_json")
      .eq("status", "active")
      .order("slug", { ascending: true })
      .limit(1)
      .maybeSingle();
    beat = fallback ?? null;
  }

  if (!beat) notFound();

  const playable = parsePracticeBeatContent(beat);
  if (!playable) notFound();

  return (
    <div className="simulador-root">
      <PracticeBeatClient beat={playable} previewOnly closeHref="/" />
    </div>
  );
}
