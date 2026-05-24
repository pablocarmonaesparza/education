#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const CASE_FACTORY_DIR = path.join(ROOT, "docs/simulador/case_factory");
const REVIEW_DIR = path.join(ROOT, "docs/simulador/case_reviews");
const CATALOG_PATH = path.join(CASE_FACTORY_DIR, "EXERCISE_BLOCK_CATALOG.yaml");
const VARIANTS_DIR = path.join(ROOT, "docs/simulador/contrato_v0/variantes");

const args = process.argv.slice(2);
const runClaude = args.includes("--claude");
const runFullContract = args.includes("--full-contract");
const caseArg = args.find((arg) => !arg.startsWith("--"));

if (!caseArg) {
  console.error("Usage: npm run simulador:review-case -- <case-yaml-path> [--claude] [--full-contract]");
  process.exit(1);
}

const casePath = path.resolve(ROOT, caseArg);
const caseDoc = readYaml(casePath);
const caseTemplate = caseDoc?.case_template;

if (!caseTemplate) {
  console.error(`CASE_REVIEW ERROR ${relative(casePath)} missing case_template root`);
  process.exit(1);
}

const catalog = readYaml(CATALOG_PATH)?.exercise_block_catalog;
const catalogBlocks = catalog?.blocks ?? [];
const catalogById = new Map(catalogBlocks.map((block) => [block.id, block]));
const variantFiles = findVariantFiles();

const legacyExerciseAliases = new Map([
  ["agent_brief", "agent_brief_builder"],
  ["log_review", "run_log_review"],
  ["tradeoff_decision", "tradeoff_decision_memo"],
  ["executive_response", "tradeoff_decision_memo"],
]);

const automaticResults = [];
const findings = [];

runCheck("case factory", ["node", "scripts/simulador/check-case-factory.mjs"]);
runCheck("case yaml", ["node", "scripts/simulador/validate-case-yaml.mjs", relative(casePath)]);
if (runFullContract) {
  runCheck("full contract", ["node", "scripts/simulador/validate-contracts.mjs"]);
}

reviewCaseStructure();

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const caseId = slug(caseTemplate.id ?? path.basename(casePath, ".yaml"));
const outputDir = path.join(REVIEW_DIR, caseId);
fs.mkdirSync(outputDir, { recursive: true });

const prompt = buildClaudePrompt();
let claudeOutput = "";
let claudeStatus = "not_run";

if (runClaude) {
  const claudePath = which("claude");
  if (!claudePath) {
    claudeStatus = "missing_cli";
    findings.push({
      severity: "P1",
      area: "claude_cli",
      message: "Claude CLI not found; review prompt generated for manual run.",
    });
  } else {
    const claude = spawnSync(
      claudePath,
      [
        "-p",
        "--effort",
        "high",
        "--tools",
        "Read,Grep,Glob",
        "--disallowedTools",
        "Edit,Write,Bash",
      ],
      {
        cwd: ROOT,
        encoding: "utf8",
        input: prompt,
        maxBuffer: 1024 * 1024 * 10,
      },
    );
    claudeStatus = claude.status === 0 ? "completed" : `failed_${claude.status ?? "unknown"}`;
    claudeOutput = [claude.stdout, claude.stderr].filter(Boolean).join("\n\n").trim();
    if (claude.status !== 0) {
      findings.push({
        severity: "P1",
        area: "claude_cli",
        message: `Claude CLI review failed with status ${claude.status ?? "unknown"}.`,
      });
    }
  }
}

const reportPath = path.join(outputDir, `${timestamp}.md`);
fs.writeFileSync(reportPath, renderReport({ prompt, claudeOutput, claudeStatus }), "utf8");

const hasP0 = findings.some((finding) => finding.severity === "P0");
const hasP1 = findings.some((finding) => finding.severity === "P1");

console.log(`case review written: ${relative(reportPath)}`);
console.log(`automatic checks: ${automaticResults.every((item) => item.status === 0) ? "PASS" : "FAIL"}`);
console.log(`local review: ${hasP0 ? "FAIL" : hasP1 ? "CONDITIONAL" : "PASS"}`);
console.log(`claude: ${claudeStatus}`);

if (hasP0 || automaticResults.some((item) => item.status !== 0)) {
  process.exitCode = 1;
}

