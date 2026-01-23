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
          let videoOrder = 0;
          let foundCurrent = false;

          // Handle different possible structures (n8n format: course.phases)
          const phases = path.phases || path.course?.phases || path.modules || path.sections || [];
          
          phases.forEach((phase: any, phaseIndex: number) => {
            const phaseVideos = phase.videos || phase.content || phase.lessons || [];
            const phaseName = phase.phase_name || phase.title || phase.name || `Fase ${phaseIndex + 1}`;
            const phaseId = phase.phase_number || phase.id || `phase-${phaseIndex}`;
            
            phaseVideos.forEach((video: any) => {
              const videoId = video.order?.toString() || video.id || `video-${videoOrder}`;
              const isCompleted = completedVideos.has(videoId);
              const isCurrent = !isCompleted && !foundCurrent;
              
              if (isCurrent) {
                foundCurrent = true;
              }
              
              // n8n format: description is the video title, why_relevant is the description
              const videoTitle = video.description || video.title || video.name || `Video ${videoOrder + 1}`;
              const videoDescription = video.why_relevant || video.summary || '';
              
              // Parse duration from "2:30" format to seconds
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
              
              allVideos.push({
                id: videoId,
                title: videoTitle,
                description: videoDescription,
                duration: durationSeconds,
                order: videoOrder,
                phaseId: phaseId.toString(),
                phaseName,
                isCompleted,
                isCurrent,
              });
              
              videoOrder++;
            });
          });

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

  // Group videos by phase
  const videosByPhase = videos.reduce((acc, video) => {
    if (!acc[video.phaseId]) {
      acc[video.phaseId] = {
        phaseName: video.phaseName,
        videos: []
      };
    }
    acc[video.phaseId].videos.push(video);
    return acc;
  }, {} as Record<string, { phaseName: string; videos: Video[] }>);

  const completedCount = videos.filter(v => v.isCompleted).length;
  const totalCount = videos.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1472FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Section - Fixed padding from top */}
      <div className="pt-6 flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4">
          {/* Greeting */}
          {userName && (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#4b4b4b] dark:text-white text-center tracking-tight">
              {greeting.toLowerCase()}, {userName}
            </h1>
          )}
          
          {/* Project - Show user's project idea */}
          <p className="mt-4 text-lg text-[#777777] dark:text-gray-400 text-center">
            {project ? (
              <>
                <span className="text-gray-400 dark:text-gray-500">Tu proyecto: </span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{project}</span>
              </>
            ) : videos.length === 0 || videos.filter(v => v.isCompleted).length === 0
              ? '¡Comencemos tu aprendizaje!'
              : videos.filter(v => v.isCompleted).length === videos.length
              ? '¡Felicidades, completaste tu curso!'
              : 'Continuemos donde lo dejamos'
            }
          </p>

          {/* Progress Line */}
          {videos.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#4b4b4b] dark:text-white">
                  {progressPercentage}% completado
                </span>
                <span className="text-sm text-[#777777] dark:text-gray-400">
                  {completedCount} de {totalCount}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#1472FF] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle Section - Vertical scrollable carousel */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4">
        {videos.length > 0 && (
          <div className="max-w-2xl mx-auto py-6 space-y-6">
            {Object.entries(videosByPhase).map(([phaseId, phaseData], phaseIndex) => (
              <div key={phaseId}>
                {/* Phase Divider and Title */}
                {phaseIndex > 0 ? (
                  <div className="mb-6">
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4" />
                    <h2 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight lowercase">
                      {phaseData.phaseName}
                    </h2>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h2 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight lowercase">
                      {phaseData.phaseName}
                    </h2>
                  </div>
                )}
                
                {/* Videos in this phase */}
                <div className="space-y-4">
                  {phaseData.videos.map((video, index) => (
                    <div
                      key={video.id}
                      onClick={() => {
                        router.push(`/dashboard/salon?video=${video.order}`);
                      }}
                      className={`h-[140px] rounded-2xl overflow-hidden transition-all duration-150 cursor-pointer flex border-2 ${
                        video.isCurrent
                          ? 'border-[#1472FF]'
                          : video.isCompleted
                          ? 'border-green-400'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Video Thumbnail Placeholder */}
                      <div className="w-[200px] h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative flex-shrink-0">
                        {video.isCompleted ? (
                          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : video.isCurrent ? (
                          <svg className="w-12 h-12 text-[#1472FF]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                        
                        {/* Duration badge - Top right */}
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          {formatDuration(video.duration)}
                        </span>

                        {/* Progress badge - Top left */}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-bold bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          {video.order + 1} de {totalCount}
                        </span>
                      </div>
                      
                      {/* Video Info - Colored based on status */}
                      <div className={`flex-1 h-full p-4 flex flex-col relative ${
                        video.isCurrent
                          ? 'bg-[#1472FF]'
                          : video.isCompleted
                          ? 'bg-green-500'
                          : 'bg-white dark:bg-gray-900'
                      }`}>
                        {/* 3D bottom shadow for active cards */}
                        {video.isCurrent && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0E5FCC]" />
                        )}
                        {video.isCompleted && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600" />
                        )}
                        
                        {/* Status badge */}
                        <span className={`inline-block self-start px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide mb-2 ${
                          video.isCurrent
                            ? 'bg-white/20 text-white'
                            : video.isCompleted
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          {video.isCompleted ? 'Completado' : video.isCurrent ? 'Continuar' : 'Pendiente'}
                        </span>
                        
                        <p className={`text-xs mb-1 ${
                          video.isCurrent || video.isCompleted
                            ? 'text-white/80'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>{video.phaseName}</p>
                        <h3 className={`font-bold line-clamp-2 leading-snug ${
                          video.isCurrent || video.isCompleted
                            ? 'text-white'
                            : 'text-[#4b4b4b] dark:text-white'
                        }`}>
                          {video.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
