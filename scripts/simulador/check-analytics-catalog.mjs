#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = "supabase/migrations";
const codePath = "lib/simulador/analytics.ts";

function read(path) {
  return readFileSync(path, "utf8");
}

function extractSqlEvents(sql) {
  const events = new Set();
  const insertBlocks = sql.matchAll(
    /insert into simulador\.analytics_events_catalog[\s\S]*?values([\s\S]*?)on conflict/gu,
  );
  for (const block of insertBlocks) {
    const matches = [...block[1].matchAll(/\('([a-z0-9_]+)',\s*'[^']+',/gu)];
    for (const match of matches) events.add(match[1]);
  }
  return events;
}

function extractAllSqlEvents() {
  const events = new Set();
  for (const file of readdirSync(migrationsDir).filter((item) =>
    item.endsWith(".sql"),
  )) {
    const fileEvents = extractSqlEvents(read(join(migrationsDir, file)));
    for (const event of fileEvents) events.add(event);
  }
  if (events.size === 0) {
    throw new Error("Could not find analytics_events_catalog seed values.");
  }
  return events;
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

const sqlEvents = extractAllSqlEvents();
const tsEvents = extractTsEvents(read(codePath));

const missingInTs = difference(sqlEvents, tsEvents);
const missingInSql = difference(tsEvents, sqlEvents);

if (missingInTs.length > 0 || missingInSql.length > 0) {
  console.error("Analytics catalog mismatch.");
  if (missingInTs.length > 0) {
    console.error(`Missing in lib/simulador/analytics.ts: ${missingInTs.join(", ")}`);
  }
  if (missingInSql.length > 0) {
    console.error(`Missing in analytics catalog migrations: ${missingInSql.join(", ")}`);
  }
  process.exit(1);
}

console.log(`Analytics catalog OK (${sqlEvents.size} events).`);
