'use client';

/**
 * /componentes — página canónica de referencia visual del design system.
 *
 * Regla: importa las primitivas reales de `components/ui/` y las renderiza
 * vivas. Cualquier cambio en un componente se ve aquí instantáneamente —
 * sin drift entre docs y código.
 *
 * Modo oscuro: este página respeta la media query `prefers-color-scheme` del
 * sistema igual que el resto de la app (`darkMode: "media"` en tailwind.config.ts).
 * Para ver dark, activa dark mode en el SO o en el navegador.
 */

import Link from 'next/link';
import {
  Button,
  IconButton,
  Card,
  CardFlat,
  Input,
  Textarea,
  SearchInput,
  Tag,
  Spinner,
  ProgressBar,
  StatCard,
  Divider,
  SectionHeader,
  EmptyState,
  Display,
  Title,
  Subtitle,
  Headline,
  Body,
  Caption,
} from '@/components/ui';
import CompositeCard from '@/components/shared/CompositeCard';
import HorizontalScroll from '@/components/shared/HorizontalScroll';
import VerticalScroll from '@/components/shared/VerticalScroll';
import {
  depth,
  DEPTH_BORDER_PX,
  DEPTH_BOTTOM_PX,
  DEPTH_ACTIVE_BOTTOM_PX,
  DEPTH_ACTIVE_MT_PX,
} from '@/lib/design-tokens';

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const RayoIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

/** Bloque genérico: título + código opcional + children. */
function Block({
  title,
  code,
  children,
}: {
  title: string;
  code?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-gray-400">
          {title}
        </h3>
        {code && (
          <code className="text-[10px] text-ink-muted dark:text-gray-400 opacity-70 font-mono break-all">
            {code}
          </code>
        )}
      </div>
      {children}
    </section>
  );
}

