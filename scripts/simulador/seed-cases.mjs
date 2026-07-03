#!/usr/bin/env node

import path from "node:path";
import {
  CONTRACT_DIR,
  createServiceClient,
  deleteWhere,
  difficultyToLevel,
  insertMany,
  jsonObject,
  mustSingle,
  readYamlFile,
  readYamlFiles,
  runSeedGate,
  templateRefToSlugVersion,
  toStepKey,
  upsertSingle,
} from "./seed-utils.mjs";

const APPLY = process.argv.includes("--apply");

function stripStep(step) {
  const {
    id,
    type,
    prompt,
    evaluates,
    evaluates_prompt: evaluatesPrompt,
    ...rest
  } = step;
  void id;
  void type;
  void prompt;
  void evaluates;
  void evaluatesPrompt;
  return jsonObject(rest);
}

async function rubricId(db, slug, version) {
  const row = await mustSingle(
    db
      .from("rubrics")
      .select("id")
      .eq("slug", slug)
      .eq("version", String(version ?? "1.0.0"))
      .single(),
    `rubric:${slug}@${version}`,
  );
  return row.id;
}

async function practiceBeatId(db, slug) {
  const row = await mustSingle(
    db.from("practice_beats").select("id").eq("slug", slug).single(),
    `practice_beat:${slug}`,
  );
  return row.id;
}

async function gapDefinitionId(db, caseTemplateIdValue, gapKey) {
  const row = await mustSingle(
    db
      .from("gap_definitions")
      .select("id")
      .eq("case_template_id", caseTemplateIdValue)
      .eq("gap_key", gapKey)
      .single(),
    `gap_definition:${gapKey}`,
  );
  return row.id;
}

function caseTemplateRow(template, resolvedRubricId) {
  const levelPrimary =
    template.level_primary ?? difficultyToLevel(template.difficulty);

  return {
    slug: template.id,
    version: Number(template.version),
    status: template.status ?? "draft",
    difficulty: template.difficulty,
    locale: template.locale ?? "es-MX",
    title: template.title ?? template.id,
    target_roles: template.target_role ?? [],
    duration_estimate_min: template.duration_estimate_min ?? null,
    rubric_id: resolvedRubricId,
    freshness_json: jsonObject(template.freshness),
    expected_manager_action_json: jsonObject(template.expected_manager_action),
    required_template_vars: template.required_template_vars ?? [],
    context_template_json: jsonObject(template.context_template),
    data_policy_json: jsonObject(template.data_policy),
    telemetry_required: template.telemetry_required ?? [],
    evaluation_meta_json: jsonObject(template.evaluation_meta),
    level_primary: levelPrimary,
    level_advanced_variant: template.level_advanced_variant ?? null,
    career_key: template.career_key ?? "marketing",
    archetype_ref: template.archetype_ref ?? null,
  };
}

function caseStepRows(template, caseTemplateIdValue) {
  return template.steps.map((step, index) => ({
    case_template_id: caseTemplateIdValue,
    step_key: step.step_key ?? step.type ?? toStepKey(step.id),
    ordinal: index + 1,
    step_type: step.type,
    prompt_template: typeof step.prompt === "string" ? step.prompt : null,
    config_json: stripStep(step),
    evaluates_dimensions: [
      ...(step.evaluates ?? []),
      ...(step.evaluates_prompt ?? []),
      ...(step.followup?.evaluates ?? []),
    ],
  }));
}

function caseInputRows(template, caseTemplateIdValue) {
  return (template.inputs_spec ?? []).map((input) => ({
    case_template_id: caseTemplateIdValue,
    kind: String(input.kind ?? ""),
    name: String(input.name ?? ""),
    schema_json: { schema: input.schema ?? null },
    content_template_ref: input.content_template_ref ?? null,
    sample_rows_ref: input.sample_rows_ref ?? null,
    config_json: jsonObject(input),
  }));
}

function gapRows(template, caseTemplateIdValue) {
  return Object.entries(template.gap_definitions ?? {}).map(([gapKey, gap]) => ({
    case_template_id: caseTemplateIdValue,
    gap_key: gapKey,
    dimension_key: gap.dimension,
    severity: gap.severity,
    triggered_by_json: gap.triggered_by ?? [],
  }));
}

