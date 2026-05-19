import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import yaml from "js-yaml";

export const ROOT = process.cwd();
export const CONTRACT_DIR = path.join(ROOT, "docs/simulador/contrato_v0");

export function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const content = readFileSync(path.join(ROOT, file), "utf8");
      for (const line of content.split(/\r?\n/u)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/u);
        if (!match) continue;
        const [, key, rawValue] = match;
        if (process.env[key]) continue;
        process.env[key] = rawValue
          .replace(/^['"]|['"]$/gu, "")
          .replace(/\\n/gu, "\n");
      }
    } catch {
      // Optional env files.
    }
  }
}

export function createServiceClient() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).schema("simulador");
}

export function readYamlFile(filePath) {
  return yaml.load(readFileSync(filePath, "utf8"));
}

export function readYamlFiles(dir, rootKey) {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".yaml"))
    .sort()
    .map((file) => {
      const fullPath = path.join(dir, file);
      const parsed = readYamlFile(fullPath);
      if (!parsed?.[rootKey]) {
        throw new Error(`${fullPath} missing root key ${rootKey}`);
      }
      return { file: fullPath, value: parsed[rootKey] };
    });
}

export function templateRefToSlugVersion(ref) {
  const match = String(ref).match(/^(.+)@v(\d+)$/u);
  if (!match) throw new Error(`Invalid template_ref: ${ref}`);
  return { slug: match[1], version: Number(match[2]) };
}

export function toStepKey(id) {
  return typeof id === "number" ? `step_${id}` : String(id);
}

export function difficultyToLevel(difficulty) {
  if (difficulty === "advanced") return 3;
  if (difficulty === "intermediate") return 2;
  return 1;
}

export async function mustSingle(query, label) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  if (!data) throw new Error(`${label}: no row returned`);
  return data;
}

export async function upsertSingle(db, table, row, onConflict, label) {
  return mustSingle(
    db.from(table).upsert(row, { onConflict }).select("id").single(),
    label,
  );
}

export async function deleteWhere(db, table, column, value, label) {
  const { error } = await db.from(table).delete().eq(column, value);
  if (error) throw new Error(`${label}: ${error.message}`);
}

export async function insertMany(db, table, rows, label) {
  if (rows.length === 0) return [];
  const { data, error } = await db.from(table).insert(rows).select("id");
  if (error) throw new Error(`${label}: ${error.message}`);
  return data ?? [];
}

export function asArray(value) {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

export function jsonObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}
