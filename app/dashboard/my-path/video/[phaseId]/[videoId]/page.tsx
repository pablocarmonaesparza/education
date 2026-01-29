'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string | null;
  order: number;
  videoUrl?: string;
}

interface Phase {
  id: string;
  name: string;
  videos: Video[];
}

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const phaseId = params.phaseId as string;
  const videoId = params.videoId as string;
  
  const [video, setVideo] = useState<Video | null>(null);
  const [phase, setPhaseName] = useState<string>('');
  const [allVideos, setAllVideos] = useState<{ video: Video; phaseId: string; phaseName: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchVideo() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get user's generated path
      const { data: intakeData } = await supabase
        .from('intake_responses')
        .select('generated_path')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!intakeData?.generated_path) {
        router.push('/dashboard');
        return;
      }

      // Get progress data
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
      const rawPhases = path.phases || path.course?.phases || path.modules || path.sections || [];
      
      let foundVideo: Video | null = null;
      let foundPhaseName = '';
      const videosList: { video: Video; phaseId: string; phaseName: string }[] = [];
      let globalOrder = 0;

      rawPhases.forEach((phase: any, phaseIndex: number) => {
        const phaseVideos = phase.videos || phase.content || phase.lessons || [];
        const pName = phase.phase_name || phase.title || phase.name || `Fase ${phaseIndex + 1}`;
        const pId = (phase.phase_number || phase.id || `phase-${phaseIndex}`).toString();
        
        phaseVideos.forEach((v: any) => {
          const vId = v.order?.toString() || v.id || `video-${globalOrder}`;
          const videoTitle = v.description || v.title || v.name || `Video ${globalOrder + 1}`;
          const videoDescription = v.why_relevant || v.summary || '';
          
          let duration: string | null = null;
          if (v.duration) {
            if (typeof v.duration === 'string') {
              duration = v.duration;
            } else if (typeof v.duration === 'number') {
              const mins = Math.floor(v.duration / 60);
              const secs = Math.floor(v.duration % 60);
              duration = `${mins}:${secs.toString().padStart(2, '0')}`;
            }
          }

          const videoObj: Video = {
            id: vId,
            title: videoTitle,
            description: videoDescription,
            duration,
            order: globalOrder,
            videoUrl: v.video_url || v.url || null,
          };

          videosList.push({ video: videoObj, phaseId: pId, phaseName: pName });

          if (pId === phaseId && vId === videoId) {
            foundVideo = videoObj;
            foundPhaseName = pName;
            setIsCompleted(completedSet.has(vId));
          }

          globalOrder++;
        });
      });

      if (foundVideo) {
        setVideo(foundVideo);
        setPhaseName(foundPhaseName);
        setAllVideos(videosList);
        const idx = videosList.findIndex(v => v.phaseId === phaseId && v.video.id === videoId);
        setCurrentIndex(idx);
      }
      
      setLoading(false);
    }

    fetchVideo();
  }, [phaseId, videoId, supabase, router]);

  const handleMarkComplete = async () => {
    if (!video || markingComplete) return;
    
    setMarkingComplete(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('video_progress')
      .upsert({
        user_id: user.id,
        video_id: video.id,
        completed: true,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,video_id'
      });

    if (!error) {
      setIsCompleted(true);
      
      // Auto-navigate to next video after marking complete
      if (currentIndex < allVideos.length - 1) {
        const next = allVideos[currentIndex + 1];
        setTimeout(() => {
          router.push(`/dashboard/my-path/video/${next.phaseId}/${next.video.id}`);
        }, 500);
      }
    }
    
    setMarkingComplete(false);
  };

  const goToVideo = (index: number) => {
    if (index >= 0 && index < allVideos.length) {
      const v = allVideos[index];
      router.push(`/dashboard/my-path/video/${v.phaseId}/${v.video.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-transparent flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1472FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-full bg-transparent flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Video no encontrado</h2>
          <Link href="/dashboard" className="text-[#1472FF] hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        {/* Video Header */}
        <div className="mb-6">
          <p className="text-sm text-[#1472FF] font-medium mb-1">{phase}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {video.title}
          </h1>
          {video.duration && (
            <p className="text-gray-500 dark:text-gray-400 mt-2">Duración: {video.duration}</p>
          )}
        </div>

        {/* Video Player Area */}
        <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center mb-6 overflow-hidden">
          {video.videoUrl ? (
            <video
              src={video.videoUrl}
              controls
              className="w-full h-full"
              poster=""
            >
              Tu navegador no soporta el tag de video.
            </video>
          ) : (
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">Video próximamente disponible</p>
              <p className="text-sm mt-1 opacity-70">El contenido se está preparando</p>
            </div>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-950 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Descripción</h3>
            <p className="text-gray-600 dark:text-gray-400">{video.description}</p>
          </div>
        )}

        {/* Navigation & Complete Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToVideo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-950 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1} de {allVideos.length}
            </span>
            
            <button
              onClick={() => goToVideo(currentIndex + 1)}
              disabled={currentIndex === allVideos.length - 1}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-950 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Complete Button */}
          <button
            onClick={handleMarkComplete}
            disabled={isCompleted || markingComplete}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              isCompleted
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all'
            } disabled:opacity-70`}
          >
            {isCompleted ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completado
              </span>
            ) : markingComplete ? (
              'Guardando...'
            ) : (
              <span className="flex items-center gap-2">
                Marcar como completado
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
