'use client';

interface VideoPlayerProps {
  videoId?: string; // Made optional as videoUrl will be primary
  videoUrl: string;
  title: string;
  platform?: 'youtube' | 'vimeo'; // Future extension
  onProgress: (time: number) => void;
  onComplete: () => void;
  initialTime?: number;
}

export default function VideoPlayer({
  videoId, // Kept for potential internal use or legacy
  videoUrl,
  title,
  platform = 'youtube',
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  // Placeholder for embedded video player logic
  // In a real application, this would embed YouTube/Vimeo iframes
  // For now, simulate progress and completion
  const handleFakeProgress = () => {
    // Simulate some progress after a delay
    setTimeout(() => onProgress(50), 1000); // 50% progress
  };

  const handleFakeComplete = () => {
    // Simulate completion after another delay
    setTimeout(() => onComplete(), 2000);
  };

  return (
    <div className="aspect-video w-full bg-black flex flex-col items-center justify-center text-white text-lg p-4">
      <p className="text-xl font-bold mb-2">Video Player Placeholder</p>
      <p className="text-base mb-1">Title: {title}</p>
      <p className="text-base mb-4">URL: {videoUrl}</p>
      {videoId && <p className="text-sm text-gray-400">Video ID: {videoId} (Platform: {platform})</p>}
      <div className="flex gap-4 mt-4">
        <button onClick={handleFakeProgress} className="px-4 py-2 bg-blue-500 rounded-md">Simulate Progress</button>
        <button onClick={handleFakeComplete} className="px-4 py-2 bg-green-500 rounded-md">Simulate Complete</button>
      </div>
    </div>
  );
}