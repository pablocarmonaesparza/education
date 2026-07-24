/**
 * Config canónica del Simulador (frontend).
 *
 * Estos valores son CONFIG estático (no DATA): se replican entre código y
 * tabla `simulador.case_templates` / `simulador.rubric_dimensions` para
 * permitir que el cliente renderice antes de pegarle a la BD (loading states,
 * landing page sin auth, etc.).
 *
 * Si cambias algún CONFIG aquí, debes:
 *   1. Actualizar el seed SQL en supabase/migrations/ (o el seed runner)
 *   2. Versionar la rúbrica si afecta evaluación (bump semver)
 *   3. Confirmar que el UI lo refleja (smoke test del runtime + dashboard)
 *
 * MOCK DATA queda intencionalmente fuera. SAMPLE_FEEDBACK_ROWS, TEAM_MEMBERS,
 * REPORT_SYNTHETIC, SPRINT_AGGREGATE — todo eso vive ahora en BD y se obtiene
 * via API en W4-W6.
 */

// Capa de display de las 6 dimensiones. Los `id` son identificadores canónicos
// (rúbrica YAML + dimension_key en BD + ENGINE_CONTRACT §6) y NO cambian.
// Labels según §4 del glosario: validacion → "Verification", no "Validation".
export const DIMENSIONS = [
  {
    id: "contexto",
    label: "Context",
    description:
      "Understands the goal, audience, constraints, stakeholder, and what success looks like.",
  },
  {
    id: "datos",
    label: "Data handling",
    description:
      "Uses information that is sufficient, minimized, permitted, and good enough in quality.",
  },
  {
    id: "ejecucion_ia",
    label: "AI execution",
    description:
      "Picks and configures the prompt, workflow, or agent to match the level of the work.",
  },
  {
    id: "validacion",
    label: "Verification",
    description:
      "Checks AI output before using it. Catches invented claims, overreach, and hallucinations.",
  },
  {
    id: "juicio",
    label: "Judgment",
    description:
      "Reads risk, authority, and consequences. Knows when to escalate.",
  },
  {
    id: "impacto",
    label: "Impact",
    description:
      "Turns AI use into a decision, a saving, an action, or a visible result.",
  },
] as const;

export type BandKey = "A" | "M" | "B";
export type DimensionId = (typeof DIMENSIONS)[number]["id"];
export type LegacyDimensionId = "privacidad" | "decision";
export type ReportDimensionId = DimensionId | LegacyDimensionId;

export const LEGACY_DIMENSION_ALIASES: Record<
  LegacyDimensionId,
  DimensionId
> = {
  privacidad: "datos",
  decision: "impacto",
};

const CANONICAL_DIMENSION_IDS = new Set<string>(
  DIMENSIONS.map((dimension) => dimension.id),
);

export function canonicalDimensionId(id: string): DimensionId | null {
  if (CANONICAL_DIMENSION_IDS.has(id)) return id as DimensionId;
  return LEGACY_DIMENSION_ALIASES[id as LegacyDimensionId] ?? null;
}

// Capa de display de las bandas. Los keys A/M/B son valores de BD (CHECK
// constraints) y NO cambian. Glosario §3: A → High, M → Medium, B → Low.
export const BAND_LABELS: Record<BandKey, string> = {
  A: "High",
  M: "Medium",
  B: "Low",
};

export const BAND_COLORS: Record<BandKey, string> = {
  A: "success",
  M: "warning",
  B: "danger",
};

/**
 * R-13 (RULES_LEDGER): cortes de banda canónicos — ÚNICA fuente del mapeo
 * score↔banda en todo el sistema. Espejo exacto de la rúbrica congelada
 * (docs/simulador/contrato_v0/rubricas/rubric_case_factory_v1.yaml):
 *   B [0, 64] · M [65, 84] · A [85, 100]
 * Nadie define otros cortes: reportes, PDF y cualquier agregado importan esto.
 * Cambiar los cortes = nueva versión de rúbrica (rubric_semver_policy.md).
 */
export const BAND_CUTOFFS = { A_MIN: 85, M_MIN: 65 } as const;

export function bandFromScore100(score: number): BandKey {
  if (score >= BAND_CUTOFFS.A_MIN) return "A";
  if (score >= BAND_CUTOFFS.M_MIN) return "M";
  return "B";
}

/** Score representativo (punto medio del rango canónico) para derivar
 * agregados cuando solo hay bandas. */
export const BAND_REPRESENTATIVE_SCORE: Record<BandKey, number> = {
  A: 92,
  M: 75,
  B: 32,
};

