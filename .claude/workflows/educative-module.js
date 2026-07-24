export const meta = {
  name: 'educative-module',
  description: 'Motor educativo E1/E2: genera un módulo de TEMA (herramienta/update de IA) desde un brief — explicación corta + ejercicios con feedback',
  whenToUse: 'Cuando Pablo pida un módulo educativo nuevo sobre una herramienta o update de IA. Args: el educative_brief (objeto con tool_name, what_changed, why_matters, level, business_context, selected_blocks).',
  phases: [
    { title: 'E1 · Explicar', detail: 'la pantalla de contexto corta' },
    { title: 'E2 · Ejercitar', detail: 'ejercicios con feedback que enseña' },
  ],
}

// ============================================================================
// Motor educativo (pipeline E1/E2 del EDUCATIVE_ENGINE_SPEC, prompts de
// PROMPTS_E1_E2.md). Interim pablo-007 (sin API keys): los agentes de este
// workflow SON el LLM del pipeline. Cuando la key de Anthropic viva, estos
// mismos prompts se mueven a un .mjs con lib/llm/client.
//
// E3 (empacar al YAML de practice_beat + validar + sembrar) lo hace
// scripts/simulador/educative/pack-module.mjs con el JSON que devuelve esto.
//
// Regla de Pablo (2026-07-03, al revisar el primer beat): CERO muro de texto.
// La explicación E1 se limita a ~150 palabras (el spec decía ~300 — Pablo lo
// recortó al ver el resultado). El aprendizaje vive en ejercicio + feedback.
// ============================================================================

// Pivot de mercado 2026-07-15: el producto es inglés de EEUU. Manda el glosario
// docs/simulador/front/copy/00_EN_GLOSSARY.md (AI fluency / judgment / practice).
const COPY_RULES = `Itera copy rules (mandatory — all OUTPUT in US business English):
- US business English. Plain, direct, short sentences. No corporate-startup jargon.
- No em dashes. Use a period, comma, or parentheses.
- No acronyms in prose; the only allowed one is AI (always capitalized, never spelled out).
- Second person ("you", "your team"). Sentence case titles, no period on titles.
- No hype, no selling, no empty superlatives.
- Currency explicit in USD, US number format ($1,250.00 USD). US-plausible names and companies.
- Factual precision: if you are not sure of a fact about the tool, do NOT state it; teach the judgment of use (which does not expire) over volatile specs.`

// args puede llegar como objeto {brief}, como el brief directo, o como string
// JSON (según el caller). Normalizamos las tres formas.
const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
const brief = parsedArgs?.brief ?? parsedArgs
if (!brief?.tool_name) {
  throw new Error('Falta el brief: pasa args = { brief: { tool_name, what_changed, why_matters, level, business_context, selected_blocks } }')
}

const E1_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'título de la pantalla de contexto (corto, sin punto final)' },
    body: { type: 'string', description: 'la explicación en markdown ligero (**negritas** para los subtítulos), ~150 palabras TOTAL' },
  },
  required: ['title', 'body'],
}

const E2_SCHEMA = {
  type: 'object',
  properties: {
    exercises: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: {
        type: 'object',
        properties: {
          block_id: { type: 'string', enum: ['categorize_rows', 'ai_output_review'] },
          title: { type: 'string', description: 'consigna visible; NUNCA revela la respuesta' },
          body: { type: 'string', description: 'instrucción corta visible' },
          content: {
            type: 'object',
            description: 'categorize_rows: {actions:[{value,label}], rows:[{id,label}]} · ai_output_review: {segments:[{id,text,flagIfMarked}]}. flagIfMarked ∈ dato_sensible|claim_no_verificado|frase_reutilizable|tono_agresivo',
          },
          evaluates_dimensions: { type: 'array', items: { type: 'string', enum: ['contexto', 'datos', 'ejecucion_ia', 'validacion', 'juicio', 'impacto'] } },
          feedback: {
            type: 'object',
            description: 'rows: {kind:"rows", rows:[{id, correct, why}]} · segments: {kind:"segments", segments:[{id, shouldFlag, why}]}. El why enseña sin regañar.',
          },
        },
        required: ['block_id', 'title', 'body', 'content', 'evaluates_dimensions', 'feedback'],
      },
    },
    cover: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        body: { type: 'string', description: '2-3 frases: sitúa a la persona en una situación concreta con la herramienta' },
      },
      required: ['title', 'body'],
    },
    closing: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        body: { type: 'string', description: '2-3 frases: qué practicaste, qué mirar mañana en tu trabajo real' },
      },
      required: ['title', 'body'],
    },
    principle_headline: { type: 'string', description: 'el principio del módulo en una frase' },
    principle_body: { type: 'string', description: 'una frase que explica el principio' },
  },
  required: ['exercises', 'cover', 'closing', 'principle_headline', 'principle_body'],
}

