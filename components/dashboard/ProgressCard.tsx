'use client';

interface ProgressCardProps {
  title: string;
  progress: number;
  total: number;
  icon?: React.ReactNode;
}

export default function ProgressCard({ title, progress, total, icon }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
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
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1472FF] rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="absolute right-0 -top-6 text-sm font-semibold text-[#1472FF]">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
