#!/usr/bin/env node
// captacion/qualify.mjs — califica prospectos de DuckDB con Claude (Haiku, centavos).
// Lee los no calificados, pide a Claude score + si es prospecto válido + si es
// "negocio pequeño", y escribe el resultado de vuelta en la misma base DuckDB.
//
//   node captacion/qualify.mjs [limit]
//
// Requiere ANTHROPIC_API_KEY (en el entorno o en .env.local).

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DB = process.env.CAPTACION_DB || "captacion/prospects.duckdb";
const LIMIT = Number(process.argv[2] || 20);
const MODEL = "claude-haiku-4-5-20251001"; // barato y rápido para scoring por lote
const BATCH = 10;
const SCORES = "captacion/.scores.json";

// --- API key: entorno o .env.local ---
function getKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  if (existsSync(".env.local")) {
    const m = readFileSync(".env.local", "utf8").match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}
const KEY = getKey();
if (!KEY) {
  console.error("Falta ANTHROPIC_API_KEY (en entorno o .env.local). No se puede calificar.");
  process.exit(1);
}

function duck(sql, json = false) {
  const args = [DB, ...(json ? ["-json"] : []), "-c", sql];
  return execFileSync("duckdb", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

const PROMPT_SISTEMA = `Eres el filtro de prospectos de Itera.
Itera vende un diagnóstico (~$4,000-8,000 USD) que mide con qué CRITERIO un equipo usa IA en su trabajo real.
Comprador ideal: empresa PEQUEÑA (20-80 empleados) en México o Colombia, con un equipo de conocimiento que ya usa IA
(marketing, growth, operaciones, ventas, servicio al cliente). Industrias buenas: servicios profesionales, tecnología/SaaS,
agencias/marketing, ecommerce, consultoría, finanzas.
DESCARTA (qualifies=false): personas naturales/individuos, juntas de acción comunal (JAC), entidades de gobierno,
empresas claramente grandes (>150 empleados), y giros sin equipo de conocimiento (construcción de obra, transporte,
agro, minería, ferreterías, abarrotes) salvo señal clara de área corporativa.
size_ok=true solo si parece negocio pequeño (ni micro de 1-3 personas, ni grande >150).
Responde SOLO con un arreglo JSON, un objeto por prospecto, en el MISMO orden, con esta forma exacta:
[{"id":"<id>","score":<0-100>,"qualifies":<true|false>,"size_ok":<true|false>,"reason":"<1 línea en español>"}]`;

async function calificarLote(rows) {
  const lista = rows.map((r, i) => `${i + 1}. id=${r.id} | ${r.company_name} | ${r.country} ${r.region || ""} ${r.city || ""} | giro: ${r.industry || "?"} | tamaño: ${r.size_bucket || "?"} | señal: ${r.signal_note || "?"} ${r.signal_value ? "($" + r.signal_value + ")" : ""}`).join("\n");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: PROMPT_SISTEMA,
      messages: [{ role: "user", content: `Califica estos prospectos:\n${lista}` }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const txt = data.content.map((c) => c.text || "").join("");
  const json = txt.slice(txt.indexOf("["), txt.lastIndexOf("]") + 1);
  return JSON.parse(json);
}

// --- main ---
const rows = JSON.parse(duck(`SELECT id, company_name, country, region, city, industry, size_bucket, signal_note, signal_value FROM prospects_sin_calificar LIMIT ${LIMIT}`, true) || "[]");
if (!rows.length) {
  console.log("No hay prospectos sin calificar.");
  process.exit(0);
}
console.log(`Calificando ${rows.length} prospectos con ${MODEL} ...`);

const scored = [];
for (let i = 0; i < rows.length; i += BATCH) {
  const lote = rows.slice(i, i + BATCH);
  try {
    const out = await calificarLote(lote);
    scored.push(...out);
    console.log(`  lote ${i / BATCH + 1}: ${out.length} calificados`);
  } catch (e) {
    console.error(`  lote ${i / BATCH + 1} falló: ${e.message}`);
  }
}

if (!scored.length) { console.error("Nada calificado."); process.exit(1); }

writeFileSync(SCORES, JSON.stringify(scored));
duck(`UPDATE prospects AS p
       SET score = s.score, qualifies = s.qualifies, size_ok = s.size_ok, reason = s.reason, scored_at = now()
       FROM (SELECT * FROM read_json_auto('${SCORES}')) s
       WHERE p.id = s.id;`);

const resumen = duck(`SELECT
    count(*) FILTER (WHERE scored_at IS NOT NULL)              AS calificados,
    count(*) FILTER (WHERE qualifies)                          AS validos,
    count(*) FILTER (WHERE qualifies AND size_ok)              AS pequenos_validos
  FROM prospects;`, true);
console.log("Resumen:", resumen.trim());
