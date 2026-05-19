---
type: audit
title: Ready state T-7 — pre-flight checklist semana antes de launch
date: 2026-05-19
author: claude
reviewer: codex
status: published
scope: checklist ejecutable day-by-day para la semana T-7 a T-0 antes del flip switch landing CTA + anuncio público v1. Operacionaliza el cronograma del v1_launch_playbook
related:
  - docs/strategy/v1_launch_playbook.md (cronograma 14 días pre-launch)
  - docs/coord/audits/v1_launch_readiness.md (4 gates obligatorios)
  - docs/coord/audits/decisiones_v1_inventory.md (SoT pre-launch)
---

# Ready state T-7 — pre-flight checklist

## TL;DR

Checklist day-by-day ejecutable para la semana antes del launch oficial v1. Cubre verification de los 4 gates obligatorios + smoke E2E con datos reales + comms borradores + soft launch a 3 contactos personales.

**T-7 a T-0 son 7 días que NO se improvisan.** Cada día tiene 3-5 acciones específicas con owner + criterio de done.

Si CUALQUIER día queda con accion incompleta, el launch se posterga. **No flip switch hasta 7/7 days green.**

## Pre-condition (T-14 a T-8)

Antes de arrancar este checklist, validar que durante T-14 a T-8 ya pasaron:
- ✓ Lock copy actual (M9-3-D16) — no more refactor de landing/sales/etc.
- ✓ 4 gates pre-launch ya en GREEN o claramente alcanzables
- ✓ Pablo prep 3 LinkedIn posts borradores
- ✓ Codex closed B7-001 o aceptado workaround PO/wire para v1

Si CUALQUIERA falta, NO arrancar T-7. Iterar primero.

## Day-by-day checklist

### T-7 (lunes anterior al launch)

**Owner: Pablo + claude (coord)**

| Acción | Done criterio | Owner |
|---|---|---|
| Confirmar 4 gates en GREEN (B7-001 close, smoke E2E, observabilidad, Pablo flip ready) | Cada gate marcado ✓ con commit hash o screenshot | Pablo + Codex |
| Identificar 3 contactos personales para soft launch (no anuncio público) | 3 emails identificados, agendas reservadas para T-3 a T-1 | Pablo |
| Verify Stripe configurado en LIVE mode (no test mode) | Dashboard Stripe muestra "Live data" | Codex |
| Snapshot DB pre-launch (backup Supabase) | Backup ID confirmed en Supabase dashboard | Codex |
| Tag git release `v1.0.0-launch-candidate` | Tag visible en GitHub releases | Codex |

**Gate check al final del T-7:** 5/5 done. Si <5, slip 1 día y revisar root cause.

### T-6 (martes)

**Owner: Codex (technical) + Pablo (verification)**

| Acción | Done criterio | Owner |
|---|---|---|
| Smoke E2E #1 datos reales — buyer onboarding completo (signup → org → team → invite → pay → done) | flow termina sin errores logs Vercel | Pablo + Codex |
| Verify webhook Stripe idempotente — test cancellation + refund + success | 0 duplicate charges en test mode dry run | Codex |
| Verify rate limits en `/api/sessions/*` (no muy estrictos para legitimate use) | rate-limit ≥10 req/min por user | Codex |
| Verify email AgentMail templates render correctly (invitation + welcome + report-ready + reset) | 4 templates inspeccionados visual | Codex |
| Update lib/simulador/copy/landing.ts.nav.cta_primary si Pablo quiere cambio último minuto | string change pushed + smoke surface | Claude |

**Gate check T-6:** 5/5 done.

### T-5 (miércoles)

**Owner: Pablo (comms) + claude (audit)**

| Acción | Done criterio | Owner |
|---|---|---|
| Soft launch contacto #1 — invitación privada a hacer Diagnóstico | Contacto recibió link, abrió, status tracking | Pablo |
| Pablo finaliza 3 LinkedIn posts (announcement principal + deep dive metodología + case del field-test) | 3 drafts en Drive o Notion, revisables | Pablo |
| Newsletter Itera body finalized para envío en T-0 | Draft en Mailchimp/ConvertKit/etc., listo para schedule | Pablo |
| Claude audit final: vocab canónico across todos los copy files que se importarán | Grep cero hits de skill/score/feedback/assessment fuera de JSDoc | Claude |
| Verify URL aliases / redirects funcionan (vanity URLs si los hay) | curl test de cada URL public | Codex |

**Gate check T-5:** 5/5 done.

### T-4 (jueves)

**Owner: Pablo (calls) + Codex (final fixes)**

