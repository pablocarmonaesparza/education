'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExperimentLesson from '@/components/experiment/ExperimentLesson';
import LessonItem from '@/components/dashboard/LessonItem';
import PathConnector from '@/components/dashboard/PathConnector';
import Spinner from '@/components/ui/Spinner';
import Divider from '@/components/ui/Divider';
import IconButton from '@/components/ui/IconButton';
import { Title, Body, Caption } from '@/components/ui/Typography';
import {
  fetchPublishedLectures,
  fetchLectureAsSteps,
  type LectureRow,
} from '@/lib/lessons/fromSupabase';
import type { Step } from '@/components/experiment/ExperimentLesson';

/**
 * Preview route — muestra las primeras 10 lecturas nuevas del curso 2026
 * leídas directamente de Supabase (tablas `lectures` + `lecture_slides`).
 *
 * Propósito: validar el pipeline end-to-end (DB → dashboard → ExperimentLesson)
 * con contenido real, sin tocar el dashboard principal ni el registry en código.
 */
export default function DashboardPreviewPage() {
  const router = useRouter();
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<LectureRow | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<Step[] | null>(null);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await fetchPublishedLectures();
      if (!cancelled) {
        setLectures(rows);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = async (lecture: LectureRow) => {
    setSelected(lecture);
    setIsLoadingSteps(true);
    const steps = await fetchLectureAsSteps(lecture.id);
    setSelectedSteps(steps.length > 0 ? steps : null);
    setIsLoadingSteps(false);
  };

  const handleClose = () => {
    setSelected(null);
    setSelectedSteps(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="px-4 py-6 border-b border-gray-200 dark:border-gray-900">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <IconButton
            variant="outline"
            aria-label="Volver al dashboard"
            onClick={() => router.push('/dashboard')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </IconButton>
          <div>
            <Title className="!text-2xl">curso ai 2026 — piloto</Title>
            <Caption className="text-[#777777] dark:text-gray-400">
              {lectures.length} lecciones · leídas desde Supabase · Miyagi pedagogy
            </Caption>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Divider title={lectures[0]?.section_name ?? 'fundamentos'} />
        </div>

        <div className="w-full max-w-[220px] mx-auto">
          {lectures.map((lec, idx) => {
            const isLast = idx === lectures.length - 1;
            return (
              <div key={lec.id}>
                <div data-lecture-id={lec.id}>
                  <LessonItem
                    lessonNumber={idx + 1}
                    totalLessons={lectures.length}
                    title={lec.title}
                    description={lec.narrative_arc ?? ''}
                    isCompleted={false}
                    isCurrent={idx === 0}
                    isExpanded={expandedId === lec.id}
                    onToggleExpand={() => setExpandedId(expandedId === lec.id ? null : lec.id)}
                    onClick={() => handleSelect(lec)}
                  />
                </div>
                {!isLast && <PathConnector />}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Body className="text-[#777777] dark:text-gray-400">
            ¿Cómo se ve? Si algún slide se rompe, verás su ID para avisar al equipo.
          </Body>
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-gray-950 flex flex-col">
          {isLoadingSteps ? (
            <div className="flex-1 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : selectedSteps && selectedSteps.length > 0 ? (
            <ExperimentLesson steps={selectedSteps} onClose={handleClose} />
          ) : (
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-center max-w-md">
                <IconButton
                  variant="outline"
                  aria-label="Cerrar"
                  onClick={handleClose}
                  className="absolute top-4 left-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </IconButton>
                <Title className="!text-2xl mb-2">sin slides aún</Title>
                <Body className="text-[#777777] dark:text-gray-400">
                  Esta lección no tiene slides publicados en la base de datos.
                </Body>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
