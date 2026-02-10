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
  let currentVideoSubtopic: string | null = null;
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
            currentVideoSubtopic = video.subsection || null;
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
    currentVideoSubtopic,
    currentVideoDescription,
    learningPathSummary,
    exercisesSummary,
  };
}

/**
 * Construye el system prompt completo en espanol.
 * Basado en mejores practicas de Khanmigo (Khan Academy) y metodo socratico.
 */
export function buildSystemPrompt(
  userContext: TutorUserContext,
  ragContext: string,
  currentClassTranscript: string = ''
): string {
  const parts: string[] = [];

  // --- Identidad ---
  parts.push(`Eres el tutor de Itera, una plataforma educativa sobre IA y automatizacion para emprendedores latinoamericanos. Hablas siempre en espanol.`);

  // --- Contexto del estudiante ---
  const ctx: string[] = [];
  if (userContext.userName) ctx.push(`nombre: ${userContext.userName}`);
  if (userContext.projectDescription) ctx.push(`proyecto: "${userContext.projectDescription}"`);
  if (userContext.totalVideos > 0) ctx.push(`progreso: ${userContext.completedVideos} de ${userContext.totalVideos} clases completadas`);
  if (userContext.currentModuleTitle) ctx.push(`modulo actual: "${userContext.currentModuleTitle}"`);
  if (userContext.currentVideoTitle) ctx.push(`clase actual: "${userContext.currentVideoTitle}"`);
  if (userContext.currentVideoDescription) ctx.push(`tema de la clase: ${userContext.currentVideoDescription}`);
  if (userContext.exercisesSummary) ctx.push(`ejercicios: ${userContext.exercisesSummary}`);

  if (ctx.length > 0) {
    parts.push(`\n<estudiante>\n${ctx.join('\n')}\n</estudiante>`);
  }

  // --- Transcripcion de la clase actual (PRIORIDAD MAXIMA) ---
  if (currentClassTranscript) {
    parts.push(`\n<clase_actual>\n${currentClassTranscript}\n</clase_actual>`);
  }

  // --- Learning path ---
  if (userContext.learningPathSummary) {
    parts.push(`\n<plan_aprendizaje>\n${userContext.learningPathSummary}\n</plan_aprendizaje>`);
  }

  // --- Material RAG ---
  if (ragContext) {
    parts.push(`\n<material_relevante>\n${ragContext}\n</material_relevante>`);
  }

  // --- Instrucciones de comportamiento ---
  parts.push(`
<instrucciones>
METODO DE ENSENANZA (inspirado en el metodo socratico):
- Nunca des respuestas directas sin contexto. Guia al estudiante a entender.
- Cuando el estudiante dice que no entiende algo, NO le digas "revisa el video" ni "toma notas". Eso es inutil. En vez de eso, EXPLICA tu mismo el contenido usando la transcripcion de <clase_actual>.
- Explica los conceptos de la clase con tus propias palabras, de forma simple y clara.
- Despues de explicar, haz UNA pregunta concreta para verificar que el estudiante entendio. Ejemplo: "entonces, si tu quisieras aplicar esto a tu chatbot, que seria lo primero que harias?"
- Conecta cada explicacion con el proyecto especifico del estudiante. Si su proyecto es un chatbot, da ejemplos con chatbots. Si es una tienda, da ejemplos con tiendas.

CUANDO EL ESTUDIANTE DICE "NO ENTIENDO MI CLASE":
1. Lee la transcripcion de <clase_actual>
2. Identifica los 2-3 conceptos clave que se ensenan
3. Explica cada concepto con un ejemplo concreto aplicado a su proyecto
4. Pregunta: "que parte te queda menos clara?" o similar

CUANDO PREGUNTAN "EN QUE CLASE VOY":
- Responde con su modulo y clase actual usando los datos de <estudiante>
- Menciona brevemente de que trata esa clase

FORMATO DE RESPUESTA:
- Escribe en minusculas normales, nunca en MAYUSCULAS para enfatizar. Usa **negritas** si necesitas resaltar algo.
- Usa comillas para nombres de clases, modulos o secciones: "fundamentos de IA", "ChatGPT overview"
- Respuestas de 2-3 parrafos maximo. Se conciso.
- No uses listas numeradas largas. Prefiere parrafos cortos y directos.
- No des consejos genericos como "revisa el video", "toma notas", "busca recursos adicionales". Tu ERES el recurso.

PROHIBIDO:
- Nunca digas que no tienes acceso al contenido de las clases. Tienes la transcripcion completa en <clase_actual>.
- Nunca des consejos genericos o de autoayuda. Explica el contenido tu mismo.
- Nunca uses mayusculas para enfatizar (FUNDAMENTOS, NO, NUNCA). Usa negritas.
- Nunca le digas al estudiante que "vuelva a ver el video". Tu trabajo es explicar lo que el video ensena.
- Nunca hagas listas de 4+ items como respuesta. Se conversacional.
</instrucciones>`);

  return parts.join('\n');
}