| Acción | Done criterio | Owner |
|---|---|---|
| Soft launch contacto #2 — call de 30 min en demo flow 5/15/5/5 (M9-3-D15) | Call completada, feedback documentado | Pablo |
| Smoke E2E #2 — employee runtime completo (login con invitation → 6 secciones runtime → submit → report) | Reporte se genera, manager ve en dashboard | Pablo + Codex |
| Fix any bug identified en smoke (priority 1 only — no nice-to-haves) | Bugs P1 cerrados, commit + push | Codex |
| Verify Sentry o observability alerts working — disparar test error → confirmar alert llega a Pablo+Codex | Email alert recibido | Codex |
| Lock final commit — tag `v1.0.0-rc.final` | Tag visible en GitHub | Codex |

**Gate check T-4:** 5/5 done. **No more code changes después de este punto** (excepto bug P0 crítico).

### T-3 (viernes)

**Owner: Pablo (calls + comms) + Claude (final docs)**

| Acción | Done criterio | Owner |
|---|---|---|
| Soft launch contacto #3 — sales-assisted full flow (call + onboarding + pay test mode) | Contacto pagó test mode + recibió report draft | Pablo |
| Aggregate feedback de 3 soft launch contacts | Documento "soft launch learnings" con 3-5 issues identificados | Pablo + Claude |
| Decide: ¿issues identificados son P0/P1 bloqueantes o P2 deferrable? | Decisión documentada en HANDOFF.md | Pablo |
| Pablo schedule LinkedIn posts (post 1 para T-0, post 2 para T+1, post 3 para T+5) | LinkedIn scheduling tool confirma | Pablo |
| Claude refresh `decisiones_v1_inventory.md` con estados finales T-3 | Inventory commit pushed | Claude |

**Gate check T-3:** 5/5 done. Si P0/P1 bloqueantes → slip launch. P2 deferrable OK.

### T-2 (sábado o domingo)

**Owner: Pablo solo (descanso técnico)**

| Acción | Done criterio | Owner |
|---|---|---|
| Pablo descansa (no code changes) | n/a — cualquier "iteración impulsiva" hoy daña launch | Pablo |
| Claude prepara HANDOFF.md launch-day template (placeholders para métricas hora-a-hora) | Template visible en repo | Claude |
| Verificación pasiva: monitor Vercel logs + Stripe webhook health últimas 48h | 0 anomalías | Codex (revisión automática) |
| Lista final de emails para newsletter (verify list está clean) | Mailchimp/ConvertKit final list ≥200 recipients | Pablo |

**Gate check T-2:** 4/4 done.

### T-1 (día antes del launch)

**Owner: Pablo + Codex (standby)**

| Acción | Done criterio | Owner |
|---|---|---|
| Verify production deployment is current (latest tag deployed, no pending PRs) | Vercel dashboard confirma | Codex |
| Email warmup a 5 referidos potenciales con preview link | 5 emails enviados | Pablo |
| Re-check todas las URLs publicas funcionan (curl test) | curl /pricing → 200, curl / → 200, curl /field-test/[slug] → 200 | Codex |
| Stripe live mode dry run final con $1 test charge (refund immediate) | Charge + refund completados sin fricción | Pablo + Codex |
| Pablo mental prep: review demo flow 5/15/5/5 + 5 puntos defensibilidad judge | n/a (mental prep) | Pablo |

**Gate check T-1:** 5/5 done.

### T-0 (launch day)

**Owner: Pablo (foreground) + Codex (standby + monitoring)**

| Hora | Acción | Done criterio | Owner |
|---|---|---|---|
| Mañana early | Verify final: gates 4/4 GREEN último check antes flip | screenshot dashboard | Codex |
| Mañana early | Pablo flip switch landing CTA → "Agendar diagnóstico para mi equipo" | landing URL muestra nuevo CTA | Pablo |
| Mañana early | LinkedIn post 1 publicado (anuncio principal) | post live, comentarios habilitados | Pablo |
| Mañana early | Newsletter Itera send to ~200-500 recipients | Mailchimp confirma send | Pablo |
| Mañana | Email follow-up auto activated en ventas@itera.la + soporte@itera.la | autoresponder verified | Pablo + Codex |
| Tarde | Monitor logs cada 2 horas (12pm, 2pm, 4pm, 6pm local) | log review documented en HANDOFF.md cada touch | Codex |
| Tarde | Pablo personal outreach a 5 contactos peer LATAM con link nuevo | 5 mensajes enviados via DM/email | Pablo |
| Noche | Aggregate métricas day 0 (visits, signups, demo requests) | métricas en HANDOFF.md template prepared T-2 | Claude (compilation) + Pablo |

