import { templateRefToSlugVersion, toStepKey } from './contracts';
import type {
  CaseTemplateContract,
  CaseVariantContract,
  PracticeBeatContract,
  SprintPackageContract,
  SimulatorJson,
  SimulatorJsonObject,
} from './types';

export type CaseTemplateSeedRows = {
  caseTemplate: SimulatorJsonObject;
  caseSteps: SimulatorJsonObject[];
  caseInputsSpec: SimulatorJsonObject[];
  gapDefinitions: SimulatorJsonObject[];
  casePracticeBeats: SimulatorJsonObject[];
};

export function caseTemplateToSeedRows(template: CaseTemplateContract): CaseTemplateSeedRows {
  const caseTemplate = {
    slug: template.id,
    version: template.version,
    status: template.status,
    difficulty: template.difficulty,
    locale: template.locale,
    title: template.id,
    target_roles: template.target_role,
    duration_estimate_min: template.duration_estimate_min,
    rubric_slug: template.rubric_ref,
    freshness_json: jsonObject(template.freshness),
    expected_manager_action_json: jsonObject(template.expected_manager_action),
    required_template_vars: template.required_template_vars ?? [],
    context_template_json: jsonObject(template.context_template),
    data_policy_json: jsonObject(template.data_policy),
    telemetry_required: template.telemetry_required ?? [],
    evaluation_meta_json: jsonObject(template.evaluation_meta),
  };

  const caseSteps = template.steps.map((step, index) => ({
    case_template_slug: template.id,
    case_template_version: template.version,
    step_key: toStepKey(step.id),
    ordinal: index + 1,
    step_type: step.type,
    prompt_template: typeof step.prompt === 'string' ? step.prompt : null,
    config_json: jsonObject(stripStepRuntimeColumns(step)),
    evaluates_dimensions: [
      ...(step.evaluates ?? []),
      ...(step.evaluates_prompt ?? []),
      ...(step.followup?.evaluates ?? []),
    ],
  }));

  const caseInputsSpec = (template.inputs_spec ?? []).map((input) => ({
    case_template_slug: template.id,
    case_template_version: template.version,
    kind: String(input.kind ?? ''),
    name: String(input.name ?? ''),
    schema_json: jsonObject({ schema: input.schema ?? null }),
    content_template_ref: input.content_template_ref ?? null,
    sample_rows_ref: input.sample_rows_ref ?? null,
    config_json: jsonObject(input),
  }));

  const gapDefinitions = Object.entries(template.gap_definitions ?? {}).map(([gapKey, gap]) => ({
    case_template_slug: template.id,
    case_template_version: template.version,
    gap_key: gapKey,
    dimension_key: gap.dimension,
    severity: gap.severity,
    triggered_by_json: (gap.triggered_by ?? []) as SimulatorJson,
  }));

  const practiceMap = template.practice_beats ?? template.practice_beats_map ?? {};
  const casePracticeBeats = Object.entries(practiceMap).map(([gapKey, practiceBeatSlug]) => ({
    case_template_slug: template.id,
    case_template_version: template.version,
    gap_key: gapKey,
    practice_beat_slug: practiceBeatSlug,
  }));

  return {
    caseTemplate,
    caseSteps,
    caseInputsSpec,
    gapDefinitions,
    casePracticeBeats,
  };
}

export function caseVariantToSeedRow(variant: CaseVariantContract): SimulatorJsonObject {
  const templateRef = templateRefToSlugVersion(variant.template_ref);
  const parentRef = variant.parent_variant_ref ? templateRefToSlugVersion(variant.parent_variant_ref) : null;

  return {
    slug: variant.id,
    case_template_slug: templateRef.slug,
    case_template_version: templateRef.version,
    parent_variant_slug: variant.parent_variant_ref ?? null,
    parent_variant_template_version: parentRef?.version ?? null,
    variant_role: variant.variant_role,
    status: variant.status,
    delay_days_from_parent: variant.delay_days_from_parent ?? null,
    template_var_values_json: jsonObject(variant.template_var_values),
    inputs_resolved_json: jsonObject(variant.inputs_resolved),
    expected_behavior_shift: variant.expected_behavior_shift ?? null,
    synthetic_data: variant.inputs_resolved.synthetic === true,
  };
}

export function practiceBeatToSeedRow(practiceBeat: PracticeBeatContract): SimulatorJsonObject {
  const triggeredByGap = Array.isArray(practiceBeat.triggered_by_gap)
    ? practiceBeat.triggered_by_gap
    : [practiceBeat.triggered_by_gap];

  return {
    slug: practiceBeat.id,
    title: practiceBeat.id,
    target_gap_keys: triggeredByGap,
    duration_estimate_min: Math.ceil(practiceBeat.duration_max_seconds / 60),
    content_json: jsonObject(practiceBeat),
    status: practiceBeat.status,
  };
}

export function sprintPackageToSeedRows(sprint: SprintPackageContract): {
  sprintPackage: SimulatorJsonObject;
  sprintPackageCases: SimulatorJsonObject[];
} {
  return {
    sprintPackage: {
      slug: sprint.id,
      version: sprint.version,
      name: String(sprint.marketing_meta?.public_name ?? sprint.id),
      target_buyer: 'team_manager',
      target_roles: sprint.marketing_meta?.primary_audience ?? [],
      duration_days: sprint.duration_days,
      included_cases: sprint.contents.cases_included.length,
      included_seats: null,
      price_usd: extractMinPrice(sprint),
      pricing_json: jsonObject(sprint.commercial),
      status: sprint.status,
      config_json: jsonObject(sprint),
    },
    sprintPackageCases: sprint.contents.cases_included.map((item) => ({
      sprint_package_slug: sprint.id,
      sprint_package_version: sprint.version,
      case_template_slug: item.id,
      display_order: item.order,
      is_required: true,
      status: item.status,
      primary_variant_ref: item.primary_variant_ref ?? null,
      resim_variant_ref: item.resim_variant_ref ?? null,
      dimensions_emphasized: item.dimensions_emphasized ?? [],
      difficulty: item.difficulty ?? null,
      tension: item.tension ?? null,
    })),
  };
}

function stripStepRuntimeColumns(step: Record<string, unknown>): SimulatorJsonObject {
  const { id, type, prompt, evaluates, evaluates_prompt, ...rest } = step;
  void id;
  void type;
  void prompt;
  void evaluates;
  void evaluates_prompt;
  return jsonObject(rest);
}

function jsonObject(value: unknown): SimulatorJsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as SimulatorJsonObject;
}

function extractMinPrice(sprint: SprintPackageContract): number | null {
  const pricing = sprint.commercial?.pricing_band_usd;
  if (!pricing || typeof pricing !== 'object' || Array.isArray(pricing)) return null;
  const min = pricing.min_per_seat;
  return typeof min === 'number' ? min : null;
}
