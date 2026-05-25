#!/usr/bin/env node
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const CASE_URL = process.env.CASE_LAB_URL ?? "http://localhost:4000/case-lab/sales-agent-followup";
const CASE_INDEX_URL = process.env.CASE_LAB_INDEX_URL ?? "http://localhost:4000/case-lab";
const EXPECTED_CASE_TOOLS = {
  "/case-lab/marketing-dirty-data-campaign": ["ChatGPT", "Claude", "Meta Ads"],
  "/case-lab/sales-agent-followup": ["HubSpot Breeze", "ChatGPT", "Claude"],
  "/case-lab/support-whatsapp-escalation": ["Zendesk AI Agents", "WhatsApp Business", "ChatGPT"],
  "/case-lab/finance-variance-claim": ["Gemini", "Claude", "Google Sheets"],
  "/case-lab/legal-contract-triage": ["Claude", "ChatGPT Enterprise", "Google Drive"],
};
const CANONICAL_EXERCISE_LABELS = [
  "01A · Textfield de IA libre",
  "01B · Textfield de IA guiado",
  "02 · Tabla editable de datos",
  "04 · Revisión de output",
  "11 · Decisión con ventajas y costos",
  "11 · Decisión + memo",
];
const PARTICIPANT_FORBIDDEN_TEXT = [
  /learning goal/i,
  /evidencia esperada/i,
  /qué afectará/i,
  /que afectara/i,
  /debrief/i,
  /rúbrica/i,
  /rubrica/i,
  /manager signal/i,
  /case reveal/i,
  /respuesta correcta/i,
  /risk event/i,
  /ejercicio/i,
];
const GOLDEN_CASE_BLOCKS = [
  "data_table_triage",
  "agent_brief_builder",
  "permission_matrix",
  "workflow_builder",
  "run_log_review",
  "ai_output_review",
  "dashboard_pivot",
  "tradeoff_decision_memo",
];

const issues = [];
function check(condition, message) {
  if (!condition) issues.push(message);
}