/** Swatch de color con nombre + hex. */
function Swatch({ name, hex, cls }: { name: string; hex: string; cls: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-[42px] h-[42px] rounded-xl border border-gray-200 dark:border-gray-700 ${cls}`} />
      <span className="text-[10px] text-ink dark:text-gray-300 font-mono">{name}</span>
      <span className="text-[10px] text-ink-muted dark:text-gray-500 font-mono">{hex}</span>
    </div>
  );
}

export default function ComponentesPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <header className="border-b border-gray-200 dark:border-gray-950 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-ink dark:text-white">
            Componentes
          </h1>
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-white transition-colors"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <Card variant="neutral" padding="lg">
          <Body>
            Referencia visual del design system. Todas las primitivas se importan directamente
            de <code className="font-mono text-xs">components/ui/</code>, así que cualquier cambio
            se refleja aquí al instante. Modo oscuro respeta{' '}
            <code className="font-mono text-xs">prefers-color-scheme</code>.
          </Body>
        </Card>

        {/* ───────── Tokens ───────── */}
        <section>
          <SectionHeader title="tokens" subtitle="Fuentes de verdad del sistema" />

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <Card variant="neutral" padding="md">
              <Block title="Colores · Aliases oficiales" code="tailwind.config.ts">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  <Swatch name="primary" hex="#1472FF" cls="bg-primary" />
                  <Swatch name="primary-dark" hex="#0E5FCC" cls="bg-primary-dark" />
                  <Swatch name="primary-hover" hex="#1265e0" cls="bg-primary-hover" />
                  <Swatch name="completado" hex="#22c55e" cls="bg-completado" />
                  <Swatch name="completado-dark" hex="#16a34a" cls="bg-completado-dark" />
                  <Swatch name="ink" hex="#4b4b4b" cls="bg-ink" />
                  <Swatch name="ink-muted" hex="#777777" cls="bg-ink-muted" />
                </div>
                <Caption className="mt-3">
                  Uso: <code className="font-mono">bg-primary</code>, <code className="font-mono">text-ink</code>, <code className="font-mono">border-primary-dark</code>. Nunca hex inline.
                </Caption>
              </Block>
            </Card>

            <Card variant="neutral" padding="md">
              <Block title="Profundidad" code="lib/design-tokens.ts">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Caption>Contorno</Caption>
                    <p className="font-mono text-ink dark:text-white">
                      {DEPTH_BORDER_PX}px · <code>{depth.border}</code>
                    </p>
                  </div>
                  <div>
                    <Caption>Sombra</Caption>
                    <p className="font-mono text-ink dark:text-white">
                      {DEPTH_BOTTOM_PX}px · <code>{depth.bottom}</code>
                    </p>
                  </div>
                  <div>
                    <Caption>Active (bottom)</Caption>
                    <p className="font-mono text-ink dark:text-white">
                      {DEPTH_ACTIVE_BOTTOM_PX}px
                    </p>
                  </div>
                  <div>
                    <Caption>Active (mt)</Caption>
                    <p className="font-mono text-ink dark:text-white">
                      {DEPTH_ACTIVE_MT_PX}px
                    </p>
                  </div>
                </div>
                <Caption className="mt-3">
                  Botones/cards con depth usan estos valores. Nunca reimplementar a mano.
                </Caption>
              </Block>
            </Card>
          </div>
        </section>

        <Divider />

        {/* ───────── Tipografía ───────── */}
        <section>
          <SectionHeader title="tipografía" subtitle="Darker Grotesque · todos los niveles vivos" />
          <Card variant="neutral" padding="lg" className="mt-4 space-y-6">
            <div>
              <Caption>Display · text-4xl md:text-5xl lg:text-6xl (extrabold, lowercase)</Caption>
              <Display>itera vuelve pronto</Display>
              <Caption className="opacity-70 mt-1">
                Hero de página (landing, maintenance, error fullscreen).
              </Caption>
            </div>
            <div>
              <Caption>Title · text-2xl (extrabold, lowercase)</Caption>
              <Title>curso personalizado para tu proyecto</Title>
              <Caption className="opacity-70 mt-1">
                Título de card, sección, modal o bloque interno.
              </Caption>
            </div>
            <div>
              <Caption>Subtitle · text-lg (bold, lowercase)</Caption>
              <Subtitle>bajada de display o title</Subtitle>
            </div>
            <div>
              <Caption>Headline · text-sm (bold, UPPERCASE)</Caption>
              <Headline>sección</Headline>
            </div>
            <div>
              <Caption>Body · text-base</Caption>
              <Body>Texto de párrafo normal. Respeta el case original del contenido.</Body>
            </div>
            <div>
              <Caption>Caption · text-xs</Caption>
              <Caption>Texto secundario, pie, metadatos.</Caption>
            </div>
          </Card>
        </section>

        <Divider />

        {/* ───────── Botones ───────── */}
        <section>
          <SectionHeader title="botones" subtitle="<Button> · todas las variantes" />
          <Card variant="neutral" padding="lg" className="mt-4 space-y-6">
            <Block title="Variantes">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="completado" disabled>Completado</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </Block>
            <Block title="Tamaños · sm, md (default), lg, xl">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="primary" size="sm">sm</Button>
                <Button variant="primary" size="md">md</Button>
                <Button variant="primary" size="lg">lg</Button>
                <Button variant="primary" size="xl">xl</Button>
              </div>
            </Block>
            <Block title="Estados sidebar · nav-active / nav-inactive">
              <div className="flex flex-wrap gap-2">
                <Button variant="nav-active">Nav activo</Button>
                <Button variant="nav-inactive">Nav inactivo</Button>
              </div>
            </Block>
          </Card>
        </section>

        {/* ───────── IconButton ───────── */}
        <section>
          <SectionHeader title="iconbutton" subtitle="42×42 · primary / outline / ghost" />
          <Card variant="neutral" padding="lg" className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <IconButton variant="primary" aria-label="Añadir primary"><PlusIcon /></IconButton>
              <IconButton variant="outline" aria-label="Añadir outline"><PlusIcon /></IconButton>
              <IconButton variant="ghost" aria-label="Añadir ghost"><PlusIcon /></IconButton>
              <IconButton variant="primary" size="lg" aria-label="Añadir lg"><PlusIcon /></IconButton>
            </div>
          </Card>
        </section>

        <Divider />

        {/* ───────── Cards ───────── */}
        <section>
          <SectionHeader title="cards" subtitle="<Card> · neutral / primary / completado + CardFlat" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <Card variant="neutral" padding="md" interactive>
              <Title>Neutral</Title>
              <Caption>Interactive · hover</Caption>
            </Card>
            <Card variant="primary" padding="md" interactive>
              <Title className="text-white">Primary</Title>
              <Caption className="text-white/80">Interactive · hover</Caption>
            </Card>
            <Card variant="completado" padding="md">
              <Title className="text-white">Completado</Title>
              <Caption className="text-white/80">Sin hover</Caption>
            </Card>
            <CardFlat padding="md">
              <Title>CardFlat</Title>
              <Caption>Sin depth</Caption>
            </CardFlat>
          </div>
        </section>

        {/* ───────── Inputs ───────── */}
        <section>
          <SectionHeader title="inputs" subtitle="<Input>, <Textarea>, <SearchInput>" />
          <Card variant="neutral" padding="lg" className="mt-4 space-y-4 max-w-md">
            <div>
              <Caption>Input · default (depth)</Caption>
              <Input placeholder="Tu nombre" className="mt-1" />
            </div>
            <div>
              <Caption>Input · variant flat (auth pages)</Caption>
              <Input variant="flat" placeholder="Correo" type="email" className="mt-1" />
            </div>
            <div>
              <Caption>Textarea</Caption>
              <Textarea rows={3} placeholder="Describe tu proyecto..." className="mt-1" />
            </div>
            <div>
              <Caption>SearchInput</Caption>
              <SearchInput placeholder="Buscar cursos..." className="mt-1" />
            </div>
          </Card>
        </section>

        <Divider />

        {/* ───────── Tag ───────── */}
        <section>
          <SectionHeader title="tag" subtitle="<Tag> · primary / outline / success / warning / neutral" />
          <Card variant="neutral" padding="lg" className="mt-4">
            <div className="flex flex-wrap gap-2">
              <Tag variant="primary">Next.js</Tag>
              <Tag variant="outline">TypeScript</Tag>
              <Tag variant="success">Completado</Tag>
              <Tag variant="warning">En progreso</Tag>
              <Tag variant="neutral">Básico</Tag>
            </div>
          </Card>
        </section>

        {/* ───────── ProgressBar ───────── */}
        <section>
          <SectionHeader title="progressbar" subtitle="<ProgressBar> · sizes sm/md/lg · colores primary/white/green/yellow" />
          <Card variant="neutral" padding="lg" className="mt-4 space-y-3 max-w-md">
            <div>
              <Caption>sm · primary</Caption>
              <ProgressBar value={35} size="sm" />
            </div>
            <div>
              <Caption>md (default) · green</Caption>
              <ProgressBar value={65} color="green" />
            </div>
            <div>
              <Caption>lg · yellow</Caption>
              <ProgressBar value={90} size="lg" color="yellow" />
            </div>
          </Card>
        </section>

        {/* ───────── StatCard ───────── */}
        <section>
          <SectionHeader title="statcard" subtitle="<StatCard> · icono + big number + label" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <StatCard icon="🔥" value={5} label="Racha dias" color="orange" />
            <StatCard icon="⚡" value={150} label="XP hoy" color="blue" />
            <StatCard icon="✓" value={12} label="Completadas" color="green" />
            <StatCard icon="⏱" value={34} label="Minutos" color="neutral" />
          </div>
        </section>

        <Divider />

        {/* ───────── Spinner ───────── */}
        <section>
          <SectionHeader title="spinner" subtitle="<Spinner> · sm / md (default) / lg" />
          <Card variant="neutral" padding="lg" className="mt-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Spinner size="sm" />
                <Caption>sm</Caption>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner />
                <Caption>md</Caption>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="lg" />
                <Caption>lg</Caption>
              </div>
            </div>
            <Caption className="mt-3">
              <code className="font-mono">{'<SpinnerPage />'}</code> para spinner a pagina completa.
            </Caption>
          </Card>
        </section>

        {/* ───────── EmptyState ───────── */}
        <section>
          <SectionHeader title="emptystate" subtitle="<EmptyState> · icono + título + descripción + CTA" />
          <div className="mt-4">
            <EmptyState
              icon={<RayoIcon />}
              title="aún no tienes retos"
              description="Los retos se generan automáticamente al crear tu curso."
              action={<Button variant="primary" size="sm">Crear mi curso</Button>}
            />
          </div>
        </section>

        {/* ───────── Divider ───────── */}
        <section>
          <SectionHeader title="divider" subtitle="<Divider> · con o sin título" />
          <Card variant="neutral" padding="lg" className="mt-4 space-y-6">
            <Divider />
            <Divider title="sección" />
          </Card>
        </section>

        <Divider />

        {/* ───────── Shared layouts ───────── */}
        <section>
          <SectionHeader
            title="compartidos"
            subtitle="CompositeCard · HorizontalScroll · VerticalScroll"
          />
          <Card variant="neutral" padding="lg" className="mt-4 space-y-6">
            <div>
              <Caption>CompositeCard · leading + content + trailing</Caption>
              <div className="mt-2 max-w-md">
                <CompositeCard
                  leading={
                    <IconButton variant="outline" aria-label="Anterior">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </IconButton>
                  }
                  trailing={
                    <IconButton variant="primary" aria-label="Añadir">
                      <PlusIcon />
                    </IconButton>
                  }
                >
                  <Headline>fase 1</Headline>
                  <Caption>Fundamentos</Caption>
                </CompositeCard>
              </div>
            </div>
            <div>
              <Caption>HorizontalScroll · fadeEdges</Caption>
              <div className="mt-2">
                <HorizontalScroll fadeEdges>
                  {['Fase 1', 'Fase 2', 'Fase 3', 'Fase 4', 'Fase 5'].map((l) => (
                    <Tag key={l} variant="outline">{l}</Tag>
                  ))}
                </HorizontalScroll>
              </div>
            </div>
            <div>
              <Caption>VerticalScroll</Caption>
              <div className="mt-2">
                <VerticalScroll className={`max-h-36 rounded-2xl ${depth.border} border-gray-200 dark:border-gray-950 ${depth.bottom} border-b-gray-300 dark:border-b-gray-950 bg-white dark:bg-gray-800 p-3 space-y-2`}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <Body key={n}>Línea {n}</Body>
                  ))}
                </VerticalScroll>
              </div>
            </div>
          </Card>
        </section>

        <Card variant="neutral" padding="lg">
          <Body>
            <strong>Regla:</strong> todo nuevo UI debe usar solo estas primitivas y los tokens de{' '}
            <code className="font-mono">lib/design-tokens.ts</code>. Nunca hex inline, nunca depth
            manual, nunca font sizes hardcoded para texto con nivel tipográfico.
          </Body>
        </Card>
      </main>
    </div>
  );
}
