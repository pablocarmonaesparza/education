"use client";

/**
 * /motores · consola dev-only de SOLO LECTURA sobre cómo está organizado
 * cada motor de Itera (educativo + operativo). No toca BD ni runtime
 * productivo: lee directo de las mismas fuentes que ya usan las pantallas
 * jugables (module-data.ts del demo educativo, cases-registry.generated.ts
 * del operativo) y del catálogo de bloques para derivar qué dimensión toca
 * cada ejercicio. No revela la rúbrica interna ni respuestas correctas,
 * solo qué dimensiones están en juego por bloque.
 */

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AppleBadge,
  AppleButtonLink,
  AppleCard,
  AppleProgress,
  AppleTabs,
  type AppleTabItem,
} from "@/components/simulador/apple";
import {
  exerciseBlocks,
  type ExerciseBlockDimension,
} from "@/lib/simulador/exercise-blocks.generated";
import {
  PLAYABLE_CASES,
  type PlayableCase,
} from "@/lib/simulador/cases-registry.generated";
import { MODULE, type DemoSlide, type DemoSlideKind } from "../aprender-demo/module-data";

const BLOCK_BY_ID = new Map(exerciseBlocks.map((b) => [b.id, b]));

const DIMENSION_ORDER: ExerciseBlockDimension[] = [
  "contexto",
  "datos",
  "ejecucion_ia",
  "validacion",
  "juicio",
  "impacto",
];

const DIMENSION_LABELS: Record<ExerciseBlockDimension, string> = {
  contexto: "Contexto",
  datos: "Datos",
  ejecucion_ia: "Ejecución con IA",
  validacion: "Validación",
  juicio: "Juicio",
  impacto: "Impacto",
};

const KIND_LABELS: Record<DemoSlideKind, string> = {
  cover: "Portada",
  reading: "Lectura",
  exercise: "Ejercicio",
  closing: "Cierre",
};

// Caso "marketing_dirty_data_relaunch" corre hardcodeado y sin login en
// /case-demo (ver app/case-demo/case-data.generated.ts, CASE_ID coincide).
// El resto se juega con el runtime productivo config-driven en /case/<caso>,
// que requiere el bypass de dev activo (ver /dev) porque vive bajo el layout
// (app).
const PLAY_HREF: Record<string, string> = {
  marketing_dirty_data_relaunch: "/case-demo",
  lumen_reactivacion_citas: "/case/lumen_reactivacion_citas",
  vertiz_backlog_entregas: "/case/vertiz_backlog_entregas",
};

const ASSEMBLED_CASES = Object.values(PLAYABLE_CASES);

function caseMeta(playableCase: PlayableCase) {
  const meta = playableCase.meta as {
    level?: string;
    profile?: string;
    estimated_minutes?: number;
  };
  return meta;
}

function caseOutcome(playableCase: PlayableCase) {
  const outcome = playableCase.managerOutcome as {
    expected_action?: string;
    alternatives?: string[];
  };
  return outcome;
}

function DimensionChips({ dims }: { dims: ExerciseBlockDimension[] }) {
  if (dims.length === 0) {
    return (
      <span className="ts-caption-1 text-[var(--text-tertiary)]">
        sin dimensión directa
      </span>
    );
  }
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {dims.map((d) => (
        <AppleBadge key={d} tone="accent">
          {DIMENSION_LABELS[d]}
        </AppleBadge>
      ))}
    </div>
  );
}

function ModelLegend({
  kind,
  children,
}: {
  kind: "educativo" | "operativo";
  children: ReactNode;
}) {
  return (
    <AppleCard variant="default" padding="lg">
      <div className="eyebrow">Modelo</div>
      <h2 className="ts-title-3 mt-1 font-semibold text-[var(--text-primary)]">
        {kind === "educativo"
          ? "Motor educativo · broadcast, formativo"
          : "Motor operativo · bespoke, bajo presión"}
      </h2>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {DIMENSION_ORDER.map((d) => (
          <AppleBadge key={d} tone="neutral">
            {DIMENSION_LABELS[d]}
          </AppleBadge>
        ))}
      </div>
      <ul className="mt-4 space-y-2">{children}</ul>
    </AppleCard>
  );
}

function LegendItem({ children }: { children: ReactNode }) {
  return (
    <li className="ts-subhead text-[var(--text-secondary)] leading-[1.5]">
      {children}
    </li>
  );
}

