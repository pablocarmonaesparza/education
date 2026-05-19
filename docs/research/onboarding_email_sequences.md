---
type: research
title: Onboarding email sequences — nurture post-signup / post-invite / post-sprint
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: 3 secuencias de email transaccionales+nurture que mantienen engagement de participantes y managers durante el sprint. Extiende emails.ts (B7-002 base) con sequences calendarizadas — no solo emails one-shot
related:
  - lib/simulador/copy/emails.ts (B7-002 — 8 templates one-shot existentes)
  - lib/email/simulador-notifications.ts (codex integración AgentMail)
  - docs/research/onboarding_friction_b2b_latam.md (M9-3-D7 hybrid model)
  - docs/research/post_customer_zero_survey_template.md (survey scheduling)
---

# Onboarding email sequences — nurture calendarizado

## TL;DR

`lib/simulador/copy/emails.ts` actual tiene 8 templates **one-shot** (signup_welcome, invitation, invitation_accepted, case_assigned, report_ready_employee, report_ready_manager, sprint_closing, password_reset). Esto cubre transactional needs pero NO nurture.

**Nurture gap:** entre touchpoints transaccionales, hay días silentes donde participants se distraen o managers olvidan el sprint. Una secuencia bien diseñada mantiene engagement sin spam.

**3 secuencias propuestas** (extender emails.ts en Fase 1 v2 post-customer-zero o cuando codex tenga bandwidth):

1. **Manager Onboarding Sequence** — 4 emails durante sprint window (días 1, 7, 14, 21 del sprint)
2. **Participant Engagement Sequence** — 3 emails post-invitation acceptance (días 0, 3, 7 si NO completion)
3. **Post-Sprint Nurture Sequence** — 4 emails post-sprint cierre (días 0, 14, 30, 90)

Total: 11 emails calendarizados (excluding one-shot transactional ya en emails.ts).

## Principios de nurture B2B mid-market LATAM

Antes de email content, principios:

1. **Conversacional NO corporate.** Pablo voice, no marketing-bot. "Hola [name], ..." sin "Estimad@/Querid@".
2. **Frequency conservadora.** B2B LATAM tolerance: ~1 email/semana max. Más es spam.
3. **Cada email tiene 1 CTA primary.** No 3-4 links que confunden.
4. **Lowercase corporate LATAM.** Vocab canónico (criterio/diagnóstico/manager/banda).
5. **Cero AI slop.** No "revoluciona tu equipo", no "transforma tu organización".
6. **Opt-out claro.** Footer con unsubscribe link en cada email.
7. **Mobile-first text.** 50% emails B2B LATAM se leen en mobile. Body ≤500 caracteres, no slides.

## Secuencia 1 — Manager Onboarding

**Audiencia:** manager principal post-pago del sprint.

**Trigger:** sprint contracted + sprint window iniciado.

### Email 1 — Día 1 (sprint start)

**Subject:** Tu equipo arranca el diagnóstico

**Body:**
```
Hola [manager_first_name],

Tu sprint de diagnóstico arranca hoy. [N] de tus participantes 
recibieron su invitación.

3 cosas que te conviene saber:

1. El caso toma ~20 minutos por persona. No requieren coordinación 
síncrona — lo hacen cuando puedan.

2. Verás progreso en tu dashboard: [dashboard_url]

3. Si pasan 3 días sin actividad de algún participante, te mando 
un recordatorio para que lo veas con él/ella.

Cualquier duda, responde directo.

Pablo
```

**CTA primary:** [dashboard_url]
**Trigger metric:** open rate ≥80% (industry standard for transactional + welcome)

### Email 2 — Día 7 (mid-sprint check)

**Subject:** [N/total] completaron el diagnóstico — primera lectura

**Body:**
```
Hola [manager_first_name],

Semana 1 del sprint. Status:

· [N_completed] de [N_invited] completaron el caso
· [N_in_progress] en progreso
· [N_not_started] aún no arrancaron

Ya puedes ver los reportes de quienes terminaron en tu dashboard:
[dashboard_url]

Si quieres aceleración: el caso lo pueden hacer cuando quieran, 
20 min cualquier día. Si necesitas que recordemos a alguien 
específico, responde con su nombre.

Pablo
```

