/**
 * Catálogo de casos — TIPOS compartidos del contrato real (R-29).
 *
 * Reemplaza al mock lib/simulador/cases.ts: aquí solo viven los tipos que la
 * UI consume y helpers de presentación; los DATOS vienen de las APIs reales
 * (GET /api/cases para participante/manager, GET /api/admin/cases para staff).
 */

import { BAND_LABELS, type BandKey } from "@/lib/simulador/config";

export type Band = BandKey;
export const BAND_LABEL: Record<Band, string> = BAND_LABELS;

export type UserCaseStatus = "not_started" | "in_progress" | "completed";

export type CatalogLevel = "N1" | "N2" | "N3";

export interface CaseCatalogItem {
  slug: string;
  title: string;
  /** Pregunta/gancho del caso (del brief); opcional — la card degrada bien. */
  primaryQuestion?: string;
  level: CatalogLevel;
  /** career_key del template (marketing, sales, ops…). */
  department?: string;
  estimatedMinutes: number;
  difficulty?: string | null;
  /** Estado del viewer sobre este caso (sesión más reciente). */
  userStatus: UserCaseStatus;
  userCompletedAt?: string;
  userBand?: Band;
}

export const LEVEL_LABEL: Record<CatalogLevel, string> = {
  N1: "N1 · Fundamentos",
  N2: "N2 · Operación",
  N3: "N3 · Automatización",
};

export function departmentLabel(careerKey: string | null | undefined): string {
  const map: Record<string, string> = {
    marketing: "Marketing",
    sales: "Sales",
    customer_success: "Customer Success",
    operations: "Operations",
    ops: "Operations",
    finance: "Finance",
    legal: "Legal",
    people_hr: "People / HR",
    product: "Product",
    engineering: "Engineering",
  };
  if (!careerKey) return "General";
  return map[careerKey] ?? careerKey.charAt(0).toUpperCase() + careerKey.slice(1);
}
