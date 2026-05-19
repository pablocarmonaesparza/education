---
type: audit
title: Launch day runbook — T-0 hora-a-hora operativo + incident response
date: 2026-05-19
author: claude
reviewer: codex
status: published
scope: runbook ejecutable hora-a-hora para el T-0 día del launch oficial v1. Cubre cronograma operacional + incident response triggers + escalation paths. Operacionaliza el T-0 row de ready_state_t_minus_7.md
related:
  - docs/coord/audits/ready_state_t_minus_7.md (cronograma T-7 a T-0)
  - docs/strategy/v1_launch_playbook.md (rollback/escalate triggers)
  - docs/research/buyer_persona_head_marketing_latam.md (perfil leads esperados)
---

# Launch day runbook — T-0 operativo

## TL;DR

Cronograma hora-a-hora del día del launch. Cada bloque tiene: acción específica + owner + métricas de check + qué hacer si rojo.

**Timezone reference:** todas las horas son CDMX (UTC-6). CDMX/BOG misma timezone effective. Pablo está en MX.

**Filosofía:** este día NO es "lanzar y celebrar". Es "lanzar y monitorear". Las primeras 24h son las más críticas — bugs latentes se manifiestan, leads llegan, conversion path se valida.

## Pre-launch verification (06:00 - 07:00 CDMX)

| Hora | Acción | Owner | Done criterio | Si rojo |
|---|---|---|---|---|
| 06:00 | Pablo wake up + coffee | Pablo | n/a | descansar más (humano > timeline) |
| 06:15 | Vercel deployment check — latest commit en producción | Codex | `vercel ls` muestra ultimo tag | re-deploy desde Vercel dashboard |
| 06:20 | Supabase health check — schemas + RLS + sample query | Codex | query `select count(*) from simulador.organizations` retorna sin error | restart Supabase project si hay incident |
| 06:25 | Stripe LIVE mode verification + $1 test charge → refund | Codex + Pablo | Charge OK + refund OK | rollback launch — fix urgente, slip 24h |
| 06:30 | URL curl tests: `/`, `/pricing`, `/field-test/marketing-urgent-campaign-pii`, `/auth/login` | Codex | todos 200 OK | identificar 404/500, fix, retry |
| 06:35 | AgentMail check — mandar email test a Pablo personal | Codex | email recibido | escalate to AgentMail dashboard, posible fallback SendGrid |
| 06:40 | Final landing copy review — Pablo lee landing como un buyer cold | Pablo | Pablo confirma "lo lanzaría" | flip switch NO se ejecuta, iterate |
| 06:50 | LinkedIn schedule final check — post 1 listo para publicar manual | Pablo | borrador final en LinkedIn editor | ajustar texto si no convence |
| 07:00 | Decision time: ¿flip switch GO o NO-GO? | Pablo solo | decisión escrita en HANDOFF.md | NO-GO = slip 24h con razón clear |

**Si CUALQUIER acción 06:00-07:00 rojo:** Pablo decide GO/NO-GO. Default: NO-GO si gates críticos fallan (Stripe, AgentMail, deploy). OK slip si Pablo personal no está mentalmente listo.

## Launch ignition (07:00 - 09:00 CDMX)

| Hora | Acción | Owner | Done criterio | Si rojo |
|---|---|---|---|---|
| 07:00 | **FLIP SWITCH:** landing primary CTA cambia a "Agendar diagnóstico para mi equipo" | Pablo | curl `/` muestra nuevo CTA | rollback CTA via Vercel env flag (si M9-3-D17 cumplido feature-flagged) o git revert |
| 07:05 | Verify landing visual en mobile + desktop | Pablo + Codex | screenshots mobile 375px + desktop 1440px | hot-fix CSS si rompe, deploy |
| 07:10 | Publish LinkedIn post 1 (anuncio principal) | Pablo | post live en LinkedIn | si error LinkedIn, publish desde mobile alternativa |
| 07:15 | Newsletter Itera send (200-500 recipients) | Pablo | Mailchimp confirma "sent" | si fail, retry desde dashboard |
| 07:20 | Activate auto-responder en ventas@itera.la y soporte@itera.la | Pablo | test email triggers response | configure manual si auto-responder no funciona |
| 07:30 | First monitor check — Vercel logs + Stripe webhook health | Codex | 0 errors críticos | investigate immediately si hay |
| 08:00 | Hour 1 metrics aggregate — visits, signups, demo requests | Codex | métricas en HANDOFF.md template (M9-3-D19) | n/a — track regardless of values |
| 09:00 | Hour 2 metrics aggregate + Pablo personal outreach starts | Pablo + Codex | métricas + 1er DM enviado | n/a |

**Critical: hours 07:00 - 09:00 son las más visibles del día.** Si algo se rompe aquí, lo veremos primero los que clickeen del LinkedIn/newsletter.

## Active monitoring (09:00 - 18:00 CDMX)

### Loop cadence

Cada 2 horas (09:00, 11:00, 13:00, 15:00, 17:00):

