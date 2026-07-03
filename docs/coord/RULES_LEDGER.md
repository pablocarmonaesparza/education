# Rules Ledger — reconciliación del sistema de reglas

Fuente: auditoría completa del sistema de reglas (2026-07-01, Claude Code + 10 agentes,
208 reglas mapeadas en 7 subsistemas, hallazgos verificados contra código antes de
registrarse). Este ledger es el registro único de contradicciones entre reglas, y entre
reglas y código. **Una contradicción no se deja viva: o se arregla el código, o se deroga
la regla formalmente (decisión registrada). Nunca ambas versiones a la vez.**

Ejecutor único desde 2026-07-02: Claude Code ejecuta todos los carriles (decisión Pablo, plan de lanzamiento).

Estados: `open` → `decided` (hay resolución elegida) → `fixed` (código/doc ya refleja la
resolución). `needs-pablo` = bloqueado en decisión de Pablo (ver PABLO_INPUT_NEEDED.md).

## Dinero (bloqueantes de venta)

| ID | Contradicción | Resolución | Dueño | Estado |
|---|---|---|---|---|
| R-01 | CHECK de `subscriptions.tier` solo acepta tiers legacy `fase_*` (017_simulador_v0.sql:106); el código escribe `team/business/business_plus` (simuladorBilling.ts:142). Toda compra cobra en Stripe y falla la activación local. | Migración que actualiza el CHECK a los tiers vigentes + test de inserción por tier. | claude | fixed 2026-07-02 (migración 20260702120000 aplicada en remoto+local; test insert 4 tiers PASS + legacy rechazado) |
| R-02 | Webhook Stripe solo maneja `checkout.session.completed` (stripe-webhook/route.ts:70). Cancelación/impago/renovación no existen: org cancelada conserva acceso y no puede recomprar (guard 409). | Handlers para `customer.subscription.updated/deleted` + `invoice.payment_failed` que sincronizan status y period_end. | claude | open |
| R-03 | El copy promete waitlist de asientos (onboarding.ts:170) pero invitaciones/sesiones/dashboard no consultan `subscriptions` ni `seats` (grep = 0). Pagar no gatea nada. | Gate de seats en invitaciones; alcance exacto según decisión pablo-005. | claude | needs-pablo |
| R-04 | Doble pricing público: landing renderiza SPRINT_META por fases ($4-8K, config.ts:202) vs checkout per-seat $109-149 (billing.ts:36). billing.ts además cita un doc de decisión que no existe. | Decisión de pricing público es bloqueante sin default (pablo-004). Tras decisión: una sola fuente de precio. | pablo → claude (UI) | needs-pablo |
| R-05 | create-checkout-session conserva path legacy que consulta `public.users` — tabla purgada (migración 20260519040000) y prohibida por la regla anti-regresión. Código muerto fail-closed. | Eliminar el path legacy completo + STRIPE_PRICES monthly/yearly de lib/stripe/config.ts. | claude | open |

## Seguridad

| ID | Contradicción | Resolución | Dueño | Estado |
|---|---|---|---|---|
| R-06 | Docstrings juran que el dev bypass "NUNCA funciona en producción real", pero `NEXT_PUBLIC_DEV_BYPASS_ENABLED=1` (activa hoy en itera.la) lo habilita en prod (devBypass.ts:11), y los GET admin sirven PII de leads vía service_role checando solo `staff.ok`, nunca `staff.user` (admin-auth.ts:31, leads/route.ts:74). | Apagar la flag en Vercel prod ANTES de datos reales (ya registrado en memoria); restringir el override a preview; `requireSimuladorStaff` exige user en GETs con PII; corregir docstrings. | claude | fixed 2026-07-02 (flag eliminada de Vercel prod + redeploy verificado con curl 401; isDevBypassEnabled devuelve false incondicional en VERCEL_ENV=production — simulado 7/7 entornos PASS; docstrings corregidos) |
| R-07 | Anti-spoiler ("no enseñar antes de medir") roto a nivel BD: policy `authenticated_read_rubric_criteria` da SELECT de criterios/umbrales/penalizaciones a cualquier autenticado, sin filtrar `is_public` (019_simulador_rls.sql:235). | Migración: policy `using (is_public = true)`; detalle interno solo service_role. | claude | open |
| R-08 | `grant all` + default privileges sobre toda tabla futura del schema `simulador`; la regla implícita "toda tabla tiene RLS" no tiene check. La primera migración que olvide `enable row level security` expone la tabla completa. | Check en `check:simulador` que falle si alguna tabla del schema tiene `rowsecurity=false`. | claude | open |
| R-09 | Share links de reportes emiten tokens de 30 días hacia `/shared/report/[token]` — página que no existe (404) y que FRONT_CONTRACT declara fuera de esta versión; `revoked_at` sin lectores. | Retirar el endpoint de generación hasta que exista la vista pública (o construirla validando hash+expiry+revocación en un solo PR). | claude | open |

