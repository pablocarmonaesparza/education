#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const CONTRACT_DIR = path.join(ROOT, "docs/simulador/contrato_v0");
const CASES_DIR = path.join(CONTRACT_DIR, "casos");
const VARIANTS_DIR = path.join(CONTRACT_DIR, "variantes");
const DIMENSIONS = new Set(["contexto", "datos", "ejecucion_ia", "validacion", "juicio", "impacto"]);
const EXERCISE_TYPES = new Set([
  "data_table_triage",
  "workflow_builder",
  "agent_brief",
  "permission_matrix",
  "log_review",
  "tradeoff_decision",
  "executive_response",
]);

const issues = [];
const targetFiles = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));

function main() {
  const caseFiles = targetFiles.length > 0
    ? targetFiles
    : fs.readdirSync(CASES_DIR).filter((file) => file.endsWith(".yaml")).map((file) => path.join(CASES_DIR, file));

  const variants = readYamlFiles(VARIANTS_DIR, "case_variant");
  const variantsByTemplate = groupBy(variants, (variant) => variant.template_ref);

  for (const file of caseFiles) validateCaseFile(path.resolve(file), variantsByTemplate);

  if (issues.length > 0) {
    for (const issue of issues) console.error(`CASE_YAML ${issue.level.toUpperCase()} ${issue.path}: ${issue.message}`);
    process.exit(1);
  }

  console.log(`case yaml quality OK (${caseFiles.length} files)`);
}

function validateCaseFile(filePath, variantsByTemplate) {
  const parsed = yaml.load(fs.readFileSync(filePath, "utf8"));
  const item = parsed?.case_template;
  const rel = path.relative(ROOT, filePath);
  if (!item) return addIssue("error", rel, "missing case_template root");

  const scope = `case:${item.id ?? rel}`;
  const templateRef = `${item.id}@v${item.version}`;
  const variants = variantsByTemplate.get(templateRef) ?? [];
  const primary = variants.filter((variant) => variant.variant_role === "primary");
  const resim = variants.filter((variant) => variant.variant_role === "resimulation");

  check(Boolean(item.steps?.length), scope, "case needs steps");
  check(Boolean(item.context_template?.scenario || item.context_template?.role_play), scope, "case needs decision-maker context");
  check(Boolean(item.context_template?.pressure?.length), scope, "case needs explicit pressure/tension");
  check(Boolean(item.inputs_spec?.length), scope, "case needs data/artifact inputs");
  check(Boolean(item.case_factory_meta?.level), scope, "case needs case_factory_meta.level");
  check(Boolean(item.case_factory_meta?.freshness?.refresh_due_at), scope, "case needs freshness.refresh_due_at");
  check(Boolean(item.case_factory_meta?.manager_outcome?.primary_question), scope, "case needs manager outcome");
  check(Boolean(item.output_spec?.type), scope, "case needs output_spec.type");
  check((item.failure_modes ?? []).length >= 2, scope, "case needs at least 2 failure modes");
  check(primary.length >= 1, scope, "case needs at least one primary variant");
  check(resim.length >= 1, scope, "case needs at least one resimulation variant");
  check(Object.keys(item.gap_definitions ?? {}).length >= 2, scope, "case needs at least 2 gap/risk mappings");
  check(Object.keys(item.practice_beats_map ?? item.practice_beats ?? {}).length >= 1, scope, "case needs mapped practice beats");

  const expectedActions = item.steps?.filter((step) => step.expected_action).length ?? 0;
  const observableDecisions = item.steps?.filter((step) => step.type?.startsWith("decision_") || step.type === "data_scope").length ?? 0;
  const lastStep = item.steps?.[item.steps.length - 1];
  check(expectedActions >= 1, scope, "case needs at least one non-trivial expected_action");
  check(observableDecisions >= 2, scope, "case needs observable decisions, not only reading");
  check(Boolean(lastStep?.type?.startsWith("decision_")), scope, "last step should be a decision step");

  const criteriaWeights = item.evaluation_meta?.criteria_weights ?? {};
  const criteriaWeightTotal = Object.values(criteriaWeights).reduce((sum, value) => sum + Number(value), 0);
  check(criteriaWeightTotal === 100, scope, `criteria weights must sum 100, got ${criteriaWeightTotal}`);

  for (const [dimension, weight] of Object.entries(criteriaWeights)) {
    check(DIMENSIONS.has(dimension), scope, `invalid criteria weight dimension ${dimension}`);
    check(Number(weight) > 0, scope, `criteria weight must be positive for ${dimension}`);
  }

  for (const [index, step] of (item.steps ?? []).entries()) {
    check(Boolean(step.exercise_type), `${scope}.steps[${index}]`, "step needs exercise_type");
    check(EXERCISE_TYPES.has(step.exercise_type), `${scope}.steps[${index}]`, `invalid exercise_type ${step.exercise_type}`);
    const dims = [
      ...(step.evaluates ?? []),
      ...(step.evaluates_prompt ?? []),
      ...(step.followup?.evaluates ?? []),
    ];
    for (const dimension of dims) {
      check(DIMENSIONS.has(dimension), `${scope}.steps[${index}]`, `invalid dimension ${dimension}`);
    }
  }

  const participantLeakText = [
    item.context_template?.role_play,
    item.context_template?.scenario,
    ...(item.steps ?? []).map((step) => [
      step.prompt,
      step.task_to_user,
      step.followup?.prompt,
      ...(step.options ?? []).map((option) => option.label).join(" "),
    ].join(" ")),
  ].join(" ").toLowerCase();

  const leakTerms = [
    "evaluates",
    "rubric",
    "risk_event",
    "gap_trigger",
    "dimension_key",
    "triggered_by",
    "deterministic_override",
  ];
  for (const term of leakTerms) {
    if (participantLeakText.includes(term)) {
      addIssue("error", scope, `participant-facing text leaks rubric/spoiler term: ${term}`);
    }
  }

  for (const variant of primary.concat(resim)) {
    check(variant.inputs_resolved?.synthetic === true, `variant:${variant.id}`, "variant must declare synthetic: true");
    check(Boolean(variant.inputs_resolved?.items?.length), `variant:${variant.id}`, "variant needs resolved inputs");
  }
}

function readYamlFiles(dir, key) {
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".yaml"))
    .map((file) => yaml.load(fs.readFileSync(path.join(dir, file), "utf8"))?.[key])
    .filter(Boolean);
}

function groupBy(items, getKey) {
  const map = new Map();
  for (const item of items) {
    const key = getKey(item);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

function check(condition, scope, message) {
  if (!condition) addIssue("error", scope, message);
}

function addIssue(level, pathName, message) {
  issues.push({ level, path: pathName, message });
}

main();
