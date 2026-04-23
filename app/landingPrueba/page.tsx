'use client';

/**
 * /landingPrueba — página experimental para evaluar secciones candidatas.
 *
 * Cada bloque es un prototipo desarrollado lo suficiente para decidir si
 * va a la landing de producción. Todas usan el design system (Card,
 * Button, Typography, Tag). No se linkea desde la landing principal.
 */
import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import {
  Display,
  Title,
  Subtitle,
  Headline,
  Body,
  Caption,
} from '@/components/ui/Typography';

// ─────────────────────────────────────────────────────────────
// Data hardcodeada para el prototipo. En prod vendría de Supabase.
// ─────────────────────────────────────────────────────────────

const CURRICULUM = [
  {
    n: 1,
    name: 'introducción',
    count: 2,
    samples: ['cómo funciona Itera', 'escoge tu ruta'],
  },
  {
    n: 2,
    name: 'fundamentos',
    count: 12,
    samples: [
      'qué es un modelo de AI',
      'cómo pensar los prompts',
      'ventana de contexto y tokens',
    ],
  },
  {
    n: 3,
    name: 'asistentes',
    count: 10,
    samples: [
      'Claude para escribir y resumir',
      'ChatGPT vs Claude vs Gemini',
      'Perplexity para investigar',
    ],
  },
  {
    n: 4,
    name: 'contenido',
    count: 10,
    samples: [
      'generar imágenes con Flux',
      'voz clonada con ElevenLabs',
      'video con Kling',
    ],
  },
  {
    n: 5,
    name: 'automatización',
    count: 12,
    samples: [
      'Claude Code Routines',
      'n8n para conectar apps',
      'Apify para scraping',
    ],
  },
  {
    n: 6,
    name: 'bases de datos',
    count: 12,
    samples: [
      'Supabase en 10 minutos',
      'Notion como base de datos',
      'RAG con embeddings',
    ],
  },
  {
    n: 7,
    name: 'api, mcp y skills',
    count: 14,
    samples: [
      'MCP servers desde cero',
      'Claude Agent SDK',
      'Anthropic Skills',
    ],
  },
  {
    n: 8,
    name: 'agentes',
    count: 10,
    samples: [
      'browser agents',
      'voice agents',
      'multi-agente con A2A',
    ],
  },
  {
    n: 9,
    name: 'vibe coding',
    count: 8,
    samples: [
      'Claude Code para equipos',
      'Cursor pro tips',
      'GitHub Copilot',
    ],
  },
  {
    n: 10,
    name: 'implementación',
    count: 10,
    samples: [
      'deploy a producción',
      'monitoreo básico',
      'go-to-market',
    ],
  },
];

const PERSONAS = [
  {
    icon: '📊',
    role: 'analista',
    outcome:
      'extraes insights de reportes en minutos en vez de horas, automatizas la generación de dashboards semanales.',
  },
  {
    icon: '📣',
    role: 'marketing',
    outcome:
      'generas 10 variantes de ads en 5 minutos, creas bases de conocimiento para chatbots que atienden clientes.',
  },
  {
    icon: '⚙️',
    role: 'operaciones',
    outcome:
      'automatizas procesos repetitivos de facturación, inventario y reportería sin escribir código.',
  },
  {
    icon: '🚀',
    role: 'founder',
    outcome:
      'prototipas features con vibe coding, pones en producción flujos que antes requerían contratar un dev.',
  },
];

const METODOLOGIA = [
  {
    title: 'aprendes haciendo',
    body: 'cada lección son ejercicios interactivos, no videos. el 80% del tiempo estás practicando, no escuchando.',
  },
  {
    title: 'te equivocas primero',
    body: 'usamos una técnica probada (hypercorrection): empiezas con una pregunta trampa, te equivocas, y así el aprendizaje se queda.',
  },
  {
    title: '10 minutos al día',
    body: 'lecciones de 10 slides. completas una en el café de la mañana y esa tarde ya la puedes aplicar en tu trabajo.',
  },
];

