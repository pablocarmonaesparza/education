// Datos sintéticos consistentes con docs/simulador/contrato_v0/
// caso 1: marketing_urgent_campaign_pii / variante loop_saas_b2b_v1

export const DIMENSIONS = [
  {
    id: "contexto",
    label: "contexto",
    description: "encuadre de situación, audiencia, tono y restricciones al usar IA",
  },
  {
    id: "privacidad",
    label: "privacidad",
    description: "protección de datos personales y confidenciales",
  },
  {
    id: "validacion",
    label: "validación",
    description: "verificación del output de IA antes de usarlo",
  },
  {
    id: "juicio",
    label: "juicio",
    description: "lectura de riesgos, autoridad y consecuencias",
  },
  {
    id: "decision",
    label: "decisión",
    description: "claridad y responsabilidad de la acción final",
  },
] as const;

export type BandKey = "A" | "M" | "B";
export type DimensionId = (typeof DIMENSIONS)[number]["id"];

export const BAND_LABELS: Record<BandKey, string> = {
  A: "alto",
  M: "medio",
  B: "bajo",
};

export const BAND_COLORS: Record<BandKey, string> = {
  A: "success",
  M: "warning",
  B: "danger",
};

export const SPRINT_CASES = [
  {
    id: "marketing_urgent_campaign_pii",
    order: 1,
    title: "campaña urgente con feedback de clientes",
    tension: "velocidad vs privacidad",
    difficulty: "baseline" as const,
    dimensions: ["privacidad", "validacion", "juicio"] as DimensionId[],
  },
  {
    id: "marketing_copy_with_brand_voice",
    order: 2,
    title: "redacción de copy con voz de marca",
    tension: "velocidad vs voz de marca",
    difficulty: "baseline" as const,
    dimensions: ["contexto", "validacion", "decision"] as DimensionId[],
  },
  {
    id: "marketing_segment_with_sensitive_data",
    order: 3,
    title: "segmentación con datos sensibles del CRM",
    tension: "bias predictivo + privacidad behavioral",
    difficulty: "intermediate" as const,
    dimensions: ["privacidad", "juicio", "decision"] as DimensionId[],
  },
  {
    id: "marketing_brief_to_agency_via_ia",
    order: 4,
    title: "brief a agencia externa con IA",
    tension: "leak de estrategia a vendor",
    difficulty: "baseline" as const,
    dimensions: ["contexto", "decision", "juicio"] as DimensionId[],
  },
  {
    id: "marketing_ad_creative_with_competitor_research",
    order: 5,
    title: "research competitivo + ad creative",
    tension: "plagio inadvertido",
    difficulty: "intermediate" as const,
    dimensions: ["validacion", "juicio", "decision"] as DimensionId[],
  },
  {
    id: "marketing_attribution_reporting_to_cmo",
    order: 6,
    title: "attribution reporting al CMO",
    tension: "datos parcialmente alucinados",
    difficulty: "intermediate" as const,
    dimensions: ["validacion", "contexto", "decision"] as DimensionId[],
  },
  {
    id: "marketing_content_calendar_under_pressure",
    order: 7,
    title: "calendario de contenido 30 días",
    tension: "velocidad vs curaduría",
    difficulty: "baseline" as const,
    dimensions: ["contexto", "juicio", "decision"] as DimensionId[],
  },
  {
    id: "marketing_crisis_response_with_ia",
    order: 8,
    title: "respuesta a crisis pública con IA",
    tension: "velocidad vs approval chain",
    difficulty: "advanced" as const,
    dimensions: ["juicio", "privacidad", "decision"] as DimensionId[],
  },
];

export const MANAGER_ACTIONS = [
  {
    id: "pilotar",
    label: "pilotar",
    description: "el equipo puede operar con IA en flujos productivos con supervisión semanal",
    color: "success",
  },
  {
    id: "entrenar",
    label: "entrenar",
    description: "criterio en formación; un segundo Sprint consolida la mejora",
    color: "primary",
  },
  {
    id: "pausar",
    label: "pausar",
    description: "no autónomo aún; bloquea uso de IA en flujos sensibles hasta nuevo Sprint",
    color: "warning",
  },
  {
    id: "escalar",
    label: "escalar",
    description: "problema de proceso, no individual; convoca legal/compliance antes de habilitar",
    color: "danger",
  },
] as const;

