#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const FACTORY_DIR = path.join(ROOT, "docs/simulador/case_factory");

const requiredFiles = [
  "README.md",
  "RESEARCH_BASIS.md",
  "CASE_HIG.md",
  "CASE_TAXONOMY.yaml",
  "CASE_SCHEMA.yaml",
  "CASE_CREATION_SKILL.md",
  "EXERCISE_BLOCK_CATALOG.yaml",
  "CASE_RUBRIC_V1.md",
  "CASE_QUALITY_CHECKLIST.md",
  "TOOL_REGISTRY.yaml",
  "ROLE_INDUSTRY_TAGS.yaml",
  "MANAGER_RESULTS_MODEL.md",
  "BACKEND_REQUIREMENTS.md",
  "FACTORY_WORKFLOW.md",
];

const issues = [];

for (const file of requiredFiles) {
  const fullPath = path.join(FACTORY_DIR, file);
  if (!fs.existsSync(fullPath)) {
    issues.push(`missing ${file}`);
  }
}

const taxonomy = readYaml("CASE_TAXONOMY.yaml")?.case_taxonomy;
if (taxonomy) {
  check(taxonomy.levels?.length === 3, "taxonomy must define exactly 3 levels");
  check(taxonomy.criteria?.length === 6, "taxonomy must define exactly 6 criteria");
  check(taxonomy.departments?.length >= 8, "taxonomy needs at least 8 departments");
  check(taxonomy.active_profile_packs?.length === 6, "taxonomy must define exactly 6 active profile packs");
  check(
    taxonomy.active_profile_packs?.some((profile) => profile.id === "legal_compliance_privacy"),
    "taxonomy active profile packs must include legal_compliance_privacy",
  );
  check(taxonomy.industries?.length >= 8, "taxonomy needs at least 8 industries");
}

const toolRegistry = readYaml("TOOL_REGISTRY.yaml")?.tool_registry;
if (toolRegistry) {
  check(toolRegistry.tools?.length >= 20, "tool registry needs at least 20 tools");
  for (const tool of toolRegistry.tools ?? []) {
    check(Boolean(tool.id), "tool missing id");
    check(Boolean(tool.category), `tool ${tool.id} missing category`);
    check(Boolean(tool.default_refresh_days), `tool ${tool.id} missing refresh policy`);
  }
}

const schema = readYaml("CASE_SCHEMA.yaml")?.case_template_schema;
if (schema) {
  const example = schema.example;
  check(Boolean(example), "case schema needs example");
  const weights = example?.evaluation?.criteria_weights ?? {};
  const total = Object.values(weights).reduce((sum, value) => sum + Number(value), 0);
  check(total === 100, `example criteria weights must sum 100, got ${total}`);
  check(Boolean(example?.freshness?.refresh_due_at), "example needs refresh_due_at");
  check(Boolean(example?.judge?.prompt_ref), "example needs judge.prompt_ref");
  check(Boolean(example?.resimulation?.required), "example needs resimulation.required");
}

const exerciseCatalog = readYaml("EXERCISE_BLOCK_CATALOG.yaml")?.exercise_block_catalog;
if (exerciseCatalog) {
  const blocks = exerciseCatalog.blocks ?? [];
  const blockIds = new Set(blocks.map((block) => block.id));
  check(exerciseCatalog.version === "0.2.0", "exercise block catalog must be v0.2.0");
  check(blocks.length >= 10, "exercise block catalog needs at least 10 blocks");
  check(blockIds.has("ai_textfield_free"), "exercise catalog needs ai_textfield_free");
  check(blockIds.has("ai_textfield_guided"), "exercise catalog needs ai_textfield_guided");
  check(blockIds.has("tradeoff_decision_memo"), "exercise catalog needs tradeoff_decision_memo");
  for (const block of blocks) {
    check(Boolean(block.id), "exercise block missing id");
    check(Boolean(block.public_name), `exercise block ${block.id} missing public_name`);
    check(Boolean(block.ui_pattern), `exercise block ${block.id} missing ui_pattern`);
    check(Array.isArray(block.default_empty_fields), `exercise block ${block.id} missing default_empty_fields`);
    check(Boolean(block.scoring_method), `exercise block ${block.id} missing scoring_method`);
    check(Boolean(block.completion), `exercise block ${block.id} missing completion`);
  }
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`CASE_FACTORY ERROR ${issue}`);
  process.exit(1);
}

console.log("case factory OK");

function readYaml(file) {
  const fullPath = path.join(FACTORY_DIR, file);
  if (!fs.existsSync(fullPath)) return null;
  return yaml.load(fs.readFileSync(fullPath, "utf8"));
}

function check(condition, message) {
  if (!condition) issues.push(message);
}