**CTA primary:** [dashboard_url]
**Trigger metric:** open rate ≥70%; click rate ≥40%

### Email 3 — Día 14 (mid-sprint engagement)

**Subject:** ¿Quieres que veamos cómo va con tu equipo?

**Body:**
```
Hola [manager_first_name],

Semana 2 del sprint, [N_completed]/[N_invited] completados.

Si quieres, te propongo 15 minutos en zoom esta semana para:

· Repasar reportes ya generados juntos
· Ver patrones que ya están emergiendo
· Resolver preguntas sobre los próximos pasos (pilotar/entrenar/
  pausar/escalar)

[link_calendly_pablo]

O si prefieres, dejamos esto correr hasta el cierre del sprint
en [N_days] días. Tu call.

Pablo
```

**CTA primary:** [link_calendly_pablo]
**Trigger metric:** book rate ≥20% (qualified leads B2B mid-market expand opportunity)

### Email 4 — Día 21 (sprint cierre + handoff)

**Subject:** Sprint cerrado — tu reporte está listo

**Body:**
```
Hola [manager_first_name],

Sprint cerrado. Aquí está el resumen:

· [N_completed] de [N_invited] completaron ([completion_pct]%)
· Banda promedio: [avg_band]
· Eventos de riesgo detectados: [risk_count]
· Recomendaciones por persona en tu dashboard

Ve el reporte ejecutivo agregado del equipo:
[team_report_url]

Dos próximos pasos típicos:

1. Compartir reporte con stakeholders (CMO/COO/CEO) — el reporte 
está hecho para ser legible por C-suite, no solo por ti.

2. Decidir Fase 2: si quieres practice + re-simulación + reporte 
de progreso, agenda 30 min: [link_calendly_pablo]

Si tienes feedback del proceso, te llega un survey en 2 semanas.

Gracias por confiar.

Pablo
```

**CTA primary:** [team_report_url]
**Secondary:** [link_calendly_pablo]
**Trigger metric:** Fase 2 booking rate ≥30% (RCI proxy)

## Secuencia 2 — Participant Engagement

**Audiencia:** participantes invitados.

**Trigger:** participant accepted invitation + auth completed.

### Email 1 — Día 0 (right after invitation accept)

**Subject:** Listo, tu caso te espera

**Body:**
```
Hola [participant_first_name],

Te invitaron a hacer el diagnóstico de criterio operativo en uso 
de IA para tu equipo.

3 cosas:

1. El caso toma 18-22 minutos. Sin examen, sin trampa, sin 
"respuesta correcta" obvia. Decides cómo abordas una situación 
real bajo presión.

2. Tu manager NO ve tus respuestas individuales — ve el reporte 
ejecutivo que indica bandas y patrones. Te recomendamos honestidad: 
es para medir, no para grading.

3. Si tienes 20 minutos hoy, mejor hazlo de un saque. Pausar y 
retomar es posible pero el contexto se pierde.

Cuando quieras: [case_url]

Cualquier duda técnica: soporte@itera.la

Pablo
```

**CTA primary:** [case_url]
**Trigger metric:** completion within 48h ≥50%

### Email 2 — Día 3 (gentle reminder si NO completion)

**Subject:** ¿Listo para 20 min de tu diagnóstico?

**Body:**
```
Hola [participant_first_name],

Pasaron 3 días desde tu invitación. Aún no has empezado el caso.

Sin presión — solo recordatorio. El sprint cierra en [N_days_left] 
días, así que tienes tiempo.

20 minutos cuando puedas: [case_url]

Si tienes algún issue (no carga, no te llegan invites, etc.), 
contesta este email.

Pablo
```

**CTA primary:** [case_url]
**Trigger metric:** completion within +24h ≥30%

### Email 3 — Día 7 (final reminder)

**Subject:** Última semana del sprint — ¿lo cierras?

