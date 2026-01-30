'use client';

import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

interface ProgressCardProps {
  title: string;
  progress: number;
  total: number;
  icon?: React.ReactNode;
}

export default function ProgressCard({ title, progress, total, icon }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <Card variant="neutral" padding="lg" className="shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-extrabold text-[#4b4b4b] dark:text-white tracking-tight">{title}</h3>
          <p className="text-sm text-[#777777] dark:text-gray-400 mt-1">
            {progress} de {total} completados
          </p>
        </div>
        {icon && (
          <div className="text-[#1472FF]">
            {icon}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <ProgressBar value={percentage} size="lg" color="primary" trackClassName="bg-gray-200 dark:bg-gray-700" durationMs={500} />
        <span className="absolute right-0 -top-6 text-sm font-bold text-[#1472FF]">
          {percentage}%
        </span>
      </div>
    </Card>
  );
}