function EducativeSlideRow({ slide, index }: { slide: DemoSlide; index: number }) {
  const block = slide.blockId ? BLOCK_BY_ID.get(slide.blockId) : undefined;
  return (
    <li className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className="ts-footnote w-5 text-[var(--text-tertiary)] tabular-nums">
          {index + 1}
        </span>
        <div>
          <div className="ts-callout font-medium text-[var(--text-primary)]">
            {slide.title}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <AppleBadge tone="neutral">{KIND_LABELS[slide.kind]}</AppleBadge>
            {block && <AppleBadge tone="neutral">{block.publicName}</AppleBadge>}
          </div>
        </div>
      </div>
      <div className="shrink-0 pt-0.5">
        <DimensionChips dims={block?.primaryDimensions ?? []} />
      </div>
    </li>
  );
}

function EducativeModuleCard() {
  return (
    <AppleCard variant="default" padding="lg" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <AppleBadge tone="neutral">{MODULE.meta.level}</AppleBadge>
            <AppleBadge tone="success">demo jugable</AppleBadge>
          </div>
          <h3 className="ts-title-3 mt-2 font-semibold text-[var(--text-primary)]">
            {MODULE.meta.toolName}
          </h3>
          <p className="mt-1 ts-subhead text-[var(--text-secondary)]">
            {MODULE.meta.topic} · {MODULE.meta.estimatedMinutes} min ·{" "}
            {MODULE.slides.length} pantallas
          </p>
        </div>
        <AppleButtonLink href="/aprender-demo">Jugar</AppleButtonLink>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="ts-footnote text-[var(--text-tertiary)]">
            Sello educativo
          </div>
          <AppleProgress
            value={MODULE.seals.educativoAfter}
            aria-label="Sello educativo"
            classNames={{ base: "mt-1.5" }}
          />
          <div className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">
            {MODULE.seals.educativoBefore}% → {MODULE.seals.educativoAfter}% al
            completar este módulo
          </div>
        </div>
        <div>
          <div className="ts-footnote text-[var(--text-tertiary)]">
            Sello práctico
          </div>
          <AppleProgress
            value={MODULE.seals.practico}
            aria-label="Sello práctico"
            classNames={{ base: "mt-1.5" }}
          />
          <div className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">
            no se mueve con este módulo, solo con casos reales
          </div>
        </div>
      </div>

      <div>
        <div className="eyebrow">Anatomía</div>
        <ul className="mt-2">
          {MODULE.slides.map((slide, i) => (
            <EducativeSlideRow key={slide.id} slide={slide} index={i} />
          ))}
        </ul>
      </div>
    </AppleCard>
  );
}

