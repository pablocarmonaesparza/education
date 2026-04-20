# Lecciones Itera — v1 (100 lecciones MVP)

> Listado congelado de las 100 lecciones del curso, divididas en 10 secciones.
> Este archivo es la fuente de verdad para el seed de `lectures` cuando se
> diseñe la metadata por lección (learning_objective, bloom_verb, cognitive_route).
>
> **No editar este archivo para cambiar el outline del curso.** Las modificaciones
> al listado de lecciones deben pasar por conversación con Pablo y replicarse aquí
> después, no al revés.
>
> **Versión:** 1 — primera propuesta firmada post-pivote a 10 secciones × 100 lecciones.
> Incluye los 5 ajustes quirúrgicos acordados (consolidar duplicados de deploy /
> rate limits / API keys, merge multi-agente + orquestación, merge modos avanzados
> + customizar en asistentes, eliminar Apify duplicado de automatización, apertura
> de 5 slots para contenido que faltaba).

---

## Distribución (total 100)

| # | Sección | Lecciones |
|---|---|---|
| 1 | introducción | 2 |
| 2 | fundamentos | 12 |
| 3 | asistentes | 9 |
| 4 | contenido | 10 |
| 5 | automatización | 12 |
| 6 | bases de datos | 12 |
| 7 | APIs, MCPs y skills | 15 |
| 8 | agentes | 10 |
| 9 | vibe coding | 8 |
| 10 | implementación | 10 |
| | **Total** | **100** |

---

## 1. introducción (2)

1. cómo funciona el curso
2. qué vas a poder hacer

## 2. fundamentos (12)

1. qué es AI
2. qué es un LLM
3. cómo aprende un modelo
4. qué son los tokens
5. ventana de contexto
6. alucinación: cuándo el modelo inventa
7. los 4 ingredientes del prompt
8. iterar un prompt
9. verificar lo que dice el modelo
10. cuándo usar AI y cuándo no
11. gratis vs pagado: qué cambia
12. el bucle del usuario AI-literate

## 3. asistentes (9)

1. el mapa de modelos en 2026
2. ChatGPT en profundidad
3. Claude en profundidad
4. Gemini y Google Workspace
5. Perplexity: búsqueda con AI
6. deep research: investigar con AI
7. customizar: GPTs y Projects
8. qué modelo elegir y cuándo
9. tu stack personal de AI

## 4. contenido (10)

1. imagen con AI: el primer prompt
2. Flux: imagen profesional
3. Nano Banana: editar con contexto
4. prompts visuales: el lenguaje de la imagen
5. generar video: panorama 2026
6. Seedance: el estándar de calidad actual
7. otros video models: Kling, Veo, Sora
8. voz con ElevenLabs
9. audio y música generativa
10. combinar todo: workflows reales

## 5. automatización (12)

1. automatizar con AI vs sin AI
2. Claude Code Routines
3. cron y schedulers básicos
4. MCP schedulers
5. n8n: tu primer flujo
6. Make: alternativa visual
7. triggers: qué dispara un flujo
8. conectar Slack, email, WhatsApp
9. Browserbase: automatizar el browser
10. ética y derechos en contenido generado
11. monitorear una automatización
12. tu primer bot que trabaja solo

## 6. bases de datos (12) — incluye seguridad de datos

1. qué es una base de datos
2. Notion como base de datos
3. Airtable
4. Supabase y postgres moderno
5. SQL básico
6. CRMs: HubSpot y Salesforce
7. embeddings: texto como vector
8. RAG: retrieval + generation
9. seguridad: row level security
10. manejar API keys y secretos
11. evitar data leakage
12. tu primer datastore conectado a AI

## 7. APIs, MCPs y skills (15)

1. qué es una API
2. llamar a un modelo desde código
3. CLIs de AI: Claude, Gemini, Ollama
4. manejar API keys
5. rate limits y costos
6. errores y fallbacks
7. qué es MCP
8. tu primer MCP server
9. Claude Agent SDK
10. Anthropic Skills
11. Apify API: scraping programático
12. Firecrawl: extraer web con AI
13. prompt injection y guardrails
14. elegir modelo para tu app
15. tu primera integración real

## 8. agentes (10) — incluye orquestadores

1. asistente vs agente
2. tool use: cómo un modelo usa herramientas
3. ReAct loop: razonar y actuar
4. browser agents
5. chatbots y voice agents
6. memoria persistente
7. OpenClaw: tu agente local
8. multi-agente y A2A protocol
9. orquestación de equipos de bots
10. tu primer agente para tu negocio

## 9. vibe coding (8)

1. qué es vibe coding
2. Claude Code
3. Cursor
4. Codex CLI
5. git y GitHub: primeros pasos
6. iterar sobre código con AI
7. Whisper y transcripción con AI
8. tu primer mini-app

## 10. implementación (10) — absorbe go-to-market, última es despedida

1. de prototipo a producto
2. deploy a producción
3. monitoreo y logs
4. fallbacks cuando el modelo falla
5. costos operativos reales
6. primeros usuarios: a quién y cómo
7. pricing para LATAM
8. cold email con AI
9. iterar con feedback real
10. despedida y siguientes pasos

---

## Notas de las 5 consolidaciones aplicadas

1. **Deploy consolidado.** Vivía en sec 9 (vibe coding) y sec 10 (implementación). Ahora solo en sec 10. Liberó 1 slot en vibe coding.
2. **Rate limits y costos consolidado.** Vivía en sec 7 (APIs) y sec 10 (implementación). Ahora solo en sec 10 como *"costos operativos reales"*. Liberó 1 slot en APIs.
3. **Modos avanzados + GPTs/Projects merged** en asistentes. Antes eran 2 lecciones superficiales; ahora "deep research" profundiza y "customizar: GPTs y Projects" cubre ambos productos. Liberó 1 slot.
4. **Multi-agente + orquestación** se mantienen separados pero con propósito distinto: L8 cubre el protocolo A2A (técnico), L9 cubre patrones de orquestación (cuándo/cómo). Antes se traslapaban, ahora son complementarios.
5. **Apify duplicado removido** de sec 5. Queda solo en sec 7 (APIs) como integración programática. Sec 5 (automatización) gana slot para *"ética y derechos en contenido generado"*.

## Slots nuevos usados (los 5 liberados + contenido faltante)

- **ética y derechos** (sec 5 automatización, L10) — cubría el hueco de ownership/copyright flagged en review.
- **Whisper / transcripción** (sec 9 vibe coding, L7) — STT que faltaba; encaja en vibe coding porque la mayoría de workflows de code-with-voice usan transcripción.
- **cold email con AI** (sec 10 implementación, L8) — versión concreta de *"outreach y primeras ventas"*, más accionable.
- **deep research** (sec 3 asistentes, L7) — absorbido de "modos avanzados".
- **orquestación de equipos de bots** (sec 8 agentes, L9) — ahora su propia lección complementaria a multi-agente.

## Pendiente para workshop posterior

Cada una de las 100 lecciones aún necesita:
- `learning_objective` (frase con verbo Bloom: *"explicar por qué ChatGPT se inventa datos privados"*)
- `bloom_verb` (recordar / entender / aplicar / analizar / evaluar / crear)
- `cognitive_route` (conceptual 40/60 / procedimental 25/75 / mixta 30/70)
- `concept_name` (idea nombrable: *"alucinación"*, *"token"*, *"ventana de contexto"*)
- `scenario_character` (roster de 30 nombres)
- `narrative_arc` (2-4 líneas del hook)

Ese diseño se hace sección por sección en workshop contigo antes de generar slides.
