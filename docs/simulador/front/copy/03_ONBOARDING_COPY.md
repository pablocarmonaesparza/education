# Onboarding copy — `/onboarding/*`

> Audiencia: buyer (Head/VP Marketing/Growth/Ops) que viene de pagar checkout o signup.
> OnboardingShell: topbar con progress dots 5 steps + "salir y guardar" ghost.
> 5 steps wizard: org → team → billing → invite → done.
> Aplica HIG-RULES-FORM-01..06 + ONB-01..03.

## Topbar común

- Izquierda: logo `itera`
- Centro: progress stepper `● ● ● ● ●` con labels muy pequeños (caption muted): `organización → equipo → plan → invitar → listo`
- Derecha: link ghost `Salir y guardar` (con confirm modal: "Tu progreso queda guardado. Continúa cuando quieras desde el email.")

## Bottom nav común (sticky)

- Izquierda: ← Atrás (ghost, disabled en step 1)
- Derecha: Continuar → (primary, disabled si validación falla)

---

## Step 1 — `/onboarding/org`

**Eyebrow:** ORGANIZACIÓN

**H1:** Cuéntanos de tu organización.

**Sub:** Esto define el namespace para tus sprints. Puedes cambiarlo después.

### Form fields

**Input — Nombre legal de la organización** (requerido)
- Label: `nombre legal`
- Placeholder: `Acme LATAM S.A. de C.V.`
- Autocomplete: `organization`

**Select — Industria** (requerido)
- Label: `industria`
- Options: `SaaS B2B` · `Servicios profesionales` · `Ecommerce` · `Manufactura` · `Salud` · `Finanzas` · `Educación` · `Retail` · `Logística` · `Otro`

**Select — Región principal** (requerido)
- Label: `región principal`
- Options: `México` · `Colombia` · `Argentina` · `Chile` · `Brasil` · `Perú` · `Otro LATAM` · `US/Canada`
- Default: detectar por IP, fallback `México`

**Select — Tamaño** (requerido)
- Label: `tamaño del equipo total`
- Options: `1-10` · `11-50` · `51-200` · `201-500` · `501-2000` · `2000+`

**Input — Website** (opcional)
- Label: `website (opcional)`
- Placeholder: `https://acmelatam.com`
- Type: `url`

### CTAs
- Continuar → (deshabilitado hasta requeridos completos)

