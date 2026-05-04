# memoria itera

memoria cross-sesión del proyecto. cada archivo `<tipo>_<slug>.md` lleva frontmatter YAML con `type`, `dept`, `date`, `tags`. los skills `/itera-memory-save` e `/itera-memory-load` leen y escriben este directorio. el linter `scripts/lint-memory.sh` valida estructura + reporta dominios silenciosos.

los docs canónicos siempre ganan si hay conflicto: `CLAUDE.md`, `docs/CONTEXT.md`, `docs/METODOLOGIA.md`, `docs/LESSONS_v1.md`, `docs/SCHEMA_v1.md`.

estructura de los 14 dominios: ver `metodologia_estructura_dominios.md` (reemplaza modelo C-suite).
ritual de cierre por dominio: ver `metodologia_ritual_cierre_dominio.md`.
protocolo claude+codex: ver `metodologia_protocolo_claude_codex.md`.
plantilla de ticket conductor: ver `../handoff/conductor_ticket_template.md`.

---

## por tipo

### decisiones

- [tesis core — vendemos concentración + operación, no información](decision_tesis_concentracion_plataforma.md) — 2026-04-27 — `[producto, orquestador]` — itera no compite en contenido AI; compite en concentración + operación con cuenta LLM del usuario.
- [stripe-only + USD único + mercado pago descartado](decision_cfo_stripe_only_usd_mp_descartado.md) — 2026-04-24 — `[finanzas]` — itera procesa solo con stripe en USD; MP descartado definitivamente.
- [pivote whatsapp como canal real](decision_pivot_whatsapp_canal_real.md) — 2026-04-28 — `[desarrollo, marketing, finanzas, producto]` — whatsapp como canal alterno principal de delivery.
- [landing — estado al cerrar agente Landing 22-23 abril](decision_landing_estructura_post_pivote_b2b.md) — 2026-04-23 — `[producto, marketing]` — landing prod = Hero (shader + "ai de 0 a 100") → Pricing → FAQ.
- [mailing transaccional-only + ESP = AgentMail](decision_mailing_transaccional_only.md) — 2026-04-23 — `[producto, desarrollo]` — 5 correos permitidos; rollback de Resend.
- [mailing itera — scope transaccional-only, sin engagement emails](decision_mailing_scope_transaccional_only.md) — 2026-04-22 — `[producto, desarrollo]` — sin onboarding drips, weekly, win-back, re-engagement.
- [gamification estilo duolingo pero b2b — visual sí, virales no](decision_gamification_duolingo_b2b.md) — 2026-04-22 — `[producto, educacion]` — badges con tiers de rareza + 2 rachas separadas; sin hearts/email/ligas.
- [landing realineada a ejercicios interactivos + dos rutas](decision_landing_pivote_ejercicios.md) — 2026-04-22 — `[producto, marketing]` — 5 archivos de `components/landing/` pasaron de "videos" a "ejercicios".
- [legal backlog v1 — items priorizados](decision_legal_backlog_v1.md) — 2026-05-04 — `[legal]` — backlog inicial de items legales prioritarios.

### aprendizajes

- [perplexity mcp instalado + heurística de búsqueda web](aprendizaje_perplexity_mcp.md) — 2026-04-22 — `[orquestador]` — queries cortos tipo pregunta > briefs largos.
- [pablo no delega manuales — ejecutar vía mcp/cli directamente](aprendizaje_pablo_no_delega_manuales.md) — 2026-04-21 — `[orquestador]` — *"espera todo lo que me pides puedes hacerlo tu directamente"*.
- [pipeline de review de lecciones: evaluator + linter + batches paralelos](aprendizaje_pipeline_review_lecciones_paralelo.md) — 2026-04-21 — `[educacion, desarrollo]` — `/itera-review` con 10 agentes en paralelo revisó las 100 lecciones.

### copy y tono

- [nombres de secciones: "api" (no apis), "mcp y skills" (skills plural)](copy_nombres_secciones_api_mcp_skills.md) — 2026-04-21 — `[marketing]` — no pluralizar siglas; skills sí porque es nombre propio.

### negocio y stakeholders

- [hibp bloqueado por plan free de supabase](negocio_supabase_plan_free_hibp_bloqueado.md) — 2026-04-21 — `[desarrollo, finanzas]` — leaked password protection requiere Pro ($25 USD/mes).

