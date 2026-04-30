import Link from 'next/link';
import { Display, Title, Subtitle, Body, Caption, Headline } from '@/components/ui/Typography';
import Tag from '@/components/ui/Tag';
import { depthBase } from '@/lib/design-tokens';

type Demo = {
  href: string;
  num: string;
  emoji: string;
  title: string;
  pitch: string;
  description: string;
  variant: 'primary' | 'neutral' | 'completado';
};

const demos: Demo[] = [
  {
    href: '/experimentllm/curso-personalizado',
    num: '01',
    emoji: '🎯',
    title: 'curso personalizado a tu proyecto',
    pitch: 'mismo curso, ejemplos solo tuyos',
    description:
      'pegas una lección genérica + describís tu proyecto. la ia re-escribe los ejemplos con tu negocio real. sensación: "este curso fue hecho para mí".',
    variant: 'primary',
  },
  {
    href: '/experimentllm/examen-oral',
    num: '02',
    emoji: '🎤',
    title: 'examen oral adaptativo',
    pitch: 'el coach que profundiza donde dudás',
    description:
      'al cierre de cada sección: 5-7 preguntas en chat. el tutor profundiza donde dudás, salta donde dominás. score y recomendación al final.',
    variant: 'neutral',
  },
  {
    href: '/experimentllm/roleplay',
    num: '03',
    emoji: '🎭',
    title: 'roleplay de situación real',
    pitch: 'practicás vendiendo, no leyendo cómo se vende',
    description:
      'cliente que dice "es muy caro", pitch a inversionista, cobrar a un cliente que se hace el loco. la ia se mete en personaje. al cierre, feedback puntual.',
    variant: 'completado',
  },
  {
    href: '/experimentllm/explicame',
    num: '04',
    emoji: '🧠',
    title: 'explícame con tus palabras',
    pitch: 'feynman: si lo explicás simple, lo entendiste',
    description:
      'vos explicás un concepto. la ia detecta huecos con preguntas socráticas, no te da la respuesta. iteración corta hasta que lo dominás de verdad.',
    variant: 'neutral',
  },
];

const variantStyles: Record<Demo['variant'], string> = {
  primary:
    'bg-primary text-white border-primary-dark border-b-primary-dark',
  neutral:
    'bg-white dark:bg-gray-800 text-ink dark:text-white border-gray-300 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900',
  completado:
    'bg-completado text-white border-completado-dark border-b-completado-dark',
};

const variantPitchStyles: Record<Demo['variant'], string> = {
  primary: 'text-white/85',
  neutral: 'text-ink-muted dark:text-gray-400',
  completado: 'text-white/85',
};

const variantBodyStyles: Record<Demo['variant'], string> = {
  primary: 'text-white/75',
  neutral: 'text-ink-muted dark:text-gray-400',
  completado: 'text-white/75',
};

const variantNumStyles: Record<Demo['variant'], string> = {
  primary: 'text-white/15',
  neutral: 'text-gray-200 dark:text-gray-900',
  completado: 'text-white/15',
};

export default function ExperimentLLMHub() {
  return (
    <main className="relative max-w-6xl mx-auto px-6 pt-16 pb-24">
      {/* Hero — loud, sin disculparse */}
      <div className="mb-16 max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <Tag variant="primary">labs · 4 demos</Tag>
          <Caption className="text-ink-muted dark:text-gray-500">
            backend: gpt-4o-mini · final: qwen 3 8b
          </Caption>
        </div>
        <Display className="mb-5">
          el tutor ia,<br />
          <span className="text-primary">demo en vivo</span>.
        </Display>
        <Subtitle className="text-ink-muted dark:text-gray-300 max-w-2xl">
          cuatro experimentos puntuales para sentir cómo se vería el tutor
          integrado al curso. cada uno ataca una palanca de retención distinta.
        </Subtitle>
      </div>

      {/* Grid 2×2 de cards con personalidad. Usamos depthBase del design-system
          en vez de duplicar las clases manual. */}
      <div className="grid md:grid-cols-2 gap-5">
        {demos.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className={
              `group relative overflow-hidden rounded-2xl ${depthBase} ` +
              'p-7 min-h-[260px] flex flex-col justify-between ' +
              variantStyles[d.variant]
            }
          >
            {/* Numeración gigante decorativa al fondo */}
            <span
              aria-hidden
              className={
                'absolute -bottom-6 -right-2 text-[180px] font-extrabold leading-none select-none ' +
                'transition-transform duration-300 group-hover:scale-110 ' +
                variantNumStyles[d.variant]
              }
            >
              {d.num}
            </span>

            {/* Contenido al frente */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl" aria-hidden>
                  {d.emoji}
                </span>
                <Headline
                  className={
                    d.variant === 'neutral'
                      ? 'text-primary'
                      : 'text-white/85'
                  }
                >
                  demo {d.num}
                </Headline>
              </div>
              <Title
                as="h2"
                className={
                  d.variant === 'neutral'
                    ? 'text-ink dark:text-white mb-2'
                    : 'text-white mb-2'
                }
              >
                {d.title}
              </Title>
              <Body
                className={
                  'font-bold mb-3 ' + variantPitchStyles[d.variant]
                }
              >
                {d.pitch}
              </Body>
            </div>
            <Body
              className={
                'relative text-sm leading-relaxed ' +
                variantBodyStyles[d.variant]
              }
            >
              {d.description}
            </Body>
          </Link>
        ))}
      </div>

      {/* Footer note discreto */}
      <div className="mt-16 flex items-center justify-between text-xs">
        <Caption className="text-ink-muted dark:text-gray-500">
          construido para validar antes de migrar el tutor real a producción.
        </Caption>
        <Caption className="text-ink-muted dark:text-gray-500">
          no auth · sin persistencia · solo demo
        </Caption>
      </div>
    </main>
  );
}
