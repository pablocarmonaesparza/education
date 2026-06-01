// Ruta productiva CONFIG-DRIVEN: juega cualquier caso generado (formato 5x5
// rico). Aditiva: no toca /(app)/case/[case_id] (el runtime hardcodeado de
// Camila). Hereda el guard de auth del layout (app).
//
// Server component: resuelve la organización del usuario y carga su caso
// generado (de la base), con fallback al registro estático (casos sembrados o
// globales). Lo pasa al runtime cliente.

import { notFound } from "next/navigation";
import { loadAssembledCase } from "@/lib/simulador/load-assembled-case";
import {
  loadPlayableCaseForOrg,
  resolveCurrentOrgId,
} from "@/lib/simulador/generated-cases";
import { RuntimeExperienceV2 } from "@/components/simulador/RuntimeExperienceV2";

export default async function PlayCasePage({
  params,
}: {
  params: Promise<{ case_id: string }>;
}) {
  const { case_id } = await params;
  const orgId = await resolveCurrentOrgId();
  const playableCase = orgId
    ? await loadPlayableCaseForOrg(orgId, case_id)
    : loadAssembledCase(case_id);
  if (!playableCase) notFound();
  // Se juega en modo preview seguro (el caso bespoke vive aislado en
  // generated_cases por empresa). La evaluación productiva (sesión org-scoped)
  // es el cambio deliberado siguiente.
  return <RuntimeExperienceV2 playableCase={playableCase} mode="authenticated" />;
}
