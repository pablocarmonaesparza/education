// Ruta productiva CONFIG-DRIVEN: juega cualquier caso generado (formato 5x5
// rico). Aditiva: no toca /(app)/case/[case_id] (el runtime hardcodeado de
// Camila). Hereda el guard de auth del layout (app).
//
// Server component: carga el caso (fuente dev = YAML ensamblado; producción =
// base por empresa) y lo pasa al runtime cliente.

import { notFound } from "next/navigation";
import { loadAssembledCase } from "@/lib/simulador/load-assembled-case";
import { RuntimeExperienceV2 } from "@/components/simulador/RuntimeExperienceV2";

export default async function PlayCasePage({
  params,
}: {
  params: Promise<{ case_id: string }>;
}) {
  const { case_id } = await params;
  const playableCase = loadAssembledCase(case_id);
  if (!playableCase) notFound();
  return <RuntimeExperienceV2 playableCase={playableCase} mode="authenticated" />;
}
