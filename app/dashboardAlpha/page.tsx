import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import SectionHeader from "@/components/ui/SectionHeader";
import { Title, Subtitle, Headline, Body, Caption } from "@/components/ui/Typography";
import Tag from "@/components/ui/Tag";

export const metadata: Metadata = {
  title: "Dashboard preview | Curso Completo",
  description:
    "Preview del dashboard cuando el usuario elige la opción Curso Completo en el onboarding.",
};

/* ───────────────────────────────────────────────────────────
   Preview estático del dashboard "Curso Completo".
   Los nombres de sección y los conteos vienen del catálogo real
   de education_system (2026-04-14, 519 lecciones activas).
   Los títulos destacados son los únicos que ya están tipiados
   en el repo como lecciones Miyagi.
   ─────────────────────────────────────────────────────────── */

type Highlight = {
  id: number;
  lecture: string;
  href?: string;
};

type PhasePreview = {
  section_id: number;
  section: string;
  lessons: number;
  highlights: Highlight[];
};

const PHASES: PhasePreview[] = [
  { section_id: 1,  section: "Introducción",            lessons: 13, highlights: [{ id: 1, lecture: "Bienvenida al curso" }] },
  { section_id: 2,  section: "Fundamentals",            lessons: 14, highlights: [{ id: 14, lecture: "Qué es un LLM" }] },
  { section_id: 3,  section: "AI",                      lessons: 38, highlights: [{ id: 32, lecture: "Introducción a ChatGPT", href: "/experimentAlpha" }] },
  { section_id: 4,  section: "Content Generation",      lessons: 28, highlights: [] },
  { section_id: 5,  section: "APIs, MCPs & Skills",     lessons: 41, highlights: [] },
  { section_id: 6,  section: "Automatización",          lessons: 50, highlights: [{ id: 134, lecture: "Automatización vs código" }] },
  { section_id: 7,  section: "Vibe-Coding",             lessons: 39, highlights: [] },
  { section_id: 8,  section: "Scraping",                lessons: 18, highlights: [] },
  { section_id: 9,  section: "Databases & CRMs",        lessons: 43, highlights: [] },
  { section_id: 10, section: "Agentes",                 lessons: 32, highlights: [] },
  { section_id: 11, section: "Orchestrators",           lessons: 17, highlights: [] },
  { section_id: 12, section: "Productos y Entregables", lessons: 13, highlights: [] },
  { section_id: 13, section: "Finanzas",                lessons: 17, highlights: [] },
  { section_id: 14, section: "Ventas",                  lessons: 25, highlights: [] },
  { section_id: 15, section: "Social Media",            lessons: 33, highlights: [] },
  { section_id: 16, section: "Tareas Complejas",        lessons: 13, highlights: [] },
  { section_id: 17, section: "Modelos Alternativos",    lessons: 20, highlights: [] },
  { section_id: 18, section: "Ejemplos",                lessons: 58, highlights: [] },
  { section_id: 19, section: "Outro",                   lessons: 7,  highlights: [] },
];

const TOTAL_LESSONS = PHASES.reduce((n, p) => n + p.lessons, 0);

export default function DashboardAlphaPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* hero */}
        <div className="mb-8">
          <Caption className="mb-2 text-primary">preview · curso completo</Caption>
          <Title className="mb-3">hola de nuevo</Title>
          <Body className="text-ink-muted dark:text-gray-400 max-w-2xl">
            Este es el recorrido que verás cuando elijas la opción
            &quot;tomar el curso completo&quot; en el onboarding: las {TOTAL_LESSONS} lecciones
            activas del catálogo, agrupadas en {PHASES.length} fases y en el orden
            pensado por el equipo.
          </Body>
        </div>

        {/* progress summary */}
        <Card variant="neutral" padding="md" className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <Headline>tu recorrido</Headline>
            <Caption>0 / {TOTAL_LESSONS}</Caption>
          </div>
          <ProgressBar value={0} color="primary" size="md" />
          <Body className="mt-3 text-ink-muted dark:text-gray-400">
            Empieza por la primera fase. Cada fase abre la siguiente conforme avances.
          </Body>
        </Card>

        {/* section header */}
        <SectionHeader
          title="todas las fases"
          subtitle="Recorrido cronológico del catálogo de Itera"
        />

        {/* phases list */}
        <div className="space-y-4 mt-6">
          {PHASES.map((phase, idx) => (
            <Card
              key={phase.section_id}
              variant={idx === 0 ? "primary" : "neutral"}
              padding="md"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Caption className="mb-1">Fase {phase.section_id}</Caption>
                  <Headline>{phase.section}</Headline>
                </div>
                <Tag variant={idx === 0 ? "primary" : "neutral"}>
                  {phase.lessons} lecciones
                </Tag>
              </div>

              {phase.highlights.length > 0 && (
                <ul className="space-y-2 mt-4">
                  {phase.highlights.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center justify-between gap-3 rounded-xl border-2 border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <Caption className="mb-0.5">Lección {h.id}</Caption>
                        <Body className="truncate">{h.lecture}</Body>
                      </div>
                      {h.href ? (
                        <Button
                          variant="primary"
                          size="sm"
                          href={h.href}
                        >
                          Abrir
                        </Button>
                      ) : (
                        <Tag variant="outline">pronto</Tag>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>

        {/* cta back to onboarding */}
        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg" rounded2xl href="/projectDescription">
            Volver al onboarding
          </Button>
        </div>

        <Caption className="mt-8 text-center text-ink-muted dark:text-gray-400">
          Preview estático. Cuando el usuario inicia sesión y elige &quot;curso completo&quot; en el onboarding,
          el dashboard real (<Link href="/dashboard" className="underline decoration-dotted underline-offset-4">/dashboard</Link>)
          muestra estas mismas fases con progreso real, reproductor de video y ejercicios.
        </Caption>
      </main>
    </div>
  );
}
