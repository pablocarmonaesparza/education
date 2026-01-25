'use client';

import Link from 'next/link';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  videoCount: number;
  duration: string;
  progress?: number;
}

export default function CourseCard({
  id,
  title,
  description,
  icon,
  videoCount,
  duration,
  progress = 0,
}: CourseCardProps) {
  return (
    <Link
      href={`/dashboard/course/${id}`}
      className="block bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-200 dark:border-gray-950 hover:border-[#1472FF] dark:hover:border-[#1472FF] group"
    >
      {/* Header */}
      <div className="relative bg-[#1472FF] p-6">
        <div className="text-5xl mb-2">{icon}</div>
        <h3 className="text-xl font-extrabold text-white group-hover:underline tracking-tight">
          {title}
        </h3>
        {progress > 0 && (
          <div className="absolute top-4 right-4 bg-white text-[#1472FF] px-3 py-1 rounded-full text-sm font-bold border-b-2 border-gray-200">
            {progress}%
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="text-[#777777] dark:text-gray-400 mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between text-sm text-[#777777] dark:text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{videoCount} videos</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{duration}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1472FF] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
