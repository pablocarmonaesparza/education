'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';

interface FavoritesContentProps {
  learningPath?: any;
}

export default function FavoritesContent({ learningPath }: FavoritesContentProps) {
  const [favoriteVideos, setFavoriteVideos] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Extraer y organizar videos por fases usando useMemo
  const videosByPhase = useMemo(() => {
    const result: Record<string, any[]> = {};
    
    try {
      if (learningPath?.phases && Array.isArray(learningPath.phases)) {
        learningPath.phases.forEach((phase: any) => {
          if (phase && phase.videos && Array.isArray(phase.videos)) {
            const phaseKey = `Fase ${phase.phase_number}: ${phase.phase_name}`;
            result[phaseKey] = [];
            
            phase.videos.forEach((video: any) => {
              if (video && video.order) {
                result[phaseKey].push({
                  ...video,
                  phaseNumber: phase.phase_number,
                  phaseName: phase.phase_name,
                });
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error extracting videos:', error);
    }
    
    return result;
  }, [learningPath]);

  // Expandir la primera fase por defecto usando useEffect
  useEffect(() => {
    if (!isInitialized && Object.keys(videosByPhase).length > 0) {
      const firstPhaseKey = Object.keys(videosByPhase)[0];
      setExpandedPhases(new Set([firstPhaseKey]));
      setIsInitialized(true);
    }
  }, [videosByPhase, isInitialized]);

  const togglePhase = (phaseKey: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseKey)) {
        newSet.delete(phaseKey);
      } else {
        newSet.add(phaseKey);
      }
      return newSet;
    });
  };

  const toggleFavorite = (videoId: string) => {
    setFavoriteVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const hasVideos = Object.keys(videosByPhase).length > 0;

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Videos Favoritos</h1>
        <p className="text-gray-600">
          Tus videos guardados organizados por fase
        </p>
      </div>

      {hasVideos ? (
        <div className="space-y-12">
          {Object.entries(videosByPhase).map(([phaseTitle, videos]) => {
            if (videos.length === 0) return null;
            
            const isExpanded = expandedPhases.has(phaseTitle);
            
            return (
              <div key={phaseTitle} className="space-y-4">
                <button
                  onClick={() => togglePhase(phaseTitle)}
                  className="w-full flex items-center gap-3 pb-2 border-b border-gray-100 hover:border-gray-200 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1472FF]/10 flex items-center justify-center text-[#1472FF] font-bold flex-shrink-0">
                    {phaseTitle.split(':')[0].replace('Fase ', '')}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 flex-1 text-left group-hover:text-[#1472FF] transition-colors">
                    {phaseTitle.split(':')[1]}
                  </h2>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="pl-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.map((video, index) => {
                    const phaseNumber = video.phaseNumber;
                    const videoOrder = video.order;
                    const videoId = `${phaseNumber}-${videoOrder}`;
                    const isFavorite = favoriteVideos.has(videoId);
                    
                    return (
                      <div
                        key={`${phaseNumber}-${videoOrder}-${index}`}
                        className="bg-white rounded-xl border border-gray-200 hover:border-[#1472FF]/30 hover:shadow-lg transition-all duration-200 overflow-hidden group flex flex-col h-full"
                      >
                        <Link
                          href={`/dashboard/my-path/video/${phaseNumber}/${videoOrder}`}
                          className="block relative overflow-hidden aspect-video"
                        >
                          {/* Thumbnail Placeholder */}
                          <div className="absolute inset-0 bg-[#1472FF]/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <div className="absolute inset-0 bg-[#1472FF]/10 group-hover:bg-[#1472FF]/20 transition-all" />
                            <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/50 transition-all">
                              <svg className="w-6 h-6 text-[#1472FF] ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          {video.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-md">
                              {video.duration}
                            </div>
                          )}
                        </Link>

                        {/* Video Info */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="mb-auto">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Link
                                href={`/dashboard/my-path/video/${phaseNumber}/${videoOrder}`}
                                className="flex-1"
                              >
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-[#1472FF] transition-colors">
                                  {video.description || `Video ${video.order}`}
                                </h3>
                              </Link>
                            </div>
                            
                            {video.section && (
                              <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                  {video.section}
                                </span>
                              </div>
                            )}

                            {video.why_relevant && (
                              <p className="text-xs text-gray-500 line-clamp-2 italic mb-4">
                                {video.why_relevant}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-gray-50 flex items-center justify-between mt-2">
                            <Link
                              href={`/dashboard/my-path/video/${phaseNumber}/${videoOrder}`}
                              className="text-xs text-[#1472FF] font-medium hover:text-[#0E5FCC] flex items-center gap-1"
                            >
                              Ver video
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(videoId);
                              }}
                              className="p-1.5 rounded-full hover:bg-red-50 transition-colors group/btn"
                              title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                            >
                              <svg 
                                className={`w-4 h-4 transition-colors ${
                                  isFavorite 
                                    ? 'text-red-500 fill-red-500' 
                                    : 'text-gray-400 group-hover/btn:text-red-400'
                                }`}
                                fill={isFavorite ? 'currentColor' : 'none'}
                                stroke={isFavorite ? 'none' : 'currentColor'}
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center max-w-2xl mx-auto mt-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aún no tienes videos favoritos</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Marca videos como favoritos mientras aprendes para crear tu propia colección personalizada y acceder a ellos rápidamente.
          </p>
          <Link
            href="/dashboard/my-path"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#1472FF] hover:bg-[#0E5FCC] transition-colors shadow-sm hover:shadow"
          >
            Explorar mi ruta
          </Link>
        </div>
      )}
    </div>
  );
}
