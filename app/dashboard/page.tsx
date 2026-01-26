'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LessonItem from '@/components/dashboard/LessonItem';

const greetings = [
  "Hola",
  "Qué bueno que regresaste",
  "Qué gusto verte",
  "Bienvenido de vuelta",
  "Es un placer tenerte aquí",
  "Qué alegría verte de nuevo",
  "Hola de nuevo",
  "Buen día",
];

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number | null;
  order: number;
  phaseId: string;
  phaseName: string;
  isCompleted: boolean;
  isCurrent: boolean;
  videoUrl?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');
  const [project, setProject] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhaseId, setActivePhaseId] = useState<string>('');
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showGreeting, setShowGreeting] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isVideoPlayerClosing, setIsVideoPlayerClosing] = useState(false);
  const [chatWidth, setChatWidth] = useState(256);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const phaseSectionsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const isScrollingToPhaseRef = useRef(false);
  const supabase = createClient();

  // Listen for chat width changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const width = getComputedStyle(document.documentElement).getPropertyValue('--chat-width');
      if (width) {
        setChatWidth(parseInt(width, 10) || 256);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    // Initial value
    const initialWidth = getComputedStyle(document.documentElement).getPropertyValue('--chat-width');
    if (initialWidth) {
      setChatWidth(parseInt(initialWidth, 10) || 256);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .single();
        
        const name = profile?.name || user.user_metadata?.name || profile?.email?.split('@')[0] || 'Usuario';
        const firstName = name.split(' ')[0];
        setUserName(firstName);
        
        // Select random greeting
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        setGreeting(randomGreeting);

        // Fetch user's data from intake_responses
        const { data: intakeData } = await supabase
          .from('intake_responses')
          .select('responses, generated_path')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        // Get project idea
        const projectIdea = 
          intakeData?.responses?.project_idea ||
          intakeData?.responses?.project ||
          intakeData?.responses?.idea ||
          '';
        
        if (projectIdea) {
          setProject(projectIdea);
        }

        // Get videos from generated_path
        if (intakeData?.generated_path) {
          // Fetch video progress
          const { data: progressData } = await supabase
            .from('video_progress')
            .select('video_id, completed')
            .eq('user_id', user.id);

          const completedVideos = new Set(
            (progressData || [])
              .filter((p: any) => p.completed)
              .map((p: any) => p.video_id)
          );

          // Parse generated_path to get videos
          const path = intakeData.generated_path;
          const allVideos: Video[] = [];
          let videoOrder = 0;
          let foundCurrent = false;

          // Handle different possible structures (n8n format: course.phases)
          const phases = path.phases || path.course?.phases || path.modules || path.sections || [];
          
          phases.forEach((phase: any, phaseIndex: number) => {
            const phaseVideos = phase.videos || phase.content || phase.lessons || [];
            const phaseName = phase.phase_name || phase.title || phase.name || `Fase ${phaseIndex + 1}`;
            const phaseId = phase.phase_number || phase.id || `phase-${phaseIndex}`;
            
            phaseVideos.forEach((video: any) => {
              const videoId = video.order?.toString() || video.id || `video-${videoOrder}`;
              const isCompleted = completedVideos.has(videoId);
              const isCurrent = !isCompleted && !foundCurrent;
              
              if (isCurrent) {
                foundCurrent = true;
              }
              
              // n8n format: description is the video title, why_relevant is the description
              const videoTitle = video.description || video.title || video.name || `Video ${videoOrder + 1}`;
              const videoDescription = video.why_relevant || video.summary || '';
              
              // Parse duration from "2:30" format to seconds
              let durationSeconds: number | null = null;
              if (video.duration) {
                if (typeof video.duration === 'string' && video.duration.includes(':')) {
                  const [mins, secs] = video.duration.split(':').map(Number);
                  durationSeconds = (mins * 60) + (secs || 0);
                } else if (typeof video.duration === 'number') {
                  durationSeconds = video.duration;
                } else {
                  durationSeconds = parseInt(video.duration) || null;
                }
              }
              
              allVideos.push({
                id: videoId,
                title: videoTitle,
                description: videoDescription,
                duration: durationSeconds,
                order: videoOrder,
                phaseId: phaseId.toString(),
                phaseName,
                isCompleted,
                isCurrent,
                videoUrl: video.video_url || video.url || undefined,
              });
              
              videoOrder++;
            });
          });

          setVideos(allVideos);
        }
      }
      setIsLoading(false);
    }
    
    fetchUserData();
  }, [supabase]);

  const formatDuration = (seconds: number | undefined | null) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Group videos by phase
  const videosByPhase = videos.reduce((acc, video) => {
    if (!acc[video.phaseId]) {
      acc[video.phaseId] = {
        phaseName: video.phaseName,
        videos: []
      };
    }
    acc[video.phaseId].videos.push(video);
    return acc;
  }, {} as Record<string, { phaseName: string; videos: Video[] }>);

  const completedCount = videos.filter(v => v.isCompleted).length;
  const totalCount = videos.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Set initial active phase and center it
  useEffect(() => {
    if (videos.length > 0 && Object.keys(videosByPhase).length > 0 && !activePhaseId) {
      // Find the current video's phase (the one the user is on)
      const currentVideo = videos.find(v => v.isCurrent);
      const initialPhaseId = currentVideo ? currentVideo.phaseId : Object.keys(videosByPhase)[0];
      setActivePhaseId(initialPhaseId);
    }
  }, [videos, videosByPhase, activePhaseId]);

  // Center button in horizontal scroll
  const centerHorizontalButton = useCallback((phaseId: string, smooth: boolean = true) => {
    if (!horizontalScrollRef.current) return;

    const button = horizontalScrollRef.current.querySelector(
      `button[data-phase-id="${phaseId}"]`
    ) as HTMLElement;

    if (button) {
      const container = horizontalScrollRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Calculate center position
      const containerCenter = containerRect.width / 2;
      const buttonCenter = buttonRect.left - containerRect.left + buttonRect.width / 2;
      const scrollAdjustment = buttonCenter - containerCenter;

      container.scrollTo({
        left: container.scrollLeft + scrollAdjustment,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, []);

  // Center initial phase button on load
  useEffect(() => {
    if (activePhaseId && horizontalScrollRef.current && videos.length > 0) {
      // Delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        centerHorizontalButton(activePhaseId, false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [videos.length, activePhaseId, centerHorizontalButton]);

  // Main scroll handler for greeting visibility and scroll direction detection
  useEffect(() => {
    // Wait for videos to load and container to be available
    if (isLoading || videos.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let lastScrollY = container.scrollTop;
    const threshold = 10;

    const updateScrollDirection = () => {
      const scrollY = container.scrollTop;
      const difference = scrollY - lastScrollY;

      // Greeting: only visible when at the very top
      if (scrollY <= 10) {
        setShowGreeting(true);
      } else {
        setShowGreeting(false);
      }

      // Detect scroll direction with threshold
      if (Math.abs(difference) > threshold) {
        const newDirection = difference > 0 ? 'down' : 'up';
        setScrollDirection(newDirection);
        lastScrollY = scrollY > 0 ? scrollY : 0;
      }
    };

    container.addEventListener('scroll', updateScrollDirection, { passive: true });
    return () => container.removeEventListener('scroll', updateScrollDirection);
  }, [isLoading, videos.length]);

  // Update progress bar visibility based on scroll direction
  useEffect(() => {
    if (scrollDirection === 'down') {
      setShowProgressBar(false);
    } else if (scrollDirection === 'up') {
      setShowProgressBar(true);
    }
  }, [scrollDirection]);

  // Intersection Observer for detecting active section during scroll
  useEffect(() => {
    if (videos.length === 0) return;

    // Wait for refs to be populated
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        // Skip if we're programmatically scrolling
        if (isScrollingToPhaseRef.current) return;

        // Find the section that occupies most of the visible area
        let bestEntry: IntersectionObserverEntry | null = null;
        let highestRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
            highestRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        });

        // If no entry with good ratio, find the one closest to top
        if (!bestEntry) {
          let topPosition = Infinity;
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const rect = entry.boundingClientRect;
              if (Math.abs(rect.top) < topPosition) {
                topPosition = Math.abs(rect.top);
                bestEntry = entry;
              }
            }
          });
        }

        if (bestEntry) {
          const phaseId = bestEntry.target.getAttribute('data-phase-id');
          if (phaseId && phaseId !== activePhaseId) {
            setActivePhaseId(phaseId);
            centerHorizontalButton(phaseId, true);
          }
        }
      };

      const observer = new IntersectionObserver(observerCallback, {
        root: container,
        rootMargin: '-5% 0px -50% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
      });

      // Observe all phase sections
      phaseSectionsRef.current.forEach((el) => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }, 200);

    return () => clearTimeout(timer);
  }, [videos, activePhaseId, centerHorizontalButton]);

  // Scroll to section when clicking on navigation button
  const scrollToPhase = useCallback((phaseId: string) => {
    const section = phaseSectionsRef.current.get(phaseId);
    const container = scrollContainerRef.current;

    if (section && container) {
      // Mark that we're programmatically scrolling
      isScrollingToPhaseRef.current = true;

      // Update active phase immediately for responsive feel
      setActivePhaseId(phaseId);
      centerHorizontalButton(phaseId, true);

      // Calculate scroll position - leave more space at top so content is visible
      const sectionTop = section.offsetTop;

      container.scrollTo({
        top: sectionTop - 20,
        behavior: 'smooth'
      });

      // Reset flag after scroll completes
      setTimeout(() => {
        isScrollingToPhaseRef.current = false;
      }, 500);
    }
  }, [centerHorizontalButton]);

  // Handle video selection with animation
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    // Small delay to allow state to set before animation starts
    requestAnimationFrame(() => {
      setIsVideoPlayerOpen(true);
    });
  };

  // Handle closing video player with animation
  const handleCloseVideo = () => {
    setIsVideoPlayerClosing(true);
    setIsVideoPlayerOpen(false);
    // Wait for animation to complete before removing video
    setTimeout(() => {
      setSelectedVideo(null);
      setIsVideoPlayerClosing(false);
    }, 400);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1472FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main scrollable container - everything scrolls together */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Greeting - Animated visibility based on scroll position */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showGreeting ? 'max-h-32 opacity-100 pt-6' : 'max-h-0 opacity-0 pt-0'
          }`}
        >
          <div className="max-w-2xl mx-auto px-4 text-center">
            {userName && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight">
                {greeting.toLowerCase()}, {userName}
              </h1>
            )}
            {project && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                {project}
              </p>
            )}
          </div>
        </div>

        {/* Project + Section Navigation - Sticky at top */}
        {videos.length > 0 && Object.keys(videosByPhase).length > 0 && (
          <div className={`sticky top-0 z-20 bg-white dark:bg-gray-900 transition-all duration-300 ${showGreeting ? 'mt-6' : 'pt-2'}`}>
            {/* Project name - shows when greeting is hidden */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                !showGreeting ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {project && (
                <div className="flex justify-center px-4 pb-2">
                  <p className="text-center text-sm text-[#777777] dark:text-gray-400 line-clamp-3 max-w-md">
                    {project}
                  </p>
                </div>
              )}
            </div>

            <div className="relative">
              {/* Gradient fade on edges */}
              <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-white dark:from-gray-900 to-transparent" />
              <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-white dark:from-gray-900 to-transparent" />
              
              <div
                ref={horizontalScrollRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-12"
                style={{ scrollBehavior: 'smooth' }}
              >
                {Object.entries(videosByPhase).map(([phaseId, phaseData]) => (
                  <button
                    key={phaseId}
                    data-phase-id={phaseId}
                    onClick={() => scrollToPhase(phaseId)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-150 ${
                      activePhaseId === phaseId
                        ? 'bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px]'
                        : 'bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border-2 border-b-4 border-gray-200 dark:border-gray-950 hover:bg-gray-50 dark:hover:bg-gray-700 active:border-b-2 active:mt-[2px]'
                    }`}
                  >
                    {phaseData.phaseName}
                  </button>
                ))}
              </div>
            </div>
            {/* Gradient fade below - positioned absolute to not add space */}
            <div className="absolute left-0 right-0 bottom-0 h-6 bg-gradient-to-b from-white dark:from-gray-900 to-transparent pointer-events-none translate-y-full" />
          </div>
        )}


        {/* Video cards content */}
        <div className="pb-24">
          {videos.length > 0 && (
            <div className="pt-2 pb-6 space-y-6">
            {Object.entries(videosByPhase).map(([phaseId, phaseData], phaseIndex) => (
              <div
                key={phaseId}
                data-phase-id={phaseId}
                ref={(el) => {
                  if (el) phaseSectionsRef.current.set(phaseId, el);
                }}
              >
                {/* Phase Divider and Title: ----- SECTION ----- */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-4 w-[80%] mx-auto">
                    <div className="flex-1 h-[2px] bg-gray-300 dark:bg-gray-700 rounded-full" />
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase whitespace-nowrap">
                      {phaseData.phaseName}
                    </h2>
                    <div className="flex-1 h-[2px] bg-gray-300 dark:bg-gray-700 rounded-full" />
                  </div>
                </div>
                
                {/* Videos in this phase */}
                <div className="w-[400px] mx-auto space-y-4">
                  {phaseData.videos.map((video) => (
                    <LessonItem
                      key={video.id}
                      lessonNumber={video.order + 1}
                      totalLessons={totalCount}
                      duration={formatDuration(video.duration)}
                      category={video.phaseName}
                      title={video.title}
                      isCompleted={video.isCompleted}
                      isCurrent={video.isCurrent}
                      onClick={() => handleVideoSelect(video)}
                    />
                  ))}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar - Fixed at bottom, 80% width of content area between sidebars */}
      {videos.length > 0 && (
        <div
          className={`fixed bottom-0 left-64 z-30 transition-all duration-150 ease-in-out ${
            showProgressBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
          style={{ right: `${chatWidth}px` }}
        >
          {/* Gradient fade above progress bar */}
          <div className="h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
          <div className="bg-white dark:bg-gray-900 pb-4 flex justify-center">
            <div className="w-[80%] relative h-[37px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center border-2 border-b-4 border-gray-200 dark:border-gray-950">
              <div
                className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-500 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                  borderRadius: progressPercentage >= 100 ? '0.75rem' : '0.75rem 0 0 0.75rem'
                }}
              />
              <span className="relative z-10 text-sm font-bold uppercase tracking-wide text-[#4b4b4b] dark:text-white">
                {progressPercentage}% ({completedCount} de {totalCount})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Overlay - Animated, only covers content area between sidebars */}
      {(selectedVideo || isVideoPlayerClosing) && (
        <div
          className={`fixed top-0 bottom-0 flex items-center justify-center transition-all ease-out ${
            isVideoPlayerOpen && !isVideoPlayerClosing
              ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm'
              : 'bg-white/0 dark:bg-gray-900/0'
          }`}
          style={{
            transitionDuration: '400ms',
            left: '256px',
            right: `${chatWidth}px`,
            zIndex: 35,
          }}
        >
          <div
            className={`w-full max-w-4xl mx-auto px-8 transition-all ease-out ${
              isVideoPlayerOpen && !isVideoPlayerClosing
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-8'
            }`}
            style={{
              transitionDuration: '400ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Close Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={handleCloseVideo}
                className="px-5 py-2.5 rounded-2xl font-bold uppercase tracking-wide text-sm bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-white border-2 border-b-4 border-gray-200 dark:border-gray-950 hover:bg-gray-50 dark:hover:bg-gray-700 active:border-b-2 active:mt-[2px] transition-all duration-150 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cerrar
              </button>
            </div>

            {/* Video Info */}
            <div className="mb-4">
              <p className="text-sm text-[#1472FF] font-bold uppercase tracking-wide mb-1">
                {selectedVideo?.phaseName}
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#4b4b4b] dark:text-white">
                {selectedVideo?.title}
              </h1>
              {selectedVideo?.duration && (
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                  Duración: {formatDuration(selectedVideo.duration)}
                </p>
              )}
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-b-4 border-gray-800 dark:border-gray-950">
              {selectedVideo?.videoUrl ? (
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                >
                  Tu navegador no soporta el tag de video.
                </video>
              ) : (
                <div className="text-center text-gray-400 p-8">
                  <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium">Video próximamente disponible</p>
                  <p className="text-sm mt-1 opacity-70">El contenido se está preparando</p>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedVideo?.description && (
              <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-b-4 border-gray-200 dark:border-gray-950">
                <h3 className="font-bold text-[#4b4b4b] dark:text-white mb-2">Descripción</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
