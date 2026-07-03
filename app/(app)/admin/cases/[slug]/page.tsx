/**
 * /admin/cases/[slug] — "Caso revisión" (staff/admin).
 *
 * Server component: carga el caso jugable del registro estático por su caso
 * base (el slug puede ser org-scoped `{org}__{base}__v{n}` o global). El gate
 * de staff lo aplica el layout de /admin. La efectividad la agrega el cliente
 * vía GET /api/admin/cases/[slug].
 */

import { loadAssembledCase } from "@/lib/simulador/load-assembled-case";
import { AdminCaseReviewClient } from "./AdminCaseReviewClient";

function baseCaseId(slug: string): string {
  const m = slug.match(/^[0-9a-f-]{36}__(.+)__v\d+$/);
  return m ? m[1] : slug;
}

export default async function AdminCaseReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playableCase = loadAssembledCase(baseCaseId(slug));
  return <AdminCaseReviewClient slug={slug} playableCase={playableCase} />;
}
