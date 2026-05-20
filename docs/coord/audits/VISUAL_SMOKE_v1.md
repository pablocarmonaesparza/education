# Visual smoke v1 — Apple-style en surfaces tier 1+2

> Auditor: claude · Fecha: 2026-05-20 · Branch tip: 6d4f0df
> Method: dev server local port 3777 + Claude_Preview MCP screenshots
> Viewport: 1280×800 desktop light

## Surfaces visualmente verificadas

### 1. `/` Landing — PASS ✅

**Render:** limpio Apple-style

**Observaciones visuales:**
- Nav top con logo "itera" izquierda + nav links centrados ("Cómo funciona", "Casos", "Precio") + "Iniciar sesión" + AppleButton primary "Agendar diagnóstico" derecha
- Hero eyebrow uppercase "PARA HEAD/VP DE MARKETING, GROWTH Y OPERATIONS · LATAM" gray subtle
- H1 display-tight "¿Tu equipo usa IA con criterio?" con "con criterio?" en accent blue
- Sub muted "Mide y mejora cómo tu equipo decide cuando usa IA en flujos reales. Diagnóstico operativo de 30 días. Reporte ejecutivo por persona."
- 2 CTAs: "Agendar diagnóstico para mi equipo" (primary accent) + "Probar 1 caso de muestra →" (secondary outline)
- Caption muted "SaaS B2B mid-market · servicios profesionales · ecommerce · LATAM"

**HIG validation visual:**
- ✓ TYPO-04 display tight tracking aplicado
- ✓ COLOR-01 accent consistente
- ✓ BTN-03 1-2 primary buttons
- ✓ LAYOUT-05 reading order top-leading

### 2. `/auth/login` — PASS ✅

**Render:** limpio Apple-style card centered

**Observaciones visuales:**
- Nav minimal: logo "itera" + "Crear cuenta" (cross link)
- Eyebrow uppercase "CUENTA" centered
- H1 display "Inicia sesión."
- Sub "Continúa donde lo dejaste — diagnóstico, reporte o dashboard."
- Error banner roja "No se pudo inicializar el cliente. Recarga la página." (esperado en preview sin Supabase env config)
- Form: AppleInput Email (label arriba, placeholder "email@empresa.com") + Contraseña (label arriba, placeholder "Contraseña")
- AppleButton primary "Continuar" (disabled state porque inputs vacíos — UX correcto)
- Separator "o"
- AppleButton outline "Continuar con Google" con icon SVG
- Footer link "¿Aún no tienes cuenta? Crear cuenta"

**HIG validation visual:**
- ✓ TF-01 label arriba del input
- ✓ TF-03 focus state accent (preview no muestra interaction pero código lo confirma)
- ✓ BTN-01 hit target visible
- ✓ BTN-04 primary + secondary + ghost roles distinguidos
- ✓ FORM-03 button disabled si campos vacíos
- ✓ WRITE-01 voz Itera (sin corporate-bot, conversacional)

### 3. `/field-test/marketing-urgent-campaign-pii` — observación error UX

**Render:** error UI por backend no configurado en preview (esperado)

**Observaciones visuales:**
- Nav minimal: logo "itera" + AppleButton primary "Crear cuenta" (CTA conversión)
- Eyebrow uppercase "NO SE PUDO INICIAR EL CASO"
- Body: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
- CTA outline "Volver al dashboard"

**Observation menor:**
- Error message es técnico ("Failed to execute 'json'...") — viola HIG-RULES-WRITE-03 (explica QUÉ hacer, no técnico)
- Sugerencia: cambiar a "No pudimos cargar el caso. Recarga la página o vuelve al inicio."
- CTA "Volver al dashboard" es problemático en field-test público (no hay dashboard sin login) — debería decir "Volver al inicio" (→ `/`)
- **Severity:** menor (solo aparece en preview env sin backend; en prod con Supabase OK el error no se ve)

## Surfaces NO verificadas visualmente (requieren auth)

- `/dashboard` — protegida (307 → /auth/login)
- `/case/[case_id]` — protegida
- `/report/[session_id]` — protegida
- `/onboarding/*` — protegida (post-auth)
- `/admin/*` — protegida (staff Itera)

Validación de estas surfaces ya hecha via:
- Audit técnico (HIG_LANDING/AUTH_ONBOARDING/DASHBOARD_REPORT/RUNTIME_ADMIN_v1.md)
- HIG audit script PASS 50 files
- bun build PASS 20 rutas

## Estado overall

**Visual smoke PASS** en 2 surfaces públicas tier 1+2 (Landing + Auth/login).

**1 fix menor sugerido:**
- Error UX en field-test cuando backend no responde: copy más accesible + CTA correcto

**Build + lint + HIG script + audits = PASS combinado.**

— claude · 2026-05-20 · visual smoke v1
