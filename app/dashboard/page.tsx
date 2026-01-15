'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
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
          console.log('Generated path structure:', JSON.stringify(intakeData.generated_path, null, 2));
          
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
                setCurrentVideoIndex(videoOrder);
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
        } else {
          console.log('No generated_path found in intake data');
        }
      }
      setIsLoading(false);
    }
    
    fetchUserData();
  }, [supabase]);

  // Scroll carousel to current video on load
  useEffect(() => {
    if (carouselRef.current && videos.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const cardWidth = 280 + 16; // card width + gap
        const scrollPosition = currentVideoIndex * cardWidth;
        carouselRef.current?.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        setSelectedVideoIndex(currentVideoIndex);
      }, 100);
    }
  }, [currentVideoIndex, videos]);

  // Handle scroll to update selected video
  const handleScroll = () => {
    if (carouselRef.current && videos.length > 0) {
      const cardWidth = 280 + 16;
      const scrollLeft = carouselRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex >= 0 && newIndex < videos.length && newIndex !== selectedVideoIndex) {
        setSelectedVideoIndex(newIndex);
      }
    }
  };

  const formatDuration = (seconds: number | undefined | null) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-11rem)] bg-transparent flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1472FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-11rem)] bg-transparent flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Greeting */}
        {userName && (
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white text-center px-4">
            {greeting}, {userName}
          </h1>
        )}
        
        {/* Project - Show user's project idea */}
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 text-center px-4 max-w-2xl">
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

        {/* Divider */}
        {videos.length > 0 && (
          <div className="w-full max-w-4xl mt-10 mb-8 px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
          </div>
        )}

        {/* Video Carousel - Full width with snap to center */}
        {videos.length > 0 && (
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="w-full flex gap-4 overflow-x-auto py-6 scrollbar-hide snap-x snap-mandatory"
          >
            {/* Left spacer for first card centering */}
            <div className="flex-shrink-0 w-[calc(50vw-156px)]" />
            
            {videos.map((video, index) => (
              <div
                key={video.id}
                onClick={() => {
                  router.push(`/dashboard/salon?video=${video.order}`);
                }}
                className={`flex-shrink-0 w-[280px] snap-center rounded-2xl border transition-all duration-300 cursor-pointer ${
                  index === selectedVideoIndex ? 'scale-105 z-10' : 'scale-95 opacity-70'
                } ${
                  video.isCurrent
                    ? 'border-[#1472FF] bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900'
                    : video.isCompleted
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Video Thumbnail Placeholder */}
                <div className={`h-36 rounded-t-2xl flex items-center justify-center relative ${
                  video.isCurrent
                    ? 'bg-gradient-to-br from-[#1472FF] to-[#5BA0FF]'
                    : video.isCompleted
                    ? 'bg-gradient-to-br from-green-400 to-green-500'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {video.isCompleted ? (
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : video.isCurrent ? (
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                  
                  {/* Status badge - glass style */}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-md ${
                    video.isCompleted
                      ? 'bg-white/20 text-white'
                      : video.isCurrent
                      ? 'bg-white/20 text-white'
                      : 'bg-black/20 text-white dark:bg-white/20'
                  }`}>
                    {video.isCompleted ? 'Completado' : video.isCurrent ? 'En progreso' : 'Pendiente'}
                  </span>
                  
                  {/* Duration badge */}
                  <span className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${
                    video.isCurrent || video.isCompleted
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {formatDuration(video.duration)}
                  </span>
                  
                  {/* Current indicator */}
                  {video.isCurrent && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white text-[#1472FF] text-xs font-bold">
                      Continuar
                    </span>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{video.phaseName}</p>
                  <h3 className={`font-medium line-clamp-2 ${
                    video.isCurrent ? 'text-gray-900 dark:text-white' : video.isCompleted ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {video.title}
                  </h3>
                </div>
              </div>
            ))}
            
            {/* Right spacer for last card centering */}
            <div className="flex-shrink-0 w-[calc(50vw-156px)]" />
          </div>
        )}

        {/* Divider below carousel */}
        {videos.length > 0 && (
          <div className="w-full max-w-4xl mt-8 px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
          </div>
        )}

        {/* Selected Video Info */}
        {videos.length > 0 && videos[selectedVideoIndex] && (
          <div className="w-full max-w-3xl mx-auto mt-8 px-4">
            <div className="flex items-center justify-between">
              {/* Left - Video Title */}
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">
                  {selectedVideoIndex + 1} de {videos.length}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {videos[selectedVideoIndex].title}
                </h2>
              </div>
              
              {/* Right - Section and Progress */}
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {videos[selectedVideoIndex].phaseName}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Math.round((videos.filter(v => v.isCompleted).length / videos.length) * 100)}% completado
                </p>
              </div>
            </div>
            
            {/* Video Description */}
            {videos[selectedVideoIndex].description && (
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {videos[selectedVideoIndex].description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
