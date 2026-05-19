import { test, expect } from "@playwright/test";
import {
  cleanupSyntheticData,
  createOrgBundle,
  createSyntheticUser,
  expectAppReady,
  login,
  runId,
  trackCreatedOrgName,
} from "./helpers";

test.afterAll(async () => {
  await cleanupSyntheticData();
});

test("field-test público carga sin login", async ({ page }) => {
  await page.goto("/field-test/marketing-urgent-campaign-pii");
  await expectAppReady(page);
  await expect(page.getByText("Contexto").first()).toBeVisible();
  await expect(page.getByText(/Camila|campaña|feedback/i).first()).toBeVisible();
});

test("buyer puede crear organización, equipo e invitación", async ({ page }) => {
  const buyer = await createSyntheticUser("buyer");
  const orgName = `E2E Buyer Org ${runId}`;
  trackCreatedOrgName(orgName);

  await login(page, buyer.email);
  await expect(page).toHaveURL(/\/dashboard|\/onboarding\/org/);

  await page.goto("/onboarding/org");
  await page.getByLabel("Nombre de la organización").fill(orgName);
  await page.getByRole("button", { name: /Continuar/ }).click();

  await expect(page).toHaveURL(/\/onboarding\/team/);
  await page.getByLabel("Nombre del equipo").fill(`Marketing E2E ${runId}`);
  await page.getByRole("button", { name: /Continuar/ }).click();

  await expect(page).toHaveURL(/\/onboarding\/invite/);
  await page
    .getByLabel("Emails de los participantes")
    .fill(`employee-${runId}@itera.test`);
  await page.getByRole("button", { name: /Enviar/ }).click();

  await expect(page.getByText(/invitación|invitaciones/)).toBeVisible();
  await page.getByRole("button", { name: /Ir al dashboard/ }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Dashboard del manager")).toBeVisible();
  await expect(page.getByText("Sprint Marketing/Growth 30d")).toBeVisible();
});

test("manager ve dashboard agregado de su sprint", async ({ page }) => {
  const manager = await createSyntheticUser("manager");
  await createOrgBundle({
    label: "manager",
    bridgeUserId: manager.bridgeUserId,
    teamRole: "manager",
    orgRole: "org_admin",
    sprintName: `E2E Manager Sprint ${runId}`,
  });

  await login(page, manager.email);

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Dashboard del manager")).toBeVisible();
  await expect(page.getByText(`E2E Manager Sprint ${runId}`)).toBeVisible();
  await expect(page.getByText("Resultado agregado")).toBeVisible();
});

test("empleado entra a su dashboard y abre el caso asignable", async ({ page }) => {
  const employee = await createSyntheticUser("employee");
  await createOrgBundle({
    label: "employee",
    bridgeUserId: employee.bridgeUserId,
    teamRole: "employee",
    orgRole: "viewer",
    sprintName: `E2E Employee Sprint ${runId}`,
  });

  await login(page, employee.email);

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Dashboard del empleado")).toBeVisible();
  await expect(page.getByText("Casos disponibles.")).toBeVisible();

  await page
    .getByRole("button", { name: /Empezar caso|Continuar caso/ })
    .first()
    .click();

  await expect(page).toHaveURL(/\/case\/marketing_urgent_campaign_pii/);
  await expect(page.getByText("Contexto").first()).toBeVisible();
  await expect(page.getByText(/Camila|Marketing Manager|campaña/i).first()).toBeVisible();
});
