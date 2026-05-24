#!/usr/bin/env node
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const CASE_URL = process.env.CASE_LAB_URL ?? "http://localhost:4000/case-lab/marketing-dirty-data-campaign";
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

  const catalog = yaml.load(fs.readFileSync(catalogPath, "utf8"));
  const catalogIds = new Set(catalog.exercise_block_catalog.blocks.map((block) => block.id));
  const casesSource = fs.readFileSync(casesPath, "utf8");
  const runtimeSource = fs.readFileSync(runtimePath, "utf8");
  const exerciseLabSource = fs.readFileSync(exerciseLabPath, "utf8");
  const rendererSource = fs.readFileSync(rendererPath, "utf8");
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
  };
  const caseBlocks = casesSource
    .split(/\n\s*\{\n\s*id:\s*"/)
    .slice(1)
    .map((chunk) => {
      const id = chunk.slice(0, chunk.indexOf('"'));
      const body = chunk;
      return {
        id,
        blocks: Array.from(body.matchAll(/\b(data|ai|guided|review|decision|memo|agent|permission|logs)\("/g)).map((match) => helperToBlock[match[1]]),
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
}

async function clickNext(page) {
  await page.locator("footer button").last().click();
  await page.waitForTimeout(600);
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

async function runScenario(browser, viewport) {
  const label = `${viewport.width}x${viewport.height}`;
  const page = await browser.newPage({ viewport });
  try {
    await page.goto(CASE_URL, { waitUntil: "domcontentloaded" });

    check(await page.getByText("ChatGPT").count(), "intro must show real tools: ChatGPT");
    check(await page.getByText("Claude").count(), "intro must show real tools: Claude");
    check(await page.getByText("Meta Ads").count(), "intro must show real tools: Meta Ads");
    check(await page.getByRole("progressbar").getAttribute("aria-valuenow") === "0", "intro progress must start at 0");
    await assertCurrentSlideFits(page, `${label} intro`);

    const sidebarText = await page.locator("aside").last().innerText();
    for (const section of ["Contexto", "Datos", "IA", "Revisión", "Decisión", "Respuesta"]) {
      check(sidebarText.includes(section), `sidebar must include section name: ${section}`);
    }

    check(await page.getByText("Lee esto como el brief que acaba de llegar a tu mesa").count() === 0, "reading slides must not render repeated brief panel");

    await clickNext(page);
    check((await page.getByText("Contexto · Lectura").count()) > 0, "first slide must be Contexto reading");
    check(await page.getByRole("progressbar").getAttribute("aria-valuenow") === "20", "Contexto 1 progress must be 20");
    check(await page.getByText("1 / 5").count(), "Contexto must show 1 / 5");
    check(await page.getByText("Lee esto como el brief que acaba de llegar a tu mesa").count() === 0, "Contexto must not show repeated brief panel");
    await assertCurrentSlideFits(page, `${label} contexto`);

    for (let i = 0; i < 5; i++) await clickNext(page);
    check((await page.getByText("Datos · Lectura").count()) > 0, "after Contexto 5, next must be Datos reading");
    check(await page.getByRole("progressbar").getAttribute("aria-valuenow") === "20", "Datos 1 progress must reset to 20");
    await assertCurrentSlideFits(page, `${label} datos intro`);

    await clickNext(page);
    check(await page.getByText("02 · Tabla editable de datos").count(), "Datos exercise must use canonical 02 table label");
    check(await page.getByText("Decidir").count(), "data table must start empty/default with Decidir");
    await assertCurrentSlideFits(page, `${label} data table`);

    for (let i = 0; i < 4; i++) await clickNext(page);
    check((await page.getByText("IA · Lectura").count()) > 0, "after Datos, next must be IA reading");
    await clickNext(page);
    check(await page.getByText("01B · Textfield de IA guiado").count(), "IA guided prompt must use canonical 01B label");
    check(await page.getByText("Respuestas").count(), "guided prompt must show Respuestas pane");
    check(await page.getByPlaceholder("El prompt aparecerá aquí cuando completes las selecciones").count(), "guided prompt must start empty");
    await assertCurrentSlideFits(page, `${label} guided prompt`);

    await clickNext(page);
    check((await page.getByText("IA · Lectura").count()) > 0, "after guided prompt, next must be IA reading");
    await clickNext(page);
    check(await page.getByText("01A · Textfield de IA libre").count(), "free prompt must use canonical 01A label");
    check(await page.getByPlaceholder("Ejemplo de intención", { exact: false }).count(), "free prompt must show case-specific placeholder");
    await assertCurrentSlideFits(page, `${label} free prompt`);

    for (let i = 0; i < 2; i++) await clickNext(page);
    check((await page.getByText("Revisión · Lectura").count()) > 0, "after IA, next must be Revisión reading");
    await clickNext(page);
    check(await page.getByText("04 · Revisión de output").count(), "review must use canonical 04 label");
    await assertCurrentSlideFits(page, `${label} output review`);

    let sawCanonical = 0;
    const body = (await page.locator("body").innerText()).toLowerCase();
    for (const label of CANONICAL_EXERCISE_LABELS) {
      if (body.includes(label.toLowerCase())) sawCanonical += 1;
    }
    check(sawCanonical >= 1, "runtime must render canonical Exercise Lab labels");
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
      const sidebarText = await page.locator("aside").last().innerText();
      for (const section of ["Contexto", "Datos", "IA", "Revisión", "Decisión", "Respuesta"]) {
        check(sidebarText.includes(section), `${path} sidebar must include section: ${section}`);
      }
      check(await page.getByRole("progressbar").getAttribute("aria-valuenow") === "0", `${path} intro progress must start at 0`);
      await clickNext(page);
      try {
        await page.waitForFunction(() => document.querySelector("section article")?.textContent?.includes("1 / 5"), null, { timeout: 2000 });
      } catch {
        // handled by the explicit assertion below
      }
      const articleText = await page.locator("section article").innerText();
      check(articleText.includes("1 / 5"), `${path} first section must start at 1 / 5`);
      check(await page.getByText("Lee esto como el brief que acaba de llegar a tu mesa").count() === 0, `${path} must not show repeated legacy brief panel`);
      await assertCurrentSlideFits(page, `${path} first slide`);
    } finally {
      await page.close();
    }
  }
}

async function main() {
  runStaticRuntimeChecks();
  const browser = await chromium.launch({ headless: true });
  try {
    await runCaseIndexScenario(browser);
    await runAllCasesSmoke(browser);
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
