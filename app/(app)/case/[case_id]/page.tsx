// Runtime productivo CONFIG-DRIVEN: juega cualquier caso generado (formato 5x5
// rico). Hereda el guard de auth del layout (app).
//
// Server component: resuelve la organización del usuario y carga su caso
// generado (de la base), con fallback al registro estático (casos sembrados o
// globales). Lo pasa al runtime cliente.
//
// Antes existían dos rutas para esto (/case con el motor legacy hardcodeado a
// 5 pasos, /jugar con este motor config-driven). Se consolidaron en una sola:
// el motor config-driven vive aquí, bajo la URL pública que ya estaba enlazada
// desde CaseCard/dashboard/staff/reportes. /jugar no existe más.

import { notFound } from "next/navigation";
import { loadAssembledCase } from "@/lib/simulador/load-assembled-case";
import {
  loadPlayableCaseForOrg,
  resolveCurrentOrgId,
  orgScopedSlug,
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
  // Con empresa, el caso bespoke está sembrado con slug org-scoped y RLS
  // aislada: la sesión persiste y se evalúa. Sin empresa (registro estático),
  // corre en preview.
  const sessionSlug = orgId
    ? orgScopedSlug(orgId, playableCase.caseId, playableCase.version)
    : undefined;
  return (
    <RuntimeExperienceV2
      playableCase={playableCase}
      sessionSlug={sessionSlug}
      previewOnly={!sessionSlug}
      mode="authenticated"
    />
  );
}
