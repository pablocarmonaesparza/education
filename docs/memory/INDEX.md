# memoria itera

memoria cross-sesión del proyecto. cada archivo `<tipo>_<slug>.md` lleva frontmatter YAML con `type`, `dept`, `date`, `tags`. los skills `/itera-memory-save` e `/itera-memory-load` leen y escriben este directorio. el linter `scripts/lint-memory.sh` valida estructura + reporta departamentos silenciosos.

los docs canónicos siempre ganan si hay conflicto: `CLAUDE.md`, `docs/CONTEXT.md`, `docs/METODOLOGIA.md`, `docs/LESSONS_v1.md`, `docs/SCHEMA_v1.md`.

ritual de cierre por C-suite: ver `metodologia_ritual_cierre_csuite.md`.
protocolo claude+codex: ver `metodologia_protocolo_claude_codex.md`.
plantilla de ticket conductor: ver `../handoff/conductor_ticket_template.md`.

---

## por tipo

### decisiones

- [tesis core — vendemos concentración + operación, no información](decision_tesis_concentracion_plataforma.md) — 2026-04-27 — `[cpo, ceo]` — itera no compite en contenido AI; compite en "el lugar para concentrarse a aprender" + "el lugar para operar AI con tu propia cuenta LLM"; norte de toda decisión de producto.
- [stripe-only + USD único + mercado pago descartado](decision_cfo_stripe_only_usd_mp_descartado.md) — 2026-04-24 — `[cfo]` — itera procesa solo con stripe en USD; MP descartado definitivamente; reabre solo si pivote b2c retail latam o regulación.
- [landing — estado al cerrar agente Landing 22-23 abril](decision_landing_estructura_post_pivote_b2b.md) — 2026-04-23 — `[cpo, cmo]` — landing prod = Hero (shader + "ai de 0 a 100") → Pricing → FAQ; archivadas vivas HowItWorks/AvailableCourses/ProjectInput; `/landingPrueba` con 6 candidatas espera eval.
- [mailing transaccional-only + ESP = AgentMail](decision_mailing_transaccional_only.md) — 2026-04-23 — `[cpo, cto]` — 5 correos permitidos (welcome, password reset, primera lección, payment receipt, failed charge); ESP = AgentMail; rollback de Resend.
- [mailing itera — scope transaccional-only, sin engagement emails](decision_mailing_scope_transaccional_only.md) — 2026-04-22 — `[cpo, cto]` — sin onboarding drips, weekly, win-back, re-engagement; `EMAIL_STRATEGY.md` a reescribir.
- [gamification estilo duolingo pero b2b — visual sí, virales no](decision_gamification_duolingo_b2b.md) — 2026-04-22 — `[cpo, cgo]` — badges con tiers de rareza + 2 rachas separadas (correctCombo local vs dailyStreak persistida); sin hearts/email/ligas.
- [landing realineada a ejercicios interactivos + dos rutas](decision_landing_pivote_ejercicios.md) — 2026-04-22 — `[cpo, cmo]` — 5 archivos de `components/landing/` pasaron de "videos" a "ejercicios"; scope copy only.

### aprendizajes

- [perplexity mcp instalado + heurística de búsqueda web](aprendizaje_perplexity_mcp.md) — 2026-04-22 — `[orq]` — queries cortos tipo pregunta > briefs largos; noticias frescas usar `WebSearch` built-in.
- [pablo no delega manuales — ejecutar vía mcp/cli directamente](aprendizaje_pablo_no_delega_manuales.md) — 2026-04-21 — `[orq]` — *"espera todo lo que me pides puedes hacerlo tu directamente"* — evitar instrucciones al dashboard.
- [pipeline de review de lecciones: evaluator + linter + batches paralelos](aprendizaje_pipeline_review_lecciones_paralelo.md) — 2026-04-21 — `[cpo, cto]` — `/itera-review` con 10 agentes en paralelo revisó las 100 lecciones.

### copy y tono

- [nombres de secciones: "api" (no apis), "mcp y skills" (skills plural)](copy_nombres_secciones_api_mcp_skills.md) — 2026-04-21 — `[cmo]` — no pluralizar siglas; skills sí porque es nombre propio.

