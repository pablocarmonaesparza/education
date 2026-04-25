# Memoria Itera

Memoria cross-sesión del proyecto. Cada línea apunta a un archivo `<tipo>_<slug>.md` en esta misma carpeta.

Editar a mano cuando algo envejezca o cambie. Los docs canónicos (`CLAUDE.md`, `docs/CONTEXT.md`, `docs/METODOLOGIA.md`, `docs/LESSONS_v1.md`, `docs/SCHEMA_v1.md`) siempre ganan si hay conflicto.

Los skills `/itera-memory-save` e `/itera-memory-load` leen y escriben este directorio.

## Decisiones

- [landing — estado al cerrar agente Landing 22-23 abril](decision_landing_estructura_post_pivote_b2b.md) — 2026-04-23 — handoff: landing prod = Hero (shader + "ai de 0 a 100") → Pricing → FAQ; archivadas vivas HowItWorks/AvailableCourses/ProjectInput; `/landingPrueba` con 6 candidatas espera eval; tokens semánticos ya aplicados.
- [mailing itera — scope transaccional-only, sin engagement emails](decision_mailing_scope_transaccional_only.md) — 2026-04-22 — solo welcome / password reset / payment receipt / "primera lección completada"; mata onboarding drips, weekly, win-back, re-engagement; `EMAIL_STRATEGY.md` a reescribir.
- [gamification estilo duolingo pero b2b — visual sí, virales no](decision_gamification_duolingo_b2b.md) — 2026-04-22 — badges con tiers de rareza + 2 rachas separadas (correctCombo local vs dailyStreak persistida); sin hearts/email/ligas.
- [landing realineada a ejercicios interactivos + dos rutas](decision_landing_pivote_ejercicios.md) — 2026-04-22 — 5 archivos de `components/landing/` pasaron de "videos" a "ejercicios"; scope copy only.

## Aprendizajes

- [perplexity mcp instalado + heurística de búsqueda web](aprendizaje_perplexity_mcp.md) — 2026-04-22 — queries cortos tipo pregunta > briefs largos; noticias frescas usar `WebSearch` built-in.
- [pablo no delega manuales — ejecutar vía mcp/cli directamente](aprendizaje_pablo_no_delega_manuales.md) — 2026-04-21 — *"Espera todo lo que me pides puedes hacerlo tu directamente"* — evitar instrucciones al dashboard.
- [pipeline de review de lecciones: evaluator + linter + batches paralelos](aprendizaje_pipeline_review_lecciones_paralelo.md) — 2026-04-21 — `/itera-review` con 10 agentes en paralelo revisó las 100 lecciones.

<!-- - [Título corto](aprendizaje_slug.md) — YYYY-MM-DD — hook de una línea -->

## Copy y tono

- [nombres de secciones: "api" (no apis), "mcp y skills" (skills plural)](copy_nombres_secciones_api_mcp_skills.md) — 2026-04-21 — no pluralizar siglas; skills sí porque es nombre propio.

<!-- - [Título corto](copy_slug.md) — YYYY-MM-DD — hook de una línea -->

## Negocio y stakeholders

- [hibp bloqueado por plan free de supabase](negocio_supabase_plan_free_hibp_bloqueado.md) — 2026-04-21 — leaked password protection requiere Pro ($25/mes).

<!-- - [Título corto](negocio_slug.md) — YYYY-MM-DD — hook de una línea -->

## Experimentos vivos

- [hero rediseñado via claude design](experimento_hero_claude_design.md) — 2026-04-22 — Pablo traerá output de `claude.ai/design` para reemplazar el H1 "un curso a partir de tu idea".
- [representación visual de how it works cuando el producto aún no existe](experimento_how_it_works_visual.md) — 2026-04-22 — remotion vs screenshots del demo, decisión pendiente.
- [telegram como canal alterno de lecciones diarias](experimento_telegram_canal_lecciones.md) — 2026-04-24 — MVP construido (migrations 009b+010, edge functions telegram-bot v9 + tg-daily-send v2, cron pausado), bloqueado en decisión de bot identity (`@itera_ia_bot` actual vs `@itera_la_bot` brand); Pablo debe rotar token expuesto en `@BotFather`.

## Metodología

- [orquestación itera — 12 conversaciones paralelas + orquestador](metodologia_orquestacion_12_conversaciones.md) — 2026-04-22 — patrón de trabajo de Pablo: 12 convos por dominio + 1 Orquestrador que coordina cruces; regla obligatoria leer `INDEX.md` antes de orquestar.

## Gotchas

- [cruces estructurales recurrentes entre conversaciones itera](gotcha_cruces_estructurales_recurrentes.md) — 2026-04-22 — 9 fracturas que reaparecen cada ronda de orquestación (Stripe tier, UUID/slug, rate limit, analytics views, retos ambiguo, MP ambiguo, working tree compartido, CLAUDE.md desincronizado).
- [welcome email — hook en signup ya existe, falta hook en checkout](gotcha_welcome_email_hook_signup_existe.md) — 2026-04-22 — `auth/callback/route.ts:114-121` dispara welcome en signup; lo que falta es hook al `checkout.session.completed` + idempotencia + E2E + DKIM.
- [posicionamiento real vs context_md (empresa vs latam universal)](gotcha_posicionamiento_empresa_vs_latam.md) — 2026-04-22 — `CONTEXT.md` dice "LATAM no-técnico 55 años"; Pablo aclaró B2B/empresa, y que descarta hearts/email-reminders por ser mecánicas B2C.
- [deuda técnica acumulada en components/landing/](gotcha_landing_technical_debt.md) — 2026-04-22 — dead code con copy viejo + ~15 violaciones de `CLAUDE.md`; no bloqueante para el pivot de copy.
- [extraer pat de supabase cli desde macos keychain](gotcha_supabase_pat_desde_keychain.md) — 2026-04-21 — `security find-generic-password ... | base64 -d` para usar Management API.
- [oauth de supabase: allow_list con patterns /** es obligatorio](gotcha_supabase_oauth_allow_list.md) — 2026-04-21 — si falla matching, Supabase cae silenciosamente a site_url.
- ["maximum update depth exceeded" casi siempre es un solo root cause](gotcha_max_update_depth_react_un_root_cause.md) — 2026-04-21 — los otros errores son colaterales; buscar useMemo para objetos en deps.

<!-- - [Título corto](gotcha_slug.md) — YYYY-MM-DD — hook de una línea -->
