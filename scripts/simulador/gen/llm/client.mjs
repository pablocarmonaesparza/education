// Cliente LLM para el generador de casos · dual-proveedor.
//
// Realidad del entorno (re-probada 2026-07-23): OpenAI devuelve 429 "account is
// not active" (billing) y la llave de Anthropic da 401; DeepSeek SI autentica y
// soporta function calling forzado (deepseek-chat). Por eso hay tres proveedores:
// openai | anthropic | deepseek (OpenAI-compatible). El auto sigue prefiriendo
// OpenAI/Anthropic para cuando Pablo refresque llaves; mientras tanto se corre
// con SIMULADOR_LLM_PROVIDER=deepseek.
//
// Interfaz neutral: callTool(systemPrompt, userPrompt, toolSchema, opts) donde
// toolSchema = { name, description, schema } (schema = JSON Schema del objeto a
// devolver). Se fuerza la llamada a la herramienta y se devuelve el objeto
// `value` ya parseado. La validacion fuerte de conteos/enums la hacen los gates
// deterministas aguas abajo; aqui solo forzamos la FORMA.
//
// Decision (del plan): el generador NO mockea. Sin proveedor valido lanza error.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// ---- Carga de env (mismo patron que scripts/simulador/seed-utils.mjs) ----
let envLoaded = false;
export function loadEnv() {
  if (envLoaded) return;
  envLoaded = true;
  const root = process.cwd();
  for (const file of [".env.local", ".env"]) {
    try {
      const content = fs.readFileSync(path.join(root, file), "utf8");
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
      // env files opcionales
    }
  }
}

// ---- Seleccion de proveedor ----
// SIMULADOR_LLM_PROVIDER = openai | anthropic | deepseek (default: auto ->
// openai si hay OPENAI_API_KEY, si no anthropic, si no deepseek).
export function resolveProvider(explicit) {
  loadEnv();
  const want = explicit ?? process.env.SIMULADOR_LLM_PROVIDER ?? "auto";
  if (want === "openai" || want === "anthropic" || want === "deepseek")
    return want;
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";
  throw new Error(
    "No hay proveedor LLM: configura OPENAI_API_KEY, ANTHROPIC_API_KEY o DEEPSEEK_API_KEY en .env.local.",
  );
}

export function defaultModel(provider, role = "casegen") {
  // role: casegen | judge. El juez usa un modelo (idealmente) distinto al
  // generador para no auto-aprobarse.
  if (role === "judge") {
    if (process.env.SIMULADOR_NARRATIVE_JUDGE_MODEL)
      return process.env.SIMULADOR_NARRATIVE_JUDGE_MODEL;
    if (provider === "deepseek") return "deepseek-chat";
    return provider === "openai" ? "gpt-4o" : "claude-sonnet-4-5";
  }
  if (process.env.SIMULADOR_CASEGEN_MODEL)
    return process.env.SIMULADOR_CASEGEN_MODEL;
  if (provider === "deepseek") return "deepseek-chat";
  return provider === "openai" ? "gpt-4o" : "claude-opus-4-5";
}

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function isTransient(message) {
  // "arguments no es JSON valido" y "no devolvio function_call" tambien son
  // reintentables: con temperature > 0 el reintento diverge (visto en S8:
  // DeepSeek trunco una seccion de P4 cerca de su tope de 8192 tokens y el
  // JSON quedo invalido; el mismo call reintentado paso).
  return /overloaded|rate.?limit|timeout|ETIMEDOUT|ECONNRESET|\b(429|500|502|503|529)\b|internal|arguments no es JSON valido|no devolvio function_call/i.test(
    message,
  );
}

// ---- OpenAI-compatible (fetch, function calling) · OpenAI y DeepSeek ----
// DeepSeek expone la misma API de chat/completions con function calling
// (verificado 2026-07-23); solo cambian base URL, llave y tope de max_tokens
// (deepseek-chat acepta max 8192 de salida).
const OPENAI_COMPAT = {
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    keyEnv: "OPENAI_API_KEY",
    maxOutput: Infinity,
  },
  deepseek: {
    url: "https://api.deepseek.com/chat/completions",
    keyEnv: "DEEPSEEK_API_KEY",
    maxOutput: 8192,
  },
};