## Integridad del diagnóstico

| ID | Contradicción | Resolución | Dueño | Estado |
|---|---|---|---|---|
| R-10 | Quality bar ("un caso no entra a BD si no pasa") sin candado: seed-cases.mjs sube sin invocar validadores; CI no corre `check:simulador`. Todo el arsenal de validación es opcional en la práctica. | seed valida antes del upsert (exit 1 si falla) + `check:simulador` como step de CI. | claude | open |
| R-11 | La rúbrica congelada declara band-caps deterministas (PII → banda B en datos, etc.); el código solo capea la recomendación, nunca la banda (grep cap_dimension_band = 0). | Implementar band-caps en apply-overrides.ts o retirarlos formalmente de la rúbrica. | claude | open |
| R-12 | `public_score: false` ("el score numérico NUNCA se renderiza") vs reporte y PDF que muestran score (report page, generate-pdf.ts:225). | Decisión pablo-003. Default recomendado: derogar public_score:false (el reporte con score ya pasó revisión de Pablo) y alinear bandas (R-13). | claude | fixed 2026-07-02 (default 24h ejecutado: public_score:true en CASE_ASSEMBLY_SCHEMA con racional; bandas alineadas vía R-13) |
| R-13 | Cortes de banda divergentes: YAML canónico B 0-64 / M 65-84 / A 85-100 vs reports/model.ts (A>75, M=60). El mismo score se clasifica distinto según el subsistema. | Constante compartida de cutoffs importada por rúbrica y reportes; alinear al YAML. | claude | fixed 2026-07-02 (BAND_CUTOFFS/bandFromScore100 en config.ts, espejo del YAML; reports/model y dashboard recableados — cero cortes locales) |
| R-14 | Política "no re-evaluamos reports históricos" vs `?force=1` que re-corre el juez con la rúbrica actual y sobreescribe; persist.ts filtra idempotencia solo por sesión, contradiciendo su docstring. | force verifica rubric_version original y exige confirmación o marca el report como re-evaluado; corregir docstring. | claude | open |
| R-15 | Gate de completitud solo client-side: POST /complete no valida respuestas; un cliente modificado cierra con 0 respuestas y genera reporte al manager. | /complete cuenta response_update distintos vs case_steps y rechaza (o marca parcial) bajo umbral. | claude | open |
| R-16 | SLA 24h de doble firma high-risk sin enforcement: `due_at` solo se muestra en UI admin; sin crons. | Cron Vercel diario que alerte vencidos de human_review_queue. | claude | open |
| R-17 | apply-overrides.ts afirma que `simulador.compute_recommendation` SQL "codifica las mismas reglas"; divergieron (pausar/entrenar distintos) y la SQL no tiene callers. | Retirar la función SQL (espejo muerto) o sincronizar; corregir el claim. | claude | fixed 2026-07-02 (drop en migración 20260702130000, aplicada local+remoto; claim corregido en apply-overrides) |
| R-18 | ENGINE_CONTRACT: "DeepSeek primario, no Anthropic en v0" vs run.ts: Anthropic primario si hay key. La política de proveedor depende de la env, no de una decisión. | Decisión pablo-006. Default: env `SIMULADOR_JUDGE_PROVIDER` explícita + actualizar contrato a la realidad elegida. | claude | fixed 2026-07-02 (env explícita en run.ts, Anthropic primario default; ENGINE_CONTRACT §4 actualizado; regla de re-calibración escrita) |
| R-29 | lib/simulador/cases.ts es mock declarado ("cuando se cablee BD…") consumido por páginas productivas (/casos, /reportes, /team, /staff/casos, /admin/cases). | Cablear a datos reales (generated_cases/case_templates + destination); API = codex, consumo UI = claude. | claude | open |