**Body:**
```
Hola [participant_first_name],

Última semana del sprint de tu equipo. Aún no has completado el caso.

Si lo abandonas, tu reporte individual no se genera — y tu manager 
verá tu status como "no iniciado" en el reporte agregado.

20 minutos hoy o mañana cierra esto: [case_url]

Si decidiste no participar por razón específica (carga laboral, 
sentirte incómodo, lo que sea), responde directo y lo manejamos.

Pablo
```

**CTA primary:** [case_url]
**Trigger metric:** completion within +48h ≥20%

**Si NO completion después de Email 3:** stop sequence. NO más emails (anti-spam).

## Secuencia 3 — Post-Sprint Nurture

**Audiencia:** manager principal.

**Trigger:** sprint cierre.

### Email 1 — Día 0 (sprint cerrado, igual a Manager Sequence Email 4)

Ya cubierto en Sequence 1.

### Email 2 — Día +14 (Survey 1 FSRR del retention_metrics)

Esto es el FSRR survey definido en `post_customer_zero_survey_template.md`. Email body ya está en ese doc.

### Email 3 — Día +30 (Survey 2 RCI)

Esto es el RCI survey. Email body ya está en survey doc.

### Email 4 — Día +90 (Survey 3 NPS)

NPS survey. Email body ya en survey doc.

**Total Secuencia 3:** 4 emails reusing existing templates + sequences ya definidas.

## Email 5 — opcional: case study consent follow-up

Si NPS +90d response includes "Sí" para case study consent (M9-3-D47), trigger este follow-up:

**Subject:** ¿Hacemos el case study?

**Body:**
```
Hola [manager_first_name],

En tu survey de 90 días mencionaste que estarías abierto a hacer 
un case study con Itera.

Te propongo 30 min en zoom para:

1. Repasar qué cambió en tu equipo desde el diagnóstico
2. Recopilar datos específicos del impacto (si tienes métricas 
internas)
3. Decidir formato del case study (anónimo / con nombre / video / 
escrito)

[link_calendly_pablo]

Si cambiaste de idea, no problem — solo dime y borramos este 
follow-up.

Pablo
```

**Trigger metric:** booking rate ≥40% (manager ya valoró + indicó interés)

## Extensión propuesta a emails.ts

Cuando codex tenga bandwidth (Fase 1 v2 o cuando active automation), extender `lib/simulador/copy/emails.ts` con:

```typescript
// Manager Onboarding Sequence (4 emails)
manager_sprint_start_d1: { subject_template, preheader, body_text, body_html, cta_label, cta_href_template },
manager_sprint_check_d7: { ... },
manager_sprint_engage_d14: { ... },
manager_sprint_close_d21: { ... },

// Participant Engagement Sequence (3 emails)
participant_welcome_d0: { ... },
participant_reminder_d3: { ... },
participant_final_d7: { ... },

// Post-Sprint Nurture (1 nuevo + 3 reuse de survey templates)
manager_case_study_followup: { ... },
```

Total 8 nuevos templates a agregar.

## Logística v1 manual

Mientras codex no automate (Fase 4 v2 roadmap o post 10 customers):

**Pablo manda manualmente:**
- Manager Email 1 (Día 1): mismo día contrato firmado
- Manager Email 2 (Día 7): calendar reminder semanal
- Manager Email 3 (Día 14): calendar reminder
- Manager Email 4 (Día 21): trigger automático al sprint cierre (esto B7-002 ya cubre vía `report_ready_manager`)
- Participant Email 1 (Día 0): trigger automático al invitation accept (B7-002 ya cubre vía `invitation_accepted` — extender body si quieren)
- Participant Email 2 + 3: Pablo manda manual si participant NO complete

Effort estimado v1 manual: ~30 min/semana por customer activo. Sostenible para 5-10 customers paralelos.

## Anti-patterns identificados

### ❌ Anti-pattern 1: subject line "[Itera] [...]"

Adding brand prefix se ve corporate-bot. Subject debe sentirse como email personal de Pablo. Si quieres branding, agrega en signature (footer), no subject.

