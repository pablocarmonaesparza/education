# memoria itera

memoria cross-sesión del proyecto. cada archivo `<tipo>_<slug>.md` lleva frontmatter YAML con `type`, `dept`, `date`, `tags`. los skills `/itera-memory-save` e `/itera-memory-load` leen y escriben este directorio. el linter `scripts/lint-memory.sh` valida estructura + reporta dominios silenciosos.

los docs canónicos siempre ganan si hay conflicto: `CLAUDE.md`, `docs/CONTEXT.md`, `docs/METODOLOGIA.md`, `docs/LESSONS_v1.md`, `docs/SCHEMA_v1.md`.

estructura de departamentos/dominios: ver `metodologia_estructura_dominios.md` (reemplaza posiciones).
ritual de cierre por dominio: ver `metodologia_ritual_cierre_dominio.md`.
protocolo claude+codex: ver `metodologia_protocolo_claude_codex.md`.
plantilla de ticket conductor: ver `../handoff/conductor_ticket_template.md`.

---

## por tipo

### decisiones

- [field test v0 del Simulador antes de construir runtime](decision_simulador_field_test_v0.md) — 2026-05-12 — `[producto, desarrollo, orquestador]` — packet completo aprobado por Pablo; no runtime hasta pasar decision matrix; face/construct/buyer validity con 5 participantes + 3 managers + 2 evaluadores ciegos.
- [primer caso canónico — marketing_urgent_campaign_pii](decision_simulador_first_case_marketing.md) — 2026-05-12 — `[producto, marketing, ventas]` — Marketing Manager LATAM SaaS B2B; tensión velocidad-vs-privacidad; 5 steps + resim enterprise US; 7 gaps mapeados a practice_beats.
- [tercer caso canónico — marketing_segment_with_sensitive_data](decision_simulador_third_case_segmentation.md) — 2026-05-12 — `[producto, marketing, legal]` — difficulty intermediate; tensión bias predictivo en segmentación con IA + privacidad behavioral; primer caso con ambigüedad ética; resim EU GDPR strict.
- [Sprint marketing_30d completo — 8 casos canónicos del Simulador v0](decision_simulador_sprint_marketing_completo_v1.md) — 2026-05-12 — `[producto, marketing, desarrollo, orquestador]` — cierre del Sprint marketing: 8 case_templates ready (incl crisis_response advanced), 16 variantes, 20 practice_beats, rúbrica versionada. listo para que Codex aplique migración + runtime.
- [arquitectura v0 de "El Simulador" — acuerdo Claude/Codex](decision_simulador_arquitectura_v0.md) — 2026-05-12 — `[producto, desarrollo, orquestador]` — separación case_template/variant/session; 5 step types; 5 dimensiones; 4 manager actions; 5 evidence kinds; reglas de colaboración Claude↔Codex.
- [legal backlog v1 — items priorizados](decision_legal_backlog_v1.md) — 2026-05-04 — `[legal]` — backlog inicial de items legales prioritarios.
- [pivote whatsapp como canal real](decision_pivot_whatsapp_canal_real.md) — 2026-04-28 — `[desarrollo, marketing, finanzas, producto]` — whatsapp como canal alterno principal de delivery.
- [tesis core — vendemos concentración + operación, no información](decision_tesis_concentracion_plataforma.md) — 2026-04-27 — `[producto, orquestador]` — tesis vigente: simulación → diagnóstico → práctica → re-simulación → evidencia → siguiente caso; educación como tratamiento adaptativo.
- [stripe-only + USD único + mercado pago descartado](decision_finanzas_stripe_only_usd_mp_descartado.md) — 2026-04-24 — `[finanzas]` — itera procesa solo con stripe en USD; MP descartado definitivamente.
- [stripe-only + USD único + mercado pago descartado (legacy duplicate)](decision_cfo_stripe_only_usd_mp_descartado.md) — 2026-04-24 — `[finanzas]` — versión vieja con prefix `cfo_`; el canónico es `decision_finanzas_stripe_only_usd_mp_descartado.md`.
- [landing — estado al cerrar agente Landing 22-23 abril](decision_landing_estructura_post_pivote_b2b.md) — 2026-04-23 — `[producto, marketing]` — landing prod = Hero (shader + "ai de 0 a 100") → Pricing → FAQ.
- [mailing transaccional-only + ESP = AgentMail](decision_mailing_transaccional_only.md) — 2026-04-23 — `[producto, desarrollo]` — 5 correos permitidos; rollback de Resend.
- [landing realineada a ejercicios interactivos + dos rutas](decision_landing_pivote_ejercicios.md) — 2026-04-22 — `[producto, marketing]` — 5 archivos de `components/landing/` pasaron de "videos" a "ejercicios".
- [gamification estilo duolingo pero b2b — visual sí, virales no](decision_gamification_duolingo_b2b.md) — 2026-04-22 — `[producto, educacion]` — badges con tiers de rareza + 2 rachas separadas; sin hearts/email/ligas.
- [mailing itera — scope transaccional-only, sin engagement (legacy duplicate)](decision_mailing_scope_transaccional_only.md) — 2026-04-22 — `[producto, desarrollo]` — versión vieja; el canónico es `decision_mailing_transaccional_only.md`.

