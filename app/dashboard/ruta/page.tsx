'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number | null;
  order: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  videos: Video[];
  completedCount: number;
  totalCount: number;
}

export default function RutaPage() {
  const router = useRouter();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [totalVideos, setTotalVideos] = useState(0);
  const [completedVideos, setCompletedVideos] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: intakeData } = await supabase
          .from('intake_responses')
          .select('responses, generated_path')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (intakeData?.generated_path) {
          const { data: progressData } = await supabase
            .from('video_progress')
            .select('video_id, completed')
            .eq('user_id', user.id);

          const completedSet = new Set(
            (progressData || [])
              .filter((p: any) => p.completed)
              .map((p: any) => p.video_id)
          );

          const path = intakeData.generated_path;
          const allPhases: Phase[] = [];
          let totalVids = 0;
          let completedVids = 0;
          let globalOrder = 0;
          let foundCurrent = false;

          const rawPhases = path.phases || path.course?.phases || path.modules || path.sections || [];
          
          rawPhases.forEach((phase: any, phaseIndex: number) => {
            const phaseVideos = phase.videos || phase.content || phase.lessons || [];
            const phaseName = phase.phase_name || phase.title || phase.name || `Fase ${phaseIndex + 1}`;
            const phaseId = (phase.phase_number || phase.id || `phase-${phaseIndex}`).toString();
            const phaseDesc = phase.description || '';
            
            const videos: Video[] = [];
            let phaseCompleted = 0;
            
            phaseVideos.forEach((video: any) => {
              const videoId = video.order?.toString() || video.id || `video-${globalOrder}`;
              const isCompleted = completedSet.has(videoId);
              const isCurrent = !isCompleted && !foundCurrent;
              
              if (isCurrent) {
                foundCurrent = true;
                setExpandedPhase(phaseId);
              }
              
              if (isCompleted) {
                phaseCompleted++;
                completedVids++;
              }
              
              const videoTitle = video.description || video.title || video.name || `Video ${globalOrder + 1}`;
              const videoDescription = video.why_relevant || video.summary || '';
              
              let durationSeconds: number | null = null;
              if (video.duration) {
                if (typeof video.duration === 'string' && video.duration.includes(':')) {
                  const [mins, secs] = video.duration.split(':').map(Number);
                  durationSeconds = (mins * 60) + (secs || 0);
                } else if (typeof video.duration === 'number') {
                  durationSeconds = video.duration;
                } else {
                  durationSeconds = parseInt(video.duration) || null;
                }
              }
              
              videos.push({
                id: videoId,
                title: videoTitle,
                description: videoDescription,
                duration: durationSeconds,
                order: globalOrder,
                isCompleted,
                isCurrent,
              });
              
              totalVids++;
              globalOrder++;
            });

            allPhases.push({
              id: phaseId,
              name: phaseName,
              description: phaseDesc,
              videos,
              completedCount: phaseCompleted,
              totalCount: videos.length,
            });
          });

          setPhases(allPhases);
          setTotalVideos(totalVids);
          setCompletedVideos(completedVids);
        }
      }
      setLoading(false);
    }
    
    fetchData();
  }, [supabase]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseProgress = (phase: Phase) => {
    if (phase.totalCount === 0) return 0;
    return Math.round((phase.completedCount / phase.totalCount) * 100);
  };

  const handleVideoClick = (video: Video, phaseId: string) => {
    router.push(`/dashboard/my-path/video/${phaseId}/${video.id}`);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-11rem)] bg-transparent flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1472FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return (
    <div className="min-h-full bg-transparent">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight">tu ruta de aprendizaje</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {completedVideos} de {totalVideos} videos completados
          </p>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Progreso total</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Phases */}
          {phases.map((phase, index) => {
            const isExpanded = expandedPhase === phase.id;
            const phaseProgress = getPhaseProgress(phase);
            const isCompleted = phaseProgress === 100;
            const hasCurrentVideo = phase.videos.some(v => v.isCurrent);
            
            return (
              <div key={phase.id} className="relative mb-6">
                {/* Phase Header */}
                <button
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  className="w-full flex items-start gap-4 text-left group"
                >
                  {/* Circle Indicator */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-500 border-green-500'
                      : hasCurrentVideo
                      ? 'bg-gradient-to-br from-[#1472FF] to-[#5BA0FF] border-[#1472FF]'
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`text-xs font-bold ${hasCurrentVideo ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  
                  {/* Phase Info */}
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center justify-between">
                      <h2 className={`text-lg font-bold ${
                        isCompleted ? 'text-green-600 dark:text-green-500' : hasCurrentVideo ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {phase.name}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          {phase.completedCount}/{phase.totalCount}
                        </span>
                        <svg 
                          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Phase Progress Bar */}
                    <div className="mt-2 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-green-500' 
                            : 'bg-gradient-to-r from-[#1472FF] to-[#5BA0FF]'
                        }`}
                        style={{ width: `${phaseProgress}%` }}
                      />
                    </div>
                    
                    {phase.description && !isExpanded && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{phase.description}</p>
                    )}
                  </div>
                </button>

                {/* Expanded Videos */}
                {isExpanded && (
                  <div className="ml-12 mt-4 space-y-2">
                    {phase.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{phase.description}</p>
                    )}
                    
                    {phase.videos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => handleVideoClick(video, phase.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          video.isCurrent
                            ? 'border-[#1472FF] bg-blue-50 dark:bg-blue-950/50'
                            : video.isCompleted
                            ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
                        }`}
                      >
                        {/* Status Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          video.isCompleted
                            ? 'bg-green-500'
                            : video.isCurrent
                            ? 'bg-gradient-to-br from-[#1472FF] to-[#5BA0FF]'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {video.isCompleted ? (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : video.isCurrent ? (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Video Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-sm line-clamp-1 ${
                            video.isCompleted ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                              {video.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Duration & Status */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDuration(video.duration)}
                          </span>
                          {video.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-[#1472FF] text-white text-xs font-medium">
                              Siguiente
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {phases.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sin ruta generada</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Completa el onboarding para generar tu ruta personalizada</p>
          </div>
        )}
      </div>
    </div>
  );
}
