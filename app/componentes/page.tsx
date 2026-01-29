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
  const grays = [
    ['200', '#e5e7eb'],
    ['300', '#d1d5db'],
    ['400', '#9ca3af'],
    ['500', '#6b7280'],
    ['600', '#4b5563'],
    ['700', '#374151'],
    ['800', '#1f2937'],
    ['950', '#030712'],
  ] as const;

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

            <Block title="Brand" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-3">
                {[
                  ['#1472FF', '#0E5FCC', 'primary'],
                  ['#22c55e', '#16a34a', 'completado'],
                  ['#5BA0FF', null, 'light'],
                ].map(([bg, border, name]) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-xl border-2 border-b-4" style={{ backgroundColor: bg, borderColor: border || bg }} />
                    <span className="text-[10px] text-[#4b4b4b] font-mono">{bg}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#777777] mt-2">border-b profundidad mismo tono o más oscuro</p>
            </Block>

            <Block title="Neutros (bordes / profundidad)" code="gray-200 → gray-950" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-2">
                {grays.map(([name, hex]) => (
                  <div key={name} className="flex flex-col items-center gap-0.5">
                    <div className="w-10 h-10 rounded-lg border border-gray-300" style={{ backgroundColor: hex }} />
                    <span className="text-[10px] text-[#4b4b4b] font-mono">gray-{name}</span>
                  </div>
                ))}
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
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-white text-[#4b4b4b] border-2 border-b-4 border-gray-200 border-b-gray-300 hover:bg-gray-50 active:border-b-2 active:mt-[2px] transition-all">Secondary</button>
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-white text-[#4b4b4b] border-2 border-b-4 border-gray-200 border-b-gray-300 hover:bg-gray-50 active:border-b-2 active:mt-[2px] transition-all">Outline</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button className="px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">Nav active</button>
                <button className="px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-wide bg-transparent text-[#4b4b4b] hover:bg-gray-100 active:border-b-2 active:mt-[2px] transition-all">Nav inactive</button>
              </div>
            </Block>

            <Block title="Botones · Flat (sin profundidad)" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide bg-transparent text-[#4b4b4b] hover:bg-gray-100 transition-all">Ghost</button>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-transparent text-[#4b4b4b] hover:bg-gray-100 transition-all"><PlusIcon /></button>
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">ghost · icon-ghost</code>
            </Block>

            <Block title="Botones · Tamaños" code="sm · md · lg · xl · icon" labelClass="text-[#777777]">
              <div className="flex flex-wrap items-center gap-2">
                <button className="px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-xl bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">sm</button>
                <button className="px-4 py-3 text-sm font-bold uppercase tracking-wide rounded-xl bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">md</button>
                <button className="px-6 py-3 text-sm font-bold uppercase tracking-wide rounded-xl bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">lg</button>
                <button className="px-6 py-4 text-base font-bold uppercase tracking-wide rounded-xl bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">xl</button>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all"><PlusIcon /></button>
              </div>
            </Block>

            <Block title="IconButton · sm / lg / as div" labelClass="text-[#777777]">
              <div className="flex flex-wrap items-center gap-2">
                <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all"><PlusIcon /></button>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] text-sm font-bold">PC</div>
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">IconButton size=sm | lg, as=div</code>
            </Block>

            <Block title="Tipografías · Headings" code="Darker Grotesque · uppercase · tracking-tight/wide" labelClass="text-[#777777]">
              <div className="space-y-1">
                {[
                  ['text-4xl font-extrabold tracking-tight', 'H1'],
                  ['text-3xl font-extrabold tracking-tight', 'H2'],
                  ['text-2xl font-extrabold tracking-tight', 'H3'],
                  ['text-xl font-extrabold tracking-tight', 'H4'],
                  ['text-lg font-bold tracking-wide', 'H5'],
                  ['text-base font-bold tracking-wide', 'H6'],
                ].map(([cls, label]) => (
                  <div key={label}>
                    <span className={`${cls} text-[#4b4b4b] leading-tight`}>{label}</span>
                    <code className="text-[10px] text-[#777777] font-mono ml-2">{cls}</code>
                  </div>
                ))}
              </div>
            </Block>

            <Block title="Tipografías · Body" labelClass="text-[#777777]">
              <div className="space-y-1">
                <p className="text-base text-[#4b4b4b]">Body base · text-base</p>
                <p className="text-sm text-[#777777]">Body sm · text-sm</p>
                <p className="text-xs text-[#777777]">Body xs · text-xs</p>
              </div>
            </Block>

            <Block title="Tamaños de texto" code="xs → 6xl" labelClass="text-[#777777]">
              <div className="space-y-0.5">
                {[
                  ['xs', 'text-xs'],
                  ['sm', 'text-sm'],
                  ['base', 'text-base'],
                  ['lg', 'text-lg'],
                  ['xl', 'text-xl'],
                  ['2xl', 'text-2xl'],
                  ['3xl', 'text-3xl'],
                  ['4xl', 'text-4xl'],
                  ['5xl', 'text-5xl'],
                  ['6xl', 'text-6xl'],
                ].map(([s, cls]) => (
                  <p key={s} className={`${cls} text-[#4b4b4b]`}>text-{s}</p>
                ))}
              </div>
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

            <Block title="Brand" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-3">
                {[
                  ['#1472FF', '#0E5FCC', 'primary'],
                  ['#22c55e', '#16a34a', 'completado'],
                  ['#5BA0FF', null, 'light'],
                ].map(([bg, border, name]) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-xl border-2 border-b-4" style={{ backgroundColor: bg, borderColor: border || bg }} />
                    <span className="text-[10px] text-gray-300 font-mono">{bg}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">border-b profundidad mismo tono o más oscuro</p>
            </Block>

            <Block title="Neutros (bordes / profundidad)" code="gray-600 → gray-950" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-2">
                {grays.map(([name, hex]) => (
                  <div key={name} className="flex flex-col items-center gap-0.5">
                    <div className="w-10 h-10 rounded-lg border border-gray-600" style={{ backgroundColor: hex }} />
                    <span className="text-[10px] text-gray-300 font-mono">gray-{name}</span>
                  </div>
                ))}
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
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-gray-800 text-gray-300 border-2 border-b-4 border-gray-950 border-b-gray-950 hover:bg-gray-700 active:border-b-2 active:mt-[2px] transition-all">Secondary</button>
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-gray-900 text-gray-300 border-2 border-b-4 border-gray-950 border-b-gray-950 hover:bg-gray-800 active:border-b-2 active:mt-[2px] transition-all">Outline</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button className="px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">Nav active</button>
                <button className="px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-wide bg-transparent text-gray-300 hover:bg-gray-800 active:border-b-2 active:mt-[2px] transition-all">Nav inactive</button>
              </div>
            </Block>

            <Block title="Botones · Flat" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide bg-transparent text-gray-300 hover:bg-gray-800 transition-all">Ghost</button>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-transparent text-gray-300 hover:bg-gray-800 transition-all"><PlusIcon /></button>
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">ghost · icon-ghost</code>
            </Block>

            <Block title="Botones · Tamaños" code="sm · md · lg · xl · icon" labelClass="text-gray-400">
              <div className="flex flex-wrap items-center gap-2">
                <button className="px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-xl bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">sm</button>
                <button className="px-4 py-3 text-sm font-bold uppercase tracking-wide rounded-xl bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">md</button>
                <button className="px-6 py-3 text-sm font-bold uppercase tracking-wide rounded-xl bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">lg</button>
                <button className="px-6 py-4 text-base font-bold uppercase tracking-wide rounded-xl bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">xl</button>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all"><PlusIcon /></button>
              </div>
            </Block>

            <Block title="IconButton · sm / lg / as div" labelClass="text-gray-400">
              <div className="flex flex-wrap items-center gap-2">
                <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all"><PlusIcon /></button>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] text-sm font-bold">PC</div>
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">IconButton size=sm | lg, as=div</code>
            </Block>

            <Block title="Tipografías · Headings" code="Darker Grotesque · uppercase · tracking-tight/wide" labelClass="text-gray-400">
              <div className="space-y-1">
                {[
                  ['text-4xl font-extrabold tracking-tight', 'H1'],
                  ['text-3xl font-extrabold tracking-tight', 'H2'],
                  ['text-2xl font-extrabold tracking-tight', 'H3'],
                  ['text-xl font-extrabold tracking-tight', 'H4'],
                  ['text-lg font-bold tracking-wide', 'H5'],
                  ['text-base font-bold tracking-wide', 'H6'],
                ].map(([cls, label]) => (
                  <div key={label}>
                    <span className={`${cls} text-white leading-tight`}>{label}</span>
                    <code className="text-[10px] text-gray-400 font-mono ml-2">{cls}</code>
                  </div>
                ))}
              </div>
            </Block>

            <Block title="Tipografías · Body" labelClass="text-gray-400">
              <div className="space-y-1">
                <p className="text-base text-gray-300">Body base · text-base</p>
                <p className="text-sm text-gray-400">Body sm · text-sm</p>
                <p className="text-xs text-gray-400">Body xs · text-xs</p>
              </div>
            </Block>

            <Block title="Tamaños de texto" code="xs → 6xl" labelClass="text-gray-400">
              <div className="space-y-0.5">
                {[
                  ['xs', 'text-xs'],
                  ['sm', 'text-sm'],
                  ['base', 'text-base'],
                  ['lg', 'text-lg'],
                  ['xl', 'text-xl'],
                  ['2xl', 'text-2xl'],
                  ['3xl', 'text-3xl'],
                  ['4xl', 'text-4xl'],
                  ['5xl', 'text-5xl'],
                  ['6xl', 'text-6xl'],
                ].map(([s, cls]) => (
                  <p key={s} className={`${cls} text-gray-300`}>text-{s}</p>
                ))}
              </div>
            </Block>

            <Block title="Cards · Neutral / Primary / Completado" code="border-2 border-b-4 · rounded-2xl" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-3">
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-gray-950 border-b-gray-950 bg-gray-800 hover:bg-gray-700 active:border-b-2 active:mt-[2px] transition-all">
                  <p className="text-sm font-bold text-white">Neutral</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">gray-950/800</p>
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
