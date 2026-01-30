'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { SpinnerPage } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { CardFlat } from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Tag from '@/components/ui/Tag';
import StatCard from '@/components/ui/StatCard';
import { Subtitle, Headline, Body, Caption } from '@/components/ui/Typography';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import Divider from '@/components/ui/Divider';

interface Exercise {
  number: number;
  phase: number;
  type: string;
  title: string;
  description: string;
  deliverable: string;
  videos_required: number[];
  time_minutes: number;
  difficulty: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  missingVideos: number[];
}

interface UserExercises {
  user_project: string;
  total_exercises: number;
  practice_hours: string;
  exercises: Exercise[];
  milestones: string[];
}

export default function RetosPage() {
  const [exercisesData, setExercisesData] = useState<UserExercises | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [completedVideos, setCompletedVideos] = useState<Set<number>>(new Set());
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExercises, setHasExercises] = useState(false);
  const [expandedNumber, setExpandedNumber] = useState<number | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch exercises
        const { data: exercisesResult } = await supabase
          .from('user_exercises')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (exercisesResult) {
          // Fetch exercise progress
          const { data: progressData } = await supabase
            .from('exercise_progress')
            .select('exercise_number, completed')
            .eq('user_id', user.id);

          const completedExercisesSet = new Set(
            (progressData || [])
              .filter((p: any) => p.completed)
              .map((p: any) => p.exercise_number)
          );
          setCompletedExercises(completedExercisesSet);

          // Fetch video progress to check which videos are completed
          const { data: videoProgressData } = await supabase
            .from('video_progress')
            .select('video_id')
            .eq('user_id', user.id);

          const completedVideosSet = new Set(
            (videoProgressData || []).map((v: any) => v.video_id)
          );
          setCompletedVideos(completedVideosSet);

          // Parse exercises with unlock status
          const exercises = (exercisesResult.exercises || []).map((ex: any) => {
            const requiredVideos = ex.videos_required || [];
            const missingVideos = requiredVideos.filter((vid: number) => !completedVideosSet.has(vid));
            const isUnlocked = missingVideos.length === 0;

            return {
              ...ex,
              isCompleted: completedExercisesSet.has(ex.number),
              isUnlocked,
              missingVideos
            };
          });

          const data: UserExercises = {
            user_project: exercisesResult.user_project,
            total_exercises: exercisesResult.total_exercises,
            practice_hours: exercisesResult.practice_hours,
            exercises,
            milestones: exercisesResult.milestones || []
          };

          setExercisesData(data);
          setHasExercises(true);

          // Set current exercise (first incomplete unlocked, or first incomplete, or first)
          const firstIncompleteUnlocked = exercises.find((ex: Exercise) => !ex.isCompleted && ex.isUnlocked);
          const firstIncomplete = exercises.find((ex: Exercise) => !ex.isCompleted);
          setCurrentExercise(firstIncompleteUnlocked || firstIncomplete || exercises[0] || null);
        }
      }
      setIsLoading(false);
    }
    fetchData();
  }, [supabase]);

  const toggleExerciseCompletion = async (exerciseNumber: number, currentlyCompleted: boolean, isUnlocked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Don't allow completion if not unlocked
    if (!isUnlocked && !currentlyCompleted) return;

    if (currentlyCompleted) {
      // Mark as pending
      await supabase
        .from('exercise_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('exercise_number', exerciseNumber);
    } else {
      // Mark as completed
      await supabase
        .from('exercise_progress')
        .upsert({
          user_id: user.id,
          exercise_number: exerciseNumber,
          completed: true,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,exercise_number' });
    }

    // Update local state
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (currentlyCompleted) {
        newSet.delete(exerciseNumber);
      } else {
        newSet.add(exerciseNumber);
      }
      return newSet;
    });

    // Update exercises data
    if (exercisesData) {
      const updatedExercises = exercisesData.exercises.map(ex => ({
        ...ex,
        isCompleted: ex.number === exerciseNumber ? !currentlyCompleted : ex.isCompleted
      }));
      setExercisesData({ ...exercisesData, exercises: updatedExercises });

      // Update current exercise if it's the one being toggled
      if (currentExercise?.number === exerciseNumber) {
        setCurrentExercise({ ...currentExercise, isCompleted: !currentlyCompleted });
      }
    }
  };

  // ── Loading ──
  if (isLoading) {
    return <SpinnerPage />;
  }

  // ── Empty State ──
  if (!hasExercises) {
    return (
      <div className="min-h-full bg-gray-50/30 dark:bg-gray-800 p-4 sm:p-6 lg:p-8">
        <SectionHeader title="retos" subtitle="practica lo que aprendes" />
        <EmptyState
          icon={
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          title="aun no tienes retos"
          description="Los retos se generan automaticamente cuando creas tu curso personalizado. Son ejercicios practicos disenados especificamente para tu proyecto."
          action={
            <Button variant="primary" size="lg" onClick={() => router.push('/intake')}>
              Crear mi curso
            </Button>
          }
        />
      </div>
    );
  }

  // ── Calculations ──
  const completedCount = exercisesData?.exercises.filter(ex => ex.isCompleted).length || 0;
  const totalCount = exercisesData?.total_exercises || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Group exercises by phase
  const phases = exercisesData?.exercises.reduce((acc, ex) => {
    if (!acc[ex.phase]) acc[ex.phase] = [];
    acc[ex.phase].push(ex);
    return acc;
  }, {} as Record<number, Exercise[]>) || {};

  const unlockedCount = exercisesData?.exercises.filter(e => e.isUnlocked && !e.isCompleted).length || 0;
  const lockedCount = exercisesData?.exercises.filter(e => !e.isUnlocked && !e.isCompleted).length || 0;

  // ── Main Content ──
  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 font-sans text-[#4b4b4b] dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <SectionHeader title="retos" subtitle={exercisesData?.user_project} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left Column: Exercise List (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Progress Summary Card */}
            <CardFlat className="p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Subtitle>tu progreso en retos</Subtitle>
                <span className="text-2xl font-extrabold text-[#1472FF]">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <ProgressBar value={progressPercent} size="lg" color="primary" durationMs={1000} className="mb-2" />
              <div className="flex justify-between">
                <Caption>{completedCount} de {totalCount} completados</Caption>
                <Caption>{exercisesData?.practice_hours} horas de practica</Caption>
              </div>
            </CardFlat>

            {/* Exercise List grouped by Phase */}
            {Object.entries(phases)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([phaseNum, phaseExercises]) => (
              <div key={phaseNum} className="space-y-3">
                <Divider title={`Fase ${phaseNum}`} />
                <div className="space-y-3">
                  {phaseExercises.map((exercise) => {
                    const isSelected = currentExercise?.number === exercise.number;
                    const isCompleted = exercise.isCompleted;
                    const isLocked = !exercise.isUnlocked && !isCompleted;
                    const isExpanded = expandedNumber === exercise.number;

                    return (
                      <div
                        key={exercise.number}
                        onClick={() => {
                          setCurrentExercise(exercise);
                          setExpandedNumber(prev => prev === exercise.number ? null : exercise.number);
                        }}
                        className={`cursor-pointer transition-all duration-150 ${isLocked ? 'opacity-60' : ''}`}
                      >
                        <CardFlat
                          className={`shadow-sm hover:shadow-md transition-shadow ${
                            isSelected
                              ? 'ring-2 ring-[#1472FF] ring-offset-2 dark:ring-offset-gray-800'
                              : ''
                          }`}
                        >
                          <div className="p-4 sm:p-5">
                            {/* Top Row: Status Circle + Title + Meta */}
                            <div className="flex items-start gap-3">
                              {/* Status indicator circle */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted
                                  ? 'bg-[#22c55e] text-white'
                                  : isLocked
                                    ? 'bg-gray-200 dark:bg-gray-700 text-[#777777] dark:text-gray-500'
                                    : isSelected
                                      ? 'bg-[#1472FF] text-white'
                                      : 'border-2 border-gray-300 dark:border-gray-900 text-[#777777] dark:text-gray-400'
                              }`}>
                                {isCompleted ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : isLocked ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                ) : (
                                  <span className="text-sm font-bold">{exercise.number}</span>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-base font-bold truncate mb-1 ${
                                  isLocked
                                    ? 'text-[#777777] dark:text-gray-500'
                                    : isCompleted
                                      ? 'text-[#777777] dark:text-gray-400'
                                      : 'text-[#4b4b4b] dark:text-white'
                                }`}>
                                  {exercise.title}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Tag variant={isLocked ? 'neutral' : 'primary'} className="!text-xs !px-2 !py-0.5">
                                    {exercise.type}
                                  </Tag>
                                  <Caption>{exercise.time_minutes} min</Caption>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          i <= exercise.difficulty
                                            ? 'bg-[#1472FF]'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Chevron (mobile only) */}
                              <div className="flex-shrink-0 lg:hidden self-center">
                                <svg
                                  className={`w-5 h-5 text-[#777777] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>

                            {/* Expanded Detail (MOBILE ONLY) */}
                            {isExpanded && (
                              <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-900 space-y-4">
                                <Body className="leading-relaxed">{exercise.description}</Body>

                                {/* Entregable */}
                                <div className="bg-[#1472FF]/5 dark:bg-[#1472FF]/10 rounded-xl p-4">
                                  <Headline className="mb-2 !text-[#1472FF]">entregable</Headline>
                                  <Body className="leading-relaxed">{exercise.deliverable}</Body>
                                </div>

                                {/* Videos Required */}
                                {exercise.videos_required?.length > 0 && (
                                  <div>
                                    <Headline className="mb-2">videos requeridos</Headline>
                                    {exercise.missingVideos.length > 0 && (
                                      <Caption className="mb-2">
                                        Completa los videos pendientes para desbloquear este reto
                                      </Caption>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                      {exercise.videos_required.map((videoNum) => {
                                        const isWatched = completedVideos.has(videoNum);
                                        return (
                                          <button
                                            key={videoNum}
                                            onClick={(e) => { e.stopPropagation(); router.push('/dashboard'); }}
                                          >
                                            <Tag variant={isWatched ? 'success' : 'neutral'} className="!text-xs">
                                              {isWatched ? '✓' : '▶'} Video #{videoNum}
                                            </Tag>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Action Button */}
                                <div className="flex gap-3">
                                  {exercise.isUnlocked && !exercise.isCompleted && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleExerciseCompletion(exercise.number, false, true); }}
                                      className="flex-1"
                                    >
                                      Marcar completado
                                    </Button>
                                  )}
                                  {exercise.isCompleted && (
                                    <Button
                                      variant="completado"
                                      size="sm"
                                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleExerciseCompletion(exercise.number, true, true); }}
                                      className="flex-1"
                                    >
                                      Completado
                                    </Button>
                                  )}
                                  {isLocked && (
                                    <Button variant="outline" size="sm" disabled className="flex-1">
                                      Bloqueado
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardFlat>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── Right Column: Detail + Stats (1/3) ── */}
          <div className="hidden lg:block space-y-8">

            {/* Selected Exercise Detail */}
            {currentExercise && (
              <CardFlat className="shadow-sm sticky top-8">
                <div className="p-6 space-y-5">
                  {/* Header: type + phase + difficulty */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag variant="primary">{currentExercise.type}</Tag>
                    <Tag variant="neutral">Fase {currentExercise.phase}</Tag>
                    <div className="flex gap-1 ml-auto">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i <= currentExercise.difficulty
                              ? 'bg-[#1472FF]'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white leading-tight">
                    {currentExercise.number}. {currentExercise.title}
                  </h2>

                  {/* Description */}
                  <div>
                    <Headline className="mb-2">descripcion</Headline>
                    <Body className="leading-relaxed">{currentExercise.description}</Body>
                  </div>

                  {/* Deliverable */}
                  <div className="bg-[#1472FF]/5 dark:bg-[#1472FF]/10 rounded-xl p-4">
                    <Headline className="mb-2 !text-[#1472FF]">entregable</Headline>
                    <Body className="leading-relaxed">{currentExercise.deliverable}</Body>
                  </div>

                  {/* Videos Required */}
                  {currentExercise.videos_required?.length > 0 && (
                    <div>
                      <Headline className="mb-2">videos requeridos</Headline>
                      {currentExercise.missingVideos.length > 0 && (
                        <Caption className="mb-3">
                          Completa los videos pendientes para desbloquear este reto
                        </Caption>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {currentExercise.videos_required.map((videoNum) => {
                          const isWatched = completedVideos.has(videoNum);
                          return (
                            <button
                              key={videoNum}
                              onClick={() => router.push('/dashboard')}
                              className="cursor-pointer"
                            >
                              <Tag variant={isWatched ? 'success' : 'neutral'} className="!text-xs">
                                {isWatched ? '✓' : '▶'} Video #{videoNum}
                              </Tag>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Time & Difficulty Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard icon="⏱️" value={`${currentExercise.time_minutes}`} label="Minutos" color="blue" />
                    <StatCard icon="⚡" value={`${currentExercise.difficulty}/5`} label="Dificultad" color="orange" />
                  </div>

                  {/* Action Button */}
                  <div>
                    {!currentExercise.isUnlocked && !currentExercise.isCompleted ? (
                      <Button variant="outline" disabled className="w-full">
                        Bloqueado
                      </Button>
                    ) : currentExercise.isCompleted ? (
                      <Button
                        variant="completado"
                        className="w-full"
                        onClick={() => toggleExerciseCompletion(currentExercise.number, true, true)}
                      >
                        Completado
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => toggleExerciseCompletion(currentExercise.number, false, true)}
                      >
                        Marcar completado
                      </Button>
                    )}
                  </div>
                </div>
              </CardFlat>
            )}

            {/* Challenge Stats */}
            <CardFlat className="p-6 shadow-sm">
              <Subtitle className="mb-4">tu actividad</Subtitle>
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon="✅" value={String(completedCount)} label="Completados" color="green" />
                <StatCard icon="🔓" value={String(unlockedCount)} label="Disponibles" color="blue" />
                <StatCard icon="🔒" value={String(lockedCount)} label="Bloqueados" color="neutral" />
                <StatCard icon="🎯" value={String(totalCount)} label="Total Retos" color="orange" />
              </div>
            </CardFlat>
          </div>
        </div>
      </div>
    </div>
  );
}
