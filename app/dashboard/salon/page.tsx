'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number | null;
  order: number;
  phaseId: string;
  phaseName: string;
  videoUrl?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export default function SalonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoParam = searchParams.get('video');
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
          const allVideos: Video[] = [];
          let globalOrder = 0;
          let foundCurrent = false;
          let currentVid: Video | null = null;

          const rawPhases = path.phases || path.course?.phases || path.modules || path.sections || [];
          
          rawPhases.forEach((phase: any, phaseIndex: number) => {
            const phaseVideos = phase.videos || phase.content || phase.lessons || [];
            const phaseName = phase.phase_name || phase.title || phase.name || `Fase ${phaseIndex + 1}`;
            const phaseId = (phase.phase_number || phase.id || `phase-${phaseIndex}`).toString();
            
            phaseVideos.forEach((video: any) => {
              const videoId = video.order?.toString() || video.id || `video-${globalOrder}`;
              const isCompleted = completedSet.has(videoId);
              const isCurrent = !isCompleted && !foundCurrent;
              
              if (isCurrent) {
                foundCurrent = true;
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
              
              const vid: Video = {
                id: videoId,
                title: videoTitle,
                description: videoDescription,
                duration: durationSeconds,
                order: globalOrder,
                phaseId,
                phaseName,
                videoUrl: video.video_url || video.url,
                isCompleted,
                isCurrent,
              };
              
              allVideos.push(vid);
              
              if (isCurrent) {
                currentVid = vid;
              }
              
              globalOrder++;
            });
          });

          setVideos(allVideos);
          
          // Check if there's a video parameter in the URL
          if (videoParam !== null) {
            const videoOrder = parseInt(videoParam);
            const selectedVideo = allVideos.find(v => v.order === videoOrder);
            setCurrentVideo(selectedVideo || currentVid || allVideos[0] || null);
          } else {
            setCurrentVideo(currentVid || allVideos[0] || null);
          }
        }
      }
      setIsLoading(false);
    }
    
    fetchData();
  }, [supabase, videoParam]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
  };

  const handlePrevious = () => {
    if (currentVideo && currentVideo.order > 0) {
      setCurrentVideo(videos[currentVideo.order - 1]);
    }
  };

  const handleNext = () => {
    if (currentVideo && currentVideo.order < videos.length - 1) {
      setCurrentVideo(videos[currentVideo.order + 1]);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-11rem)] bg-transparent flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1472FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="h-[calc(100vh-11rem)] bg-transparent flex flex-col items-center justify-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Sin videos disponibles</h3>
        <p className="mt-1 text-gray-500">Completa el onboarding para generar tu curso</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-11rem)] bg-transparent overflow-hidden">
      <div className="h-full flex gap-4 p-4 max-w-7xl mx-auto w-full">
        
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Video Player */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video">
            {currentVideo.videoUrl ? (
              <video
                key={currentVideo.id}
                className="w-full h-full object-contain"
                controls
                autoPlay
                src={currentVideo.videoUrl}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1472FF] to-[#5BA0FF]">
                <svg className="w-20 h-20 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <p className="mt-4 text-white/60 text-sm">Video no disponible</p>
              </div>
            )}
          </div>
          
          {/* Video Info */}
          <div className="mt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-gray-400">{currentVideo.phaseName} • {currentVideo.order + 1} de {videos.length}</p>
                <h1 className="text-xl font-bold text-gray-900 mt-1">{currentVideo.title}</h1>
                {currentVideo.description && (
                  <p className="text-gray-600 mt-2 line-clamp-2">{currentVideo.description}</p>
                )}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handlePrevious}
                  disabled={currentVideo.order === 0}
                  className="p-2 rounded-full border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentVideo.order === videos.length - 1}
                  className="p-2 rounded-full border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Sidebar */}
        <div className="w-80 flex-shrink-0 h-full flex flex-col bg-gray-50 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="font-bold text-gray-900">Lista de videos</h2>
            <p className="text-sm text-gray-500">{videos.filter(v => v.isCompleted).length} de {videos.length} completados</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Group videos by phase */}
            {(() => {
              const phases: { name: string; videos: Video[] }[] = [];
              let currentPhase = '';
              
              videos.forEach((video) => {
                if (video.phaseName !== currentPhase) {
                  currentPhase = video.phaseName;
                  phases.push({ name: currentPhase, videos: [] });
                }
                phases[phases.length - 1].videos.push(video);
              });
              
              return phases.map((phase, phaseIndex) => (
                <div key={phaseIndex}>
                  {/* Phase Header */}
                  <div className="sticky top-0 bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">{phase.name}</h3>
                  </div>
                  
                  {/* Phase Videos */}
                  {phase.videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                        currentVideo.id === video.id
                          ? 'bg-blue-50 border-l-2 border-[#1472FF]'
                          : 'hover:bg-gray-100 border-l-2 border-transparent'
                      }`}
                    >
                      {/* Status Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        video.isCompleted
                          ? 'bg-green-500'
                          : currentVideo.id === video.id
                          ? 'bg-gradient-to-br from-[#1472FF] to-[#5BA0FF]'
                          : 'bg-gray-200'
                      }`}>
                        {video.isCompleted ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : currentVideo.id === video.id ? (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium">{video.order + 1}</span>
                        )}
                      </div>
                      
                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium line-clamp-2 ${
                          currentVideo.id === video.id ? 'text-[#1472FF]' : video.isCompleted ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDuration(video.duration)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