function runStaticRuntimeChecks() {
  const root = process.cwd();
  const catalogPath = path.join(root, "docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml");
  const casesPath = path.join(root, "lib/simulador/case-lab-cases.ts");
  const runtimePath = path.join(root, "app/case-lab/[caseId]/CaseLabRuntime.tsx");
  const exerciseLabPath = path.join(root, "app/exercise-lab/ExerciseLabClient.tsx");
  const rendererPath = path.join(root, "components/simulador/exercises/ExerciseBlockRenderer.tsx");
  const liveFormulaPath = path.join(root, "docs/simulador/case_factory/CASE_LIVE_FORMULA_V2.md");

  const catalog = yaml.load(fs.readFileSync(catalogPath, "utf8"));
  const catalogIds = new Set(catalog.exercise_block_catalog.blocks.map((block) => block.id));
  const casesSource = fs.readFileSync(casesPath, "utf8");
  const runtimeSource = fs.readFileSync(runtimePath, "utf8");
  const exerciseLabSource = fs.readFileSync(exerciseLabPath, "utf8");
  const rendererSource = fs.readFileSync(rendererPath, "utf8");
  const liveFormulaSource = fs.readFileSync(liveFormulaPath, "utf8");
  const usedIds = Array.from(casesSource.matchAll(/exerciseBlockId:\s*"([^"]+)"/g)).map((match) => match[1]);
  const uniqueUsedIds = new Set(usedIds);

  const helperUsageCount = (casesSource.match(/\b(data|ai|guided|review|decision|memo|agent|permission|logs)\("/g) ?? []).length;
  check(helperUsageCount >= 20, "case demos must declare canonical exercise helpers on real slides");
  for (const id of uniqueUsedIds) {
    check(catalogIds.has(id), `exerciseBlockId '${id}' must exist in EXERCISE_BLOCK_CATALOG.yaml`);
  }
  for (const required of ["data_table_triage", "ai_textfield_guided", "ai_output_review", "tradeoff_decision_memo"]) {
    check(uniqueUsedIds.has(required), `case demos must include required canonical block: ${required}`);
  }
  check(!/DemoSlideType|slide\.type|type:\s*"(data_table|guided_prompt|ai_textfield|memo|decision|log_review)"/.test(casesSource), "case data must not use legacy slide.type widgets");
  check(!/GuidedPromptBlock|CasePromptComposer|AgentBriefBlock|PermissionMatrixBlock|OutputReviewBlock|DecisionMemoBlock|PanelShell/.test(runtimeSource), "case runtime must not contain local simplified exercise widgets");
  check(runtimeSource.includes("ExerciseBlockRenderer"), "case runtime must render through ExerciseBlockRenderer");
  check(exerciseLabSource.includes("ExerciseBlockRenderer"), "exercise lab must consume the shared ExerciseBlockRenderer");
  check(rendererSource.includes("export type ExerciseBlockId"), "shared renderer must expose central ExerciseBlockId");
  check(runtimeSource.includes("participant_mode"), "case runtime must default to participant mode");
  check(runtimeSource.includes("author_mode"), "case runtime must keep an explicit author/debug mode");
  check(runtimeSource.includes("evidenceBySlide"), "case runtime must keep a local evidence store");
  check(runtimeSource.includes("SimulationFeedback"), "case runtime must render status/consequence feedback");
  check(runtimeSource.includes("sectionEvidenceCount"), "case runtime must gate section debriefs with captured evidence");
  check(runtimeSource.includes("canShowSectionDebrief"), "case runtime must not show debriefs without section evidence");
  check(runtimeSource.includes("currentSlideRequiresEvidence"), "case runtime must block exercise navigation until evidence is complete");
  check(runtimeSource.includes("highestUnlockedIndex"), "case runtime must prevent jumping to locked future sections");
  check(runtimeSource.includes("hideInternalLabels"), "case runtime must hide canonical exercise labels in participant mode");
  check(liveFormulaSource.includes("caso vivo primero"), "case factory must document the live-case-first formula");
  check(liveFormulaSource.includes("Separacion por audiencia"), "case factory must separate participant, manager and author surfaces");
  check(casesSource.includes("evidenceExpected"), "case slides must declare expected evidence");
  check(casesSource.includes("simulationConsequence"), "case slides must declare simulation consequences");
  check(casesSource.includes("learningGoal"), "case slides must declare learning goals");

  const helperToBlock = {
    data: "data_table_triage",
    ai: "ai_textfield_free",
    guided: "ai_textfield_guided",
    review: "ai_output_review",
    decision: "tradeoff_decision_memo",
    memo: "tradeoff_decision_memo",
    agent: "agent_brief_builder",
    permission: "permission_matrix",
    logs: "run_log_review",
    workflow: "workflow_builder",
    pivot: "dashboard_pivot",
  };
  const caseBlocks = casesSource
    .split(/\n\s*\{\n\s*id:\s*"/)
    .slice(1)
    .map((chunk) => {
      const id = chunk.slice(0, chunk.indexOf('"'));
      const body = chunk;
      return {
        id,
        blocks: Array.from(body.matchAll(/\b(data|ai|guided|review|decision|memo|agent|permission|logs|workflow|pivot)\("/g)).map((match) => helperToBlock[match[1]]),
      };
    })
    .filter((item) => item.id.includes("-"));

  for (const demoCase of caseBlocks) {
    const blockSet = new Set(demoCase.blocks);
    check(demoCase.blocks.length >= 4, `${demoCase.id} must use at least 4 canonical exercise blocks`);
    check(blockSet.has("data_table_triage"), `${demoCase.id} must include a data exercise`);
    check(
      blockSet.has("ai_textfield_free") || blockSet.has("ai_textfield_guided") || blockSet.has("agent_brief_builder"),
      `${demoCase.id} must include an AI-native exercise`,
    );
    check(
      blockSet.has("ai_output_review") || blockSet.has("run_log_review"),
      `${demoCase.id} must include a review exercise`,
    );
    check(blockSet.has("tradeoff_decision_memo"), `${demoCase.id} must include decision/response exercise`);
  }

  const salesChunk = casesSource.split('id: "sales-agent-followup"')[1]?.split('id: "support-whatsapp-escalation"')[0] ?? "";
  check(salesChunk.includes("sales_agent_followup_pipeline_v1") || salesChunk.includes("HubSpot Breeze"), "golden sales case must be based on canonical sales-agent-followup source");
  for (const block of GOLDEN_CASE_BLOCKS) {
    check(salesChunk.includes(block) || salesChunk.includes(blockHelperName(block)), `sales-agent-followup must include ${block}`);
  }
  for (const field of ["learningGoal", "evidenceExpected", "simulationConsequence", "managerSignal"]) {
    check((salesChunk.match(new RegExp(`${field}:`, "g")) ?? []).length >= 5, `sales-agent-followup must include rich ${field} metadata`);
  }
}

function blockHelperName(block) {
  return {
    data_table_triage: "data(",
    agent_brief_builder: "agent(",
    permission_matrix: "permission(",
    workflow_builder: "workflow(",
    run_log_review: "logs(",
    ai_output_review: "review(",
    dashboard_pivot: "pivot(",
    tradeoff_decision_memo: "decision(",
  }[block];
}

async function clickNext(page) {
  const nextButton = page.locator("footer button").last();
  await nextButton.waitFor({ state: "visible", timeout: 5000 });
  const exerciseLabel = await currentExerciseLabel(page);
  if (exerciseLabel) {
    check(await nextButton.isDisabled(), `${exerciseLabel}: next must stay disabled until evidence is completed`);
    await completeCurrentExercise(page, exerciseLabel);
    await page.waitForTimeout(250);
    check(!(await nextButton.isDisabled()), `${exerciseLabel}: next must unlock after completed evidence`);
  }
  await page.waitForTimeout(150);
  await nextButton.click();
  await page.waitForTimeout(800);
}

async function currentExerciseLabel(page) {
  const block = page.locator("[data-exercise-block]").first();
  if ((await block.count()) === 0) return "";
  return (await block.getAttribute("data-exercise-block")) ?? "";
}

async function completeCurrentExercise(page, label) {
  const block = page.locator("[data-exercise-block]").first();

  if (/tabla editable de datos/i.test(label)) {
    const selects = block.locator("select");
    const values = ["usar", "anonimizar", "agregar", "excluir"];
    for (let index = 0; index < await selects.count(); index += 1) {
      await selects.nth(index).selectOption(values[index % values.length]);
    }
    return;
  }

  if (/matriz de permisos/i.test(label)) {
    const buttons = block.getByRole("button", { name: "Revisar" });
    for (let index = 0; index < await buttons.count(); index += 1) {
      await buttons.nth(index).click();
    }
    return;
  }

  if (/brief para agente/i.test(label)) {
    for (let index = 0; index < 4; index += 1) {
      await block.locator("button").nth(4).click();
      await page.waitForTimeout(80);
    }
    return;
  }

  if (/workflow builder/i.test(label)) {
    const buttons = block.locator("button");
    for (let index = 0; index < Math.min(3, await buttons.count()); index += 1) {
      await buttons.nth(index).click();
    }
    return;
  }

  if (/revisión de logs|revisión de output|comparación de respuestas|dashboard/i.test(label)) {
    await block.locator("button").first().click();
    return;
  }

  if (/decisión/i.test(label)) {
    await block.locator("button").first().click();
    const memo = block.locator("textarea");
    if (await memo.count()) {
      await memo.first().fill("Piloto acotado con revisión humana, métrica diaria y pausa si reaparece dato sensible.");
    }
    return;
  }

  if (/textfield de ia/i.test(label)) {
    const textInput = block.locator("textarea").first();
    if (await textInput.count()) {
      await textInput.fill("Prepara una recomendación con contexto, límites de datos y validación humana antes de cualquier acción externa.");
    }
  }
}

async function assertCurrentSlideFits(page, label) {
  const content = await page.locator("section article > div").evaluate((el) => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    overflowY: getComputedStyle(el).overflowY,
  }));
  check(content.overflowY === "hidden", `${label}: slide content must not be internally scrollable`);
  check(content.scrollHeight <= content.clientHeight + 2, `${label}: current slide must fit viewport without clipping`);
}

async function assertParticipantCopyClean(page, label) {
  const bodyText = await page.locator("body").innerText();
  for (const pattern of PARTICIPANT_FORBIDDEN_TEXT) {
    check(!pattern.test(bodyText), `${label}: participant mode must not show '${pattern.source}'`);
  }
  for (const canonicalLabel of CANONICAL_EXERCISE_LABELS) {
    check(!bodyText.toLowerCase().includes(canonicalLabel.toLowerCase()), `${label}: participant mode must not show canonical label '${canonicalLabel}'`);
  }
}

async function renderedExerciseLabels(page) {
  return page.locator("[data-exercise-block]").evaluateAll((blocks) =>
    blocks.map((block) => block.getAttribute("data-exercise-block")).filter(Boolean),
  );
}

async function hasRenderedExercise(page, pattern) {
  const labels = await renderedExerciseLabels(page);
  return labels.some((label) => pattern.test(label));
}

async function runScenario(browser, viewport) {
  const label = `${viewport.width}x${viewport.height}`;
  const page = await browser.newPage({ viewport });
  try {
    await page.goto(CASE_URL, { waitUntil: "domcontentloaded" });
    const currentPath = new URL(CASE_URL).pathname;
    const expectedTools = EXPECTED_CASE_TOOLS[currentPath] ?? ["ChatGPT", "Claude"];

    for (const tool of expectedTools) {
      check(await page.getByText(tool).count(), `intro must show real tool: ${tool}`);
    }
    check(await page.getByRole("progressbar").getAttribute("aria-valuenow") === "0", "intro progress must start at 0");
    await assertCurrentSlideFits(page, `${label} intro`);
    await assertParticipantCopyClean(page, `${label} intro`);
    check((await page.locator("aside").count()) === 0, "participant mode must not render author sidebar");
    check(await page.getByText("Ejercicios").count() === 0, "participant mode must not link to Exercise Lab chrome");

    check(await page.getByText("Lee esto como el brief que acaba de llegar a tu mesa").count() === 0, "reading slides must not render repeated brief panel");

    await clickNext(page);
    check((await page.getByText("Contexto · Situación").count()) > 0, "first slide must be Contexto situation");
    check(await page.getByRole("progressbar").getAttribute("aria-valuenow") === "20", "Contexto 1 progress must be 20");
    check(await page.getByText("1 / 5").count(), "Contexto must show 1 / 5");
    check(await page.getByText("Lee esto como el brief que acaba de llegar a tu mesa").count() === 0, "Contexto must not show repeated brief panel");
    await assertCurrentSlideFits(page, `${label} contexto`);
    await assertParticipantCopyClean(page, `${label} contexto`);

    for (let i = 0; i < 5; i++) await clickNext(page);
    check((await page.getByText("Datos · Situación").count()) > 0, "after Contexto 5, next must be Datos situation");
    check(await page.getByRole("progressbar").getAttribute("aria-valuenow") === "20", "Datos 1 progress must reset to 20");
    await assertCurrentSlideFits(page, `${label} datos intro`);
    await assertParticipantCopyClean(page, `${label} datos intro`);

    await clickNext(page);
    check(await page.getByText(/02 · tabla editable de datos/i).count() === 0, "participant must not show canonical 02 table label");
    check(await hasRenderedExercise(page, /02 · tabla editable de datos/i), "Datos exercise must still use canonical 02 table block");
    check(await page.getByText("Decidir").count(), "data table must start empty/default with Decidir");
    await assertCurrentSlideFits(page, `${label} data table`);
    await assertParticipantCopyClean(page, `${label} data table`);

    for (let i = 0; i < 4; i++) await clickNext(page);
    check((await page.getByText("IA · Situación").count()) > 0, "after Datos, next must be IA situation");
    await clickNext(page);
    check(await hasRenderedExercise(page, /01B · textfield de ia guiado|07 · brief para agente/i), "IA slide must use canonical guided prompt or agent brief label");
    await assertCurrentSlideFits(page, `${label} first IA exercise`);
    await assertParticipantCopyClean(page, `${label} first IA exercise`);

    await clickNext(page);
    check((await page.getByText("IA · Situación").count()) > 0, "after guided prompt, next must be IA situation");
    await clickNext(page);
    check(await hasRenderedExercise(page, /01A · textfield de ia libre|03 · matriz de permisos|06 · workflow builder/i), "second IA exercise must use a canonical Exercise Lab block");
    await assertCurrentSlideFits(page, `${label} second IA exercise`);
    await assertParticipantCopyClean(page, `${label} second IA exercise`);

    for (let i = 0; i < 2; i++) await clickNext(page);
    check((await page.getByText("Revisión · Situación").count()) > 0, "after IA, next must be Revisión situation");
    await clickNext(page);
    check(await hasRenderedExercise(page, /08 · revisión de logs|04 · revisión de output/i), "review must use canonical review label");
    await assertCurrentSlideFits(page, `${label} output review`);
    await assertParticipantCopyClean(page, `${label} output review`);

    let sawCanonical = 0;
    const labels = (await renderedExerciseLabels(page)).join("\n").toLowerCase();
    for (const label of CANONICAL_EXERCISE_LABELS) {
      if (labels.includes(label.toLowerCase())) sawCanonical += 1;
    }
    check(
      sawCanonical >= 1 || labels.includes("07 · brief para agente") || labels.includes("08 · revisión de logs"),
      "runtime must render canonical Exercise Lab labels",
    );
  } finally {
    await page.close();
  }
}

async function runCaseIndexScenario(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(CASE_INDEX_URL, { waitUntil: "domcontentloaded" });
    const hrefs = await page.locator('a[href^="/case-lab/"]').evaluateAll((links) =>
      Array.from(new Set(links.map((link) => link.getAttribute("href")).filter(Boolean))).sort(),
    );
    const expectedHrefs = Object.keys(EXPECTED_CASE_TOOLS).sort();
    check(hrefs.length === expectedHrefs.length, `case index must show ${expectedHrefs.length} cases`);
    for (const href of expectedHrefs) {
      check(hrefs.includes(href), `case index missing ${href}`);
    }
    check(await page.getByText("HubSpot Breeze").count(), "case grid must show current tool: HubSpot Breeze");
    check(await page.getByText("Zendesk AI Agents").count(), "case grid must show current tool: Zendesk AI Agents");
    check(await page.getByText("Meta Ads").count(), "case grid must show current tool: Meta Ads");
  } finally {
    await page.close();
  }
}

async function runAllCasesSmoke(browser) {
  for (const [path, tools] of Object.entries(EXPECTED_CASE_TOOLS)) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await page.goto(new URL(path, CASE_INDEX_URL).toString(), { waitUntil: "domcontentloaded" });
      for (const tool of tools) {
        check(await page.getByText(tool).count(), `${path} intro must show tool: ${tool}`);
      }
      check((await page.locator("aside").count()) === 0, `${path} participant mode must not render author sidebar`);
      check(await page.getByRole("progressbar").getAttribute("aria-valuenow") === "0", `${path} intro progress must start at 0`);
      check(await page.getByText("Lee esto como el brief que acaba de llegar a tu mesa").count() === 0, `${path} must not show repeated legacy brief panel`);
      await assertCurrentSlideFits(page, `${path} intro`);
      await assertParticipantCopyClean(page, `${path} intro`);
    } finally {
      await page.close();
    }
  }
}

async function runAuthorModeSmoke(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(`${CASE_URL}?mode=author`, { waitUntil: "domcontentloaded" });
    check((await page.locator("aside").count()) > 0, "author mode must render review sidebar");
    check(await page.getByText("Ejercicios").count(), "author mode must expose Exercise Lab link");
    check(await page.getByRole("button", { name: /Respuesta/ }).first().isDisabled(), "author mode must keep locked future sections");
    await clickNext(page);
    check((await page.getByText("Objetivo").count()) > 0, "author mode must expose learning signals only after explicit mode");
  } finally {
    await page.close();
  }
}

async function main() {
  runStaticRuntimeChecks();
  const browser = await chromium.launch({ headless: true });
  try {
    await runCaseIndexScenario(browser);
    await runAllCasesSmoke(browser);
    await runAuthorModeSmoke(browser);
    await runScenario(browser, { width: 1440, height: 900 });
    await runScenario(browser, { width: 1024, height: 768 });
  } finally {
    await browser.close();
  }

  if (issues.length) {
    console.error(`case-lab runtime FAIL (${issues.length})`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }
  console.log("case-lab runtime OK");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