function OperativeCaseCard({ playableCase }: { playableCase: PlayableCase }) {
  const [open, setOpen] = useState(false);
  const meta = caseMeta(playableCase);
  const outcome = caseOutcome(playableCase);
  const cover = playableCase.sections[0]?.slides[0];
  const playHref = PLAY_HREF[playableCase.caseId];

  return (
    <AppleCard variant="default" padding="lg" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {meta.level && <AppleBadge tone="neutral">{meta.level}</AppleBadge>}
            {meta.profile && <AppleBadge tone="neutral">{meta.profile}</AppleBadge>}
            <AppleBadge tone="success">ensamblado</AppleBadge>
          </div>
          <h3 className="ts-title-3 mt-2 font-semibold text-[var(--text-primary)]">
            {cover?.title ?? playableCase.caseId}
          </h3>
          <p className="mt-1 ts-footnote font-mono text-[var(--text-tertiary)]">
            {playableCase.caseId}
          </p>
          <p className="mt-2 ts-subhead text-[var(--text-secondary)]">
            {meta.estimated_minutes ?? "—"} min · {playableCase.totalSlides}{" "}
            pantallas · {playableCase.sections.length} secciones
          </p>
        </div>
        {playHref ? (
          <AppleButtonLink href={playHref}>Jugar</AppleButtonLink>
        ) : null}
      </div>

      {outcome.expected_action && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="ts-footnote text-[var(--text-tertiary)]">
            Acción esperada del manager
          </span>
          <AppleBadge tone="accent">{outcome.expected_action}</AppleBadge>
          {(outcome.alternatives ?? []).map((alt) => (
            <AppleBadge key={alt} tone="neutral">
              {alt}
            </AppleBadge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="ts-footnote text-[var(--text-tertiary)]">
          Sello práctico
        </span>
        <AppleBadge tone="accent">se llena al completar este caso</AppleBadge>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ts-subhead text-[var(--text-tertiary)] underline underline-offset-2 transition-colors hover:text-[var(--text-primary)]"
      >
        {open ? "Ocultar anatomía" : "Ver anatomía"}
      </button>

      {open && (
        <div className="space-y-5">
          {playableCase.sections.map((section) => (
            <div key={section.id}>
              <div className="eyebrow">{section.name}</div>
              <ul className="mt-2">
                {section.slides.map((slide, i) => {
                  const block = BLOCK_BY_ID.get(slide.blockId);
                  return (
                    <li
                      key={slide.slideId}
                      className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] py-2.5 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <span className="ts-footnote w-5 text-[var(--text-tertiary)] tabular-nums">
                          {i + 1}
                        </span>
                        <div>
                          <div className="ts-subhead font-medium text-[var(--text-primary)]">
                            {slide.title}
                          </div>
                          <div className="mt-1">
                            <AppleBadge tone="neutral">
                              {block?.publicName ?? slide.blockId}
                            </AppleBadge>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <DimensionChips dims={block?.primaryDimensions ?? []} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </AppleCard>
  );
}

function GoldenCaseStub() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--hairline-strong)] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <AppleBadge tone="warning">contrato_v0 · no ensamblado</AppleBadge>
      </div>
      <h3 className="ts-callout mt-2 font-semibold text-[var(--text-primary)]">
        sales_agent_followup_pipeline
      </h3>
      <p className="mt-1 ts-footnote text-[var(--text-secondary)] leading-[1.5]">
        Caso de referencia (&quot;golden case&quot;) que vive en
        docs/simulador/contrato_v0/casos/, una pista distinta a los tres casos
        ensamblados de abajo. No está en cases-registry.generated.ts todavía,
        así que esta consola no puede mostrar su anatomía ni un botón Jugar
        sin inventar datos.
      </p>
    </div>
  );
}

function EducativeView() {
  return (
    <div className="space-y-8">
      <ModelLegend kind="educativo">
        <LegendItem>
          6 dimensiones canónicas, señal formativa (con ayuda).
        </LegendItem>
        <LegendItem>
          + sello educativo: sube con cada módulo completado, no se llena con
          casos prácticos.
        </LegendItem>
        <LegendItem>
          Formativo: el feedback aparece después de responder, nunca antes.
        </LegendItem>
        <LegendItem>
          Broadcast: un módulo sirve para todas las empresas, no es bespoke.
        </LegendItem>
        <LegendItem>
          Frescura: se dispara con cada update real del mercado de IA.
        </LegendItem>
      </ModelLegend>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="ts-title-3 font-semibold text-[var(--text-primary)]">
            Módulos
          </h2>
          <span className="ts-footnote text-[var(--text-tertiary)]">
            1 módulo
          </span>
        </div>
        <div className="mt-4">
          <EducativeModuleCard />
        </div>
      </div>
    </div>
  );
}

function OperativeView() {
  return (
    <div className="space-y-8">
      <ModelLegend kind="operativo">
        <LegendItem>
          6 dimensiones canónicas, señal comprobada (bajo presión, sin ayuda).
        </LegendItem>
        <LegendItem>
          + sello práctico: marca de confianza sobre las 6 dimensiones, sube
          solo con casos reales.
        </LegendItem>
        <LegendItem>
          Rúbrica: rubric_case_factory_v1 (bandas por dimensión).
        </LegendItem>
        <LegendItem>
          Acciones del manager: pilotar, entrenar, pausar, escalar.
        </LegendItem>
        <LegendItem>
          Bespoke: un caso por empresa, no se reusa entre clientes.
        </LegendItem>
      </ModelLegend>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="ts-title-3 font-semibold text-[var(--text-primary)]">
            Casos
          </h2>
          <span className="ts-footnote text-[var(--text-tertiary)]">
            {ASSEMBLED_CASES.length} ensamblados + 1 fuera de registro
          </span>
        </div>
        <div className="mt-4 space-y-5">
          <GoldenCaseStub />
          {ASSEMBLED_CASES.map((c) => (
            <OperativeCaseCard key={c.caseId} playableCase={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

const TABS: AppleTabItem[] = [
  { id: "educativo", label: "Educativo", badge: 1 },
  { id: "operativo", label: "Operativo", badge: ASSEMBLED_CASES.length },
];

export function MotoresClient() {
  const [tab, setTab] = useState<string>("educativo");

  return (
    <main className="simulador-root min-h-screen surface-canvas px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dev"
          className="ts-subhead text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
        >
          ← /dev
        </Link>

        <h1 className="display display-tight ts-display mt-3 text-[var(--text-primary)]">
          Motores de Itera
        </h1>
        <p className="mt-2 max-w-2xl ts-subhead text-[var(--text-secondary)] leading-[1.5]">
          Cómo está organizado cada motor, en modo lectura. Sin base de datos,
          sin mutaciones; los datos vienen del mismo código que corre las
          pantallas jugables.
        </p>

        <div className="mt-8">
          <AppleTabs
            items={TABS}
            value={tab}
            onChange={setTab}
            ariaLabel="Elegir motor"
          />
        </div>

        <div className="mt-8">
          {tab === "educativo" ? <EducativeView /> : <OperativeView />}
        </div>
      </div>
    </main>
  );
}