### experimentos vivos

- [telegram como canal alterno de lecciones diarias](experimento_telegram_canal_lecciones.md) — 2026-04-24 — `[automatizacion, desarrollo]` — MVP construido, bloqueado en decisión de bot identity.
- [hero rediseñado via claude design](experimento_hero_claude_design.md) — 2026-04-22 — `[marketing]` — pablo traerá output de `claude.ai/design` para reemplazar el H1.
- [representación visual de how it works cuando el producto aún no existe](experimento_how_it_works_visual.md) — 2026-04-22 — `[marketing, imagenes]` — remotion vs screenshots del demo, decisión pendiente.

### research

- [whatsapp setup mexico — proveedores y compliance](research_whatsapp_setup_mexico.md) — 2026-04-28 — `[desarrollo, finanzas]` — opciones de WhatsApp Business API en MX, costos y compliance.

### metodología

- [estructura de dominios funcionales (reemplaza modelo C-suite)](metodologia_estructura_dominios.md) — 2026-05-04 — `[orquestador]` — los 14 dominios actuales + mapping desde el modelo C-suite (CEO/CFO/CMO/CGO/CPO/CTO/ORQ/Legal).
- [protocolo claude+codex — dos orquestadores trabajando juntos](metodologia_protocolo_claude_codex.md) — 2026-04-27 — `[orquestador, desarrollo]` — reglas de autonomía CTO; operación vía Conductor.build.
- [ritual de cierre por dominio — escribir antes de cerrar sesión](metodologia_ritual_cierre_dominio.md) — 2026-05-04 — `[orquestador]` — cada conversación-dominio escribe sus decisiones nuevas antes de salir.
- [orquestación itera — 12 conversaciones paralelas + orquestador (legacy)](metodologia_orquestacion_12_conversaciones.md) — 2026-04-22 — `[orquestador]` — patrón anterior, deprecated por modelo de dominios.

### gotchas

