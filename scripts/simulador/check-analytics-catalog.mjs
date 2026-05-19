#!/usr/bin/env node

import { readFileSync } from "node:fs";

const migrationPath =
  "supabase/migrations/20260519022000_simulador_analytics_compliance_rubric_freeze_022.sql";
const codePath = "lib/simulador/analytics.ts";

function read(path) {
  return readFileSync(path, "utf8");
}

function extractSqlEvents(sql) {
  const valuesBlock = sql.match(
    /insert into simulador\.analytics_events_catalog[\s\S]*?values([\s\S]*?)on conflict/u,
  )?.[1];
  if (!valuesBlock) {
    throw new Error("Could not find analytics_events_catalog seed values.");
  }
  const matches = [...valuesBlock.matchAll(/\('([a-z0-9_]+)',\s*'[^']+',/gu)];
  return new Set(matches.map((match) => match[1]));
}

function extractTsEvents(source) {
  const arrayMatch = source.match(
    /SIMULADOR_ANALYTICS_EVENTS\s*=\s*\[([\s\S]*?)\]\s*as const/u,
  );
  if (!arrayMatch) {
    throw new Error("Could not find SIMULADOR_ANALYTICS_EVENTS array.");
  }
  const matches = [...arrayMatch[1].matchAll(/"([a-z0-9_]+)"/gu)];
  return new Set(matches.map((match) => match[1]));
}

function difference(left, right) {
  return [...left].filter((item) => !right.has(item)).sort();
}

const sqlEvents = extractSqlEvents(read(migrationPath));
const tsEvents = extractTsEvents(read(codePath));

const missingInTs = difference(sqlEvents, tsEvents);
const missingInSql = difference(tsEvents, sqlEvents);

if (missingInTs.length > 0 || missingInSql.length > 0) {
  console.error("Analytics catalog mismatch.");
  if (missingInTs.length > 0) {
    console.error(`Missing in lib/simulador/analytics.ts: ${missingInTs.join(", ")}`);
  }
  if (missingInSql.length > 0) {
    console.error(`Missing in migration 022 seed: ${missingInSql.join(", ")}`);
  }
  process.exit(1);
}

console.log(`Analytics catalog OK (${sqlEvents.size} events).`);
