import type { Metadata } from "next";
import {
  AppleBadge,
  AppleCard,
  AppleCardBody,
  AppleIcon,
  AppleProgress,
} from "@/components/simulador/apple";
import {
  exerciseBlockFamilies,
  exerciseBlocks,
  exerciseBlockStats,
  type ExerciseBlockDemo,
  type ExerciseBlockFamily,
} from "@/lib/simulador/exercise-blocks";

export const metadata: Metadata = {
  title: "exercise lab | Itera",
  description: "Catalogo interno de bloques de ejercicio para simulaciones Itera.",
  robots: {
    index: false,
    follow: false,
  },
};

const familyLabels: Record<ExerciseBlockFamily, string> = {
  ai_native: "IA-native",
  complementary: "complementario",
  mode: "modo",
};

const familyTone: Record<ExerciseBlockFamily, "accent" | "neutral" | "warning"> = {
  ai_native: "neutral",
  complementary: "neutral",
  mode: "warning",
};

const familyIcon: Record<ExerciseBlockFamily, "sparkles" | "fileText" | "clock"> = {
  ai_native: "sparkles",
  complementary: "fileText",
  mode: "clock",
};

const ratioLabel: Record<ExerciseBlockDemo["ratio"], string> = {
  "ai-native": "IA-native",
  complementario: "complementario",
  transversal: "transversal",
};

const groupedBlocks = exerciseBlockFamilies.map((family) => ({
  ...family,
  blocks: exerciseBlocks.filter((block) => block.family === family.id),
}));

