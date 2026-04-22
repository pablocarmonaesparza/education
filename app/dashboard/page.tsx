'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LessonItem from '@/components/dashboard/LessonItem';
import PathConnector from '@/components/dashboard/PathConnector';
import IconButton from '@/components/ui/IconButton';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Card, { CardFlat } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Headline, Body, Caption } from '@/components/ui/Typography';
import Divider from '@/components/ui/Divider';
import CompositeCard from '@/components/shared/CompositeCard';
import { depth } from '@/lib/design-tokens';
import HorizontalScroll from '@/components/shared/HorizontalScroll';
import VerticalScroll from '@/components/shared/VerticalScroll';
import ExperimentLesson from '@/components/experiment/ExperimentLesson';
import type { Step, LessonCompletionResult } from '@/components/experiment/ExperimentLesson';
import {
  fetchPublishedLectures,
  fetchLectureAsSteps,
  type LectureRow,
} from '@/lib/lessons/fromSupabase';
import { getUserStats, type UserStats } from '@/lib/gamification';
import { useSidebar } from '@/contexts/SidebarContext';

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
  lectureId?: number;
  title: string;
  description: string;
  duration: number | null;
  order: number;
  phaseId: string;
  phaseName: string;
  phaseOrder: number;
  isCompleted: boolean;
  isCurrent: boolean;
  videoUrl?: string;
}

type IntakeRow = {
  responses: any;
  generated_path: any;
  created_at?: string;
};

type RouteMode = 'full' | 'personalized';

/**
 * Turn an intake_responses.generated_path into a flat Video[] with isCompleted
 * and isCurrent computed against the user's completedVideos set.
 *
 * Extracted from the dashboard so the same logic drives both the initial
 * fetch and the route-switching derive effect. Pure; no React calls.
 *
 * Videos are keyed with a `${mode}:` prefix so the full and personalized
 * routes keep independent progress in video_progress even when ordinals
 * (order=1, 2, ...) collide between the two generated paths.
 */
function buildVideosFromIntake(
  path: any,
  completedVideos: Set<string>,
  mode: RouteMode,
): Video[] {
  if (!path) return [];
  const allVideos: Video[] = [];
  let videoOrder = 0;
  let foundCurrent = false;
  const phases = path.phases || path.course?.phases || path.modules || path.sections || [];

  phases.forEach((phase: any, phaseIndex: number) => {
    const phaseVideos = phase.videos || phase.content || phase.lessons || [];
    const phaseName = phase.phase_name || phase.title || phase.name || `Fase ${phaseIndex + 1}`;
    const phaseId = phase.phase_number || phase.id || `phase-${phaseIndex}`;

    phaseVideos.forEach((video: any) => {
      const rawId = video.order?.toString() || video.id || `video-${videoOrder}`;
      const videoId = `${mode}:${rawId}`;
      const isCompleted = completedVideos.has(videoId);
      const isCurrent = !isCompleted && !foundCurrent;
      if (isCurrent) foundCurrent = true;

      const videoTitle = video.description || video.title || video.name || `Video ${videoOrder + 1}`;
      const videoDescription = video.why_relevant || video.summary || '';

      let durationSeconds: number | null = null;
      if (video.duration) {
        if (typeof video.duration === 'string' && video.duration.includes(':')) {
          const [mins, secs] = video.duration.split(':').map(Number);
          durationSeconds = mins * 60 + (secs || 0);
        } else if (typeof video.duration === 'number') {
          durationSeconds = video.duration;
        } else {
          durationSeconds = parseInt(video.duration) || null;
        }
      }

      const rawLectureId = video.lecture_id ?? video.id;
      const parsedLectureId =
        rawLectureId !== undefined && rawLectureId !== null ? Number(rawLectureId) : undefined;
      const lectureId = Number.isFinite(parsedLectureId) ? parsedLectureId : undefined;

      allVideos.push({
        id: videoId,
        lectureId,
        title: videoTitle,
        description: videoDescription,
        duration: durationSeconds,
        order: videoOrder,
        phaseId: phaseId.toString(),
        phaseName,
        // Intake-based videos don't have a separate phaseOrder; use phaseIndex
        // to preserve the order supplied by the generated_path.
        phaseOrder: phaseIndex,
        isCompleted,
        isCurrent,
        videoUrl: video.video_url || video.url || undefined,
      });
      videoOrder++;
    });
  });

  return allVideos;
}

