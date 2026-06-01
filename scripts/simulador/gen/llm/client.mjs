// Cliente LLM para el generador de casos · dual-proveedor.
//
// Realidad del entorno (probada): la llave de Anthropic en .env.local esta
// invalida y DeepSeek/Gemini no responden; OpenAI si autentica y soporta
// function calling. Por eso el primario es OpenAI, con Anthropic disponible para
// cuando se refresque la llave (mismo patron que lib/simulador/judge/run.ts).
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
// SIMULADOR_LLM_PROVIDER = openai | anthropic (default: auto -> openai si hay
// OPENAI_API_KEY, si no anthropic).
export function resolveProvider(explicit) {
  loadEnv();
  const want = explicit ?? process.env.SIMULADOR_LLM_PROVIDER ?? "auto";
  if (want === "openai" || want === "anthropic") return want;
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  throw new Error(
    "No hay proveedor LLM: configura OPENAI_API_KEY o ANTHROPIC_API_KEY en .env.local.",
  );
}

export function defaultModel(provider, role = "casegen") {
  // role: casegen | judge. El juez usa un modelo (idealmente) distinto al
  // generador para no auto-aprobarse.
  if (role === "judge") {
    if (process.env.SIMULADOR_NARRATIVE_JUDGE_MODEL)
      return process.env.SIMULADOR_NARRATIVE_JUDGE_MODEL;
    return provider === "openai" ? "gpt-4o" : "claude-sonnet-4-5";
  }
  if (process.env.SIMULADOR_CASEGEN_MODEL)
    return process.env.SIMULADOR_CASEGEN_MODEL;
  return provider === "openai" ? "gpt-4o" : "claude-opus-4-5";
}

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function isTransient(message) {
  return /overloaded|rate.?limit|timeout|ETIMEDOUT|ECONNRESET|\b(429|500|502|503|529)\b|internal/i.test(
    message,
  );
}

// ---- OpenAI (fetch, function calling) ----
async function callOpenAi(systemPrompt, userPrompt, toolSchema, opts) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY no configurada.");
  const model = opts.model ?? defaultModel("openai", opts.role);
  const body = {
    model,
    max_tokens: opts.maxTokens ?? 16000,
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
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
    const err = new Error(`OpenAI ${res.status}: ${m}`);
    err.status = res.status;
    throw err;
  }
  const call = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) {
    throw new Error(
      `OpenAI no devolvio function_call (finish_reason: ${json.choices?.[0]?.finish_reason})`,
    );
  }
  let value;
  try {
    value = JSON.parse(call.function.arguments);
  } catch {
    throw new Error("OpenAI: arguments no es JSON valido");
  }
  return { value, model, provider: "openai", usage: json.usage ?? {} };
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
  const impl = provider === "openai" ? callOpenAi : callAnthropic;
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await impl(systemPrompt, userPrompt, toolSchema, opts);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (isTransient(msg) && attempt < retries) {
        const backoff = 1000 * 2 ** attempt;
        console.warn(
          `[casegen/client] transitorio (${msg.slice(0, 80)}); reintento en ${backoff}ms`,
        );
        await sleep(backoff);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