const HERRAMIENTAS = [
  'Claude',
  'ChatGPT',
  'Gemini',
  'Perplexity',
  'Flux',
  'ElevenLabs',
  'Kling',
  'Seedance',
  'n8n',
  'Supabase',
  'Notion',
  'MCP',
  'Claude Code',
  'Cursor',
  'GitHub',
  'Apify',
];

// ─────────────────────────────────────────────────────────────
// Demo interactivo: mock de una lección MCQ
// ─────────────────────────────────────────────────────────────

type Choice = {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
};

const DEMO_QUESTION = '¿cuál prompt le saca mejor trabajo a Claude?';

const DEMO_CHOICES: Choice[] = [
  {
    id: 'a',
    text: 'resume esto',
    correct: false,
    feedback:
      'muy vago. Claude no sabe qué aspecto resumir, para quién, ni qué tan largo. vas a recibir algo genérico.',
  },
  {
    id: 'b',
    text: 'actúa como analista financiero: lee este reporte y dame los 3 riesgos más importantes en bullets, máximo 2 líneas cada uno.',
    correct: true,
    feedback:
      'exacto. rol claro + tarea específica + formato definido = respuesta útil desde el primer intento. el prompting es la diferencia entre "meh" y "wow".',
  },
  {
    id: 'c',
    text: 'hazlo corto',
    correct: false,
    feedback:
      '"corto" no es una métrica. ¿3 palabras? ¿1 párrafo? siempre dale un número concreto (tokens, bullets, minutos de lectura).',
  },
  {
    id: 'd',
    text: 'por favor, si eres tan amable, me podrías resumir este documento',
    correct: false,
    feedback:
      'no necesitas ser cortés con Claude — no cambia el output. sí necesitas ser específico en rol, tarea y formato.',
  },
];

// ─────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────

