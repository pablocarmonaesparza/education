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

export const DIMENSIONS = [
  {
    id: "contexto",
    label: "Contexto",
    description:
      "Encuadre de situación, audiencia, tono y restricciones al usar IA.",
  },
  {
    id: "privacidad",
    label: "Privacidad",
    description:
      "Protección de datos personales, comerciales y de terceros antes de pasarlos al modelo.",
  },
  {
    id: "validacion",
    label: "Validación",
    description:
      "Verificación del output de IA antes de usarlo. Detectar claims inventados, generalizaciones y alucinaciones.",
  },
  {
    id: "juicio",
    label: "Juicio",
    description:
      "Lectura de riesgos, autoridad y consecuencias. Saber cuándo escalar.",
  },
  {
    id: "decision",
    label: "Decisión",
    description:
      "Claridad de la acción final + comunicación responsable al manager.",
  },
] as const;

export type BandKey = "A" | "M" | "B";
export type DimensionId = (typeof DIMENSIONS)[number]["id"];

export const BAND_LABELS: Record<BandKey, string> = {
  A: "Alto",
  M: "Medio",
  B: "Bajo",
};

export const BAND_COLORS: Record<BandKey, string> = {
  A: "success",
  M: "warning",
  B: "danger",
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
    title: "Campaña urgente con feedback de clientes",
    tension: "Velocidad vs privacidad",
    difficulty: "baseline" as const,
    dimensions: ["privacidad", "validacion", "juicio"] as DimensionId[],
  },
  {
    id: "marketing_copy_with_brand_voice",
    order: 2,
    title: "Redacción de copy con voz de marca",
    tension: "Velocidad vs voz de marca",
    difficulty: "baseline" as const,
    dimensions: ["contexto", "validacion", "decision"] as DimensionId[],
  },
  {
    id: "marketing_segment_with_sensitive_data",
    order: 3,
    title: "Segmentación con datos sensibles del CRM",
    tension: "Bias predictivo + privacidad behavioral",
    difficulty: "intermediate" as const,
    dimensions: ["privacidad", "juicio", "decision"] as DimensionId[],
  },
  {
    id: "marketing_brief_to_agency_via_ia",
    order: 4,
    title: "Brief a agencia externa con IA",
    tension: "Leak de estrategia a vendor",
    difficulty: "baseline" as const,
    dimensions: ["contexto", "decision", "juicio"] as DimensionId[],
  },
  {
    id: "marketing_ad_creative_with_competitor_research",
    order: 5,
    title: "Research competitivo + ad creative",
    tension: "Plagio inadvertido",
    difficulty: "intermediate" as const,
    dimensions: ["validacion", "juicio", "decision"] as DimensionId[],
  },
  {
    id: "marketing_attribution_reporting_to_cmo",
    order: 6,
    title: "Attribution reporting al CMO",
    tension: "Datos parcialmente alucinados",
    difficulty: "intermediate" as const,
    dimensions: ["validacion", "contexto", "decision"] as DimensionId[],
  },
  {
    id: "marketing_content_calendar_under_pressure",
    order: 7,
    title: "Calendario de contenido 30 días",
    tension: "Velocidad vs curaduría",
    difficulty: "baseline" as const,
    dimensions: ["contexto", "juicio", "decision"] as DimensionId[],
  },
  {
    id: "marketing_crisis_response_with_ia",
    order: 8,
    title: "Respuesta a crisis pública con IA",
    tension: "Velocidad vs approval chain",
    difficulty: "advanced" as const,
    dimensions: ["juicio", "privacidad", "decision"] as DimensionId[],
  },
];

export const MANAGER_ACTIONS = [
  {
    id: "pilotar",
    label: "Pilotar",
    description:
      "Puede operar en flujo real con supervisión semanal. Apto para uso autónomo en su scope típico.",
    color: "success",
  },
  {
    id: "entrenar",
    label: "Entrenar",
    description:
      "Tiene criterio parcial. Necesita micro-práctica específica antes de autonomía. Supervisión cercana 4-6 semanas.",
    color: "primary",
  },
  {
    id: "pausar",
    label: "Pausar",
    description:
      "No debe usar IA en flujos sensibles todavía. Re-evaluar después de remediar gap.",
    color: "warning",
  },
  {
    id: "escalar",
    label: "Escalar",
    description:
      "El problema no es individual. Requiere proceso, legal, compliance, IT o policy antes de re-evaluar persona.",
    color: "danger",
  },
] as const;

// ============================================================================
// Sprint marketing_30d (Fase 1 product copy) — usado por dashboard + landing.
// Métricas reales vienen de /api/dashboard.
// ============================================================================

export const SPRINT_META = {
  publicName: "AI Readiness Sprint — Marketing 30 días",
  oneLiner:
    "Mide y mejora el criterio de tu equipo de marketing para usar IA en flujos reales. Baseline, práctica, re-simulación y reporte ejecutivo accionable.",
  pricing: {
    // Fase 1 paid diagnostic — alineado al contrato §12
    fase_1_min_usd: 4000,
    fase_1_max_usd: 8000,
    fase_2_min_usd: 8000,
    fase_2_max_usd: 15000,
    minSeats: 5,
    maxSeats: 50,
  },
  primaryAudience: ["Head of Marketing", "VP of Growth", "Head of Operations"],
  geoTarget: ["MX", "CO", "AR", "CL"],
  industries: [
    "SaaS B2B mid-market",
    "Servicios profesionales",
    "Ecommerce LATAM",
  ],
} as const;
