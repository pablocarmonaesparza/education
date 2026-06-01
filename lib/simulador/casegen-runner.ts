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
  fs.writeFileSync(briefPath, JSON.stringify({ brief }, null, 2));

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
        timeout: opts.timeoutMs ?? 1000 * 60 * 8,
        maxBuffer: 32 * 1024 * 1024,
      },
    );
  } catch {
    // exit != 0 = HUMAN_REVIEW (no pasó en los intentos) o error. Aún así
    // intentamos leer los artefactos para devolver diagnóstico.
  }

  const playablePath = path.join(runDir, "final.playable.json");
  if (fs.existsSync(playablePath)) {
    try {
      const pc = JSON.parse(fs.readFileSync(playablePath, "utf8")) as PlayableCase;
      cleanup(runDir);
      return { ok: true, result: "PASS", playableCase: pc };
    } catch {
      /* cae al diagnóstico */
    }
  }

  // Sin final: HUMAN_REVIEW. Lee el run-record para un diagnóstico legible.
  let diagnostics = "El motor no produjo un caso que pasara todos los gates.";
  try {
    const rec = JSON.parse(
      fs.readFileSync(path.join(runDir, "run-record.json"), "utf8"),
    );
    diagnostics = JSON.stringify(rec.unresolved ?? rec, null, 2).slice(0, 4000);
  } catch {
    /* sin run-record */
  }
  cleanup(runDir);
  return { ok: false, result: "HUMAN_REVIEW", diagnostics };
}

function cleanup(dir: string) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}

/** Construye un brief desde el contexto de onboarding de la empresa. */
export function buildBriefFromContext(input: {
  companyName: string;
  industry?: string | null;
  region?: string | null;
  department?: string | null;
  role?: string | null;
  level?: string | null;
  scenario?: string | null;
}): CaseGenBrief {
  const dept = input.department ?? "operaciones";
  return {
    company: input.companyName,
    industry: input.industry ?? "servicios",
    market: input.region ?? "Latinoamerica",
    participant_role: input.role ?? `Analista de ${cap(dept)}`,
    level: input.level ?? "N1 · Fundamentos",
    scenario:
      input.scenario ??
      `Una persona del area de ${dept} en ${input.companyName} recibe datos sucios y tiene que limpiarlos con criterio, pedirle a la inteligencia artificial un entregable util sin exponer informacion sensible, revisar lo que devuelve y decidir si lanzar, pilotar o pausar.`,
    manager_wants_to_know: `Si esta persona de ${dept} puede trabajar con inteligencia artificial con criterio, sin exponer datos sensibles ni tomar atajos riesgosos.`,
    ai_tool_hint:
      "Un asistente interno aprobado que redacta y ajusta tono; no consulta la base ni envia; puede inventar datos, hay que validar.",
    tools: ["ai", "data", "messaging", "documents"],
  };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