- [3 tensiones de producto detectadas cross-departamental tras ronda 10-preguntas](gotcha_tensiones_producto_cross_departamental.md) — 2026-04-27 — `[producto, orquestador]` — pitch "Duolingo" vs producto "tutor privado custom"; PLG individuo→empresa vs B2B-only.
- [duolingo entrando a AI antes que itera complete operación es la amenaza real](gotcha_duolingo_pivote_ai_es_la_amenaza.md) — 2026-04-27 — `[producto, orquestador]` — el moat es llegar a fase operación antes de que ellos pivoteen.
- [supabase session pooler — usar aws-1-us-east-1, no aws-0-us-east-1](gotcha_supabase_pooler_aws1_us_east_1.md) — 2026-04-27 — `[desarrollo]` — "Tenant or user not found" = pool incorrecto; host directo es IPv6-only.
- [cruces estructurales recurrentes entre conversaciones itera](gotcha_cruces_estructurales_recurrentes.md) — 2026-04-22 — `[orquestador]` — 9 fracturas que reaparecen cada ronda de orquestación.
- [`git commit` sin pathspec levanta archivos staged de otros agentes](gotcha_commit_staged_files.md) — 2026-04-23 — `[desarrollo]` — usar `git commit -- <path>` con pathspec explícito.
- [welcome email — hook en signup ya existe, falta hook en checkout](gotcha_welcome_email_hook_signup_existe.md) — 2026-04-22 — `[desarrollo]` — `auth/callback/route.ts:114-121` dispara welcome en signup; falta hook al `checkout.session.completed`.
- [posicionamiento real vs context_md (empresa vs latam universal)](gotcha_posicionamiento_empresa_vs_latam.md) — 2026-04-22 — `[marketing, producto]` — `CONTEXT.md` dice "LATAM no-técnico 55 años"; pablo aclaró B2B/empresa.
- [deuda técnica acumulada en components/landing/](gotcha_landing_technical_debt.md) — 2026-04-22 — `[desarrollo, marketing]` — dead code con copy viejo + violaciones de `CLAUDE.md`; no bloqueante.
- [extraer pat de supabase cli desde macos keychain](gotcha_supabase_pat_desde_keychain.md) — 2026-04-21 — `[desarrollo]` — `security find-generic-password ... | base64 -d` para usar Management API.
- [oauth de supabase: allow_list con patterns /** es obligatorio](gotcha_supabase_oauth_allow_list.md) — 2026-04-21 — `[desarrollo]` — si falla matching, supabase cae silenciosamente a site_url.
- ["maximum update depth exceeded" casi siempre es un solo root cause](gotcha_max_update_depth_react_un_root_cause.md) — 2026-04-21 — `[desarrollo]` — buscar useMemo para objetos en deps.

---

## por dominio

### automatizacion

- [telegram como canal alterno de lecciones diarias](experimento_telegram_canal_lecciones.md) — experimento — 2026-04-24 *(comparte con desarrollo)*

### datos

*sin output todavía. cuando se defina north star metric o se instrumente analytics, vive aquí.*

### desarrollo

- [pivote whatsapp como canal real](decision_pivot_whatsapp_canal_real.md) — decision — 2026-04-28 *(comparte con marketing, finanzas, producto)*
- [protocolo claude+codex](metodologia_protocolo_claude_codex.md) — metodologia — 2026-04-27 *(comparte con orquestador)*
- [supabase session pooler aws-1 vs aws-0](gotcha_supabase_pooler_aws1_us_east_1.md) — gotcha — 2026-04-27
- [whatsapp setup mexico research](research_whatsapp_setup_mexico.md) — research — 2026-04-28 *(comparte con finanzas)*
- [telegram como canal alterno](experimento_telegram_canal_lecciones.md) — experimento — 2026-04-24 *(comparte con automatizacion)*
- [mailing transaccional-only + ESP = AgentMail](decision_mailing_transaccional_only.md) — decision — 2026-04-23 *(comparte con producto)*
- [`git commit` sin pathspec](gotcha_commit_staged_files.md) — gotcha — 2026-04-23
- [mailing scope transaccional-only](decision_mailing_scope_transaccional_only.md) — decision — 2026-04-22 *(comparte con producto)*
- [welcome email hook signup](gotcha_welcome_email_hook_signup_existe.md) — gotcha — 2026-04-22
- [deuda técnica components/landing/](gotcha_landing_technical_debt.md) — gotcha — 2026-04-22 *(comparte con marketing)*
- [hibp bloqueado por plan free supabase](negocio_supabase_plan_free_hibp_bloqueado.md) — negocio — 2026-04-21 *(comparte con finanzas)*
- [pipeline review de lecciones](aprendizaje_pipeline_review_lecciones_paralelo.md) — aprendizaje — 2026-04-21 *(comparte con educacion)*
- [extraer pat supabase cli desde keychain](gotcha_supabase_pat_desde_keychain.md) — gotcha — 2026-04-21
- [oauth supabase allow_list /**](gotcha_supabase_oauth_allow_list.md) — gotcha — 2026-04-21
- [maximum update depth — un root cause](gotcha_max_update_depth_react_un_root_cause.md) — gotcha — 2026-04-21

### educacion

- [gamification estilo duolingo pero b2b](decision_gamification_duolingo_b2b.md) — decision — 2026-04-22 *(comparte con producto)*
- [pipeline de review de lecciones](aprendizaje_pipeline_review_lecciones_paralelo.md) — aprendizaje — 2026-04-21 *(comparte con desarrollo)*

### finanzas

- [pivote whatsapp como canal real](decision_pivot_whatsapp_canal_real.md) — decision — 2026-04-28 *(comparte con desarrollo, marketing, producto)*
- [whatsapp setup mexico research](research_whatsapp_setup_mexico.md) — research — 2026-04-28 *(comparte con desarrollo)*
- [stripe-only + USD único + mercado pago descartado](decision_cfo_stripe_only_usd_mp_descartado.md) — decision — 2026-04-24
- [hibp bloqueado por plan free supabase](negocio_supabase_plan_free_hibp_bloqueado.md) — negocio — 2026-04-21 *(comparte con desarrollo)*

### fundraising

*sin output todavía. cuando se arme deck, data room, network mapping o pitch, vive aquí.*

### imagenes

- [representación visual de how it works](experimento_how_it_works_visual.md) — experimento — 2026-04-22 *(comparte con marketing)*

### legal

- [legal backlog v1](decision_legal_backlog_v1.md) — decision — 2026-05-04

### marketing

- [pivote whatsapp como canal real](decision_pivot_whatsapp_canal_real.md) — decision — 2026-04-28 *(comparte con desarrollo, finanzas, producto)*
- [landing — estado al cerrar agente Landing 22-23 abril](decision_landing_estructura_post_pivote_b2b.md) — decision — 2026-04-23 *(comparte con producto)*
- [landing realineada a ejercicios interactivos](decision_landing_pivote_ejercicios.md) — decision — 2026-04-22 *(comparte con producto)*
- [hero rediseñado via claude design](experimento_hero_claude_design.md) — experimento — 2026-04-22
- [representación visual de how it works](experimento_how_it_works_visual.md) — experimento — 2026-04-22 *(comparte con imagenes)*
- [nombres de secciones: "api" (no apis)](copy_nombres_secciones_api_mcp_skills.md) — copy — 2026-04-21
- [posicionamiento real vs context_md](gotcha_posicionamiento_empresa_vs_latam.md) — gotcha — 2026-04-22 *(comparte con producto)*
- [deuda técnica components/landing/](gotcha_landing_technical_debt.md) — gotcha — 2026-04-22 *(comparte con desarrollo)*

### orquestador

- [estructura de dominios funcionales](metodologia_estructura_dominios.md) — metodologia — 2026-05-04
- [tesis core — concentración + operación](decision_tesis_concentracion_plataforma.md) — decision — 2026-04-27 *(comparte con producto)*
- [protocolo claude+codex](metodologia_protocolo_claude_codex.md) — metodologia — 2026-04-27 *(comparte con desarrollo)*
- [ritual de cierre por dominio](metodologia_ritual_cierre_dominio.md) — metodologia — 2026-05-04
- [3 tensiones de producto cross-departamental](gotcha_tensiones_producto_cross_departamental.md) — gotcha — 2026-04-27 *(comparte con producto)*
- [duolingo pivote AI es la amenaza](gotcha_duolingo_pivote_ai_es_la_amenaza.md) — gotcha — 2026-04-27 *(comparte con producto)*
- [perplexity mcp instalado + heurística](aprendizaje_perplexity_mcp.md) — aprendizaje — 2026-04-22
- [orquestación itera — 12 conversaciones (legacy)](metodologia_orquestacion_12_conversaciones.md) — metodologia — 2026-04-22
- [cruces estructurales recurrentes](gotcha_cruces_estructurales_recurrentes.md) — gotcha — 2026-04-22
- [pablo no delega manuales](aprendizaje_pablo_no_delega_manuales.md) — aprendizaje — 2026-04-21

### producto

- [tesis core — concentración + operación](decision_tesis_concentracion_plataforma.md) — decision — 2026-04-27 *(comparte con orquestador)*
- [pivote whatsapp como canal real](decision_pivot_whatsapp_canal_real.md) — decision — 2026-04-28 *(comparte con desarrollo, marketing, finanzas)*
- [landing — estado al cerrar agente Landing 22-23 abril](decision_landing_estructura_post_pivote_b2b.md) — decision — 2026-04-23 *(comparte con marketing)*
- [mailing transaccional-only + ESP = AgentMail](decision_mailing_transaccional_only.md) — decision — 2026-04-23 *(comparte con desarrollo)*
- [mailing scope transaccional-only](decision_mailing_scope_transaccional_only.md) — decision — 2026-04-22 *(comparte con desarrollo)*
- [gamification estilo duolingo pero b2b](decision_gamification_duolingo_b2b.md) — decision — 2026-04-22 *(comparte con educacion)*
- [landing realineada a ejercicios interactivos](decision_landing_pivote_ejercicios.md) — decision — 2026-04-22 *(comparte con marketing)*
- [posicionamiento real vs context_md](gotcha_posicionamiento_empresa_vs_latam.md) — gotcha — 2026-04-22 *(comparte con marketing)*
- [3 tensiones de producto cross-departamental](gotcha_tensiones_producto_cross_departamental.md) — gotcha — 2026-04-27 *(comparte con orquestador)*
- [duolingo pivote AI es la amenaza](gotcha_duolingo_pivote_ai_es_la_amenaza.md) — gotcha — 2026-04-27 *(comparte con orquestador)*

### redes-sociales

*sin output todavía. cuando se arme content founder-led en TikTok/X/IG/LinkedIn, vive aquí.*

### soporte

*sin output todavía. crítico desde primer paying user. cuando se defina canal/SLA/KB, vive aquí.*

### ventas

*sin output todavía. cuando se arme outbound a Gerardo Álvarez, prospects, demos o playbooks, vive aquí.*