function reviewCaseStructure() {
  const managerOutcome = caseTemplate.case_factory_meta?.manager_outcome ?? caseTemplate.manager_outcome;
  const assignmentBrief = managerOutcome?.assignment_brief ?? "";
  const assignmentWordCount = wordCount(assignmentBrief);

  if (!assignmentBrief) addFinding("P0", "manager_assignment_brief", "Missing manager assignment brief.");
  else if (assignmentWordCount < 55 || assignmentWordCount > 110) {
    addFinding(
      "P2",
      "manager_assignment_brief",
      `Assignment brief has ${assignmentWordCount} words; target is about 60-90.`,
    );
  }

  const level = caseTemplate.case_factory_meta?.level ?? caseTemplate.level;
  if (!["N1", "N2", "N3"].includes(level)) {
    addFinding("P0", "level", `Invalid or missing level: ${level ?? "missing"}.`);
  }

  const steps = caseTemplate.steps ?? [];
  if (steps.length === 0) addFinding("P0", "steps", "Case has no steps.");
  if (!variantFiles.some((file) => readYaml(file)?.case_variant?.variant_role === "primary")) {
    addFinding("P0", "variants", "Missing primary variant file.");
  }
  if (!variantFiles.some((file) => readYaml(file)?.case_variant?.variant_role === "resimulation")) {
    addFinding("P0", "variants", "Missing resimulation variant file.");
  }

  const canonicalExerciseIds = [];
  for (const [index, step] of steps.entries()) {
    const exerciseId = step.exercise_type;
    const canonical = canonicalExerciseId(exerciseId);
    canonicalExerciseIds.push(canonical);

    if (!exerciseId) {
      addFinding("P0", `steps[${index}]`, "Step missing exercise_type.");
      continue;
    }

    if (!catalogById.has(canonical)) {
      addFinding("P0", `steps[${index}]`, `Exercise type ${exerciseId} is not in EXERCISE_BLOCK_CATALOG.yaml.`);
    } else if (exerciseId !== canonical) {
      addFinding("P2", `steps[${index}]`, `Exercise type ${exerciseId} is a legacy alias; prefer ${canonical}.`);
    }

    if (!step.expected_action) {
      addFinding("P1", `steps[${index}]`, "Step missing expected_action.");
    }
  }

  const aiNativeCount = canonicalExerciseIds
    .map((id) => catalogById.get(id)?.family)
    .filter((family) => family === "ai_native").length;
  const aiNativeRatio = steps.length > 0 ? aiNativeCount / steps.length : 0;
  if (steps.length > 0 && aiNativeRatio < 0.5) {
    addFinding("P2", "exercise_mix", `AI-native exercise ratio is ${Math.round(aiNativeRatio * 100)}%; target is 60-70% when realistic.`);
  }

  const participantText = collectParticipantText(caseTemplate).toLowerCase();
  const leakTerms = [
    "evaluates",
    "rubric",
    "risk_event",
    "gap_trigger",
    "dimension_key",
    "triggered_by",
    "deterministic_override",
    "respuesta correcta",
  ];
  for (const term of leakTerms) {
    if (participantText.includes(term)) {
      addFinding("P0", "spoiler_leak", `Participant-facing text contains internal term: ${term}.`);
    }
  }

  const prefillTerms = ["default_answer", "sample_answer", "correct_answer", "preselected", "recommended_option"];
  const serialized = JSON.stringify(caseTemplate).toLowerCase();
  for (const term of prefillTerms) {
    if (serialized.includes(term)) {
      addFinding("P1", "empty_state", `Case contains possible prefilled-answer key: ${term}.`);
    }
  }
}

function buildClaudePrompt() {
  const syntheticProfiles = buildSyntheticProfiles();
  return [
    "You are Claude Case Critic for Itera. READ-ONLY. Do not edit files.",
    "",
    "Goal: review one simulator case as an adversarial product-quality reviewer.",
    "",
    "Read these files before judging:",
    "- docs/simulador/case_factory/CASE_REVIEW_PROTOCOL.md",
    "- docs/simulador/case_factory/CASE_CREATION_SKILL.md",
    "- docs/simulador/case_factory/CASE_HIG.md",
    "- docs/simulador/case_factory/CASE_TAXONOMY.yaml",
    "- docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml",
    "- docs/simulador/case_factory/CASE_RUBRIC_V1.md",
    "- docs/simulador/case_factory/MANAGER_RESULTS_MODEL.md",
    "- docs/simulador/case_factory/CASE_QUALITY_CHECKLIST.md",
    `- ${relative(casePath)}`,
    ...variantFiles.map((file) => `- ${relative(file)}`),
    "",
    "Evaluate:",
    "1. Does this measure operational judgment, not knowledge?",
    "2. Does the manager assignment brief clearly explain when to assign the case?",
    "3. Are the exercises from the canonical catalog and appropriate for the level?",
    "4. Does every step emit evidence for the six dimensions?",
    "5. Are risk events observable and supported by transcript/action evidence?",
    "6. Does it avoid spoilers, prefilled participant answers, and fake choices?",
    "7. Does primary/resim measure transfer rather than memory?",
    "8. Would these synthetic participants produce distinguishable reports?",
    "",
    "Synthetic participant set:",
    syntheticProfiles,
    "",
    "Output format:",
    "GLOBAL: PASS | FAIL | CONDITIONAL",
    "P0: blockers",
    "P1: must fix before publish",
    "P2: polish/monitor",
    "For each issue include: severity, file/section, why it matters, correction expected.",
    "Then include: Manager 30-second test, Exercise fit verdict, Research freshness verdict, Final route to fix.",
  ].join("\n");
}

