-- ============================================================================
-- Migration 002 — Seed de las 10 secciones del curso
-- ----------------------------------------------------------------------------
-- Carga las 10 secciones firmadas con Pablo, incluyendo nombre (display form),
-- slug (url-safe), display_order (1..10), pedagogy (línea del outline), y
-- est_lectures (distribución que suma 100).
--
-- Campos NULL en este seed (se llenan en workshop posterior):
--   learning_arc, audience_note, prereq_ids (default '{}'), published_at.
--
-- Status: todas en 'planned' — ninguna tiene lecciones todavía.
-- ============================================================================

insert into sections
  (id, slug, name, display_order, pedagogy, est_lectures, status)
values
  (
    1, 'introduccion', 'introducción', 1,
    'Onboarding al curso: cómo funciona el formato, cómo moverse entre rutas, qué esperar al salir.',
    2, 'planned'
  ),
  (
    2, 'fundamentos', 'fundamentos', 2,
    'Bases universales: qué es AI, cómo funciona un LLM, tokens, ventana de contexto, prompting básico.',
    12, 'planned'
  ),
  (
    3, 'asistentes', 'asistentes', 3,
    'Claude, ChatGPT, Gemini, Perplexity, Grok. Mapa de decisión por tarea.',
    10, 'planned'
  ),
  (
    4, 'contenido', 'contenido', 4,
    'Imagen, video, audio, voz. Flux, Seedance, Kling, ElevenLabs, Nano Banana.',
    10, 'planned'
  ),
  (
    5, 'automatizacion', 'automatización', 5,
    'Claude Code Routines, cron, MCP schedulers, n8n y Make. Apify y Browserbase para scraping.',
    12, 'planned'
  ),
  (
    6, 'bases-de-datos', 'bases de datos', 6,
    'Supabase, Notion, Airtable, HubSpot, Salesforce. RAG, embeddings, SQL. Seguridad de datos.',
    12, 'planned'
  ),
  (
    7, 'apis-mcps-skills', 'APIs, MCPs y skills', 7,
    'La pieza técnica 2026: MCP servers, Claude Agent SDK, Anthropic Skills. Apify y Firecrawl desde código.',
    14, 'planned'
  ),
  (
    8, 'agentes', 'agentes', 8,
    'Browser agents, chatbots, voice agents. OpenClaw, multi-agente y A2A protocol.',
    10, 'planned'
  ),
  (
    9, 'vibe-coding', 'vibe coding', 9,
    'Claude Code, Cursor, Codex. git y GitHub. Deploy a producción.',
    8, 'planned'
  ),
  (
    10, 'implementacion', 'implementación', 10,
    'Deploy, monitoreo, rate limits, fallbacks, costos operativos. Go-to-market: pricing LATAM, primeros usuarios, primeras ventas. Despedida.',
    10, 'planned'
  );

-- ============================================================================
-- FIN DE MIGRATION 002
-- ----------------------------------------------------------------------------
-- Verificación post-ejecución esperada:
--   select id, name, display_order, est_lectures, status from sections
--   order by display_order;
--   → 10 filas en orden 1..10, est_lectures sumando 100, todas 'planned'.
-- ============================================================================
