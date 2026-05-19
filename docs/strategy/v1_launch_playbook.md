---
type: strategy
title: v1 launch playbook — gates, cronograma, comms y métricas
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: cuando Pablo decida apretar el botón "lanzar v1 MX+CO B2B", este doc es el manual de operaciones. Define gates obligatorios pre-launch, cronograma de comms day-by-day, métricas a watch durante semanas 1/4/12, y triggers explícitos de rollback/escalate
related:
  - docs/coord/audits/v1_launch_readiness.md (M9.3 GO-CON-CAVEAT)
  - docs/research/onboarding_friction_b2b_latam.md
  - docs/research/buyer_persona_head_marketing_latam.md
  - docs/research/pricing_anchor_v2.md
  - lib/simulador/copy/landing.ts
---

# v1 launch playbook — manual de operaciones

## TL;DR

Cuando se decida lanzar v1 oficialmente (MX+CO B2B mid-market, Diagnóstico $4-8K), ejecutar en orden:

1. **4 gates pre-launch obligatorios** — todos deben estar GREEN
2. **Cronograma 14 días pre-launch + 28 días post-launch**
3. **Comms plan** — Pablo + sales-assisted, sin paid acquisition v1
4. **Métricas de éxito por semana** — week 1 (signal de funcionamiento), week 4 (signal de fit), week 12 (signal de retention)
5. **Triggers explícitos de rollback / escalate** — qué hacer si algo se rompe

Este doc NO decide cuándo lanzar — eso lo decide Pablo cuando los gates pasen. Este doc ejecuta el lanzamiento una vez decidido.

## Gates pre-launch obligatorios

### Gate 1 — B7-001 Stripe Checkout cerrado y verified

**Owner:** codex
**Estado actual:** in-flight (15:49:03 codex AGENT_STATUS)
**Criterio GREEN:**
- Stripe Checkout B2B funcional con 3 tiers (Diagnóstico/Sprint/Track)
- Customer Portal accesible post-pago
- Webhook idempotente confirmed (test mode + live mode)
- Refund button funciona (manual desde portal Stripe)
- 1 transacción end-to-end test mode pasada

**Workaround si NO GREEN:** sales-assisted con PO/wire usando `onboarding.ts.step4_billing.payment_wire_email` (ventas@itera.la). El producto es vendible v1 con asistencia manual.

### Gate 2 — Smoke E2E con datos reales

**Owner:** Pablo + codex
**Criterio GREEN:**
- 1 cuenta nueva real (no demo accounts) completa signup → onboarding org/team → invitación a 5 emails reales → pago test mode → 1 empleado completa caso vivo → reporte se genera → manager ve dashboard con bandas
- 0 errores en logs Supabase / Vercel
- Tiempos: signup→onboarding done <5 min · caso vivo 18-22 min · reporte generado <30s · dashboard refresca correctly

**Workaround si NO GREEN:** identificar bug específico, hot-fix, re-correr smoke. NO lanzar con smoke roto — los primeros 5 customers son sample crítico para retention.

### Gate 3 — Observabilidad mínima activa

**Owner:** codex
**Criterio GREEN (v1):**
- Vercel logs accesibles
- Supabase logs accesibles
- Email alert (Pablo + codex) cuando API 500 en `/api/sessions/*` o `/api/orgs/*`
- Stripe webhook failures alert
- Sin necesidad de Sentry full v1, pero alertas básicas SÍ

**Workaround si NO GREEN:** monitorear manualmente Vercel/Supabase dashboards 2-3 veces/día las primeras 2 semanas. Sentry obligatorio antes de >5 orgs paying (M9-3-D3).

### Gate 4 — Pablo flip switch landing CTA

**Owner:** Pablo
**Criterio GREEN:**
- Landing primary CTA cambia de "Probar 1 caso de muestra" → "Agendar diagnóstico para mi equipo"
- Field-test sigue activo como top-of-funnel (no se mata)
- Pricing page (/pricing) live y visible desde nav
- Footer con ventas@itera.la + soporte@itera.la accesible

