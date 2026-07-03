/**
 * /staff/casos/[slug] — "Caso revisión" (manager).
 *
 * Server component: carga el caso jugable del registro estático (por caso base;
 * el slug puede ser org-scoped o global). El gate de auth lo aplica el layout
 * (app). Los datos del equipo los agrega el cliente vía
 * GET /api/cases/[slug]/team-review.
 */

import { loadAssembledCase } from "@/lib/simulador/load-assembled-case";
import { ManagerCaseReviewClient } from "./ManagerCaseReviewClient";

function baseCaseId(slug: string): string {
  const m = slug.match(/^[0-9a-f-]{36}__(.+)__v\d+$/);
  return m ? m[1] : slug;
}

export default async function ManagerCaseReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playableCase = loadAssembledCase(baseCaseId(slug));
  const fallbackTitle =
    (playableCase?.managerOutcome?.primary_question as string) ??
    "Caso del equipo";
  return (
    <ManagerCaseReviewClient
      slug={slug}
      fallbackTitle={fallbackTitle}
      playableCase={playableCase}
    />
  );
}
