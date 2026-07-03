/**
 * GET /api/admin/captacion
 *
 * Lee el pipeline de captación que vive en DuckDB (captacion/prospects.duckdb):
 * prospectos descubiertos de registros públicos (SECOP CO / DENUE MX), su
 * calificación por Claude (score, válido, tamaño) y la señal de presupuesto.
 *
 * DuckDB es un archivo local; se consulta en modo read-only vía el CLI. Si el
 * archivo o el binario no existen (p. ej. en Vercel), degrada a vacío con
 * `available:false` en vez de 500 — el surface muestra el estado vacío.
 *
 * Acceso: solo staff de Itera (requireSimuladorStaff).
 */

import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import path from "node:path";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

const DB_PATH = path.join(process.cwd(), "captacion", "prospects.duckdb");

// El server de Next puede no tener ~/.local/bin en PATH: probamos candidatos.
const DUCKDB_CANDIDATES = [
  "duckdb",
  process.env.HOME ? path.join(process.env.HOME, ".local/bin/duckdb") : null,
  "/opt/homebrew/bin/duckdb",
  "/usr/local/bin/duckdb",
];

// Async + timeout: nunca bloquear el event loop ni esperar a un duckdb colgado.
async function duck<T>(sql: string): Promise<T[]> {
  let lastErr: unknown = null;
  for (const bin of DUCKDB_CANDIDATES) {
    if (!bin) continue;
    try {
      const { stdout } = await execFileAsync(
        bin,
        ["-readonly", "-json", DB_PATH, "-c", sql],
        { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 10_000 },
      );
      const trimmed = stdout.trim();
      return trimmed ? (JSON.parse(trimmed) as T[]) : [];
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("duckdb no disponible");
}

const EMPTY_SUMMARY = {
  total: 0,
  co: 0,
  mx: 0,
  scored: 0,
  valid: 0,
  small: 0,
};

export async function GET() {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  if (!existsSync(DB_PATH)) {
    return NextResponse.json({ available: false, items: [], summary: EMPTY_SUMMARY });
  }

  try {
    const items = await duck(
      `SELECT id, source, country, company_name, region, city, industry,
              size_bucket, signal_value, signal_note, score, qualifies, size_ok, reason,
              (scored_at IS NOT NULL) AS scored
       FROM prospects
       ORDER BY scored DESC, qualifies DESC NULLS LAST, score DESC NULLS LAST,
                signal_value DESC NULLS LAST
       LIMIT 500;`,
    );
    const [summary] = await duck<typeof EMPTY_SUMMARY>(
      `SELECT count(*) AS total,
              count(*) FILTER (WHERE country = 'CO') AS co,
              count(*) FILTER (WHERE country = 'MX') AS mx,
              count(*) FILTER (WHERE scored_at IS NOT NULL) AS scored,
              count(*) FILTER (WHERE qualifies) AS valid,
              count(*) FILTER (WHERE qualifies AND coalesce(size_ok, true)) AS small
       FROM prospects;`,
    );
    return NextResponse.json({
      available: true,
      items,
      summary: summary ?? EMPTY_SUMMARY,
    });
  } catch (err) {
    console.error("[admin/captacion] duckdb read failed", err);
    return NextResponse.json({ available: false, items: [], summary: EMPTY_SUMMARY });
  }
}
