// Datos del módulo educativo de demo · /aprender-demo (dev-only, no indexa).
//
// Pantalla de PRUEBA del segundo motor (educativo). Contenido derivado a mano de
// docs/simulador/educative/example_module_connectors_n1.yaml para validar el
// flujo formativo en el navegador. En producción, el pipeline educativo (E1/E2/E3,
// lane de Codex) generaría esto; aquí está hardcodeado para la demo standalone.
//
// Cada ejercicio activo trae `feedback`: la respuesta de referencia + el porqué.
// El feedback NO se muestra hasta que el participante responde y pulsa Revisar
// (modo formativo: enseña al responder, no mide bajo presión).

import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";

export type DemoSlideKind = "cover" | "reading" | "exercise" | "closing";

export interface RowFeedback {
  id: string;
  correct: string;
  why: string;
}
export interface SegmentFeedback {
  id: string;
  shouldFlag: boolean;
  why: string;
}

export interface DemoSlide {
  id: string;
  kind: DemoSlideKind;
  blockId?: ExerciseBlockId;
  title: string;
  body: string;
  chips?: string[];
  caseContext?: Record<string, unknown>;
  feedback?:
    | { kind: "rows"; rows: RowFeedback[] }
    | { kind: "segments"; segments: SegmentFeedback[] };
}

export interface EducativeModule {
  meta: {
    level: string;
    topic: string;
    toolName: string;
    estimatedMinutes: number;
  };
  seals: { educativoBefore: number; educativoAfter: number; practico: number };
  dimensions: string[];
  slides: DemoSlide[];
}

export const MODULE: EducativeModule = {
  meta: {
    level: "N1 · Fundamentals",
    topic: "Connecting AI to your tools",
    toolName: "AI connectors",
    estimatedMinutes: 8,
  },
  seals: { educativoBefore: 20, educativoAfter: 42, practico: 30 },
  dimensions: [
    "Context",
    "Data handling",
    "AI execution",
    "Verification",
    "Judgment",
    "Impact",
  ],
  slides: [
    {
      id: "portada",
      kind: "cover",
      title: "Connect AI to your work without exposing what you shouldn't",
      body: "AI tools already connect to your email, your Drive, and your customer database. That saves you hours, but it also gives them access to real information. Here you practice what you connect, what you check, and what you leave out.",
      chips: ["N1 · Fundamentals", "For any team", "8 min"],
    },
    {
      id: "explicacion",
      kind: "reading",
      title: "What connectors are and why they change your work",
      body: "**What changed.** AI used to see only what you typed into the chat. Now, with a connector, it can read an entire folder, search your email, or pull data from your customer database in seconds.\n\n**What it can't do.** It does not know what is sensitive and what is not. It connects to whatever you connect it to, and it uses everything it finds. When it summarizes, it sometimes makes up figures or brings back data you never needed.\n\n**Why it matters.** The connector does not decide for you. You choose which source to connect, how much of it to expose, and what to check. That is what you practice now.",
    },
    {
      id: "conectar",
      kind: "exercise",
      blockId: "categorize_rows",
      title: "Decide what you connect AI to",
      body: "You want to prepare an account summary for your meeting. For each source, choose an action.",
      caseContext: {
        actionStyle: "permission",
        actions: [
          { value: "conectar", label: "Connect" },
          { value: "filtrada", label: "Connect filtered" },
          { value: "fuera", label: "Leave out" },
        ],
        rows: [
          { id: "f1", label: "The project folder in Drive (notes and proposals)" },
          { id: "f2", label: "Your customer database with amounts, dates, emails, and phone numbers" },
          { id: "f3", label: "The HR folder with the team's salaries" },
          { id: "f4", label: "A folder shared with an outside vendor" },
        ],
      },
      feedback: {
        kind: "rows",
        rows: [
          { id: "f1", correct: "conectar", why: "This is what you need for the summary, and it holds no sensitive personal data." },
          { id: "f2", correct: "filtrada", why: "AI needs the amounts and the dates, not the emails or the phone numbers. Connect it as a view with no contact fields." },
          { id: "f3", correct: "fuera", why: "It has nothing to do with the meeting and it exposes the team's salaries. For this task, never connect it." },
          { id: "f4", correct: "fuera", why: "It may hold a third party's confidential information. Leave it out unless you confirm you have permission." },
        ],
      },
    },
    {
      id: "revisar",
      kind: "exercise",
      blockId: "ai_output_review",
      title: "The connected AI wrote this summary. Review it",
      body: "Flag anything you would not let through before you take it to the meeting. Tap to flag.",
      caseContext: {
        segments: [
          { id: "s1", text: "The three large accounts grew this quarter.", flagIfMarked: "frase_reutilizable" },
          { id: "s2", text: "The Hartley account closed at $1.2 million USD, 40% above last period.", flagIfMarked: "claim_no_verificado" },
          { id: "s3", text: "Dana Whitfield's contact email is dana.whitfield@example.com and her phone number is on file.", flagIfMarked: "dato_sensible" },
          { id: "s4", text: "Next quarter should focus on mid-size accounts.", flagIfMarked: "frase_reutilizable" },
        ],
      },
      feedback: {
        kind: "segments",
        segments: [
          { id: "s1", shouldFlag: false, why: "General claim you can stand behind. Leave it." },
          { id: "s2", shouldFlag: true, why: "An exact figure you did not calculate. The connector could have misread it. Confirm it against the source." },
          { id: "s3", shouldFlag: true, why: "The connector pulled contact data you never asked for and do not need for the summary." },
          { id: "s4", shouldFlag: false, why: "A general recommendation, not a fact to verify. Leave it." },
        ],
      },
    },
    {
      id: "cierre",
      kind: "closing",
      title: "You practiced with the AI you use today",
      body: "This moved your judgment profile and turned on your upskilling seal. Applied judgment is unchanged: that one is earned on live cases under pressure.",
    },
  ],
};