function variantRow(variant, template, caseTemplateIdValue, parentVariantId) {
  const role = variant.variant_role;
  const fallbackLevel =
    role === "resimulation" && template.level_advanced_variant
      ? template.level_advanced_variant
      : template.level_primary ?? difficultyToLevel(template.difficulty);

  return {
    slug: variant.id,
    case_template_id: caseTemplateIdValue,
    parent_variant_id: parentVariantId,
    variant_role: role,
    status: variant.status ?? "draft",
    delay_days_from_parent: variant.delay_days_from_parent ?? null,
    template_var_values_json: jsonObject(variant.template_var_values),
    inputs_resolved_json: jsonObject(variant.inputs_resolved),
    expected_behavior_shift: variant.expected_behavior_shift ?? null,
    synthetic_data: variant.inputs_resolved?.synthetic === true,
    level: variant.level ?? fallbackLevel,
    career_key: variant.career_key ?? template.career_key ?? "marketing",
    transfer_pair_key:
      role === "resimulation"
        ? variant.parent_variant_ref ?? variant.id.replace(/_resim_v1$/u, "_v1")
        : variant.rendering_meta?.pairs_with_resim ?? null,
  };
}

function sprintPackageRow(sprint) {
  const price = sprint.commercial?.pricing_band_usd?.min_per_seat ?? null;

  return {
    slug: sprint.id,
    version: Number(sprint.version),
    name: sprint.marketing_meta?.public_name ?? sprint.id,
    target_buyer: "team_manager",
    target_roles: sprint.marketing_meta?.primary_audience ?? [],
    duration_days: sprint.duration_days,
    included_cases: sprint.contents.cases_included.length,
    included_seats: sprint.commercial?.pricing_band_usd?.team_minimum_seats ?? null,
    price_usd: price,
    pricing_json: jsonObject(sprint.commercial),
    status: sprint.status ?? "draft",
    config_json: jsonObject(sprint),
  };
}

async function seedTemplates(db, cases) {
  const ids = new Map();

  for (const template of cases) {
    const resolvedRubricId = await rubricId(
      db,
      template.rubric_ref,
      template.rubric_version_used ?? "1.0.0",
    );
    const row = caseTemplateRow(template, resolvedRubricId);
    const seeded = await upsertSingle(
      db,
      "case_templates",
      row,
      "slug,version",
      `case_templates:${template.id}`,
    );
    ids.set(`${template.id}@v${template.version}`, seeded.id);

    const cleanup = await db
      .from("case_steps")
      .delete()
      .eq("case_template_id", seeded.id)
      .like("step_key", "step_%");
    if (cleanup.error) {
      throw new Error(
        `case_steps:${template.id}:cleanup_numeric_keys: ${cleanup.error.message}`,
      );
    }

    for (const step of caseStepRows(template, seeded.id)) {
      await upsertSingle(
        db,
        "case_steps",
        step,
        "case_template_id,step_key",
        `case_steps:${template.id}:${step.step_key}`,
      );
    }

    await deleteWhere(
      db,
      "case_inputs_spec",
      "case_template_id",
      seeded.id,
      `case_inputs_spec:${template.id}`,
    );
    await insertMany(
      db,
      "case_inputs_spec",
      caseInputRows(template, seeded.id),
      `case_inputs_spec:${template.id}`,
    );

    for (const gap of gapRows(template, seeded.id)) {
      await upsertSingle(
        db,
        "gap_definitions",
        gap,
        "case_template_id,gap_key",
        `gap_definitions:${template.id}:${gap.gap_key}`,
      );
    }
  }

  return ids;
}

async function seedPracticeLinks(db, cases, templateIds) {
  let linked = 0;

  for (const template of cases) {
    const caseTemplateIdValue = templateIds.get(`${template.id}@v${template.version}`);
    const practiceMap = template.practice_beats ?? template.practice_beats_map ?? {};

    for (const [gapKey, practiceSlug] of Object.entries(practiceMap)) {
      const gapId = await gapDefinitionId(db, caseTemplateIdValue, gapKey);
      const beatId = await practiceBeatId(db, practiceSlug);
      await upsertSingle(
        db,
        "case_practice_beats",
        {
          case_template_id: caseTemplateIdValue,
          gap_definition_id: gapId,
          practice_beat_id: beatId,
        },
        "case_template_id,gap_definition_id,practice_beat_id",
        `case_practice_beats:${template.id}:${gapKey}`,
      );
      linked += 1;
    }
  }

  return linked;
}

