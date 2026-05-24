import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import { Body, Caption, Display, Headline, Subtitle, Title } from "@/components/ui/Typography";
import {
  caseFactoryArtifacts,
  caseFactoryCriteria,
  caseFactoryDepartments,
  caseFactoryExerciseTypes,
  caseFactoryGoldenCase,
  caseFactoryLevels,
  caseFactoryManagerSignals,
  caseFactoryProfilePacks,
  caseFactoryQualityGates,
  caseFactoryResearchAnchors,
  caseFactoryTargetMix,
  caseFactoryTimePressureModes,
  caseFactoryTools,
} from "@/lib/simulador/case-factory";

export const metadata: Metadata = {
  title: "case lab | Itera",
  description: "Laboratorio interno para revisar el sistema de casos Itera antes de fabricar el lote de 50.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CaseLabPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        <div className="flex flex-col gap-4">
          <Tag variant="primary" className="w-fit">laboratorio sin subscripcion</Tag>
          <div className="max-w-4xl">
            <Display>case factory</Display>
            <Subtitle className="mt-3">
              Sistema para revisar niveles, criterios, taxonomias, herramientas y gates antes de producir 50 casos.
            </Subtitle>
          </div>
          <Caption>
            Ruta no indexada. No es landing ni producto publico; es tablero de trabajo para Pablo, Claude y Codex.
          </Caption>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="casos objetivo" value={`${caseFactoryTargetMix.totalCases}`} />
          <MetricCard label="golden activo" value={`${caseFactoryTargetMix.activeGoldenCases}`} />
          <MetricCard label="perfiles activos" value={`${caseFactoryTargetMix.activeProfilePacks}`} />
          <MetricCard label="mix vigente" value={`${caseFactoryTargetMix.currentPercent}%`} />
        </section>

        <Card variant="primary" padding="lg" className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Caption className="text-white/80">golden case activo</Caption>
            <Title className="mt-2 text-white">{caseFactoryGoldenCase.title}</Title>
            <Body className="mt-3 text-white/90">{caseFactoryGoldenCase.managerQuestion}</Body>
            <Caption className="mt-4 text-white/80">
              Timer: {caseFactoryGoldenCase.timePressure.totalMinutes} min · {caseFactoryGoldenCase.timePressure.managerSignal}
            </Caption>
          </div>
          <div className="flex flex-wrap content-start gap-2">
            <Tag variant="outline">{caseFactoryGoldenCase.level}</Tag>
            {caseFactoryGoldenCase.departments.map((department) => (
              <Tag key={department} variant="outline">{department}</Tag>
            ))}
            {caseFactoryGoldenCase.exerciseTypes.map((exerciseType) => (
              <Tag key={exerciseType} variant="outline">{exerciseType}</Tag>
            ))}
          </div>
        </Card>

        <section className="grid gap-4 lg:grid-cols-3">
          {caseFactoryLevels.map((level) => (
            <Card key={level.id} variant="neutral" padding="lg" className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <Tag variant="neutral">{level.id}</Tag>
                <Caption>{level.targetCases} casos</Caption>
              </div>
              <Title>{level.name}</Title>
              <Body>{level.goal}</Body>
              <div className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-950">
                <Headline className="mb-2">pregunta manager</Headline>
                <Body>{level.managerQuestion}</Body>
              </div>
            </Card>
          ))}
        </section>

        <Card variant="neutral" padding="lg">
          <Headline className="mb-4">perfiles activos</Headline>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {caseFactoryProfilePacks.map((profile) => (
              <div key={profile.id} className="rounded-2xl border-2 border-gray-200 bg-white p-4 dark:border-gray-900 dark:bg-gray-800">
                <Subtitle>{profile.name}</Subtitle>
                <Caption>{profile.buyer}</Caption>
                <Body className="mt-3">{profile.managerQuestion}</Body>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.levels.map((level) => (
                    <Tag key={level} variant="neutral">{level}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="neutral" padding="lg">
          <Headline className="mb-4">tipos de ejercicio contemplados</Headline>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {caseFactoryExerciseTypes.map((exerciseType) => (
              <div key={exerciseType.id} className="rounded-2xl border-2 border-gray-200 bg-white p-4 dark:border-gray-900 dark:bg-gray-800">
                <Subtitle>{exerciseType.name}</Subtitle>
                <Caption>{exerciseType.family}</Caption>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="neutral" padding="lg">
          <Headline className="mb-4">presion temporal</Headline>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {caseFactoryTimePressureModes.map((mode) => (
              <div key={mode.id} className="rounded-2xl border-2 border-gray-200 bg-white p-4 dark:border-gray-900 dark:bg-gray-800">
                <Subtitle>{mode.name}</Subtitle>
                <Caption>{mode.useWhen}</Caption>
              </div>
            ))}
          </div>
        </Card>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card variant="neutral" padding="lg">
            <Headline className="mb-4">criterios evaluables</Headline>
            <div className="grid gap-3">
              {caseFactoryCriteria.map((criterion) => (
                <div key={criterion.id} className="rounded-2xl border-2 border-gray-200 bg-white p-4 dark:border-gray-900 dark:bg-gray-800">
                  <Subtitle>{criterion.name}</Subtitle>
                  <Caption>{criterion.managerSignal}</Caption>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="neutral" padding="lg">
            <Headline className="mb-4">gates de calidad</Headline>
            <div className="flex flex-wrap gap-2">
              {caseFactoryQualityGates.map((gate) => (
                <Tag key={gate} variant="outline">{gate}</Tag>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-gray-100 p-4 dark:bg-gray-950">
              <Subtitle>regla</Subtitle>
              <Body>Si no produce evidencia util para manager, el caso no entra al catalogo.</Body>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card variant="neutral" padding="lg">
            <Headline className="mb-4">departamentos</Headline>
            <div className="flex flex-wrap gap-2">
              {caseFactoryDepartments.map((department) => (
                <Tag key={department} variant="neutral">{department}</Tag>
              ))}
            </div>
          </Card>

          <Card variant="neutral" padding="lg">
            <Headline className="mb-4">herramientas base</Headline>
            <div className="flex flex-wrap gap-2">
              {caseFactoryTools.map((tool) => (
                <Tag key={tool} variant="outline">{tool}</Tag>
              ))}
            </div>
          </Card>

          <Card variant="neutral" padding="lg">
            <Headline className="mb-4">senal manager</Headline>
            <ul className="space-y-2">
              {caseFactoryManagerSignals.map((signal) => (
                <li key={signal} className="text-base text-ink dark:text-gray-300">• {signal}</li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card variant="neutral" padding="lg">
            <Headline className="mb-4">artefactos creados</Headline>
            <div className="grid gap-2 sm:grid-cols-2">
              {caseFactoryArtifacts.map((artifact) => (
                <div key={artifact} className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-ink dark:bg-gray-950 dark:text-gray-300">
                  {artifact}
                </div>
              ))}
            </div>
          </Card>

          <Card variant="neutral" padding="lg">
            <Headline className="mb-4">fundamento externo</Headline>
            <div className="grid gap-3">
              {caseFactoryResearchAnchors.map((anchor) => (
                <div key={anchor.source} className="rounded-2xl border-2 border-gray-200 bg-white p-4 dark:border-gray-900 dark:bg-gray-800">
                  <Subtitle>{anchor.source}</Subtitle>
                  <Caption>{anchor.signal}</Caption>
                </div>
              ))}
            </div>
          </Card>
        </section>
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
