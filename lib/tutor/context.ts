// lib/tutor/context.ts — Contexto del usuario y system prompt

import type { SupabaseClient } from '@supabase/supabase-js';
import type { TutorUserContext } from '@/types/tutor';

/**
 * Obtiene el contexto completo del usuario para enriquecer el system prompt.
 */
export async function getUserContext(
  supabase: SupabaseClient,
  userId: string
): Promise<TutorUserContext> {
  // Queries en paralelo para minimizar latencia
  const [userResult, intakeResult, progressResult, exercisesResult] =
    await Promise.all([
      // 1. Datos del usuario
      supabase
        .from('users')
        .select('name, tier')
        .eq('id', userId)
        .single(),
      // 2. Proyecto e intake
      supabase
        .from('intake_responses')
        .select('responses, generated_path')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      // 3. Progreso de videos
      supabase
        .from('video_progress')
        .select('video_id, completed, section_id')
        .eq('user_id', userId),
      // 4. Ejercicios
      supabase
        .from('user_exercises')
        .select('total_exercises, exercises')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

  const user = userResult.data;
  const intake = intakeResult.data;
  const progress = progressResult.data || [];
  const exercises = exercisesResult.data;

  // Extraer proyecto del intake
  const projectDescription =
    intake?.responses?.project_idea ||
    intake?.responses?.project ||
    null;

  // Calcular progreso
  const completedVideos = progress.filter((p: any) => p.completed).length;
  const totalVideos = intake?.generated_path?.phases?.reduce(
    (sum: number, phase: any) =>
      sum + (phase.videos?.length || phase.lessons?.length || 0),
    0
  ) || 0;

  // Encontrar modulo y video actual
  let currentModuleTitle: string | null = null;
  let currentVideoTitle: string | null = null;
  const completedVideoIds = new Set(
    progress.filter((p: any) => p.completed).map((p: any) => p.video_id)
  );

  if (intake?.generated_path?.phases) {
    for (const phase of intake.generated_path.phases) {
      const videos = phase.videos || phase.lessons || [];
      for (const video of videos) {
        if (!completedVideoIds.has(video.id)) {
          currentModuleTitle = phase.title || phase.name || null;
          currentVideoTitle = video.title || video.name || null;
          break;
        }
      }
      if (currentVideoTitle) break;
    }
  }

  // Resumen de ejercicios
  let exercisesSummary: string | null = null;
  if (exercises?.exercises) {
    const exerciseList = Array.isArray(exercises.exercises)
      ? exercises.exercises
      : [];
    const completed = exerciseList.filter((e: any) => e.completed).length;
    const total = exercises.total_exercises || exerciseList.length;
    exercisesSummary = `${completed}/${total} ejercicios completados`;
  }

  return {
    userName: user?.name || null,
    projectDescription,
    tier: user?.tier || 'basic',
    completedVideos,
    totalVideos,
    currentModuleTitle,
    currentVideoTitle,
    exercisesSummary,
  };
}

/**
 * Construye el system prompt completo en espanol.
 */
export function buildSystemPrompt(
  userContext: TutorUserContext,
  ragContext: string
): string {
  const parts: string[] = [];

  parts.push(
    `Eres el tutor IA de Itera, una plataforma educativa sobre IA y automatizacion para emprendedores latinoamericanos.`
  );

  // Contexto del estudiante
  const contextLines: string[] = [];
  if (userContext.userName) {
    contextLines.push(`- Nombre: ${userContext.userName}`);
  }
  if (userContext.projectDescription) {
    contextLines.push(`- Proyecto: ${userContext.projectDescription}`);
  }
  contextLines.push(`- Tier: ${userContext.tier}`);
  if (userContext.totalVideos > 0) {
    contextLines.push(
      `- Progreso: ${userContext.completedVideos}/${userContext.totalVideos} videos completados`
    );
  }
  if (userContext.currentModuleTitle) {
    contextLines.push(`- Modulo actual: ${userContext.currentModuleTitle}`);
  }
  if (userContext.currentVideoTitle) {
    contextLines.push(`- Video actual: ${userContext.currentVideoTitle}`);
  }
  if (userContext.exercisesSummary) {
    contextLines.push(`- Ejercicios: ${userContext.exercisesSummary}`);
  }

  if (contextLines.length > 0) {
    parts.push(`\nCONTEXTO DEL ESTUDIANTE:\n${contextLines.join('\n')}`);
  }

  // Material RAG
  if (ragContext) {
    parts.push(
      `\nMATERIAL RELEVANTE DE LA PLATAFORMA:\n${ragContext}`
    );
  }

  // Instrucciones del tutor
  parts.push(`
TU ROL:
- Eres un ASISTENTE - estas aqui para AYUDAR cuando el estudiante te pregunte algo
- NO tomes iniciativa ni sugieras cosas si no te lo piden
- NO preguntes informacion que ya tienes en el contexto (nombre, proyecto, progreso)
- Responde de forma concisa y directa a lo que te pregunten
- Usa la informacion del material relevante para dar respuestas precisas
- Aplica los conceptos al proyecto especifico del estudiante

COMO RESPONDER:
- Si te saludan, saluda de vuelta brevemente y pregunta en que puedes ayudar
- Si te hacen una pregunta tecnica, responde usando el contexto de su proyecto cuando sea relevante
- Usa la informacion de las clases que ya completo para saber que conceptos ya conoce
- Respuestas cortas y al punto (2-3 parrafos maximo)
- Siempre en espanol

LO QUE SABES HACER:
- Explicar conceptos de IA, automatizacion, APIs, prompting, RAG, agentes, MCP
- Ayudar a resolver dudas sobre las clases
- Dar ejemplos aplicados al proyecto del estudiante
- Resolver problemas tecnicos

LO QUE NO DEBES HACER:
- No des discursos largos ni motivacionales
- No sugieras cosas si no te lo piden
- No repitas informacion que el estudiante ya sabe
- No preguntes cosas que ya sabes por el contexto`);

  return parts.join('\n');
}
