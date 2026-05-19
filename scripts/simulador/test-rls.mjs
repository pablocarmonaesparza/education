#!/usr/bin/env node

import fs from "node:fs";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const ENV_FILE = ".env.local";
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = `RlsSmoke-${runId}!`;

function loadEnv() {
  const out = { ...process.env };
  if (fs.existsSync(ENV_FILE)) {
    for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
      if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
      const index = line.indexOf("=");
      const key = line.slice(0, index).trim();
      const value = line
        .slice(index + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      if (!(key in out)) out[key] = value;
    }
  }
  return out;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error(
    "RLS_SMOKE missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const created = {
  authUserIds: [],
  organizationIds: [],
};

async function main() {
  const a = await createSyntheticUser("a");
  const b = await createSyntheticUser("b");

  const orgA = await createOrgBundle("A", a.bridgeUserId);
  const orgB = await createOrgBundle("B", b.bridgeUserId);

  const clientA = await signIn(a.email);
  const clientB = await signIn(b.email);

  await assertVisible(clientA, "organizations", orgA.orgId, "user A can read org A");
  await assertHidden(clientA, "organizations", orgB.orgId, "user A cannot read org B");
  await assertVisible(clientB, "organizations", orgB.orgId, "user B can read org B");
  await assertHidden(clientB, "organizations", orgA.orgId, "user B cannot read org A");

  await assertVisible(clientA, "users", a.bridgeUserId, "user A can read self bridge user");
  await assertHidden(clientA, "users", b.bridgeUserId, "user A cannot read user B");
  await assertVisible(clientB, "users", b.bridgeUserId, "user B can read self bridge user");
  await assertHidden(clientB, "users", a.bridgeUserId, "user B cannot read user A");

  await assertVisible(clientA, "reports", orgA.reportId, "user A can read own published report");
  await assertHidden(clientA, "reports", orgB.reportId, "user A cannot read org B report");
  await assertVisible(clientB, "reports", orgB.reportId, "user B can read own published report");
  await assertHidden(clientB, "reports", orgA.reportId, "user B cannot read org A report");

  await assertHidden(clientA, "human_review_queue", null, "client cannot read staff review queue");

  console.log("RLS smoke OK — cross-tenant reads blocked for organizations, users, reports, review queue.");
}

async function createSyntheticUser(label) {
  const email = `rls-${label}-${runId}@itera.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: `RLS ${label.toUpperCase()} ${runId}` },
  });
  if (error || !data.user) throw new Error(`createUser ${label}: ${error?.message}`);
  created.authUserIds.push(data.user.id);

  const { data: bridgeUserId, error: bridgeError } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: data.user.id });
  if (bridgeError || !bridgeUserId) {
    throw new Error(`ensure_bridge_user ${label}: ${bridgeError?.message}`);
  }

  return { authUserId: data.user.id, bridgeUserId, email };
}

async function createOrgBundle(label, bridgeUserId) {
  const orgId = await insertOne("organizations", {
    name: `RLS Smoke Org ${label} ${runId}`,
    industry: "qa",
    region: "test",
    company_size_key: "test",
    metadata: { rls_smoke: runId },
  });
  created.organizationIds.push(orgId);

  const teamId = await insertOne("teams", {
    organization_id: orgId,
    name: `RLS Smoke Team ${label}`,
    department_key: "qa",
    metadata: { rls_smoke: runId },
  });

  await insertOne("organization_memberships", {
    organization_id: orgId,
    user_id: bridgeUserId,
    role: "org_admin",
  });
  await insertOne("team_memberships", {
    team_id: teamId,
    user_id: bridgeUserId,
    role: "manager",
  });

  const sprintId = await insertOne("sprints", {
    organization_id: orgId,
    team_id: teamId,
    name: `RLS Smoke Sprint ${label}`,
    status: "active",
    target_dimensions: ["contexto"],
    metadata: { rls_smoke: runId },
  });

  const reportId = await insertOne("reports", {
    sprint_id: sprintId,
    user_id: bridgeUserId,
    report_type: "participant_mirror",
    status: "published",
    payload_json: { rls_smoke: runId, label },
  });

  return { orgId, teamId, sprintId, reportId };
}

async function insertOne(table, row) {
  const { data, error } = await admin
    .schema("simulador")
    .from(table)
    .insert(row)
    .select("id")
    .single();
  if (error || !data?.id) throw new Error(`insert ${table}: ${error?.message}`);
  return data.id;
}

async function signIn(email) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return client;
}

async function assertVisible(client, table, id, label) {
  let query = client.schema("simulador").from(table).select("id").limit(1);
  if (id) query = query.eq("id", id);
  const { data, error } = await query;
  if (error) throw new Error(`${label}: unexpected error ${error.message}`);
  if (!data || data.length !== 1) throw new Error(`${label}: expected 1 row, got ${data?.length ?? 0}`);
}

async function assertHidden(client, table, id, label) {
  let query = client.schema("simulador").from(table).select("id").limit(1);
  if (id) query = query.eq("id", id);
  const { data, error } = await query;
  if (error) {
    if (["42501", "PGRST301"].includes(error.code)) return;
    throw new Error(`${label}: unexpected error ${error.message}`);
  }
  if (data && data.length > 0) throw new Error(`${label}: leaked ${data.length} row(s)`);
}

async function cleanup() {
  for (const orgId of created.organizationIds) {
    await admin.schema("simulador").from("organizations").delete().eq("id", orgId);
  }
  for (const authUserId of created.authUserIds) {
    await admin.auth.admin.deleteUser(authUserId);
  }
}

try {
  await main();
} catch (error) {
  console.error(`RLS_SMOKE ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await cleanup();
}