### ❌ Anti-pattern 2: HTML pesado con imágenes/gradientes

Mobile rendering es inconsistente. Email B2B se lee texto-first. Use text body con minimal HTML — links inline OK.

### ❌ Anti-pattern 3: 5+ links en mismo email

Confunde el CTA. 1 primary + opcional 1 secondary = max 2 links. Footer puede tener legal links (privacy/unsubscribe).

### ❌ Anti-pattern 4: tracking pixels invasivos

Email open tracking es OK con full disclosure en privacy. Pero clicks tracking detallado (cada link) es invasivo + reduce trust. Solo CTA primary tracking.

### ❌ Anti-pattern 5: AI-generated voice

Emails que suenan generados (perfect grammar, no contractions, no Pablo-isms) reducen reply rate. Voice debe ser Pablo: conversacional, lowercase, ocasional "btw" o "responde directo si tienes duda".

## Métricas a trackear post-implementation

| Email | Métrica | Target verde v1 |
|---|---|---|
| Manager Sprint Start D1 | Open rate | ≥80% |
| Manager Sprint Check D7 | Open + click dashboard | ≥70% + ≥40% |
| Manager Sprint Engage D14 | Calendly book | ≥20% |
| Manager Sprint Close D21 | Open + Fase 2 book | ≥75% + ≥30% |
| Participant Welcome D0 | Completion within 48h | ≥50% |
| Participant Reminder D3 | Completion within +24h | ≥30% |
| Participant Final D7 | Completion within +48h | ≥20% |
| Case Study Followup | Booking | ≥40% |

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D60
    decision: "Extender emails.ts con 8 nuevos templates calendarizados (4 manager onboarding + 3 participant engagement + 1 case study followup) en Fase 1 v2 post-customer-zero. v1 mantiene 8 templates one-shot existentes + Pablo manda nurture manual"
    rationale: "Templates one-shot cubren transactional needs v1. Nurture sequences mejoran engagement pero NO son blocker pre-launch. Manual v1 con 5-10 customers es sostenible (~30 min/semana). Automation espera capacity codex y signal de customers (¿es nurture lo que pidieron?)."
    change_type: copy_extension
    files_to_touch:
      - lib/simulador/copy/emails.ts (extend Fase 1 v2)
      - lib/email/simulador-notifications.ts (codex integration)
    owner: claude (specs) + codex (cron triggers)
    blocked_by:
      - customer_zero
    priority: low

  - id: M9-3-D61
    decision: "Frequency conservadora B2B LATAM = 1 email/semana max. NO 2x/semana ni daily reminders. Sostenible y respetuoso"
    rationale: "B2B LATAM tolerance survey + research (ProductLed 2024): >1/sem = spam perception, mucha unsubscribe + complaint. Stick a sequence: D1, D7, D14, D21 manager + D0, D3, D7 participant. Cualquier extra es opt-in explícito."
    change_type: comms_methodology
    files_to_touch:
      - docs/research/onboarding_email_sequences.md
    owner: claude + pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D62
    decision: "Voice Pablo conversacional NO corporate-bot. Lowercase corporate LATAM. Subject sin brand prefix. HTML minimal text-first. 1 CTA primary por email (max 2 con secondary)"
    rationale: "Reply rate B2B LATAM mid-market correlaciona con feel personal. Brand prefix + perfect grammar reduce engagement. Pablo personal voice = trust signal. M9-3-D14 buyer perfil confirma: prefieren peer-level comms, no corporate auto-blast."
    change_type: voice
    files_to_touch:
      - lib/simulador/copy/emails.ts (when extending)
    owner: claude
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** v1 mantiene 8 templates one-shot. Pablo manda nurture manual para primer 5 customers.
2. **Post-customer-zero:** evaluar qué emails de la sequence resonaron con customers reales. Ajustar.
3. **Fase 1 v2 (post 5 customers cerrados):** claude extiende emails.ts con 8 nuevos templates. Codex integra cron triggers en cuando bandwidth allow.
4. **Métricas trackear post-launch:** open rate / click rate / completion + booking conversion por email type.
