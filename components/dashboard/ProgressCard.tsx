'use client';

import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { Subtitle, Caption } from '@/components/ui/Typography';

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
          <Subtitle>{title}</Subtitle>
          <Caption className="mt-1">
            {progress} de {total} completados
          </Caption>
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
