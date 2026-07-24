/**
 * /onboarding/context — ELIMINADO del flow buyer (W2-A, 2026-07-23).
 *
 * El paso prometía "research your company from your site and the files you
 * shared" y era falso: los PDFs nunca se subían (solo metadata a Stripe) y el
 * motor ya no investiga empresas en onboarding — los tracks son por área
 * (decisión "cursos al mayoreo por área"). Queda como redirect permanente a
 * billing por si hay links vivos (emails, bookmarks, historial).
 */

import { redirect } from "next/navigation";

export default function OnboardingContextRedirect() {
  redirect("/onboarding/billing");
}
