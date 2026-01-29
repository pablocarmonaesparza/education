'use client';

import Button from '@/components/shared/Button';
import IconButton from '@/components/shared/IconButton';
import Link from 'next/link';

/**
 * Página oculta de componentes / sistema gráfico.
 * Acceso directo: /componentes — no enlazada desde nav.
 * Para trabajar manualmente en colores, botones, tipografías, tamaños, etc.
 */
export default function ComponentesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white">
            Componentes
          </h1>
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-wide text-[#777777] dark:text-gray-400 hover:text-[#4b4b4b] dark:hover:text-white transition-colors"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-16">
        {/* ─── COLORES ─── */}
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Colores
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-2">Brand</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-16 h-16 rounded-xl border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF]" />
                  <span className="text-xs text-[#4b4b4b] dark:text-gray-300">#1472FF / #0E5FCC</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-16 h-16 rounded-xl border-2 border-b-4 border-[#16a34a] bg-[#22c55e]" />
                  <span className="text-xs text-[#4b4b4b] dark:text-gray-300">#22c55e / #16a34a</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-2">Neutros (bordes / profundidad)</p>
              <div className="flex flex-wrap gap-3">
                {[
                  ['gray-200', '#e5e7eb'],
                  ['gray-300', '#d1d5db'],
                  ['gray-400', '#9ca3af'],
                  ['gray-500', '#6b7280'],
                  ['gray-600', '#4b5563'],
                  ['gray-700', '#374151'],
                  ['gray-800', '#1f2937'],
                  ['gray-950', '#030712'],
                ].map(([name, hex]) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div
                      className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-xs text-[#4b4b4b] dark:text-gray-300">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-2">Texto</p>
              <div className="flex flex-wrap gap-4">
                <span className="text-base font-bold text-[#4b4b4b] dark:text-white">#4b4b4b / white</span>
                <span className="text-base text-[#777777] dark:text-gray-400">#777777 / gray-400</span>
                <span className="text-base text-[#1472FF]">#1472FF</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BOTONES ─── */}
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Botones
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-3">Depth (border-2 border-b-4, active)</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="md">Primary</Button>
                <Button variant="secondary" size="md">Secondary</Button>
                <Button variant="outline" size="md">Outline</Button>
                <Button variant="nav-active" size="md" rounded2xl>Nav active</Button>
                <Button variant="nav-inactive" size="md" rounded2xl>Nav inactive</Button>
                <Button variant="icon" size="icon" aria-label="Icon">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-3">Flat (sin profundidad)</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" size="md">Ghost</Button>
                <Button variant="icon-ghost" size="icon" aria-label="Icon ghost">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-3">Tamaños</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">sm</Button>
                <Button variant="primary" size="md">md</Button>
                <Button variant="primary" size="lg">lg</Button>
                <Button variant="primary" size="xl">xl</Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-3">IconButton</p>
              <div className="flex flex-wrap items-center gap-3">
                <IconButton size="sm" aria-label="Icon sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </IconButton>
                <IconButton size="lg" aria-label="Icon lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </IconButton>
                <IconButton as="div" size="lg">PC</IconButton>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TIPOGRAFÍAS ─── */}
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Tipografías
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-[#777777] dark:text-gray-400">
              <strong className="text-[#4b4b4b] dark:text-white">Darker Grotesque</strong> → h1–h6 (display). <strong className="text-[#4b4b4b] dark:text-white">Inter</strong> → body (sans).
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white leading-tight">H1 · 4xl</h1>
              <h2 className="text-3xl font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white leading-tight">H2 · 3xl</h2>
              <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white leading-tight">H3 · 2xl</h3>
              <h4 className="text-xl font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white leading-tight">H4 · xl</h4>
              <h5 className="text-lg font-bold uppercase tracking-wide text-[#4b4b4b] dark:text-white">H5 · lg</h5>
              <h6 className="text-base font-bold uppercase tracking-wide text-[#4b4b4b] dark:text-white">H6 · base</h6>
            </div>
            <div className="space-y-1 pt-4">
              <p className="text-base text-[#4b4b4b] dark:text-gray-300">Body base · #4b4b4b / gray-300</p>
              <p className="text-sm text-[#777777] dark:text-gray-400">Body sm · #777777 / gray-400</p>
              <p className="text-xs text-[#777777] dark:text-gray-400">Body xs · #777777 / gray-400</p>
            </div>
            <div className="pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-2">Tracking</p>
              <p className="text-base font-bold uppercase tracking-wide text-[#4b4b4b] dark:text-white">tracking-wide</p>
              <p className="text-base font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white">tracking-tight</p>
            </div>
          </div>
        </section>

        {/* ─── TAMAÑOS DE TEXTO ─── */}
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Tamaños de texto
          </h2>
          <div className="space-y-2">
            <p className="text-xs text-[#4b4b4b] dark:text-gray-300">text-xs</p>
            <p className="text-sm text-[#4b4b4b] dark:text-gray-300">text-sm</p>
            <p className="text-base text-[#4b4b4b] dark:text-gray-300">text-base</p>
            <p className="text-lg text-[#4b4b4b] dark:text-gray-300">text-lg</p>
            <p className="text-xl text-[#4b4b4b] dark:text-gray-300">text-xl</p>
            <p className="text-2xl text-[#4b4b4b] dark:text-gray-300">text-2xl</p>
            <p className="text-3xl text-[#4b4b4b] dark:text-gray-300">text-3xl</p>
            <p className="text-4xl text-[#4b4b4b] dark:text-gray-300">text-4xl</p>
            <p className="text-5xl text-[#4b4b4b] dark:text-gray-300">text-5xl</p>
            <p className="text-6xl text-[#4b4b4b] dark:text-gray-300">text-6xl</p>
          </div>
        </section>

        {/* ─── CARDS / PROFUNDIDAD ─── */}
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Cards y profundidad
          </h2>
          <p className="text-sm text-[#777777] dark:text-gray-400 mb-4">
            Canon: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs">border-2 border-b-4</code>, <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs">active:border-b-2 active:mt-[2px]</code>.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="w-48 rounded-2xl p-4 border-2 border-b-4 border-gray-200 dark:border-gray-950 border-b-gray-300 dark:border-b-gray-950 bg-white dark:bg-gray-800 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:border-b-2 active:mt-[2px]">
              <p className="text-sm font-bold text-[#4b4b4b] dark:text-white">Neutral</p>
              <p className="text-xs text-[#777777] dark:text-gray-400 mt-1">gray-200/950</p>
            </div>
            <div className="w-48 rounded-2xl p-4 border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF] text-white transition-all hover:bg-[#1265e0] active:border-b-2 active:mt-[2px]">
              <p className="text-sm font-bold">Primary</p>
              <p className="text-xs text-white/80 mt-1">#1472FF / #0E5FCC</p>
            </div>
            <div className="w-48 rounded-2xl p-4 border-2 border-b-4 border-[#16a34a] bg-[#22c55e] text-white transition-all active:border-b-2 active:mt-[2px]">
              <p className="text-sm font-bold">Completado</p>
              <p className="text-xs text-white/80 mt-1">#22c55e / #16a34a</p>
            </div>
          </div>
        </section>

        {/* ─── INPUTS ─── */}
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Inputs y textareas
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-1">Input</label>
              <input
                type="text"
                placeholder="Placeholder"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-950 border-b-4 border-b-gray-300 dark:border-b-gray-950 bg-white dark:bg-gray-900 text-[#4b4b4b] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-1">Textarea</label>
              <textarea
                rows={3}
                placeholder="Placeholder"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-950 border-b-4 border-b-gray-300 dark:border-b-gray-950 bg-white dark:bg-gray-900 text-[#4b4b4b] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all resize-none"
              />
            </div>
          </div>
        </section>

        {/* ─── ESPACIADO ─── */}
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Espaciado
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div
                    className="bg-[#1472FF] rounded"
                    style={{ width: n * 4, height: n * 4 }}
                  />
                  <span className="text-xs text-[#777777] dark:text-gray-400">{n}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#777777] dark:text-gray-400">
              Padding típico: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">p-4</code>, <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">px-6 py-4</code>, <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">gap-3</code>, <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">space-y-4</code>. Radios: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">rounded-xl</code>, <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">rounded-2xl</code>.
            </p>
          </div>
        </section>

        {/* ─── DIVISORES ─── */}
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Divisores
          </h2>
          <p className="text-sm text-[#777777] dark:text-gray-400 mb-4">Sin caja alrededor; solo líneas + texto.</p>
          <div className="flex items-center justify-center gap-4 w-full max-w-md mx-auto">
            <div className="flex-1 h-[2px] bg-gray-300 dark:bg-gray-600 rounded-full" />
            <span className="text-sm font-bold text-gray-500 dark:text-white uppercase tracking-wider whitespace-nowrap">Sección</span>
            <div className="flex-1 h-[2px] bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        </section>
      </main>
    </div>
  );
}