### negocio y stakeholders

- [hibp bloqueado por plan free de supabase](negocio_supabase_plan_free_hibp_bloqueado.md) — 2026-04-21 — `[cto, cfo]` — leaked password protection requiere Pro ($25 USD/mes).

### experimentos vivos

- [telegram como canal alterno de lecciones diarias](experimento_telegram_canal_lecciones.md) — 2026-04-24 — `[cgo, cto]` — MVP construido (migrations 009b+010, edge functions telegram-bot v9 + tg-daily-send v2, cron pausado), bloqueado en decisión de bot identity (`@itera_ia_bot` actual vs `@itera_la_bot` brand).
- [hero rediseñado via claude design](experimento_hero_claude_design.md) — 2026-04-22 — `[cmo]` — pablo traerá output de `claude.ai/design` para reemplazar el H1 "un curso a partir de tu idea".
- [representación visual de how it works cuando el producto aún no existe](experimento_how_it_works_visual.md) — 2026-04-22 — `[cmo]` — remotion vs screenshots del demo, decisión pendiente.

### metodología

- [estructura actual de agentes — c-level (no más 12 conversaciones)](metodologia_estructura_agentes_clevel.md) — 2026-04-27 — `[orq]` — estructura nueva: CEO/CFO/CMO/CGO/CTO/CPO + Orquestador en Claude Code + 1 en Codex; las 12 conversaciones por dominio quedan deprecadas; pablo solo, ~50k MXN budget, target ~10 usuarios mes.
- [protocolo claude+codex — dos orquestadores trabajando juntos](metodologia_protocolo_claude_codex.md) — 2026-04-27 — `[orq, cto]` — reglas de autonomía CTO: detectar CEO-level, investigar cuando falte dominio, consultar cuando pablo sí debe decidir; operación vía Conductor.build.
- [ritual de cierre por C-suite — escribir antes de cerrar sesión](metodologia_ritual_cierre_csuite.md) — 2026-04-25 — `[orq]` — cada conversación-departamento escribe sus decisiones nuevas en `docs/memory/` antes de salir; corre el linter; INDEX a mano.
- [orquestación itera — 12 conversaciones paralelas + orquestador](metodologia_orquestacion_12_conversaciones.md) — 2026-04-22 — `[orq]` — patrón de trabajo de pablo: 12 convos por dominio + 1 Orquestador que coordina cruces; regla obligatoria leer `INDEX.md` antes de orquestar.

### gotchas