**Workaround si NO GREEN:** no hay — esto es decisión de Pablo, no técnica. Sin flip switch, no hay launch oficial v1. El field-test sigue funcionando pero no se anuncia "lanzamos".

## Cronograma 14 días pre-launch + 28 días post-launch

### T-14 a T-7 (semana de preparación)

**T-14 (día 1 prep):**
- Lock copy actual (M9-3-D16): no más refactor de landing/sales/billing/onboarding/runtime/manager/auth/errors hasta post-customer-zero
- Confirmar 4 gates pre-launch en checklist con codex
- Pablo prepara 3 LinkedIn posts borradores (anuncio launch, deep dive del método, case del field-test)

**T-12 a T-9:**
- Codex cierra B7-001 si aún in-flight
- Codex agrega Sentry o monitoring básico
- Claude extender billing.ts/onboarding.ts/emails.ts con strings hybrid (M9-3-D7) post-B7-001 cierre

**T-7 a T-3:**
- Smoke E2E con datos reales (Gate 2) — Pablo + codex
- Soft launch a 3 contactos personales (no anuncio público)
- Capturar feedback qualitative de los 3 contactos
- Iterar bugs visibles

**T-2:**
- Tag git release `v1.0.0-launch`
- Snapshot DB pre-launch (backup Supabase)
- Pablo + codex review final del playbook

**T-1:**
- Verify production deployment is current
- Stripe live mode toggle (si aún en test)
- Email a 5 referidos potenciales con preview link

**T-0 (launch day):**
- Pablo flip switch landing CTA (Gate 4)
- Pablo publica anuncio LinkedIn principal (post 1 de 3)
- Newsletter a su lista personal LATAM (200-500 contactos según base)
- Activar email follow-up auto en ventas@itera.la y soporte@itera.la
- Monitor logs cada 2-3 horas durante primeras 24h

### T+1 a T+7 (primera semana post-launch)

**T+1:**
- Revisar metrics overnight (signups, traffic, conversions)
- Responder primeros leads en <12h
- Pablo publica LinkedIn post 2 de 3 (deep dive metodología)

**T+3:**
- First call con primer prospect serio
- Demo flow 30 min orden 5/15/5/5 (M9-3-D15)

**T+5:**
- LinkedIn post 3 de 3 (case del field-test, datos generales sin reveal)
- Touch-base por DM con 10 contactos peer LATAM

**T+7 (revisión semana 1):**
- Métricas week 1 → ver tabla abajo
- Decidir: continuar default mode / iterate / rollback

### T+8 a T+28 (semanas 2-4)

**T+14:**
- Si ≥1 customer cerró → "first customer announcement" post LinkedIn
- Si 0 customers → revisar funnel (lead capture? demo conversion? pricing objection?)

**T+21:**
- Si ≥3 customers cerrados → start "next 5" prep
- Si 1-2 customers → focus en retention/expansion del que cerró

**T+28 (revisión mes 1):**
- Métricas week 4 → ver tabla
- M9-3-D6 trigger check (pricing upgrade): si 5+ customers, qualitative "esperaba pagar más", CAC <6m, LATAM win >30% → considerar upgrade pricing
- Refresh research buyer persona (D14/D15/D16) con learnings reales

## Comms plan

### Canales activos v1

| Canal | Frecuencia | Owner |
|---|---|---|
| LinkedIn Pablo (personal brand) | 2-3 posts/semana | Pablo |
| LinkedIn Itera (company page) | 1 post/semana | Pablo |
| Newsletter Itera (existing list) | 2 sends/mes | Pablo |
| Email outbound a referidos peer | adhoc (5-10/sem) | Pablo |
| Sales-assisted calls | max 3/día (M9-3-D8) | Pablo |
| Soporte email | <12h response | Pablo + claude assist |

