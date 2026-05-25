"use client";

/**
 * /case-template — plantilla canónica vacía de un caso del simulador.
 *
 * Pablo: "una pagina vacia como template donde vamos a poner los componentes,
 * cuales fijos y cuales variables para terminar de afinar la maquinaria de
 * los casos."
 *
 * Pública (sin auth). Vive en app/case-template/, fuera de (app)/.
 *
 * Estructura:
 *   - Header de caso (FIJO en todos los casos): título, level, profile,
 *     duración, brief del manager
 *   - 6 secciones del runtime canónico (Contexto, Datos, IA, Revisión,
 *     Decisión, Respuesta) — FIJAS en orden y nombre
 *   - Por cada sección: slot vacío con guía de qué bloques canónicos del
 *     YAML aplican ahí (recommended_blocks por nivel del catálogo)
 *   - Footer con manager outcome (FIJO en formato: pilotar/entrenar/pausar/escalar)
 *
 * Lo que es VARIABLE en un caso real:
 *   - Cuántos slides en cada sección (1+)
 *   - Qué bloque específico del catálogo en cada slide
 *   - Contenido del bloque (datos, opciones, prompts)
 *   - Dimensiones evaluadas + risk events detectables
 *   - Variante primary vs resim
 */

import Link from "next/link";
import { exerciseBlocks } from "@/lib/simulador/exercise-blocks.generated";
import type {
  ExerciseBlockRuntimeSection,
  ExerciseBlock,
} from "@/lib/simulador/exercise-blocks.generated";

const SECTIONS: ReadonlyArray<{
  name: ExerciseBlockRuntimeSection;
  purpose: string;
  guidance: string;
}> = [
  {
    name: "Contexto",
    purpose: "Brief inicial del caso",
    guidance:
      "Reading slides + opcional ai_textfield_guided con objetivo/audiencia. Define lo que el participante debe leer antes de actuar.",
  },
  {
    name: "Datos",
    purpose: "Insumos para decidir",
    guidance:
      "data_table_triage es el bloque dominante. Permite ver dataset y clasificar qué entra al modelo (PII, faltante, riesgo).",
  },
  {
    name: "IA",
    purpose: "Interacción con la IA",
    guidance:
      "ai_textfield_free o ai_textfield_guided. Aquí el participante usa la IA con la configuración que armó en Contexto+Datos.",
  },
  {
    name: "Revision",
    purpose: "Revisión del output",
    guidance:
      "ai_output_review (marca claims/PII/tono) o ai_comparison (A vs B). Mide validación + juicio.",
  },
  {
    name: "Decision",
    purpose: "Decisión bajo trade-off",
    guidance:
      "tradeoff_decision_memo, permission_matrix, agent_brief_builder. Forza al usuario a comprometerse con una decisión defendible.",
  },
  {
    name: "Respuesta",
    purpose: "Entrega final + memo",
    guidance:
      "tradeoff_decision_memo (memo al manager). Cierra el loop con una entrega ejecutiva, accionable.",
  },
];

const RECOMMENDED_PER_LEVEL: Record<"N1" | "N2" | "N3", string[]> = {
  N1: ["ai_textfield_free", "ai_textfield_guided", "data_table_triage", "ai_output_review", "tradeoff_decision_memo"],
  N2: ["ai_textfield_guided", "permission_matrix", "workflow_builder", "ai_output_review", "dashboard_pivot", "tradeoff_decision_memo"],
  N3: ["agent_brief_builder", "permission_matrix", "run_log_review", "dashboard_pivot", "tradeoff_decision_memo"],
};

function blocksForSection(section: ExerciseBlockRuntimeSection): ExerciseBlock[] {
  return exerciseBlocks.filter((b) => b.runtimeSections.includes(section));
}

