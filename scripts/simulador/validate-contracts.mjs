#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const CONTRACT_DIR = path.join(ROOT, 'docs/simulador/contrato_v0');

const DIMENSIONS = new Set(['contexto', 'datos', 'ejecucion_ia', 'validacion', 'juicio', 'impacto']);
const STEP_TYPES = new Set(['data_scope', 'llm_beat', 'artifact_review', 'decision_select', 'decision_open_short']);
const EXERCISE_TYPES = new Set([
  'data_table_triage',
  'workflow_builder',
  'agent_brief',
  'permission_matrix',
  'log_review',
  'tradeoff_decision',
  'executive_response',
]);
const EVIDENCE_KINDS = new Set([
  'readiness_dimension_scores',
  'risk_events_detected',
  'decision_replay',
  'transfer_delta',
  'manager_recommendation',
  'time_pressure_metrics',
]);

const CASES_DIR = path.join(CONTRACT_DIR, 'casos');
const VARIANTS_DIR = path.join(CONTRACT_DIR, 'variantes');
const PRACTICE_DIR = path.join(CONTRACT_DIR, 'practice_beats');
const SPRINT_PATH = path.join(CONTRACT_DIR, 'sprints/case_factory_demo.yaml');
const RUBRIC_PATH = path.join(CONTRACT_DIR, 'rubricas/rubric_case_factory_v1.yaml');

const issues = [];