/**
 * Build the rendered Video[] from the Supabase `lectures` table rows.
 * This replaces the old buildVideosFromIntake for the MVP — the curriculum
 * source of truth is now `lectures`, not intake_responses.generated_path.
 *
 * The Video.id is the lecture's UUID (string), which is also what we use
 * as video_id in video_progress, so progress tracking stays consistent.
 */
function buildVideosFromLectures(
  lectures: LectureRow[],
  completedVideos: Set<string>,
): Video[] {
  const result: Video[] = [];
  let foundCurrent = false;
  lectures.forEach((lec, idx) => {
    const isCompleted = completedVideos.has(lec.id);
    const isCurrent = !isCompleted && !foundCurrent;
    if (isCurrent) foundCurrent = true;
    result.push({
      id: lec.id,
      lectureId: undefined, // UUID-based now, not numeric
      title: lec.title,
      description: lec.narrative_arc ?? '',
      duration: lec.estimated_minutes * 60,
      order: idx,
      phaseId: lec.section_id.toString(),
      phaseName: lec.section_name,
      phaseOrder: lec.section_display_order,
      isCompleted,
      isCurrent,
    });
  });
  return result;
}

function DashboardPageContent() {
  const router = useRouter();
  const { setLessonNav } = useSidebar();
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
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  // Multi-route state: user may have a full-course intake and/or a
  // personalized intake. activeMode decides which one is rendered.
  const [activeMode, setActiveMode] = useState<RouteMode>('full');
  const [fullIntake, setFullIntake] = useState<IntakeRow | null>(null);
  const [personalizedIntake, setPersonalizedIntake] = useState<IntakeRow | null>(null);
  const [completedVideoIdSet, setCompletedVideoIdSet] = useState<Set<string>>(new Set());
  const [publishedLectures, setPublishedLectures] = useState<LectureRow[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<Step[] | null>(null);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
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

        // Fetch ALL intake_responses (newest first) so we can separate the
        // user's full-course intake from their personalized one and let the
        // chevrons navigate between the two.
        const { data: intakesRaw } = await supabase
          .from('intake_responses')
          .select('responses, generated_path, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const intakes: IntakeRow[] = (intakesRaw || []) as IntakeRow[];
        const full = intakes.find((i) => i.responses?.mode === 'full') ?? null;
        const personalized = intakes.find((i) => i.responses?.mode !== 'full') ?? null;
        setFullIntake(full);
        setPersonalizedIntake(personalized);

        // Initial active mode: the most recent intake wins. If only one exists,
        // pick whichever side has data.
        const latest = intakes[0];
        const initialMode: RouteMode =
          latest && latest.responses?.mode !== 'full'
            ? 'personalized'
            : full
              ? 'full'
              : personalized
                ? 'personalized'
                : 'full';
        setActiveMode(initialMode);

        // Fetch the published curriculum from `lectures` table — the source
        // of truth for what the dashboard renders. Intake_responses only
        // feeds the top CompositeCard copy (mode/summary).
        const lectures = await fetchPublishedLectures();
        setPublishedLectures(lectures);

        // Load progress regardless of which route is active. The derive
        // effect below reads publishedLectures and completedVideoIdSet
        // and populates `videos`.
        if (full || personalized || lectures.length > 0) {
          // Fetch lesson progress from `user_progress` (post-schema-v1 table).
          // The column is `is_completed` (not `completed`) and the FK is
          // `lecture_id` (not `video_id`). The dashboard keys videos by the
          // lecture's UUID, so the Set is built directly from `lecture_id`.
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('lecture_id, is_completed')
            .eq('user_id', user.id);

          if (progressError) {
            console.warn('[dashboard] failed to fetch user_progress', progressError);
          }

          // Fetch gamification stats (XP, level, streak) desde user_stats.
          // El trigger `on_user_progress_complete` la mantiene al día
          // cuando se escribe is_completed=true.
          setUserStats(await getUserStats(supabase, user.id));

          const completedVideos = new Set<string>(
            (progressData || [])
              .filter((p: any) => p.is_completed)
              .map((p: any) => p.lecture_id)
          );
          setCompletedVideoIdSet(completedVideos);
        }
      }
      setIsLoading(false);
    }

    fetchUserData();
  }, [supabase]);

  // Re-derive the rendered videos from the Supabase `lectures` table
  // whenever the published lectures or the completion set change.
  // Project/summary copy still comes from intake_responses for the
  // CompositeCard header (route switcher).
  useEffect(() => {
    setVideos(buildVideosFromLectures(publishedLectures, completedVideoIdSet));
  }, [publishedLectures, completedVideoIdSet]);

  useEffect(() => {
    const intake = activeMode === 'full' ? fullIntake : personalizedIntake;
    setProject(
      intake?.responses?.project_idea ||
        intake?.responses?.project ||
        intake?.responses?.idea ||
        '',
    );
    setProjectSummary(intake?.responses?.project_summary || '');
  }, [activeMode, fullIntake, personalizedIntake]);

  // Fetch slides from Supabase when the user opens a lesson.
  useEffect(() => {
    if (!selectedVideo) {
      setSelectedSteps(null);
      return;
    }
    let cancelled = false;
    setIsLoadingSteps(true);
    (async () => {
      const steps = await fetchLectureAsSteps(selectedVideo.id);
      if (!cancelled) {
        setSelectedSteps(steps.length > 0 ? steps : null);
        setIsLoadingSteps(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedVideo]);

  // Group videos by phase. Using a plain object here is fine for lookup by
  // phaseId, but `Object.entries` on it would re-sort numeric-string keys
  // (so section_id 11 would always land after 10). We track phaseOrder per
  // phase and expose an `orderedPhaseEntries` sorted by that value so the
  // UI respects the curriculum's `section.display_order`.
  // Memoized so its identity is stable across renders. Without useMemo this
  // object is a new reference on every render, which turned the initial-phase
  // useEffect (deps include videosByPhase) into an infinite loop.
  const videosByPhase = useMemo(
    () =>
      videos.reduce((acc, video) => {
        if (!acc[video.phaseId]) {
          acc[video.phaseId] = {
            phaseName: video.phaseName,
            phaseOrder: video.phaseOrder,
            videos: [],
          };
        }
        acc[video.phaseId].videos.push(video);
        return acc;
      }, {} as Record<string, { phaseName: string; phaseOrder: number; videos: Video[] }>),
    [videos],
  );

  const orderedPhaseEntries = useMemo(
    () =>
      Object.entries(videosByPhase).sort(
        ([, a], [, b]) => a.phaseOrder - b.phaseOrder,
      ),
    [videosByPhase],
  );

  const completedCount = videos.filter(v => v.isCompleted).length;
  const totalCount = videos.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Set initial active phase and center it. We only need to react to `videos`
  // — videosByPhase is derived from videos, so depending on both re-runs the
  // effect every time we recompute the derived map.
  useEffect(() => {
    if (videos.length > 0 && Object.keys(videosByPhase).length > 0 && !activePhaseId) {
      // Find the current video's phase (the one the user is on)
      const currentVideo = videos.find(v => v.isCurrent);
      const initialPhaseId = currentVideo ? currentVideo.phaseId : orderedPhaseEntries[0]?.[0];
      setActivePhaseId(initialPhaseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos, activePhaseId]);

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

      // Greeting: hysteresis so collapsing the greeting (240px layout shift)
      // can't bounce scrollTop back under the threshold and re-trigger. Show
      // only near the very top; hide once we're clearly past it.
      setShowGreeting((prev) => {
        if (prev && scrollY > 80) return false;
        if (!prev && scrollY < 4) return true;
        return prev;
      });

      // Detect scroll direction with threshold. Skip while a programmatic
      // scroll is in flight (auto-scroll to current lesson, tab clicks, etc.)
      // so the progress bar doesn't hide on a scroll the user didn't make.
      if (Math.abs(difference) > threshold) {
        if (!isScrollingToPhaseRef.current) {
          const newDirection = difference > 0 ? 'down' : 'up';
          setScrollDirection(newDirection);
        }
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

      // Programmatic scroll shouldn't hide the progress bar — if the user was
      // previously scrolled in a direction that hid it, force it back on when
      // we auto-advance to the next lesson.
      setShowProgressBar(true);
      setScrollDirection('up');

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

      // Reset the flag after scroll completes
      setTimeout(() => {
        isScrollingToPhaseRef.current = false;
      }, 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [videos, isLoading, centerHorizontalButton]);

  // Scroll to section when clicking on navigation button.
  //
  // Why a manual rAF animation instead of `scrollTo({behavior: 'smooth'})`:
  // the browser's smooth scroll has variable duration (200–1000ms depending
  // on distance), and we have no way to know when it ends. Previously we
  // dropped `isScrollingToPhaseRef` after a fixed 500ms timeout, which often
  // fired mid-animation — the scroll observer then ran, picked the section
  // halfway through the viewport (usually the previous one), and bounced
  // `activePhaseId` back. Driving the scroll ourselves lets us flip the flag
  // deterministically when the animation actually completes, matching the
  // pattern used by the auto-scroll-to-current-video effect above.
  const scrollToPhase = useCallback((phaseId: string) => {
    const section = phaseSectionsRef.current.get(phaseId);
    const container = scrollContainerRef.current;
    if (!section || !container) return;

    // Mark that we're programmatically scrolling — prevents the scroll
    // observer from competing for `activePhaseId` while we animate.
    isScrollingToPhaseRef.current = true;

    // Update active phase immediately for responsive feel.
    setActivePhaseId(phaseId);
    centerHorizontalButton(phaseId, true);

    // Collapse the greeting first. Its 240px max-height transition runs for
    // ~300ms and moves every phase section upward by that amount — if we
    // measure before it settles, we land 240px too low and the previous
    // section peeks in. Wait past the transition before measuring.
    setShowGreeting(false);

    window.setTimeout(() => {
      const sectionRect = section.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const sectionTopFromScrollTop =
        container.scrollTop + (sectionRect.top - containerRect.top);
      const stickyHeader = container.querySelector<HTMLElement>('.sticky');
      const stickyHeight = stickyHeader?.offsetHeight ?? 160;
      const gradientBuffer = 16;

      const startScrollTop = container.scrollTop;
      const targetTop = Math.max(
        0,
        sectionTopFromScrollTop - stickyHeight - gradientBuffer,
      );

      // Same easing + duration pattern as the auto-scroll-to-current-video
      // animation, so both flows feel identical.
      const duration = 600;
      const startTime = performance.now();
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        container.scrollTop = startScrollTop + (targetTop - startScrollTop) * eased;

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          // Drop the flag only when the animation has fully landed. The
          // observer's next tick will then see the actual final viewport
          // and confirm `phaseId` instead of bouncing back.
          isScrollingToPhaseRef.current = false;
        }
      };

      requestAnimationFrame(animateScroll);
    }, 320);
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

  // Swap the left sidebar for a lesson nav while a lesson is open. The nav
  // lists every lesson in the current phase so the user can jump between
  // them without closing the overlay.
  useEffect(() => {
    if (!selectedVideo) {
      setLessonNav(null);
      return;
    }
    const phase = videosByPhase[selectedVideo.phaseId];
    if (!phase) return;
    setLessonNav({
      phaseName: phase.phaseName,
      activeLessonId: selectedVideo.id,
      lessons: phase.videos.map((v, idx) => ({
        id: v.id,
        title: v.title,
        order: idx + 1,
        isCompleted: v.isCompleted,
        isCurrent: v.isCurrent,
      })),
      onSelectLesson: (id) => {
        const next = phase.videos.find((v) => v.id === id);
        if (next) setSelectedVideo(next);
      },
    });
  }, [selectedVideo, videosByPhase, setLessonNav]);

  // Always clear the lesson nav on unmount so navigating away from the
  // dashboard doesn't leave a stale sidebar state behind.
  useEffect(() => () => setLessonNav(null), [setLessonNav]);

  // Mark the selected lesson as completed: persist to Supabase FIRST, then
  // recompute local state so the UI only advances when the DB actually wrote.
  const handleLessonComplete = async (video: Video, _result?: LessonCompletionResult) => {
    // El parámetro `_result` viene de ExperimentLesson con { xpGained,
    // correctCombo }. No lo usamos para persistir XP — la fuente de verdad
    // es `award_lecture_xp` que corre en el trigger Postgres y suma
    // slides.xp reales. Lo recibimos solo para mantener el contrato y
    // permitir animaciones locales futuras.
    // NOTE: we used to early-return here when video.isCompleted was already
    // true, but that prevented re-completions from hitting the DB write path
    // (so attempts wouldn't increment and started_at wouldn't be preserved
    // for analytics on replays). The guard now only skips the local UI-state
    // re-arrange below — the DB write always runs.
    const alreadyCompleted = video.isCompleted;

    // 1. Verify auth. No session → bail, don't touch UI.
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('[dashboard] lesson complete: no user session, skipping', authError);
      return;
    }

    // 2. Persist first. Abort local update on error so the dashboard never
    // shows progress that wasn't saved.
    //
    // Schema (post-pivot): table is `user_progress`, FK is `lecture_id`, the
    // boolean is `is_completed`. Several columns are NOT NULL with no default
    // (started_at, last_active_at, slides_completed, xp_earned, attempts).
    //
    // We split UPDATE vs INSERT (instead of a single upsert) so re-completions
    // preserve `started_at`, `xp_earned`, and increment `attempts` instead of
    // clobbering them — important for the analytics view in
    // supabase/migrations/003 that computes `completed_at - started_at`.
    //
    // `slides_completed` is set to the lecture's real terminal slide count
    // (queried inline) so `is_completed=true` is internally consistent with
    // the slide count, instead of a misleading 0.
    //
    // KNOWN GAP (out of scope for this fix): on first completion via this
    // path, `started_at = completed_at` because nothing tracks the moment
    // the lesson actually opened. Fixing that requires a separate "lesson
    // start" hook on lesson open — flagged for follow-up.
    const now = new Date().toISOString();

    // Count published slides for this lecture so `slides_completed` reflects
    // reality. Read failure is FATAL — falling back to 0 would write
    // `slides_completed=0` with `is_completed=true`, which is exactly the
    // analytics inconsistency this whole branch is here to prevent.
    const { count: slideCount, error: slideCountError } = await supabase
      .from('slides')
      .select('id', { count: 'exact', head: true })
      .eq('lecture_id', video.id)
      .neq('status', 'archived');
    if (slideCountError || slideCount == null) {
      console.warn(
        '[dashboard] failed to count slides for lecture, aborting completion write to avoid bogus slides_completed=0',
        slideCountError,
      );
      return;
    }
    const terminalSlideCount = slideCount;

    // Look up existing row so we can choose UPDATE vs INSERT and preserve
    // fields that should NOT be reset on re-completion.
    const { data: existing, error: existingError } = await supabase
      .from('user_progress')
      .select('started_at, attempts, xp_earned, slides_completed')
      .eq('user_id', user.id)
      .eq('lecture_id', video.id)
      .maybeSingle();
    if (existingError) {
      console.warn('[dashboard] failed to read existing user_progress', existingError);
      return;
    }

    let writeError: any = null;
    if (existing) {
      const { error } = await supabase
        .from('user_progress')
        .update({
          last_active_at: now,
          completed_at: now,
          is_completed: true,
          slides_completed: Math.max(existing.slides_completed ?? 0, terminalSlideCount),
          attempts: (existing.attempts ?? 0) + 1,
        })
        .eq('user_id', user.id)
        .eq('lecture_id', video.id);
      writeError = error;
    } else {
      // xp_earned queda en 0 en el INSERT — el trigger
      // `on_user_progress_complete` lo sobrescribe con SUM(slides.xp) al
      // detectar is_completed=true. El cliente no calcula XP.
      const { error } = await supabase.from('user_progress').insert({
        user_id: user.id,
        lecture_id: video.id,
        started_at: now,
        last_active_at: now,
        completed_at: now,
        is_completed: true,
        slides_completed: terminalSlideCount,
        xp_earned: 0,
        attempts: 1,
      });
      writeError = error;
    }
    if (writeError) {
      console.warn('[dashboard] failed to persist user_progress', writeError);
      return;
    }

    // El trigger `on_user_progress_complete` ya actualizó user_stats.
    // Re-fetch para que la racha/XP/nivel en el UI (TutorChatButton,
    // próxima celebration) reflejen el nuevo estado.
    setUserStats(await getUserStats(supabase, user.id));
    // Notifica a StatsPills (montado en el layout, separado de este árbol)
    // para que también refetchee sin depender de props.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('itera:stats-refresh'));
    }

    // 3. Update the completion set so the derive effect keeps future route
    // switches in sync, and also patch the current videos array optimistically
    // so the current card turns green right away.
    //
    // Skip the local-state re-arrange on a replay (the lesson was already
    // green and `current` was already advanced past it) — otherwise we'd
    // bounce `current` back to the next-incomplete lesson even if the user
    // is mid-way through somewhere else.
    if (alreadyCompleted) return;

    setCompletedVideoIdSet((prev) => {
      if (prev.has(video.id)) return prev;
      const next = new Set(prev);
      next.add(video.id);
      return next;
    });
    setVideos((prev) => {
      let nextCurrentAssigned = false;
      return prev.map((v) => {
        if (v.id === video.id) {
          return { ...v, isCompleted: true, isCurrent: false };
        }
        if (v.isCompleted) {
          return { ...v, isCurrent: false };
        }
        if (!nextCurrentAssigned) {
          nextCurrentAssigned = true;
          return { ...v, isCurrent: true };
        }
        return { ...v, isCurrent: false };
      });
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  // ── Route switcher UI (shared between the hero card and the sticky card) ──
  const hasFull = !!fullIntake;
  const hasPersonalized = !!personalizedIntake;
  const leftDisabled = activeMode === 'full' || !hasFull;
  const rightDisabled = activeMode === 'personalized' || !hasPersonalized;

  const goFull = () => {
    if (!hasFull || activeMode === 'full') return;
    setActivePhaseId('');
    setActiveMode('full');
  };
  const goPersonalized = () => {
    if (!hasPersonalized || activeMode === 'personalized') return;
    setActivePhaseId('');
    setActiveMode('personalized');
  };

  const routeLeadingChevron = (
    <IconButton
      variant="outline"
      disabled={leftDisabled}
      aria-label="Ir al curso completo"
      onClick={leftDisabled ? undefined : goFull}
      className="flex-shrink-0"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </IconButton>
  );

  // When the user doesn't have a personalized intake yet, the trailing
  // affordance becomes a "+" button that opens the CreateCourseModal so
  // there's a clear way to create one. Once they have it, it behaves as a
  // normal right-chevron that navigates to the personalized route.
  const showCreateAffordance = activeMode === 'full' && !hasPersonalized;
  const routeTrailingChevron = showCreateAffordance ? (
    <IconButton
      variant="primary"
      aria-label="Crear curso personalizado"
      onClick={() => setShowCreateCourseModal(true)}
      className="flex-shrink-0"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </IconButton>
  ) : (
    <IconButton
      variant="outline"
      disabled={rightDisabled}
      aria-label="Ir al curso personalizado"
      onClick={rightDisabled ? undefined : goPersonalized}
      className="flex-shrink-0"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </IconButton>
  );

  const routeCardContent = activeMode === 'full' ? (
    <>
      <p className="text-center text-xs sm:text-sm text-[#777777] dark:text-gray-400 leading-relaxed">
        Actualmente estás en el curso completo.
      </p>
      <button
        type="button"
        onClick={() => setShowCreateCourseModal(true)}
        className="pointer-events-auto block mx-auto text-center text-xs sm:text-sm font-bold text-[#1472FF] hover:text-[#0E5FCC] transition-colors mt-0.5"
      >
        Crea tu curso personalizado
      </button>
      <div className="flex justify-center gap-1.5 mt-1.5 sm:mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1472FF]" />
        <div className={`w-1.5 h-1.5 rounded-full ${hasPersonalized ? 'bg-gray-400 dark:bg-gray-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
      </div>
    </>
  ) : (
    <>
      <p className="text-center text-xs sm:text-sm text-[#777777] dark:text-gray-400 line-clamp-2 break-words hyphens-auto leading-relaxed">
        {projectSummary || project || 'Tu curso personalizado'}
      </p>
      <div className="flex justify-center gap-1.5 mt-1.5 sm:mt-2">
        <div className={`w-1.5 h-1.5 rounded-full ${hasFull ? 'bg-gray-400 dark:bg-gray-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#1472FF]" />
      </div>
    </>
  );

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
          </div>
          {(hasFull || hasPersonalized) && (
            <div className="flex justify-center mt-4 mb-2">
              <CompositeCard
                className="w-[90%] sm:w-[80%] max-w-2xl"
                contentClassName="pointer-events-none"
                leading={routeLeadingChevron}
                trailing={routeTrailingChevron}
              >
                {routeCardContent}
              </CompositeCard>
            </div>
          )}
        </div>

        {/* Project + Section Navigation - Sticky at top */}
        {videos.length > 0 && Object.keys(videosByPhase).length > 0 && (
          <div className={`sticky top-0 z-20 bg-white dark:bg-gray-800 transition-all duration-300 ${showGreeting ? 'mt-2' : 'pt-2'}`}>
            {/* Project name - shows when greeting is hidden */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                !showGreeting ? 'max-h-[140px] opacity-100 py-2' : 'max-h-0 opacity-0 py-0'
              }`}
            >
              {(hasFull || hasPersonalized) && (
                <div className="flex justify-center px-2 sm:px-4">
                  <CompositeCard
                    className="w-[90%] sm:w-[80%] max-w-2xl"
                    contentClassName="pointer-events-none"
                    leading={routeLeadingChevron}
                    trailing={routeTrailingChevron}
                  >
                    {routeCardContent}
                  </CompositeCard>
                </div>
              )}
            </div>

            <HorizontalScroll ref={horizontalScrollRef} fadeEdges>
              {orderedPhaseEntries.map(([phaseId, phaseData]) => (
                <Button
                  key={phaseId}
                  data-phase-id={phaseId}
                  variant={activePhaseId === phaseId ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => scrollToPhase(phaseId)}
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  {phaseData.phaseName}
                </Button>
              ))}
            </HorizontalScroll>
            {/* Gradient fade below - positioned absolute to not add space */}
            <div className="absolute left-0 right-0 bottom-0 h-6 bg-gradient-to-b from-white dark:from-gray-800 to-transparent pointer-events-none translate-y-full" />
          </div>
        )}


        {/* Video cards content */}
        <div className="pb-24">
          {videos.length > 0 && (
            <div className="pt-8 pb-6 space-y-6">
            {orderedPhaseEntries.map(([phaseId, phaseData]) => (
              <div
                key={phaseId}
                data-phase-id={phaseId}
                ref={(el) => {
                  if (el) phaseSectionsRef.current.set(phaseId, el);
                }}
              >
                {/* Phase Divider and Title — full width to match the tabs bar */}
                <div className="mb-4 sm:mb-6 px-4 sm:px-12">
                  <Divider title={phaseData.phaseName} />
                </div>
                
                {/* Videos in this phase — centered stack with dashed connectors */}
                <div className="w-full max-w-[220px] mx-auto px-2 sm:px-0">
                  {phaseData.videos.map((video, idx) => {
                    const isLast = idx === phaseData.videos.length - 1;
                    return (
                      <div key={video.id}>
                        <div data-video-id={video.id}>
                          <LessonItem
                            lessonNumber={idx + 1}
                            totalLessons={phaseData.videos.length}
                            title={video.title}
                            isCompleted={video.isCompleted}
                            isCurrent={video.isCurrent}
                            onClick={() => handleVideoSelect(video)}
                          />
                        </div>
                        {!isLast && <PathConnector />}
                      </div>
                    );
                  })}
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
          <div className="h-8 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
          <div className="bg-white dark:bg-gray-800 pb-4 px-4 sm:px-12">
            <div className={`w-full relative h-[37px] rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${depth.border} border-gray-200 dark:border-gray-900 ${depth.bottom} border-b-gray-300 dark:border-b-gray-900`}>
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

      {/* Lesson Overlay — ExperimentLesson reads slides from Supabase
          (lecture_slides JSONB). While they load we render a spinner.
          If the lecture has no slides yet, a minimal "próximamente" state. */}
      {(selectedVideo || isVideoPlayerClosing) && (() => {
        const placeholderSteps: Step[] = [
          { kind: 'concept', title: (selectedVideo?.title ?? '').toLowerCase(), body: 'Estamos preparando el contenido interactivo de esta lección.' },
          { kind: 'celebration', emoji: '🚧', title: 'próximamente', body: 'Vuelve pronto.', section: 'en construcción' },
        ];
        const lessonSteps = selectedSteps ?? (isLoadingSteps ? null : placeholderSteps);
        const animClass =
          isVideoPlayerOpen && !isVideoPlayerClosing
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95';
        const animStyle = {
          transitionDuration: '400ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        };

        // Figure out what "siguiente" means for this lesson. If the next
        // lesson is in the same phase, offer "siguiente lección"; if this is
        // the last lesson of the phase and another phase exists, offer
        // "siguiente sección". When the course is finished, fall back to the
        // single-button "terminar" flow.
        let nextVideo: Video | null = null;
        let nextLabel: string | undefined;
        if (selectedVideo) {
          const i = videos.findIndex((v) => v.id === selectedVideo.id);
          if (i >= 0 && i < videos.length - 1) {
            nextVideo = videos[i + 1];
            nextLabel =
              nextVideo.phaseId === selectedVideo.phaseId
                ? 'siguiente lección'
                : 'siguiente sección';
          }
        }
        const onNext = nextVideo
          ? () => {
              const v = nextVideo!;
              setSelectedVideo(v);
            }
          : undefined;

        return (
          <div
            className={`fixed top-0 md:top-0 bottom-0 flex items-stretch justify-center transition-all ease-out pt-14 md:pt-0 ${
              isVideoPlayerOpen && !isVideoPlayerClosing
                ? 'bg-white dark:bg-gray-800'
                : 'bg-transparent'
            }`}
            style={{
              transitionDuration: '400ms',
              left: isMobile ? 0 : 256,
              right: isMobile ? 0 : `${chatWidth}px`,
              zIndex: 35,
            }}
          >
            <div
              className={`w-full max-w-5xl mx-auto h-full transition-all ease-out ${animClass}`}
              style={animStyle}
            >
              {lessonSteps === null ? (
                <div className="h-full flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                <ExperimentLesson
                  key={selectedVideo?.id ?? 'none'}
                  steps={lessonSteps}
                  onClose={handleCloseVideo}
                  onComplete={async (result) => {
                    if (selectedVideo) await handleLessonComplete(selectedVideo, result);
                  }}
                  onNext={onNext}
                  nextLabel={nextLabel}
                  dailyStreak={userStats?.currentStreak ?? 0}
                />
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal: Crear nuevo curso — sistema */}
      {showCreateCourseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowCreateCourseModal(false)}
        >
          <Card
            variant="neutral"
            padding="none"
            className="relative w-full max-w-lg max-h-[90dvh] my-auto shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-4 sm:px-6 py-4">
              <IconButton
                variant="outline"
                onClick={() => setShowCreateCourseModal(false)}
                aria-label="Cerrar"
                className="absolute top-4 right-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>
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
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Dashboard entrypoint. The maintenance wrapper was removed once the
 * 100-lesson curriculum landed. If you need to gate the dashboard again,
 * re-import `isMaintenanceMode`/`MaintenancePage` and wrap the return.
 */
export default function DashboardPage() {
  return <DashboardPageContent />;
}
