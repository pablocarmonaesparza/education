# HIG Checklist — reglas críticas por surface

> Compañion de `HIG_SURFACE_REVIEW_FORM.md`.
> Para CADA surface, las reglas HIG-RULES que codex debe verificar antes de cerrar audit.
> Cada surface lleva su form individual + este checklist como referencia rápida.
>
> **Las reglas viven en `APPLE_HIG_RULES_FOR_ITERA.md` (fuente única).** Este doc solo lista CUÁLES aplican por surface; no las redefine. Si una regla aquí contradice el HIG, gana el HIG.

## PublicShell — `/`, `/privacy`, `/terms`, `/cancel`, `/success`

### Landing `/`

**Críticas (MUST):**
- A11Y-01 (contraste 4.5:1 body)
- A11Y-02 (hit target 44×44 mobile)
- A11Y-03 (no color-only)
- A11Y-04 (prefers-reduced-motion)
- A11Y-06 (keyboard nav completa)
- A11Y-07 (semantic HTML + aria)
- TYPO-01 (font stack sistema)
- TYPO-02 (body ≥14px)
- TYPO-04 (letter-spacing displays ≥32px)
- COLOR-01 (significado consistente accent)
- COLOR-03 (no hex inline)
- LAYOUT-03 (max-w-6xl container)
- LAYOUT-05 (reading order top-leading)
- MAT-01 (glass solo en nav sticky)
- MAT-03 (radius scale)
- MAT-04 (shadow scale sutil)
- MOTION-01 (animar con propósito)
- MOTION-02 (duraciones 150-450ms)
- MOTION-04 (no over-stagger)
- MOTION-06 (tap feedback)
- WRITE-01 (voz Itera, no jerga)
- WRITE-02 (capitalization rules)
- BTN-01 (hit region)
- BTN-02 (press state)
- BTN-03 (1-2 primary por viewport)
- BTN-04 (roles semánticos)
- BTN-06 (verbo en label)

**Quick rules:**
- ICON-01 (stroke 1.5)
- ICON-02 (una librería: AppleIcon → Tabler, ver `DEC-001`)

**Performance:**
- LCP <2.5s
- Lighthouse perf ≥90
- Lighthouse a11y ≥95

### `/privacy`, `/terms`

**Críticas:**
- A11Y-01, A11Y-05 (texto escalable 200%)
- TYPO-01..06 (legibilidad seria)
- LAYOUT-03 (max-w-prose para texto legal)
- COLOR-03 (no hex inline)
- WRITE-01 (voz LATAM legal seria)

**Específicas legales:**
- Disclaimer Itera footer
- Marcos legales por jurisdicción (i18n)
- Print styles (export PDF)

### `/cancel`, `/success`

**Críticas:**
- A11Y-01, A11Y-07
- TYPO-01, TYPO-04
- WRITE-01, WRITE-02
- BTN-01..04
- MOTION-01

---

## AuthShell — `/auth/login`, `/auth/signup`, `/auth/callback`, `/auth/confirm`, `/auth/invitation/[token]`

**Críticas (todas las 5):**
- A11Y-01, A11Y-02, A11Y-06 (keyboard nav crítico)
- A11Y-07 (aria-label en Google OAuth icon-only si aplica)
- FORM-01 (validación inline)
- FORM-03 (required marcado)
- FORM-04 (input type="email" + autocomplete="email")
- FORM-05 (N/A: no passwords)
- TF-01..03 (labels + error + focus)
- BTN-01..05 (incluyendo Enter responde)
- WRITE-03 (errores accionables)
- WRITE-05 (placeholder con formato)

**Específicas:**
- `/auth/login`, `/auth/signup`: card max-w-md centered
- `/auth/callback`, `/auth/confirm`: mínimo (spinner + texto)
- `/auth/invitation/[token]`: estados token (válido/expirado/usado/inválido)

---

## OnboardingShell — `/onboarding/{org,team,billing,invite,done}`