function buildSyntheticProfiles() {
  const failureModes = caseTemplate.failure_modes ?? [];
  const firstFailure = failureModes[0] ?? "accepts AI output without enough validation";
  const secondFailure = failureModes[1] ?? "uses more data than needed";
  return [
    "- strong: minimizes data, uses approved exercise flow, validates output, catches high-risk actions, and writes a manager-ready decision with owner, metric, and next step.",
    `- average: completes the flow but misses one medium issue such as: ${secondFailure}.`,
    `- risky: optimizes speed or autonomy and triggers a high-risk failure such as: ${firstFailure}.`,
  ].join("\n");
}

function renderReport({ prompt, claudeOutput, claudeStatus }) {
  return [
    `# Case review — ${caseTemplate.id}`,
    "",
    `- case: \`${relative(casePath)}\``,
    `- variants: ${variantFiles.length ? variantFiles.map((file) => `\`${relative(file)}\``).join(", ") : "none"}`,
    `- generated_at: ${new Date().toISOString()}`,
    `- claude_status: ${claudeStatus}`,
    "",
    "## Automatic checks",
    "",
    ...automaticResults.flatMap((result) => [
      `### ${result.name}`,
      "",
      `status: ${result.status === 0 ? "PASS" : "FAIL"}`,
      "",
      "```text",
      result.output.trim() || "(no output)",
      "```",
      "",
    ]),
    "## Local review findings",
    "",
    findings.length === 0
      ? "No local P0/P1/P2 findings."
      : findings.map((finding) => `- ${finding.severity} ${finding.area}: ${finding.message}`).join("\n"),
    "",
    "## Claude prompt",
    "",
    "```text",
    prompt,
    "```",
    "",
    "## Claude Case Critic",
    "",
    claudeOutput ? claudeOutput : "(not run)",
    "",
  ].join("\n");
}

function runCheck(name, command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10,
  });
  automaticResults.push({
    name,
    status: result.status ?? 1,
    output: [result.stdout, result.stderr].filter(Boolean).join("\n").trim(),
  });
}

function findVariantFiles() {
  if (!fs.existsSync(VARIANTS_DIR)) return [];
  const templateRef = `${caseTemplate.id}@v${caseTemplate.version}`;
  return fs.readdirSync(VARIANTS_DIR)
    .filter((file) => file.endsWith(".yaml"))
    .map((file) => path.join(VARIANTS_DIR, file))
    .filter((file) => readYaml(file)?.case_variant?.template_ref === templateRef)
    .sort();
}

function canonicalExerciseId(exerciseId) {
  return legacyExerciseAliases.get(exerciseId) ?? exerciseId;
}

function collectParticipantText(item) {
  return [
    item.context_template?.role_play,
    item.context_template?.scenario,
    ...(item.context_template?.pressure ?? []),
    ...(item.steps ?? []).map((step) => [
      step.prompt,
      step.task_to_user,
      step.followup?.prompt,
      ...(step.options ?? []).map((option) => `${option.label ?? ""} ${option.tradeoff ?? ""}`),
      ...(step.artifact_segments ?? []).map((segment) => segment.text ?? ""),
    ].join(" ")),
  ].join(" ");
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function addFinding(severity, area, message) {
  findings.push({ severity, area, message });
}

function wordCount(value) {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

function relative(filePath) {
  return path.relative(ROOT, filePath);
}

function slug(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function which(command) {
  const result = spawnSync("command", ["-v", command], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
  });
  return result.status === 0 ? result.stdout.trim().split("\n")[0] : "";
}
