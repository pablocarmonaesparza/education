'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { SpinnerPage, SectionHeader, EmptyState, Button, ProgressBar } from '@/components/ui';

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

  const getTypeColor = () => {
    return 'bg-blue-50 text-[#1472FF] dark:bg-blue-950/50 dark:text-[#1472FF]';
  };

  const getDifficultyDots = (difficulty: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i <= difficulty
                ? 'bg-[#1472FF]'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <SpinnerPage />;
  }

  if (!hasExercises) {
    return (
      <div className="min-h-full bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <SectionHeader title="retos" subtitle="Practica lo que aprendes" />

          <EmptyState
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            title="Aún no tienes retos"
            description="Los retos se generan automáticamente cuando creas tu curso personalizado. Son ejercicios prácticos diseñados específicamente para tu proyecto."
            action={
              <Button variant="primary" size="lg" onClick={() => router.push('/intake')}>
                Crear mi curso
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const completedCount = exercisesData?.exercises.filter(ex => ex.isCompleted).length || 0;
  const totalCount = exercisesData?.total_exercises || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-11rem)] bg-transparent overflow-hidden">
      <div className="h-full flex gap-4 p-4 max-w-7xl mx-auto w-full">
        
        {/* Sidebar - Exercise List */}
        <div className="w-80 flex-shrink-0 h-full flex flex-col bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-bold text-gray-900 dark:text-white mb-1">Retos</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
              {exercisesData?.user_project}
            </p>
            {/* Progress */}
            <div className="flex items-center gap-2">
              <ProgressBar value={progressPercent} size="md" color="primary" trackClassName="bg-gray-200 dark:bg-gray-700" className="flex-1" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto">
            {exercisesData?.exercises.map((exercise) => {
              const isActive = currentExercise?.number === exercise.number;
              const isCompleted = exercise.isCompleted;
              const isLocked = !exercise.isUnlocked && !isCompleted;

              return (
                <button
                  key={exercise.number}
                  onClick={() => setCurrentExercise(exercise)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-l-2 border-[#1472FF]' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-2 border-transparent'
                  } ${isLocked ? 'opacity-50' : ''}`}
                >
                  {/* Number/Check/Lock */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-[#1472FF] text-white'
                      : isLocked
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        : isActive
                          ? 'bg-[#1472FF] text-white'
                          : 'border-2 border-gray-300 dark:border-gray-950 text-gray-500 dark:text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isLocked ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{exercise.number}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isLocked
                        ? 'text-gray-400 dark:text-gray-500'
                        : isActive 
                          ? 'text-[#1472FF]' 
                          : isCompleted
                            ? 'text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                    }`}>
                      {exercise.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${isLocked ? 'bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-500' : getTypeColor()}`}>
                        {exercise.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {exercise.time_minutes} min
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content - Current Exercise */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {currentExercise && (
            <>
              {/* Exercise Header */}
              <div className="flex-shrink-0 mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor()}`}>
                        {currentExercise.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Fase {currentExercise.phase}
                      </span>
                      {getDifficultyDots(currentExercise.difficulty)}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentExercise.number}. {currentExercise.title}
                    </h1>
                  </div>

                  {/* Complete Button */}
                  <button
                    onClick={() => toggleExerciseCompletion(currentExercise.number, currentExercise.isCompleted, currentExercise.isUnlocked)}
                    disabled={!currentExercise.isUnlocked && !currentExercise.isCompleted}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                      !currentExercise.isUnlocked && !currentExercise.isCompleted
                        ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : currentExercise.isCompleted
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-[#1472FF] dark:text-[#1472FF] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-400'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-[#1472FF] dark:hover:text-[#1472FF]'
                    }`}
                  >
                    {!currentExercise.isUnlocked && !currentExercise.isCompleted ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Bloqueado</span>
                      </>
                    ) : currentExercise.isCompleted ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Completado</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Marcar completado</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Exercise Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid gap-6">
                  {/* Description */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Descripción
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {currentExercise.description}
                    </p>
                  </div>

                  {/* Deliverable */}
                  <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 rounded-2xl p-6 border border-blue-200 dark:border-blue-900">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Entregable
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {currentExercise.deliverable}
                    </p>
                  </div>

                  {/* Videos Required */}
                  {currentExercise.videos_required && currentExercise.videos_required.length > 0 && (
                    <div className={`rounded-2xl p-6 border ${
                      currentExercise.missingVideos.length > 0
                        ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-950'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                    }`}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Videos requeridos
                      </h3>
                      {currentExercise.missingVideos.length > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          Completa los videos pendientes para desbloquear este reto
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {currentExercise.videos_required.map((videoNum) => {
                          const isWatched = completedVideos.has(videoNum);
                          return (
                            <button
                              key={videoNum}
                              onClick={() => router.push(`/dashboard`)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                isWatched
                                  ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1472FF] dark:text-[#1472FF] hover:bg-blue-100 dark:hover:bg-blue-900/50'
                                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              {isWatched ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                              Video #{videoNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Time & Difficulty */}
                  <div className="flex gap-4">
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Tiempo estimado</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{currentExercise.time_minutes} minutos</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Dificultad</p>
                          <div className="mt-1">{getDifficultyDots(currentExercise.difficulty)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