**Críticas (todos los 5 steps):**
- A11Y-01, A11Y-02, A11Y-06
- A11Y-07 (progress dots con aria-current="step")
- FORM-01..04 (validación inline + defaults + required + types)
- FORM-06 (one task per screen — Typeform UX)
- TF-01..03
- BTN-01..05
- WRITE-01, WRITE-02
- WRITE-04 (empty state si invite vacío)
- WRITE-06 (vocabulario consistente: Atrás/Continuar/Hecho)
- ONB-01 (value-first)
- ONB-02 (skippable donde aplique)
- PROG-01 (progress dots determinate)

**Específicas:**
- `/onboarding/billing`: tabla horizontal 3 tiers (no cards SaaS genéricas)
- `/onboarding/invite`: chips validation por email
- `/onboarding/done`: 3 cards next-steps + caption "recibirás email"

---

## EmployeeShell — `/dashboard` (vista empleado)

**Críticas:**
- A11Y-01, A11Y-02, A11Y-06
- LAYOUT-01..05
- MAT-03, MAT-04
- MOTION-04 (no over-stagger)
- WRITE-01, WRITE-04 (empty states con CTA)
- BTN-03, BTN-04, BTN-06
- LOAD-02 (skeleton vs spinner)
- ICON-01..04

**Específicas anti-LMS:**
- NO "curso/lección/módulo/alumno/calificación"
- SÍ "caso/step/banda/recomendación"

**Estados a cubrir:**
- Sin caso asignado → empty state con CTA
- Caso pendiente → card primary
- Caso en progreso → card con progress
- Caso completado pending review → card amber
- Reporte publicado → card accent verde

---

## ManagerShell — `/dashboard` (vista manager) — wow moment #1

**Críticas:**
- A11Y-01 (contraste alto en KPIs)
- A11Y-02
- A11Y-03 (bandas A/M/B con letra + color, no solo color)
- A11Y-06 (keyboard nav matriz)
- A11Y-07 (aria-label en pills banda)
- TYPO-04 (letter-spacing en display numbers)
- LAYOUT-01..05 (bento + agrupación + max-w-6xl)
- MAT-03, MAT-04 (cards radius + shadow)
- MOTION-04 (KPI count-up sutil <500ms)
- WRITE-01 (sin jerga "performance overview")
- BTN-03, BTN-06 (1 primary "Descargar reporte" + verbos)
- LOAD-02 (skeleton durante load)
- TAB-01..03 (si hay tabs filter)
- PROG-01..03

**Específicas:**
- Matriz dim×banda con click-row → drill-down
- Banner atención solo si high_risk_events > 0
- 4 acciones recomendadas con counts (Pilotar/Entrenar/Pausar/Escalar)
- Empty states diferenciados (sin team / sin sessions / sin risk events)

---

## RuntimeShell — `/case/[case_id]` + `/field-test/marketing-urgent-campaign-pii`

**Críticas (anti-spoiler):**
- WRITE-01 (voz Camila, no formulario seco)
- WRITE-04 (empty states)
- WRITE-06 (vocabulario consistente)
- FORM-01..06 (especialmente FORM-06 one task per screen)
- TF-01..03 (textarea h ≥ 32, autofocus)
- BTN-01..07 (Continuar primary, Atrás ghost)
- A11Y-04 (motion respeta reduced)
- A11Y-06 (keyboard: Enter/Esc/Cmd+Enter — sin Cmd+K/S/M ni palette, ver `DEC-007`)
- MOTION-01..06 (step transitions slide-x + tap feedback)
- LOAD-01..03 (evaluating state polling)
- PROG-01 (progress dots top)
- SIN sidebar en runtime — solo chrome + stepbar (ver `DEC-007`; SIDE-* aplica solo a Dashboard/Admin)

**Anti-patterns runtime (MUST verify):**
- NO mostrar dimensiones evaluadas en cada step
- NO chips "PII detectada" en tiempo real
- NO timer countdown agresivo
- NO sugerir respuestas (templates)
- NO "tip pro:" / "consejo:" en step body

**Field-test específico:**
- Lead capture form ANTES del runtime
- Mini-reporte SIMPLIFICADO al final (sin PDF, sin share público)
- Token/cookie separado de auth
- Rate limit 3 sessions/IP/día

---

## ReportShell — `/report/[session_id]` — wow moment #2

