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
import {
  buildSystemPrompt,
  buildUserPrompt,
  JUDGE_PROMPT_VERSION,
  JUDGE_TOOL_SCHEMA,
} from "./prompt-builder";
import type { JudgeInputContext, JudgeOutput } from "./types";

const DEFAULT_MODEL = process.env.SIMULADOR_JUDGE_MODEL ?? "claude-opus-4-5";
const FALLBACK_MODEL =
  process.env.SIMULADOR_JUDGE_FALLBACK_MODEL ?? "claude-sonnet-4-5";
const MAX_TOKENS = 4096;

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
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY no está definido — el judge no puede correr.",
    );
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(ctx);

  const start = Date.now();
  let model = DEFAULT_MODEL;

  let response: Awaited<ReturnType<typeof client.messages.create>>;
  try {
    response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      tools: [JUDGE_TOOL_SCHEMA],
      tool_choice: { type: "tool", name: JUDGE_TOOL_SCHEMA.name },
    });
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
      response = await client.messages.create({
        model,
        max_tokens: MAX_TOKENS,
        temperature: 0,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        tools: [JUDGE_TOOL_SCHEMA],
        tool_choice: { type: "tool", name: JUDGE_TOOL_SCHEMA.name },
      });
    } else {
      throw err;
    }
  }

  const durationMs = Date.now() - start;

  // Extraer el tool_use block. Con tool_choice forzado, debe haber uno.
  const toolBlock = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolBlock || toolBlock.name !== JUDGE_TOOL_SCHEMA.name) {
    throw new Error(
      "Judge no retornó tool_use válido. Stop reason: " + response.stop_reason,
    );
  }

  const output = toolBlock.input as JudgeOutput;
  // Sanity check minimal — el SDK ya valida contra el schema.
  if (!output?.dimensions || output.dimensions.length !== 5) {
    throw new Error(
      "Judge output incompleto: dimensions debe tener exactamente 5 entries.",
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
