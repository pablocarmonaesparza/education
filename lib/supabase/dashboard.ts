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

  // Fetch all video progress for this user
  const { data: progressData, error: progressError } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', userId);

  if (progressError) {
    console.error('Error fetching video progress:', progressError);
  }

  const videoProgressMap = new Map<string, VideoProgress>();
  (progressData || []).forEach((p: any) => {
    videoProgressMap.set(p.video_id, {
      id: p.id,
      userId: p.user_id,
      videoId: p.video_id,
      moduleId: p.section_id,
      completed: p.completed,
      lastPosition: p.last_position || 0,
      completedAt: p.completed_at,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
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
// VIDEO PROGRESS
// ============================================

export async function updateVideoProgress(
  supabase: SupabaseClient,
  userId: string,
  videoId: string,
  moduleId: string,
  position: number,
  completed: boolean = false
): Promise<VideoProgress | null> {
  const updateData: any = {
    user_id: userId,
    video_id: videoId,
    section_id: moduleId,
    last_position: position,
    updated_at: new Date().toISOString(),
  };

  if (completed) {
    updateData.completed = true;
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('video_progress')
    .upsert(updateData, {
      onConflict: 'user_id,video_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating video progress:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    videoId: data.video_id,
    moduleId: data.section_id,
    completed: data.completed,
    lastPosition: data.last_position,
    completedAt: data.completed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function markVideoCompleted(
  supabase: SupabaseClient,
  userId: string,
  videoId: string,
  moduleId: string
): Promise<boolean> {
  const result = await updateVideoProgress(supabase, userId, videoId, moduleId, 0, true);
  return result !== null;
}

// ============================================
// STUDENT STATS
// ============================================

export async function getStudentStats(
  supabase: SupabaseClient,
  userId: string,
  learningPath: LearningPath | null
): Promise<StudentStats> {
  // Get video progress for calculating watch time and streaks
  const { data: progressData } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  const completedProgress = (progressData || []).filter((p: any) => p.completed);
  
  // Calculate minutes watched (estimate based on completed videos)
  // In a real implementation, you'd track actual watch time
  const minutesWatched = completedProgress.reduce((sum: number, p: any) => {
    // Estimate 3 minutes per video if we don't have duration
    return sum + 3;
  }, 0);

  // Calculate streak
  const { currentStreak, longestStreak } = calculateStreak(progressData || []);

  // Get last active timestamp
  const lastActiveAt = progressData?.[0]?.updated_at || null;

  return {
    totalProgress: learningPath?.progressPercentage || 0,
    videosCompleted: learningPath?.completedVideos || 0,
    totalVideos: learningPath?.totalVideos || 0,
    modulesCompleted: learningPath?.modules.filter(m => m.isCompleted).length || 0,
    totalModules: learningPath?.modules.length || 0,
    minutesWatched,
    currentStreak,
    longestStreak,
    lastActiveAt,
  };
}

function calculateStreak(progressData: any[]): { currentStreak: number; longestStreak: number } {
  if (!progressData || progressData.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique dates when user was active
  const activeDates = new Set<string>();
  progressData.forEach((p) => {
    if (p.updated_at) {
      const date = new Date(p.updated_at).toISOString().split('T')[0];
      activeDates.add(date);
    }
  });

  const sortedDates = Array.from(activeDates).sort().reverse();
  
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Calculate current streak
  let currentStreak = 0;
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak (simplified)
  let longestStreak = currentStreak;
  let tempStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
    
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, longestStreak };
}

// ============================================
// RECENT ACTIVITY
// ============================================

export async function getRecentActivity(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 10
): Promise<ActivityEvent[]> {
  const { data: progressData } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  const activities: ActivityEvent[] = [];

  (progressData || []).forEach((p: any) => {
    if (p.completed && p.completed_at) {
      activities.push({
        id: `video-completed-${p.id}`,
        type: 'video_completed',
        title: 'Video completado',
        description: `Completaste un video`,
        metadata: { videoId: p.video_id, moduleId: p.section_id },
        createdAt: p.completed_at,
      });
    }
  });

  return activities.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, limit);
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