### aprendizajes

- [inversores activos en b2b simulator + ai readiness + corporate learning (us + latam, 2026)](research_inversores_b2b_simulator_ai_readiness_2026.md) — 2026-05-09 — `[fundraising]` — mapeo ~50 funds; matches high itera: reach capital, owl, gsv, kaszek, hi ventures, magma, latitud, endeavor catalyst.
- [comparables b2b simulator + ai literacy + corporate training (2026)](research_comparables_simulator_b2b_2026.md) — 2026-05-09 — `[fundraising]` — wharton interactive, forage, attensi, mursion, whatfix mirror, section ai; rondas, valuaciones, pricing, exits.
- [yc canon 2026 — proceso, deal, fechas, app + interview, solo founder latam, pivots](research_yc_canon_2026.md) — 2026-05-09 — `[fundraising]` — proceso oficial yc verificado 9-may; deal $500k; f26/w27 sin fechas oficiales; quotes canon de partners; rfs s26.
- [yc tracción benchmarks w24-w26 — números crudos por batch](research_yc_traccion_benchmarks_w24_w26.md) — 2026-05-09 — `[fundraising]` — w26 récord 14% w/w + 14 con $1m+ arr; benchmark solo founder no-us latam edtech: 0.2-5% probabilidad.
- [setup whatsapp business api desde mexico — checklist completo 2026](research_whatsapp_setup_mexico.md) — 2026-04-28 — `[desarrollo, finanzas]` — opciones de WhatsApp Business API en MX, costos y compliance.
- [perplexity mcp instalado + heurística de búsqueda web](aprendizaje_perplexity_mcp.md) — 2026-04-22 — `[orquestador]` — queries cortos tipo pregunta > briefs largos.
- [pablo no delega manuales — ejecutar vía mcp/cli directamente](aprendizaje_pablo_no_delega_manuales.md) — 2026-04-21 — `[orquestador]` — *"espera todo lo que me pides puedes hacerlo tu directamente"*.
- [pipeline de review de lecciones: evaluator + linter + batches paralelos](aprendizaje_pipeline_review_lecciones_paralelo.md) — 2026-04-21 — `[educacion, desarrollo]` — `/itera-review` con 10 agentes en paralelo revisó las 100 lecciones.

### copy y tono

- [convención IA mayúsculas, nunca AI ni ia](copy_convencion_ia_mayusculas.md) — 2026-05-05 — `[producto, marketing]` — siempre "IA" mayúsculas, nunca "AI" ni "ia"; femenino ("la IA"); override del lowercase del DS con `<span style={{textTransform:"none"}}>IA</span>`.
- [nombres de secciones: "api" (no apis), "mcp y skills" (skills plural)](copy_nombres_secciones_api_mcp_skills.md) — 2026-04-21 — `[marketing]` — no pluralizar siglas; skills sí porque es nombre propio.

### negocio y stakeholders