### Canales NO activos v1

- ❌ Paid acquisition (Google/Meta/LinkedIn ads): cero presupuesto v1
- ❌ Content marketing semanal (blog Itera): no hay capacidad
- ❌ SEO orgánico programmatic: no antes de customer-zero
- ❌ Webinars/eventos: post primer customer
- ❌ Partnerships universidad LATAM: post primer 5 customers
- ❌ Cold outbound masivo: rompe perfil del buyer LATAM (M9-3-D14)

### Mensaje principal v1

**Frame:** "Diagnóstico operativo de criterio en uso de IA — no certificación, no curso."

**Hook (LinkedIn opening):** "Tu equipo ya usa IA. La pregunta no es si — es con qué criterio. Itera mide eso."

**Proof points** (rotar entre posts):
- Stanford 88% adopción + MIT NANDA 95% sin impacto P&L (anglo authority)
- KPMG México 72% adopción MX + Capterra LATAM 44% empleados (local relevance)
- McKinsey 6% high performers — diferencia es proceso, no prompts (wedge)

**CTA:** "Agendar diagnóstico para mi equipo" → /pricing (no /contact)

## Métricas de éxito por semana

### Week 1 — Señal de FUNCIONAMIENTO

| Métrica | Target verde | Target rojo (escalate) |
|---|---|---|
| Visits landing /day | ≥50 | <10 |
| Conversion landing → pricing | ≥8% | <2% |
| Conversion pricing → checkout/demo request | ≥3% | <1% |
| Errores API 500 | 0 | ≥3 |
| Stripe checkout success rate | ≥95% (test mode) | <80% |
| Email response <12h | 100% | <80% |
| Bug reports críticos | 0 | ≥1 |

**Si rojo en cualquier:** rollback decisión + diagnose root cause + fix antes de seguir.

### Week 4 — Señal de FIT

| Métrica | Target verde | Target rojo |
|---|---|---|
| Customers cerrados | ≥1 | 0 |
| Demo requests/semana | ≥5 | <2 |
| Demo → close rate | ≥20% | <10% |
| Average days signup → first activation | ≤12 | >21 |
| First session NPS (post-completion) | ≥7/10 | <5/10 |
| Manager dashboard usage post-report | ≥3 visits/mgr | <1 visit/mgr |

**Si rojo en cualquier:** reunirse con primeros contactos, identificar fricción, iterate fast.

### Week 12 — Señal de RETENTION / EXPANSION

| Métrica | Target verde | Target rojo |
|---|---|---|
| Customers cerrados acumulados | ≥5 | <3 |
| % customers Fase 1 → conversación Fase 2 | ≥40% | <20% |
| Refund rate | ≤5% | ≥15% |
| Time signup → first activation (refinado) | ≤10 días median | >18 días |
| CAC payback (estimado) | <6 meses | >12 meses |
| LATAM win rate (cerrados vs demos) | ≥30% | <15% |

**Si verde en todos:** activar M9-3-D6 pricing upgrade evaluation + M9-3-D5 lock review.

**Si rojo:** retrospectiva profunda con primeros 5 customers + considerar reposicionamiento (NO solo iterar — el problema puede ser estratégico).

## Triggers explícitos de rollback / escalate

### Rollback completo (volver a pre-launch state)

Triggerea SOLO si:
- ✗ Bug crítico que pone en riesgo datos de customers (RLS leak, sensitive data exposure)
- ✗ Pago duplicado o cargo erróneo en Stripe (incident financiero)
- ✗ Judge LLM consistently fail (>30% sessions sin reporte funcional)
- ✗ Compliance LATAM blocker descubierto (autoridad MX/CO escala)

**Acción:** flip switch landing CTA → field-test only + comms apology + fix root cause + smoke real + re-launch decisión.

### Escalate (pause comms, no rollback)

