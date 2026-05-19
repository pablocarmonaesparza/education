#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const ROOT = process.cwd();
const DEFAULT_SET = path.join(
  ROOT,
  "tests/simulador/judge/calibration_set.yaml",
);
const DIMENSIONS = ["contexto", "privacidad", "validacion", "juicio", "decision"];
const BANDS = new Set(["A", "M", "B"]);
const SEVERITIES = new Set(["low", "medium", "high"]);
const RECOMMENDATIONS = new Set(["pilotar", "entrenar", "pausar", "escalar"]);
const RISK_TYPES = new Set([
  "exposed_pii_to_model",
  "hidden_pii_usage_from_authority",
  "accepted_unverified_claim",
  "accepted_hallucinated_figures",
  "used_sensitive_commercial_data",
  "shared_third_party_confidential",
  "used_unapproved_vendor",
  "prompt_injection_unawareness",
  "over_relied_on_output",
  "overblocked_without_discrimination",
  "ignored_escalation_path",
]);

function parseArgs(argv) {
  const args = { setPath: DEFAULT_SET, actualPath: null };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--set") args.setPath = path.resolve(argv[++i]);
    else if (arg === "--actual") args.actualPath = path.resolve(argv[++i]);
    else if (arg === "--help") {
      console.log(
        [
          "Usage:",
          "  node scripts/simulador/check-judge-calibration.mjs",
          "  node scripts/simulador/check-judge-calibration.mjs --actual actual.yaml",
          "",
          "actual.yaml shape:",
          "  cases:",
          "    - id: pii_exposed_directly",
          "      dimensions: [{ id: privacidad, band: B }]",
          "      risk_events: [{ type: exposed_pii_to_model, severity: high }]",
        ].join("\n"),
      );
      process.exit(0);
    }
  }
  return args;
}

function fail(issues) {
  for (const issue of issues) console.error(`judge calibration error: ${issue}`);
  process.exit(1);
}

function readYaml(filePath) {
  if (!fs.existsSync(filePath)) {
    fail([`missing file: ${path.relative(ROOT, filePath)}`]);
  }
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function validateSet(doc) {
  const issues = [];
  if (!doc || typeof doc !== "object") issues.push("root must be an object");
  const cases = Array.isArray(doc?.cases) ? doc.cases : [];
  if (cases.length !== 10) issues.push(`expected exactly 10 cases, got ${cases.length}`);
  if (doc?.rubric_ref !== "rubric_marketing_v1@1.0.0") {
    issues.push("rubric_ref must be rubric_marketing_v1@1.0.0");
  }
  if (doc?.pass_thresholds?.min_band_match_pct !== 0.8) {
    issues.push("pass_thresholds.min_band_match_pct must be 0.8");
  }
  if (doc?.pass_thresholds?.max_high_risk_misses !== 0) {
    issues.push("pass_thresholds.max_high_risk_misses must be 0");
  }

  const ids = new Set();
  let highRiskFixtures = 0;
  for (const [index, item] of cases.entries()) {
    const prefix = `cases[${index}]`;
    if (!item?.id || typeof item.id !== "string") issues.push(`${prefix}.id required`);
    if (ids.has(item?.id)) issues.push(`duplicate case id: ${item.id}`);
    if (item?.id) ids.add(item.id);

    const bands = item?.expected?.dimension_bands ?? {};
    for (const dim of DIMENSIONS) {
      if (!BANDS.has(bands[dim])) {
        issues.push(`${item?.id ?? prefix}.expected.dimension_bands.${dim} must be A|M|B`);
      }
    }
    if (!RECOMMENDATIONS.has(item?.expected?.recommendation)) {
      issues.push(`${item?.id ?? prefix}.expected.recommendation invalid`);
    }

    const risks = item?.expected?.risk_events;
    if (!Array.isArray(risks)) {
      issues.push(`${item?.id ?? prefix}.expected.risk_events must be array`);
    } else {
      for (const [riskIndex, risk] of risks.entries()) {
        const riskPrefix = `${item?.id ?? prefix}.expected.risk_events[${riskIndex}]`;
        if (!RISK_TYPES.has(risk?.type)) issues.push(`${riskPrefix}.type invalid`);
        if (!SEVERITIES.has(risk?.severity)) issues.push(`${riskPrefix}.severity invalid`);
        if (!Number.isInteger(risk?.step_ordinal) || risk.step_ordinal < 1) {
          issues.push(`${riskPrefix}.step_ordinal must be positive integer`);
        }
        if (risk?.severity === "high") highRiskFixtures += 1;
      }
    }

    const responses = item?.responses;
    for (const key of [
      "data_scope",
      "llm_beat",
      "artifact_review",
      "decision_select",
      "decision_open_short",
    ]) {
      if (responses?.[key] === undefined) issues.push(`${item?.id ?? prefix}.responses.${key} required`);
    }
  }

  if (highRiskFixtures < 4) {
    issues.push(`expected at least 4 high-risk fixtures, got ${highRiskFixtures}`);
  }

  return issues;
}

function normalizeActual(doc) {
  const cases = Array.isArray(doc?.cases) ? doc.cases : [];
  return new Map(cases.map((item) => [item.id, item]));
}

function compareActual(expectedDoc, actualDoc) {
  const issues = [];
  const actualById = normalizeActual(actualDoc);
  const cases = expectedDoc.cases ?? [];
  let bandMatches = 0;
  let bandTotal = 0;
  let highRiskMisses = 0;

  for (const item of cases) {
    const actual = actualById.get(item.id);
    if (!actual) {
      issues.push(`actual missing case ${item.id}`);
      continue;
    }

    const actualBandByDim = new Map(
      (actual.dimensions ?? []).map((d) => [d.id, d.band]),
    );
    for (const dim of DIMENSIONS) {
      bandTotal += 1;
      if (actualBandByDim.get(dim) === item.expected.dimension_bands[dim]) {
        bandMatches += 1;
      }
    }

    const actualHighTypes = new Set(
      (actual.risk_events ?? [])
        .filter((risk) => risk.severity === "high")
        .map((risk) => risk.type),
    );
    for (const risk of item.expected.risk_events ?? []) {
      if (risk.severity !== "high") continue;
      if (!actualHighTypes.has(risk.type)) {
        highRiskMisses += 1;
        issues.push(`actual missed high risk ${risk.type} in ${item.id}`);
      }
    }
  }

  const matchPct = bandTotal === 0 ? 0 : bandMatches / bandTotal;
  const minMatch = expectedDoc.pass_thresholds.min_band_match_pct;
  const maxMisses = expectedDoc.pass_thresholds.max_high_risk_misses;

  console.log(
    `judge calibration actual: band_match=${bandMatches}/${bandTotal} (${Math.round(
      matchPct * 100,
    )}%), high_risk_misses=${highRiskMisses}`,
  );

  if (matchPct < minMatch) {
    issues.push(`band match ${matchPct.toFixed(2)} below threshold ${minMatch}`);
  }
  if (highRiskMisses > maxMisses) {
    issues.push(`high risk misses ${highRiskMisses} above threshold ${maxMisses}`);
  }
  return issues;
}

const args = parseArgs(process.argv);
const setDoc = readYaml(args.setPath);
const setIssues = validateSet(setDoc);
if (setIssues.length) fail(setIssues);

console.log(
  `judge calibration set OK (${setDoc.cases.length} cases, ${setDoc.rubric_ref})`,
);

if (args.actualPath) {
  const actualDoc = readYaml(args.actualPath);
  const compareIssues = compareActual(setDoc, actualDoc);
  if (compareIssues.length) fail(compareIssues);
  console.log("judge calibration actual OK");
}
