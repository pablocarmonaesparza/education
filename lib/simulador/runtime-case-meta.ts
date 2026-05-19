export type RuntimeLevel = 1 | 2 | 3;

export type RuntimeCaseMeta = {
  title: string;
  slug: string;
  version: number;
  difficulty: string | null;
  durationEstimateMin: number | null;
  level: RuntimeLevel;
  levelShortLabel: string;
  levelLabel: string;
  levelDescription: string;
  careerKey: string;
  careerLabel: string;
  variantSlug: string | null;
  variantRole: string | null;
};

type CaseTemplateLike = {
  slug?: string | null;
  version?: number | null;
  title?: string | null;
  difficulty?: string | null;
  duration_estimate_min?: number | null;
  level_primary?: number | null;
  career_key?: string | null;
};

type CaseVariantLike = {
  slug?: string | null;
  variant_role?: string | null;
  level?: number | null;
  career_key?: string | null;
};

const LEVEL_META: Record<RuntimeLevel, Omit<
  RuntimeCaseMeta,
  | "title"
  | "slug"
  | "version"
  | "difficulty"
  | "durationEstimateMin"
  | "level"
  | "careerKey"
  | "careerLabel"
  | "variantSlug"
  | "variantRole"
>> = {
  1: {
    levelShortLabel: "N1",
    levelLabel: "IA como copiloto",
    levelDescription:
      "Uso individual del modelo para redactar, analizar o decidir bajo supervisión humana directa.",
  },
  2: {
    levelShortLabel: "N2",
    levelLabel: "IA en workflow",
    levelDescription:
      "Uso de IA dentro de un proceso de trabajo con datos, handoffs y restricciones operativas.",
  },
  3: {
    levelShortLabel: "N3",
    levelLabel: "IA con agentes",
    levelDescription:
      "Delegación parcial a agentes o automatizaciones que pueden actuar sobre herramientas y flujos.",
  },
};

const CAREER_LABELS: Record<string, string> = {
  marketing: "Marketing/Growth",
  growth: "Growth",
  sales: "Sales",
  cs: "Customer Success",
  ops: "Operations",
  finance: "Finance",
  legal: "Legal",
  hr: "People",
  product: "Product",
  engineering: "Engineering",
};

const CASE_TITLE_FALLBACKS: Record<string, string> = {
  marketing_urgent_campaign_pii: "Campaña urgente con feedback de clientes",
  marketing_copy_with_brand_voice: "Redacción de copy con voz de marca",
  marketing_segment_with_sensitive_data:
    "Segmentación con datos sensibles del CRM",
  marketing_brief_to_agency_via_ia: "Brief a agencia externa con IA",
  marketing_ad_creative_with_competitor_research:
    "Research competitivo + ad creative",
  marketing_attribution_reporting_to_cmo: "Attribution reporting al CMO",
  marketing_content_calendar_under_pressure: "Calendario de contenido 30 días",
  marketing_crisis_response_with_ia: "Respuesta a crisis pública con IA",
};

function normalizeLevel(value: number | null | undefined): RuntimeLevel | null {
  if (value === 1 || value === 2 || value === 3) return value;
  return null;
}

function normalizeTitle(title: string | null | undefined, slug: string): string {
  const trimmed = title?.trim();
  if (trimmed && trimmed !== slug && !trimmed.includes("_")) return trimmed;
  return CASE_TITLE_FALLBACKS[slug] ?? humanizeSlug(slug);
}

function humanizeSlug(slug: string): string {
  return slug
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function buildRuntimeCaseMeta(input: {
  caseTemplate: CaseTemplateLike;
  caseVariant?: CaseVariantLike | null;
}): RuntimeCaseMeta {
  const { caseTemplate, caseVariant } = input;
  const level =
    normalizeLevel(caseVariant?.level) ??
    normalizeLevel(caseTemplate.level_primary) ??
    1;
  const careerKey = (
    caseVariant?.career_key ??
    caseTemplate.career_key ??
    "unknown"
  ).trim();
  const levelMeta = LEVEL_META[level];
  const slug = caseTemplate.slug ?? "unknown_case";

  return {
    title: normalizeTitle(caseTemplate.title, slug),
    slug,
    version: caseTemplate.version ?? 1,
    difficulty: caseTemplate.difficulty ?? null,
    durationEstimateMin: caseTemplate.duration_estimate_min ?? null,
    level,
    levelShortLabel: levelMeta.levelShortLabel,
    levelLabel: levelMeta.levelLabel,
    levelDescription: levelMeta.levelDescription,
    careerKey,
    careerLabel: CAREER_LABELS[careerKey] ?? careerKey,
    variantSlug: caseVariant?.slug ?? null,
    variantRole: caseVariant?.variant_role ?? null,
  };
}
