'use client';

import Button from '@/components/ui/Button';
import { CardFlat } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Headline, Body, Caption } from '@/components/ui/Typography';

// Simulated exercise data
const exercise = {
  number: 1,
  phase: 1,
  type: 'Prompt',
  title: 'Identificar tus 10 preguntas más frecuentes',
  description: 'Revisa las últimas 50 conversaciones con clientes y extrae las 10 preguntas que más se repiten.',
  deliverable: 'Lista de 10 preguntas con su frecuencia',
  time_minutes: 20,
  difficulty: 1,
  isCompleted: false,
  isUnlocked: false,
  isLocked: true,
};

export default function RetoPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
      <h1 className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white mb-2">comparación de diseños — reto de fase</h1>
      <p className="text-[#777777] dark:text-gray-400 mb-8">4 opciones de minimalista a detallado. Todas en max-w-[220px] (el ancho real del timeline).</p>

      <div className="flex gap-8 overflow-x-auto pb-8">

        {/* ─── OPCIÓN A: Ultra minimalista ─── */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción a — minimalista</Headline>
          <div className="w-[220px]">
            <div className={`rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 text-center ${exercise.isLocked ? 'opacity-50' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#777777] dark:text-gray-400 mb-1">reto de la fase</p>
              <p className="text-sm font-bold text-[#4b4b4b] dark:text-white leading-snug">
                {exercise.title}
              </p>
              <p className="text-xs text-[#777777] dark:text-gray-400 mt-2">
                Completa los videos para desbloquear
              </p>
            </div>
          </div>
        </div>

        {/* ─── OPCIÓN B: Limpio con icono lateral ─── */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción b — limpio</Headline>
          <div className="w-[220px]">
            <CardFlat className={`${exercise.isLocked ? 'opacity-50' : ''}`}>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#777777] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#777777] dark:text-gray-400">reto</p>
                    <Caption>{exercise.time_minutes} min</Caption>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#4b4b4b] dark:text-white leading-snug mb-4">
                  {exercise.title}
                </p>
                <Button variant="outline" size="sm" disabled className="w-full">
                  Desbloquear con videos
                </Button>
              </div>
            </CardFlat>
          </div>
        </div>

        {/* ─── OPCIÓN C: Compacto con metadatos ─── */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción c — con meta</Headline>
          <div className="w-[220px]">
            <CardFlat className={`${exercise.isLocked ? 'opacity-50' : ''}`}>
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#777777] dark:text-gray-400">reto</p>
                  <Tag variant="neutral" className="!text-[10px] !px-2 !py-0.5">{exercise.type}</Tag>
                </div>
                <p className="text-sm font-bold text-[#4b4b4b] dark:text-white leading-snug mb-2">
                  {exercise.title}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <Caption>{exercise.time_minutes} min</Caption>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i <= exercise.difficulty ? 'bg-[#1472FF]' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#777777] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <Caption>Completa los videos para desbloquear</Caption>
                </div>
              </div>
            </CardFlat>
          </div>
        </div>

        {/* ─── OPCIÓN D: Detallado con descripción ─── */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción d — detallado</Headline>
          <div className="w-[220px]">
            <CardFlat className={`${exercise.isLocked ? 'opacity-50' : ''}`}>
              <div className="p-5 space-y-4">
                {/* Top label row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#777777] dark:text-gray-400">reto</p>
                  </div>
                  <Tag variant="neutral" className="!text-[10px] !px-2 !py-0.5">{exercise.type}</Tag>
                </div>

                {/* Title */}
                <p className="text-sm font-bold text-[#4b4b4b] dark:text-white leading-snug">
                  {exercise.title}
                </p>

                {/* Description */}
                <Caption className="leading-relaxed line-clamp-3">{exercise.description}</Caption>

                {/* Meta row */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <Caption>{exercise.time_minutes} min</Caption>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i <= exercise.difficulty ? 'bg-[#1472FF]' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Button variant="outline" size="sm" disabled className="w-full">
                  Completa los videos
                </Button>
              </div>
            </CardFlat>
          </div>
        </div>

      </div>

      {/* ── STATES: Same options but UNLOCKED ── */}
      <h2 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white mt-12 mb-2">estado: desbloqueado</h2>
      <p className="text-[#777777] dark:text-gray-400 mb-8">Cuando el usuario ya completó los videos necesarios.</p>

      <div className="flex gap-8 overflow-x-auto pb-8">

        {/* A Unlocked */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción a</Headline>
          <div className="w-[220px]">
            <div className="rounded-2xl border-2 border-[#1472FF] dark:border-[#1472FF] p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[#1472FF] flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#1472FF] mb-1">reto de la fase</p>
              <p className="text-sm font-bold text-[#4b4b4b] dark:text-white leading-snug">
                {exercise.title}
              </p>
              <Button variant="primary" size="sm" className="w-full mt-3">
                Marcar completado
              </Button>
            </div>
          </div>
        </div>

        {/* B Unlocked */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción b</Headline>
          <div className="w-[220px]">
            <CardFlat>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1472FF]/10 dark:bg-[#1472FF]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#1472FF]">reto</p>
                    <Caption>{exercise.time_minutes} min</Caption>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#4b4b4b] dark:text-white leading-snug mb-4">
                  {exercise.title}
                </p>
                <Button variant="primary" size="sm" className="w-full">
                  Marcar completado
                </Button>
              </div>
            </CardFlat>
          </div>
        </div>

        {/* C Unlocked */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción c</Headline>
          <div className="w-[220px]">
            <CardFlat>
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#1472FF]">reto</p>
                  <Tag variant="primary" className="!text-[10px] !px-2 !py-0.5">{exercise.type}</Tag>
                </div>
                <p className="text-sm font-bold text-[#4b4b4b] dark:text-white leading-snug mb-2">
                  {exercise.title}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <Caption>{exercise.time_minutes} min</Caption>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i <= exercise.difficulty ? 'bg-[#1472FF]' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-[#1472FF]/5 dark:bg-[#1472FF]/10 rounded-b-2xl border-t border-[#1472FF]/20">
                <Button variant="primary" size="sm" className="w-full">
                  Marcar completado
                </Button>
              </div>
            </CardFlat>
          </div>
        </div>

        {/* D Unlocked */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción d</Headline>
          <div className="w-[220px]">
            <CardFlat>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#1472FF]">reto</p>
                  </div>
                  <Tag variant="primary" className="!text-[10px] !px-2 !py-0.5">{exercise.type}</Tag>
                </div>

                <p className="text-sm font-bold text-[#4b4b4b] dark:text-white leading-snug">
                  {exercise.title}
                </p>

                <Caption className="leading-relaxed line-clamp-3">{exercise.description}</Caption>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <Caption>{exercise.time_minutes} min</Caption>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i <= exercise.difficulty ? 'bg-[#1472FF]' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Button variant="primary" size="sm" className="w-full">
                  Marcar completado
                </Button>
              </div>
            </CardFlat>
          </div>
        </div>

      </div>

      {/* ── STATES: COMPLETED ── */}
      <h2 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white mt-12 mb-2">estado: completado</h2>
      <p className="text-[#777777] dark:text-gray-400 mb-8">Cuando el usuario ya marcó el reto como completado.</p>

      <div className="flex gap-8 overflow-x-auto pb-8">

        {/* A Completed */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción a</Headline>
          <div className="w-[220px]">
            <div className="rounded-2xl border-2 border-[#22c55e] dark:border-[#22c55e] p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[#22c55e] flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#22c55e] mb-1">reto completado</p>
              <p className="text-sm font-bold text-[#777777] dark:text-gray-400 leading-snug line-through">
                {exercise.title}
              </p>
            </div>
          </div>
        </div>

        {/* B Completed */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción b</Headline>
          <div className="w-[220px]">
            <CardFlat>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#22c55e]">completado</p>
                    <Caption>{exercise.time_minutes} min</Caption>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#777777] dark:text-gray-400 leading-snug">
                  {exercise.title}
                </p>
              </div>
            </CardFlat>
          </div>
        </div>

        {/* C Completed */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción c</Headline>
          <div className="w-[220px]">
            <CardFlat>
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#22c55e]">completado</p>
                  <Tag variant="success" className="!text-[10px] !px-2 !py-0.5">{exercise.type}</Tag>
                </div>
                <p className="text-sm font-bold text-[#777777] dark:text-gray-400 leading-snug mb-2">
                  {exercise.title}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <Caption>{exercise.time_minutes} min</Caption>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i <= exercise.difficulty ? 'bg-[#22c55e]' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-[#22c55e]/5 dark:bg-[#22c55e]/10 rounded-b-2xl border-t border-[#22c55e]/20">
                <Button variant="completado" size="sm" className="w-full">
                  Completado
                </Button>
              </div>
            </CardFlat>
          </div>
        </div>

        {/* D Completed */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>opción d</Headline>
          <div className="w-[220px]">
            <CardFlat>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#22c55e]">completado</p>
                  </div>
                  <Tag variant="success" className="!text-[10px] !px-2 !py-0.5">{exercise.type}</Tag>
                </div>

                <p className="text-sm font-bold text-[#777777] dark:text-gray-400 leading-snug">
                  {exercise.title}
                </p>

                <Caption className="leading-relaxed line-clamp-3">{exercise.description}</Caption>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <Caption>{exercise.time_minutes} min</Caption>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i <= exercise.difficulty ? 'bg-[#22c55e]' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Button variant="completado" size="sm" className="w-full">
                  Completado
                </Button>
              </div>
            </CardFlat>
          </div>
        </div>

      </div>
    </div>
  );
}