async function callOpenAiCompatible(
  providerName,
  systemPrompt,
  userPrompt,
  toolSchema,
  opts,
) {
  const conf = OPENAI_COMPAT[providerName];
  const apiKey = process.env[conf.keyEnv];
  if (!apiKey) throw new Error(`${conf.keyEnv} no configurada.`);
  const model = opts.model ?? defaultModel(providerName, opts.role);
  const body = {
    model,
    max_tokens: Math.min(opts.maxTokens ?? 16000, conf.maxOutput),
    temperature: opts.temperature ?? 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: toolSchema.name,
          description: toolSchema.description,
          parameters: toolSchema.schema,
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: toolSchema.name },
    },
  };
  const res = await fetch(conf.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    const m = json?.error?.message ?? `HTTP ${res.status}`;
    const err = new Error(`${providerName} ${res.status}: ${m}`);
    err.status = res.status;
    throw err;
  }
  const call = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) {
    throw new Error(
      `${providerName} no devolvio function_call (finish_reason: ${json.choices?.[0]?.finish_reason})`,
    );
  }
  let value;
  try {
    value = JSON.parse(call.function.arguments);
  } catch {
    // Deja evidencia del payload invalido para diagnostico (truncamiento vs
    // formato). Ruta configurable; default junto al proceso.
    try {
      const dumpDir = process.env.SIMULADOR_LLM_DEBUG_DIR;
      if (dumpDir) {
        fs.mkdirSync(dumpDir, { recursive: true });
        fs.writeFileSync(
          path.join(dumpDir, `bad-arguments-${Date.now()}.txt`),
          String(call.function.arguments),
        );
      }
    } catch {
      // el dump es best-effort
    }
    throw new Error(`${providerName}: arguments no es JSON valido`);
  }
  return { value, model, provider: providerName, usage: json.usage ?? {} };
}

// ---- Anthropic (SDK, tool_use) · para cuando se refresque la llave ----
async function callAnthropic(systemPrompt, userPrompt, toolSchema, opts) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY no configurada.");
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });
  const model = opts.model ?? defaultModel("anthropic", opts.role);
  const response = await client.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 16000,
    temperature: opts.temperature ?? 0,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    tools: [
      {
        name: toolSchema.name,
        description: toolSchema.description,
        input_schema: toolSchema.schema,
      },
    ],
    tool_choice: { type: "tool", name: toolSchema.name },
    stream: false,
  });
  const block = response.content.find((b) => b.type === "tool_use");
  if (!block || block.name !== toolSchema.name) {
    throw new Error(
      `Anthropic no devolvio tool_use (stop_reason: ${response.stop_reason})`,
    );
  }
  return {
    value: block.input,
    model,
    provider: "anthropic",
    usage: response.usage ?? {},
  };
}

/**
 * Fuerza salida estructurada contra toolSchema y devuelve { value, model,
 * provider, usage }. Reintenta ante errores transitorios.
 *
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {{name:string, description:string, schema:object}} toolSchema
 * @param {{provider?:string, model?:string, role?:string, temperature?:number, maxTokens?:number, retries?:number}} [opts]
 */
export async function callTool(systemPrompt, userPrompt, toolSchema, opts = {}) {
  const provider = resolveProvider(opts.provider);
  const retries = opts.retries ?? 3;
  const impl =
    provider === "anthropic"
      ? callAnthropic
      : (sys, usr, schema, o) =>
          callOpenAiCompatible(provider, sys, usr, schema, o);
  let lastErr;
  // Nudge de compresión: cuando el JSON de arguments llega inválido, la causa
  // dominante con deepseek-chat es TRUNCAMIENTO (tope de 8192 tokens de
  // salida) — y con contenido largo el reintento idéntico trunca igual 4/4
  // veces (visto en S8: harborview/ridgeline). A partir del primer fallo de
  // parseo, los reintentos van con una orden explícita de compresión: mismo
  // schema, cuerpos más cortos. Con eso el retry diverge de verdad.
  let compressNudge = false;
  const COMPRESS_NUDGE =
    "\n\nIMPORTANT: your previous response exceeded the output token limit and was cut off mid-JSON. Produce the SAME structure with every required field, but compress aggressively: slide bodies under 55 words, no filler sentences, no repeated context. Shorter is safer.";
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const sys = compressNudge ? systemPrompt + COMPRESS_NUDGE : systemPrompt;
      return await impl(sys, userPrompt, toolSchema, opts);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (isTransient(msg) && attempt < retries) {
        if (/arguments no es JSON valido/i.test(msg)) compressNudge = true;
        const backoff = 1000 * 2 ** attempt;
        console.warn(
          `[casegen/client] transitorio (${msg.slice(0, 80)}); reintento en ${backoff}ms${compressNudge ? " (con nudge de compresión)" : ""}`,
        );
        await sleep(backoff);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
