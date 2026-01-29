'use client';

import Link from 'next/link';

/**
 * Página oculta de componentes / sistema gráfico.
 * Acceso directo: /componentes — no enlazada desde nav.
 * Izquierda = modo claro · Derecha = modo oscuro.
 */
export default function ComponentesPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Leyenda */}
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
          <div className="space-y-10 rounded-2xl border-2 border-gray-200 bg-white p-6 lg:p-8 min-h-[200px]">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] pb-2 border-b border-gray-200">
              Modo claro
            </h2>

            {/* Colores */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#777777] mb-3">Colores</h3>
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-12 h-12 rounded-xl border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF]" />
                  <span className="text-xs text-[#4b4b4b]">#1472FF</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-12 h-12 rounded-xl border-2 border-b-4 border-gray-300 border-b-gray-400 bg-white" />
                  <span className="text-xs text-[#4b4b4b]">neutral</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-[#777777]">Texto: #4b4b4b, #777777</p>
            </section>

            {/* Botones */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#777777] mb-3">Botones</h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">
                  Primary
                </button>
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-white text-[#4b4b4b] border-2 border-b-4 border-gray-200 border-b-gray-300 hover:bg-gray-50 active:border-b-2 active:mt-[2px] transition-all">
                  Secondary
                </button>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </section>

            {/* Tipografías */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#777777] mb-3">Tipografías</h3>
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold uppercase tracking-tight text-[#4b4b4b] leading-tight">H4 · xl</h4>
                <h5 className="text-lg font-bold uppercase tracking-wide text-[#4b4b4b]">H5 · lg</h5>
                <p className="text-base text-[#4b4b4b]">Body base</p>
                <p className="text-sm text-[#777777]">Body sm</p>
              </div>
            </section>

            {/* Card neutral */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#777777] mb-3">Card neutral</h3>
              <div className="w-40 rounded-2xl p-4 border-2 border-b-4 border-gray-200 border-b-gray-300 bg-white hover:bg-gray-50 active:border-b-2 active:mt-[2px] transition-all">
                <p className="text-sm font-bold text-[#4b4b4b]">Neutral</p>
                <p className="text-xs text-[#777777] mt-0.5">gray-200/300</p>
              </div>
            </section>

            {/* Input */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#777777] mb-3">Input</h3>
              <input
                type="text"
                placeholder="Placeholder"
                className="w-full max-w-xs px-4 py-2 rounded-xl border-2 border-gray-200 border-b-4 border-b-gray-300 bg-white text-[#4b4b4b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all text-sm"
              />
            </section>

            {/* Divisor */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#777777] mb-3">Divisor</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-[2px] bg-gray-300 rounded-full" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sección</span>
                <div className="flex-1 h-[2px] bg-gray-300 rounded-full" />
              </div>
            </section>
          </div>

          {/* ─── DERECHA: MODO OSCURO ─── */}
          <div className="space-y-10 rounded-2xl border-2 border-gray-700 bg-gray-900 p-6 lg:p-8 min-h-[200px]">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-white pb-2 border-b border-gray-700">
              Modo oscuro
            </h2>

            {/* Colores */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Colores</h3>
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-12 h-12 rounded-xl border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF]" />
                  <span className="text-xs text-gray-300">#1472FF</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-12 h-12 rounded-xl border-2 border-b-4 border-gray-600 border-b-gray-700 bg-gray-800" />
                  <span className="text-xs text-gray-300">neutral</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-400">Texto: white, gray-400</p>
            </section>

            {/* Botones */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Botones</h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">
                  Primary
                </button>
                <button className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-gray-800 text-gray-300 border-2 border-b-4 border-gray-950 border-b-gray-950 hover:bg-gray-700 active:border-b-2 active:mt-[2px] transition-all">
                  Secondary
                </button>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </section>

            {/* Tipografías */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Tipografías</h3>
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold uppercase tracking-tight text-white leading-tight">H4 · xl</h4>
                <h5 className="text-lg font-bold uppercase tracking-wide text-white">H5 · lg</h5>
                <p className="text-base text-gray-300">Body base</p>
                <p className="text-sm text-gray-400">Body sm</p>
              </div>
            </section>

            {/* Card neutral */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Card neutral</h3>
              <div className="w-40 rounded-2xl p-4 border-2 border-b-4 border-gray-950 border-b-gray-950 bg-gray-800 hover:bg-gray-700 active:border-b-2 active:mt-[2px] transition-all">
                <p className="text-sm font-bold text-white">Neutral</p>
                <p className="text-xs text-gray-400 mt-0.5">gray-950/800</p>
              </div>
            </section>

            {/* Input */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Input</h3>
              <input
                type="text"
                placeholder="Placeholder"
                className="w-full max-w-xs px-4 py-2 rounded-xl border-2 border-gray-950 border-b-4 border-b-gray-950 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all text-sm"
              />
            </section>

            {/* Divisor */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Divisor</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-[2px] bg-gray-600 rounded-full" />
                <span className="text-sm font-bold text-white uppercase tracking-wider whitespace-nowrap">Sección</span>
                <div className="flex-1 h-[2px] bg-gray-600 rounded-full" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
