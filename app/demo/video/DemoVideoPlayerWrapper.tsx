'use client';

interface DemoVideoPlayerWrapperProps {
  videoUrl: string;
  title: string;
}

export default function DemoVideoPlayerWrapper({ videoUrl, title }: DemoVideoPlayerWrapperProps) {
  return (
    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
      {videoUrl ? (
        <video
          className="w-full h-full object-contain"
          controls
          autoPlay
          src={videoUrl}
          title={title}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1472FF]">
          <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <p className="mt-4 text-white/60 text-sm">{title}</p>
        </div>
      )}
    </div>
  );
}
