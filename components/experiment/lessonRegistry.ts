import type { Step } from './ExperimentLesson';
import { LESSON_32_STEPS } from './lesson32Steps';

/**
 * Mapa lecture_id (education_system.id) → pasos de la lección interactiva.
 *
 * Hoy solo la Lección 32 ("Introducción a ChatGPT") tiene contenido tipado
 * con el algoritmo Miyagi. Conforme vayamos escribiendo más lecciones, solo
 * agregamos una línea a este registry.
 */
export const LESSON_REGISTRY: Record<number, Step[]> = {
  32: LESSON_32_STEPS,
};

/**
 * Devuelve los steps de la lección, o null si aún no está escrita.
 */
export function getLessonSteps(lectureId: number): Step[] | null {
  return LESSON_REGISTRY[lectureId] ?? null;
}