export default function LandingPruebaPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedChoice = DEMO_CHOICES.find((c) => c.id === selected) ?? null;

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-ink dark:text-white">
      {/* Banner experimental */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 py-2 text-center text-xs text-yellow-900 dark:text-yellow-200">
        <span className="font-bold">PÁGINA EXPERIMENTAL</span>
        <span className="mx-2">·</span>
        <span>secciones candidatas para evaluación</span>
        <span className="mx-2">·</span>
        <Link href="/" className="underline hover:no-underline">
          volver a landing
        </Link>
      </div>

      {/* TOC sticky */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 py-3">
        <div className="container mx-auto px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max text-xs font-semibold">
            <a href="#opcion-1" className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-colors">1 · curriculum</a>
            <a href="#opcion-2" className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-colors">2 · para quién</a>
            <a href="#opcion-3" className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-colors">3 · prueba</a>
            <a href="#opcion-4" className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-colors">4 · metodología</a>
            <a href="#opcion-5" className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-colors">5 · garantía</a>
            <a href="#opcion-6" className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-colors">6 · herramientas</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-6xl py-10 space-y-24">
        {/* ═══════════════════════════════════════════════════════
            OPCIÓN 1 — Curriculum preview
        ═══════════════════════════════════════════════════════ */}
        <section id="opcion-1" className="scroll-mt-20">
          <Headline className="text-primary">opción 1 · curriculum preview</Headline>
          <Caption className="mt-1 block">
            muestra las 10 secciones con 3 lecciones de ejemplo cada una. objetivo: concretar "lo que vas a aprender".
          </Caption>

          <div className="mt-10 text-center max-w-2xl mx-auto">
            <Display as="h2">lo que aprendes</Display>
            <Subtitle as="p" className="mt-4">
              100 lecciones, 10 secciones, de fundamentos a producción
            </Subtitle>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURRICULUM.map((section) => (
              <Card key={section.n} variant="neutral" padding="lg" className="flex flex-col">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    sección {section.n}
                  </span>
                  <Tag variant="primary">{section.count} lecciones</Tag>
                </div>
                <Title as="h3" className="mb-4">
                  {section.name}
                </Title>
                <ul className="space-y-1.5 flex-1">
                  {section.samples.map((sample, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                      <span className="text-primary mt-0.5">→</span>
                      <span>{sample}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            OPCIÓN 2 — Para quién es
        ═══════════════════════════════════════════════════════ */}
        <section id="opcion-2" className="scroll-mt-20">
          <Headline className="text-primary">opción 2 · para quién es</Headline>
          <Caption className="mt-1 block">
            4 personas de empresa con un outcome específico cada una. ancla B2B, filtra visitantes.
          </Caption>

          <div className="mt-10 text-center max-w-2xl mx-auto">
            <Display as="h2">para tu rol en la empresa</Display>
            <Subtitle as="p" className="mt-4">
              ejemplos de lo que aplicas la misma semana que empiezas
            </Subtitle>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-4">
            {PERSONAS.map((p) => (
              <Card key={p.role} variant="neutral" padding="lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{p.icon}</div>
                  <div>
                    <Title as="h3" className="mb-2">
                      {p.role}
                    </Title>
                    <Body>{p.outcome}</Body>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Caption>
              ¿no te identificas con ninguno? probablemente Itera no es para ti — y eso está bien.
            </Caption>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            OPCIÓN 3 — Prueba una lección (interactivo)
        ═══════════════════════════════════════════════════════ */}
        <section id="opcion-3" className="scroll-mt-20">
          <Headline className="text-primary">opción 3 · prueba una lección</Headline>
          <Caption className="mt-1 block">
            muestra un slide real (MCQ) en la landing. el prospect siente el producto antes de crear cuenta.
          </Caption>

          <div className="mt-10 text-center max-w-2xl mx-auto">
            <Display as="h2">pruébalo sin registrarte</Display>
            <Subtitle as="p" className="mt-4">
              una lección típica de itera dura 10 minutos. este es 1 de 10 slides.
            </Subtitle>
          </div>

          <div className="mt-12 max-w-2xl mx-auto">
            <Card variant="neutral" padding="lg">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
                slide 3 · ejercicio
              </div>
              <Title as="h3" className="mb-6">
                {DEMO_QUESTION}
              </Title>

              <div className="space-y-3">
                {DEMO_CHOICES.map((choice) => {
                  const isSelected = selected === choice.id;
                  const showFeedback = selected !== null;
                  const isCorrect = choice.correct;

                  let cardClasses = 'w-full text-left';
                  if (showFeedback) {
                    if (isCorrect) {
                      cardClasses +=
                        ' border-completado bg-completado/10 dark:bg-completado/20';
                    } else if (isSelected) {
                      cardClasses += ' border-red-400 bg-red-50 dark:bg-red-900/20';
                    } else {
                      cardClasses += ' opacity-50';
                    }
                  }

                  return (
                    <button
                      key={choice.id}
                      onClick={() => !showFeedback && setSelected(choice.id)}
                      disabled={showFeedback}
                      className={`w-full text-left p-4 rounded-xl border-2 border-b-4 border-gray-300 border-b-gray-300 dark:border-gray-900 dark:border-b-gray-900 bg-white dark:bg-gray-800 transition-all ${
                        !showFeedback
                          ? 'hover:bg-gray-50 dark:hover:bg-gray-700 active:border-b-2 active:mt-[2px] cursor-pointer'
                          : cardClasses
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            showFeedback && isCorrect
                              ? 'border-completado bg-completado text-white'
                              : showFeedback && isSelected
                                ? 'border-red-400 bg-red-400 text-white'
                                : 'border-gray-300 dark:border-gray-600 text-ink-muted'
                          }`}
                        >
                          {choice.id.toUpperCase()}
                        </span>
                        <span className="text-sm text-ink dark:text-white pt-1">
                          {choice.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedChoice && (
                <div
                  className={`mt-6 p-4 rounded-xl border-2 border-b-4 ${
                    selectedChoice.correct
                      ? 'border-completado bg-completado/10'
                      : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Headline
                      className={
                        selectedChoice.correct
                          ? 'text-completado'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {selectedChoice.correct ? '✓ correcto' : '✗ ojo aquí'}
                    </Headline>
                  </div>
                  <Body>{selectedChoice.feedback}</Body>
                  {!selectedChoice.correct && (
                    <button
                      onClick={() => setSelected(null)}
                      className="mt-3 text-xs font-semibold text-primary underline"
                    >
                      intentar de nuevo
                    </button>
                  )}
                </div>
              )}

              {selectedChoice?.correct && (
                <div className="mt-6 text-center">
                  <Button variant="primary" depth="full" href="/auth/signup">
                    continuar con las 100 lecciones
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            OPCIÓN 4 — Metodología corta
        ═══════════════════════════════════════════════════════ */}
        <section id="opcion-4" className="scroll-mt-20">
          <Headline className="text-primary">opción 4 · metodología</Headline>
          <Caption className="mt-1 block">
            3 pilares que explican por qué el formato funciona. diferenciación contra cursos-video.
          </Caption>

          <div className="mt-10 text-center max-w-2xl mx-auto">
            <Display as="h2">por qué funciona</Display>
            <Subtitle as="p" className="mt-4">
              no es magia, es pedagogía aplicada
            </Subtitle>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {METODOLOGIA.map((m, i) => (
              <Card key={m.title} variant="neutral" padding="lg">
                <div className="text-5xl font-black text-primary/20 mb-2">
                  0{i + 1}
                </div>
                <Title as="h3" className="mb-3">
                  {m.title}
                </Title>
                <Body>{m.body}</Body>
              </Card>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            OPCIÓN 5 — Garantía
        ═══════════════════════════════════════════════════════ */}
        <section id="opcion-5" className="scroll-mt-20">
          <Headline className="text-primary">opción 5 · garantía destacada</Headline>
          <Caption className="mt-1 block">
            risk reversal visible. hoy vive dentro del FAQ; promoverlo a sección sube conversion.
          </Caption>

          <div className="mt-10 max-w-3xl mx-auto">
            <Card variant="neutral" padding="lg" className="text-center">
              <div className="py-8">
                <div className="text-8xl md:text-9xl font-black text-primary leading-none mb-2">
                  30
                </div>
                <Display as="h2" className="mb-6">
                  días para probarlo
                </Display>
                <Body className="max-w-lg mx-auto mb-6 text-lg">
                  si en un mes no estás aplicando lo que aprendes en tu trabajo, te devolvemos el 100% sin preguntas. así de simple.
                </Body>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="primary" depth="full" href="/auth/signup">
                    empezar gratis
                  </Button>
                  <Button variant="outline" depth="full" href="#opcion-1">
                    ver el catálogo
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            OPCIÓN 6 — Herramientas cubiertas
        ═══════════════════════════════════════════════════════ */}
        <section id="opcion-6" className="scroll-mt-20">
          <Headline className="text-primary">opción 6 · herramientas cubiertas</Headline>
          <Caption className="mt-1 block">
            grid visual de qué herramientas se enseñan. útil para "¿cubre X?" objecciones. puede vivir como strip sobre pricing.
          </Caption>

          <div className="mt-10 text-center max-w-2xl mx-auto">
            <Display as="h2">herramientas que aprendes a usar</Display>
            <Subtitle as="p" className="mt-4">
              con lo bueno, lo útil y lo que vale la pena pagar
            </Subtitle>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {HERRAMIENTAS.map((tool) => (
              <Tag key={tool} variant="outline" className="text-base">
                {tool}
              </Tag>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Caption>
              + muchas más. cuando sale una relevante, la sumamos al catálogo.
            </Caption>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FIN
        ═══════════════════════════════════════════════════════ */}
        <section className="border-t border-gray-200 dark:border-gray-800 pt-10 text-center">
          <Caption>
            ¿te late alguna? ¿qué cambiarías? dime por nombre (ej. "opción 1 pero sin los iconos de sección") y la afino antes de mandarla a la landing real.
          </Caption>
        </section>
      </div>
    </main>
  );
}
