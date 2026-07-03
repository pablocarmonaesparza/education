#!/usr/bin/env node

/**
 * purge-demo-data — borra los datos demo sembrados antes de ir a producción.
 *
 * Identifica orgs demo (nombre ILIKE '%demo%') y usuarios demo (email con
 * 'demo' o dominio '.local'), y borra en cascada FK: reportes → step_events →
 * sesiones → assignments → practice attempts/unlocks → team/org memberships →
 * subscriptions → teams → org, y los usuarios demo.
 *
 * SEGURO POR DEFECTO: sin --confirm hace DRY-RUN (solo cuenta y lista). Con
 * --confirm ejecuta. Usa service_role (bypassa RLS). Corre contra el proyecto
 * de las envs cargadas (.env.local) — para el remoto, apunta NEXT_PUBLIC_
 * SUPABASE_URL al remoto.
 *
 * Uso:
 *   node scripts/simulador/purge-demo-data.mjs            # dry-run
 *   node scripts/simulador/purge-demo-data.mjs --confirm  # ejecuta
 */

import fs from "node:fs";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const CONFIRM = process.argv.includes("--confirm");

function loadEnv() {
  const out = { ...process.env };
  if (fs.existsSync(".env.local")) {
    for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!(k in out)) out[k] = v;
    }
  }
  return out;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  db: { schema: "simulador" },
  auth: { persistSession: false },
});

async function ids(table, select, filterFn) {
  const q = filterFn(db.from(table).select(select));
  const { data, error } = await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  return data ?? [];
}

async function main() {
  console.log(`\n=== purge-demo-data (${CONFIRM ? "EJECUTAR" : "DRY-RUN"}) — ${url}\n`);

  const orgs = await ids("organizations", "id, name", (q) =>
    q.ilike("name", "%demo%"),
  );
  const users = await ids("users", "id, email", (q) =>
    q.or("email.ilike.%demo%,email.ilike.%.local"),
  );
  const orgIds = orgs.map((o) => o.id);
  const userIds = users.map((u) => u.id);

  console.log(`orgs demo (${orgs.length}):`, orgs.map((o) => o.name).join(", ") || "—");
  console.log(`usuarios demo (${users.length}):`, users.map((u) => u.email).join(", ") || "—");

  if (userIds.length === 0 && orgIds.length === 0) {
    console.log("\nNada que purgar. ✓");
    return;
  }

  // Sesiones de los usuarios demo → dependientes.
  const sessions = await ids("simulation_sessions", "id", (q) =>
    userIds.length ? q.in("user_id", userIds) : q.eq("user_id", "___none___"),
  );
  const sessionIds = sessions.map((s) => s.id);
  console.log(`sesiones demo: ${sessionIds.length}`);

  if (!CONFIRM) {
    console.log("\nDRY-RUN. Nada borrado. Corre con --confirm para ejecutar.\n");
    return;
  }

  // Orden FK-safe (hijos → padres).
  const del = async (table, col, values) => {
    if (!values.length) return;
    const { error } = await db.from(table).delete().in(col, values);
    if (error) console.error(`  ✗ ${table}.${col}: ${error.message}`);
    else console.log(`  ✓ ${table} (${values.length} por ${col})`);
  };

  if (sessionIds.length) {
    await del("reports", "simulation_session_id", sessionIds);
    await del("evaluation_runs", "simulation_session_id", sessionIds);
    await del("simulation_step_events", "simulation_session_id", sessionIds);
    await del("practice_unlocks", "source_session_id", sessionIds);
    await del("simulation_sessions", "id", sessionIds);
  }
  await del("practice_attempts", "user_id", userIds);
  await del("practice_unlocks", "user_id", userIds);
  await del("assignments", "user_id", userIds);
  await del("team_memberships", "user_id", userIds);
  await del("organization_memberships", "user_id", userIds);
  await del("subscriptions", "organization_id", orgIds);
  await del("teams", "organization_id", orgIds);
  await del("organizations", "id", orgIds);
  await del("users", "id", userIds);

  console.log("\nPurga completa. ✓\n");
}

main().catch((e) => {
  console.error("purge falló:", e.message);
  process.exit(1);
});
