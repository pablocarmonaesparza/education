#!/usr/bin/env node
import { chromium } from "@playwright/test";

const CASE_URL = process.env.CASE_LAB_URL ?? "http://localhost:4000/case-lab/marketing-dirty-data-campaign";
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

async function clickNext(page) {
  await page.locator("footer button").last().click();
  await page.waitForTimeout(420);
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
    check(await page.locator("h2").innerText() === "Trabajas en el equipo de Marketing de Loop.", "first slide must be Contexto 1");
    check(await page.getByRole("progressbar").getAttribute("aria-valuenow") === "20", "Contexto 1 progress must be 20");
    check(await page.getByText("1 / 5").count(), "Contexto must show 1 / 5");
    check(await page.getByText("Lee esto como el brief que acaba de llegar a tu mesa").count() === 0, "Contexto must not show repeated brief panel");
    await assertCurrentSlideFits(page, `${label} contexto`);

    for (let i = 0; i < 5; i++) await clickNext(page);
    check(await page.locator("h2").innerText() === "Ahora mira los datos disponibles.", "after Contexto 5, next must be Datos 1");
    check(await page.getByRole("progressbar").getAttribute("aria-valuenow") === "20", "Datos 1 progress must reset to 20");
    await assertCurrentSlideFits(page, `${label} datos intro`);

    await clickNext(page);
    check(await page.getByText("02 · Tabla editable de datos").count(), "Datos exercise must use canonical 02 table label");
    check(await page.getByText("Decidir").count(), "data table must start empty/default with Decidir");
    await assertCurrentSlideFits(page, `${label} data table`);

    for (let i = 0; i < 4; i++) await clickNext(page);
    check(await page.locator("h2").innerText() === "Ahora sí puedes pedir ayuda a la IA.", "after Datos, next must be IA 1");
    await clickNext(page);
    check(await page.getByText("01B · Textfield de IA guiado").count(), "IA guided prompt must use canonical 01B label");
    check(await page.getByText("Respuestas").count(), "guided prompt must show Respuestas pane");
    check(await page.getByText("Crear prompt").count(), "guided prompt must expose Crear prompt action");
    check(await page.getByText("El prompt aparecerá aquí cuando completes las selecciones").count(), "guided prompt must start empty");
    await assertCurrentSlideFits(page, `${label} guided prompt`);

    await clickNext(page);
    check(await page.locator("h2").innerText() === "El modelo también es una decisión.", "after guided prompt, next must be IA 3");
    await clickNext(page);
    check(await page.getByText("01A · Textfield de IA libre").count(), "free prompt must use canonical 01A label");
    check(await page.getByPlaceholder("Ejemplo de intención", { exact: false }).count(), "free prompt must show case-specific placeholder");
    await assertCurrentSlideFits(page, `${label} free prompt`);

    for (let i = 0; i < 2; i++) await clickNext(page);
    check(await page.locator("h2").innerText() === "La IA ya propuso tres ángulos.", "after IA, next must be Revisión 1");
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

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
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
