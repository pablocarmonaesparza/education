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
// MOCK DATA — temporal hasta W4-W6 (cuando dashboard + report consuman BD).
// Mantener aquí evita romper build mientras cableamos. TODO eliminar cuando
// los componentes lean de `/api/orgs/.../aggregate` y `/api/sessions/.../report`.
// ============================================================================

export const TEAM_MEMBERS = [
  {
    id: "P001",
    initials: "ML",
    role: "Marketing Manager",
    status: "completed" as const,
    readiness: "A" as BandKey,
    sessionDuration: 19,
  },
  {
    id: "P002",
    initials: "JT",
    role: "Growth Marketer",
    status: "completed" as const,
    readiness: "M" as BandKey,
    sessionDuration: 22,
  },
  {
    id: "P003",
    initials: "RC",
    role: "Content Lead",
    status: "completed" as const,
    readiness: "M" as BandKey,
    sessionDuration: 17,
  },
  {
    id: "P004",
    initials: "AS",
    role: "Demand Gen Lead",
    status: "in_progress" as const,
    readiness: null,
    sessionDuration: null,
  },
  {
    id: "P005",
    initials: "FV",
    role: "Marketing Director",
    status: "not_started" as const,
    readiness: null,
    sessionDuration: null,
  },
];

export const REPORT_SYNTHETIC = {
  participantId: "P001",
  participantInitials: "ML",
  role: "Marketing Manager",
  caseTitle: "Campaña urgente con feedback de clientes",
  caseId: "marketing_urgent_campaign_pii",
  durationMin: 19,
  evaluatedAt: "2026-05-25",
  bands: {
    contexto: "A",
    privacidad: "B",
    validacion: "M",
    juicio: "M",
    decision: "A",
  } as Record<DimensionId, BandKey>,
  gaps: [
    {
      id: "expose_pii",
      severity: "high",
      observed:
        "Al preparar los datos para el modelo, mantuvo los campos name, email y company sin transformación. El prompt enviado al LLM corporativo incluyó 60 registros con identificadores personales completos.",
      whyMatters:
        "Exposición de datos personales sin consentimiento → riesgo regulatorio (LFPDPPP México, Ley 1581 Colombia) + riesgo reputacional si la conversación se filtra.",
    },
    {
      id: "weak_artifact_review",
      severity: "medium",
      observed:
        "Al revisar el output del modelo, marcó las 3 sugerencias como 'problemáticas' sin discriminar el problema de cada una.",
      whyMatters:
        "Si revisas todo como rojo, el equipo no sabe qué bloquear vs editar. Parálisis o sub-revisión, ambos riesgos.",
    },
    {
      id: "accept_output_no_validation",
      severity: "medium",
      observed:
        "En el follow-up del paso 2 escribió 'uso los 3 ángulos tal cual, ya están bien armados' sin mencionar qué validaría. Una de las cifras era inventada por el modelo.",
      whyMatters:
        "Publicar cifra inventada en campaña B2B daña credibilidad. El equipo de sales recibe 'de dónde sale esa cifra' sin respuesta.",
    },
  ],
  riskEvents: [
    {
      type: "exposed_pii_to_model",
      severity: "high",
      step: 2,
      excerpt:
        "Pegué el dataset completo con los 60 registros, nombres, emails y empresas, en el prompt al modelo. El GPT corporativo está aprobado por IT, no debería ser problema…",
    },
    {
      type: "hidden_pii_usage_from_authority",
      severity: "medium",
      step: 4,
      excerpt:
        "Mandé los 3 ángulos en bullets a Camila. Limpios, listos para campaña. No le mencioné que el dataset tenía datos personales…",
    },
  ],
  strengths: [
    "Encuadró correctamente audiencia (LinkedIn Ads + email a prospects), tono corporativo cálido y restricciones de longitud en el prompt al modelo.",
    "En el paso 5, al proponer Camila usar revenue_potential para segmentación, objetó proponiendo alternativa concreta (segmentar por sector y tamaño).",
    "La decisión final del paso 4 incluyó próximos pasos accionables.",
  ],
  recommendation: {
    action: "entrenar" as const,
    appliesTo:
      "Al participante; revisar si el equipo comparte flujos similares con datos de clientes.",
    nextWeekActions: [
      "Agendar 45 min para revisar qué campos del CRM/datasets pueden ir al LLM corporativo y cuáles no. Salir con checklist de privacidad de 1 página.",
      "Coordinar con IT/legal clarificación de política PII para el LLM aprobado.",
      "Pedir documentar 1 ejemplo reciente de uso de IA con datos reales para revisión cruzada.",
    ],
    reason:
      "Criterio fuerte en encuadre de prompts (contexto: A) y comunicación final (decisión: A), pero gap sistemático en privacidad (B). En flujos sin datos personales puede operar autónomo; en flujos con PII requiere entrenamiento + checkpoint.",
  },
  meta: {
    kappa: 0.52,
    judgeAgreement: 73,
    discrepancyCells: 2,
    rubricVersion: "rubric_marketing_v1@1.0.0",
    caseVersion: "marketing_urgent_campaign_pii_v1",
    variant: "marketing_urgent_campaign_pii__loop_saas_b2b_v1",
  },
};

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
