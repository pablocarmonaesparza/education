import { test, expect } from "@playwright/test";
import {
  admin,
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

test("reporte publicado puede exportar PDF y generar link compartible", async ({
  page,
}) => {
  const employee = await createSyntheticUser("report");
  const { sprintId } = await createOrgBundle({
    label: "report",
    bridgeUserId: employee.bridgeUserId,
    teamRole: "employee",
    orgRole: "viewer",
    sprintName: `E2E Report Sprint ${runId}`,
  });

  const { data: variant, error: variantError } = await admin
    .schema("simulador")
    .from("case_variants")
    .select("id")
    .eq("status", "active")
    .eq("variant_role", "primary")
    .limit(1)
    .single();
  expect(variantError, variantError?.message).toBeNull();
  if (!variant) throw new Error("missing active primary variant");

  const { data: assignment, error: assignmentError } = await admin
    .schema("simulador")
    .from("assignments")
    .insert({
      sprint_id: sprintId,
      user_id: employee.bridgeUserId,
      case_variant_id: variant.id,
      assignment_kind: "primary",
      status: "completed",
    })
    .select("id")
    .single();
  expect(assignmentError, assignmentError?.message).toBeNull();
  if (!assignment) throw new Error("missing report assignment");

  const { data: session, error: sessionError } = await admin
    .schema("simulador")
    .from("simulation_sessions")
    .insert({
      assignment_id: assignment.id,
      case_variant_id: variant.id,
      user_id: employee.bridgeUserId,
      sprint_id: sprintId,
      status: "evaluated",
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  expect(sessionError, sessionError?.message).toBeNull();
  if (!session) throw new Error("missing report session");

  const payload = {
    rubric_version: "rubric_marketing_v1@1.0.0",
    case_version: "marketing_urgent_campaign_pii@v1",
    variant: "primary",
    judge_model: "e2e-fixture",
    duration_ms: 1200,
    dimensions: [
      { id: "contexto", band: "A", rationale: "encuadra bien audiencia y deadline", confidence: 0.9 },
      { id: "privacidad", band: "M", rationale: "anonimiza parcialmente el dataset", confidence: 0.8 },
      { id: "validacion", band: "A", rationale: "valida claims antes de enviar", confidence: 0.9 },
      { id: "juicio", band: "M", rationale: "detecta escalamiento pero tarde", confidence: 0.8 },
      { id: "decision", band: "A", rationale: "entrega una acción clara", confidence: 0.9 },
    ],
    risk_events: [
      {
        type: "hidden_pii_usage_from_authority",
        severity: "high",
        step_ordinal: 4,
        evidence_text: "Usé mariana.lopez@aurorares.mx y USD 24000 para priorizar el email.",
      },
    ],
    gaps: [
      {
        id: "no_risk_flag_upward",
        severity: "high",
        observed: "aceptó usar revenue potential sin bandera explícita.",
        why_matters: "puede convertir datos sensibles en segmentación comercial no aprobada.",
      },
    ],
    strengths: ["separó el brief del output del modelo antes de enviar."],
    recommendation: {
      action: "entrenar",
      applies_to: "la persona y el proceso de revisión del equipo.",
      next_week_actions: [
        "definir qué campos se anonimizan antes de usar IA.",
        "agregar revisión humana antes de lanzar campañas con datos sensibles.",
      ],
      reason: "buen criterio general con un evento de riesgo alto que requiere entrenamiento.",
    },
  };

  const { error: reportError } = await admin
    .schema("simulador")
    .from("reports")
    .insert({
      sprint_id: sprintId,
      user_id: employee.bridgeUserId,
      simulation_session_id: session.id,
      report_type: "participant_mirror",
      status: "published",
      payload_json: payload,
    });
  expect(reportError, reportError?.message).toBeNull();

  await login(page, employee.email);
  await expect(page).toHaveURL(/\/dashboard|\/onboarding\/org/);
  await page.goto(`/report/${session.id}`);
  await expect(page.getByText("Descargar PDF")).toBeVisible();

  const pdfMeta = await page.evaluate(async (sessionId) => {
    const res = await fetch(`/api/sessions/${sessionId}/report/pdf`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    return {
      status: res.status,
      type: res.headers.get("content-type"),
      prefix: String.fromCharCode(...bytes.slice(0, 4)),
      size: bytes.byteLength,
      body:
        res.status === 200
          ? null
          : new TextDecoder().decode(bytes.slice(0, 500)),
    };
  }, session.id);
  expect(pdfMeta.status, pdfMeta.body ?? "pdf request failed").toBe(200);
  expect(pdfMeta.type).toContain("application/pdf");
  expect(pdfMeta.prefix).toBe("%PDF");
  expect(pdfMeta.size).toBeGreaterThan(1000);

  const share = await page.evaluate(async (sessionId) => {
    const res = await fetch(`/api/sessions/${sessionId}/report/share`, {
      method: "POST",
    });
    return { status: res.status, body: await res.json() };
  }, session.id);
  expect(share.status, JSON.stringify(share.body)).toBe(200);
  expect(share.body.share_url).toContain("/shared/report/");

  await page.goto(share.body.share_url);
  await expect(page.getByText("Reporte ejecutivo compartido")).toBeVisible();
  await expect(page.getByText("[email]")).toBeVisible();
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