**Críticas:**
- A11Y-01, A11Y-03 (bandas con letra + color)
- TYPO-04 (display tight + body 1.65 line-height)
- LAYOUT-01 (agrupar dimensiones con whitespace)
- LAYOUT-03 (max-w-prose para narrativa)
- MAT-03, MAT-04
- MOTION-01..04 (recomendación banner fade + dimensiones stagger 50ms)
- WRITE-01 (sin juicio moral, narrativa "qué pasó/significa/hacer")
- BTN-01..07 (PDF + Share + Volver)
- SHEET-01..03 (modal share link)
- FB-01 (toast "link copiado")
- LOAD-01..03 (polling judge result + skeleton secciones)
- PROG-03 (progress determinate en evaluating)

**Específicas pending_review:**
- Mostrar header + disclaimer
- Ocultar bandas + risk events + recomendación
- Banner amber con explicación

**Print styles para PDF:**
- `print.css` sin nav, fonts negros, sin shadows
- Page breaks lógicos entre secciones

---

## AdminShell — `/admin`, `/admin/{review,orgs,leads,judge-health,audit-log}`

**Críticas:**
- A11Y-01, A11Y-06
- LAYOUT-01, LAYOUT-04
- TYPO-01, TYPO-02 (denso pero legible)
- BTN-01..07 (incluyendo destructive en cancel/reject)
- FB-02 (confirm dialogs destructive)
- WRITE-03 (errores accionables)
- LOAD-02 (skeleton tablas)

**Anti-patterns admin:**
- NO polish customer-facing (es utilitario interno)
- SÍ bulk actions con confirm modals
- SÍ filter chips para queue/leads/audit
- SÍ double-signature flow para review high

---

## System surfaces (no en las 20 pero críticas)

### `/not-found` (404)
- LAYOUT-05 (heading top-leading)
- WRITE-03 (next step accionable)
- BTN-06 (verbo en CTA)
- ICON-01 (stroke 1.5)

### `/error` (500 global)
- Mismo que 404 + sin chrome para evitar más errors

### `/maintenance` (manual)
- Eyebrow + heading + body + caption con ETA
- Sin acción del usuario disponible (excepto "refrescar")

---

## Performance per shell

| Shell | Target Lighthouse perf | Target a11y |
|---|---|---|
| PublicShell (rankea) | ≥95 | ≥98 |
| AuthShell | ≥90 | ≥95 |
| OnboardingShell | ≥90 | ≥95 |
| EmployeeShell | ≥90 | ≥95 |
| ManagerShell (wow #1) | ≥90 | ≥95 |
| RuntimeShell | ≥90 | ≥95 |
| ReportShell (wow #2) | ≥90 | ≥95 |
| AdminShell | ≥85 | ≥90 (interno, tolerancia) |

---

## Responsive breakpoints obligatorios

Todas las surfaces verifican:
- 375 (iPhone SE / mobile small)
- 768 (tablet portrait / mobile large)
- 1024 (tablet landscape / laptop small)
- 1280 (desktop standard)
- 1440 (desktop wide)

---

## Estados por surface (mínimos)

| Surface | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Landing | n/a (static) | n/a | 404 redirect | n/a |
| Auth | spinner btn | n/a | toast inline | redirect |
| Onboarding | skeleton form | textarea vacío | toast inline | next step |
| Runtime | save indicator | step 0 | toast destructive | next step |
| Employee dashboard | skeleton cards | "sin casos" + CTA | toast destructive | refresh |
| Manager dashboard | skeleton matriz | "esperando equipo" + CTA | toast destructive | refresh |
| Report | skeleton + polling | "se está generando" | "no se pudo generar" | full reporte |
| Admin | skeleton tablas | "sin items" | toast destructive | row updated |
| Field-test | skeleton form | n/a | toast inline | mini-reporte |

---

## Cómo usar este doc

1. Codex termina implementación de una surface
2. Codex/Claude llena `HIG_SURFACE_REVIEW_FORM.md` para esa surface
3. Verifica que **todas las MUST de esta tabla** estén marcadas en el form
4. Si una falla: corrige antes de cerrar
5. Si falla un SHOULD: documenta razón en `rules_deferred` del form
6. Si introduce decisión nueva: agrega a `Decisiones Itera` section del HIG-RULES

— claude · 2026-05-20 · HIG checklist per surface v1.0
