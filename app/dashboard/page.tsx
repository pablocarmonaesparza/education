import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect('/auth/login');
    }

    // Get user profile data
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, email, tier')
      .eq('id', user.id)
      .maybeSingle();

    // Get video progress statistics
    const { count: completedCount } = await supabase
      .from('video_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    const { count: totalProgressCount } = await supabase
      .from('video_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get full intake response with project details
    const { data: intakeResponse } = await supabase
      .from('intake_responses')
      .select('id, responses, generated_path')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const hasPersonalizedPath = !!intakeResponse?.generated_path;

    // Redirect to onboarding if user doesn't have a personalized path
    if (!hasPersonalizedPath) {
      redirect('/onboarding');
    }

    const generatedPath = intakeResponse?.generated_path || null;
    const userResponses = intakeResponse?.responses || {};

    // Calculate total videos from generated path
    const estimatedTotalVideos = generatedPath?.phases?.reduce(
      (acc: number, phase: any) => acc + (phase?.videos?.length || 0),
      0
    ) || 0;

    const userName = userProfile?.name || userProfile?.email?.split('@')[0] || 'Usuario';
    const completedVideos = completedCount || 0;
    const totalVideos = estimatedTotalVideos || totalProgressCount || 0;

    const overallProgress = totalVideos > 0 
      ? Math.round((completedVideos / totalVideos) * 100) 
      : 0;

    // Calculate phase progress
    const totalPhases = generatedPath?.phases?.length || 0;
    let phasesCompleted = 0;
    let currentPhase = 1;
    let currentVideo = 1;

    if (generatedPath?.phases && Array.isArray(generatedPath.phases)) {
      const { data: allVideoProgress } = await supabase
        .from('video_progress')
        .select('video_id, section_id, completed')
        .eq('user_id', user.id);

      generatedPath.phases.forEach((phase: any, phaseIndex: number) => {
        const phaseVideos = phase?.videos || [];
        if (phaseVideos.length === 0) return;
        
        const completedInPhase = phaseVideos.filter((video: any) => 
          allVideoProgress?.some((vp: any) => 
            vp.video_id === String(video.order) && vp.completed
          )
        ).length;
        
        if (completedInPhase === phaseVideos.length && phaseVideos.length > 0) {
          phasesCompleted++;
        }

        if (currentPhase === phaseIndex + 1 && completedInPhase < phaseVideos.length) {
          currentVideo = completedInPhase + 1;
        }
      });
    }

    // Get checkpoint submissions
    const { data: checkpointSubmissions = [] } = await supabase
      .from('checkpoint_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });

    const checkpointResults = (checkpointSubmissions || []).map((cs: any) => ({
      id: cs.id,
      title: `Checkpoint ${cs.checkpoint_id}`,
      validated: cs.validated || false,
      feedback: cs.feedback || null,
      submittedAt: cs.submitted_at || null,
      validatedAt: cs.validated_at || null,
    }));

    // Calculate time spent
    const timeSpent = completedVideos * 3;
    const estimatedTime = totalVideos * 3;

    // Extract project information
    const userProject = generatedPath?.user_project || userResponses?.project || null;
    const projectType = generatedPath?.project_type || userResponses?.project_type || null;
    const skills = generatedPath?.skills_developed || userResponses?.skills || [];
    const tools = generatedPath?.tools_learned || userResponses?.tools || [];

    // Gamification data
    const currentXP = completedVideos * 10 + phasesCompleted * 50;
    const level = Math.floor(currentXP / 100) + 1;
    const streak = 0;
    const weeklyGoal = 10;
    const weeklyProgress = 0;
    const earnedBadges: string[] = [];
    
    if (completedVideos > 0) earnedBadges.push('first-video');
    if (completedVideos >= 10) earnedBadges.push('videos-10');
    if (phasesCompleted > 0) earnedBadges.push('first-phase');
    if (streak >= 3) earnedBadges.push('streak-3');

    // Artifacts
    const artifacts = (checkpointSubmissions || []).map((cs: any) => ({
      id: cs.id,
      name: `Artefacto de ${cs.section_id || 'N/A'}`,
      description: `Artefacto generado en el checkpoint ${cs.checkpoint_id || 'N/A'}`,
      phase: 1,
      phaseName: cs.section_id || 'N/A',
      status: cs.validated ? 'validated' : cs.submission ? 'completed' : 'pending',
      submittedAt: cs.submitted_at || null,
      validatedAt: cs.validated_at || null,
      fileUrl: cs.file_url || null,
      feedback: cs.feedback || null,
    }));

    return (
      <DashboardContent
        userName={userName}
        userEmail={user.email || ''}
        completedVideos={completedVideos}
        totalVideos={totalVideos}
        overallProgress={overallProgress}
        hasPersonalizedPath={hasPersonalizedPath}
        userProject={userProject}
        projectType={projectType}
        skills={skills}
        tools={tools}
        learningPath={generatedPath}
        userTier={(userProfile?.tier as 'basic' | 'personalized' | 'premium') || 'basic'}
        phasesCompleted={phasesCompleted}
        totalPhases={totalPhases}
        currentPhase={currentPhase}
        currentVideo={currentVideo}
        timeSpent={timeSpent}
        estimatedTime={estimatedTime}
        artifacts={artifacts}
        checkpointResults={checkpointResults}
        weeklyGoal={weeklyGoal}
        weeklyProgress={weeklyProgress}
        streak={streak}
        currentXP={currentXP}
        level={level}
        earnedBadges={earnedBadges}
      />
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    // Return a simple error page instead of crashing
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el dashboard</h1>
          <p className="text-gray-600 mb-4">Por favor intenta recargar la página</p>
          <a 
            href="/dashboard" 
            className="px-4 py-2 bg-[#1472FF] text-white rounded-lg hover:bg-[#0E5FCC]"
          >
            Recargar
          </a>
        </div>
      </div>
    );
  }
}
