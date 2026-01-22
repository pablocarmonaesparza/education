'use client';

import { useState } from 'react';

interface ProgressBuilderProps {
  totalProgress: number; // 0-100
  videosWatched: number;
  totalVideos: number;
  phasesCompleted: number;
  totalPhases: number;
}

// SVG Car Component with illuminating parts
function CarVisual({ progress }: { progress: number }) {
  const hasChasis = progress >= 0;
  const hasWheels = progress >= 10;
  const hasEngine = progress >= 25;
  const hasTransmission = progress >= 40;
  const hasBody = progress >= 55;
  const hasInterior = progress >= 70;
  const hasElectronics = progress >= 85;
  const hasPaint = progress >= 95;

  const activeStyle = "opacity-100 transition-all duration-500";
  const inactiveStyle = "opacity-20 transition-all duration-500";

  return (
    <svg viewBox="0 0 400 200" className="w-full h-auto max-h-48">
      {/* Background glow for completed car */}
      {hasPaint && (
        <ellipse cx="200" cy="160" rx="180" ry="30" fill="url(#glowGradient)" className="animate-pulse" />
      )}

      {/* Chassis/Frame - Base structure */}
      <g className={hasChasis ? activeStyle : inactiveStyle}>
        <rect x="60" y="100" width="280" height="20" rx="5" fill="#374151" />
        <rect x="80" y="90" width="240" height="15" rx="3" fill="#4B5563" />
      </g>

      {/* Wheels */}
      <g className={hasWheels ? activeStyle : inactiveStyle}>
        {/* Front wheel */}
        <circle cx="110" cy="140" r="28" fill="#1F2937" />
        <circle cx="110" cy="140" r="20" fill="#374151" />
        <circle cx="110" cy="140" r="8" fill="#6B7280" />
        {/* Rear wheel */}
        <circle cx="290" cy="140" r="28" fill="#1F2937" />
        <circle cx="290" cy="140" r="20" fill="#374151" />
        <circle cx="290" cy="140" r="8" fill="#6B7280" />
      </g>

      {/* Engine - Hood area */}
      <g className={hasEngine ? activeStyle : inactiveStyle}>
        <rect x="60" y="70" width="80" height="30" rx="5" fill="#EF4444" />
        <rect x="70" y="75" width="60" height="20" rx="3" fill="#DC2626" />
        {/* Engine details */}
        <rect x="75" y="80" width="10" height="10" rx="2" fill="#FCA5A5" />
        <rect x="90" y="80" width="10" height="10" rx="2" fill="#FCA5A5" />
        <rect x="105" y="80" width="10" height="10" rx="2" fill="#FCA5A5" />
      </g>

      {/* Transmission - Under car */}
      <g className={hasTransmission ? activeStyle : inactiveStyle}>
        <rect x="150" y="105" width="100" height="10" rx="2" fill="#F59E0B" />
        <circle cx="175" cy="110" r="5" fill="#FBBF24" />
        <circle cx="200" cy="110" r="5" fill="#FBBF24" />
        <circle cx="225" cy="110" r="5" fill="#FBBF24" />
      </g>

      {/* Body - Main car body */}
      <g className={hasBody ? activeStyle : inactiveStyle}>
        {/* Main body */}
        <path
          d="M80 70 Q80 40 120 40 L280 40 Q320 40 320 70 L340 90 L340 100 L60 100 L60 90 Z"
          fill="#3B82F6"
        />
        {/* Roof */}
        <path
          d="M140 40 Q140 20 180 20 L220 20 Q260 20 260 40 Z"
          fill="#2563EB"
        />
      </g>

      {/* Interior - Windows and seats */}
      <g className={hasInterior ? activeStyle : inactiveStyle}>
        {/* Windshield */}
        <path
          d="M130 42 L145 25 L195 25 L180 42 Z"
          fill="#93C5FD"
        />
        {/* Rear window */}
        <path
          d="M220 42 L205 25 L255 25 L270 42 Z"
          fill="#93C5FD"
        />
        {/* Side windows */}
        <rect x="185" y="28" width="15" height="12" rx="2" fill="#BFDBFE" />
        {/* Seats */}
        <rect x="160" y="60" width="20" height="25" rx="3" fill="#7C3AED" />
        <rect x="220" y="60" width="20" height="25" rx="3" fill="#7C3AED" />
      </g>

      {/* Electronics - Lights */}
      <g className={hasElectronics ? activeStyle : inactiveStyle}>
        {/* Headlights */}
        <ellipse cx="65" cy="80" rx="8" ry="6" fill={hasElectronics ? "#FEF08A" : "#9CA3AF"} />
        <ellipse cx="65" cy="80" rx="5" ry="4" fill={hasElectronics ? "#FFFFFF" : "#D1D5DB"} />
        {/* Taillights */}
        <ellipse cx="335" cy="80" rx="8" ry="6" fill={hasElectronics ? "#FCA5A5" : "#9CA3AF"} />
        {/* Light beams when active */}
        {hasElectronics && (
          <>
            <path d="M50 75 L20 65 L20 95 L50 85 Z" fill="#FEF9C3" opacity="0.6" />
          </>
        )}
      </g>

      {/* Paint/Finish - Shine effects */}
      {hasPaint && (
        <g className="animate-pulse">
          {/* Shine on body */}
          <ellipse cx="200" cy="50" rx="60" ry="10" fill="white" opacity="0.3" />
          <ellipse cx="120" cy="75" rx="20" ry="5" fill="white" opacity="0.4" />
          {/* Sparkles */}
          <circle cx="100" cy="30" r="3" fill="#FEF08A" />
          <circle cx="300" cy="35" r="2" fill="#FEF08A" />
          <circle cx="180" cy="15" r="2" fill="#FEF08A" />
        </g>
      )}

      {/* Gradients */}
      <defs>
        <radialGradient id="glowGradient">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function ProgressBuilder({
  totalProgress = 25,
  videosWatched = 15,
  totalVideos = 60,
  phasesCompleted = 2,
  totalPhases = 8,
}: ProgressBuilderProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Parts unlock at different progress percentages
  const parts = [
    { id: 'chassis', name: 'Chasis', emoji: '🔧', unlockAt: 0, description: 'La base de tu proyecto' },
    { id: 'wheels', name: 'Ruedas', emoji: '🛞', unlockAt: 10, description: 'Fundamentos sólidos' },
    { id: 'engine', name: 'Motor', emoji: '⚙️', unlockAt: 25, description: 'El corazón del sistema' },
    { id: 'transmission', name: 'Transmisión', emoji: '🔩', unlockAt: 40, description: 'Conectando todo' },
    { id: 'body', name: 'Carrocería', emoji: '🚗', unlockAt: 55, description: 'Tomando forma' },
    { id: 'interior', name: 'Interior', emoji: '💺', unlockAt: 70, description: 'Los detalles importan' },
    { id: 'electronics', name: 'Electrónica', emoji: '⚡', unlockAt: 85, description: 'Inteligencia integrada' },
    { id: 'paint', name: 'Pintura', emoji: '🎨', unlockAt: 95, description: '¡Listo para brillar!' },
  ];

  const unlockedParts = parts.filter(part => totalProgress >= part.unlockAt);
  const nextPart = parts.find(part => totalProgress < part.unlockAt);
  const progressToNext = nextPart
    ? ((totalProgress - (parts[parts.indexOf(nextPart) - 1]?.unlockAt || 0)) /
       (nextPart.unlockAt - (parts[parts.indexOf(nextPart) - 1]?.unlockAt || 0))) * 100
    : 100;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with Car Visual */}
      <div className="bg-[#1472FF] p-6">
        <div className="text-center mb-2">
          <h3 className="text-white font-bold text-xl">Construye tu Proyecto</h3>
          <p className="text-white/80 text-sm">Cada video te acerca más a tu meta</p>
        </div>

        {/* Car SVG Visual */}
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <CarVisual progress={totalProgress} />
        </div>

        {/* Main Progress Bar */}
        <div className="relative">
          <div className="flex justify-between text-xs text-white/80 mb-2">
            <span>{totalProgress}% completado</span>
            <span>{videosWatched}/{totalVideos} videos</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
            <div
              className="bg-white rounded-full h-4 transition-all duration-1000 ease-out relative"
              style={{ width: `${totalProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/50 animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Parts Grid */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {parts.map((part, index) => {
            const isUnlocked = totalProgress >= part.unlockAt;
            const isNext = part === nextPart;

            return (
              <div
                key={part.id}
                className={`
                  relative p-3 rounded-lg text-center transition-all duration-300
                  ${isUnlocked
                    ? 'bg-green-50 border-2 border-green-300'
                    : isNext
                    ? 'bg-yellow-50 border-2 border-yellow-300 animate-pulse'
                    : 'bg-gray-100 border-2 border-gray-200'
                  }
                `}
              >
                <div className={`text-2xl mb-1 ${!isUnlocked && 'grayscale opacity-40'}`}>
                  {part.emoji}
                </div>
                <div className={`text-xs font-medium ${isUnlocked ? 'text-green-700' : 'text-gray-400'}`}>
                  {part.name}
                </div>
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {isNext && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px]">🔜</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Part Progress */}
        {nextPart && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{nextPart.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">
                    Próxima pieza: {nextPart.name}
                  </span>
                  <span className="text-sm text-gray-500">{nextPart.unlockAt}%</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {nextPart.description}
                </p>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {totalProgress >= 95 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h4 className="font-bold text-green-700">¡Proyecto Completado!</h4>
            <p className="text-sm text-green-600">Tu coche está listo para conquistar el mundo</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              <span className="font-bold text-green-600">{unlockedParts.length}</span>/{parts.length} piezas
            </span>
            <span className="text-gray-600">
              <span className="font-bold text-[#1472FF]">{phasesCompleted}</span>/{totalPhases} fases
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[#1472FF] hover:text-[#0E5FCC] font-medium"
          >
            {showDetails ? 'Ocultar' : 'Ver piezas'}
          </button>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              {parts.map(part => (
                <div
                  key={part.id}
                  className={`flex items-center gap-2 text-xs p-2 rounded ${
                    totalProgress >= part.unlockAt
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <span>{part.emoji}</span>
                  <span className={totalProgress >= part.unlockAt ? 'text-green-700' : 'text-gray-400'}>
                    {part.name}
                  </span>
                  <span className="ml-auto text-gray-400">{part.unlockAt}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
