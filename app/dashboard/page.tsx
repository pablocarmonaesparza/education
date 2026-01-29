'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LessonItem from '@/components/dashboard/LessonItem';
import IconButton from '@/components/shared/IconButton';
import Button from '@/components/shared/Button';
import CompositeCard from '@/components/shared/CompositeCard';
import HorizontalScroll from '@/components/shared/HorizontalScroll';
import VerticalScroll from '@/components/shared/VerticalScroll';

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
  const [projectSummary, setProjectSummary] = useState<string>('');
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
  const [isMobile, setIsMobile] = useState(false);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
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
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const h = () => setIsMobile(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
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
        
        // Get project idea and AI-generated summary (2 lines, from OpenAI after onboarding)
        const projectIdea = 
          intakeData?.responses?.project_idea ||
          intakeData?.responses?.project ||
          intakeData?.responses?.idea ||
          '';
        const summary = intakeData?.responses?.project_summary || '';
        
        if (projectIdea) setProject(projectIdea);
        if (summary) setProjectSummary(summary);

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

  // Scroll-based detection for active section
  useEffect(() => {
    if (videos.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Skip if we're programmatically scrolling
      if (isScrollingToPhaseRef.current) return;

      const containerRect = container.getBoundingClientRect();
      const referencePoint = containerRect.top + 150; // 150px from top of container

      let closestSection: string | null = null;
      let closestDistance = Infinity;

      // Find the section whose top is closest to (but above) the reference point
      phaseSectionsRef.current.forEach((el, phaseId) => {
        const rect = el.getBoundingClientRect();
        const sectionTop = rect.top;
        
        // Section is "active" when its top has passed the reference point
        // but the section is still visible (not completely scrolled past)
        if (sectionTop <= referencePoint && rect.bottom > containerRect.top) {
          const distance = referencePoint - sectionTop;
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = phaseId;
          }
        }
      });

      // If no section found (at very top), use first section
      if (!closestSection && phaseSectionsRef.current.size > 0) {
        closestSection = Array.from(phaseSectionsRef.current.keys())[0];
      }

      if (closestSection && closestSection !== activePhaseId) {
        setActivePhaseId(closestSection);
        centerHorizontalButton(closestSection, true);
      }
    };

    // Debounce scroll handler
    let rafId: number;
    const debouncedScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    container.addEventListener('scroll', debouncedScroll, { passive: true });
    
    // Initial check
    setTimeout(handleScroll, 100);

    return () => {
      container.removeEventListener('scroll', debouncedScroll);
      cancelAnimationFrame(rafId);
    };
  }, [videos, activePhaseId, centerHorizontalButton]);

  // Auto-scroll to current video after 2 seconds on initial load
  useEffect(() => {
    if (videos.length === 0 || isLoading) return;

    const timer = setTimeout(() => {
      const currentVideo = videos.find(v => v.isCurrent);
      if (!currentVideo) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      // Find the video item element (wrapper div)
      const videoElement = container.querySelector(`[data-video-id="${currentVideo.id}"]`) as HTMLElement;
      if (!videoElement) return;

      // Mark that we're programmatically scrolling
      isScrollingToPhaseRef.current = true;

      // Update active phase
      setActivePhaseId(currentVideo.phaseId);
      centerHorizontalButton(currentVideo.phaseId, true);

      // Smooth scroll to center the video item in the viewport
      const containerRect = container.getBoundingClientRect();
      const elementRect = videoElement.getBoundingClientRect();
      const startScrollTop = container.scrollTop;
      
      // Calculate center position: element top - (viewport height / 2) + (element height / 2)
      const viewportHeight = containerRect.height;
      const elementHeight = elementRect.height;
      const targetTop = Math.max(0, startScrollTop + elementRect.top - containerRect.top - (viewportHeight / 2) + (elementHeight / 2));

      // Smooth scroll animation with easing
      const duration = 800; // 800ms for smoother animation
      const startTime = performance.now();
      
      const easeInOutCubic = (t: number) => t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        
        container.scrollTop = startScrollTop + (targetTop - startScrollTop) * easedProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          isScrollingToPhaseRef.current = false;
        }
      };
      
      requestAnimationFrame(animateScroll);

      // Expand the video automatically
      setExpandedVideoId(String(currentVideo.id));

      // Reset the flag after scroll completes
      setTimeout(() => {
        isScrollingToPhaseRef.current = false;
      }, 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [videos, isLoading, centerHorizontalButton]);

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

      // Calculate scroll position - leave space to see divider title
      const sectionTop = section.offsetTop;

      container.scrollTo({
        top: sectionTop - 120,
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
      <VerticalScroll ref={scrollContainerRef} flex1>
        {/* Greeting - Animated visibility based on scroll position */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showGreeting ? 'max-h-[240px] opacity-100 pt-6 pb-0' : 'max-h-0 opacity-0 pt-0 pb-0'
          }`}
        >
          <div className="max-w-2xl mx-auto px-4 text-center">
            {userName && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight">
                {greeting.toLowerCase()}, {userName}
              </h1>
            )}
            {project && (
              <div className="flex justify-center px-2 sm:px-4 mt-4 mb-2">
                <CompositeCard
                  className="w-[95%] sm:w-[80%] max-w-4xl"
                  contentClassName="pointer-events-none"
                  leading={
                    <button
                      disabled
                      className="w-8 h-8 flex items-center justify-center rounded-xl border-2 border-b-4 border-gray-200 dark:border-gray-950 bg-gray-100 dark:bg-gray-700 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 active:border-b-2 active:mt-[2px] transition-all duration-150"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  }
                  trailing={
                    <IconButton
                      aria-label="Añadir o ver proyecto"
                      onClick={() => setShowCreateCourseModal(true)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </IconButton>
                  }
                >
                  <p className="text-center text-xs sm:text-sm text-[#777777] dark:text-gray-400 line-clamp-2 break-words hyphens-auto leading-relaxed">
                    {projectSummary || project}
                  </p>
                  <div className="flex justify-center gap-1.5 mt-1.5 sm:mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1472FF]" />
                  </div>
                </CompositeCard>
              </div>
            )}
          </div>
        </div>

        {/* Project + Section Navigation - Sticky at top */}
        {videos.length > 0 && Object.keys(videosByPhase).length > 0 && (
          <div className={`sticky top-0 z-20 bg-white dark:bg-gray-900 transition-all duration-300 ${showGreeting ? 'mt-2' : 'pt-2'}`}>
            {/* Project name - shows when greeting is hidden */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                !showGreeting ? 'max-h-[140px] opacity-100 py-2' : 'max-h-0 opacity-0 py-0'
              }`}
            >
              {project && (
                <div className="flex justify-center px-2 sm:px-4">
                  <CompositeCard
                    className="w-[95%] sm:w-[80%] max-w-4xl"
                    contentClassName="pointer-events-none"
                    leading={
                      <button
                        disabled
                        className="w-8 h-8 flex items-center justify-center rounded-xl border-2 border-b-4 border-gray-200 dark:border-gray-950 bg-gray-100 dark:bg-gray-700 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 active:border-b-2 active:mt-[2px] transition-all duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    }
                    trailing={
                      <IconButton
                        aria-label="Añadir o ver proyecto"
                        onClick={() => setShowCreateCourseModal(true)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </IconButton>
                    }
                  >
                    <p className="text-center text-xs sm:text-sm text-[#777777] dark:text-gray-400 line-clamp-2 break-words hyphens-auto leading-relaxed">
                      {projectSummary || project}
                    </p>
                    <div className="flex justify-center gap-1.5 mt-1.5 sm:mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1472FF]" />
                    </div>
                  </CompositeCard>
                </div>
              )}
            </div>

            <HorizontalScroll ref={horizontalScrollRef} fadeEdges>
              {Object.entries(videosByPhase).map(([phaseId, phaseData]) => (
                <button
                  key={phaseId}
                  data-phase-id={phaseId}
                  onClick={() => scrollToPhase(phaseId)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-150 whitespace-nowrap ${
                    activePhaseId === phaseId
                      ? 'bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] active:border-b-2 active:mt-[2px]'
                      : 'bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border-2 border-b-4 border-gray-200 dark:border-gray-950 hover:bg-gray-50 dark:hover:bg-gray-700 active:border-b-2 active:mt-[2px]'
                  }`}
                >
                  {phaseData.phaseName}
                </button>
              ))}
            </HorizontalScroll>
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
                {/* Phase Divider and Title: ----- SECTION ----- (sin caja alrededor) */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-center gap-2 sm:gap-4 w-[95%] sm:w-[80%] mx-auto">
                    <div className="flex-1 h-[2px] bg-gray-300 dark:bg-gray-600 rounded-full" />
                    <h2 className="text-xs sm:text-sm font-bold text-gray-500 dark:text-white tracking-wider uppercase whitespace-nowrap">
                      {phaseData.phaseName}
                    </h2>
                    <div className="flex-1 h-[2px] bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </div>
                </div>
                
                {/* Videos in this phase */}
                <div className="w-full max-w-[220px] mx-auto px-2 sm:px-0 space-y-4">
                  {phaseData.videos.map((video) => (
                    <div key={video.id} data-video-id={video.id}>
                      <LessonItem
                        lessonNumber={video.order + 1}
                        totalLessons={totalCount}
                        duration={formatDuration(video.duration)}
                        category={video.phaseName}
                        title={video.title}
                        description={video.description}
                        isCompleted={video.isCompleted}
                        isCurrent={video.isCurrent}
                        isExpanded={expandedVideoId === String(video.id)}
                        onToggleExpand={() => setExpandedVideoId(expandedVideoId === String(video.id) ? null : String(video.id))}
                        onClick={() => handleVideoSelect(video)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </VerticalScroll>

      {/* Progress Bar - Fixed at bottom, 80% width of content area between sidebars */}
      {videos.length > 0 && (
        <div
          className={`fixed bottom-0 left-0 md:left-64 z-30 transition-all duration-150 ease-in-out ${
            showProgressBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
          style={{ right: isMobile ? 0 : `${chatWidth}px` }}
        >
          {/* Gradient fade above progress bar */}
          <div className="h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
          <div className="bg-white dark:bg-gray-900 pb-4 flex justify-center">
            <div className="w-[90%] sm:w-[80%] max-w-2xl relative h-[37px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center border-2 border-gray-200 dark:border-gray-950 border-b-4 border-b-gray-300 dark:border-b-gray-950">
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
          className={`fixed top-0 md:top-0 bottom-0 flex items-center justify-center transition-all ease-out pt-14 md:pt-0 ${
            isVideoPlayerOpen && !isVideoPlayerClosing
              ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm'
              : 'bg-white/0 dark:bg-gray-900/0'
          }`}
          style={{
            transitionDuration: '400ms',
            left: isMobile ? 0 : 256,
            right: isMobile ? 0 : `${chatWidth}px`,
            zIndex: 35,
          }}
        >
          <div
            className={`w-full max-w-4xl mx-auto px-4 sm:px-8 overflow-y-auto max-h-full transition-all ease-out ${
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

      {/* Modal: Crear nuevo curso — sistema */}
      {showCreateCourseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowCreateCourseModal(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[90dvh] my-auto rounded-2xl border-2 border-b-4 border-gray-200 dark:border-gray-950 border-b-gray-300 dark:border-b-gray-950 bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — estilo proyecto, sin línea ni subtítulo */}
            <div className="relative px-4 sm:px-6 py-4">
              <button
                onClick={() => setShowCreateCourseModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl border-2 border-b-4 border-gray-200 dark:border-gray-950 bg-gray-100 dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:border-b-2 active:mt-[2px] transition-all"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-extrabold uppercase tracking-tight leading-tight text-[#4b4b4b] dark:text-white pr-10">
                Curso personalizado para tu proyecto
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-[#4b4b4b] dark:text-gray-300 text-base leading-relaxed mb-5">
                Cuéntanos tu idea y te generamos un curso único: módulos, vídeos y ejercicios pensados para ti. Ideal para automatizar con IA, chatbots o lo que tengas en mente.
              </p>

              <ul className="space-y-3 mb-6">
                {[
                  'Videos y módulos generados con IA según tu objetivo',
                  'Ruta de aprendizaje solo para ti',
                  'Acceso inmediato y para siempre',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#4b4b4b] dark:text-gray-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#4b4b4b] dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center rounded-2xl"
                  onClick={() => {
                    setShowCreateCourseModal(false);
                    router.push('/intake');
                  }}
                >
                  Crear mi curso
                </Button>
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="text-sm text-[#777777] dark:text-gray-400 hover:text-[#4b4b4b] dark:hover:text-gray-300 transition-colors"
                >
                  Ahora no, gracias
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
