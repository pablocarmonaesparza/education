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
  const inviteeEmail =
    process.env.E2E_INVITEE_EMAIL ?? `employee-${runId}@itera.test`;
  const requireEmailSent = process.env.E2E_REQUIRE_EMAIL_SENT === "1";
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
    .fill(inviteeEmail);
  const [inviteResponse] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/orgs/") &&
        response.url().includes("/invitations") &&
        response.request().method() === "POST",
    ),
    page.getByRole("button", { name: /Enviar/ }).click(),
  ]);
  const inviteJson = await inviteResponse.json();
  expect(inviteJson.invitations?.[0]?.email).toBe(inviteeEmail);
  if (requireEmailSent) {
    expect(
      inviteJson.invitations?.[0]?.email_status,
      inviteJson.invitations?.[0]?.email_reason ?? "email send failed",
    ).toBe("sent");
  }

  await expect(page.getByText(/invitación|invitaciones/)).toBeVisible();
  await page.getByRole("button", { name: /Ir al dashboard/ }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Dashboard del manager")).toBeVisible();
  await expect(page.getByText("Sprint Marketing/Growth 30d")).toBeVisible();
});

test("buyer puede abrir checkout Stripe del simulador", async ({ page }) => {
  const buyer = await createSyntheticUser("billing");
  const orgName = `E2E Billing Org ${runId}`;
  trackCreatedOrgName(orgName);

  await page.route("https://checkout.stripe.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>stripe checkout intercepted</title>",
    });
  });

  await login(page, buyer.email);
  await expect(page).toHaveURL(/\/dashboard|\/onboarding\/org/);

  await page.goto("/onboarding/org");
  await page.getByLabel("Nombre de la organización").fill(orgName);
  await page.getByRole("button", { name: /Continuar/ }).click();

  await expect(page).toHaveURL(/\/onboarding\/team/);
  await page.getByLabel("Nombre del equipo").fill(`Marketing Billing ${runId}`);
  await page.getByRole("button", { name: /Continuar/ }).click();

  await expect(page).toHaveURL(/\/onboarding\/invite/);
  await page
    .getByLabel("Emails de los participantes")
    .fill(`billing-employee-${runId}@itera.test`);
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/orgs/") &&
        response.url().includes("/invitations") &&
        response.request().method() === "POST",
    ),
    page.getByRole("button", { name: /Enviar/ }).click(),
  ]);

  await page.getByRole("button", { name: /Continuar a pago/ }).click();
  await expect(page).toHaveURL(/\/onboarding\/billing/);
  await expect(page.getByText("Confirma asientos y plan.")).toBeVisible();

  await expect(page.getByRole("button", { name: /Continuar a Stripe/ })).toBeVisible();
  const checkoutResult = await page.evaluate(async () => {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billing_product: "simulador_b2b",
        organization_id: sessionStorage.getItem("onboarding_org_id"),
        team_id: sessionStorage.getItem("onboarding_team_id"),
        plan: "diagnostico",
        seats: 5,
      }),
    });
    return {
      ok: res.ok,
      status: res.status,
      body: await res.json(),
    };
  });
  expect(checkoutResult.ok, JSON.stringify(checkoutResult.body)).toBeTruthy();
  const checkoutJson = checkoutResult.body;
  expect(checkoutJson.plan).toBe("diagnostico");
  expect(checkoutJson.seats).toBe(5);
  expect(checkoutJson.sessionUrl).toContain("https://checkout.stripe.com/");
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