/**
 * Catálogo de casos del Sprint marketing_30d. Cada slug aparece en BD
 * (simulador.case_templates) cuando el seed correspondiente corre.
 *
 * `id` es el slug sin version suffix. El runtime resuelve `id → case_template`
 * via query con el ultimo version active.
 */
export const SPRINT_CASES = [
  {
    id: "marketing_urgent_campaign_pii",
    order: 1,
    title: "Urgent campaign with customer feedback",
    tension: "Speed vs privacy",
    difficulty: "baseline" as const,
    dimensions: ["datos", "validacion", "juicio"] as DimensionId[],
  },
  {
    id: "marketing_copy_with_brand_voice",
    order: 2,
    title: "Writing copy in the brand voice",
    tension: "Speed vs brand voice",
    difficulty: "baseline" as const,
    dimensions: ["contexto", "validacion", "impacto"] as DimensionId[],
  },
  {
    id: "marketing_segment_with_sensitive_data",
    order: 3,
    title: "Segmenting on sensitive CRM data",
    tension: "Predictive bias + behavioral privacy",
    difficulty: "intermediate" as const,
    dimensions: ["datos", "juicio", "impacto"] as DimensionId[],
  },
  {
    id: "marketing_brief_to_agency_via_ia",
    order: 4,
    title: "Briefing an outside agency with AI",
    tension: "Strategy leak to a vendor",
    difficulty: "baseline" as const,
    dimensions: ["contexto", "impacto", "juicio"] as DimensionId[],
  },
  {
    id: "marketing_ad_creative_with_competitor_research",
    order: 5,
    title: "Competitive research + ad creative",
    tension: "Inadvertent plagiarism",
    difficulty: "intermediate" as const,
    dimensions: ["validacion", "juicio", "impacto"] as DimensionId[],
  },
  {
    id: "marketing_attribution_reporting_to_cmo",
    order: 6,
    title: "Attribution reporting to the CMO",
    tension: "Partly hallucinated data",
    difficulty: "intermediate" as const,
    dimensions: ["validacion", "contexto", "impacto"] as DimensionId[],
  },
  {
    id: "marketing_content_calendar_under_pressure",
    order: 7,
    title: "30-day content calendar",
    tension: "Speed vs curation",
    difficulty: "baseline" as const,
    dimensions: ["contexto", "juicio", "impacto"] as DimensionId[],
  },
  {
    id: "marketing_crisis_response_with_ia",
    order: 8,
    title: "Public crisis response with AI",
    tension: "Speed vs approval chain",
    difficulty: "advanced" as const,
    dimensions: ["juicio", "datos", "impacto"] as DimensionId[],
  },
];

// Capa de display de las recomendaciones. Los `id` son valores de BD (CHECK
// constraints en 3 tablas + la función SQL de riesgo) y NO cambian: solo se
// traduce `label`/`description`. Glosario: entrenar → "Coach", no "Train"
// (colisiona con el pilar de upskilling y suena a entrenar al modelo).
export const MANAGER_ACTIONS = [
  {
    id: "pilotar",
    label: "Pilot",
    description:
      "Can work in the real flow with weekly check-ins. Ready to run AI solo in their usual scope.",
    color: "success",
  },
  {
    id: "entrenar",
    label: "Coach",
    description:
      "Judgment is partial. Needs targeted practice before autonomy. Close supervision for 4-6 weeks.",
    color: "primary",
  },
  {
    id: "pausar",
    label: "Pause",
    description:
      "Should not use AI on sensitive flows yet. Re-assess once the gap is remediated.",
    color: "warning",
  },
  {
    id: "escalar",
    label: "Escalate",
    description:
      "The problem is not individual. Needs process, legal, compliance, IT or policy work before re-assessing the person.",
    color: "danger",
  },
] as const;

// ============================================================================
// Sprint marketing_30d (Fase 1 product copy) — usado por dashboard + landing.
// Métricas reales vienen de /api/dashboard.
// ============================================================================

export const SPRINT_META = {
  publicName: "AI Readiness Sprint · Marketing 30 days",
  oneLiner:
    "Measure and improve your marketing team's judgment when they use AI in real workflows. Baseline, practice, re-simulation, and an executive report you can act on.",
  // El pricing vive SOLO en lib/simulador/billing.ts (SIMULADOR_TIERS,
  // per-seat). El bloque fase_1/fase_2 $4-8K se retiró (F5): describía el
  // modelo viejo y contradecía el precio real. No re-agregar aquí.
  primaryAudience: ["Head of Marketing", "VP of Growth", "Head of Operations"],
  geoTarget: ["US"],
  industries: [
    "B2B SaaS mid-market",
    "Professional services",
    "Ecommerce",
  ],
} as const;
