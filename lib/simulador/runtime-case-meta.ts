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
    levelLabel: "AI as copilot",
    levelDescription:
      "Individual use of the model to write, analyze, or decide under direct human supervision.",
  },
  2: {
    levelShortLabel: "N2",
    levelLabel: "AI in the workflow",
    levelDescription:
      "Using AI inside a work process with data, handoffs, and operating constraints.",
  },
  3: {
    levelShortLabel: "N3",
    levelLabel: "AI with agents",
    levelDescription:
      "Partial delegation to agents or automations that can act on tools and workflows.",
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

// Espejo de SPRINT_CASES[].title (config.ts) — mantener ambos en sync.
const CASE_TITLE_FALLBACKS: Record<string, string> = {
  marketing_urgent_campaign_pii: "Urgent campaign with customer feedback",
  marketing_copy_with_brand_voice: "Writing copy in the brand voice",
  marketing_segment_with_sensitive_data: "Segmenting on sensitive CRM data",
  marketing_brief_to_agency_via_ia: "Briefing an outside agency with AI",
  marketing_ad_creative_with_competitor_research:
    "Competitive research + ad creative",
  marketing_attribution_reporting_to_cmo: "Attribution reporting to the CMO",
  marketing_content_calendar_under_pressure: "30-day content calendar",
  marketing_crisis_response_with_ia: "Public crisis response with AI",
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
