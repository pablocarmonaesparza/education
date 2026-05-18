import type { Step } from './ExperimentLesson';

/**
 * Lesson 32 — Introducción a ChatGPT (DB id 32, concept_id C-017).
 * Audience: people who have never used ChatGPT.
 * Structure: 3 beats narrativos (no 1:1). Cada beat agrupa 2–3 slides
 * de concepto y cierra con 1–2 ejercicios de retención.
 */
export const LESSON_32_STEPS: Step[] = [
  /* ═══════════════════════════════════════════════════════════
     BEAT 1 — La interfaz (3 slides de historia + 1 check)
     ═══════════════════════════════════════════════════════════ */

  /* 1. entras por primera vez */
  {
    kind: 'concept',
    title: 'el primer momento',
    body:
      'Abres chatgpt.com por primera vez. Te pide un correo, creas la cuenta, y entras. Te recibe una pantalla casi vacía con una caja de texto en el centro.',
  },
  /* 2. descubres cómo se usa */
  {
    kind: 'concept',
    title: 'funciona como un chat',
    body:
      'Escribes algo en la caja y te responde justo abajo, como cualquier chat. Puedes seguir respondiéndole en el mismo hilo y se acuerda de lo que ya hablaron.',
  },
  /* 3. el vocabulario llega como etiqueta */
  {
    kind: 'concept',
    title: 'mensajes y conversaciones',
    body:
      'Cada cosa que escriben tú y él se llama un mensaje. Un hilo completo es una conversación. Si abres una nueva, empieza de cero: no se acuerda de lo que hablaron en la anterior.',
  },
  /* 4. check del beat 1 */
  {
    kind: 'mcq',
    prompt: '¿Cuál de estas frases describe mejor cómo funciona ChatGPT?',
    options: [
      { id: 0, text: 'Es un buscador: escribes una palabra y te muestra páginas.' },
      { id: 1, text: 'Es un chat: escribes mensajes, responde, y dentro de una conversación se acuerda de lo que hablaron.' },
      { id: 2, text: 'Es una app que lee por ti y te hace un resumen automático.' },
      { id: 3, text: 'Es un asistente de voz que solo funciona hablando.' },
    ],
    correctId: 1,
    explanation:
      'Eso es. Una conversación por hilo, y dentro del hilo se acuerda del contexto. Si abres una nueva, empieza desde cero.',
  },

  /* ═══════════════════════════════════════════════════════════
     BEAT 2 — Los modelos (2 slides de historia + 1 check)
     ═══════════════════════════════════════════════════════════ */

  /* 5. descubres el menú */
  {
    kind: 'concept',
    title: 'arriba hay un menú',
    body:
      'Después de un rato notas que arriba del todo dice algo como "GPT-4o" o "GPT-4o mini". Son los modelos: distintos cerebros que ChatGPT puede usar para responderte.',
  },
  /* 6. razonas para qué sirven */
  {
    kind: 'concept',
    title: 'no todos son iguales',
    body:
      'Unos son ligeros y responden muy rápido, ideales para preguntas del día a día. Otros se toman más tiempo y razonan mejor, buenos para tareas complejas. Algunos además entienden imágenes o voz. Tú eliges según lo que necesites.',
  },
  /* 7. check del beat 2 */
  {
    kind: 'tap-match',
    prompt: 'Empareja cada situación con el modelo que conviene.',
    pairs: [
      { term: 'Pregunta rápida del día a día', def: 'Un modelo ligero y veloz.' },
      { term: 'Análisis largo o razonamiento complejo', def: 'Un modelo que piensa más tiempo.' },
      { term: 'Trabajar con una foto o una nota de voz', def: 'Un modelo que entiende varios formatos.' },
      { term: 'Resolver un problema paso a paso', def: 'Un modelo de pensamiento profundo.' },
    ],
    explanation:
      'No tienes que memorizar nombres: ligero para lo simple, potente para lo complejo, multimodal para imágenes o voz.',
  },

  /* ═══════════════════════════════════════════════════════════
     BEAT 3 — Conversación efectiva (3 slides de historia + 2 checks)
     ═══════════════════════════════════════════════════════════ */

  /* 8. María falla */
  {
    kind: 'concept',
    title: 'la primera prueba de María',
    body:
      'María quiere pedirle a su jefe una semana libre para irse a Hawaii. Abre ChatGPT y escribe "ayúdame con un correo". La respuesta sale genérica, vacía, nada que sirva para convencer a nadie.',
  },
  /* 9. razonamiento — por qué falló */
  {
    kind: 'concept',
    title: 'el problema no era ChatGPT',
    body:
      'La pregunta de María no decía qué correo, a quién iba dirigido, ni para qué. Sin esa información, ChatGPT no puede adivinar lo que tiene en la cabeza y responde algo vago.',
  },
  /* 10. la solución + nombre */
  {
    kind: 'concept',
    title: 'María lo reescribe con contexto',
    body:
      'María escribe de nuevo: "Soy asistente administrativa. Escríbele un correo formal pero cálido a mi jefe Roberto pidiéndole la semana del 15 al 22 libre para celebrar un cumpleaños especial en Hawaii". La respuesta cambia por completo. A darle esa información se le llama dar contexto.',
  },
  /* 11. check 1 del beat 3 — comparar prompts */
  {
    kind: 'mcq',
    prompt: '¿Cuál de los dos mensajes le dará a María un mejor correo?',
    options: [
      { id: 0, text: '"Ayúdame con un correo."' },
      { id: 1, text: '"Soy María, asistente administrativa. Escríbele un correo formal pero cálido a mi jefe Roberto pidiéndole la semana del 15 al 22 libre para un viaje especial de cumpleaños a Hawaii."' },
      { id: 2, text: '"Correo, por favor."' },
      { id: 3, text: '"Necesito ayuda urgente."' },
    ],
    correctId: 1,
    explanation:
      'El segundo. Con contexto —quién eres, a quién va, qué tono, qué motivo— ChatGPT entrega algo casi listo para enviar.',
  },
  /* 12. check 2 del beat 3 — receta ordenada */
  {
    kind: 'order-steps',
    prompt: 'Ordena los cuatro datos que conviene darle en cualquier petición.',
    steps: [
      'Quién eres tú.',
      'Qué necesitas que haga.',
      'Para quién es el resultado.',
      'Qué tono o estilo quieres.',
    ],
    correctOrder: [0, 1, 2, 3],
    explanation:
      'Esa es la receta. No tiene que ser larga: una o dos frases con esos cuatro datos bastan para que la respuesta sea útil.',
  },

  /* ═══════════════════════════════════════════════════════════
     CIERRE
     ═══════════════════════════════════════════════════════════ */

  /* 13. resolución */
  {
    kind: 'celebration',
    emoji: '💬',
    title: 'ya sabes empezar',
    body:
      'María envía su correo y le aprueban la semana. Tú ya sabes qué es la caja, cómo elegir un modelo y cómo darle contexto al primer mensaje.',
  },
];
