'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Video {
  order: number;
  section: string;
  subsection?: string;
  description: string;
  duration: string;
  why_relevant?: string;
  video_url?: string;
}

interface Phase {
  phase_number: number;
  phase_name: string;
  description?: string;
  phase_duration?: string;
  videos: Video[];
}

interface GeneratedPath {
  user_project?: string;
  total_videos?: number;
  estimated_hours?: string;
  learning_path_summary?: string[];
  phases: Phase[];
  recommendations?: string[];
}

export default function MyPathPage() {
  const [learningPath, setLearningPath] = useState<GeneratedPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Inicializar con la primera fase expandida
  useEffect(() => {
    if (learningPath && learningPath.phases && learningPath.phases.length > 0 && !isInitialized) {
      setExpandedPhases(new Set([learningPath.phases[0].phase_number]));
      setIsInitialized(true);
    }
  }, [learningPath, isInitialized]);

  const togglePhase = (phaseNumber: number) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseNumber)) {
        newSet.delete(phaseNumber);
      } else {
        newSet.add(phaseNumber);
      }
      return newSet;
    });
  };

  useEffect(() => {
    async function fetchLearningPath() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Check if user has a personalized path
        const { data, error } = await supabase
          .from('intake_responses')
          .select('generated_path')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error fetching personalized path:', error);
          setError('Error al cargar tu ruta de aprendizaje');
          setLoading(false);
          return;
        }

        // If no path exists, redirect to onboarding
        if (!data || !data.generated_path) {
          router.push('/onboarding');
          return;
        }

        // Set the learning path
        setLearningPath(data.generated_path as GeneratedPath);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching learning path:', err);
        setError('Error al cargar tu ruta de aprendizaje. Por favor intenta de nuevo.');
        setLoading(false);
      }
    }

    fetchLearningPath();
  }, [router, supabase]);

  const handleGenerateNewPath = () => {
    router.push('/onboarding');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-lg text-gray-600">Cargando tu ruta de aprendizaje...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#1472FF] text-white font-semibold rounded-lg hover:bg-[#0E5FCC]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!learningPath || !learningPath.phases || learningPath.phases.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aún no tienes una ruta personalizada</h2>
          <p className="text-lg text-gray-600 mb-6">
            Crea tu ruta de aprendizaje personalizada basada en tu proyecto
          </p>
          <button
            onClick={handleGenerateNewPath}
            className="px-8 py-4 bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] text-white font-semibold rounded-lg hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all shadow-lg hover:shadow-xl"
          >
            Crear Mi Ruta Personalizada →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Mi Ruta de Aprendizaje Personalizada
        </h1>
        {learningPath.user_project && (
          <p className="text-lg text-gray-600 mb-2">
            <span className="font-semibold">Tu proyecto:</span> {learningPath.user_project}
          </p>
        )}
        {(learningPath.total_videos || learningPath.estimated_hours) && (
          <div className="flex gap-6 text-sm text-gray-500">
            {learningPath.total_videos && (
              <span>📹 {learningPath.total_videos} videos</span>
            )}
            {learningPath.estimated_hours && (
              <span>⏱️ {learningPath.estimated_hours}</span>
            )}
          </div>
        )}
      </div>

      {/* Learning Path Summary */}
      {learningPath.learning_path_summary && learningPath.learning_path_summary.length > 0 && (
        <div className="bg-gradient-to-r from-[#1472FF]/10 to-[#1472FF]/10 rounded-xl p-6 mb-8 border border-[#1472FF]/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de tu Ruta</h2>
          <ul className="space-y-2">
            {learningPath.learning_path_summary.map((summary, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1472FF] text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span>{summary}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Phases */}
      <div className="space-y-6">
        {learningPath.phases.map((phase, phaseIndex) => {
          const isExpanded = expandedPhases.has(phase.phase_number);
          
          return (
          <div
            key={phase.phase_number}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* Phase Header - Clickable para toggle */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePhase(phase.phase_number);
              }}
              className="w-full bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] p-6 text-left hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-white">
                      {phase.phase_number}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {phase.phase_name}
                    </h2>
                    <svg
                      className={`w-6 h-6 text-white transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {phase.description && (
                    <p className="text-white/90 mt-2">{phase.description}</p>
                  )}
                  {phase.phase_duration && (
                    <p className="text-white/80 text-sm mt-2">
                      ⏱️ Duración: {phase.phase_duration}
                    </p>
                  )}
                </div>
                <div className="text-white/80 text-sm">
                  {phase.videos?.length || 0} videos
                </div>
              </div>
            </button>

            {/* Videos List - Collapsible */}
            {isExpanded && (
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {phase.videos && phase.videos.length > 0 ? (
                  phase.videos.map((video, videoIndex) => (
                    <div
                      key={video.order}
                      className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1472FF]/10 text-[#1472FF] flex items-center justify-center text-sm font-bold">
                              {video.order}
                            </span>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                              {video.description}
                            </h3>
                          </div>
                          
                          <div className="ml-11 space-y-1">
                            {video.section && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                                  {video.section}
                                </span>
                                {video.subsection && (
                                  <>
                                    <span>/</span>
                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                                      {video.subsection}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                            
                            {video.why_relevant && (
                              <p className="text-sm text-gray-600 italic">
                                💡 {video.why_relevant}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {video.duration && (
                                <span>⏱️ {video.duration}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Video Action Button */}
                        <Link
                          href={`/dashboard/my-path/video/${phase.phase_number}/${video.order}`}
                          className="flex-shrink-0 w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] text-white rounded-lg font-medium hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all shadow-md hover:shadow-lg text-center sm:text-left"
                        >
                          Ver Video →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay videos disponibles en esta fase aún
                  </p>
                )}
              </div>
            </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {learningPath.recommendations && learningPath.recommendations.length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            💡 Recomendaciones
          </h2>
          <ul className="space-y-2">
            {learningPath.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Padding inferior */}
      <div className="pb-8"></div>
    </div>
  );
}
