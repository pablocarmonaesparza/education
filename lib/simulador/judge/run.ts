/**
 * Ejecuta el judge LLM contra Anthropic.
 *
 * Single-pass, temperature 0, tool_use forzado al schema `submit_evaluation`.
 *
 * Modelo: env var `SIMULADOR_JUDGE_MODEL` (default a `claude-opus-4-5`). Si la
 * versión no existe en la cuenta API, el cliente devuelve 4xx y caemos al
 * fallback definido en la env var `SIMULADOR_JUDGE_FALLBACK_MODEL`
 * (default `claude-sonnet-4-5`).
 *
 * No persiste nada en BD — eso lo hace el caller (route handler de evaluate).
 * Esta función es side-effect-free salvo por la llamada HTTP al API.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  Message,
  MessageCreateParamsNonStreaming,
  Tool,
  ToolUseBlock,
} from "@anthropic-ai/sdk/resources/messages";
import {
  buildSystemPrompt,
  buildUserPrompt,
  JUDGE_PROMPT_VERSION,
  JUDGE_TOOL_SCHEMA,
} from "./prompt-builder";
import { mockJudgeOutput } from "./mock-output";
import type { JudgeInputContext, JudgeOutput } from "./types";
import { chat } from "@/lib/llm/client";

const DEFAULT_MODEL = process.env.SIMULADOR_JUDGE_MODEL ?? "claude-opus-4-5";
const FALLBACK_MODEL =
  process.env.SIMULADOR_JUDGE_FALLBACK_MODEL ?? "claude-sonnet-4-5";
const MAX_TOKENS = 4096;
const MOCK_MODEL_TAG = "mock_judge_dev";

// R-18 (RULES_LEDGER) + pablo-006: el proveedor primario del judge es una
// DECISIÓN explícita, no un efecto de qué env key exista. Default: Anthropic
// primario (calidad de evaluación), DeepSeek/Gemini como fallback vía
// runOpenAiCompatibleJudge. Cambiar de proveedor = cambiar esta env, y obliga
// a re-correr la calibración antes de evaluar sesiones reales (ver
// docs/simulador/judge_calibration_spec.md).
const JUDGE_PROVIDER = (
  process.env.SIMULADOR_JUDGE_PROVIDER ?? "anthropic"
).toLowerCase();

export interface RunJudgeResult {
  output: JudgeOutput;
  model: string;
  promptVersion: string;
  durationMs: number;
  inputSnapshot: { systemPrompt: string; userPrompt: string };
}

export async function runJudge(
  ctx: JudgeInputContext,
): Promise<RunJudgeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(ctx);

  // Proveedor explícito ≠ anthropic → directo al judge OpenAI-compatible,
  // sin importar qué keys existan (la política es la env, no el entorno).
  if (JUDGE_PROVIDER !== "anthropic") {
    return runOpenAiCompatibleJudge({
      ctx,
      systemPrompt,
      userPrompt,
      reason: `SIMULADOR_JUDGE_PROVIDER=${JUDGE_PROVIDER}`,
    });
  }

  // ── Fallback dev: sin API key + NODE_ENV ≠ production → mock ─────────────
  // Permite testar el flow E2E (submit → report) sin gastar tokens ni
  // configurar la key. En prod sigue fail-closed.
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      return runOpenAiCompatibleJudge({
        ctx,
        systemPrompt,
        userPrompt,
        reason: "ANTHROPIC_API_KEY no configurada",
      });
    }
    console.warn(
      "[judge/run] ANTHROPIC_API_KEY no configurado — usando mock output (dev only).",
    );
    return {
      output: mockJudgeOutput(ctx),
      model: MOCK_MODEL_TAG,
      promptVersion: JUDGE_PROMPT_VERSION,
      durationMs: 50,
      inputSnapshot: { systemPrompt, userPrompt },
    };
  }

  const client = new Anthropic({ apiKey });
  const start = Date.now();
  let model = DEFAULT_MODEL;
  const judgeTool = JUDGE_TOOL_SCHEMA as unknown as Tool;
  const buildParams = (modelName: string): MessageCreateParamsNonStreaming => ({
    model: modelName,
    max_tokens: MAX_TOKENS,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    tools: [judgeTool],
    tool_choice: { type: "tool", name: JUDGE_TOOL_SCHEMA.name },
    stream: false,
  });

  let response: Message;
  try {
    response = await client.messages.create(buildParams(model));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Si el modelo principal no existe / no está habilitado, fallback.
    if (
      msg.includes("model") &&
      (msg.includes("not_found") || msg.includes("does not exist"))
    ) {
      console.warn(
        `[judge/run] modelo ${model} no disponible, fallback a ${FALLBACK_MODEL}`,
      );
      model = FALLBACK_MODEL;
      response = await client.messages.create(buildParams(model));
    } else if (isAnthropicConfigError(msg)) {
      console.warn(
        `[judge/run] Anthropic no disponible (${msg}); usando fallback DeepSeek/Gemini`,
      );
      return runOpenAiCompatibleJudge({
        ctx,
        systemPrompt,
        userPrompt,
        reason: msg,
      });
    } else {
      throw err;
    }
  }

  const durationMs = Date.now() - start;

  // Extraer el tool_use block. Con tool_choice forzado, debe haber uno.
  const toolBlock = response.content.find(
    (block): block is ToolUseBlock => block.type === "tool_use",
  );
  if (!toolBlock || toolBlock.name !== JUDGE_TOOL_SCHEMA.name) {
    throw new Error(
      "Judge no retornó tool_use válido. Stop reason: " + response.stop_reason,
    );
  }

  const output = toolBlock.input as JudgeOutput;
  // Sanity check minimal — el SDK ya valida contra el schema.
  if (!output?.dimensions || output.dimensions.length !== 6) {
    throw new Error(
      "Judge output incompleto: dimensions debe tener exactamente 6 entries.",
    );
  }

  return {
    output,
    model,
    promptVersion: JUDGE_PROMPT_VERSION,
    durationMs,
    inputSnapshot: { systemPrompt, userPrompt },
  };
}

function isAnthropicConfigError(message: string): boolean {
  return /invalid x-api-key|authentication_error|unauthorized|api key|credit balance|permission|not authorized/i.test(
    message,
  );
}

async function runOpenAiCompatibleJudge(input: {
  ctx: JudgeInputContext;
  systemPrompt: string;
  userPrompt: string;
  reason: string;
}): Promise<RunJudgeResult> {
  const start = Date.now();
  const completion = await chat({
    temperature: 0,
    max_tokens: MAX_TOKENS,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          input.systemPrompt,
          "",
          "You have no tool_use available. Return exclusively a valid JSON object",
          "that satisfies this JSON Schema. No markdown, no text outside the JSON.",
          JSON.stringify(JUDGE_TOOL_SCHEMA.input_schema),
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          input.userPrompt,
          "",
          "Return only the submit_evaluation JSON.",
        ].join("\n"),
      },
    ],
  });

  const content =
    "choices" in completion
      ? (completion.choices[0]?.message?.content ?? "").trim()
      : "";
  if (!content) {
    throw new Error("Judge fallback no devolvió contenido.");
  }

  const output = parseJudgeJson(content);
  if (!output?.dimensions || output.dimensions.length !== 6) {
    throw new Error(
      "Judge fallback output incompleto: dimensions debe tener exactamente 6 entries.",
    );
  }

  return {
    output,
    model:
      "model" in completion
        ? `openai_compatible:${completion.model}`
        : "openai_compatible:unknown",
    promptVersion: `${JUDGE_PROMPT_VERSION}/openai-compatible`,
    durationMs: Date.now() - start,
    inputSnapshot: {
      systemPrompt: input.systemPrompt,
      userPrompt: [
        input.userPrompt,
        "",
        `Fallback reason: ${input.reason}`,
      ].join("\n"),
    },
  };
}

function parseJudgeJson(content: string): JudgeOutput {
  const clean = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(clean) as JudgeOutput;
}