- [3 tensiones de producto detectadas cross-departamental tras ronda de 10-preguntas](gotcha_tensiones_producto_cross_departamental.md) — 2026-04-27 — `[cpo, ceo]` — pitch "Duolingo" vs producto "tutor privado custom"; 500 individuos vs 50 empresas (arquitectura distinta); PLG individuo→empresa vs B2B-only. Bloquean entregables de producto hasta resolución.
- [duolingo entrando a AI antes que itera complete operación es la amenaza real](gotcha_duolingo_pivote_ai_es_la_amenaza.md) — 2026-04-27 — `[cpo, ceo]` — coursera/udemy/platzi no preocupan; duolingo sí porque ya domina formato sticky; el moat es llegar a fase operación (cuenta LLM del usuario adentro de la plataforma) antes de que ellos pivoteen.
- [cruces estructurales recurrentes entre conversaciones itera](gotcha_cruces_estructurales_recurrentes.md) — 2026-04-22 — `[orq]` — 9 fracturas que reaparecen cada ronda de orquestación.
- [`git commit` sin pathspec levanta archivos staged de otros agentes](gotcha_commit_staged_files.md) — 2026-04-23 — `[cto]` — usar `git commit -- <path>` con pathspec explícito; alternativa stash + commit + pop.
- [welcome email — hook en signup ya existe, falta hook en checkout](gotcha_welcome_email_hook_signup_existe.md) — 2026-04-22 — `[cto]` — `auth/callback/route.ts:114-121` dispara welcome en signup; falta hook al `checkout.session.completed` + idempotencia + E2E + DKIM.
- [posicionamiento real vs context_md (empresa vs latam universal)](gotcha_posicionamiento_empresa_vs_latam.md) — 2026-04-22 — `[cmo, cpo]` — `CONTEXT.md` dice "LATAM no-técnico 55 años"; pablo aclaró B2B/empresa, descarta hearts/email-reminders por ser mecánicas B2C.
- [deuda técnica acumulada en components/landing/](gotcha_landing_technical_debt.md) — 2026-04-22 — `[cto, cmo]` — dead code con copy viejo + ~15 violaciones de `CLAUDE.md`; no bloqueante para el pivot de copy.
- [extraer pat de supabase cli desde macos keychain](gotcha_supabase_pat_desde_keychain.md) — 2026-04-21 — `[cto]` — `security find-generic-password ... | base64 -d` para usar Management API.
- [oauth de supabase: allow_list con patterns /** es obligatorio](gotcha_supabase_oauth_allow_list.md) — 2026-04-21 — `[cto]` — si falla matching, supabase cae silenciosamente a site_url.
- ["maximum update depth exceeded" casi siempre es un solo root cause](gotcha_max_update_depth_react_un_root_cause.md) — 2026-04-21 — `[cto]` — los otros errores son colaterales; buscar useMemo para objetos en deps.

---

## por departamento

### CEO

- [tesis core — vendemos concentración + operación, no información](decision_tesis_concentracion_plataforma.md) — decision — 2026-04-27 *(comparte con cpo)*
- [3 tensiones de producto cross-departamental tras ronda 10-preguntas](gotcha_tensiones_producto_cross_departamental.md) — gotcha — 2026-04-27 *(comparte con cpo)*
- [duolingo entrando a AI antes que itera complete operación](gotcha_duolingo_pivote_ai_es_la_amenaza.md) — gotcha — 2026-04-27 *(comparte con cpo)*

### CFO

- [stripe-only + USD único + mercado pago descartado](decision_cfo_stripe_only_usd_mp_descartado.md) — decision — 2026-04-24
- [hibp bloqueado por plan free de supabase](negocio_supabase_plan_free_hibp_bloqueado.md) — negocio — 2026-04-21 *(comparte con cto)*

### CMO

- [landing — estado al cerrar agente Landing 22-23 abril](decision_landing_estructura_post_pivote_b2b.md) — decision — 2026-04-23 *(comparte con cpo)*
- [landing realineada a ejercicios interactivos + dos rutas](decision_landing_pivote_ejercicios.md) — decision — 2026-04-22 *(comparte con cpo)*
- [hero rediseñado via claude design](experimento_hero_claude_design.md) — experimento — 2026-04-22
- [representación visual de how it works cuando el producto aún no existe](experimento_how_it_works_visual.md) — experimento — 2026-04-22
- [nombres de secciones: "api" (no apis), "mcp y skills"](copy_nombres_secciones_api_mcp_skills.md) — copy — 2026-04-21
- [posicionamiento real vs context_md](gotcha_posicionamiento_empresa_vs_latam.md) — gotcha — 2026-04-22 *(comparte con cpo)*
- [deuda técnica acumulada en components/landing/](gotcha_landing_technical_debt.md) — gotcha — 2026-04-22 *(comparte con cto)*

### CGO

- [gamification estilo duolingo pero b2b — visual sí, virales no](decision_gamification_duolingo_b2b.md) — decision — 2026-04-22 *(comparte con cpo)*
- [telegram como canal alterno de lecciones diarias](experimento_telegram_canal_lecciones.md) — experimento — 2026-04-24 *(comparte con cto)*

### CPO

- [tesis core — vendemos concentración + operación, no información](decision_tesis_concentracion_plataforma.md) — decision — 2026-04-27 *(comparte con ceo)*
- [3 tensiones de producto cross-departamental tras ronda 10-preguntas](gotcha_tensiones_producto_cross_departamental.md) — gotcha — 2026-04-27 *(comparte con ceo)*
- [duolingo entrando a AI antes que itera complete operación](gotcha_duolingo_pivote_ai_es_la_amenaza.md) — gotcha — 2026-04-27 *(comparte con ceo)*
- [landing — estado al cerrar agente Landing 22-23 abril](decision_landing_estructura_post_pivote_b2b.md) — decision — 2026-04-23 *(comparte con cmo)*
- [mailing transaccional-only + ESP = AgentMail](decision_mailing_transaccional_only.md) — decision — 2026-04-23 *(comparte con cto)*
- [mailing itera — scope transaccional-only, sin engagement emails](decision_mailing_scope_transaccional_only.md) — decision — 2026-04-22 *(comparte con cto)*
- [gamification estilo duolingo pero b2b](decision_gamification_duolingo_b2b.md) — decision — 2026-04-22 *(comparte con cgo)*
- [landing realineada a ejercicios interactivos](decision_landing_pivote_ejercicios.md) — decision — 2026-04-22 *(comparte con cmo)*
- [pipeline de review de lecciones](aprendizaje_pipeline_review_lecciones_paralelo.md) — aprendizaje — 2026-04-21 *(comparte con cto)*
- [posicionamiento real vs context_md](gotcha_posicionamiento_empresa_vs_latam.md) — gotcha — 2026-04-22 *(comparte con cmo)*

### CTO

- [protocolo claude+codex](metodologia_protocolo_claude_codex.md) — metodologia — 2026-04-27 *(comparte con orq)*
- [telegram como canal alterno de lecciones diarias](experimento_telegram_canal_lecciones.md) — experimento — 2026-04-24 *(comparte con cgo)*
- [`git commit` sin pathspec levanta archivos staged de otros agentes](gotcha_commit_staged_files.md) — gotcha — 2026-04-23
- [mailing transaccional-only + ESP = AgentMail](decision_mailing_transaccional_only.md) — decision — 2026-04-23 *(comparte con cpo)*
- [mailing itera — scope transaccional-only](decision_mailing_scope_transaccional_only.md) — decision — 2026-04-22 *(comparte con cpo)*
- [welcome email — hook en signup ya existe](gotcha_welcome_email_hook_signup_existe.md) — gotcha — 2026-04-22
- [deuda técnica acumulada en components/landing/](gotcha_landing_technical_debt.md) — gotcha — 2026-04-22 *(comparte con cmo)*
- [pipeline de review de lecciones](aprendizaje_pipeline_review_lecciones_paralelo.md) — aprendizaje — 2026-04-21 *(comparte con cpo)*
- [hibp bloqueado por plan free de supabase](negocio_supabase_plan_free_hibp_bloqueado.md) — negocio — 2026-04-21 *(comparte con cfo)*
- [extraer pat de supabase cli desde macos keychain](gotcha_supabase_pat_desde_keychain.md) — gotcha — 2026-04-21
- [oauth de supabase: allow_list con patterns /**](gotcha_supabase_oauth_allow_list.md) — gotcha — 2026-04-21
- ["maximum update depth exceeded" un solo root cause](gotcha_max_update_depth_react_un_root_cause.md) — gotcha — 2026-04-21

### ORQ

- [estructura actual de agentes — c-level (no más 12 conversaciones)](metodologia_estructura_agentes_clevel.md) — metodologia — 2026-04-27
- [protocolo claude+codex](metodologia_protocolo_claude_codex.md) — metodologia — 2026-04-27 *(comparte con cto)*
- [ritual de cierre por C-suite](metodologia_ritual_cierre_csuite.md) — metodologia — 2026-04-25
- [perplexity mcp instalado + heurística de búsqueda web](aprendizaje_perplexity_mcp.md) — aprendizaje — 2026-04-22
- [orquestación itera — 12 conversaciones paralelas](metodologia_orquestacion_12_conversaciones.md) — metodologia — 2026-04-22
- [cruces estructurales recurrentes](gotcha_cruces_estructurales_recurrentes.md) — gotcha — 2026-04-22
- [pablo no delega manuales](aprendizaje_pablo_no_delega_manuales.md) — aprendizaje — 2026-04-21

### SHARED
