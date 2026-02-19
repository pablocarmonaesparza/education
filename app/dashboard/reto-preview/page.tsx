'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardFlat } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Headline, Body, Caption } from '@/components/ui/Typography';
import RetoItem from '@/components/dashboard/RetoItem';

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
  const [overlayExercise, setOverlayExercise] = useState<typeof exercise | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const openOverlay = (ex: typeof exercise) => {
    setOverlayExercise(ex);
    requestAnimationFrame(() => setOverlayOpen(true));
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
    setTimeout(() => setOverlayExercise(null), 400);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
      {/* ── NEW: RetoItem component (what now lives in the timeline) ── */}
      <h1 className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white mb-2">nuevo diseño — RetoItem + overlay</h1>
      <p className="text-[#777777] dark:text-gray-400 mb-8">El componente RetoItem que aparece en el timeline. Click para abrir el overlay modal.</p>

      <div className="flex gap-8 overflow-x-auto pb-8">
        {/* Locked */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>bloqueado</Headline>
          <RetoItem
            title={exercise.title}
            type={exercise.type}
            difficulty={exercise.difficulty}
            timeMinutes={exercise.time_minutes}
            isCompleted={false}
            isUnlocked={false}
          />
        </div>

        {/* Unlocked */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>desbloqueado</Headline>
          <RetoItem
            title={exercise.title}
            type={exercise.type}
            difficulty={exercise.difficulty}
            timeMinutes={exercise.time_minutes}
            isCompleted={false}
            isUnlocked={true}
            onClick={() => openOverlay({ ...exercise, isUnlocked: true, isLocked: false })}
          />
        </div>

        {/* Completed */}
        <div className="flex-shrink-0 space-y-3">
          <Headline>completado</Headline>
          <RetoItem
            title={exercise.title}
            type={exercise.type}
            difficulty={exercise.difficulty}
            timeMinutes={exercise.time_minutes}
            isCompleted={true}
            isUnlocked={true}
            onClick={() => openOverlay({ ...exercise, isCompleted: true, isUnlocked: true, isLocked: false })}
          />
        </div>
      </div>

      <div className="my-8 border-t-2 border-gray-200 dark:border-gray-700" />

      {/* ── ORIGINAL OPTIONS A-D for reference ── */}
      <h1 className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white mb-2">opciones anteriores — referencia</h1>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#777777] dark:text-gray-400">reto</p>
                  </div>
                  <Tag variant="neutral" className="!text-[10px] !px-2 !py-0.5">{exercise.type}</Tag>
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

      {/* ── Overlay Preview (simulated) ── */}
      {overlayExercise && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all ease-out ${
            overlayOpen ? 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm' : 'bg-white/0 dark:bg-gray-800/0'
          }`}
          style={{ transitionDuration: '400ms' }}
        >
          <div
            className={`w-full max-w-2xl mx-auto px-4 sm:px-8 overflow-y-auto max-h-full transition-all ease-out ${
              overlayOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
            }`}
            style={{
              transitionDuration: '400ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="flex justify-end mb-6">
              <Button variant="outline" size="md" onClick={closeOverlay} className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cerrar
              </Button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#1472FF]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm text-[#1472FF] font-bold uppercase tracking-wide">
                  reto · {overlayExercise.type}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#4b4b4b] dark:text-white">
                {overlayExercise.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i <= overlayExercise.difficulty ? 'bg-[#1472FF]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <Caption className="font-medium">Dificultad</Caption>
                </div>
                <Caption>·</Caption>
                <Caption className="font-medium">{overlayExercise.time_minutes} min estimados</Caption>
              </div>
            </div>

            <Card variant="neutral" padding="lg" className="mb-4">
              <Headline className="mb-2">descripción</Headline>
              <Body className="text-[#777777] dark:text-gray-400">{overlayExercise.description}</Body>
            </Card>

            <Card variant="neutral" padding="lg" className="mb-6">
              <Headline className="mb-2">entregable</Headline>
              <Body className="text-[#777777] dark:text-gray-400">{overlayExercise.deliverable}</Body>
            </Card>

            <div className="pb-8">
              {overlayExercise.isCompleted ? (
                <Button variant="completado" size="lg" className="w-full justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Completado
                </Button>
              ) : (
                <Button variant="primary" size="lg" className="w-full justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Marcar como completado
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
