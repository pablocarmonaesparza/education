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
  const [isAtTop, setIsAtTop] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const phaseRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastScrollTopRef = useRef(0);
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
  const centerButton = useCallback((phaseId: string, smooth: boolean = true) => {
    if (!horizontalScrollRef.current) return;

    const button = horizontalScrollRef.current.querySelector(
      `button[data-phase-id="${phaseId}"]`
    ) as HTMLElement;

    if (button) {
      const container = horizontalScrollRef.current;
      const containerWidth = container.offsetWidth;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, []);

  // Center initial phase button on load
  useEffect(() => {
    if (activePhaseId && horizontalScrollRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        centerButton(activePhaseId, false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [videos.length, activePhaseId, centerButton]);

  // Handle scroll direction to show/hide progress bar and greeting
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const scrollDelta = currentScrollTop - lastScrollTopRef.current;

      // Progress bar: hide on scroll down, show on scroll up (like X/Twitter nav)
      if (scrollDelta > 2) {
        // Scrolling down - hide progress bar
        setShowProgressBar(false);
      } else if (scrollDelta < -2) {
        // Scrolling up - show progress bar
        setShowProgressBar(true);
      }

      // Check if at very top (within 5px tolerance)
      const atTop = currentScrollTop <= 5;
      setIsAtTop(atTop);

      // Greeting: only show when at the very top
      if (atTop) {
        setShowGreeting(true);
      } else {
        setShowGreeting(false);
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer to detect active section
  useEffect(() => {
    if (videos.length === 0 || !scrollContainerRef.current) return;

    const observerOptions = {
      root: scrollContainerRef.current,
      rootMargin: '-20% 0px -60% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    const observer = new IntersectionObserver((entries) => {
      // Find the entry that is most visible in the viewport
      let bestEntry: IntersectionObserverEntry | null = null;
      let bestScore = -1;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Score based on intersection ratio and position
          const rect = entry.boundingClientRect;
          const containerRect = scrollContainerRef.current?.getBoundingClientRect();
          if (containerRect) {
            // Prefer elements closer to the top of the visible area
            const distanceFromTop = Math.abs(rect.top - containerRect.top - 100);
            const score = entry.intersectionRatio * 1000 - distanceFromTop;
            if (score > bestScore) {
              bestScore = score;
              bestEntry = entry;
            }
          }
        }
      });

      if (bestEntry) {
        const phaseId = (bestEntry as IntersectionObserverEntry).target.getAttribute('data-phase-id');
        if (phaseId && phaseId !== activePhaseId) {
          setActivePhaseId(phaseId);
          // Center the button smoothly
          centerButton(phaseId, true);
        }
      }
    }, observerOptions);

    // Observe all phase sections using refs
    phaseRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [videos, activePhaseId, centerButton]);


  // Scroll to section when clicking on navigation
  const scrollToPhase = (phaseId: string) => {
    const element = document.querySelector(`[data-phase-id="${phaseId}"]`);
    if (element && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elementTop = (element as HTMLElement).offsetTop;
      const containerTop = container.scrollTop;
      const offset = 20; // Small offset from top
      
      container.scrollTo({
        top: containerTop + elementTop - offset,
        behavior: 'smooth'
      });
    }
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
    <div className="h-screen flex flex-col">
      {/* Top Section - Fixed padding from top */}
      <div className="flex-shrink-0">
        {/* Greeting - Animated visibility */}
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

        {/* Section Navigation - Horizontal Scroll (Full Width from sidebar to sidebar) */}
        {videos.length > 0 && Object.keys(videosByPhase).length > 0 && (
          <div className={`relative transition-all duration-300 ${showGreeting ? 'mt-6' : 'pt-4'}`}>
            {/* Gradient overlays - extend to edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />

            <div
              ref={horizontalScrollRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              {/* Left spacer for centering first item */}
              <div className="flex-shrink-0 w-[calc(50vw-256px-100px)]" />

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

              {/* Right spacer for centering last item */}
              <div className="flex-shrink-0 w-[calc(50vw-256px-100px)]" />
            </div>
          </div>
        )}
      </div>

      {/* Middle Section - Vertical scrollable carousel */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0 px-4 relative pb-16">

        {videos.length > 0 && (
          <div className="w-[400px] mx-auto py-6 space-y-6">
            {Object.entries(videosByPhase).map(([phaseId, phaseData], phaseIndex) => (
              <div
                key={phaseId}
                data-phase-id={phaseId}
                ref={(el) => {
                  if (el) phaseRefs.current.set(phaseId, el);
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

      {/* Progress Bar - Fixed at bottom, overlays scroll view */}
      {videos.length > 0 && (
        <div
          className={`fixed bottom-0 left-64 right-64 z-30 transition-all duration-300 ease-in-out ${
            showProgressBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          {/* Gradient fade at top of progress bar area */}
          <div className="h-6 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none" />
          <div className="bg-white dark:bg-gray-950 px-4 pb-4">
            <div className="max-w-[400px] mx-auto">
              <div className="relative h-[37px] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center border-b-4 border-gray-300 dark:border-gray-600">
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
        </div>
      )}
    </div>
  );
}
