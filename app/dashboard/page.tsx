'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const phaseSectionsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const isScrollingToPhaseRef = useRef(false);
  const supabase = createClient();

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
    console.log('Setting up scroll listener, container:', container);
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
        console.log('Direction change detected:', newDirection);
        setScrollDirection(newDirection);
        lastScrollY = scrollY > 0 ? scrollY : 0;
      }
    };

    container.addEventListener('scroll', updateScrollDirection, { passive: true });
    return () => container.removeEventListener('scroll', updateScrollDirection);
  }, [isLoading, videos.length]);

  // Update progress bar visibility based on scroll direction
  useEffect(() => {
    console.log('scrollDirection changed:', scrollDirection, 'showProgressBar:', showProgressBar);
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

        // Find the most visible section
        let topEntry: IntersectionObserverEntry | null = null;
        let topPosition = Infinity;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            // Find the entry closest to the top of the viewport
            if (rect.top < topPosition && rect.top >= -rect.height / 2) {
              topPosition = rect.top;
              topEntry = entry;
            }
          }
        });

        if (topEntry) {
          const phaseId = topEntry.target.getAttribute('data-phase-id');
          if (phaseId && phaseId !== activePhaseId) {
            setActivePhaseId(phaseId);
            centerHorizontalButton(phaseId, true);
          }
        }
      };

      const observer = new IntersectionObserver(observerCallback, {
        root: container,
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5]
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

      // Calculate scroll position - offset hides divider but shows title
      const sectionTop = section.offsetTop;

      container.scrollTo({
        top: sectionTop - 60,
        behavior: 'smooth'
      });

      // Reset flag after scroll completes
      setTimeout(() => {
        isScrollingToPhaseRef.current = false;
      }, 500);
    }
  }, [centerHorizontalButton]);

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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {/* Greeting - Animated visibility based on scroll position */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showGreeting ? 'max-h-24 opacity-100 pt-6' : 'max-h-0 opacity-0 pt-0'
          }`}
        >
          <div className="max-w-2xl mx-auto px-4">
            {userName && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#4b4b4b] dark:text-white text-center tracking-tight">
                {greeting.toLowerCase()}, {userName}
              </h1>
            )}
          </div>
        </div>

        {/* Section Navigation - Sticky at top */}
        {videos.length > 0 && Object.keys(videosByPhase).length > 0 && (
          <div className={`sticky top-0 z-20 bg-white dark:bg-gray-950 transition-all duration-300 ${showGreeting ? 'mt-6' : 'pt-2'}`}>
            <div className="relative">
              {/* Gradient overlays - left and right edges */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />

              <div
                ref={horizontalScrollRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-16"
                style={{ scrollBehavior: 'smooth' }}
              >
                {Object.entries(videosByPhase).map(([phaseId, phaseData]) => (
                  <button
                    key={phaseId}
                    data-phase-id={phaseId}
                    onClick={() => scrollToPhase(phaseId)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-150 ${
                      activePhaseId === phaseId
                        ? 'bg-[#1472FF] text-white border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1'
                        : 'bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {phaseData.phaseName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom shadow overlay - positioned absolutely below sticky nav */}
        {videos.length > 0 && Object.keys(videosByPhase).length > 0 && (
          <div className="sticky top-[52px] z-10 h-8 -mb-8 bg-gradient-to-b from-white dark:from-gray-950 via-white/80 dark:via-gray-950/80 to-transparent pointer-events-none" />
        )}

        {/* Video cards content */}
        <div className="px-4 pb-24">
          {videos.length > 0 && (
            <div className="w-[400px] mx-auto py-6 space-y-6">
            {Object.entries(videosByPhase).map(([phaseId, phaseData], phaseIndex) => (
              <div
                key={phaseId}
                data-phase-id={phaseId}
                ref={(el) => {
                  if (el) phaseSectionsRef.current.set(phaseId, el);
                }}
              >
                {/* Phase Divider and Title */}
                {phaseIndex > 0 ? (
                  <div className="mb-6">
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4" />
                    <h2 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight lowercase">
                      {phaseData.phaseName}
                    </h2>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h2 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight lowercase">
                      {phaseData.phaseName}
                    </h2>
                  </div>
                )}
                
                {/* Videos in this phase */}
                <div className="space-y-4">
                  {phaseData.videos.map((video, index) => (
                    <div
                      key={video.id}
                      onClick={() => {
                        router.push(`/dashboard/salon?video=${video.order}`);
                      }}
                      className={`w-[400px] h-[140px] rounded-2xl overflow-hidden transition-all duration-150 cursor-pointer flex border-2 ${
                        video.isCurrent
                          ? 'border-[#1472FF]'
                          : video.isCompleted
                          ? 'border-green-400'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Video Thumbnail Placeholder */}
                      <div className="w-[200px] h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative flex-shrink-0">
                        {video.isCompleted ? (
                          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : video.isCurrent ? (
                          <svg className="w-12 h-12 text-[#1472FF]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                        
                        {/* Duration badge - Top right */}
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          {formatDuration(video.duration)}
                        </span>

                        {/* Progress badge - Top left */}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-bold bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          {video.order + 1} de {totalCount}
                        </span>
                      </div>
                      
                      {/* Video Info - Colored based on status */}
                      <div className={`w-[200px] h-full p-4 flex flex-col relative flex-shrink-0 ${
                        video.isCurrent
                          ? 'bg-[#1472FF]'
                          : video.isCompleted
                          ? 'bg-green-500'
                          : 'bg-white dark:bg-gray-900'
                      }`}>
                        {/* 3D bottom shadow for active cards */}
                        {video.isCurrent && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0E5FCC]" />
                        )}
                        {video.isCompleted && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600" />
                        )}
                        
                        {/* Status badge */}
                        <span className={`inline-block self-start px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide mb-2 ${
                          video.isCurrent
                            ? 'bg-white/20 text-white'
                            : video.isCompleted
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          {video.isCompleted ? 'Completado' : video.isCurrent ? 'Continuar' : 'Pendiente'}
                        </span>
                        
                        <p className={`text-xs mb-1 ${
                          video.isCurrent || video.isCompleted
                            ? 'text-white/80'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>{video.phaseName}</p>
                        <h3 className={`font-bold line-clamp-2 leading-snug ${
                          video.isCurrent || video.isCompleted
                            ? 'text-white'
                            : 'text-[#4b4b4b] dark:text-white'
                        }`}>
                          {video.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar - Fixed at bottom, 85% width of content area between sidebars */}
      {videos.length > 0 && (
        <div
          className={`fixed bottom-0 left-64 right-64 z-30 transition-all duration-300 ease-in-out ${
            showProgressBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          {/* Gradient fade at top of progress bar area */}
          <div className="h-8 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none" />
          <div className="bg-white dark:bg-gray-950 pb-4 flex justify-center">
            <div className="w-[80%] relative h-[37px] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center border-b-4 border-gray-300 dark:border-gray-600">
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
    </div>
  );
}
