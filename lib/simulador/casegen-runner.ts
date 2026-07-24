// Runner del servidor para la generación bespoke de casos por empresa.
//
// Reusa el MOTOR completo (scripts/simulador/gen/generate-case.mjs) vía
// child_process: normaliza el brief, escribe la biblia, el blueprint, los 25
// slides, corre los gates deterministas + el juez narrativo en loop de
// autocorrección, y emite final.playable.json. Aquí lo leemos y devolvemos el
// PlayableCase.
//
// Los pasos de LLM del motor usan la llave del entorno en runtime: en producción
// es la del CLIENTE. (Claude no necesita llave para construir esto; el motor ya
// está probado offline.)
//
// La generación tarda minutos (8+ llamadas de LLM + loop). Para una ruta Node con
// timeout largo funciona; a escala conviene moverlo a un worker/cola.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { PlayableCase } from "@/lib/simulador/cases-registry.generated";

const execFileAsync = promisify(execFile);

export interface CaseGenBrief {
  company: string;
  industry: string;
  market?: string;
  participant_role: string;
  level?: string;
  scenario: string;
  manager_wants_to_know: string;
  ai_tool_hint?: string;
  tools?: string[];
}

export interface CaseGenResult {
  ok: boolean;
  result: "PASS" | "HUMAN_REVIEW" | "ERROR";
  playableCase?: PlayableCase;
  diagnostics?: string;
}

/** Genera un caso desde un brief, corriendo el motor. */
export async function generateCaseFromBrief(
  brief: CaseGenBrief,
  opts: { maxAttempts?: number; timeoutMs?: number } = {},
): Promise<CaseGenResult> {
  const root = process.cwd();
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), "casegen-"));
  // El motor lee el brief con yaml.load; JSON es YAML válido, así evitamos
  // escapes. La forma es { brief: {...} } (igual que los briefs de prueba).
  const briefPath = path.join(runDir, "brief.json");

  try {
    fs.writeFileSync(briefPath, JSON.stringify({ brief }, null, 2));

    // timeout del runner DEBE quedar bajo el maxDuration de la ruta (300s); por
    // defecto 270s. A escala esto va a un worker/cola.
    let execError: (Error & { code?: number; killed?: boolean; stderr?: string }) | null = null;
    try {
      await execFileAsync(
        "node",
        [
          "scripts/simulador/gen/generate-case.mjs",
          briefPath,
          `--out=${runDir}`,
          `--max-attempts=${opts.maxAttempts ?? 3}`,
        ],
        {
          cwd: root,
          timeout: opts.timeoutMs ?? 1000 * 270,
          maxBuffer: 32 * 1024 * 1024,
        },
      );
    } catch (e) {
      execError = e as Error & { code?: number; killed?: boolean; stderr?: string };
    }

    // 1) Éxito: hay final.playable.json.
    const playablePath = path.join(runDir, "final.playable.json");
    if (fs.existsSync(playablePath)) {
      const pc = JSON.parse(fs.readFileSync(playablePath, "utf8")) as PlayableCase;
      return { ok: true, result: "PASS", playableCase: pc };
    }

    // 2) El motor corrió pero no pasó los gates: hay run-record -> HUMAN_REVIEW.
    const recPath = path.join(runDir, "run-record.json");
    if (fs.existsSync(recPath)) {
      let diagnostics = "The engine did not produce a case that passed every gate.";
      try {
        const rec = JSON.parse(fs.readFileSync(recPath, "utf8"));
        diagnostics = JSON.stringify(rec.unresolved ?? rec, null, 2).slice(0, 4000);
      } catch {
        /* run-record ilegible */
      }
      return { ok: false, result: "HUMAN_REVIEW", diagnostics };
    }

    // 3) Sin run-record: fallo de infraestructura (timeout, ENOENT, maxBuffer,
    //    crash del proceso). Es ERROR, no HUMAN_REVIEW.
    const detail = execError
      ? `${execError.killed ? "timeout/killed" : `exit ${execError.code ?? "?"}`}: ${(execError.stderr ?? execError.message ?? "").slice(0, 1500)}`
      : "the engine wrote no artifacts";
    return { ok: false, result: "ERROR", diagnostics: detail };
  } catch (e) {
    return {
      ok: false,
      result: "ERROR",
      diagnostics: e instanceof Error ? e.message : String(e),
    };
  } finally {
    cleanup(runDir);
  }
}

function cleanup(dir: string) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}

/** Construye un brief desde el contexto de onboarding de la empresa.
 * Defaults en ingles US (pivot EEUU 2026-07-15): el motor autora US-native
 * (USD, cast US, marco regulatorio US); el brief entra ya en ingles. */
export function buildBriefFromContext(input: {
  companyName: string;
  industry?: string | null;
  region?: string | null;
  department?: string | null;
  role?: string | null;
  level?: string | null;
  scenario?: string | null;
}): CaseGenBrief {
  const dept = input.department ?? "operations";
  return {
    company: input.companyName,
    industry: input.industry ?? "services",
    market: input.region ?? "United States",
    participant_role: input.role ?? `${cap(dept)} Analyst`,
    level: input.level ?? "N1 · Foundations",
    scenario:
      input.scenario ??
      `Someone on the ${dept} team at ${input.companyName} receives dirty data and has to clean it with judgment, ask the AI tool for a useful deliverable without exposing sensitive information, review what it returns, and decide whether to launch, pilot, or pause.`,
    manager_wants_to_know: `Whether this ${dept} person can work with AI with judgment, without exposing sensitive data or taking risky shortcuts.`,
    ai_tool_hint:
      "An approved internal assistant that drafts and adjusts tone; it does not query the database and does not send; it can make up data, so everything must be verified.",
    tools: ["ai", "data", "messaging", "documents"],
  };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