function main() {
  const cases = readYamlFiles(CASES_DIR, 'case_template');
  const variants = readYamlFiles(VARIANTS_DIR, 'case_variant');
  const practiceBeats = readYamlFiles(PRACTICE_DIR, 'practice_beat');
  const sprintDoc = readYamlFile(SPRINT_PATH);
  const sprint = sprintDoc.sprint_package ?? sprintDoc.case_package;
  const rubric = readYamlFile(RUBRIC_PATH).rubric;

  const variantsByTemplate = groupBy(variants, (variant) => variant.template_ref);
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const practiceIds = new Set(practiceBeats.map((beat) => beat.id));
  const caseIds = new Set(cases.map((item) => item.id));
  const practiceIdsMappedByCases = new Set();

  for (const item of cases) validateCase(item, variantsByTemplate, practiceIds, practiceIdsMappedByCases);
  validateSprint(sprint, caseIds, variantsById, practiceIds, practiceIdsMappedByCases);
  validateRubric(rubric);

  const includedCases = sprint.contents?.cases_included ?? sprint.cases_included ?? [];
  const readyCases = includedCases.filter((item) => item.status === 'ready');
  const plannedCases = includedCases.filter((item) => item.status === 'planned');

  if (issues.length > 0) {
    for (const item of issues) {
      console.error(`${item.level.toUpperCase()} ${item.path}: ${item.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('simulador contract OK');
  console.log(`cases: ${cases.length} (${readyCases.length} ready, ${plannedCases.length} planned)`);
  console.log(`variants: ${variants.length}`);
  console.log(`practice_beats: ${practiceBeats.length}`);
  console.log(`rubric: ${rubric.id}@${rubric.version}`);
}

function validateCase(item, variantsByTemplate, practiceIds, practiceIdsMappedByCases) {
  required(item.id, `case:${item.id}`, 'id');
  required(item.rubric_ref, `case:${item.id}`, 'rubric_ref');
  required(Array.isArray(item.steps) && item.steps.length > 0, `case:${item.id}`, 'steps');

  const templateRef = `${item.id}@v${item.version}`;
  const variants = variantsByTemplate.get(templateRef) ?? [];
  const primary = variants.filter((variant) => variant.variant_role === 'primary');
  const resim = variants.filter((variant) => variant.variant_role === 'resimulation');

  if (primary.length !== 1) addIssue('error', `case:${item.id}`, `expected 1 primary variant, found ${primary.length}`);
  if (resim.length !== 1) addIssue('error', `case:${item.id}`, `expected 1 resimulation variant, found ${resim.length}`);

  item.steps.forEach((step, index) => {
    if (!STEP_TYPES.has(step.type)) addIssue('error', `case:${item.id}.steps[${index}]`, `invalid step type ${step.type}`);
    if (step.type === 'llm_beat' && Number(step.max_turns ?? 0) > 2) {
      addIssue('error', `case:${item.id}.steps[${index}].max_turns`, 'llm_beat max_turns must be <= 2');
    }

    const dims = [
      ...(step.evaluates ?? []),
      ...(step.evaluates_prompt ?? []),
      ...(step.followup?.evaluates ?? []),
    ];
    dims.forEach((dimension) => {
      if (!DIMENSIONS.has(dimension)) addIssue('error', `case:${item.id}.steps[${index}]`, `invalid dimension ${dimension}`);
    });
    if (step.exercise_type && !EXERCISE_TYPES.has(step.exercise_type)) {
      addIssue('error', `case:${item.id}.steps[${index}]`, `invalid exercise_type ${step.exercise_type}`);
    }
  });

  (item.evidence_emitted ?? []).forEach((evidence, index) => {
    if (!EVIDENCE_KINDS.has(evidence.kind)) {
      addIssue('error', `case:${item.id}.evidence_emitted[${index}]`, `invalid evidence kind ${evidence.kind}`);
    }
  });

  const mappedPracticeIds = Object.values(item.practice_beats ?? item.practice_beats_map ?? {});
  mappedPracticeIds.forEach((id) => {
    practiceIdsMappedByCases.add(id);
    if (!practiceIds.has(id)) addIssue('error', `case:${item.id}.practice_beats`, `missing practice beat ${id}`);
  });
}

function validateSprint(sprint, caseIds, variantsById, practiceIds, practiceIdsMappedByCases) {
  const included = sprint.contents?.cases_included ?? sprint.cases_included ?? [];
  if (included.length !== 1) addIssue('error', `sprint:${sprint.id}`, `expected 1 active case, found ${included.length}`);

  included.forEach((item) => {
    if (!caseIds.has(item.id)) addIssue('error', `sprint:${sprint.id}.${item.id}`, 'case file missing');
    (item.dimensions_emphasized ?? item.criteria_emphasized ?? []).forEach((dimension) => {
      if (!DIMENSIONS.has(dimension)) addIssue('error', `sprint:${sprint.id}.${item.id}`, `invalid dimension ${dimension}`);
    });

    if (item.status === 'ready' && (!item.primary_variant_ref || !item.resim_variant_ref)) {
      addIssue('error', `sprint:${sprint.id}.${item.id}`, 'ready case missing variant refs');
    }

    if (item.status === 'ready' && !(item.dimensions_emphasized?.length || item.criteria_emphasized?.length)) {
      addIssue('error', `sprint:${sprint.id}.${item.id}`, 'ready case missing dimensions/criteria emphasized');
    }

    validateSprintVariantRef(item, variantsById, item.primary_variant_ref, 'primary');
    validateSprintVariantRef(item, variantsById, item.resim_variant_ref, 'resimulation');
  });

  const catalog = new Set(sprint.contents?.practice_beats_catalog ?? sprint.practice_beats_catalog ?? []);
  for (const id of practiceIdsMappedByCases) {
    if (!catalog.has(id)) addIssue('error', `sprint:${sprint.id}.practice_beats_catalog`, `case maps practice beat not in sprint catalog: ${id}`);
  }

  for (const id of catalog) {
    if (!practiceIds.has(id)) addIssue('error', `sprint:${sprint.id}.practice_beats_catalog`, `catalog references missing practice beat file: ${id}`);
    if (!practiceIdsMappedByCases.has(id)) addIssue('error', `sprint:${sprint.id}.practice_beats_catalog`, `catalog practice beat is not mapped by any case: ${id}`);
  }
}

function validateSprintVariantRef(sprintCase, variantsById, variantRef, expectedRole) {
  if (!variantRef) return;
  const variant = variantsById.get(variantRef);
  if (!variant) {
    addIssue('error', `sprint.${sprintCase.id}`, `variant ref missing file: ${variantRef}`);
    return;
  }
  if (variant.variant_role !== expectedRole) {
    addIssue('error', `sprint.${sprintCase.id}`, `variant ${variantRef} expected role ${expectedRole}, found ${variant.variant_role}`);
  }
  if (variant.template_ref !== `${sprintCase.id}@v1`) {
    addIssue('error', `sprint.${sprintCase.id}`, `variant ${variantRef} points to ${variant.template_ref}`);
  }
}

function validateRubric(rubric) {
  const dimensions = new Set(rubric.public.dimensions.map((dimension) => dimension.id));
  for (const dimension of DIMENSIONS) {
    if (!dimensions.has(dimension)) addIssue('error', `rubric:${rubric.id}`, `missing dimension ${dimension}`);
  }
}

function readYamlFiles(dir, key) {
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.yaml'))
    .sort()
    .map((file) => {
      const parsed = readYamlFile(path.join(dir, file));
      if (!parsed[key]) addIssue('error', file, `missing root key ${key}`);
      return parsed[key];
    })
    .filter(Boolean);
}

function readYamlFile(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function groupBy(items, getKey) {
  const map = new Map();
  for (const item of items) {
    const key = getKey(item);
    const existing = map.get(key) ?? [];
    existing.push(item);
    map.set(key, existing);
  }
  return map;
}

function required(value, scope, field) {
  if (!value) addIssue('error', `${scope}.${field}`, 'required field missing');
}

function addIssue(level, pathName, message) {
  issues.push({ level, path: pathName, message });
}

main();