phase('E1 · Explicar')
const e1 = await agent(
  `Eres autor de contenido educativo de Itera. Escribes la pantalla que le explica a una persona de un equipo no técnico (marketing, ventas, operaciones) una herramienta o capability nueva de inteligencia artificial. No es un curso ni un video. Es una pantalla corta que la deja lista para practicar.

${COPY_RULES}

Escribe la explicación de "${brief.tool_name}" para nivel ${brief.level}.
Contexto del cambio: ${brief.what_changed}
Por qué importa: ${brief.why_matters}
Audiencia: ${brief.business_context}

Estructura en cinco partes MUY cortas con subtítulos en **negrita** (en inglés): **What it is.** / **What changed.** / **What it can do.** / **What it cannot do.** / **Why it matters.** (cierra anticipando que va a practicar).

LÍMITE DURO: ~150 palabras en total (regla de Pablo: cero muro de texto; el aprendizaje vive en los ejercicios, no aquí). No reveles respuestas de ejercicios.`,
  { label: 'E1:explicar', phase: 'E1 · Explicar', schema: E1_SCHEMA, effort: 'high' },
)

phase('E2 · Ejercitar')
const e2 = await agent(
  `Eres autor de ejercicios de Itera. Diseñas práctica activa corta que ENSEÑA con feedback, no que mide bajo presión. Regla anti-spoiler dura: el texto VISIBLE antes de responder (títulos, body, labels, segments) nunca revela ni evalúa la respuesta correcta. La respuesta de referencia y el porqué van SIEMPRE en feedback, que se muestra después de responder.

${COPY_RULES}

Tema: "${brief.tool_name}". Nivel: ${brief.level}. Audiencia: ${brief.business_context}.
Explicación ya escrita (E1, tu material de partida): ${e1.body}

Genera ${brief.selected_blocks.length} ejercicios, uno por bloque, en este orden: ${brief.selected_blocks.join(', ')}.
También la portada (cover: sitúa a la persona en una situación CONCRETA y con nombre propio, como los casos del operativo), el cierre (closing: qué practicaste + qué mirar mañana) y el principio del módulo (una frase).

Forma de cada bloque:
- categorize_rows: content = { actions: [{value, label}] (3 acciones máx), rows: [{id, label}] (4-6 filas) }; feedback = { kind: "rows", rows: [{id, correct: <value de la acción correcta>, why}] }.
- ai_output_review: content = { segments: [{id, text, flagIfMarked}] } donde text es una frase de un output de IA (4 segments; mezcla problemáticos y correctos) y flagIfMarked ∈ dato_sensible|claim_no_verificado|frase_reutilizable; feedback = { kind: "segments", segments: [{id, shouldFlag, why}] }.

Cada ejercicio = una decisión real de usar la herramienta con criterio (qué datos das, qué revisas, cómo lo pides, qué decides). El feedback enseña el porqué en tono que no regaña. Entre todos cubre varias de las 6 dimensiones (contexto, datos, ejecucion_ia, validacion, juicio, impacto).`,
  { label: 'E2:ejercitar', phase: 'E2 · Ejercitar', schema: E2_SCHEMA, effort: 'high' },
)

return {
  brief_tool: brief.tool_name,
  level: brief.level,
  e1_reading: e1,
  cover: e2.cover,
  closing: e2.closing,
  principle: { headline: e2.principle_headline, body: e2.principle_body },
  exercises: e2.exercises,
}
