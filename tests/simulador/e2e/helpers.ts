import fs from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type AdminClient = SupabaseClient<any, "simulador", any>;

const env = loadEnv();

export const runId = process.env.E2E_RUN_ID ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const password = process.env.E2E_PASSWORD ?? `E2eSmoke-${runId}!`;

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "E2E missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local or the test environment.",
  );
}

export const admin: AdminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const created = {
  authUserIds: new Set<string>(),
  bridgeUserIds: new Set<string>(),
  organizationIds: new Set<string>(),
  organizationNames: new Set<string>(),
};

export async function createSyntheticUser(label: string) {
  const email = `e2e-${label}-${runId}@itera.test`.toLowerCase();
  const fullName = `E2E ${label} ${runId}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: fullName },
  });

  if (error || !data.user) {
    throw new Error(`createSyntheticUser ${label}: ${error?.message ?? "missing user"}`);
  }

  created.authUserIds.add(data.user.id);

  const bridgeUserId = await ensureBridgeUser(data.user.id);
  created.bridgeUserIds.add(bridgeUserId);

  return {
    authUserId: data.user.id,
    bridgeUserId,
    email,
    fullName,
    password,
  };
}

export async function createOrgBundle({
  label,
  bridgeUserId,
  teamRole,
  orgRole = "viewer",
  sprintName = `E2E Sprint ${label} ${runId}`,
}: {
  label: string;
  bridgeUserId: string;
  teamRole: "manager" | "employee";
  orgRole?: "org_admin" | "billing_admin" | "viewer";
  sprintName?: string;
}) {
  const orgId = await insertOne("organizations", {
    name: `E2E Org ${label} ${runId}`,
    industry: "qa",
    region: "MX",
    company_size_key: "100-300",
    metadata: { e2e_run: runId, label },
  });
  created.organizationIds.add(orgId);

  const teamId = await insertOne("teams", {
    organization_id: orgId,
    name: `E2E Team ${label}`,
    department_key: "marketing",
    metadata: { e2e_run: runId, label },
  });

  await insertOne("organization_memberships", {
    organization_id: orgId,
    user_id: bridgeUserId,
    role: orgRole,
  });

  await insertOne("team_memberships", {
    team_id: teamId,
    user_id: bridgeUserId,
    role: teamRole,
  });

  const sprintId = await insertOne("sprints", {
    organization_id: orgId,
    team_id: teamId,
    name: sprintName,
    status: "active",
    start_date: new Date().toISOString().slice(0, 10),
    target_dimensions: [
      "contexto",
      "datos",
      "ejecucion_ia",
      "validacion",
      "juicio",
      "impacto",
    ],
    metadata: { e2e_run: runId, label },
  });

  return { orgId, teamId, sprintId };
}

export async function login(page: Page, email: string, pass = password) {
  await page.goto("/auth/login");
  await page.getByPlaceholder("email@empresa.com").fill(email);
  await page.getByPlaceholder("Contraseña").fill(pass);
  await page
    .locator("form")
    .getByRole("button", { name: "Continuar", exact: true })
    .click();
}

export async function expectAppReady(page: Page) {
  await expect(page.locator(".simulador-root, .surface-canvas").first()).toBeVisible();
}

export async function cleanupSyntheticData() {
  for (const orgId of created.organizationIds) {
    await admin.schema("simulador").from("organizations").delete().eq("id", orgId);
  }

  for (const name of created.organizationNames) {
    const { data } = await admin
      .schema("simulador")
      .from("organizations")
      .select("id")
      .eq("name", name);
    for (const org of data ?? []) {
      await admin.schema("simulador").from("organizations").delete().eq("id", org.id);
    }
  }

  for (const bridgeUserId of created.bridgeUserIds) {
    await admin.schema("simulador").from("users").delete().eq("id", bridgeUserId);
  }

  for (const authUserId of created.authUserIds) {
    await admin.auth.admin.deleteUser(authUserId);
  }
}

export function trackCreatedOrgName(name: string) {
  created.organizationNames.add(name);
}

async function ensureBridgeUser(authUserId: string): Promise<string> {
  const { data, error } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: authUserId });

  if (error || !data) {
    throw new Error(`ensure_bridge_user: ${error?.message ?? "missing id"}`);
  }

  return String(data);
}

async function insertOne(table: string, row: Record<string, unknown>) {
  const { data, error } = await admin
    .schema("simulador")
    .from(table)
    .insert(row)
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(`insert ${table}: ${error?.message ?? "missing id"}`);
  }

  return String(data.id);
}

function loadEnv() {
  const out: Record<string, string | undefined> = { ...process.env };
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return out;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    if (!(key in out)) out[key] = value;
  }

  return out;
}