## Contratos y docs (deriva)

| ID | Contradicción | Resolución | Dueño | Estado |
|---|---|---|---|---|
| R-19 | CLAUDE.md declara la división de roles vieja (Codex lead de UI); la vigente es opción A (Claude lidera UI, decisión Pablo 2026-06-25). | Actualizar sección de roles de CLAUDE.md. | claude | fixed 2026-07-01 |
| R-20 | AGENTS.md cita `components/ui/` (no existe) y omite el design system real (`components/simulador/apple/` + /design). | Actualizar sección Design system + agregar jerarquía de reglas. | claude | fixed 2026-07-01 |
| R-21 | FRONT_CONTRACT ("si no está aquí, no existe") declara 40 rutas; hay 47. `/motores` afirma estar registrada (falso) y no está en internalReviewRoutes → servida en prod. | Resync de la tabla + registrar/404ear `/motores` (proxy = codex) + gate `check-routes` que compare app/ vs contrato. | claude | doc fixed 2026-07-01 · proxy fixed 2026-07-02 (/motores en internalReviewRoutes) · gate check-routes pendiente (F3) |
| R-22 | Skill `.claude/skills/itera-review` es fósil del LMS: referencia 4 artefactos inexistentes (METODOLOGIA.md, lint-lessons.py, upload-slides.py, content/lessons). Viola la regla anti-regresión. | Eliminar la skill (o reescribirla contra el quality bar del simulador). | claude | fixed 2026-07-01 (eliminada) |
| R-23 | judge_calibration_spec.md describe el sistema viejo (5 dimensiones, 50 celdas, caso marketing_pii); el tooling real exige 6 dimensiones y usa sales_agent_followup. | Reescribir el spec contra el set v2 o marcarlo HISTÓRICO con puntero. | claude | fixed 2026-07-01 |
| R-24 | docs/simulador/contrato_v0/schema/simulador_v0.sql divergió de las migraciones (sin `submitted`, dimensiones legacy). | Header "snapshot histórico — la verdad vive en supabase/migrations/". | claude | fixed 2026-07-01 |
| R-25 | SHELL_SPEC exige `bun build` (DEC-010 declaró npm) y especifica /field-test como surface viva (retirada; el demo vive en /case-demo). copy/README igual. | Pasada de limpieza editorial. | claude | fixed 2026-07-01 |
| R-26 | app/sitemap.ts anuncia `/about` — la ruta no existe (404 en el sitemap). | Quitar del sitemap. | claude | fixed 2026-07-01 |
| R-27 | Docstrings stale: mock-output.ts (prod sin key "lanza error" — falso), exercise-registry.ts (plan "Día 3" + registry vacío), CASE_ASSEMBLY migration_notes (describe archivos borrados), ENGINE_CONTRACT "[pendiente F3]" ya implementado. | Limpieza de comentarios; borrar exerciseRegistry vacío. | claude | docs fixed 2026-07-01 · judge code open (codex) |
| R-28 | FRONT_CONTRACT describe runtime de "6 secciones (…Decisión → Respuesta)" en 4 lugares; el canon son 5 secciones × 5 slides y el validador lo hace cumplir. | Sync editorial al modelo 5×5. | claude | fixed 2026-07-01 |

## Reglas de proceso (sin gate posible — se marcan manuales)

- Claim-before-edit en BUILD_BOARD, heartbeats en AGENT_STATUS, esquema de inboxes:
  cumplimiento por disciplina. Se aceptan como manuales; el gate es la revisión del otro
  agente.
- Quality bar pedagógico completo (tensión real, acción observable, resim, remedial):
  la parte estructural la valida check-assembled-case (tras R-10 será gate); la parte de
  juicio pedagógico sigue siendo review humano/LLM — manual por diseño.
