/* ───────────────────────────────────────────────────────────
   Demo Lesson Data
   Types + content for the interactive exercise demo at /demo.
   Theme: "construye tu primer chatbot con ia"
   ─────────────────────────────────────────────────────────── */

// ── Types ──

export type ExerciseType =
  | 'multiple-choice'
  | 'fill-in-blank'
  | 'reorder'
  | 'matching-pairs';

interface BaseExercise {
  id: string;
  type: ExerciseType;
  /** ~140 char concept intro shown before the exercise (Mimo pattern). */
  conceptIntro: string;
  xpReward: number;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple-choice';
  prompt: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
}

export interface FillInBlankExercise extends BaseExercise {
  type: 'fill-in-blank';
  /** Lines of code. Use `___BLANK_0___`, `___BLANK_1___` etc. for blanks. */
  codeLines: string[];
  blanks: { id: string; correctAnswer: string }[];
  /** Extra distractor words for the word bank. */
  distractors: string[];
  language: string;
  explanation: string;
}

export interface ReorderExercise extends BaseExercise {
  type: 'reorder';
  prompt: string;
  items: { id: string; text: string }[];
  correctOrder: string[];
  explanation: string;
}

export interface MatchingPairsExercise extends BaseExercise {
  type: 'matching-pairs';
  prompt: string;
  pairs: { id: string; left: string; right: string }[];
  explanation: string;
}

export type Exercise =
  | MultipleChoiceExercise
  | FillInBlankExercise
  | ReorderExercise
  | MatchingPairsExercise;

export interface LessonData {
  id: string;
  title: string;
  description: string;
  topic: string;
  estimatedMinutes: number;
  exercises: Exercise[];
}

// ── Lesson Content ──