export default function ExerciseLabPage() {
  return (
    <main className="simulador-root min-h-screen surface-canvas">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        <header className="grid gap-8 lg:grid-cols-[0.95fr_0.55fr] lg:items-end">
          <div className="max-w-4xl">
            <AppleBadge tone="neutral">laboratorio interno</AppleBadge>
            <h1 className="display mt-5 text-[3rem] leading-[1.02] md:text-[4.5rem]">
              Bloques de ejercicio.
            </h1>
            <p className="mt-5 max-w-[62ch] text-[1.0625rem] leading-7 text-[var(--text-secondary)]">
              Catálogo cerrado de interacciones para construir casos con creatividad, sin inventar mecánicas desde cero ni perder calidad evaluable.
            </p>
          </div>

          <AppleCard variant="elevated" padding="lg" className="border-[var(--border)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
                  mix recomendado
                </p>
                <h2 className="mt-2 text-[1.375rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
                  70 / 30
                </h2>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <AppleIcon name="sparkles" />
              </span>
            </div>
            <div className="mt-6 grid gap-4">
              <ProgressMetric label="IA-native" value={70} />
              <ProgressMetric label="complementario" value={30} />
            </div>
          </AppleCard>
        </header>

        <section aria-label="Resumen" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="bloques v1" value={`${exerciseBlockStats.total}`} />
          <MetricCard label="IA-native" value={`${exerciseBlockStats.aiNative}`} />
          <MetricCard label="complementarios" value={`${exerciseBlockStats.complementary}`} />
          <MetricCard label="modo transversal" value={`${exerciseBlockStats.modes}`} />
        </section>

        <AppleCard variant="default" padding="lg" className="border-[var(--border)] bg-[var(--surface-2)]">
          <div className="grid gap-6 lg:grid-cols-[0.4fr_1fr] lg:items-center">
            <div>
              <p className="text-[0.8125rem] font-medium uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                regla
              </p>
              <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
                Creatividad sin caos.
              </h2>
            </div>
            <p className="max-w-[72ch] text-[1rem] leading-7 text-[var(--text-secondary)]">
              Cada bloque define acción del usuario, señal para manager, dimensiones evaluadas y evidencia emitida. Un caso premium puede tener muchas interacciones, pero todas deben salir de este catálogo.
            </p>
          </div>
        </AppleCard>

        <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-6">
            <AppleCard variant="default" padding="md" className="border-[var(--border)]">
              <nav aria-label="Familias de ejercicios" className="grid gap-2">
                {groupedBlocks.map((family) => (
                  <a
                    key={family.id}
                    href={`#${family.id}`}
                    className="flex min-h-11 items-center justify-between rounded-[var(--radius-sm)] px-3 text-[0.9375rem] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                  >
                    <span>{family.name}</span>
                    <span className="text-[0.8125rem] text-[var(--text-tertiary)]">
                      {family.blocks.length}
                    </span>
                  </a>
                ))}
              </nav>
            </AppleCard>
          </aside>

          <div className="flex min-w-0 flex-col gap-12">
            {groupedBlocks.map((family) => (
              <section key={family.id} id={family.id} className="scroll-mt-8">
                <div className="mb-4 grid gap-3 md:grid-cols-[0.45fr_1fr] md:items-end">
                  <div>
                    <p className="text-[0.8125rem] font-medium uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                      {family.name}
                    </p>
                    <h2 className="mt-1 text-[1.75rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
                      {family.blocks.length} bloques
                    </h2>
                  </div>
                  <p className="max-w-[64ch] text-[1rem] leading-7 text-[var(--text-secondary)]">
                    {family.description}
                  </p>
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  {family.blocks.map((block) => (
                    <ExerciseDemoCard key={block.id} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <AppleCard variant="default" padding="md" className="border-[var(--border)]">
      <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">{label}</p>
      <div className="mt-3 text-[2rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
        {value}
      </div>
    </AppleCard>
  );
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-[0.875rem] text-[var(--text-secondary)]">{label}</span>
        <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{value}%</span>
      </div>
      <AppleProgress aria-label={label} value={value} />
    </div>
  );
}

function ExerciseDemoCard({ block }: { block: ExerciseBlockDemo }) {
  return (
    <AppleCard variant="default" padding="none" className="h-full border-[var(--border)]">
      <AppleCardBody className="flex h-full flex-col gap-5 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <AppleBadge tone={familyTone[block.family]}>{familyLabels[block.family]}</AppleBadge>
          {block.levels.map((level) => (
            <AppleBadge key={level} tone="neutral">{level}</AppleBadge>
          ))}
        </div>

        <div>
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-2)] text-[var(--text-secondary)]">
              <AppleIcon name={familyIcon[block.family]} size="sm" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[1.25rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
                {block.name}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-6 text-[var(--text-secondary)]">
                {block.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <InfoPanel label="acción usuario" value={block.userAction} />
          <InfoPanel label="señal manager" value={block.managerSignal} />
        </div>

        <DemoSurface block={block} />

        <div className="mt-auto flex flex-wrap gap-2">
          {block.measures.map((measure) => (
            <AppleBadge key={measure} tone="neutral">{measure}</AppleBadge>
          ))}
        </div>
      </AppleCardBody>
    </AppleCard>
  );
}

function InfoPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
      <p className="text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className="mt-2 text-[0.875rem] leading-5 text-[var(--text-secondary)]">{value}</p>
    </div>
  );
}

function DemoSurface({ block }: { block: ExerciseBlockDemo }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.8125rem] text-[var(--text-tertiary)]">{block.demo.eyebrow}</p>
          <h4 className="mt-1 text-[1rem] font-semibold tracking-[-0.011em] text-[var(--text-primary)]">
            {block.demo.title}
          </h4>
        </div>
        <AppleBadge tone="neutral">{ratioLabel[block.ratio]}</AppleBadge>
      </div>
      <p className="mt-4 text-[0.9375rem] leading-6 text-[var(--text-secondary)]">
        {block.demo.primary}
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {block.demo.items.map((item, index) => (
          <div
            key={`${block.id}-${item}`}
            className="rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2"
          >
            <p className="text-[0.75rem] text-[var(--text-tertiary)]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 text-[0.875rem] leading-5 text-[var(--text-primary)]">{item}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-3 py-2">
        <p className="text-[0.8125rem] leading-5 text-[var(--accent)]">{block.demo.footer}</p>
      </div>
    </div>
  );
}
