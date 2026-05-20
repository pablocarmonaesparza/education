# Field-test copy — `/field-test/marketing-urgent-campaign-pii`

> Audiencia: prospect visitante. NO requiere login.
> Objetivo: demo público → captura lead → mostrar valor → CTA a diagnóstico con equipo.
> Mismo runtime que `/case/[id]` pero con 3 diferencias: lead capture antes, mini-reporte después, sin PDF/share público.

## Topbar minimal (sin sidebar)

- Izquierda: logo `itera` + breadcrumb `demo público · caso 1`
- Derecha: link sutil ghost `Agendar diagnóstico para mi equipo` → CTA conversión (link a `/auth/signup?next=%2Fonboarding%2Forg`)

---

## Banner inicial (sticky top o card primera)

**Border-l-4 accent · padding 4:**

**Body (text-base):**
"Esto es un demo público. Tus respuestas se anonimizan y nos sirven para mejorar el simulador. Si quieres correrlo con tu equipo real, agenda diagnóstico."

**Disclaimer compacto al lado:**
"Consentimiento de procesamiento: válido por 90 días · sin email opcional · sin tracking entre dominios."

---

## Lead capture form (antes de empezar el runtime)

**Card centered max-w-md:**

**Eyebrow:** PROBAR DEMO

**H1:** Cuéntanos un poco de ti.

**Sub:** Para personalizar el reporte. Toma 30 segundos.

### Form fields

**Input — Email** (opcional pero recomendado)
- Label: `email (opcional)`
- Placeholder: `tu@empresa.com`
- Caption: "Lo usamos para enviarte el reporte y agendar follow-up. No spam."

**Input — Nombre** (requerido)
- Label: `tu nombre`
- Placeholder: `María González`

**Input — Empresa** (opcional)
- Label: `empresa (opcional)`
- Placeholder: `Acme LATAM`

**Select — Cargo** (requerido)
- Label: `cargo`
- Options: `Head/VP Marketing` · `Head/VP Growth` · `Head/VP Ops` · `Head/VP Sales` · `Manager/IC` · `CEO/Founder` · `Otro`

**Checkbox consentimiento (requerido):**
- ☐ Acepto que mi sesión se procese para evaluación de criterio y se anonimice para mejorar el simulador. Válido por 90 días.

### CTA

- Empezar caso → (primary, full-w)
- Caption muted: "Sin password, sin cuenta, sin pagar."

### Microcopy validación

| Caso | Mensaje |
|---|---|
| Falta nombre | "Falta tu nombre." |
| Email inválido | "Usa formato nombre@empresa.com." |
| Cargo no seleccionado | "Falta tu cargo." |
| Consentimiento no aceptado | "Necesitamos tu consentimiento para procesar la sesión." |

---

## Runtime (mismo que /case/[id])

Re-usar copy de `04_RUNTIME_COPY.md` íntegramente. Diferencias:

- Sidebar muestra `demo público` arriba en lugar de `sprint {sprintName}`
- Save indicator presente (sesión se guarda en backend con session_type=field-test)
- Sin keyboard hint Cmd+S (no es flujo crítico productivo)
- Voice input disponible igual

---

## Mini-reporte (después de submit)

(NO usa la misma estructura del `/report/[session_id]` completo)

### Layout

Card centered max-w-3xl. NO topbar persistente.

### Header

**Eyebrow:** TU MINI-REPORTE

**H1:** Diagnóstico operativo.

**Caption muted:**
`{sessionIdShort}` · hace {N} min · caso marketing PII

---

### Banda principal (overall pull)

**Card primary border-l-4 accent:**

**Eyebrow:** READINESS GENERAL

**Display 48px:** Banda {bandLabel}
(A=Alto / M=Medio / B=Bajo — sin número exacto en mini-reporte)

**Body (text-base):**
{recommendation.reason} — versión corta 2-3 líneas.

**Caption muted:** En el reporte completo (sprint con equipo), verás banda numérica + dimensiones + risk events + plan accionable.

---

### Bandas por dimensión (5 mini-cards horizontal scroll mobile)

Por cada dimensión:
- Pill banda (A/M/B con letra)
- Heading dimension name
- NO score numérico, NO rationale detallado

(En el reporte completo: rationale + evidencia. En mini: solo banda visual.)

---

### Risk events (count visible, NO detail)

**Si > 0:**

**Card amber:**
- Heading: "{N} eventos de riesgo detectados."
- Caption: "Para ver evidencia textual + recomendaciones específicas, corre el simulador con tu equipo real."

**Si = 0:**

**Caption inline:** "Sin eventos de riesgo en esta sesión. Buena señal."

---

### CTA conversión (la razón del field-test)

**Card primary highlighted:**

**Eyebrow:** SIGUIENTE PASO

**H2:** ¿Quieres que tu equipo lo corra?

**Body:**
Diagnóstico completo (5-50 personas, reporte ejecutivo, plan 7 días, judge LLM + review humano) desde $4,000 USD por sprint.

**CTAs:**
- **Agendar diagnóstico** (primary) → `/auth/signup?next=%2Fonboarding%2Forg`
- Hablar con ventas → (ghost) mailto:hola@itera.la

---

### Footer mini-reporte

**Caption muted:**
"Tu sesión queda registrada de forma anonimizada. Si compartiste email, te llegará copia del mini-reporte + opción de agendar demo extendido."

**Disclaimer (caption text-xs):**
"Este mini-reporte es un demo. No es certificación. No es assessment psicométrico. El reporte completo del sprint incluye evidencia textual, plan accionable y review humano."

---

## Anti-patterns field-test

- ❌ NO mostrar PDF download (es demo, no quiero leak de mini-reporte)
- ❌ NO share link público (mismo)
- ❌ NO reporte detallado con evidence_text de risk events (eso es valor del producto pagado)
- ❌ NO permitir múltiples submissions del mismo email (rate limit + dedup por cookie)
- ❌ NO email automated después de submit (esto va por flujo agentmail con opt-in explícito)
- ❌ NO retargeting/tracking de terceros (Itera no usa Google Ads / Facebook Pixel — punto)

---

## Analytics events (para que codex implemente)

| Event | Cuándo | Properties |
|---|---|---|
| `field_test.started` | Al entrar a `/field-test/...` | source (utm) |
| `field_test.lead_form_viewed` | Al ver el form pre-runtime | — |
| `field_test.lead_captured` | Submit form | has_email, cargo, empresa_provided |
| `field_test.section_completed` | Cada step submit | section_idx, time_spent |
| `field_test.abandoned` | Cierra pestaña en step <6 | last_section_idx |
| `field_test.submitted` | Submit final | total_time, sections_completed |
| `field_test.mini_report_viewed` | Ver mini-reporte | session_id |
| `field_test.cta_clicked` | Click "Agendar diagnóstico" o "Hablar ventas" | which_cta |
| `field_test.email_captured` | Si email lead_form | (no almacenamos email aquí, va a leads admin) |

---

## Guardrails técnicos (para que codex implemente)

- **Token/cookie separado de auth:** field-test usa `ftk_<uuid>` httponly, no Supabase session
- **Rate limit:** 3 sessions/IP por día (sin email), 1 session/email por 90 días (con email)
- **Anonimización:** después de submit, transcript se guarda con identifiers PII reemplazados por `[REDACTED]`
- **Consentimiento 90d:** si lead provee email, consent expira 90 días después y el record se purga si no agendó demo
- **No CDN tracking:** assets servidos desde same-origin, sin Google Fonts CDN ni external trackers

— claude · 2026-05-20 · field-test copy v1.0