export function CaseTemplateClient() {
  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-10 md:px-10 md:py-14">
        {/* ============ INTRO ============ */}
        <header className="border-b border-[var(--hairline)] pb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="eyebrow text-[var(--text-tertiary)]">case template</p>
              <h1 className="display display-tight mt-2 ts-display-lg text-[var(--text-primary)]">
                Plantilla canónica de un caso Itera.
              </h1>
              <p className="mt-3 max-w-[640px] ts-body-lg leading-[1.55] text-[var(--text-secondary)]">
                6 secciones fijas en orden fijo. Cada sección admite los bloques canónicos del
                catálogo. Lo que cambia entre casos es qué bloque entra a qué sección + el
                contenido específico (datos, prompts, opciones). El shape — el método — es estable.
              </p>
            </div>
            <nav className="flex flex-shrink-0 flex-col gap-2 ts-caption-1">
              <Link href="/exercise-lab" className="text-[var(--accent)] hover:underline">
                ← Exercise lab (11 bloques)
              </Link>
              <Link href="/dev" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                ← /dev
              </Link>
            </nav>
          </div>
        </header>

        {/* ============ HEADER DEL CASO (FIJO) ============ */}
        <Section title="Header del caso" badge="FIJO en todos los casos">
          <p className="ts-subhead text-[var(--text-secondary)]">
            Esta información se muestra en la apertura del caso. Define el contexto laboral
            del participante (rol que asume) y la duración prevista.
          </p>
          <Slot
            fields={[
              { label: "Título del caso", example: "Campaña urgente con datos sensibles" },
              { label: "Level", example: "N1 / N2 / N3" },
              { label: "Profile", example: "marketing_growth / sales_revops / customer_success / …" },
              { label: "Minutos estimados", example: "12-25 minutos" },
              { label: "Empresa ficticia", example: "Loop SaaS B2B (siempre sintética, regla 9)" },
              { label: "Brief para manager", example: "Una línea — qué señal del manager dispara este caso" },
            ]}
          />
        </Section>

        {/* ============ 6 SECCIONES DEL RUNTIME (FIJAS) ============ */}
        <Section
          title="6 secciones del runtime"
          badge="FIJAS · orden y nombre canónicos"
          intro="Cada caso recorre estas 6 secciones en este orden. La metodología vive aquí — no se inventan secciones nuevas."
        >
          <div className="flex flex-col gap-6">
            {SECTIONS.map((section, idx) => (
              <RuntimeSection key={section.name} ordinal={idx + 1} section={section} />
            ))}
          </div>
        </Section>

        {/* ============ MANAGER OUTCOME (FIJO) ============ */}
        <Section title="Manager outcome" badge="FIJO en formato">
          <p className="ts-subhead text-[var(--text-secondary)]">
            Cada caso responde una pregunta clara para el manager. El judge LLM produce
            exactamente una de estas 4 recomendaciones operativas (override matrix del contrato).
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["Pilotar", "Entrenar", "Pausar", "Escalar"] as const).map((rec) => (
              <div
                key={rec}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center ts-callout font-medium text-[var(--text-primary)]"
              >
                {rec}
              </div>
            ))}
          </div>
        </Section>

        {/* ============ QUÉ ES VARIABLE ============ */}
        <Section title="Qué es VARIABLE entre casos">
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { label: "Cantidad de slides por sección", detail: "1 reading + 2 ejercicios o 4 readings + 1 ejercicio — flexible" },
              { label: "Qué bloque del catálogo en cada slide", detail: "Cualquier ID canónico cuyas runtime_sections incluya la sección actual" },
              { label: "Contenido del bloque", detail: "Filas de data_table, opciones de permission_matrix, prompt sugerido, etc." },
              { label: "Dimensiones evaluadas", detail: "Subset de las 6 (contexto/datos/ejecución_ia/validación/juicio/impacto) según los bloques usados" },
              { label: "Risk events detectables", detail: "Hasta 11 risk events del contrato (PII, allucination, etc.)" },
              { label: "Variante primary vs resim", detail: "El caso siempre tiene 2 variantes con misma rúbrica/pesos" },
            ].map((v) => (
              <div
                key={v.label}
                className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-4"
              >
                <div className="ts-callout font-semibold text-[var(--text-primary)]">{v.label}</div>
                <p className="mt-1 ts-subhead leading-[1.5] text-[var(--text-secondary)]">{v.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ============ RECETAS POR NIVEL ============ */}
        <Section
          title="Recetas recomendadas por nivel"
          badge="del YAML canónico · selection_recipes"
        >
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(["N1", "N2", "N3"] as const).map((level) => (
              <div
                key={level}
                className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-4"
              >
                <div className="ts-callout font-semibold text-[var(--text-primary)]">{level}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {RECOMMENDED_PER_LEVEL[level].map((id) => (
                    <span
                      key={id}
                      className="rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-2 py-0.5 ts-caption-1 font-medium text-[var(--accent)]"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ============ FOOTER ============ */}
        <footer className="mt-12 rounded-[var(--radius-lg)] border border-dashed border-[var(--hairline)] bg-[var(--surface-2)] p-6">
          <p className="ts-headline font-semibold text-[var(--text-primary)]">
            Workflow para crear un caso nuevo
          </p>
          <ol className="mt-3 grid list-decimal gap-2 pl-5 ts-subhead leading-[1.55] text-[var(--text-secondary)]">
            <li>Definir Level, Profile, brief del manager + duración estimada.</li>
            <li>
              Por cada una de las 6 secciones: elegir bloques canónicos del catálogo cuya{" "}
              <code className="font-mono ts-footnote">runtime_sections</code> incluya la sección.
            </li>
            <li>
              Por cada bloque: definir contenido específico (datos, opciones, hints). Cumplir
              regla "no-prefill" — el participante construye desde vacío.
            </li>
            <li>
              Declarar dimensiones evaluadas + risk events detectables del contrato.
            </li>
            <li>
              Crear variante resim con misma rúbrica/pesos pero contenido distinto (mide
              transferencia, no memorización).
            </li>
            <li>
              Codificar en{" "}
              <code className="font-mono ts-footnote">docs/simulador/contrato_v0/casos/*.yaml</code>{" "}
              y validar contra calibration set del judge.
            </li>
          </ol>
        </footer>
      </div>
    </main>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function Section({
  title,
  badge,
  intro,
  children,
}: {
  title: string;
  badge?: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-center gap-3">
        <h2 className="ts-title-2 font-semibold text-[var(--text-primary)] tracking-tight">
          {title}
        </h2>
        {badge && (
          <span className="rounded-[var(--radius-sm)] bg-[var(--surface-3)] px-2 py-0.5 ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            {badge}
          </span>
        )}
      </div>
      {intro && (
        <p className="mt-2 max-w-[640px] ts-subhead text-[var(--text-secondary)] leading-[1.5]">
          {intro}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Slot({
  fields,
}: {
  fields: Array<{ label: string; example: string }>;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {fields.map((f) => (
        <div
          key={f.label}
          className="rounded-[var(--radius-md)] border border-dashed border-[var(--hairline)] bg-[var(--surface)] p-3"
        >
          <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            {f.label}
          </div>
          <p className="mt-1 ts-subhead text-[var(--text-secondary)]">{f.example}</p>
        </div>
      ))}
    </div>
  );
}

function RuntimeSection({
  ordinal,
  section,
}: {
  ordinal: number;
  section: { name: ExerciseBlockRuntimeSection; purpose: string; guidance: string };
}) {
  const blocks = blocksForSection(section.name);
  return (
    <article className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)]">
      <header className="flex items-baseline justify-between gap-3 border-b border-[var(--hairline)] bg-[var(--surface-2)] px-5 py-4">
        <div className="flex items-baseline gap-3">
          <span className="ts-caption-1 font-mono tabular-nums text-[var(--text-tertiary)]">
            {String(ordinal).padStart(2, "0")}
          </span>
          <h3 className="ts-headline font-semibold text-[var(--text-primary)]">
            {section.name}
          </h3>
          <span className="ts-caption-1 text-[var(--text-tertiary)]">— {section.purpose}</span>
        </div>
        <span className="ts-caption-1 text-[var(--text-tertiary)]">
          {blocks.length} bloques aplicables
        </span>
      </header>
      <div className="px-5 py-4">
        <p className="ts-subhead leading-[1.5] text-[var(--text-secondary)]">
          {section.guidance}
        </p>

        {/* Slot vacío — placeholder visual del slide */}
        <div className="mt-4 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--hairline)] bg-[var(--surface-2)] px-5 py-10 text-center">
          <p className="ts-callout font-medium text-[var(--text-tertiary)]">
            Slot para 1 o más slides
          </p>
          <p className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">
            Aquí se insertan bloques del catálogo según lo que mida la sección.
          </p>
        </div>

        {/* Bloques aplicables a esta sección */}
        <div className="mt-4">
          <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Bloques canónicos aplicables a {section.name}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {blocks.map((b) => (
              <span
                key={b.id}
                className="rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-2 py-0.5 ts-caption-1 font-medium text-[var(--accent)]"
                title={b.publicName}
              >
                {b.id}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
