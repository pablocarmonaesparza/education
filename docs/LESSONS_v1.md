# Lecciones Itera — v2 (100 lecciones, MVP post-intro-drop)

> Listado congelado de las 100 lecciones del curso, divididas en 10 secciones.
> Fuente de verdad para el seed de `lectures` y su metadata pedagógica
> (`learning_objective`, `bloom_verb`, `cognitive_route`, `concept_name`,
> `narrative_arc`, `scenario_character`).
>
> **No editar este archivo para cambiar el outline del curso.** Las
> modificaciones al listado pasan por conversación con Pablo y se replican
> aquí después, no al revés.
>
> **Versión:** 2 — Post feedback de render real de v1:
>  - Eliminada la sección "Introducción" (meta-lecciones condescendían).
>  - Sección 7 dividida en "API" (7) + "MCP y Skills" (8) — la más
>    densa del outline original y con dos universos distintos adentro.
>  - +2 lecciones nuevas:
>    - Sec 2 Asistentes L8: *"Prompts adaptados por asistente"*
>    - Sec 9 Vibe coding L7: *"Revisar código generado antes de aceptar"*
>  - Títulos con gramática natural del español (regla 1 METODOLOGIA v0.11).

---

## Distribución (total 100)

| # | Sección | Lecciones |
|---|---|---|
| 1 | Fundamentos | 12 |
| 2 | Asistentes | 10 |
| 3 | Contenido | 10 |
| 4 | Automatización | 12 |
| 5 | Bases de datos | 12 |
| 6 | API | 7 |
| 7 | MCP y Skills | 8 |
| 8 | Agentes | 10 |
| 9 | Vibe coding | 9 |
| 10 | Implementación | 10 |
| | **Total** | **100** |

---

## 1. Fundamentos (12)

1. Qué es AI
2. Qué es un LLM
3. Cómo aprende un modelo
4. Qué son los tokens
5. Ventana de contexto
6. Alucinación: cuándo el modelo inventa
7. Los 4 ingredientes del prompt
8. Iterar un prompt
9. Verificar lo que dice el modelo
10. Cuándo usar AI y cuándo no
11. Gratis vs pagado: qué cambia
12. El bucle del usuario AI-literate

## 2. Asistentes (10)

1. El mapa de modelos en 2026
2. ChatGPT en profundidad
3. Claude en profundidad
4. Gemini y Google Workspace
5. Perplexity: búsqueda con AI
6. Deep research: investigar con AI
7. Customizar: GPTs y Projects
8. **Prompts adaptados por asistente** *(nueva en v2)*
9. Qué modelo elegir y cuándo
10. Tu stack personal de AI

## 3. Contenido (10)

1. Imagen con AI: el primer prompt
2. Flux: imagen profesional
3. Nano Banana: editar con contexto
4. Prompts visuales: el lenguaje de la imagen
5. Generar video: panorama 2026
6. Seedance: el estándar de calidad actual
7. Otros video models: Kling, Veo, Sora
8. Voz con ElevenLabs
9. Audio y música generativa
10. Combinar todo: workflows reales

## 4. Automatización (12)

1. Automatizar con AI vs sin AI
2. Claude Code Routines
3. Cron y schedulers básicos
4. MCP schedulers
5. n8n: tu primer flujo
6. Make: alternativa visual
7. Triggers: qué dispara un flujo
8. Conectar Slack, email, WhatsApp
9. Browserbase: automatizar el browser
10. Ética y derechos en contenido generado
11. Monitorear una automatización
12. Tu primer bot que trabaja solo

## 5. Bases de datos (12)

1. Qué es una base de datos
2. Notion como base de datos
3. Airtable
4. Supabase y postgres moderno
5. SQL básico
6. CRMs: HubSpot y Salesforce
7. Embeddings: texto como vector
8. RAG: retrieval + generation
9. Seguridad: row level security
10. Manejar API keys y secretos
11. Evitar data leakage
12. Tu primer datastore conectado a AI

## 6. API (7) *— dividida de la ex-sec 7*

1. Qué es una API
2. Llamar a un modelo desde código
3. CLIs de AI: Claude, Gemini, Ollama
4. Manejar API keys
5. Rate limits y costos
6. Errores y fallbacks
7. Elegir modelo para tu app

## 7. MCP y Skills (8) *— dividida de la ex-sec 7*

1. Qué es MCP
2. Tu primer MCP server
3. Claude Agent SDK
4. Anthropic Skills
5. Apify API: scraping programático
6. Firecrawl: extraer web con AI
7. Prompt injection y guardrails
8. Tu primera integración real

## 8. Agentes (10)

1. Asistente vs agente
2. Tool use: cómo un modelo usa herramientas
3. ReAct loop: razonar y actuar
4. Browser agents
5. Chatbots y voice agents
6. Memoria persistente
7. OpenClaw: tu agente local
8. Multi-agente y A2A protocol
9. Orquestación de equipos de bots
10. Tu primer agente para tu negocio

## 9. Vibe coding (9)

1. Qué es vibe coding
2. Claude Code
3. Cursor
4. Codex CLI
5. Git y GitHub: primeros pasos
6. Iterar sobre código con AI
7. **Revisar código generado antes de aceptar** *(nueva en v2)*
8. Whisper y transcripción con AI
9. Tu primer mini-app

## 10. Implementación (10)

1. De prototipo a producto
2. Deploy a producción
3. Monitoreo y logs
4. Fallbacks cuando el modelo falla
5. Costos operativos reales
6. Primeros usuarios: a quién y cómo
7. Pricing para LATAM
8. Cold email con AI
9. Iterar con feedback real
10. Despedida y siguientes pasos

---

## Cambios estructurales desde v1

1. **Introducción eliminada.** Las 2 meta-lecciones ("Cómo funciona el curso", "Qué vas a poder hacer") tendían a condescender porque el misconception que exploraban era demasiado evidente (cursos = videos). Reemplazadas por: el formato se descubre usándolo desde la primera lección real (L1.1 Qué es AI).

2. **Sec 7 dividida.** La sección "APIs, MCPs y Skills" (15 lec) era la más larga del outline y mezclaba dos universos distintos: APIs genéricas (cómo invocar modelos desde código, rate limits, fallbacks) y el stack nuevo de 2026 (MCP, Agent SDK, Skills, prompt injection). Dividida en dos secciones de tamaño balanceado.

3. **+2 lecturas nuevas.** Llenan gaps concretos:
   - *"Prompts adaptados por asistente"* (sec 2): el alumno elige un modelo (L2.9 Qué modelo elegir) pero no sabe cómo modular el prompt según quién lo reciba. Gap observable: mismo prompt literal en ChatGPT / Claude / Gemini produce calidad muy distinta.
   - *"Revisar código generado antes de aceptar"* (sec 9): discipline crítica. El gap entre *"la AI escribió código"* y *"yo entiendo y confío en este código"* determina si rompes o no rompes producción. Sin esta lección, los alumnos aceptan diffs sin leerlos.

## Pendiente para workshop posterior

Cada lección ya tiene los 6 campos pedagógicos (`learning_objective`, `bloom_verb`, `cognitive_route`, `concept_name`, `narrative_arc`, `scenario_character`) llenos en DB. Las 2 lecturas nuevas también. Lo siguiente es generar los 10 slides por lección siguiendo METODOLOGIA v0.11 (1000 slides totales, empezando por Fundamentos).
