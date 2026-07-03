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
    level: "N1 · Fundamentos",
    topic: "Conectar la inteligencia artificial a tus herramientas",
    toolName: "Conectores de inteligencia artificial",
    estimatedMinutes: 8,
  },
  seals: { educativoBefore: 20, educativoAfter: 42, practico: 30 },
  dimensions: [
    "contexto",
    "datos",
    "ejecución con IA",
    "validación",
    "juicio",
    "impacto",
  ],
  slides: [
    {
      id: "portada",
      kind: "cover",
      title: "Conecta la inteligencia artificial a tu trabajo, sin filtrar lo que no debes.",
      body: "Las herramientas de inteligencia artificial ya se conectan a tu correo, tu Drive y tu base de clientes. Eso te ahorra horas, pero también les das acceso a información real. Aquí practicas qué conectas, qué revisas y qué dejas fuera.",
      chips: ["N1 · Fundamentos", "Para cualquier equipo", "8 min"],
    },
    {
      id: "explicacion",
      kind: "reading",
      title: "Qué son los conectores y por qué cambian tu trabajo",
      body: "**Qué cambió.** Antes la inteligencia artificial solo veía lo que escribías en el chat. Ahora, con un conector, puede leer una carpeta entera, buscar en tus correos o sacar datos de tu base de clientes en segundos.\n\n**Qué no puede.** No sabe qué es sensible y qué no. Conecta lo que tú le conectas y usa todo lo que encuentra. Y al resumir, a veces inventa cifras o trae datos que no necesitabas.\n\n**Por qué importa.** El conector no decide por ti. Tú eliges qué fuente conectas, qué parte le dejas ver y qué revisas. Eso es lo que practicas ahora.",
    },
    {
      id: "conectar",
      kind: "exercise",
      blockId: "categorize_rows",
      title: "Decide qué le conectas a la inteligencia artificial.",
      body: "Quieres preparar un resumen de cuentas para tu reunión. Por cada fuente, elige una acción.",
      caseContext: {
        actionStyle: "permission",
        actions: [
          { value: "conectar", label: "Conectar" },
          { value: "filtrada", label: "Conectar filtrada" },
          { value: "fuera", label: "Dejar fuera" },
        ],
        rows: [
          { id: "f1", label: "La carpeta del proyecto en Drive (notas y propuestas)" },
          { id: "f2", label: "Tu base de clientes con montos, fechas, correos y teléfonos" },
          { id: "f3", label: "La carpeta de Recursos Humanos con los sueldos del equipo" },
          { id: "f4", label: "Una carpeta compartida con un proveedor externo" },
        ],
      },
      feedback: {
        kind: "rows",
        rows: [
          { id: "f1", correct: "conectar", why: "Es lo que necesitas para el resumen y no tiene datos personales sensibles." },
          { id: "f2", correct: "filtrada", why: "La inteligencia artificial necesita los montos y las fechas, no los correos ni los teléfonos. Conéctala como una vista sin contacto." },
          { id: "f3", correct: "fuera", why: "No tiene que ver con la reunión y expone sueldos del equipo. Para esta tarea, nunca la conectes." },
          { id: "f4", correct: "fuera", why: "Puede tener información confidencial de un tercero. Déjala fuera salvo que confirmes que tienes permiso." },
        ],
      },
    },
    {
      id: "revisar",
      kind: "exercise",
      blockId: "ai_output_review",
      title: "La inteligencia artificial conectada armó este resumen. Revísalo.",
      body: "Marca lo que no dejarías pasar antes de llevarlo a la reunión. Toca para marcar.",
      caseContext: {
        segments: [
          { id: "s1", text: "Las tres cuentas grandes crecieron este trimestre.", flagIfMarked: "frase_reutilizable" },
          { id: "s2", text: "La cuenta Robles cerró en 1.2 millones, un 40% más que el periodo pasado.", flagIfMarked: "claim_no_verificado" },
          { id: "s3", text: "El correo de contacto de Renata es renata.gomez@correo.com y su teléfono está en la ficha.", flagIfMarked: "dato_sensible" },
          { id: "s4", text: "Conviene enfocar el siguiente trimestre en las cuentas medianas.", flagIfMarked: "frase_reutilizable" },
        ],
      },
      feedback: {
        kind: "segments",
        segments: [
          { id: "s1", shouldFlag: false, why: "Afirmación general y sostenible. Déjala." },
          { id: "s2", shouldFlag: true, why: "Cifra exacta que tú no calculaste. El conector pudo leerla mal. Confírmala contra la fuente." },
          { id: "s3", shouldFlag: true, why: "El conector trajo datos de contacto que no pediste ni necesitas para el resumen." },
          { id: "s4", shouldFlag: false, why: "Recomendación general, no un dato que verificar. Déjala." },
        ],
      },
    },
    {
      id: "cierre",
      kind: "closing",
      title: "Practicaste con la inteligencia artificial de hoy.",
      body: "Esto movió tu perfil de criterio y encendió tu sello educativo. El práctico sigue igual: ese se gana con casos reales bajo presión.",
    },
  ],
};
