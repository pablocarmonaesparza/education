// lib/supabase/dashboard.ts
// Supabase queries for the student dashboard

import { SupabaseClient } from '@supabase/supabase-js';
import {
  DashboardUser,
  LearningPath,
  LearningPathModule,
  LearningPathVideo,
  VideoProgress,
  ContinueLearning,
  StudentStats,
  ActivityEvent,
  DashboardData,
  DashboardState,
} from '@/types/dashboard';

// ============================================
// USER QUERIES
// ============================================

export async function getDashboardUser(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, tier, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching dashboard user:', error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    tier: data.tier || 'basic',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// ============================================
// LEARNING PATH QUERIES
// ============================================

export async function getLearningPath(
  supabase: SupabaseClient,
  userId: string
): Promise<LearningPath | null> {
  // Fetch intake response with generated path
  const { data: intakeData, error: intakeError } = await supabase
    .from('intake_responses')
    .select('id, responses, generated_path, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (intakeError || !intakeData?.generated_path) {
    // No learning path generated yet
    return null;
  }

  // Fetch lecture progress from user_progress (schema v1).
  // La tabla legacy `video_progress` fue dropeada en 000_nuke_legacy.
  const { data: progressData, error: progressError } = await supabase
    .from('user_progress')
    .select('lecture_id, is_completed, completed_at, last_active_at, started_at, xp_earned')
    .eq('user_id', userId);

  if (progressError) {
    console.error('Error fetching user_progress:', progressError);
  }

  const videoProgressMap = new Map<string, VideoProgress>();
  (progressData || []).forEach((p: any) => {
    videoProgressMap.set(String(p.lecture_id), {
      id: p.lecture_id,
      userId,
      videoId: String(p.lecture_id),
      moduleId: '',
      completed: p.is_completed,
      lastPosition: 0,
      completedAt: p.completed_at,
      createdAt: p.started_at,
      updatedAt: p.last_active_at,
    });
  });

  // Parse the generated path and build learning path structure
  const generatedPath = intakeData.generated_path;
  const projectDescription = intakeData.responses?.project || '';

  // Transform generated_path into LearningPath structure
  // The generated_path structure from n8n should contain modules/phases
  const modules = transformToLearningPathModules(generatedPath, videoProgressMap);

  // Calculate totals
  let totalVideos = 0;
  let completedVideos = 0;
  let totalMinutes = 0;
  let completedMinutes = 0;

  modules.forEach((module) => {
    totalVideos += module.totalVideos;
    completedVideos += module.completedVideos;
    totalMinutes += module.estimatedMinutes;
    
    // Calculate completed minutes based on completed videos
    module.videos.forEach((video) => {
      if (video.isCompleted) {
        completedMinutes += Math.round(video.duration / 60);
      }
    });
  });

  const progressPercentage = totalVideos > 0 
    ? Math.round((completedVideos / totalVideos) * 100) 
    : 0;

  return {
    id: intakeData.id,
    userId,
    projectDescription,
    modules,
    totalVideos,
    completedVideos,
    totalMinutes,
    completedMinutes,
    progressPercentage,
    createdAt: intakeData.created_at,
    updatedAt: intakeData.updated_at,
  };
}

// Transform the generated path from n8n into our LearningPathModule structure
function transformToLearningPathModules(
  generatedPath: any,
  videoProgressMap: Map<string, VideoProgress>
): LearningPathModule[] {
  // The generated_path structure can vary based on n8n output
  // Adapt this based on actual structure from your n8n workflow
  
  const phases = generatedPath.phases || generatedPath.modules || generatedPath.sections || [];
  
  let foundCurrentVideo = false;
  
  return phases.map((phase: any, phaseIndex: number) => {
    const videos = (phase.videos || phase.lessons || []).map((video: any, videoIndex: number) => {
      const progress = videoProgressMap.get(video.id || `${phase.id}-${videoIndex}`);
      const isCompleted = progress?.completed || false;
      const isCurrent = !isCompleted && !foundCurrentVideo;
      
      if (isCurrent) {
        foundCurrentVideo = true;
      }
      
      return {
        id: video.id || `${phase.id}-video-${videoIndex}`,
        title: video.title || video.name || `Video ${videoIndex + 1}`,
        description: video.description,
        duration: video.duration || video.duration_seconds || 180, // default 3 min
        order: videoIndex + 1,
        videoUrl: video.video_url || video.url,
        thumbnailUrl: video.thumbnail_url || video.thumbnail,
        isCompleted,
        isCurrent,
        lastPosition: progress?.lastPosition || 0,
        completedAt: progress?.completedAt,
      } as LearningPathVideo;
    });

    const completedCount = videos.filter((v: LearningPathVideo) => v.isCompleted).length;
    const totalCount = videos.length;
    const isModuleCompleted = totalCount > 0 && completedCount === totalCount;
    const hasCurrent = videos.some((v: LearningPathVideo) => v.isCurrent);

    // Calculate estimated minutes from video durations
    const estimatedMinutes = videos.reduce(
      (sum: number, v: LearningPathVideo) => sum + Math.round(v.duration / 60),
      0
    );

    return {
      id: phase.id || `module-${phaseIndex}`,
      title: phase.title || phase.name || `Módulo ${phaseIndex + 1}`,
      description: phase.description || phase.summary || '',
      order: phaseIndex + 1,
      totalVideos: totalCount,
      completedVideos: completedCount,
      estimatedMinutes,
      isUnlocked: phaseIndex === 0 || phases[phaseIndex - 1]?.isCompleted || completedCount > 0,
      isCompleted: isModuleCompleted,
      isCurrent: hasCurrent,
      videos,
    } as LearningPathModule;
  });
}

// ============================================
// CONTINUE LEARNING
// ============================================

export function getContinueLearning(learningPath: LearningPath | null): ContinueLearning {
  if (!learningPath || learningPath.modules.length === 0) {
    return {
      hasContent: false,
      currentVideo: null,
      currentModule: null,
      nextVideo: null,
      overallProgress: 0,
      resumePosition: 0,
    };
  }

  // Find current video (first incomplete video)
  let currentVideo: LearningPathVideo | null = null;
  let currentModule: LearningPathModule | null = null;
  let nextVideo: LearningPathVideo | null = null;

  for (const module of learningPath.modules) {
    for (let i = 0; i < module.videos.length; i++) {
      const video = module.videos[i];
      
      if (video.isCurrent) {
        currentVideo = video;
        currentModule = module;
        // Next video is either the next in module or first in next module
        if (i + 1 < module.videos.length) {
          nextVideo = module.videos[i + 1];
        }
        break;
      }
    }
    if (currentVideo) break;
  }

  // If no current video found, user might have completed everything
  // or hasn't started - set first video as current
  if (!currentVideo && learningPath.modules.length > 0) {
    const firstModule = learningPath.modules[0];
    if (firstModule.videos.length > 0) {
      currentVideo = firstModule.videos[0];
      currentModule = firstModule;
      if (firstModule.videos.length > 1) {
        nextVideo = firstModule.videos[1];
      }
    }
  }

  return {
    hasContent: true,
    currentVideo,
    currentModule,
    nextVideo,
    overallProgress: learningPath.progressPercentage,
    resumePosition: currentVideo?.lastPosition || 0,
  };
}

// ============================================
// STUDENT STATS — desde user_progress + user_stats
// ============================================
//
// Las helpers `updateVideoProgress` / `markVideoCompleted` que vivían aquí
// fueron eliminadas junto con la tabla `video_progress` (ver migration
// 000_nuke_legacy y 006_user_stats_and_gamification). Hoy el flujo real es:
//   - El cliente escribe `is_completed = true` en `user_progress`.
//   - Un trigger de Postgres dispara `award_lecture_xp` y
//     `recalculate_user_stats`, que mantienen `user_stats` al día.
//   - Las vistas que necesiten racha/XP/level leen `user_stats` via
//     `lib/gamification.ts`.

export async function getStudentStats(
  supabase: SupabaseClient,
  userId: string,
  learningPath: LearningPath | null
): Promise<StudentStats> {
  // user_stats agrega total_xp, level, current_streak, longest_streak,
  // last_activity_date y lessons_completed. Mantenido por el trigger.
  const { data: stats } = await supabase
    .from('user_stats')
    .select('current_streak, longest_streak, last_activity_date, lessons_completed')
    .eq('user_id', userId)
    .maybeSingle();

  const lessonsCompleted = stats?.lessons_completed ?? 0;

  // Estimación simple de minutos de estudio: 3 min por lección completada.
  // El trigger no calcula tiempo real todavía; cuando haya `duration_seconds`
  // poblado en `lectures`, reemplazar por una agregación real.
  const minutesWatched = lessonsCompleted * 3;

  return {
    totalProgress: learningPath?.progressPercentage || 0,
    videosCompleted: learningPath?.completedVideos || 0,
    totalVideos: learningPath?.totalVideos || 0,
    modulesCompleted: learningPath?.modules.filter(m => m.isCompleted).length || 0,
    totalModules: learningPath?.modules.length || 0,
    minutesWatched,
    currentStreak: stats?.current_streak ?? 0,
    longestStreak: stats?.longest_streak ?? 0,
    lastActiveAt: stats?.last_activity_date ?? null,
  };
}

// ============================================
// RECENT ACTIVITY — desde user_progress
// ============================================

export async function getRecentActivity(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 10
): Promise<ActivityEvent[]> {
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('lecture_id, is_completed, completed_at, last_active_at')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(limit);

  const activities: ActivityEvent[] = [];

  (progressData || []).forEach((p: any) => {
    if (p.completed_at) {
      activities.push({
        id: `lecture-completed-${p.lecture_id}`,
        type: 'video_completed',
        title: 'Lección completada',
        description: 'Completaste una lección',
        metadata: { videoId: String(p.lecture_id), moduleId: '' },
        createdAt: p.completed_at,
      });
    }
  });

  return activities;
}

// ============================================
// DASHBOARD STATE
// ============================================

export function getDashboardState(
  user: DashboardUser | null,
  learningPath: LearningPath | null,
  isLoading: boolean
): DashboardState {
  if (isLoading) return 'loading';
  if (!user) return 'error';
  if (!learningPath) return 'no_path';
  if (learningPath.progressPercentage === 100) return 'completed';
  return 'ready';
}

// ============================================
// FULL DASHBOARD DATA
// ============================================

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardData> {
  try {
    // Fetch user
    const user = await getDashboardUser(supabase, userId);
    
    if (!user) {
      return {
        user: null as any,
        learningPath: null,
        continueLearning: getContinueLearning(null),
        stats: {
          totalProgress: 0,
          videosCompleted: 0,
          totalVideos: 0,
          modulesCompleted: 0,
          totalModules: 0,
          minutesWatched: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
        recentActivity: [],
        isLoading: false,
        error: 'User not found',
      };
    }

    // Fetch learning path
    const learningPath = await getLearningPath(supabase, userId);

    // Get continue learning data
    const continueLearning = getContinueLearning(learningPath);

    // Get stats
    const stats = await getStudentStats(supabase, userId, learningPath);

    // Get recent activity
    const recentActivity = await getRecentActivity(supabase, userId);

    return {
      user,
      learningPath,
      continueLearning,
      stats,
      recentActivity,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      user: null as any,
      learningPath: null,
      continueLearning: getContinueLearning(null),
      stats: {
        totalProgress: 0,
        videosCompleted: 0,
        totalVideos: 0,
        modulesCompleted: 0,
        totalModules: 0,
        minutesWatched: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      recentActivity: [],
      isLoading: false,
      error: 'Failed to load dashboard data',
    };
  }
}