export const SAMPLE_FEEDBACK_ROWS = [
  {
    name: "Mariana López",
    email: "mariana.lopez@aurorares.mx",
    company: "Aurora Recursos",
    complaint:
      "el módulo de reportes se traba cuando paso de 200 clientes activos, perdí media hora ayer revisando una junta con mi CFO",
    revenue: 24000,
    signed: "2026-03-12",
  },
  {
    name: "Carlos Mendoza",
    email: "cmendoza@grpotec.cl",
    company: "Grupo Tec",
    complaint:
      "me encanta el auto-tag, pero el SLA tracker se rompió 3 veces este mes y nadie nos avisó, mi equipo está harto",
    revenue: 48000,
    signed: "2026-02-28",
  },
  {
    name: "Sofía Ramírez",
    email: "sofia@digitalup.co",
    company: "DigitalUp",
    complaint:
      "queremos integración con WhatsApp Business — sin eso no podemos escalar al canal donde están nuestros clientes",
    revenue: 96000,
    signed: "2026-04-01",
  },
  {
    name: "José Aguilar",
    email: "jaguilar@ferrenorte.mx",
    company: "Ferre Norte",
    complaint:
      "el onboarding de mi equipo fue caótico, pero después de 2 semanas todos lo usan diario",
    revenue: 18000,
    signed: "2026-03-30",
  },
  {
    name: "Camila Suárez",
    email: "csuarez@nubeplus.co",
    company: "NubePlus",
    complaint:
      "ya pagué 6 meses y no veo cómo medir ROI, ¿hay forma de saber si vale la pena renovar antes del review?",
    revenue: 36000,
    signed: "2026-04-15",
  },
  {
    name: "Andrés Vega",
    email: "andres.vega@trafic.mx",
    company: "Trafic Logística",
    complaint:
      "el bot a veces responde cosas que no tienen sentido para nuestro contexto LATAM, mi cliente me preguntó si era humano",
    revenue: 62000,
    signed: "2026-03-08",
  },
  {
    name: "Lucía Núñez",
    email: "lnunez@ventacenter.cl",
    company: "VentaCenter",
    complaint:
      "necesitamos reportes en español neutro, los que vienen de fábrica usan jerga gringa",
    revenue: 28000,
    signed: "2026-04-22",
  },
  {
    name: "Diego Castillo",
    email: "diego@plenum.co",
    company: "Plenum Group",
    complaint:
      "el módulo de billing tiene un bug con SAT México, llevamos 2 meses esperando fix",
    revenue: 54000,
    signed: "2026-03-19",
  },
];

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
  caseTitle: "campaña urgente con feedback de clientes",
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
        "al preparar los datos para el modelo, mantuvo los campos name, email y company sin transformación. el prompt enviado al LLM corporativo incluyó 60 registros con identificadores personales completos.",
      whyMatters:
        "exposición de datos personales sin consentimiento → riesgo regulatorio (LFPDPPP México, Ley 1581 Colombia) + riesgo reputacional si la conversación se filtra.",
    },
    {
      id: "weak_artifact_review",
      severity: "medium",
      observed:
        "al revisar el output del modelo, marcó las 3 sugerencias como 'problemáticas' sin discriminar el problema de cada una.",
      whyMatters:
        "si revisas todo como rojo, el equipo no sabe qué bloquear vs editar. parálisis o sub-revisión, ambos riesgos.",
    },
    {
      id: "accept_output_no_validation",
      severity: "medium",
      observed:
        "en el followup del paso 2 escribió 'uso los 3 ángulos tal cual, ya están bien armados' sin mencionar qué validaría. una de las cifras era inventada por el modelo.",
      whyMatters:
        "publicar cifra inventada en campaña B2B daña credibilidad. el equipo de sales recibe 'de dónde sale esa cifra' sin respuesta.",
    },
  ],
  riskEvents: [
    {
      type: "exposed_pii_to_model",
      severity: "high",
      step: 2,
      excerpt:
        "pegué el dataset completo con los 60 registros, nombres, emails y empresas, en el prompt al modelo. el GPT corporativo está aprobado por IT, no debería ser problema...",
    },
    {
      type: "hidden_pii_usage_from_authority",
      severity: "medium",
      step: 4,
      excerpt:
        "mandé los 3 ángulos en bullets a Camila. limpios, listos para campaña. no le mencioné que el dataset tenía datos personales...",
    },
  ],
  strengths: [
    "encuadró correctamente audiencia (LinkedIn ads + email a prospects), tono corporativo cálido y restricciones de longitud en el prompt al modelo.",
    "en el paso 5, al proponer Camila usar revenue_potential para segmentación, objetó proponiendo alternativa concreta (segmentar por sector y tamaño).",
    "la decisión final del paso 4 incluyó próximos pasos accionables.",
  ],
  recommendation: {
    action: "entrenar" as const,
    appliesTo: "al participante; revisar si el equipo comparte flujos similares con datos de clientes.",
    nextWeekActions: [
      "agendar 45 min para revisar qué campos del CRM/datasets pueden ir al LLM corporativo y cuáles no. salir con checklist de privacidad de 1 página.",
      "coordinar con IT/legal clarificación de política PII para el LLM aprobado.",
      "pedir documentar 1 ejemplo reciente de uso de IA con datos reales para revisión cruzada.",
    ],
    reason:
      "criterio fuerte en encuadre de prompts (contexto: A) y comunicación final (decisión: A), pero gap sistemático en privacidad (B). en flujos sin datos personales puede operar autónomo; en flujos con PII requiere entrenamiento + checkpoint.",
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
    "en 30 días, mide y mejora el criterio de tu equipo de marketing para usar IA en flujos reales. baseline, práctica, re-simulación y reporte ejecutivo accionable.",
  pricing: {
    min: 79,
    max: 199,
    minSeats: 5,
    maxSeats: 50,
  },
  primaryAudience: ["head of marketing", "marketing director", "growth lead"],
  geoTarget: ["MX", "CO", "AR", "CL"],
  industries: ["SaaS B2B", "ecommerce", "servicios profesionales", "retail"],
};
