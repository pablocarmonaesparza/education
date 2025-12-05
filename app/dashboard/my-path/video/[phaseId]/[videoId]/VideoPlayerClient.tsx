'use client';

import { useState } from 'react';
import VideoPlayer from '@/components/dashboard/VideoPlayer';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface VideoPlayerClientProps {
  videoUrl: string;
  videoId: string;
  userId: string;
  title: string;
  initialTime?: number;
  nextVideoUrl: string | null;
}

export default function VideoPlayerClient({
  videoUrl,
  videoId,
  userId,
  title,
  initialTime = 0,
  nextVideoUrl,
}: VideoPlayerClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleProgress = async (currentTime: number) => {
    // Guardar progreso cada 10 segundos
    if (Math.floor(currentTime) % 10 === 0) {
      await supabase
        .from('video_progress')
        .upsert({
          user_id: userId,
          video_id: videoId,
          last_position: currentTime,
          updated_at: new Date().toISOString(),
        });
    }
  };

  const handleComplete = async () => {
    setIsCompleted(true);

    // Marcar como completado
    await supabase
      .from('video_progress')
      .upsert({
        user_id: userId,
        video_id: videoId,
        completed: true,
        last_position: 0,
        completed_at: new Date().toISOString(),
      });
  };

  const handleMarkAsCompleted = async () => {
    await handleComplete();
  };

  const handleNextVideo = () => {
    if (nextVideoUrl) {
      router.push(nextVideoUrl);
    }
  };

  return (
    <>
      <VideoPlayer
        videoUrl={videoUrl}
        title={title}
        onProgress={handleProgress}
        onComplete={handleComplete}
        initialTime={initialTime}
      />

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleMarkAsCompleted}
          disabled={isCompleted}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isCompleted
              ? 'bg-green-500 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] text-white hover:from-[#0E5FCC] hover:to-[#1472FF] cursor-pointer'
          }`}
        >
          {isCompleted ? '✓ Completado' : 'Marcar como Completado'}
        </button>

        {nextVideoUrl && (
          <button
            onClick={handleNextVideo}
            className="border-2 border-[#1472FF] text-[#1472FF] px-6 py-3 rounded-lg font-semibold hover:bg-[#1472FF]/10 transition-all cursor-pointer"
          >
            Siguiente Video →
          </button>
        )}
      </div>
    </>
  );
}
