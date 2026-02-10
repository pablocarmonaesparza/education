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
  const generatedPath = intake?.generated_path;
  const totalVideos = generatedPath?.total_videos ||
    generatedPath?.phases?.reduce(
      (sum: number, phase: any) =>
        sum + (phase.videos?.length || phase.lessons?.length || 0),
      0
    ) || 0;

  // Encontrar modulo y video actual usando 'order' como ID (asi esta la estructura)
  let currentModuleTitle: string | null = null;
  let currentVideoTitle: string | null = null;
  let currentVideoDescription: string | null = null;
  const completedVideoIds = new Set(
    progress.filter((p: any) => p.completed).map((p: any) => p.video_id)
  );

  // Construir resumen de learning path para el tutor
  let learningPathSummary: string | null = null;

  if (generatedPath?.phases) {
    const phaseSummaries: string[] = [];

    for (const phase of generatedPath.phases) {
      const videos = phase.videos || phase.lessons || [];
      const phaseName = phase.phase_name || phase.title || phase.name || 'Sin nombre';
      const phaseDesc = phase.description || '';

      // Contar completados en esta fase
      const phaseCompleted = videos.filter((v: any) =>
        completedVideoIds.has(String(v.order)) || completedVideoIds.has(v.id)
      ).length;

      phaseSummaries.push(
        `Fase ${phase.phase_number || ''}: ${phaseName} (${phaseCompleted}/${videos.length} completados) - ${phaseDesc}`
      );

      // Encontrar el video actual (primer video no completado)
      if (!currentVideoTitle) {
        for (const video of videos) {
          const videoId = String(video.order || video.id);
          if (!completedVideoIds.has(videoId)) {
            currentModuleTitle = phaseName;
            currentVideoTitle = video.subsection || video.title || video.name || null;
            currentVideoDescription = video.description || video.why_relevant || null;
            break;
          }
        }
      }
    }

    learningPathSummary = phaseSummaries.join('\n');
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
    currentVideoDescription,
    learningPathSummary,
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
      `- Progreso general: ${userContext.completedVideos}/${userContext.totalVideos} videos completados`
    );
  }
  if (userContext.currentModuleTitle) {
    contextLines.push(`- Modulo actual: ${userContext.currentModuleTitle}`);
  }
  if (userContext.currentVideoTitle) {
    contextLines.push(`- Siguiente clase: ${userContext.currentVideoTitle}`);
  }
  if (userContext.currentVideoDescription) {
    contextLines.push(`- Descripcion de la clase actual: ${userContext.currentVideoDescription}`);
  }
  if (userContext.exercisesSummary) {
    contextLines.push(`- Ejercicios: ${userContext.exercisesSummary}`);
  }

  if (contextLines.length > 0) {
    parts.push(`\nCONTEXTO DEL ESTUDIANTE:\n${contextLines.join('\n')}`);
  }

  // Learning path completo
  if (userContext.learningPathSummary) {
    parts.push(
      `\nPLAN DE APRENDIZAJE DEL ESTUDIANTE (learning path personalizado):\n${userContext.learningPathSummary}`
    );
  }

  // Material RAG
  if (ragContext) {
    parts.push(
      `\nMATERIAL RELEVANTE DE LAS CLASES DE ITERA (usa esta informacion para responder):\n${ragContext}`
    );
  }

  // Instrucciones del tutor
  parts.push(`
TU ROL:
- Eres el tutor IA personal del estudiante en Itera
- TIENES acceso al contenido de las clases a traves del material relevante que se te proporciona arriba
- TIENES acceso al plan de aprendizaje del estudiante y sabes en que clase va
- Cuando te pregunten "en que clase voy" o "que sigue", usa el CONTEXTO DEL ESTUDIANTE para responder con el modulo y video actual
- Cuando te pregunten sobre contenido de clases, usa el MATERIAL RELEVANTE para dar respuestas basadas en lo que ensenan las clases
- Responde de forma concisa y directa

COMO RESPONDER:
- Si te saludan, saluda de vuelta brevemente y pregunta en que puedes ayudar
- Si preguntan sobre su progreso o en que clase van: usa los datos del contexto (modulo actual, video actual, progreso)
- Si preguntan sobre un tema tecnico: busca en el material relevante y responde basandote en el contenido de las clases, aplicado a su proyecto
- Si preguntan algo que no esta en el material: responde con tu conocimiento general pero aclara que es informacion adicional
- Respuestas cortas y al punto (2-3 parrafos maximo)
- Siempre en espanol

LO QUE SABES HACER:
- Decirle al estudiante en que clase va, que modulo esta cursando y que sigue
- Explicar conceptos de las clases usando el material relevante
- Dar ejemplos aplicados al proyecto del estudiante
- Resolver dudas tecnicas sobre IA, automatizacion, APIs, prompting, RAG, agentes, MCP
- Resolver problemas tecnicos

LO QUE NO DEBES HACER:
- NUNCA digas que no tienes acceso a las clases - SI tienes acceso al material
- No des discursos largos ni motivacionales
- No sugieras cosas si no te lo piden
- No repitas informacion que el estudiante ya sabe
- No preguntes cosas que ya sabes por el contexto`);

  return parts.join('\n');
}