- [data room estructura v1 — baseline pre-wedge](research_data_room_estructura_v1.md) — 2026-05-09 — `[fundraising]` — estructura DR ligera (one-pager + deck 12 slides + cap table); secciones `[post-wedge]` marcadas explícitas.
- [yc plan 86 días — f26 + w27 dos shots reales](research_yc_plan_86_dias.md) — 2026-05-09 — `[fundraising]` — 4 fases reverse-engineered desde deadline f26 estimado 1-ago; 5 inputs del pivot que el plan necesita lockeados (wedge / icp / métrica norte / pricing / canal).
- [hibp bloqueado por plan free de supabase](negocio_supabase_plan_free_hibp_bloqueado.md) — 2026-04-21 — `[desarrollo, finanzas]` — leaked password protection requiere Pro ($25 USD/mes).

### experimentos vivos

- [telegram como canal alterno de lecciones diarias](experimento_telegram_canal_lecciones.md) — 2026-04-27 — `[automatizacion, desarrollo]` — telegram bot @itera_la_bot; reemplazado por whatsapp como canal real (ver `decision_pivot_whatsapp_canal_real.md`), telegram queda sandbox.
- [hero rediseñado vía claude design](experimento_hero_claude_design.md) — 2026-04-22 — `[marketing]` — hero con shader interactivo de partículas.
- [representación visual de how it works cuando el producto aún no existe](experimento_how_it_works_visual.md) — 2026-04-22 — `[marketing, imagenes]` — visualización de flujo cuando UX está sin construir.

### metodología

- [estructura de departamentos funcionales (reemplaza posiciones)](metodologia_estructura_dominios.md) — 2026-05-08 — `[orquestador]` — conversaciones visibles por departamento + dominios de frontmatter.
- [ritual de cierre por dominio — escribir antes de cerrar sesión](metodologia_ritual_cierre_dominio.md) — 2026-05-04 — `[orquestador]` — cada conversación-dominio escribe sus decisiones nuevas antes de salir.
- [protocolo claude+codex — dos orquestadores trabajando juntos](metodologia_protocolo_claude_codex.md) — 2026-04-27 — `[orquestador, desarrollo]` — reglas de autonomía técnica; prototipos visuales aislados no son producto aprobado.
- [orquestación itera — 12 conversaciones paralelas + orquestador](metodologia_orquestacion_12_conversaciones.md) — 2026-04-22 — `[orquestador]` — modelo previo (12 conversaciones); ya migrado a 14 dominios (ver `metodologia_estructura_dominios.md`).

### gotchas