async function seedVariants(db, casesByRef, variants, templateIds) {
  const variantsBySlug = new Map();

  for (const variant of variants) {
    const ref = templateRefToSlugVersion(variant.template_ref);
    const template = casesByRef.get(`${ref.slug}@v${ref.version}`);
    const caseTemplateIdValue = templateIds.get(`${ref.slug}@v${ref.version}`);
    const row = variantRow(variant, template, caseTemplateIdValue, null);
    const seeded = await upsertSingle(
      db,
      "case_variants",
      row,
      "slug",
      `case_variants:${variant.id}`,
    );
    variantsBySlug.set(variant.id, seeded.id);
  }

  for (const variant of variants) {
    if (!variant.parent_variant_ref) continue;
    const ref = templateRefToSlugVersion(variant.template_ref);
    const template = casesByRef.get(`${ref.slug}@v${ref.version}`);
    const caseTemplateIdValue = templateIds.get(`${ref.slug}@v${ref.version}`);
    const parentId = variantsBySlug.get(variant.parent_variant_ref);
    const row = variantRow(variant, template, caseTemplateIdValue, parentId);
    await upsertSingle(
      db,
      "case_variants",
      row,
      "slug",
      `case_variants:${variant.id}:parent`,
    );
  }

  return variantsBySlug;
}

async function seedSprint(db, sprint, templateIds, variantIds) {
  const sprintPackage = await upsertSingle(
    db,
    "sprint_packages",
    sprintPackageRow(sprint),
    "slug,version",
    `sprint_packages:${sprint.id}`,
  );

  for (const item of sprint.contents.cases_included) {
    const caseTemplateIdValue = templateIds.get(`${item.id}@v1`);
    await upsertSingle(
      db,
      "sprint_package_cases",
      {
        sprint_package_id: sprintPackage.id,
        case_template_id: caseTemplateIdValue,
        display_order: item.order,
        status: item.status,
        primary_variant_id: item.primary_variant_ref
          ? variantIds.get(item.primary_variant_ref)
          : null,
        resim_variant_id: item.resim_variant_ref
          ? variantIds.get(item.resim_variant_ref)
          : null,
        dimensions_emphasized: item.dimensions_emphasized ?? [],
        difficulty: item.difficulty ?? null,
        tension: item.tension ?? null,
        is_required: item.is_required ?? true,
      },
      "sprint_package_id,case_template_id",
      `sprint_package_cases:${item.id}`,
    );
  }
}

async function main() {
  const cases = readYamlFiles(path.join(CONTRACT_DIR, "casos"), "case_template").map(
    ({ value }) => value,
  );
  const variants = readYamlFiles(
    path.join(CONTRACT_DIR, "variantes"),
    "case_variant",
  ).map(({ value }) => value);
  const sprint = readYamlFile(
    path.join(CONTRACT_DIR, "sprints/sprint_marketing_30d.yaml"),
  ).sprint_package;

  if (!APPLY) {
    console.log(
      `Dry run: ${cases.length} cases, ${variants.length} variants, ${sprint.contents.cases_included.length} sprint case refs ready. Re-run with --apply to seed Supabase.`,
    );
    return;
  }

  // R-10: candado del quality bar — validar contratos antes de escribir a BD.
  runSeedGate("contratos v0", "scripts/simulador/validate-contracts.mjs");

  const db = createServiceClient();
  const casesByRef = new Map(cases.map((item) => [`${item.id}@v${item.version}`, item]));

  const templateIds = await seedTemplates(db, cases);
  const linkedPracticeBeats = await seedPracticeLinks(db, cases, templateIds);
  const variantIds = await seedVariants(db, casesByRef, variants, templateIds);
  await seedSprint(db, sprint, templateIds, variantIds);

  console.log(
    `Seeded ${cases.length} cases, ${variants.length} variants, ${linkedPracticeBeats} case-practice links, and sprint ${sprint.id}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