Triggerea si:
- ⚠ Week 1 métricas rojas en ≥2 categorías
- ⚠ Bug críticos resolvable en <24h pero requieren atención full
- ⚠ Customer call queue >5 backed up (Pablo single-threaded)
- ⚠ Sentry alerts (cuando esté activo) sin atender >24h

**Acción:** pausar nuevos demos, fix priority items, drenar queue, retomar.

### Continue + monitor (sin acción urgente)

- ✓ Week 1 todo verde
- ✓ Week 4 algunas rojas pero no críticas (ej: NPS 6 en lugar de 7)
- ✓ Single bug isolated y working around

**Acción:** monitor weekly, iterate non-blocker fixes en sprints normales.

## Roles durante launch v1

| Rol | Responsable | Carga típica |
|---|---|---|
| Anuncio LinkedIn + comms public | Pablo | 4-6h/semana |
| Sales calls (max 3/día) | Pablo | 6-9h/semana |
| Soporte email | Pablo + claude assist | 2-4h/semana |
| Bug triage + fixes | Codex (technical) + Pablo (priority) | 5-15h/semana |
| Copy refinements (post-customer-zero) | Claude (auditing + suggestions) | autonomous |
| Pricing/expansion conversations | Pablo | adhoc |
| Compliance escalations | Pablo (no autoridad delegable) | adhoc |
| Refresh research / audits | Claude (autonomous) | autonomous |

**Single-threading caveat:** Pablo es bottleneck. Si surgen >5 demos/sem o >10 emails/día, agregar capacidad humana (contractor o intern) antes de scale.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D17
    decision: "No lanzar v1 público hasta que los 4 gates pre-launch estén GREEN. Sales-assisted soft launch a 3 contactos personales es aceptable como bridge entre T-7 y T-0, pero el flip switch landing CTA + LinkedIn anuncio principal espera 4/4 gates."
    rationale: "Soft launch a 3 conocidos da feedback qualitative sin riesgo de scale. Anuncio público con gates rotos rompe credibilidad — better delay 1 semana que lanzar con bug visible."
    change_type: process_launch
    files_to_touch:
      - docs/strategy/v1_launch_playbook.md
    owner: pablo
    blocked_by:
      - 4_gates_green
    priority: high

  - id: M9-3-D18
    decision: "v1 cero paid acquisition. Solo LinkedIn orgánico Pablo + newsletter + outbound peer + sales-assisted. Paid se evalúa post customer-zero (5 cerrados)."
    rationale: "Sin customer signal no hay base para evaluar CAC paid. Anchor del buyer LATAM mid-market es referido peer (M9-3-D14/D15). Paid ads early generan leads junk que rompen Pablo capacity (M9-3-D8 limit 3 calls/día)."
    change_type: comms_strategy
    files_to_touch:
      - docs/strategy/v1_launch_playbook.md
    owner: pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D19
    decision: "Métricas Week 1/4/12 son tracking explícito. Si rojo en cualquier categoría, escalate o rollback según severity definida en el playbook. NO iterate quietly en silence — la decisión de continue/escalate/rollback va público en HANDOFF.md."
    rationale: "Trackeo silencioso es donde se acumulan los problemas. Hacer la decisión de continue/escalate/rollback explícita en docs/coord/HANDOFF.md crea trazabilidad y forces decision-making conciously."
    change_type: process_observability
    files_to_touch:
      - docs/strategy/v1_launch_playbook.md
      - docs/coord/HANDOFF.md (decisión weekly post-launch)
    owner: pablo
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato (hoy):** Pablo lee este playbook + ajusta lo que disagree
2. **T-14 al T-7:** ejecutar checklist de gates con codex
3. **T-7 al T-0:** soft launch a 3 contactos + smoke E2E + fixes
4. **T-0:** flip switch landing CTA + anuncio LinkedIn principal + monitor
5. **T+7/+14/+28:** revisiones explícitas con métricas + decisión continue/escalate/rollback en HANDOFF.md
