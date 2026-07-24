-- ============================================================================
-- Pivot US: la jurisdicción 'US' no existía en el motor de riesgo.
--
-- Contexto (2026-07-16, pivot MX/CO → EEUU):
--   risk_events.jurisdiction_of_data_subject aceptaba solo MX/CO/BR/other. El
--   schema JSON del judge (lib/simulador/judge/prompt-builder.ts) replicaba ese
--   enum, así que el LLM NO podía etiquetar a un titular estadounidense: lo
--   forzaba a 'other'. Resultado: la PII de un cliente de EEUU quedaba
--   registrada como jurisdicción no identificada — el registro de compliance
--   sub-reporta justo el mercado al que vamos a vender.
--
-- Qué NO hace esta migración, y por qué:
--   NO toca simulador.compute_recommendation. Esa función se RETIRÓ en la
--   migración 20260702130000 (R-17 del RULES_LEDGER, aplicada local+remoto):
--   era un espejo SQL de lib/simulador/judge/apply-overrides.ts que había
--   divergido y no tenía callers. Recrearla para "arreglar" el gating de
--   jurisdicción reintroduciría el espejo muerto que R-17 eliminó a propósito.
--   La fuente única de las reglas de recomendación sigue siendo
--   apply-overrides.ts — y ahí el piso de 'pausar' se dispara con CUALQUIER
--   risk event severity=high, sin mirar la jurisdicción. El cap de banda
--   (DIMENSION_BAND_CAPS) también es agnóstico de jurisdicción.
--   Es decir: la recomendación NO sub-reporta a EEUU. Lo que sub-reporta es la
--   ETIQUETA del titular, que es lo que esta migración arregla.
--
-- Se conservan MX/CO/BR: hay datos históricos y el pivot no borra el pasado.
-- ============================================================================

-- ── 1. risk_events: ampliar el CHECK para admitir 'US' ──────────────────────

alter table simulador.risk_events
  drop constraint if exists risk_events_jurisdiction_of_data_subject_check;

alter table simulador.risk_events
  add constraint risk_events_jurisdiction_of_data_subject_check
    check (jurisdiction_of_data_subject in ('MX', 'CO', 'BR', 'US', 'other'));

-- ── 2. users: misma ampliación (un signup de EEUU no podía declararse 'US') ──
-- Añadido fuera del brief original: es el mismo bug del mismo pivot, y sin esto
-- simulador.users.jurisdiction no puede representar a un cliente estadounidense.

alter table simulador.users
  drop constraint if exists users_jurisdiction_check;

alter table simulador.users
  add constraint users_jurisdiction_check
    check (jurisdiction in ('MX', 'CO', 'BR', 'US', 'other'));

-- ── 3. Comments: citar CCPA/CPRA junto a las leyes LATAM ────────────────────

comment on column simulador.risk_events.jurisdiction_of_data_subject is
  'MX/CO/BR/US/other. Jurisdicción del titular del dato cuando el evento toca PII. Reguladas: US (CCPA/CPRA + state patchwork), MX (LFPDPPP), CO (Ley 1581), BR (LGPD).';

comment on column simulador.users.jurisdiction is
  'MX/CO/BR/US/other. Jurisdicción del usuario para consent + retención. Reguladas: US (CCPA/CPRA + state patchwork), MX (LFPDPPP), CO (Ley 1581), BR (LGPD).';