- [la amenaza competitiva real es duolingo entrando a AI antes que itera complete operación](gotcha_duolingo_pivote_ai_es_la_amenaza.md) — 2026-04-27 — `[producto, orquestador]` — moat de itera es la fase operación; duolingo puede comerla si llega primero.
- [3 tensiones de producto cross-departamental al cerrar ronda 10-preguntas](gotcha_tensiones_producto_cross_departamental.md) — 2026-04-27 — `[producto, orquestador]` — tensiones detectadas: hooks B2C vs B2B, viralidad vs licenciamiento, operación vs estudio.
- [supabase session pooler — usar aws-1-us-east-1, no aws-0-us-east-1](gotcha_supabase_pooler_aws1_us_east_1.md) — 2026-04-27 — `[desarrollo]` — "Tenant or user not found" = pool incorrecto; host directo es IPv6-only.
- [`git commit` sin pathspec levanta archivos staged de otros agentes](gotcha_commit_staged_files.md) — 2026-04-23 — `[desarrollo]` — usar `git commit -- <path>` con pathspec explícito.
- [cruces estructurales que reaparecen entre conversaciones itera](gotcha_cruces_estructurales_recurrentes.md) — 2026-04-22 — `[orquestador]` — patrones de fricción cross-departamental que se repiten.
- [posicionamiento real vs context_md (empresa vs latam universal)](gotcha_posicionamiento_empresa_vs_latam.md) — 2026-04-22 — `[marketing, producto]` — `CONTEXT.md` decía "LATAM no-técnico 55 años"; pablo aclaró B2B/empresa.
- [welcome email — hook en signup ya existe, falta hook en checkout](gotcha_welcome_email_hook_signup_existe.md) — 2026-04-22 — `[desarrollo]` — `auth/callback/route.ts:114-121` dispara welcome en signup; falta hook al `checkout.session.completed`.
- [deuda técnica acumulada en components/landing/](gotcha_landing_technical_debt.md) — 2026-04-22 — `[desarrollo, marketing]` — dead code con copy viejo + violaciones de `CLAUDE.md`; no bloqueante.
- [extraer pat de supabase cli desde macos keychain](gotcha_supabase_pat_desde_keychain.md) — 2026-04-21 — `[desarrollo]` — `security find-generic-password ... | base64 -d` para usar Management API.
- [oauth de supabase: allow_list con patterns /** es obligatorio](gotcha_supabase_oauth_allow_list.md) — 2026-04-21 — `[desarrollo]` — si falla matching, supabase cae silenciosamente a site_url.
- ["maximum update depth exceeded" casi siempre es un solo root cause](gotcha_max_update_depth_react_un_root_cause.md) — 2026-04-21 — `[desarrollo]` — buscar useMemo para objetos en deps.

---

## por dominio

### automatizacion

- [telegram como canal alterno de lecciones diarias](experimento_telegram_canal_lecciones.md) — experimento — 2026-04-27 *(comparte con desarrollo; reemplazado por whatsapp)*

### datos

*sin output todavía. cuando se defina north star metric o se instrumente analytics, vive aquí.*

### desarrollo

- [field test v0 del Simulador antes de construir runtime](decision_simulador_field_test_v0.md) — decision — 2026-05-12 *(comparte con producto, orquestador; face/construct/buyer validity antes de código)*
- [Sprint marketing_30d completo del Simulador v0](decision_simulador_sprint_marketing_completo_v1.md) — decision — 2026-05-12 *(comparte con producto, marketing, orquestador)*
- [arquitectura v0 de "El Simulador"](decision_simulador_arquitectura_v0.md) — decision — 2026-05-12 *(comparte con producto, orquestador)*
- [pivote whatsapp como canal real](decision_pivot_whatsapp_canal_real.md) — decision — 2026-04-28 *(comparte con marketing, finanzas, producto)*
- [setup whatsapp business api desde mexico](research_whatsapp_setup_mexico.md) — aprendizaje — 2026-04-28 *(comparte con finanzas)*
- [protocolo claude+codex](metodologia_protocolo_claude_codex.md) — metodologia — 2026-04-27 *(comparte con orquestador; prototipos aislados no son build aprobado)*
- [supabase session pooler aws-1 vs aws-0](gotcha_supabase_pooler_aws1_us_east_1.md) — gotcha — 2026-04-27
- [telegram como canal alterno](experimento_telegram_canal_lecciones.md) — experimento — 2026-04-27 *(comparte con automatizacion)*
- [mailing transaccional-only + ESP = AgentMail](decision_mailing_transaccional_only.md) — decision — 2026-04-23 *(comparte con producto)*
- [`git commit` sin pathspec](gotcha_commit_staged_files.md) — gotcha — 2026-04-23
- [mailing scope transaccional-only (legacy duplicate)](decision_mailing_scope_transaccional_only.md) — decision — 2026-04-22 *(comparte con producto)*
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
- [setup whatsapp business api desde mexico](research_whatsapp_setup_mexico.md) — aprendizaje — 2026-04-28 *(comparte con desarrollo)*
- [stripe-only + USD único + mercado pago descartado](decision_finanzas_stripe_only_usd_mp_descartado.md) — decision — 2026-04-24
- [stripe-only + USD único (legacy duplicate)](decision_cfo_stripe_only_usd_mp_descartado.md) — decision — 2026-04-24
- [hibp bloqueado por plan free supabase](negocio_supabase_plan_free_hibp_bloqueado.md) — negocio — 2026-04-21 *(comparte con desarrollo)*

### fundraising

- [inversores activos en b2b simulator + ai readiness (us + latam)](research_inversores_b2b_simulator_ai_readiness_2026.md) — aprendizaje — 2026-05-09 — mapeo de ~50 funds latam-friendly + edtech specialists.
- [comparables b2b simulator + ai literacy + corporate training](research_comparables_simulator_b2b_2026.md) — aprendizaje — 2026-05-09 — wharton/forage/attensi/mursion/whatfix/section ai.
- [yc canon 2026 — proceso, deal, fechas, qué buscan, app + interview, solo founder latam, pivots](research_yc_canon_2026.md) — aprendizaje — 2026-05-09 — verificado en ycombinator.com 9-may; f26/w27 sin fechas oficiales; estimado f26 ~1-ago.
- [yc tracción benchmarks w24-w26](research_yc_traccion_benchmarks_w24_w26.md) — aprendizaje — 2026-05-09 — solo founder no-us latam edtech b2b: 0.2-5% odds según tracción + network + rfs match.
- [data room estructura v1 — baseline pre-wedge](research_data_room_estructura_v1.md) — negocio — 2026-05-09 — DR ligero (one-pager + deck 12 + cap table); secciones post-wedge marcadas.
- [yc plan 86 días — f26 + w27 dos shots reales](research_yc_plan_86_dias.md) — negocio — 2026-05-09 — plan 4 fases bloqueado en 5 inputs del pivot (wedge / icp / métrica norte / pricing / canal).

### imagenes

- [representación visual de how it works](experimento_how_it_works_visual.md) — experimento — 2026-04-22 *(comparte con marketing)*

### legal

- [tercer caso canónico del Simulador — marketing_segment_with_sensitive_data](decision_simulador_third_case_segmentation.md) — decision — 2026-05-12 *(comparte con producto, marketing; primer caso con ambigüedad ética)*
- [legal backlog v1](decision_legal_backlog_v1.md) — decision — 2026-05-04

### marketing

- [primer caso canónico del Simulador — marketing_urgent_campaign_pii](decision_simulador_first_case_marketing.md) — decision — 2026-05-12 *(comparte con producto, ventas)*
- [tercer caso canónico del Simulador — segmentation](decision_simulador_third_case_segmentation.md) — decision — 2026-05-12 *(comparte con producto, legal)*
- [Sprint marketing_30d completo del Simulador v0](decision_simulador_sprint_marketing_completo_v1.md) — decision — 2026-05-12 *(comparte con producto, desarrollo, orquestador)*
- [convención IA mayúsculas, nunca AI](copy_convencion_ia_mayusculas.md) — copy — 2026-05-05 *(comparte con producto)*
- [pivote whatsapp como canal real](decision_pivot_whatsapp_canal_real.md) — decision — 2026-04-28 *(comparte con desarrollo, finanzas, producto)*
- [landing — estado al cerrar agente Landing 22-23 abril](decision_landing_estructura_post_pivote_b2b.md) — decision — 2026-04-23 *(comparte con producto)*
- [landing realineada a ejercicios interactivos](decision_landing_pivote_ejercicios.md) — decision — 2026-04-22 *(comparte con producto)*
- [hero rediseñado vía claude design](experimento_hero_claude_design.md) — experimento — 2026-04-22
- [representación visual de how it works](experimento_how_it_works_visual.md) — experimento — 2026-04-22 *(comparte con imagenes)*
- [posicionamiento real vs context_md](gotcha_posicionamiento_empresa_vs_latam.md) — gotcha — 2026-04-22 *(comparte con producto)*
- [deuda técnica components/landing/](gotcha_landing_technical_debt.md) — gotcha — 2026-04-22 *(comparte con desarrollo)*
- [nombres de secciones: "api" (no apis)](copy_nombres_secciones_api_mcp_skills.md) — copy — 2026-04-21

### orquestador

- [field test v0 del Simulador antes de construir runtime](decision_simulador_field_test_v0.md) — decision — 2026-05-12 *(comparte con producto, desarrollo; bloquea runtime hasta pasar matriz)*
- [Sprint marketing_30d completo del Simulador v0](decision_simulador_sprint_marketing_completo_v1.md) — decision — 2026-05-12 *(comparte con producto, marketing, desarrollo)*
- [arquitectura v0 de "El Simulador"](decision_simulador_arquitectura_v0.md) — decision — 2026-05-12 *(comparte con producto, desarrollo)*
- [estructura de departamentos funcionales](metodologia_estructura_dominios.md) — metodologia — 2026-05-08
- [ritual de cierre por dominio](metodologia_ritual_cierre_dominio.md) — metodologia — 2026-05-04
- [tesis core — concentración + operación](decision_tesis_concentracion_plataforma.md) — decision — 2026-04-27 *(comparte con producto; simulador IA refinado 2026-05-12)*
- [la amenaza competitiva real es duolingo](gotcha_duolingo_pivote_ai_es_la_amenaza.md) — gotcha — 2026-04-27 *(comparte con producto)*
- [3 tensiones de producto cross-departamental](gotcha_tensiones_producto_cross_departamental.md) — gotcha — 2026-04-27 *(comparte con producto)*
- [protocolo claude+codex](metodologia_protocolo_claude_codex.md) — metodologia — 2026-04-27 *(comparte con desarrollo; prototipos visuales no son producto aprobado)*
- [perplexity mcp instalado + heurística](aprendizaje_perplexity_mcp.md) — aprendizaje — 2026-04-22
- [orquestación itera — 12 conversaciones paralelas](metodologia_orquestacion_12_conversaciones.md) — metodologia — 2026-04-22 *(modelo previo; ya migrado a 14 dominios)*
- [cruces estructurales que reaparecen](gotcha_cruces_estructurales_recurrentes.md) — gotcha — 2026-04-22
- [pablo no delega manuales](aprendizaje_pablo_no_delega_manuales.md) — aprendizaje — 2026-04-21

### producto

- [field test v0 del Simulador antes de construir runtime](decision_simulador_field_test_v0.md) — decision — 2026-05-12 *(comparte con desarrollo, orquestador; lock experimental antes de runtime)*
- [primer caso canónico del Simulador — marketing_urgent_campaign_pii](decision_simulador_first_case_marketing.md) — decision — 2026-05-12 *(comparte con marketing, ventas)*
- [tercer caso canónico del Simulador — segmentation](decision_simulador_third_case_segmentation.md) — decision — 2026-05-12 *(comparte con marketing, legal)*
- [Sprint marketing_30d completo del Simulador v0](decision_simulador_sprint_marketing_completo_v1.md) — decision — 2026-05-12 *(comparte con marketing, desarrollo, orquestador)*
- [arquitectura v0 de "El Simulador"](decision_simulador_arquitectura_v0.md) — decision — 2026-05-12 *(comparte con desarrollo, orquestador)*
- [convención IA mayúsculas, nunca AI](copy_convencion_ia_mayusculas.md) — copy — 2026-05-05 *(comparte con marketing)*
- [pivote whatsapp como canal real](decision_pivot_whatsapp_canal_real.md) — decision — 2026-04-28 *(comparte con desarrollo, marketing, finanzas)*
- [tesis core — concentración + operación](decision_tesis_concentracion_plataforma.md) — decision — 2026-04-27 *(comparte con orquestador; simulador IA refinado 2026-05-12)*
- [la amenaza competitiva real es duolingo](gotcha_duolingo_pivote_ai_es_la_amenaza.md) — gotcha — 2026-04-27 *(comparte con orquestador)*
- [3 tensiones de producto cross-departamental](gotcha_tensiones_producto_cross_departamental.md) — gotcha — 2026-04-27 *(comparte con orquestador)*
- [landing — estado al cerrar agente Landing 22-23 abril](decision_landing_estructura_post_pivote_b2b.md) — decision — 2026-04-23 *(comparte con marketing)*
- [mailing transaccional-only + ESP = AgentMail](decision_mailing_transaccional_only.md) — decision — 2026-04-23 *(comparte con desarrollo)*
- [mailing scope transaccional-only (legacy duplicate)](decision_mailing_scope_transaccional_only.md) — decision — 2026-04-22 *(comparte con desarrollo)*
- [gamification estilo duolingo pero b2b](decision_gamification_duolingo_b2b.md) — decision — 2026-04-22 *(comparte con educacion)*
- [landing realineada a ejercicios interactivos](decision_landing_pivote_ejercicios.md) — decision — 2026-04-22 *(comparte con marketing)*
- [posicionamiento real vs context_md](gotcha_posicionamiento_empresa_vs_latam.md) — gotcha — 2026-04-22 *(comparte con marketing)*

### redes-sociales

*sin output todavía. cuando se arme content founder-led en TikTok/X/IG/LinkedIn, vive aquí.*

### soporte

*sin output todavía. crítico desde primer paying user. cuando se defina canal/SLA/KB, vive aquí.*

### ventas

- [primer caso canónico del Simulador — marketing_urgent_campaign_pii](decision_simulador_first_case_marketing.md) — decision — 2026-05-12 *(comparte con producto, marketing; tensión velocidad-vs-privacidad relevante a ventas)*
