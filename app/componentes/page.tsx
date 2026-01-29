'use client';

import Link from 'next/link';
import {
  Button,
  IconButton,
  Card, CardFlat,
  Input, Textarea, SearchInput,
  Divider,
  Typography, Title, Subtitle, Headline, Body, Caption,
  ProgressBar,
  StatCard,
  Tag,
  Spinner, SpinnerPage,
  SectionHeader,
  EmptyState,
} from '@/components/ui';

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const LightningIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

/** Bloque genérico de sección con título y optional code */
function Block({
  title,
  code,
  children,
  labelClass,
}: { title: string; code?: string; children: React.ReactNode; labelClass: string }) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>{title}</h3>
        {code && <code className={`text-[10px] ${labelClass} opacity-70 font-mono break-all`}>{code}</code>}
      </div>
      {children}
    </section>
  );
}

export default function ComponentesPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white">
            Componentes
          </h1>
          <Link href="/" className="text-sm font-bold uppercase tracking-wide text-[#777777] dark:text-gray-400 hover:text-[#4b4b4b] dark:hover:text-white transition-colors">
            ← Volver
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Mode indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#1472FF]" />
            <span className="text-sm font-bold uppercase tracking-wide text-[#4b4b4b]">Modo claro</span>
          </div>
          <div className="rounded-xl border-2 border-gray-700 bg-gray-900 p-4 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#1472FF]" />
            <span className="text-sm font-bold uppercase tracking-wide text-white">Modo oscuro</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6">
          {/* ─── IZQUIERDA: MODO CLARO ─── */}
          <div className="space-y-12 rounded-2xl border-2 border-gray-200 bg-white p-6 lg:p-8">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] pb-2 border-b-2 border-gray-200">
              Modo claro
            </h2>

            {/* Colores de acento */}
            <Block title="Colores de acento" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-3">
                {[
                  ['#1472FF', 'primary'],
                  ['#22c55e', 'completado'],
                ].map(([bg, name]) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className="w-[42px] h-[42px] rounded-xl" style={{ backgroundColor: bg }} />
                    <span className="text-[10px] text-[#4b4b4b] font-mono">{bg}</span>
                  </div>
                ))}
              </div>
            </Block>

            {/* Colores de profundidad */}
            <Block title="Colores de acento borde y profundidad" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-[42px] h-[42px] rounded-xl border border-gray-300" style={{ backgroundColor: '#0E5FCC' }} />
                  <span className="text-[10px] text-[#4b4b4b] font-mono">#0E5FCC</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-[42px] h-[42px] rounded-xl border border-gray-300" style={{ backgroundColor: '#16a34a' }} />
                  <span className="text-[10px] text-[#4b4b4b] font-mono">#16a34a</span>
                </div>
              </div>
            </Block>

            {/* Fondo y profundidad */}
            <Block title="Fondo y profundidad" labelClass="text-[#777777]">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1">Color de Fondo (Claro) Primario</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-[42px] h-[42px] rounded-xl border border-gray-300 bg-white" />
                      <span className="text-[10px] text-[#4b4b4b] font-mono">Blanco</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1">Fondos / Profundidad</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-[42px] h-[42px] rounded-xl border border-gray-300 bg-gray-300" />
                      <span className="text-[10px] text-[#4b4b4b] font-mono">gray-300</span>
                    </div>
                  </div>
                </div>
              </div>
            </Block>

            {/* Texto */}
            <Block title="Texto" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-4">
                <span className="text-sm font-bold text-[#4b4b4b]">#4b4b4b</span>
                <span className="text-sm text-[#777777]">#777777</span>
                <span className="text-sm text-[#1472FF]">#1472FF</span>
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">text-[#4b4b4b] · text-[#777777]</code>
            </Block>

            {/* Botones — real components */}
            <Block title="Botones · Depth" code="<Button variant=... />" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="completado" size="sm">Completado</Button>
                <Button variant="danger" size="sm">Danger</Button>
              </div>
            </Block>

            {/* Botones icono — real components */}
            <Block title="Botones icono (+, avatar)" code="<IconButton variant=... />" labelClass="text-[#777777]">
              <div className="flex flex-wrap items-center gap-2">
                <IconButton variant="primary" aria-label="Añadir"><PlusIcon /></IconButton>
                <IconButton as="div" variant="primary">PC</IconButton>
                <IconButton variant="outline" aria-label="Añadir"><PlusIcon /></IconButton>
                <IconButton as="div" variant="outline">PC</IconButton>
                <IconButton variant="ghost" aria-label="Añadir"><PlusIcon /></IconButton>
                <IconButton as="div" variant="ghost">PC</IconButton>
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">42×42px · Primary · Outline · Ghost</code>
            </Block>

            {/* Tipografía — real components */}
            <Block title="Tipografía" code="<Typography level=... />" labelClass="text-[#777777]">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-0.5">Título · text-2xl</p>
                  <Title>curso personalizado para tu proyecto</Title>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-0.5">Subtítulo · text-lg</p>
                  <Subtitle>Videos a medida con IA</Subtitle>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-0.5">Headline · text-sm</p>
                  <Headline>Sección</Headline>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-0.5">Body · text-base</p>
                  <Body>Texto de párrafo normal.</Body>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-0.5">Caption · text-xs</p>
                  <Caption>Texto secundario o pie.</Caption>
                </div>
              </div>
              <p className="text-[10px] text-[#777777] mt-2 border-t border-gray-200 pt-2">Regla: títulos y subtítulos en minúsculas, salvo nombre de usuario.</p>
            </Block>

            {/* Cards — real components */}
            <Block title="Cards · Neutral / Primary / Completado" code="<Card variant=... />" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-3">
                <Card variant="neutral" interactive className="w-36">
                  <p className="text-sm font-bold text-[#4b4b4b] dark:text-white">Neutral</p>
                  <p className="text-[10px] text-[#777777] mt-0.5">gray-200/300</p>
                </Card>
                <Card variant="primary" interactive className="w-36">
                  <p className="text-sm font-bold">Primary</p>
                  <p className="text-[10px] text-white/80 mt-0.5">#1472FF</p>
                </Card>
                <Card variant="completado" className="w-36">
                  <p className="text-sm font-bold">Completado</p>
                  <p className="text-[10px] text-white/80 mt-0.5">#22c55e</p>
                </Card>
              </div>
            </Block>

            {/* CardFlat */}
            <Block title="Card Flat (sin profundidad)" code="<CardFlat />" labelClass="text-[#777777]">
              <CardFlat className="p-4 max-w-xs">
                <p className="text-sm font-bold text-[#4b4b4b]">CardFlat</p>
                <p className="text-[10px] text-[#777777] mt-0.5">Solo border-2, sin border-b-4</p>
              </CardFlat>
            </Block>

            {/* Input — real components */}
            <Block title="Input · Textarea · SearchInput" code="<Input /> <Textarea /> <SearchInput />" labelClass="text-[#777777]">
              <div className="space-y-3 max-w-xs">
                <Input placeholder="Input placeholder" />
                <Textarea rows={2} placeholder="Textarea placeholder" />
                <SearchInput placeholder="Buscar..." />
              </div>
            </Block>

            {/* Divider — real component */}
            <Block title="Divisor" code="<Divider />" labelClass="text-[#777777]">
              <Divider />
              <div className="mt-3">
                <Divider title="Sección" />
              </div>
            </Block>

            {/* ProgressBar — real component */}
            <Block title="ProgressBar" code="<ProgressBar value={...} />" labelClass="text-[#777777]">
              <div className="space-y-3 max-w-xs">
                <ProgressBar value={65} />
                <ProgressBar value={40} size="lg" color="green" />
                <ProgressBar value={80} size="sm" color="primary" />
              </div>
            </Block>

            {/* StatCard — real component */}
            <Block title="StatCard" code="<StatCard icon=... value=... label=... />" labelClass="text-[#777777]">
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <StatCard icon="🔥" value={5} label="Racha Días" color="orange" />
                <StatCard icon="⭐" value={3} label="Nivel" color="blue" />
              </div>
            </Block>

            {/* Tag — real component */}
            <Block title="Tag" code="<Tag variant=... />" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-2">
                <Tag variant="primary">Primary</Tag>
                <Tag variant="outline">Outline</Tag>
                <Tag variant="success">Success</Tag>
                <Tag variant="warning">Warning</Tag>
                <Tag variant="neutral">Neutral</Tag>
              </div>
            </Block>

            {/* Spinner — real component */}
            <Block title="Spinner" code="<Spinner /> <Spinner size='lg' />" labelClass="text-[#777777]">
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </Block>

            {/* SectionHeader — real component */}
            <Block title="SectionHeader" code="<SectionHeader title=... subtitle=... />" labelClass="text-[#777777]">
              <SectionHeader
                title="retos"
                subtitle="Practica lo que aprendes"
                action={<Button variant="primary" size="sm">Nuevo</Button>}
              />
            </Block>

            {/* Espaciado */}
            <Block title="Espaciado" code="p-4 · px-6 py-4 · gap-3 · space-y-4" labelClass="text-[#777777]">
              <div className="flex flex-wrap items-end gap-2">
                {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
                  <div key={n} className="flex flex-col items-center gap-0.5">
                    <div className="bg-[#1472FF] rounded" style={{ width: n * 4, height: n * 4 }} />
                    <span className="text-[10px] text-[#777777]">{n}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#777777] mt-2">Radios: rounded-xl (0.75rem), rounded-2xl (1rem)</p>
            </Block>
          </div>

          {/* ─── DERECHA: MODO OSCURO ─── */}
          <div className="space-y-12 rounded-2xl border-2 border-gray-700 bg-gray-900 p-6 lg:p-8 dark">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-white pb-2 border-b-2 border-gray-700">
              Modo oscuro
            </h2>

            {/* Colores de acento */}
            <Block title="Colores de acento" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-3">
                {[
                  ['#1472FF', 'primary'],
                  ['#22c55e', 'completado'],
                ].map(([bg, name]) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className="w-[42px] h-[42px] rounded-xl" style={{ backgroundColor: bg }} />
                    <span className="text-[10px] text-gray-300 font-mono">{bg}</span>
                  </div>
                ))}
              </div>
            </Block>

            {/* Colores de profundidad */}
            <Block title="Colores de acento borde y profundidad" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-[42px] h-[42px] rounded-xl border border-gray-600" style={{ backgroundColor: '#0E5FCC' }} />
                  <span className="text-[10px] text-gray-300 font-mono">#0E5FCC</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-[42px] h-[42px] rounded-xl border border-gray-600" style={{ backgroundColor: '#16a34a' }} />
                  <span className="text-[10px] text-gray-300 font-mono">#16a34a</span>
                </div>
              </div>
            </Block>

            {/* Fondo y profundidad */}
            <Block title="Fondo y profundidad" labelClass="text-gray-400">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Color de Fondo (Oscuro) Primario</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-[42px] h-[42px] rounded-xl border border-gray-600 bg-gray-800" />
                      <span className="text-[10px] text-gray-300 font-mono">gray-800</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Fondos / Profundidad</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-[42px] h-[42px] rounded-xl border border-gray-600 bg-gray-950" />
                      <span className="text-[10px] text-gray-300 font-mono">gray-950</span>
                    </div>
                  </div>
                </div>
              </div>
            </Block>

            {/* Texto */}
            <Block title="Texto" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-4">
                <span className="text-sm font-bold text-white">white</span>
                <span className="text-sm text-gray-400">gray-400</span>
                <span className="text-sm text-[#1472FF]">#1472FF</span>
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">dark:text-white · dark:text-gray-400</code>
            </Block>

            {/* Botones — real components */}
            <Block title="Botones · Depth" code="<Button variant=... />" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="completado" size="sm">Completado</Button>
                <Button variant="danger" size="sm">Danger</Button>
              </div>
            </Block>

            {/* Botones icono — real components */}
            <Block title="Botones icono (+, avatar)" code="<IconButton variant=... />" labelClass="text-gray-400">
              <div className="flex flex-wrap items-center gap-2">
                <IconButton variant="primary" aria-label="Añadir"><PlusIcon /></IconButton>
                <IconButton as="div" variant="primary">PC</IconButton>
                <IconButton variant="outline" aria-label="Añadir"><PlusIcon /></IconButton>
                <IconButton as="div" variant="outline">PC</IconButton>
                <IconButton variant="ghost" aria-label="Añadir"><PlusIcon /></IconButton>
                <IconButton as="div" variant="ghost">PC</IconButton>
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">42×42px · Primary · Outline · Ghost</code>
            </Block>

            {/* Tipografía — real components */}
            <Block title="Tipografía" code="<Typography level=... />" labelClass="text-gray-400">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Título · text-2xl</p>
                  <Title>curso personalizado para tu proyecto</Title>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Subtítulo · text-lg</p>
                  <Subtitle>Videos a medida con IA</Subtitle>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Headline · text-sm</p>
                  <Headline>Sección</Headline>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Body · text-base</p>
                  <Body>Texto de párrafo normal.</Body>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Caption · text-xs</p>
                  <Caption>Texto secundario o pie.</Caption>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-700 pt-2">Regla: títulos y subtítulos en minúsculas, salvo nombre de usuario.</p>
            </Block>

            {/* Cards — real components */}
            <Block title="Cards · Neutral / Primary / Completado" code="<Card variant=... />" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-3">
                <Card variant="neutral" interactive className="w-36">
                  <p className="text-sm font-bold text-white">Neutral</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">gray-950 · fondo</p>
                </Card>
                <Card variant="primary" interactive className="w-36">
                  <p className="text-sm font-bold">Primary</p>
                  <p className="text-[10px] text-white/80 mt-0.5">#1472FF</p>
                </Card>
                <Card variant="completado" className="w-36">
                  <p className="text-sm font-bold">Completado</p>
                  <p className="text-[10px] text-white/80 mt-0.5">#22c55e</p>
                </Card>
              </div>
            </Block>

            {/* CardFlat */}
            <Block title="Card Flat (sin profundidad)" code="<CardFlat />" labelClass="text-gray-400">
              <CardFlat className="p-4 max-w-xs">
                <p className="text-sm font-bold text-white">CardFlat</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Solo border-2, sin border-b-4</p>
              </CardFlat>
            </Block>

            {/* Input — real components */}
            <Block title="Input · Textarea · SearchInput" code="<Input /> <Textarea /> <SearchInput />" labelClass="text-gray-400">
              <div className="space-y-3 max-w-xs">
                <Input placeholder="Input placeholder" />
                <Textarea rows={2} placeholder="Textarea placeholder" />
                <SearchInput placeholder="Buscar..." />
              </div>
            </Block>

            {/* Divider — real component */}
            <Block title="Divisor" code="<Divider />" labelClass="text-gray-400">
              <Divider />
              <div className="mt-3">
                <Divider title="Sección" />
              </div>
            </Block>

            {/* ProgressBar — real component */}
            <Block title="ProgressBar" code="<ProgressBar value={...} />" labelClass="text-gray-400">
              <div className="space-y-3 max-w-xs">
                <ProgressBar value={65} />
                <ProgressBar value={40} size="lg" color="green" />
                <ProgressBar value={80} size="sm" color="primary" />
              </div>
            </Block>

            {/* StatCard — real component */}
            <Block title="StatCard" code="<StatCard icon=... value=... label=... />" labelClass="text-gray-400">
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <StatCard icon="🔥" value={5} label="Racha Días" color="orange" />
                <StatCard icon="⭐" value={3} label="Nivel" color="blue" />
              </div>
            </Block>

            {/* Tag — real component */}
            <Block title="Tag" code="<Tag variant=... />" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-2">
                <Tag variant="primary">Primary</Tag>
                <Tag variant="outline">Outline</Tag>
                <Tag variant="success">Success</Tag>
                <Tag variant="warning">Warning</Tag>
                <Tag variant="neutral">Neutral</Tag>
              </div>
            </Block>

            {/* Spinner — real component */}
            <Block title="Spinner" code="<Spinner /> <Spinner size='lg' />" labelClass="text-gray-400">
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </Block>

            {/* SectionHeader — real component */}
            <Block title="SectionHeader" code="<SectionHeader title=... subtitle=... />" labelClass="text-gray-400">
              <SectionHeader
                title="retos"
                subtitle="Practica lo que aprendes"
                action={<Button variant="primary" size="sm">Nuevo</Button>}
              />
            </Block>

            {/* Espaciado */}
            <Block title="Espaciado" code="p-4 · px-6 py-4 · gap-3 · space-y-4" labelClass="text-gray-400">
              <div className="flex flex-wrap items-end gap-2">
                {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
                  <div key={n} className="flex flex-col items-center gap-0.5">
                    <div className="bg-[#1472FF] rounded" style={{ width: n * 4, height: n * 4 }} />
                    <span className="text-[10px] text-gray-400">{n}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Radios: rounded-xl (0.75rem), rounded-2xl (1rem)</p>
            </Block>
          </div>
        </div>

        {/* ─── EMPTY STATE (full-width section) ─── */}
        <div className="mt-8 space-y-6">
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white">
            Empty State
          </h2>
          <EmptyState
            icon={<LightningIcon />}
            title="Aún no tienes retos"
            description="Los retos se generan automáticamente al crear tu curso personalizado."
            action={<Button variant="primary">Crear mi curso</Button>}
          />
        </div>
      </main>
    </div>
  );
}
