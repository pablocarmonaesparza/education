'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const greetings = [
  "Hola",
  "Qué bueno que regresaste",
  "Qué gusto verte",
  "Bienvenido de vuelta",
  "Es un placer tenerte aquí",
  "Qué alegría verte de nuevo",
  "Hola de nuevo",
  "Buen día",
];

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number | null;
  order: number;
  phaseId: string;
  phaseName: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');
  const [project, setProject] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .single();
        
        const name = profile?.name || user.user_metadata?.name || profile?.email?.split('@')[0] || 'Usuario';
        const firstName = name.split(' ')[0];
        setUserName(firstName);
        
        // Select random greeting
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        setGreeting(randomGreeting);

        // Fetch user's data from intake_responses
        const { data: intakeData } = await supabase
          .from('intake_responses')
          .select('responses, generated_path')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        // Get project idea
        const projectIdea = 
          intakeData?.responses?.project_idea ||
          intakeData?.responses?.project ||
          intakeData?.responses?.idea ||
          '';
        
        if (projectIdea) {
          setProject(projectIdea);
        }

        // Get videos from generated_path
        if (intakeData?.generated_path) {
          // Fetch video progress
          const { data: progressData } = await supabase
            .from('video_progress')
            .select('video_id, completed')
            .eq('user_id', user.id);

          const completedVideos = new Set(
            (progressData || [])
              .filter((p: any) => p.completed)
              .map((p: any) => p.video_id)
          );

          // Parse generated_path to get videos
          const path = intakeData.generated_path;
          const allVideos: Video[] = [];

          // Handle different path structures
          const phases = path.phases || path.learning_path?.phases || [];
          
          phases.forEach((phase: any, phaseIndex: number) => {
            const phaseVideos = phase.videos || phase.lessons || [];
            phaseVideos.forEach((video: any, videoIndex: number) => {
              const videoId = video.video_id || video.id || `${phaseIndex}-${videoIndex}`;
              allVideos.push({
                id: videoId,
                title: video.title || video.name || `Video ${videoIndex + 1}`,
                description: video.description || '',
                duration: video.duration || video.estimated_duration || 120,
                order: allVideos.length + 1,
                phaseId: phase.phase_id || phase.id || `phase-${phaseIndex}`,
                phaseName: phase.phase_name || phase.name || phase.title || `Fase ${phaseIndex + 1}`,
                isCompleted: completedVideos.has(videoId),
                isCurrent: false,
              });
            });
          });

          // Find current video (first uncompleted)
          let foundCurrent = false;
          allVideos.forEach((video) => {
            if (!foundCurrent && !video.isCompleted) {
              video.isCurrent = true;
              foundCurrent = true;
            }
          });

          // If all completed, mark last as current
          if (!foundCurrent && allVideos.length > 0) {
            allVideos[allVideos.length - 1].isCurrent = true;
          }

          setVideos(allVideos);
        }
      }
      
      setIsLoading(false);
    }

    fetchUserData();
  }, [supabase]);

  const formatDuration = (seconds: number | undefined | null) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completedCount = videos.filter(v => v.isCompleted).length;
  const progressPercent = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1472FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight">
          {greeting.toLowerCase()}, {userName.toLowerCase()}
        </h1>
        {project && (
          <p className="mt-2 text-[#777777] dark:text-gray-400">
            Tu proyecto: <span className="text-[#4b4b4b] dark:text-gray-300 font-medium">{project}</span>
          </p>
        )}
      </div>

      {/* Progress Summary */}
      {videos.length > 0 && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-[#4b4b4b] dark:text-white">Tu progreso</span>
            <span className="text-sm font-bold text-[#1472FF]">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1472FF] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[#777777] dark:text-gray-400">
            {completedCount} de {videos.length} videos completados
          </p>
        </div>
      )}

      {/* Vertical Video List */}
      {videos.length > 0 ? (
        <div className="space-y-3">
          {videos.map((video, index) => (
            <div
              key={video.id}
              onClick={() => router.push(`/dashboard/salon?video=${video.order}`)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                video.isCurrent
                  ? 'border-[#1472FF] bg-[#1472FF]/5 hover:bg-[#1472FF]/10'
                  : video.isCompleted
                  ? 'border-green-400 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Number/Status Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                video.isCurrent
                  ? 'bg-[#1472FF]'
                  : video.isCompleted
                  ? 'bg-green-500'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                {video.isCompleted ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : video.isCurrent ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <span className="text-lg font-bold text-gray-400 dark:text-gray-500">{index + 1}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wide ${
                    video.isCurrent
                      ? 'text-[#1472FF]'
                      : video.isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {video.phaseName}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">{formatDuration(video.duration)}</span>
                </div>
                <h3 className={`font-bold truncate ${
                  video.isCurrent
                    ? 'text-[#4b4b4b] dark:text-white'
                    : video.isCompleted
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-[#4b4b4b] dark:text-white'
                }`}>
                  {video.title}
                </h3>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide flex-shrink-0 ${
                video.isCurrent
                  ? 'bg-[#1472FF] text-white border-b-2 border-[#0E5FCC]'
                  : video.isCompleted
                  ? 'bg-green-500 text-white border-b-2 border-green-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-b-2 border-gray-200 dark:border-gray-700'
              }`}>
                {video.isCompleted ? 'Completado' : video.isCurrent ? 'Continuar' : 'Pendiente'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#4b4b4b] dark:text-white mb-2">No hay videos disponibles</h3>
          <p className="text-[#777777] dark:text-gray-400">Completa el proceso de onboarding para generar tu ruta de aprendizaje.</p>
        </div>
      )}
    </div>
  );
}