**Gate check T-0 end-of-day:** 8/8 done. Si rojo en cualquier acción crítica (CTA no flip, post no published, errors detectados), seguir incident response (v1_launch_playbook triggers).

## Criterios explícitos de NO launch

Si T-3 EOD identifica:
- ✗ Bug P0 crítico sin fix
- ✗ Gate 1 (B7-001) NO close + workaround PO/wire también NO listo
- ✗ Gate 3 (observability) sin Sentry NI alerts manuales activas
- ✗ Gate 4 — Pablo NO ready / dudoso

→ **slip launch 1 semana**. Mejor delay que lanzar con problema visible.

Si T-1 EOD identifica:
- ✗ Stripe live mode charge fail
- ✗ Vercel deployment dirty (pending PR sin merge)
- ✗ ≥1 critical alert sin atender 48h

→ **slip launch 24-48h** + fix root cause + re-execute T-1 checklist.

## Soft launch contacts profile

Los 3 contactos personales del soft launch (T-5 a T-3) deben cumplir:

**Perfil ideal:**
- Head/VP Marketing/Growth/Ops en mid-market LATAM (50-300 empleados)
- Conocido directo de Pablo (no cold)
- Dispuesto a hacer Diagnóstico real (no solo "ver demo")
- Dispuesto a dar feedback honesto vs polite
- NO competidores directos de Itera
- NO público (no Founder con redes sociales grandes que vaya a postear pre-launch)

**Por qué 3 (no 1, no 5):**
- 1 contacto: signal débil, anecdotal
- 3 contactos: cubre 3 industrias o 3 perfiles → triangulación
- 5+ contactos: pre-launch leak risk, fatiga de Pablo

**Lo que NO buscamos en soft launch:**
- Validation marketing (eso es post-launch)
- Pricing pressure ("¿es muy caro?" — sabemos del research)
- Feature requests
- Reviews positivos para usar como testimonials (no ético sin contexto)

**Lo que SÍ buscamos:**
- Friction points UX (onboarding confuso? signup roto?)
- Comprensión del frame ("¿qué creés que vende Itera?")
- Reaction al reporte ejecutivo ("¿esto te serviría?")
- Trust signal ("¿pagarías sin call adicional?")

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D43
    decision: "T-7 a T-0 es checklist day-by-day estricto. CUALQUIER acción incompleta = slip launch 1 día (T-7 a T-4) o 24-48h (T-3 a T-1). NO flip switch hasta 7/7 days green"
    rationale: "Launches B2B mid-market LATAM no toleran 'lanzo y veo' — primer customer recibe la experiencia y si hay bugs visibles, dañamos credibilidad. Mejor delay que lanzar mediocre."
    change_type: launch_process
    files_to_touch:
      - docs/coord/audits/ready_state_t_minus_7.md
    owner: pablo + codex
    blocked_by:
      - launch_decision
    priority: high

  - id: M9-3-D44
    decision: "Soft launch 3 contactos personales (NO 1 NO 5) cubriendo Head/VP MGP/Ops mid-market LATAM conocidos directos. Buscamos friction UX + comprensión del frame + reaction al reporte + trust signal. NO buscamos validation marketing, testimonials, ni feature requests"
    rationale: "3 = triangulación sin pre-launch leak risk. Conocidos directos = feedback honesto vs polite. Buscamos diagnostic data, no PR material."
    change_type: process
    files_to_touch:
      - docs/coord/audits/ready_state_t_minus_7.md
    owner: pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D45
    decision: "T-4 EOD es 'code freeze' final. Después de T-4 solo bug P0 crítico. NO nice-to-haves, NO refactor, NO copy iterations. Pablo + codex respetan freeze"
    rationale: "Code changes en T-3/T-2/T-1 multiplica risk de bug introducido sin tiempo de smoke. Freeze T-4 da 3 días para validar production estado sin churn. Industry standard B2B launches."
    change_type: launch_process
    files_to_touch:
      - docs/coord/audits/ready_state_t_minus_7.md
    owner: codex
    blocked_by: []
    priority: high
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** este checklist es referencia. NO se ejecuta hasta Pablo decida iniciar el cronograma launch.
2. **T-7:** Pablo + codex arrancan el checklist day-by-day siguiendo este doc.
3. **T-0 EOD:** aggregate métricas day 0 en HANDOFF.md weekly tracking (M9-3-D19).
4. **Post-launch:** retrospect del checklist en T+14 — qué funcionó, qué no, qué refinar para v2 launch.
