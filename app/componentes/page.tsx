'use client';

import Link from 'next/link';

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
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

            <Block title="Texto" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-4">
                <span className="text-sm font-bold text-[#4b4b4b]">#4b4b4b</span>
                <span className="text-sm text-[#777777]">#777777</span>
                <span className="text-sm text-[#1472FF]">#1472FF</span>
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">text-[#4b4b4b] · text-[#777777]</code>
            </Block>

            <Block title="Botones · Depth" code="border-2 border-b-4 · active:border-b-2 active:mt-[2px]" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">Primary</button>
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-white text-[#4b4b4b] border-2 border-b-4 border-gray-200 border-b-gray-300 hover:bg-gray-50 active:border-b-2 active:mt-[2px] transition-all">Outline</button>
              </div>
            </Block>

            <Block title="Botones icono (+, avatar)" labelClass="text-[#777777]">
              <div className="flex flex-wrap items-center gap-2">
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all" aria-label="Añadir"><PlusIcon /></button>
                <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] text-sm font-bold transition-all cursor-default">PC</div>
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-white text-[#4b4b4b] border-2 border-b-4 border-gray-200 border-b-gray-300 hover:bg-gray-50 active:border-b-2 active:mt-[2px] transition-all" aria-label="Añadir"><PlusIcon /></button>
                <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-white text-[#4b4b4b] border-2 border-b-4 border-gray-200 border-b-gray-300 hover:bg-gray-50 text-sm font-bold transition-all cursor-default">PC</div>
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-transparent text-[#4b4b4b] hover:bg-gray-100 transition-all" aria-label="Añadir"><PlusIcon /></button>
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-transparent text-[#4b4b4b] text-sm font-bold hover:bg-gray-100 transition-all">PC</button>
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">42×42px · Primary · Outline · Ghost (sin contorno, hit zone + hover)</code>
            </Block>

            <Block title="Tipografía" code="Darker Grotesque · tamaños en rem" labelClass="text-[#777777]">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-0.5">Título · <code className="font-mono">text-2xl (1.5rem)</code></p>
                  <p className="font-extrabold tracking-tight text-[#4b4b4b] leading-tight normal-case" style={{ fontSize: '1.5rem' }}>curso personalizado para tu proyecto</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-0.5">Subtítulo · <code className="font-mono">text-lg (1.125rem)</code></p>
                  <p className="font-bold tracking-wide text-[#4b4b4b] normal-case" style={{ fontSize: '1.125rem' }}>Videos a medida con IA</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-0.5">Headline · <code className="font-mono">text-sm (0.875rem)</code></p>
                  <p className="font-bold uppercase tracking-wider text-[#4b4b4b]" style={{ fontSize: '0.875rem' }}>Sección</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-0.5">Body · <code className="font-mono">text-base (1rem)</code></p>
                  <p className="text-[#4b4b4b]" style={{ fontSize: '1rem' }}>Texto de párrafo normal.</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-0.5">Caption · <code className="font-mono">text-xs (0.75rem)</code></p>
                  <p className="text-[#777777]" style={{ fontSize: '0.75rem' }}>Texto secundario o pie.</p>
                </div>
              </div>
              <p className="text-[10px] text-[#777777] mt-2 border-t border-gray-200 pt-2">Regla: títulos y subtítulos en minúsculas, salvo nombre de usuario.</p>
            </Block>

            <Block title="Cards · Neutral / Primary / Completado" code="border-2 border-b-4 · rounded-2xl" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-3">
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-gray-200 border-b-gray-300 bg-white hover:bg-gray-50 active:border-b-2 active:mt-[2px] transition-all">
                  <p className="text-sm font-bold text-[#4b4b4b]">Neutral</p>
                  <p className="text-[10px] text-[#777777] mt-0.5">gray-200/300</p>
                </div>
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF] text-white hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">
                  <p className="text-sm font-bold">Primary</p>
                  <p className="text-[10px] text-white/80 mt-0.5">#1472FF</p>
                </div>
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-[#16a34a] bg-[#22c55e] text-white active:border-b-2 active:mt-[2px] transition-all">
                  <p className="text-sm font-bold">Completado</p>
                  <p className="text-[10px] text-white/80 mt-0.5">#22c55e</p>
                </div>
              </div>
            </Block>

            <Block title="Input · Textarea" code="border-2 border-b-4 · focus:ring-2 focus:ring-[#1472FF]/20" labelClass="text-[#777777]">
              <div className="space-y-3 max-w-xs">
                <input type="text" placeholder="Placeholder" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 border-b-4 border-b-gray-300 bg-white text-[#4b4b4b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all text-sm" />
                <textarea rows={2} placeholder="Placeholder" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 border-b-4 border-b-gray-300 bg-white text-[#4b4b4b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all resize-none text-sm" />
              </div>
            </Block>

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

            <Block title="Divisor" code="h-[2px] · bg-gray-300 · sin caja" labelClass="text-[#777777]">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-[2px] bg-gray-300 rounded-full" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sección</span>
                <div className="flex-1 h-[2px] bg-gray-300 rounded-full" />
              </div>
            </Block>
          </div>

          {/* ─── DERECHA: MODO OSCURO ─── */}
          <div className="space-y-12 rounded-2xl border-2 border-gray-700 bg-gray-900 p-6 lg:p-8">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-white pb-2 border-b-2 border-gray-700">
              Modo oscuro
            </h2>

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

            <Block title="Texto" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-4">
                <span className="text-sm font-bold text-white">white</span>
                <span className="text-sm text-gray-400">gray-400</span>
                <span className="text-sm text-[#1472FF]">#1472FF</span>
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">dark:text-white · dark:text-gray-400</code>
            </Block>

            <Block title="Botones · Depth" code="border-2 border-b-4 · active:border-b-2 active:mt-[2px]" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">Primary</button>
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-gray-900 text-gray-300 border-2 border-b-4 border-gray-950 border-b-gray-950 hover:bg-gray-800 active:border-b-2 active:mt-[2px] transition-all">Outline</button>
              </div>
            </Block>

            <Block title="Botones icono (+, avatar)" labelClass="text-gray-400">
              <div className="flex flex-wrap items-center gap-2">
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all" aria-label="Añadir"><PlusIcon /></button>
                <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] text-sm font-bold transition-all cursor-default">PC</div>
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-gray-900 text-gray-300 border-2 border-b-4 border-gray-950 border-b-gray-950 hover:bg-gray-800 active:border-b-2 active:mt-[2px] transition-all" aria-label="Añadir"><PlusIcon /></button>
                <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-gray-900 text-gray-300 border-2 border-b-4 border-gray-950 border-b-gray-950 hover:bg-gray-800 text-sm font-bold transition-all cursor-default">PC</div>
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-transparent text-gray-300 hover:bg-gray-800 transition-all" aria-label="Añadir"><PlusIcon /></button>
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-transparent text-gray-300 text-sm font-bold hover:bg-gray-800 transition-all">PC</button>
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">42×42px · Primary · Outline · Ghost (sin contorno, hit zone + hover)</code>
            </Block>

            <Block title="Tipografía" code="Darker Grotesque · tamaños en rem" labelClass="text-gray-400">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Título · <code className="font-mono">text-2xl (1.5rem)</code></p>
                  <p className="font-extrabold tracking-tight text-white leading-tight normal-case" style={{ fontSize: '1.5rem' }}>curso personalizado para tu proyecto</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Subtítulo · <code className="font-mono">text-lg (1.125rem)</code></p>
                  <p className="font-bold tracking-wide text-gray-300 normal-case" style={{ fontSize: '1.125rem' }}>Videos a medida con IA</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Headline · <code className="font-mono">text-sm (0.875rem)</code></p>
                  <p className="font-bold uppercase tracking-wider text-gray-300" style={{ fontSize: '0.875rem' }}>Sección</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Body · <code className="font-mono">text-base (1rem)</code></p>
                  <p className="text-gray-300" style={{ fontSize: '1rem' }}>Texto de párrafo normal.</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Caption · <code className="font-mono">text-xs (0.75rem)</code></p>
                  <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>Texto secundario o pie.</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-700 pt-2">Regla: títulos y subtítulos en minúsculas, salvo nombre de usuario.</p>
            </Block>

            <Block title="Cards · Neutral / Primary / Completado" code="border-2 border-b-4 · rounded-2xl" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-3">
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-gray-950 border-b-gray-950 bg-gray-900 hover:bg-gray-800 active:border-b-2 active:mt-[2px] transition-all">
                  <p className="text-sm font-bold text-white">Neutral</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">gray-950 · fondo</p>
                </div>
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF] text-white hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">
                  <p className="text-sm font-bold">Primary</p>
                  <p className="text-[10px] text-white/80 mt-0.5">#1472FF</p>
                </div>
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-[#16a34a] bg-[#22c55e] text-white active:border-b-2 active:mt-[2px] transition-all">
                  <p className="text-sm font-bold">Completado</p>
                  <p className="text-[10px] text-white/80 mt-0.5">#22c55e</p>
                </div>
              </div>
            </Block>

            <Block title="Input · Textarea" code="border-gray-950 · bg-gray-900 · placeholder-gray-500" labelClass="text-gray-400">
              <div className="space-y-3 max-w-xs">
                <input type="text" placeholder="Placeholder" className="w-full px-4 py-3 rounded-xl border-2 border-gray-950 border-b-4 border-b-gray-950 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all text-sm" />
                <textarea rows={2} placeholder="Placeholder" className="w-full px-4 py-3 rounded-xl border-2 border-gray-950 border-b-4 border-b-gray-950 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all resize-none text-sm" />
              </div>
            </Block>

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

            <Block title="Divisor" code="h-[2px] · bg-gray-600 · sin caja" labelClass="text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-[2px] bg-gray-600 rounded-full" />
                <span className="text-sm font-bold text-white uppercase tracking-wider whitespace-nowrap">Sección</span>
                <div className="flex-1 h-[2px] bg-gray-600 rounded-full" />
              </div>
            </Block>
          </div>
        </div>
      </main>
    </div>
  );
}
