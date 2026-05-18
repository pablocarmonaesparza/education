import type { Step } from './ExperimentLesson';

/**
 * Scenario-Based Learning lesson on Supabase RLS.
 * Thread: built an app called Chispa, a user sees others' messages, fix it with RLS.
 */
export const SUPABASE_STEPS: Step[] = [
  /* 1. hook */
  {
    kind: 'concept',
    title: 'la situación',
    body:
      'Construiste una aplicación de mensajes llamada Chispa. Ana, una de tus usuarias, te escribe: está viendo mensajes que no son suyos.',
  },
  /* 2. diagnóstico */
  {
    kind: 'mcq',
    prompt: 'El inicio de sesión funciona. ¿Por qué Ana ve mensajes ajenos?',
    options: [
      { id: 0, text: 'Su contraseña es débil.' },
      { id: 1, text: 'La tabla devuelve todas las filas sin filtrar por usuario.' },
      { id: 2, text: 'El servidor está caído.' },
      { id: 3, text: 'Ana no inició sesión.' },
    ],
    correctId: 1,
    explanation:
      'Exacto. Supabase sabe quién es Ana, pero la tabla no usa esa información. Eso lo arregla RLS.',
  },

  /* 3. qué es RLS */
  {
    kind: 'concept',
    title: 'qué es rls',
    body:
      'RLS (Row Level Security) es como un portero dentro de tu tabla: revisa cada fila y solo deja pasar las que le pertenecen al usuario que consulta.',
  },
  /* 4. afirmación central */
  {
    kind: 'true-false',
    prompt: '¿Verdadero o falso?',
    statement:
      'Con RLS, dos usuarios pueden consultar la misma tabla y cada uno ver solo sus propias filas.',
    answer: true,
    explanation:
      'Verdadero. Una sola tabla, resultados distintos según quién consulta.',
  },

  /* 5. default deny */
  {
    kind: 'concept',
    title: 'el primer paso',
    body:
      'Activas RLS en la tabla. Refrescas la app y no se ve nada, ni siquiera lo tuyo. Es normal: RLS cierra todo hasta que escribas las reglas.',
  },
  /* 6. confirmar default deny */
  {
    kind: 'true-false',
    prompt: '¿Verdadero o falso?',
    statement:
      'Al activar RLS, por defecto nadie puede leer nada hasta que escribas una regla.',
    answer: true,
    explanation:
      'Verdadero. Primero se cierra todo, después tú abres con intención.',
  },

  /* 7. policies */
  {
    kind: 'concept',
    title: 'las reglas se llaman policies',
    body:
      'Cada regla de RLS es una "policy". Se escribe en SQL y dice quién puede hacer qué.',
  },
  /* 8. vocabulario */
  {
    kind: 'fill-blank',
    prompt: 'Completa.',
    sentenceBefore: 'Las reglas de RLS se llaman ',
    sentenceAfter: '.',
    tokens: ['triggers', 'policies', 'functions', 'views'],
    correctTokenIndex: 1,
    explanation: 'Policies. Una por cada permiso que quieras dar.',
  },

  /* 9. flujo */
  {
    kind: 'concept-visual',
    title: 'así va cada consulta',
    body:
      'Ana abre la app → Supabase la identifica → revisa las policies → le manda solo sus filas. Todo en milisegundos.',
  },

  /* 10. acciones separadas */
  {
    kind: 'concept',
    title: 'una policy por acción',
    body:
      'Leer, crear, editar y borrar son acciones separadas. Cada una necesita su propia policy.',
  },
  /* 11. mapear */
  {
    kind: 'tap-match',
    prompt: 'Relaciona cada acción con lo que hace.',
    pairs: [
      { term: 'SELECT', def: 'Leer filas.' },
      { term: 'INSERT', def: 'Crear filas nuevas.' },
      { term: 'UPDATE', def: 'Modificar filas.' },
      { term: 'DELETE', def: 'Borrar filas.' },
    ],
    explanation: 'Cuatro acciones, cuatro policies posibles. Hoy escribes la de SELECT.',
  },

  /* 12. auth.uid() */
  {
    kind: 'concept',
    title: 'la pieza clave',
    body:
      'auth.uid() te dice quién está consultando. Si lo comparas con el dueño de la fila, sabes si la fila es suya.',
  },
  /* 13. policy real */
  {
    kind: 'code-completion',
    prompt: 'Completa la policy para que cada usuario vea solo sus mensajes.',
    codeBefore: 'create policy "propios" on messages\n  for select using (',
    codeAfter: ' = user_id);',
    tokens: ['auth.uid()', 'current_user', 'session.id', 'request.user'],
    correctTokenIndex: 0,
    explanation:
      'auth.uid(). La policy dice: devuelve solo filas donde el usuario que consulta sea el dueño.',
  },

  /* 14. orden */
  {
    kind: 'concept',
    title: 'el orden correcto',
    body:
      'Crear tabla → activar RLS → escribir la policy. Si te saltas el paso 2, la policy no protege nada.',
  },
  /* 15. fijar orden */
  {
    kind: 'order-steps',
    prompt: 'Ordena los pasos.',
    steps: [
      'Crear la tabla.',
      'Activar RLS.',
      'Escribir la policy.',
      'La app consulta segura.',
    ],
    correctOrder: [0, 1, 2, 3],
    explanation: 'Sin activar RLS, la policy es decorativa.',
  },

  /* 16. celebration */
  {
    kind: 'celebration',
    emoji: '🔐',
    title: 'ya entiendes rls',
    body:
      'Ana ya solo ve sus mensajes. Sabes el patrón: activar, policy, auth.uid(). Lo aplicas a cualquier tabla.',
  },

  /* 17. reto */
  {
    kind: 'ai-prompt',
    prompt: 'un reto nuevo',
    instructions:
      'Tu próxima app tiene una tabla de salas privadas con una columna owner_id. Escribe en lenguaje natural una policy que solo deje al dueño borrar su sala.',
    placeholder:
      'Por ejemplo: en la tabla de salas, para borrar, solo permitir si el usuario es el owner...',
  },
];
