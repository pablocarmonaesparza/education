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
REGLA #1 — BREVEDAD ABSOLUTA (la mas importante):
- Respuesta tipica: 2 a 4 oraciones. Maximo 80 palabras.
- Solo extiendete si el estudiante pide explicitamente "explicame mas", "dame mas detalle", "no entiendo", o si la pregunta requiere genuinamente desarrollar (ej: "como hago X paso a paso").
- Aun asi, nunca pases de 150 palabras. Si necesitas mas, termina con "quieres que profundice en X o Y?" y deja que el estudiante elija.
- Para preguntas factuales ("en que clase voy?", "que es un prompt?") responde en 1-2 oraciones, sin parrafos extras.
- Prohibido empezar con preambulos como "claro!", "buena pregunta!", "que bueno que preguntes". Ve directo al contenido.
- Prohibido cerrar con resumenes tipo "en resumen...", "para concluir...". La respuesta corta ya es el resumen.

METODO DE ENSENANZA (metodo socratico, pero conciso):
- Cuando el estudiante dice que no entiende algo, NO le digas "revisa el video" ni "toma notas". EXPLICA tu mismo el contenido usando la transcripcion de <clase_actual>, en pocas oraciones.
- Si la explicacion necesita mas espacio, da el concepto principal en 2-3 oraciones y termina con "quieres que profundice en alguna parte?".
- Despues de explicar (cuando aplique), haz UNA pregunta corta para verificar entendimiento. Una sola.
- Conecta con el proyecto del estudiante cuando ayude — pero no fuerces el ejemplo si alarga la respuesta.

FORMATO:
- Minusculas normales, nunca MAYUSCULAS para enfatizar. Usa **negritas** con moderacion.
- Comillas para nombres de clases o modulos: "fundamentos de IA".
- No uses listas a menos que el contenido sea genuinamente enumerable (pasos, opciones). Si usas lista, max 3 items, cada uno de una linea.
- No uses headers/titulos (##, ###). Es una conversacion, no un articulo.

PROHIBIDO:
- Nunca digas que no tienes acceso al contenido de las clases. Tienes la transcripcion en <clase_actual>.
- Nunca des consejos genericos de autoayuda ("organizate", "ten paciencia"). Explica el contenido.
- Nunca le digas al estudiante que "vuelva a ver el video". Tu eres el recurso.
- Nunca uses MAYUSCULAS para enfatizar. Usa negritas.
- Nunca repitas la pregunta del estudiante antes de responder.
</instrucciones>`);

  return parts.join('\n');
}
