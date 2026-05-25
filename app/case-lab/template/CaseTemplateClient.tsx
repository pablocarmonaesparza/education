"use client";

/**
 * Case template — scaffold vacío con los 11 bloques canónicos.
 *
 * Sin auth (vive fuera de `(app)/`). Sin contenido específico de caso.
 * Sirve para que Pablo (o autor de caso) vea EL SHAPE COMPLETO de los
 * 11 bloques renderizados secuencialmente: qué inputs tienen, cómo se
 * llenan, qué se ve "vacío" (no-prefill), qué viene del payload typeado.
 *
 * Es la herramienta de design-iteration: marca con eyebrow el lab_ref +
 * primary_dimensions del YAML canónico, así puedes diseñar cuál bloque
 * entra a qué sección del caso (Contexto, Datos, IA, Revisión, Decisión,
 * Respuesta).
 *
 * Pablo: "una pantalla igual vacia como template donde vamos a poner los
 * casos estaría muy bueno así podemos ir afinando toda la metodología de
 * los casos."
 */

import Link from "next/link";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import { exerciseBlocks } from "@/lib/simulador/exercise-blocks.generated";

export function CaseTemplateClient() {
  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-10 md:px-10 md:py-14">
        {/* HEADER */}
        <header className="flex items-start justify-between gap-6 border-b border-[var(--hairline)] pb-6">
          <div>
            <p className="eyebrow text-[var(--text-tertiary)]">case template</p>
            <h1 className="display display-tight mt-2 ts-display-lg text-[var(--text-primary)]">
              Scaffold vacío — los 11 bloques canónicos en secuencia.
            </h1>
            <p className="mt-3 max-w-[640px] ts-body-lg leading-[1.55] text-[var(--text-secondary)]">
              Cada sección abajo es un bloque del YAML canónico
              (<code className="font-mono ts-footnote">EXERCISE_BLOCK_CATALOG.yaml</code>),
              renderizado vacío con su shape real. Úsalo para iterar el
              diseño de casos antes de cablear contenido concreto.
            </p>
          </div>
          <nav className="flex flex-shrink-0 flex-col gap-2 ts-caption-1">
            <Link
              href="/case-lab"
              className="text-[var(--accent)] hover:underline"
            >
              ← Case lab (5 demos)
            </Link>
            <Link
              href="/exercise-lab"
              className="text-[var(--accent)] hover:underline"
            >
              ← Exercise lab (catálogo)
            </Link>
            <Link
              href="/dev"
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              ← /dev
            </Link>
          </nav>
        </header>

        {/* META — info del catálogo */}
        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Bloques canónicos" value={String(exerciseBlocks.length)} />
          <Stat
            label="AI-native"
            value={`${exerciseBlocks.filter((b) => b.family === "ai_native").length}/${exerciseBlocks.length}`}
          />
          <Stat label="Versión YAML" value="0.2.0" />
        </section>

        {/* BLOQUES — renderizados secuencialmente, cada uno en su propia card */}
        <section className="mt-10 flex flex-col gap-12">
          {exerciseBlocks.map((block, idx) => (
            <article
              key={block.id}
              className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--hairline)] bg-[var(--surface)]"
            >
              {/* Bloque header — eyebrow + metadata */}
              <header className="border-b border-[var(--hairline)] bg-[var(--surface-2)] px-6 py-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="ts-caption-1 font-mono tabular-nums text-[var(--text-tertiary)]">
                        {String(idx + 1).padStart(2, "0")} · {block.labRef}
                      </span>
                      <span className="rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-2 py-0.5 ts-caption-2 font-semibold uppercase tracking-wider text-[var(--accent)]">
                        {block.family.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h2 className="mt-2 ts-title-3 font-semibold text-[var(--text-primary)]">
                      {block.publicName}
                    </h2>
                    <p className="mt-1 ts-subhead text-[var(--text-secondary)]">
                      <code className="font-mono ts-caption-1 text-[var(--text-tertiary)]">
                        {block.id}
                      </code>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ts-caption-1 text-[var(--text-tertiary)]">
                    <span>
                      Dimensiones:{" "}
                      <span className="text-[var(--text-primary)]">
                        {block.primaryDimensions.join(", ")}
                      </span>
                    </span>
                    <span>
                      Secciones:{" "}
                      <span className="text-[var(--text-primary)]">
                        {block.runtimeSections.join(", ")}
                      </span>
                    </span>
                  </div>
                </div>
              </header>

              {/* Renderer del bloque, modo lab_demo (sin sessionId/autosave) */}
              <div className="p-6">
                <ExerciseBlockRenderer
                  blockId={block.id}
                  sessionId={null}
                  mode="lab_demo"
                  slideId={`template:${block.id}`}
                />
              </div>

              {/* Footer del bloque — emits + completion */}
              <footer className="border-t border-[var(--hairline)] bg-[var(--surface-2)] px-6 py-4">
                <div className="grid grid-cols-1 gap-2 ts-caption-1 sm:grid-cols-2">
                  <div>
                    <span className="font-medium text-[var(--text-secondary)]">
                      Emits:{" "}
                    </span>
                    <span className="font-mono text-[var(--text-tertiary)]">
                      {block.emits.join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-[var(--text-secondary)]">
                      Completion:{" "}
                    </span>
                    <span className="text-[var(--text-tertiary)]">
                      {block.completion}
                    </span>
                  </div>
                </div>
              </footer>
            </article>
          ))}
        </section>

        {/* CIERRE — cómo cablear contenido */}
        <section className="mt-12 rounded-[var(--radius-lg)] border border-dashed border-[var(--hairline)] bg-[var(--surface-2)] p-6">
          <p className="ts-headline font-semibold text-[var(--text-primary)]">
            ¿Cómo cablear un caso real con estos bloques?
          </p>
          <ol className="mt-3 grid list-decimal gap-2 pl-5 ts-subhead leading-[1.55] text-[var(--text-secondary)]">
            <li>
              Diseña la secuencia: qué bloques entran en qué sección
              (Contexto, Datos, IA, Revisión, Decisión, Respuesta) según
              las <code className="font-mono ts-footnote">runtime_sections</code> del catálogo.
            </li>
            <li>
              Por cada slide del caso, declara{" "}
              <code className="font-mono ts-footnote">exercise_block_id</code>
              {" "}en el case_template (
              <code className="font-mono ts-footnote">
                docs/simulador/contrato_v0/casos/*.yaml
              </code>
              ).
            </li>
            <li>
              El runtime productivo (
              <code className="font-mono ts-footnote">
                RuntimeExperience.tsx
              </code>
              ) detecta el campo y delega al{" "}
              <code className="font-mono ts-footnote">
                ExerciseBlockRenderer
              </code>
              {" "}— misma UI que ves arriba, con autosave + judge tipado.
            </li>
            <li>
              Ratio target del YAML: 60-70% AI-native. Hoy el catálogo
              cumple ({exerciseBlocks.filter((b) => b.family === "ai_native").length}
              /{exerciseBlocks.length} ={" "}
              {Math.round(
                (exerciseBlocks.filter((b) => b.family === "ai_native").length /
                  exerciseBlocks.length) *
                  100,
              )}
              %).
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3">
      <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        {label}
      </div>
      <div className="mt-1 ts-title-1 font-semibold tabular-nums text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
}