export const demoLesson: LessonData = {
  id: 'demo-chatbot-101',
  title: 'construye tu primer chatbot',
  description:
    'Aprende los conceptos clave para crear un chatbot inteligente: system prompts, temperatura, y llamadas a la API.',
  topic: 'chatbots con ia',
  estimatedMinutes: 3,
  exercises: [
    // ─── 1. Multiple Choice: System Prompts ───
    {
      id: 'mc-system-prompt',
      type: 'multiple-choice',
      conceptIntro:
        'Un system prompt es la instruccion inicial que le das al modelo de IA. Define su personalidad, reglas y como debe responder.',
      xpReward: 10,
      prompt:
        'Que funcion cumple el system prompt en un chatbot con IA?',
      options: [
        {
          id: 'a',
          text: 'Genera la interfaz visual del chatbot automaticamente.',
        },
        {
          id: 'b',
          text: 'Define la personalidad, reglas y comportamiento del modelo.',
        },
        {
          id: 'c',
          text: 'Conecta el chatbot a la base de datos del usuario.',
        },
        {
          id: 'd',
          text: 'Entrena el modelo con nuevos datos cada vez que se usa.',
        },
      ],
      correctId: 'b',
      explanation:
        'El system prompt establece las reglas del juego: le dice al modelo quien es, como debe responder y que limites tiene. Es la base de todo chatbot.',
    },

    // ─── 2. Fill-in-Blank: Write a System Prompt ───
    {
      id: 'fib-system-prompt',
      type: 'fill-in-blank',
      conceptIntro:
        'Los system prompts se escriben en lenguaje natural. Debes definir el rol del asistente y sus restricciones de forma clara.',
      xpReward: 15,
      codeLines: [
        'const systemPrompt = {',
        '  role: "___BLANK_0___",',
        '  content: `Eres un asistente de ___BLANK_1___.',
        '  Responde siempre en espanol.',
        '  Si no sabes la respuesta, di "no tengo',
        '  esa informacion".`',
        '};',
      ],
      blanks: [
        { id: 'BLANK_0', correctAnswer: 'system' },
        { id: 'BLANK_1', correctAnswer: 'soporte tecnico' },
      ],
      distractors: ['user', 'assistant', 'ventas', 'marketing'],
      language: 'javascript',
      explanation:
        'El role "system" indica que esta instruccion es para configurar al modelo, no es un mensaje del usuario. El contenido define la especialidad del asistente.',
    },

    // ─── 3. Reorder: Steps to Build a Chatbot ───
    {
      id: 'reorder-steps',
      type: 'reorder',
      conceptIntro:
        'Construir un chatbot sigue un proceso logico. El orden importa: cada paso depende del anterior.',
      xpReward: 15,
      prompt: 'Ordena los pasos para construir un chatbot con IA:',
      items: [
        { id: 'step-1', text: 'Definir la personalidad y reglas del bot' },
        { id: 'step-2', text: 'Escribir el system prompt' },
        { id: 'step-3', text: 'Conectar con la API del modelo' },
        { id: 'step-4', text: 'Probar con conversaciones reales' },
        { id: 'step-5', text: 'Desplegar y monitorear respuestas' },
      ],
      correctOrder: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'],
      explanation:
        'Primero defines que quieres que haga el bot, luego lo escribes como system prompt, conectas la API, pruebas y finalmente lo despliegas.',
    },

    // ─── 4. Multiple Choice: Temperature ───
    {
      id: 'mc-temperature',
      type: 'multiple-choice',
      conceptIntro:
        'La temperatura controla la "creatividad" del modelo. Valores bajos = respuestas predecibles. Valores altos = respuestas mas variadas.',
      xpReward: 10,
      prompt:
        'Que pasa si configuras la temperatura del modelo a 0?',
      options: [
        {
          id: 'a',
          text: 'El modelo deja de funcionar y retorna un error.',
        },
        {
          id: 'b',
          text: 'Las respuestas son siempre las mas probables y consistentes.',
        },
        {
          id: 'c',
          text: 'El modelo genera respuestas aleatorias e impredecibles.',
        },
        {
          id: 'd',
          text: 'El tiempo de respuesta se reduce a cero milisegundos.',
        },
      ],
      correctId: 'b',
      explanation:
        'Con temperatura 0, el modelo siempre elige el token mas probable. Ideal para tareas donde necesitas respuestas consistentes como soporte tecnico o FAQs.',
    },

    // ─── 5. Fill-in-Blank: API Call ───
    {
      id: 'fib-api-call',
      type: 'fill-in-blank',
      conceptIntro:
        'Para usar un modelo de IA necesitas hacer una llamada a su API. Los parametros clave son el modelo, los mensajes y los tokens maximos.',
      xpReward: 15,
      codeLines: [
        'const response = await anthropic.messages.create({',
        '  model: "___BLANK_0___",',
        '  max_tokens: ___BLANK_1___,',
        '  messages: [',
        '    { role: "user", content: pregunta }',
        '  ]',
        '});',
      ],
      blanks: [
        { id: 'BLANK_0', correctAnswer: 'claude-sonnet-4-20250514' },
        { id: 'BLANK_1', correctAnswer: '1024' },
      ],
      distractors: ['gpt-4', 'davinci-003', '256', '99999'],
      language: 'javascript',
      explanation:
        'El modelo "claude-sonnet-4-20250514" es el modelo de Anthropic. max_tokens limita la longitud de la respuesta — 1024 tokens es un buen punto de partida para respuestas medianas.',
    },

    // ─── 6. Matching Pairs: AI Concepts ───
    {
      id: 'matching-concepts',
      type: 'matching-pairs',
      conceptIntro:
        'Al construir chatbots avanzados encontraras estos conceptos clave. Cada uno resuelve un problema especifico.',
      xpReward: 20,
      prompt: 'Conecta cada concepto con su definicion:',
      pairs: [
        {
          id: 'pair-1',
          left: 'RAG',
          right: 'Buscar info externa antes de responder',
        },
        {
          id: 'pair-2',
          left: 'Embeddings',
          right: 'Representar texto como vectores numericos',
        },
        {
          id: 'pair-3',
          left: 'Context Window',
          right: 'Cantidad maxima de texto que el modelo puede procesar',
        },
        {
          id: 'pair-4',
          left: 'Token',
          right: 'Unidad minima de texto que procesa el modelo',
        },
      ],
      explanation:
        'Estos conceptos son fundamentales para construir chatbots que puedan acceder a informacion actualizada y manejar conversaciones largas.',
    },
  ],
};
