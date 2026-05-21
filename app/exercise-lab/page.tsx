import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import ProgressBar from "@/components/ui/ProgressBar";
import { Body, Caption, Display, Headline, Subtitle, Title } from "@/components/ui/Typography";
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
  ai_native: "AI-native",
  complementary: "complementario",
  mode: "modo",
};

const groupedBlocks = exerciseBlockFamilies.map((family) => ({
  ...family,
  blocks: exerciseBlocks.filter((block) => block.family === family.id),
}));

export default function ExerciseLabPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        <div className="flex flex-col gap-4">
          <Tag variant="primary" className="w-fit">laboratorio interno</Tag>
          <div className="max-w-5xl">
            <Display>exercise blocks</Display>
            <Subtitle className="mt-3">
              Catalogo cerrado de interacciones para construir casos sin inventar mecanicas desde cero.
            </Subtitle>
          </div>
          <Caption>
            Ruta no indexada. Sirve para revisar como se ven y que miden los bloques antes de convertirlos en contrato final.
          </Caption>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="bloques v1" value={`${exerciseBlockStats.total}`} />
          <MetricCard label="AI-native" value={`${exerciseBlockStats.aiNative}`} />
          <MetricCard label="complementarios" value={`${exerciseBlockStats.complementary}`} />
          <MetricCard label="mix objetivo" value={exerciseBlockStats.targetAiNativeRatio} />
        </section>

        <Card variant="primary" padding="lg" className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Caption className="text-white/80">regla de producto</Caption>
            <Title className="mt-2 text-white">creatividad sin caos</Title>
            <Body className="mt-3 text-white/90">
              Cada caso combina bloques preestablecidos. Cada bloque mide dimensiones, emite evidencia y puede ser reutilizado por perfil, nivel y riesgo.
            </Body>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <Headline className="text-white">mix recomendado</Headline>
            <div className="mt-4 grid gap-4">
              <MetricLine label="ejercicios AI-native" value={70} />
              <MetricLine label="ejercicios complementarios" value={30} />
            </div>
          </div>
        </Card>

        {groupedBlocks.map((family) => (
          <section key={family.id} className="flex flex-col gap-4">
            <div className="grid gap-2 md:grid-cols-[0.45fr_1fr] md:items-end">
              <div>
                <Headline>{family.name}</Headline>
                <Title>{family.blocks.length} bloques</Title>
              </div>
              <Body>{family.description}</Body>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {family.blocks.map((block) => (
                <ExerciseDemoCard key={block.id} block={block} />
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="neutral" padding="lg">
      <Caption>{label}</Caption>
      <Title className="mt-2">{value}</Title>
    </Card>
  );
}

function MetricLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <Caption className="text-white/80">{label}</Caption>
        <Caption className="text-white">{value}%</Caption>
      </div>
      <ProgressBar value={value} color="white" trackClassName="bg-white/20" />
    </div>
  );
}

function ExerciseDemoCard({ block }: { block: ExerciseBlockDemo }) {
  return (
    <Card variant="neutral" padding="lg" className="flex h-full flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Tag variant={block.family === "ai_native" ? "primary" : block.family === "mode" ? "warning" : "neutral"}>
          {familyLabels[block.family]}
        </Tag>
        {block.levels.map((level) => (
          <Tag key={level} variant="outline">{level}</Tag>
        ))}
      </div>

      <div>
        <Title>{block.name}</Title>
        <Body className="mt-2">{block.description}</Body>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InfoPanel label="accion usuario" value={block.userAction} />
        <InfoPanel label="senal manager" value={block.managerSignal} />
      </div>

      <DemoSurface block={block} />

      <div className="flex flex-wrap gap-2">
        {block.measures.map((measure) => (
          <Tag key={measure} variant="outline">{measure}</Tag>
        ))}
      </div>
    </Card>
  );
}

function InfoPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-950">
      <Headline>{label}</Headline>
      <Caption className="mt-2 block">{value}</Caption>
    </div>
  );
}

function DemoSurface({ block }: { block: ExerciseBlockDemo }) {
  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 dark:border-gray-900 dark:bg-gray-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Caption>{block.demo.eyebrow}</Caption>
          <Subtitle className="mt-1">{block.demo.title}</Subtitle>
        </div>
        <Tag variant="neutral">{block.ratio}</Tag>
      </div>
      <Body className="mt-4">{block.demo.primary}</Body>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {block.demo.items.map((item, index) => (
          <div
            key={`${block.id}-${item}`}
            className="rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-900 dark:bg-gray-800"
          >
            <Caption>{String(index + 1).padStart(2, "0")}</Caption>
            <Body className="text-sm">{item}</Body>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-primary/10 px-3 py-2">
        <Caption className="text-primary-dark dark:text-primary">{block.demo.footer}</Caption>
      </div>
    </div>
  );
}