| Acción | Owner | Done criterio |
|---|---|---|
| Vercel logs review (último 2h) | Codex | 0 errors críticos sin atender |
| Stripe webhook events review (último 2h) | Codex | 0 failed webhook deliveries |
| AgentMail bounce rate check | Codex | bounce rate <5% |
| Inbox `ventas@` y `soporte@` triage | Pablo | response sent o ticketed |
| LinkedIn post 1 engagement check (comments, DMs) | Pablo | respond comments + DM warm leads |
| Métricas aggregate en HANDOFF.md | Codex | row added per touch |

### Hour-specific actions

| Hora | Acción | Owner |
|---|---|---|
| 11:00 | Personal outreach burst — 5-10 LinkedIn DMs a contactos peer LATAM | Pablo |
| 13:00 | Aggregate hour 0-6 metrics → quick learnings (qué CTAs convierten, qué bounce alto) | Claude (compilation) + Pablo |
| 14:00 | First demo call si conversion happens early | Pablo |
| 15:00 | Mid-day comms — quick LinkedIn comment respondiendo question común | Pablo |
| 17:00 | EOD prep — start aggregating day-end metrics + first day learnings | Codex |

## Incident response triggers

Categorías de incident:

### 🟢 GREEN — continue + monitor

- 1 isolated bug 500 que NO impide checkout/signup
- LinkedIn comments con preguntas neutrales/positivas
- Métricas dentro del rango Week 1 verde (v1_launch_playbook)
- 0-2 demo requests early

**Acción:** seguir runbook normal. Document en HANDOFF.md.

### 🟡 YELLOW — pause new comms, fix in flight

- Bug que afecta conversion (signup roto, pricing page 500, runtime crashea)
- Stripe webhook failures >2 en 1 hora
- AgentMail bounce >10%
- 3+ negative comments en LinkedIn requiring response
- Demo requests > Pablo capacity (>3 en day 0)

**Acción:**
- Pablo **pausa LinkedIn post 2** (originalmente para T+1)
- Codex hot-fix priority 1
- Pablo responde leads críticos personalmente, deja secundarios para day +1
- HANDOFF.md update: "yellow incident — paused [X], fixing [Y]"

### 🔴 RED — rollback flip switch o escalate

- RLS leak (cross-org data exposure)
- Pago duplicado o cargo erróneo
- Judge LLM fail consistently (>30% sessions sin reporte)
- Compliance LATAM blocker emerge (autoridad MX/CO contact)
- Producto down (Vercel 5xx for >15 min)
- Customer reporta legal concern

**Acción:**
1. **Pablo flip switch back** — landing CTA → "Probar 1 caso de muestra" (rollback to field-test public only)
2. Codex hot-fix root cause
3. Pablo damage control comms: "estamos resolviendo un issue técnico, vuelvemos pronto" en LinkedIn
4. Email a leads que ya entraron: "vimos un issue, te avisamos cuando esté listo"
5. HANDOFF.md update: "RED incident — rollback executed, root cause [X]"

## EOD wrap (18:00 - 20:00 CDMX)

| Hora | Acción | Owner | Done criterio |
|---|---|---|---|
| 18:00 | Final metrics aggregate day 0 → HANDOFF.md | Codex + Claude | row final con 24h data |
| 18:30 | Pablo writes day 0 retro: qué funcionó, qué rompió, qué decidir mañana | Pablo | post mortem inline en HANDOFF.md |
| 19:00 | Decide: ¿LinkedIn post 2 (deep dive metodología) sigue scheduled para T+1 mañana? | Pablo | sí/no decisión en HANDOFF.md |
| 19:30 | Inbox final triage — todos los emails respondidos o tagged para mañana | Pablo | inbox zero o ≤5 pendientes con tag |
| 20:00 | Pablo desconecta (humano > timeline) | Pablo | computer cerrado |
| 22:00 | Codex passive monitor check (Vercel + Stripe + AgentMail) — sin acción a menos haya RED incident | Codex | check completed |

## Métricas day 0 a trackear

En HANDOFF.md template (prepared T-2):

| Métrica | Hour 1 | Hour 4 | Hour 8 | EOD |
|---|:---:|:---:|:---:|:---:|
| Landing visits | | | | |
| Pricing visits | | | | |
| Field-test page views | | | | |
| Field-test starts | | | | |
| Field-test completes | | | | |
| Demo requests (mailto + form) | | | | |
| Signups attempted | | | | |
| Signups successful | | | | |
| Stripe checkout opens | | | | |
| Stripe checkout completes | | | | |
| Email replies to ventas@ | | | | |
| Email replies to soporte@ | | | | |
| LinkedIn post 1 likes | | | | |
| LinkedIn post 1 comments | | | | |
| LinkedIn post 1 reshares | | | | |
| API 500 errors | | | | |
| Webhook failures | | | | |

