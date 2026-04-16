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
 * Devuelve los steps de la lección si están tipados, o null si aún no.
 */
export function getLessonSteps(lectureId: number): Step[] | null {
  return LESSON_REGISTRY[lectureId] ?? null;
}

/**
 * Devuelve SIEMPRE un array de steps para renderizar. Si la lección tiene
 * contenido tipado en el registry, regresa esos steps. Si no, regresa un
 * placeholder de 2 slides (concept + celebration) para que la UI siempre
 * se vea consistente y el usuario pueda marcar la lección como completada.
 */
export function getLessonStepsOrPlaceholder(
  lectureId: number | undefined,
  title: string,
): Step[] {
  if (typeof lectureId === 'number' && LESSON_REGISTRY[lectureId]) {
    return LESSON_REGISTRY[lectureId];
  }
  return [
    {
      kind: 'concept',
      title: title.toLowerCase(),
      body:
        'Estamos preparando el contenido interactivo de esta lección. ' +
        'Mientras tanto, puedes marcarla como completada y continuar con la siguiente.',
    },
    {
      kind: 'celebration',
      emoji: '🚧',
      title: 'próximamente',
      body: 'Pronto tendrás aquí los ejercicios de esta clase. ¡Sigue avanzando!',
      section: 'en construcción',
    },
  ];
}