### Validaciones inline
- Nombre legal: 2-120 chars
- Website: si llena, formato URL válido (https://…)

---

## Step 2 — `/onboarding/team`

**Eyebrow:** EQUIPO

**H1:** Crea tu primer equipo.

**Sub:** Los sprints corren a nivel equipo. Usualmente Marketing, Growth, Ventas u Ops.

### Form fields

**Input — Nombre del equipo** (requerido)
- Label: `nombre del equipo`
- Placeholder: `Marketing México`

**Select — Función** (requerido)
- Label: `función principal`
- Options: `marketing` · `growth` · `ventas` · `customer success` · `operaciones` · `finanzas` · `legal` · `recursos humanos` · `producto` · `ingeniería` · `otro`

**Select — Número de personas que correrán el caso** (requerido)
- Label: `personas que participarán`
- Options: `5-10` · `11-25` · `26-50`
- (este es el seat count para billing)

**Caption muted bajo el form:**
"Puedes crear más equipos después del primer sprint."

### CTAs
- ← Atrás · Continuar →

---

## Step 3 — `/onboarding/billing`

**Eyebrow:** PLAN

**H1:** Elige tu sprint diagnóstico.

**Sub:** Pago vía Stripe en USD. Factura fiscal MX/CO/AR disponible respondiendo al recibo.

### Tabla horizontal 3 tiers (mismas opciones que landing pricing)

(usar mismo bloque de pricing del Landing — tabla horizontal con highlight del seleccionado)

**CTA primario:** Ir a checkout → (abre Stripe Checkout en nueva pestaña)

**Caption muted:** Al completar el pago vuelves automáticamente a este wizard para invitar a tu equipo.

### Estados Stripe Checkout

**Pre-checkout:**
- Modal/banner: "Te llevamos a Stripe Checkout. Vuelve aquí cuando completes el pago."

**Post-success:** redirige a `/onboarding/invite` con toast verde:
- Toast: "Pago confirmado. Ahora invita a tu equipo."

**Post-cancel:** vuelve a `/onboarding/billing` (sin perder progreso):
- Toast neutral: "Checkout cancelado. Cuando estés listo, ir a checkout →"

---

## Step 4 — `/onboarding/invite`

**Eyebrow:** INVITAR

**H1:** Invita a tu equipo.

**Sub:** Agrega los emails de las {N} personas que correrán el caso vivo. Recibirán un link para empezar.

### Form

**Textarea — Emails**
- Label: `emails (separa con coma, salto de línea o espacio)`
- Placeholder: `juan@empresa.com, maria@empresa.com, pedro@empresa.com`
- Rows: 6
- Autocomplete: off

### Validación inline (debajo del textarea)

Por cada email detectado, chip con estado:
- ✅ Válido (chip verde con `× remover`)
- ⚠ Duplicado (chip amber: "ya está en la lista")
- ❌ Inválido (chip rojo: "formato inválido")

**Counter:** `{detected} de {seatLimit} emails detectados`

### Estados

**Si exceden seat count:**
- Caption destructive: "Tu plan permite hasta {N} personas. Quita {M} emails o cambia de plan."
- Botón link: "Cambiar de plan ↑" (vuelve a step 3)

**Si bajo seat count:**
- Caption muted: "Puedes invitar hasta {N} personas en este sprint. Quedan {N - detected} cupos."

### CTAs
- ← Atrás · Enviar invitaciones →

### Después de enviar (transitorio)

- Toast: "Invitaciones enviadas a {N} personas."
- Auto-redirect a `/onboarding/done` después de 1s

---

## Step 5 — `/onboarding/done`

**Eyebrow:** TODO LISTO

**H1 (text-3xl, accent green):** ¡Todo listo, {nombre}!

**Sub:** Tu equipo recibió las invitaciones. Cuando empiecen a completar el caso, verás resultados en tu dashboard.

### 3 cards next-steps (grid)

**Card 1 (primary):**
- Heading: "Ver dashboard manager"
- Body: "Aquí verás progreso, bandas y risk events de tu equipo."
- CTA: Ir al dashboard → (/dashboard)

**Card 2 (outline):**
- Heading: "Previa del caso"
- Body: "Corre el caso tú mismo sin gastar un seat — útil para entender qué van a vivir."
- CTA: Probar caso demo → (/field-test/marketing-urgent-campaign-pii)

**Card 3 (ghost):**
- Heading: "Live debrief con Itera (opcional)"
- Body: "Sesión 1h con nuestro equipo para revisar el reporte agregado y planear acciones."
- CTA: Agendar debrief → (mailto:hola@itera.la?subject=Agendar debrief sprint)

### Caption final

"Recibirás email cuando el primer reporte esté listo (24-48h después de que la persona complete el caso)."

---

## Microcopy estados onboarding

| Caso | Mensaje |
|---|---|
| Validación falla step 1 | "Falta nombre legal de la organización." |
| Validación falla step 2 | "Falta nombre del equipo." |
| Stripe webhook delay >30s | "Stripe aún no confirma el pago. Recarga si no avanza." |
| Email duplicado en bulk | "{email} ya está en la lista." |
| Email inválido en bulk | "{email} no tiene formato válido." |
| Excede seats | "Tu plan permite hasta {N}. Quita {M} emails." |
| Network error save | "No se pudo guardar. Reintenta o sigue, lo retomas después." |

— claude · 2026-05-20 · onboarding copy v1.0