**Target verde day 0 (alineado con week 1 v1_launch_playbook):**
- Landing visits ≥50
- Demo requests ≥1
- 0 API 500 errors críticos
- 0 webhook failures
- LinkedIn post 1 ≥20 reactions

**Target rojo (trigger escalate):**
- Landing visits <10 (signal weak comms)
- 0 demo requests + 0 signups (no conversion path)
- ≥3 API 500 errors (bugs visible)
- ≥1 webhook failure (Stripe broken)

## Communications discipline

### Pablo LinkedIn responses

**Comments positivos** ("interesante", "buen método"):
- Like + thank brief
- Si pregunta concrete, responde con 1-2 frases

**Comments curiosos** ("¿cómo funciona?"):
- Responde con frame canónico ("Itera mide el criterio operativo de tu equipo en uso de IA, no certifica skills")
- Link a landing si aplica

**Comments skeptical** ("¿no es solo un quiz fancy?"):
- Responde con 3 puntos defensibilidad (M9-3-D28: LLM detector + override matrix + hybrid review)
- NO defensivo — informativo

**Comments hostile** (rare, pero pueden pasar):
- Responde 1 vez con tono neutro
- NO entres en debate público — invita a DM si quieres profundizar
- Si escalates a flame war, mejor mute / report

### Email responses

**Lead inbound a ventas@:**
- Responde en <2 horas (target verde)
- Pregunta: org name + size + carrera + when usable date
- Si fit MGP: ofrece call 30 min con demo flow
- Si fit no-MGP (Sales/CS/Ops): explica v1 scope, agrega a waitlist, ofrece field-test mientras

**Lead inbound a soporte@:**
- Bug reports: triage P0/P1/P2, codex fixes P0
- Pregunta general: responde directly o forward a ventas@

## Pre-positioned communications

Borrados drafts en email + LinkedIn para emergency use:

### "Estamos resolviendo un issue" (RED incident)

```
Hola, gracias por escribirnos. Detectamos un issue técnico que estamos 
resolviendo activamente. Te avisamos en cuanto esté listo (típicamente 
1-3 horas). Lamento las molestias.

Pablo
ventas@itera.la
```

### "Demo en próximos días" (capacity overflow)

```
Hola, gracias por tu interés. Tenemos varias requests esta semana — 
te puedo confirmar slot para [día] [hora]. ¿Te queda bien?

Si no, escribe disponibilidad y vemos.

Pablo
```

### "v1 es Marketing/Growth, te avisamos cuando expandamos" (carrera fuera scope)

```
Hola, gracias por tu interés. v1 está calibrada para Marketing/Growth — 
los casos pueden no reflejar exactamente tu equipo de [carrera]. 
Te avisamos cuando expandamos (esperado [trimestre]).

Mientras tanto, prueba el field-test [link]. La metodología aplica 
cross-carrera, los casos cambian. Si te interesa hablar de tu use 
case específico, escribe back.

Pablo
```

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D49
    decision: "T-0 runbook hora-a-hora con 3 categorías incident (GREEN continue, YELLOW pause+fix, RED rollback). Pablo es decision-maker de category transitions; codex ejecuta fixes técnicos"
    rationale: "Sin categorías explícitas, todo issue se trata como crítico o todo como leve. 3 niveles dan claridad de when to escalate. Pablo decide category (judgment call), codex ejecuta (technical)."
    change_type: incident_response
    files_to_touch:
      - docs/coord/audits/launch_day_runbook.md
    owner: pablo + codex
    blocked_by: []
    priority: high

  - id: M9-3-D50
    decision: "Pre-positioned drafts (3 templates) para emergency use durante launch day. Pablo NO improvise responses bajo presión — usa drafts y customiza"
    rationale: "Bajo presión Pablo puede prometer cosas (free demo extensions, refunds inconditional, custom features) que después no podemos cumplir. Pre-positioned drafts mantienen consistencia + protegen de over-commit."
    change_type: comms_discipline
    files_to_touch:
      - docs/coord/audits/launch_day_runbook.md
    owner: pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D51
    decision: "Pablo desconecta a las 20:00 CDMX día del launch. Codex passive monitor 22:00 sin acción a menos RED incident. No worker insomnio — humano > timeline"
    rationale: "Burnout en T-0 destruye T+1/T+2. Pablo necesita estar fresh para demo calls en T+3 a T+5. Codex puede monitorear pasivamente sin decisiones — solo escala si crítico."
    change_type: human_constraint
    files_to_touch:
      - docs/coord/audits/launch_day_runbook.md
    owner: pablo
    blocked_by: []
    priority: high
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** runbook ready para usar cuando se decida launch.
2. **T-2 (weekend pre-launch):** Pablo + Codex review este doc + prepara HANDOFF.md template con tabla métricas vacía.
3. **T-0:** ejecutar este doc línea por línea. Cada acción tickee en checklist físico (papel) ayuda discipline.
4. **T+1:** retrospect inline de T-0 — qué del runbook no funcionó, qué refinar para próximo launch (Sales, CS, etc.).
