'use client';

import Link from 'next/link';
import { DEPTH_BORDER_PX, DEPTH_BOTTOM_PX, DEPTH_ACTIVE_BOTTOM_PX, DEPTH_ACTIVE_MT_PX } from '@/lib/design-tokens';
import CompositeCard from '@/components/shared/CompositeCard';
import HorizontalScroll from '@/components/shared/HorizontalScroll';
import VerticalScroll from '@/components/shared/VerticalScroll';
import IconButton from '@/components/shared/IconButton';

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
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
        {/* Tokens: estándar botón — cambiar en lib/design-tokens.ts actualiza todo el sistema */}
        <section className="mb-10 p-6 rounded-2xl border-2 border-b-4 border-gray-200 dark:border-gray-800 border-b-gray-300 dark:border-b-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white pb-2 border-b-2 border-gray-200 dark:border-gray-950 mb-4">
            Tokens · Estándar botón y profundidad
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-1">Contorno</p>
              <p className="font-mono text-[#4b4b4b] dark:text-white">{DEPTH_BORDER_PX}px · <code>border-2</code></p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-1">Profundidad</p>
              <p className="font-mono text-[#4b4b4b] dark:text-white">{DEPTH_BOTTOM_PX}px · <code>border-b-4</code></p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-1">Active (bottom)</p>
              <p className="font-mono text-[#4b4b4b] dark:text-white">{DEPTH_ACTIVE_BOTTOM_PX}px · <code>active:border-b-2</code></p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-1">Active (mt)</p>
              <p className="font-mono text-[#4b4b4b] dark:text-white">{DEPTH_ACTIVE_MT_PX}px · <code>active:mt-[2px]</code></p>
            </div>
          </div>
          <p className="text-xs text-[#777777] dark:text-gray-400 mt-3">
            Fuente: <code className="font-mono">lib/design-tokens.ts</code>. Botones y cards con profundidad usan estos valores.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#1472FF]" />
            <span className="text-sm font-bold uppercase tracking-wide text-[#4b4b4b]">Modo claro</span>
          </div>
          <div className="rounded-xl border-2 border-gray-950 bg-gray-900 p-4 flex items-center gap-3">
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1">Primario</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-[42px] h-[42px] rounded-xl border border-gray-300 bg-white" />
                      <span className="text-[10px] text-[#4b4b4b] font-mono">Blanco</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1">Secundario</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-[42px] h-[42px] rounded-xl border border-gray-300 bg-gray-300" />
                      <span className="text-[10px] text-[#4b4b4b] font-mono">gray-300</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1">Terciario (contorno y profundidad)</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-[42px] h-[42px] rounded-xl border border-[#aeb3bb] bg-[#aeb3bb]" />
                      <span className="text-[10px] text-[#4b4b4b] font-mono">#aeb3bb</span>
                    </div>
                  </div>
                </div>
              </div>
            </Block>

            <Block title="Texto" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-4">
                <span className="text-sm font-bold text-[#4b4b4b]">Negro</span>
                <span className="text-sm text-[#777777]">Gris</span>
                <span className="text-sm text-[#1472FF]">Azul</span>
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">#4b4b4b · #777777 · #1472FF</code>
            </Block>

            <Block title="Botones · Depth" code="border-2 border-b-4 · active:border-b-2 active:mt-[2px]" labelClass="text-[#777777]">
              <div className="flex flex-wrap gap-2">
                <button className="min-h-[40px] flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] active:border-b-2 active:mt-[2px] transition-all">Primary</button>
                <button className="min-h-[40px] flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-white text-[#4b4b4b] border-2 border-b-4 border-gray-200 border-b-gray-300 hover:bg-gray-300 active:border-b-2 active:mt-[2px] transition-all">Outline</button>
                <button className="min-h-[40px] flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-gray-300 text-[#4b4b4b] border-2 border-b-4 border-[#aeb3bb] border-b-[#aeb3bb] hover:bg-[#aeb3bb] active:border-b-2 active:mt-[2px] transition-all">Nav Bar</button>
              </div>
              <p className="text-[10px] text-[#777777] mt-2 border-t border-gray-200 pt-2">Regla: misma altura siempre — <code className="font-mono">px-4 py-2</code>, <code className="font-mono">text-sm</code>, <code className="font-mono">min-h-[40px]</code>.</p>
            </Block>

            <Block title="Botones icono (+, avatar)" labelClass="text-[#777777]">
              <div className="flex flex-wrap items-center gap-2">
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] active:border-b-2 active:mt-[2px] transition-all" aria-label="Añadir"><PlusIcon /></button>
                <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] text-sm font-bold transition-all cursor-default">PC</div>
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-white text-[#4b4b4b] border-2 border-b-4 border-gray-200 border-b-gray-300 hover:bg-gray-300 active:border-b-2 active:mt-[2px] transition-all" aria-label="Añadir"><PlusIcon /></button>
                <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-white text-[#4b4b4b] border-2 border-b-4 border-gray-200 border-b-gray-300 hover:bg-gray-300 text-sm font-bold transition-all cursor-default">PC</div>
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
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF] text-white hover:bg-[#0E5FCC] active:border-b-2 active:mt-[2px] transition-all">
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

            <Block title="Caja compuesta" code="leading · content · trailing · depth card" labelClass="text-[#777777]">
              <p className="text-[10px] text-[#777777] mb-2">Selector de proyecto, etc. Misma depth que cards. Slots: botón izq, texto centro, botón der.</p>
              <div className="relative w-full max-w-md rounded-2xl border-2 border-gray-200 border-b-4 border-b-gray-300 bg-white p-3">
                <button className="absolute left-2 top-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-xl border-2 border-b-4 border-gray-200 border-b-gray-300 bg-gray-100 flex items-center justify-center text-gray-400" aria-hidden>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="pl-14 pr-14 text-center min-w-0">
                  <p className="text-xs text-[#777777] line-clamp-2">Resumen del proyecto en dos líneas…</p>
                  <div className="flex justify-center gap-1.5 mt-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#1472FF]" /></div>
                </div>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-xl border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF] text-white flex items-center justify-center" aria-hidden>
                  <PlusIcon />
                </button>
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">rounded-2xl border-2 border-b-4 · px · py</code>
            </Block>

            <Block title="Scroll horizontal" code="overflow-x-auto · scrollbar-hide · gap · py" labelClass="text-[#777777]">
              <p className="text-[10px] text-[#777777] mb-2">Pestañas de fases, strips. Opcional: gradientes en bordes.</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 -mx-1">
                {['Fase 1', 'Fase 2', 'Fase 3'].map((l, i) => (
                  <span key={l} className={`flex-shrink-0 min-h-[40px] inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border-2 border-b-4 ${i === 0 ? 'bg-[#1472FF] text-white border-[#0E5FCC]' : 'bg-white text-[#4b4b4b] border-gray-200 border-b-gray-300'}`}>{l}</span>
                ))}
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">flex gap-2 overflow-x-auto scrollbar-hide</code>
            </Block>

            <Block title="Scroll vertical" code="overflow-y-auto · overflow-x-hidden · depth" labelClass="text-[#777777]">
              <p className="text-[10px] text-[#777777] mb-2">Contenido principal, listas, chat. Altura fija para que el scroll se vea.</p>
              <div className="max-h-36 overflow-y-auto overflow-x-hidden rounded-2xl border-2 border-gray-200 border-b-4 border-b-gray-300 bg-white p-3 space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <p key={n} className="text-sm text-[#4b4b4b]">Línea {n}</p>
                ))}
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">max-h-36 overflow-y-auto · border-2 border-b-4</code>
            </Block>

            <Block title="Progress bar" code="h-[37px] · depth · fill verde" labelClass="text-[#777777]">
              <p className="text-[10px] text-[#777777] mb-2">Avance de curso, lecciones completadas.</p>
              <div className="w-full max-w-sm relative h-[37px] rounded-xl overflow-hidden flex items-center justify-center border-2 border-gray-200 border-b-4 border-b-gray-300 bg-gray-100">
                <div className="absolute left-0 top-0 h-full w-[40%] rounded-l-xl bg-[#22c55e]" />
                <span className="relative z-10 text-sm font-bold uppercase tracking-wide text-[#4b4b4b]">40% (2 de 5)</span>
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">border-2 border-b-4 · bg-[#22c55e] fill</code>
            </Block>

            <Block title="Chatbot" code="burbujas depth · textarea · enviar" labelClass="text-[#777777]">
              <p className="text-[10px] text-[#777777] mb-2">User: Secundario (gray-300) + Terciario (#aeb3bb) contorno/profundidad. IA: neutral. Input crece vertical hasta 5 líneas.</p>
              <div className="space-y-4 max-w-xs">
                <div className="flex justify-end">
                  <div className="px-4 py-3 rounded-2xl border-2 border-b-4 bg-gray-300 border-[#aeb3bb] border-b-[#aeb3bb]">
                    <p className="text-sm text-[#4b4b4b]">Mensaje usuario</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl border-2 border-b-4 border-gray-200 border-b-gray-300 bg-white max-w-[85%]">
                    <p className="text-sm text-[#4b4b4b]">Respuesta IA</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl border-2 border-b-4 border-gray-200 border-b-gray-300 bg-white flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#1472FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#1472FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#1472FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
                <textarea rows={1} placeholder="Escribe tu mensaje…" className="w-full min-h-[3rem] max-h-[7.5rem] px-4 py-3 rounded-xl border-2 border-gray-200 border-b-4 border-b-gray-300 bg-white text-sm text-[#4b4b4b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 resize-none overflow-y-auto" />
                <button type="button" className="w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] active:border-b-2 active:mt-[2px] transition-all">Enviar</button>
              </div>
              <code className="text-[10px] text-[#777777] block mt-1 font-mono">user Secundario+Terciario · textarea max 5 líneas</code>
            </Block>
          </div>

          {/* ─── DERECHA: MODO OSCURO ─── */}
          <div className="space-y-12 rounded-2xl border-2 border-gray-950 bg-gray-800 p-6 lg:p-8">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-white pb-2 border-b-2 border-gray-950">
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Primario</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-[42px] h-[42px] rounded-xl border border-gray-600 bg-gray-800" />
                      <span className="text-[10px] text-gray-300 font-mono">gray-800</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Secundario</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-[42px] h-[42px] rounded-xl border border-gray-600 bg-gray-900" />
                      <span className="text-[10px] text-gray-300 font-mono">gray-900</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Terciario (contorno y profundidad)</p>
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
                <span className="text-sm font-bold text-white">Blanco</span>
                <span className="text-sm text-gray-400">Gris</span>
                <span className="text-sm text-[#1472FF]">Azul</span>
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">dark:text-white · dark:text-gray-400 · #1472FF</code>
            </Block>

            <Block title="Botones · Depth" code="border-2 border-b-4 · active:border-b-2 active:mt-[2px]" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-2">
                <button className="min-h-[40px] flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] active:border-b-2 active:mt-[2px] transition-all">Primary</button>
                <button className="min-h-[40px] flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-gray-800 text-gray-300 border-2 border-b-4 border-gray-900 border-b-gray-900 hover:bg-gray-900 active:border-b-2 active:mt-[2px] transition-all">Outline</button>
                <button className="min-h-[40px] flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide bg-gray-900 text-gray-300 border-2 border-b-4 border-gray-900 border-b-gray-900 hover:bg-gray-900 active:border-b-2 active:mt-[2px] transition-all">Nav Bar</button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-950 pt-2">Regla: misma altura siempre — <code className="font-mono">px-4 py-2</code>, <code className="font-mono">text-sm</code>, <code className="font-mono">min-h-[40px]</code>.</p>
            </Block>

            <Block title="Botones icono (+, avatar)" labelClass="text-gray-400">
              <div className="flex flex-wrap items-center gap-2">
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] active:border-b-2 active:mt-[2px] transition-all" aria-label="Añadir"><PlusIcon /></button>
                <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] text-sm font-bold transition-all cursor-default">PC</div>
                <button className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-gray-800 text-gray-300 border-2 border-b-4 border-gray-900 border-b-gray-900 hover:bg-gray-900 active:border-b-2 active:mt-[2px] transition-all" aria-label="Añadir"><PlusIcon /></button>
                <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center bg-gray-800 text-gray-300 border-2 border-b-4 border-gray-900 border-b-gray-900 hover:bg-gray-900 text-sm font-bold transition-all cursor-default">PC</div>
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
              <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-950 pt-2">Regla: títulos y subtítulos en minúsculas, salvo nombre de usuario.</p>
            </Block>

            <Block title="Cards · Neutral / Primary / Completado" code="border-2 border-b-4 · rounded-2xl" labelClass="text-gray-400">
              <div className="flex flex-wrap gap-3">
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-gray-900 border-b-gray-900 bg-gray-800 hover:bg-gray-900 active:border-b-2 active:mt-[2px] transition-all">
                  <p className="text-sm font-bold text-white">Neutral</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">gray-800 · fondo</p>
                </div>
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF] text-white hover:bg-[#0E5FCC] active:border-b-2 active:mt-[2px] transition-all">
                  <p className="text-sm font-bold">Primary</p>
                  <p className="text-[10px] text-white/80 mt-0.5">#1472FF</p>
                </div>
                <div className="w-36 rounded-2xl p-4 border-2 border-b-4 border-[#16a34a] bg-[#22c55e] text-white active:border-b-2 active:mt-[2px] transition-all">
                  <p className="text-sm font-bold">Completado</p>
                  <p className="text-[10px] text-white/80 mt-0.5">#22c55e</p>
                </div>
              </div>
            </Block>

            <Block title="Input · Textarea" code="border-gray-900 · bg-gray-800 · placeholder-gray-500" labelClass="text-gray-400">
              <div className="space-y-3 max-w-xs">
                <input type="text" placeholder="Placeholder" className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 border-b-4 border-b-gray-900 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all text-sm" />
                <textarea rows={2} placeholder="Placeholder" className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 border-b-4 border-b-gray-900 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all resize-none text-sm" />
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

            <Block title="Divisor" code="h-[2px] · bg-gray-950 · sin caja" labelClass="text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-[2px] bg-gray-950 rounded-full" />
                <span className="text-sm font-bold text-white uppercase tracking-wider whitespace-nowrap">Sección</span>
                <div className="flex-1 h-[2px] bg-gray-950 rounded-full" />
              </div>
            </Block>

            <Block title="Caja compuesta" code="leading · content · trailing · depth card" labelClass="text-gray-400">
              <p className="text-[10px] text-gray-400 mb-2">Misma estructura. Fondos gray-800/950.</p>
              <div className="relative w-full max-w-md rounded-2xl border-2 border-gray-900 border-b-4 border-b-gray-900 bg-gray-800 p-3">
                <button className="absolute left-2 top-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-xl border-2 border-b-4 border-gray-900 bg-gray-800 flex items-center justify-center text-gray-400" aria-hidden>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="pl-14 pr-14 text-center min-w-0">
                  <p className="text-xs text-gray-400 line-clamp-2">Resumen del proyecto en dos líneas…</p>
                  <div className="flex justify-center gap-1.5 mt-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#1472FF]" /></div>
                </div>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-xl border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF] text-white flex items-center justify-center" aria-hidden>
                  <PlusIcon />
                </button>
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">border-gray-900 · bg-gray-800</code>
            </Block>

            <Block title="Scroll horizontal" code="overflow-x-auto · scrollbar-hide" labelClass="text-gray-400">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 -mx-1">
                {['Fase 1', 'Fase 2', 'Fase 3'].map((l, i) => (
                  <span key={l} className={`flex-shrink-0 min-h-[40px] inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border-2 border-b-4 ${i === 0 ? 'bg-[#1472FF] text-white border-[#0E5FCC]' : 'bg-gray-800 text-gray-300 border-gray-900 border-b-gray-900'}`}>{l}</span>
                ))}
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">flex gap-2 overflow-x-auto scrollbar-hide</code>
            </Block>

            <Block title="Scroll vertical" code="overflow-y-auto · overflow-x-hidden · depth" labelClass="text-gray-400">
              <div className="max-h-36 overflow-y-auto overflow-x-hidden rounded-2xl border-2 border-gray-900 border-b-4 border-b-gray-900 bg-gray-800 p-3 space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <p key={n} className="text-sm text-gray-300">Línea {n}</p>
                ))}
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">max-h-36 overflow-y-auto · border-gray-900</code>
            </Block>

            <Block title="Progress bar" code="h-[37px] · depth · fill verde" labelClass="text-gray-400">
              <div className="w-full max-w-sm relative h-[37px] rounded-xl overflow-hidden flex items-center justify-center border-2 border-gray-900 border-b-4 border-b-gray-900 bg-gray-800">
                <div className="absolute left-0 top-0 h-full w-[40%] rounded-l-xl bg-[#22c55e]" />
                <span className="relative z-10 text-sm font-bold uppercase tracking-wide text-white">40% (2 de 5)</span>
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">bg-gray-800 · fill #22c55e</code>
            </Block>

            <Block title="Chatbot" code="burbujas depth · textarea · enviar" labelClass="text-gray-400">
              <p className="text-[10px] text-gray-400 mb-2">User: Secundario (gray-900) + Terciario (gray-950). Textarea crece hasta 5 líneas.</p>
              <div className="space-y-4 max-w-xs">
                <div className="flex justify-end">
                  <div className="px-4 py-3 rounded-2xl border-2 border-b-4 bg-gray-900 border-gray-900 border-b-gray-900">
                    <p className="text-sm text-white">Mensaje usuario</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl border-2 border-b-4 border-gray-900 border-b-gray-900 bg-gray-800 max-w-[85%]">
                    <p className="text-sm text-gray-300">Respuesta IA</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl border-2 border-b-4 border-gray-900 border-b-gray-900 bg-gray-800 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#1472FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#1472FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#1472FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
                <textarea rows={1} placeholder="Escribe tu mensaje…" className="w-full min-h-[3rem] max-h-[7.5rem] px-4 py-3 rounded-xl border-2 border-gray-900 border-b-4 border-b-gray-900 bg-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 resize-none overflow-y-auto" />
                <button type="button" className="w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] active:border-b-2 active:mt-[2px] transition-all">Enviar</button>
              </div>
              <code className="text-[10px] text-gray-400 block mt-1 font-mono">user Secundario+Terciario · textarea max 5 líneas</code>
            </Block>
          </div>
        </div>

        {/* Navbar (landing) — estructura y colores */}
        <section className="mt-12 p-6 rounded-2xl border-2 border-b-4 border-gray-200 dark:border-gray-800 border-b-gray-300 dark:border-b-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white pb-2 border-b-2 border-gray-200 dark:border-gray-950 mb-4">
            Navbar (landing)
          </h2>
          <p className="text-sm text-[#4b4b4b] dark:text-gray-300 mb-4">
            Logo | links centrados (Cómo Funciona, Cursos, Precios, FAQ) | CTA. Scrolled: <code className="font-mono text-xs">backdrop-blur bg-white/50 dark:bg-gray-900/50</code>. Indicador pill: <code className="font-mono text-xs">bg-gray-200 dark:bg-gray-700 border-b-4 border-gray-400 dark:border-gray-600</code>. Links: <code className="font-mono text-xs">text-[#4b4b4b] dark:text-white</code> activo, <code className="font-mono text-xs">text-gray-600 dark:text-gray-300</code> inactivo.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
            <div className="h-6 w-20 rounded bg-gray-300 dark:bg-gray-600" />
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Link 1</span>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase text-[#4b4b4b] dark:text-white bg-gray-200 dark:bg-gray-700 border-2 border-b-4 border-gray-400 dark:border-gray-600">Activo</span>
            </div>
            <span className="px-4 py-2 rounded-xl text-sm font-bold uppercase bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC]">CTA</span>
          </div>
          <p className="text-xs text-[#777777] dark:text-gray-400 mt-3">Componente: <code className="font-mono">components/shared/Navbar.tsx</code>. Solo en <code className="font-mono">/</code>.</p>
        </section>

        {/* Componentes compartidos vivos — cambiar en shared actualiza dashboard y aquí */}
        <section className="mt-12 p-6 rounded-2xl border-2 border-b-4 border-gray-200 dark:border-gray-800 border-b-gray-300 dark:border-b-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#4b4b4b] dark:text-white pb-2 border-b-2 border-gray-200 dark:border-gray-950 mb-4">
            Componentes compartidos (live)
          </h2>
          <p className="text-sm text-[#4b4b4b] dark:text-gray-300 mb-4">
            <strong>CompositeCard</strong>, <strong>HorizontalScroll</strong>, <strong>VerticalScroll</strong>, <strong>Progress bar</strong>. Usados en dashboard (selector, fases, scroll, progreso). <strong>Chatbot</strong> (burbujas, input, enviar) en Tutor IA / FAB; aún sin componente compartido — bloques arriba para iterar.
          </p>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-2">CompositeCard</p>
              <div className="max-w-md">
                <CompositeCard
                  leading={
                    <button className="w-[42px] h-[42px] rounded-xl border-2 border-b-4 border-gray-200 dark:border-gray-950 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400" aria-hidden>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                  }
                  trailing={
                    <IconButton aria-label="Añadir">
                      <PlusIcon />
                    </IconButton>
                  }
                >
                  <p className="text-xs text-[#777777] dark:text-gray-400 line-clamp-2">Resumen del proyecto en dos líneas…</p>
                  <div className="flex justify-center gap-1.5 mt-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#1472FF]" /></div>
                </CompositeCard>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-2">HorizontalScroll</p>
              <HorizontalScroll fadeEdges>
                {['Fase 1', 'Fase 2', 'Fase 3'].map((l, i) => (
                  <span key={l} className={`flex-shrink-0 min-h-[40px] inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border-2 border-b-4 ${i === 0 ? 'bg-[#1472FF] text-white border-[#0E5FCC]' : 'bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border-gray-200 dark:border-gray-700 border-b-gray-300 dark:border-b-gray-700'}`}>{l}</span>
                ))}
              </HorizontalScroll>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-2">VerticalScroll</p>
              <VerticalScroll className="max-h-36 rounded-2xl border-2 border-gray-200 dark:border-gray-950 border-b-4 border-b-gray-300 dark:border-b-gray-950 bg-white dark:bg-gray-800 p-3 space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <p key={n} className="text-sm text-[#4b4b4b] dark:text-gray-300">Línea {n}</p>
                ))}
              </VerticalScroll>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400 mb-2">Progress bar</p>
              <div className="w-full max-w-sm relative h-[37px] rounded-xl overflow-hidden flex items-center justify-center border-2 border-gray-200 dark:border-gray-950 border-b-4 border-b-gray-300 dark:border-b-gray-950 bg-gray-100 dark:bg-gray-800">
                <div className="absolute left-0 top-0 h-full w-[40%] rounded-l-xl bg-[#22c55e]" />
                <span className="relative z-10 text-sm font-bold uppercase tracking-wide text-[#4b4b4b] dark:text-white">40% (2 de 5)</span>
              </div>
            </div>
          </div>
        </section>

        <p className="mt-10 text-center text-sm text-[#777777] dark:text-gray-400">
          <strong>Regla:</strong> Todo nuevo UI debe usar solo estos componentes y tokens. Cambiar en <code className="font-mono">lib/design-tokens</code> o en <code className="font-mono">components/shared</code> actualiza el sistema.
        </p>
      </main>
    </div>
  );
}
