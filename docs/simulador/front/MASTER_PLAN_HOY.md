# MASTER PLAN — UI/UX polish completo Itera Simulador v2 (hoy)

> **Objetivo:** las 20 surfaces v2 pulidas a nivel Apple HIG + Typeform UX, en un solo día.
> **Fecha de ejecución:** 2026-05-20
> **Branch:** `codex/simulator-front-cleanroom` (única)
> **Agentes:** claude + codex paralelo
> **Sign-off:** Pablo al final
>
> Esta es la lista de las listas. Nada queda fuera. Cuando se cierra el último checkbox, "¿quedó perfecto?" se responde SÍ.

---

## 0. Pre-requisitos antes de tocar UI (2h paralelo)

### 0.1 Cierre del contrato HIG (codex)
- [ ] **PRE-A** Commit `HIG_SURFACE_REVIEW_FORM.md` (form 14 preguntas + sección 0 checks técnicos + WRITE-01 explícito en P13 + sign-off block)
- [ ] **PRE-B** Agregar a HIG-RULES tres categorías faltantes:
  - i18n LATAM (es-MX/es-CO/es-AR currency format, fecha format, términos legales por jurisdicción)
  - Performance budgets (LCP <2.5s, FCP <1.8s, CLS <0.1, TTI <3.5s, Lighthouse ≥90)
  - Responsive breakpoints (375/768/1024/1280/1440, touch vs cursor states, mobile menu pattern)
- [ ] **PRE-D** Script audit automatizado en `scripts/simulador/hig-audit.mjs` con 8 checks (CI bloquea si falla):
  - contraste WCAG AA (axe-core)
  - `outline: none` sin reemplazo
  - hex inline fuera de tokens
  - >1 primary button por viewport
  - icon-only sin aria-label
  - motion-duration >500ms sin justificación
  - `useReducedMotion` aplicado en motion.div
  - focus-visible style en buttons/inputs

### 0.2 Cierre del contrato HIG (claude)
- [ ] **PRE-C** Sharpen 4 reglas subjetivas en HIG-RULES:
  - MOTION-04 → "stagger se suprime cuando lista >viewport visible"
  - WRITE-01 → tabla 5 ejemplos OK / 5 ejemplos NO concretos
  - MAT-04 → tabla elemento→shadow token (button hover→sm, card→md, modal→xl)
  - ONB-01 → marcar aspiracional + agregar analytics como prerequisito
- [ ] **PRE-E** Sección "Apple manda vs Apple no aplica" al inicio de HIG-RULES con criterio explícito

**Criterio done sección 0:** PRE-A..PRE-E committed + Pablo sign-off PR.

---

## 1. Tokens en simulador.css — fundación visual (1h, claude)

Sin esto, nada del polish tiene sentido. Es el fundament.

### 1.1 Radius scale
- [ ] `--radius-xs: 4px` (badges, chips)
- [ ] `--radius-sm: 8px` (buttons, inputs, small cards)
- [ ] `--radius-md: 12px` (cards default)
- [ ] `--radius-lg: 16px` (cards grandes, alerts)
- [ ] `--radius-xl: 20px` (modals, hero containers)
- [ ] `--radius-2xl: 24px` (sheets, presentation)
- [ ] `--radius-full: 9999px` (solo dots, avatares, badges pill específicos)

### 1.2 Shadow scale
- [ ] `--shadow-xs: 0 1px 2px rgba(0,0,0,0.04)` (micro-elevation)
- [ ] `--shadow-sm: 0 2px 4px rgba(0,0,0,0.06)` (buttons hover, inputs focus)
- [ ] `--shadow-md: 0 4px 12px rgba(0,0,0,0.08)` (cards elevated)
- [ ] `--shadow-lg: 0 8px 24px rgba(0,0,0,0.10)` (popovers, dropdowns)
- [ ] `--shadow-xl: 0 16px 48px rgba(0,0,0,0.12)` (modals, sheets)

### 1.3 Motion tokens
- [ ] `--motion-fast: 150ms` (tap, hover micro)
- [ ] `--motion-base: 250ms` (state changes)
- [ ] `--motion-slow: 450ms` (component enter/exit)
- [ ] `--motion-page: 600ms` (page transitions, raras)
- [ ] `--motion-ease: cubic-bezier(0.16, 1, 0.3, 1)` (Apple ease-out default)
- [ ] `--motion-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` (sheet + drag)
- [ ] `--motion-linear: linear` (progress bars determinate)

### 1.4 Typography refinement
- [ ] Verificar font stack `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", ...` (ya existe línea 7)
- [ ] Confirmar `letter-spacing: -0.011em` body (ya existe línea 11)
- [ ] Agregar utility `.display-tight { letter-spacing: -0.022em }` para H ≥32px
- [ ] Confirmar `font-feature-settings: "ss01", "ss02", "cv11"` (ya existe línea 10)

### 1.5 Color tokens — verificar Apple-compliance
- [ ] Confirmar `--accent: #1472FF` (existe)
- [ ] Confirmar variantes dark mode (`--surface`, `--text-primary`, `--hairline` existen)
- [ ] Agregar `--accent-soft: rgba(20, 114, 255, 0.08)` (existe)
- [ ] Agregar `--destructive: #ef4444` + `--destructive-soft: rgba(239, 68, 68, 0.08)` (verificar)
- [ ] Agregar `--success`/`--warning` semánticos si faltan
- [ ] Test contrast WCAG AA en ambos modos light + dark

**Criterio done sección 1:** `simulador.css` extendido + grep contra estos tokens en componentes = referencias correctas.

---

## 2. Apple wrappers components — librería compartida (2.5h, claude + codex)

Cada uno reemplaza un componente HeroUI default con HIG-RULES enforced.

### 2.1 AppleButton (claude · L-006)
- [ ] `components/simulador/AppleButton.tsx`
- [ ] Wrapper sobre HeroUI Button con:
  - Radius tokens (`var(--radius-sm)`)
  - Shadow tokens (sm hover, md active)
  - `whileTap={{ scale: 0.98, opacity: 0.96 }}` (HIG-RULES-MOTION-06)
  - `transition={{ duration: 0.15, ease: 'var(--motion-ease)' }}`
  - Hit target min 44×44 mobile, 32×32 desktop (HIG-RULES-BTN-01)
  - Roles: primary | secondary | ghost | destructive (HIG-RULES-BTN-04)
  - Variant `loading` con spinner inline
- [ ] Migrar usages en Landing/Dashboard/Report/Runtime de `Button` → `AppleButton`
- [ ] Tests: render + tap simulado + a11y label

### 2.2 AppleInput + AppleTextarea (claude)
- [ ] `components/simulador/AppleInput.tsx` + `AppleTextarea.tsx`
- [ ] Label arriba siempre (HIG-RULES-TF-01)
- [ ] Placeholder con formato (HIG-RULES-WRITE-05)
- [ ] Error inline debajo en `--destructive` (HIG-RULES-TF-02)
- [ ] Focus state con outline accent (HIG-RULES-TF-03)
- [ ] `autocomplete` props correctos (HIG-RULES-FORM-04)
- [ ] Textarea autofocus opcional (HIG-RULES-FORM-06)

### 2.3 AppleCard (claude)
- [ ] `components/simulador/AppleCard.tsx`
- [ ] Variants: default | elevated | interactive | success | warning | destructive
- [ ] Radius `var(--radius-md)` default
- [ ] Shadow `var(--shadow-sm)` resting, `--shadow-md` hover (interactive)
- [ ] Background `var(--surface)` con border `var(--hairline)`
- [ ] Padding scale: `card-padding-sm` 16px / `md` 24px / `lg` 32px

### 2.4 AppleModal / AppleSheet (claude)
- [ ] `components/simulador/AppleModal.tsx`
- [ ] Backdrop con `backdrop-blur-md bg-black/35` (HIG-RULES-MAT-01/02)
- [ ] Esc + click fuera + X button cerrar (HIG-RULES-SHEET-02)
- [ ] Max-width 600px default, full-screen variant (HIG-RULES-SHEET-03)
- [ ] Focus trap dentro del modal
- [ ] Motion: `--motion-slow` enter + `--motion-spring` scale (HIG-RULES-MOTION-03)

### 2.5 AppleToast (codex)
- [ ] `components/simulador/AppleToast.tsx` (wrapper sobre sonner o HeroUI Toast)
- [ ] Variants: success | info | warning | destructive
- [ ] Auto-dismiss 4s default
- [ ] Position: top-right desktop, top-full mobile
- [ ] Stack máximo 3 visible (older drops)

### 2.6 AppleProgressBar + AppleSkeleton (codex)
- [ ] `components/simulador/AppleProgressBar.tsx`
- [ ] Determinate con %, indeterminate animated (HIG-RULES-PROG-01)
- [ ] Color accent default, status (success/destructive) variants (PROG-02)
- [ ] `components/simulador/AppleSkeleton.tsx`
- [ ] Patterns: text-line, card, avatar, button placeholder
- [ ] Pulse animation con `useReducedMotion` respeto

### 2.7 AppleSidebar + AppleTab (codex)
- [ ] `components/simulador/AppleSidebar.tsx`
- [ ] Collapsible desktop, drawer mobile (HIG-RULES-SIDE-01)
- [ ] Persistent top-leading (SIDE-02)
- [ ] Items: icon + label (no solo icons salvo colapsada) (SIDE-03)
- [ ] `components/simulador/AppleTab.tsx`
- [ ] Max 5 visible + overflow "More" (TAB-01)
- [ ] Tab activa: border-bottom accent + Semibold (TAB-02)

### 2.8 AppleIcon wrapper (codex · C-001)
- [ ] `components/simulador/AppleIcon.tsx`
- [ ] Wrapper sobre Lucide React con `strokeWidth={1.5}` default (HIG-RULES-ICON-01)
- [ ] Tamaños tokens: xs (12) / sm (16) / md (20) / lg (24) / xl (32)
- [ ] Audit + replace TODOS los `<LucideIcon />` por `<AppleIcon name="..." />` en cleanroom

### 2.9 Typography components (claude)
- [ ] `components/simulador/Typography.tsx` con:
  - AppleEyebrow (xs UPPERCASE tracking-widest)
  - AppleH1 (display ≥40px + tight tracking)
  - AppleH2 (32-40px)
  - AppleH3 (24-28px)
  - AppleBody (16-17px)
  - AppleCaption (13-14px muted)
- [ ] Migrar usages a estos components

### 2.10 AppleBadge / AppleChip / AppleEmpty (claude)
- [ ] `components/simulador/AppleBadge.tsx` (banda A/M/B, status pending/published, severity)
- [ ] `components/simulador/AppleChip.tsx` (tags removibles, multi-select)
- [ ] `components/simulador/AppleEmptyState.tsx` (icon + heading + body + CTA pattern)

**Criterio done sección 2:** 10 componentes creados + migrados en al menos 1 surface tier 1.

---

## 3. Patterns reusables web B2B (1h, ambos)

### 3.1 GlassNav (claude)
- [ ] Pattern para nav sticky con `backdrop-blur-md` + `bg-white/80` light, `bg-gray-900/80` dark
- [ ] Usado en Landing, Dashboard, Runtime topbar

### 3.2 Bento grid responsive (codex)
- [ ] Pattern 2-col / 3-col / 4-col desktop, 1-col mobile, con cards de tamaños desiguales
- [ ] Usado en Landing "qué mide", Dashboard KPI strip

### 3.3 Step wizard progress dots (claude)
- [ ] Pattern de 5 dots horizontales con current/completed/locked states
- [ ] Usado en Onboarding wizard 5 steps

### 3.4 Voice recorder visual (claude)
- [ ] Pattern circular button con waveform pulse animation
- [ ] Real-time transcript display
- [ ] Estados: idle / recording / processing / error
- [ ] Usado en Runtime open-ended steps

### 3.5 Save indicator sutil (claude)
- [ ] Dot verde con texto "guardado" fade-in/out por save exitoso
- [ ] Sticky bottom-right del viewport
- [ ] Usado en Runtime + Onboarding

### 3.6 Print styles Report (codex)
- [ ] `app/(app)/report/[session_id]/print.css`
- [ ] Layout para impresión + export PDF: sin nav, fonts negros, sin shadows
- [ ] Usado por `/api/sessions/[id]/report/pdf`

**Criterio done sección 3:** 6 patterns implementados + reusable.

---

## 4. Surface polish — las 20 rutas (5h paralelo)

> Cada surface: pre-audit gap → refactor mecánico → refactor copy/motion → build verify → llenar `HIG_SURFACE_REVIEW_FORM` → commit.
>
> Orden por priority: tier 1 hero → tier 2 wizard → tier 3 legal+admin.

### 4.1 Tier 1 (4 surfaces hero — 2h)

#### `/` Landing (claude principal, codex apoya tokens)
- [ ] Audit gap vs HIG-RULES (citar IDs aplicables)
- [ ] Migrar Buttons → AppleButton
- [ ] Tap feedback `whileTap` en todas las cards interactivas
- [ ] Nav sticky con GlassNav pattern (HIG-RULES-MAT-01)
- [ ] FAQ accordion: enter Esc keyboard + ARIA proper
- [ ] CTA strip + footer 4-col verificar AppleButton + AppleEyebrow
- [ ] Microcopy review pass (L-002): cambiar "agendar diagnóstico para mi equipo" si suena largo, verificar voz LATAM
- [ ] Dark mode test
- [ ] Mobile 375 + 768 test
- [ ] Lighthouse a11y ≥95, perf ≥90
- [ ] Llenar `HIG_SURFACE_REVIEW_FORM`
- [ ] Commit `[bloque-3-landing-polish]`

#### `/dashboard` (codex tokens, claude jerarquía)
- [ ] Migrar Buttons → AppleButton
- [ ] Cards → AppleCard (variants: default + interactive + warning para risk banner)
- [ ] Sidebar con AppleSidebar (collapsible)
- [ ] Matriz dim×banda con AppleBadge + tooltip
- [ ] KPI strip: AppleEyebrow + Display tight + Caption muted
- [ ] Empty state si no team con AppleEmptyState
- [ ] Skeleton screens durante load (HIG-RULES-LOAD-02)
- [ ] Microcopy review (member cards, action cards)
- [ ] Dark mode + mobile + Lighthouse
- [ ] Llenar form + commit

#### `/case/[case_id]` Runtime (claude principal — Typeform UX)
- [ ] Migrar inputs → AppleInput + AppleTextarea (con autofocus + rows=6)
- [ ] Buttons → AppleButton
- [ ] **Keyboard handlers (L-005):**
  - `Enter` (sin modifier) → next step si válido
  - `Cmd+Enter` → newline en textarea
  - `Esc` → step anterior con confirm si dirty
  - `Cmd+K` → toggle sidebar
  - `Cmd+S` → forzar save (indicator visible)
- [ ] Voice recorder con pattern visual (sección 3.4)
- [ ] Save indicator sutil (sección 3.5)
- [ ] Step transitions con `--motion-slow` + slide-x
- [ ] Brief de Camila collapsible con avatar geométrico (NO foto)
- [ ] Sidebar con sections list (current/completed/locked)
- [ ] Topbar h-12 con GlassNav + progress dots
- [ ] Microcopy review (L-003): cada step suena a Camila, no a formulario
- [ ] Empty state si caso sin variant
- [ ] Dark mode + mobile + a11y completo
- [ ] Llenar form + commit

#### `/report/[session_id]` (claude principal)
- [ ] Migrar Buttons → AppleButton
- [ ] Cards → AppleCard
- [ ] Recomendación banner con AppleCard variant + AppleEyebrow
- [ ] Risk events cards con AppleBadge severity
- [ ] Dimensiones grid con AppleBadge banda (A/M/B con icon + label, no solo color)
- [ ] Plan 7 días con AppleH3 + AppleBody
- [ ] Share link UI con AppleModal + copy-to-clipboard feedback (AppleToast)
- [ ] Download PDF button con loading state
- [ ] Empty state pending_review (HIG-RULES-LOAD-01: polling con shell)
- [ ] Print styles aplicados (sección 3.6)
- [ ] Microcopy review
- [ ] Dark mode + mobile + a11y
- [ ] Llenar form + commit

### 4.2 Tier 2 (11 surfaces auth + onboarding + field-test — 2h)

#### `/auth/login` y `/auth/signup` (claude)
- [ ] Layout centered single-column max-w-md
- [ ] Card central con AppleCard
- [ ] Botón Google OAuth con AppleButton variant outline + icon
- [ ] Magic link email input → AppleInput type="email" autocomplete="email"
- [ ] Validation inline (HIG-RULES-FORM-01)
- [ ] CTA primary AppleButton type="submit"
- [ ] Link cruzado login↔signup
- [ ] Cookie/legal disclaimer al fondo
- [ ] Microcopy: "iniciar sesión" / "crear cuenta" / "te enviamos un magic link"
- [ ] Dark mode + mobile + a11y
- [ ] Llenar form + commit

#### `/auth/callback` y `/auth/confirm` (codex)
- [ ] Mínimo absoluto: spinner + texto "verificando tu sesión…"
- [ ] Error fallback con AppleCard destructive + CTA volver login
- [ ] Sin nav, sin header
- [ ] Llenar form + commit

#### `/auth/invitation/[token]` (claude)
- [ ] Layout centered card
- [ ] AppleEyebrow + AppleH1 + AppleBody con detalles invite (org, team, role)
- [ ] CTA primary "aceptar e iniciar sesión" → flow signup/login con token
- [ ] CTA secondary ghost "no soy yo" → mailto
- [ ] Estados: token válido / expirado (amber card) / usado (redirect)
- [ ] Microcopy
- [ ] Llenar form + commit

#### `/field-test/marketing-urgent-campaign-pii` (claude)
- [ ] Topbar minimal (sin sidebar — no es sesión real)
- [ ] Banner inicial border-l accent "esto es demo público…"
- [ ] Lead capture form ANTES del runtime: AppleInput (email, nombre, cargo, empresa)
- [ ] Runtime mismo que `/case/[id]` pero sin auth requerida
- [ ] Reporte final SIMPLIFICADO: bandas sí, risk events NO detallados, CTA "para reporte completo agenda diagnóstico"
- [ ] Sin PDF download, sin share link público
- [ ] Microcopy: posicionar como prueba, no como producto final
- [ ] Dark mode + mobile + a11y
- [ ] Llenar form + commit

#### `/onboarding/org`, `/onboarding/team`, `/onboarding/billing`, `/onboarding/invite`, `/onboarding/done` (claude principal)
- [ ] Topbar h-14 con logo + progress dots 5 steps + "salir y guardar" ghost
- [ ] Main centered max-w-2xl, padding generoso
- [ ] Bottom sticky: ← atrás (ghost) + continuar → (primary, disabled si validación falla)
- [ ] **Por step:**
  - **org**: AppleInput nombre legal + Select industry + Select región + Select tamaño + AppleInput website (opcional)
  - **team**: AppleInput team name + Select función (marketing/growth/etc) + AppleInput # personas
  - **billing**: AppleCard 3 tiers horizontal tabla con AppleButton "seleccionar"; CTA "ir a checkout →" abre Stripe nueva pestaña
  - **invite**: AppleTextarea bulk emails con AppleChip validation inline; counter "12 detectados / 50 max"; CTA "enviar invitaciones →"
  - **done**: AppleH1 success + 3 AppleCard next-steps (dashboard / preview caso / agendar debrief)
- [ ] Validación inline cada step
- [ ] Microcopy conversacional
- [ ] Dark mode + mobile + a11y
- [ ] Llenar form 5 veces (uno por step) + commit

### 4.3 Tier 3 (5 surfaces legal + admin — 1h)

#### `/privacy` y `/terms` (codex polish copy)
- [ ] AppleH1 tight + AppleBody large
- [ ] Sections con AppleEyebrow + AppleH2
- [ ] Last updated date dinámico
- [ ] Print styles
- [ ] Mobile + a11y (tipografía legal serio, no fancy)
- [ ] Microcopy revisar (legal exact pero LATAM tone)
- [ ] Llenar form + commit

#### `/cancel` y `/success` (codex)
- [ ] Layout centered con AppleCard
- [ ] Status icon (X red / check green) con AppleIcon
- [ ] AppleH1 + AppleBody contextual
- [ ] CTAs AppleButton
- [ ] Dark mode + mobile
- [ ] Llenar form + commit

#### `/admin` + 4 subroutes (codex)
- [ ] AppleSidebar con nav admin (review / orgs / judge-health / audit-log / leads)
- [ ] Tablas con AppleCard wrappers
- [ ] Bulk actions con AppleButton + AppleModal confirm
- [ ] Audit log timeline con AppleEyebrow + Caption
- [ ] Review queue: drill-down con AppleCard interactive
- [ ] Sin polish customer-facing (utilitario interno OK)
- [ ] Llenar form + commit

**Criterio done sección 4:** 20 forms llenos + 20 commits + 20 surfaces buildean PASS + visualmente coherentes con HIG-RULES.

---

## 5. i18n LATAM (45min, claude)

### 5.1 Format helpers
- [ ] `lib/simulador/i18n/format.ts`:
  - `formatCurrency(amount, locale)` → siempre USD pero con localized symbol position
  - `formatDate(iso, locale)` → 20/05/2026 es-MX, 20/05/2026 es-CO, 20-05-2026 es-AR
  - `formatNumber(n, locale)` → 1,000 es-MX, 1.000 es-CO/AR

### 5.2 Términos legales por jurisdicción
- [ ] `/privacy` muestra LFPDPPP MX + Ley 1581 CO + Ley 25326 AR según `accept-language` o user prefs
- [ ] Disclaimers fiscales en `/onboarding/billing`: "factura mx (RFC) / co (NIT) / ar (CUIT) respondiendo al recibo"

### 5.3 Locale detection
- [ ] Middleware Next.js detecta `accept-language` LATAM + user preference de Supabase
- [ ] Default es-MX si no LATAM
- [ ] Cookie remembered

**Criterio done sección 5:** format helpers + privacy variant + middleware committed.

---

## 6. Loading + Error + Empty states (1h, claude + codex)

### 6.1 Loading per surface (codex)
- [ ] AppleSkeleton patterns aplicados:
  - Dashboard: skeleton cards members + matriz skeleton
  - Report: skeleton sections (recomendación + 5 dimensiones + risk events)
  - Runtime: skeleton brief Camila + step input
  - Onboarding: skeleton form fields
  - Field-test: skeleton runtime

### 6.2 Error states (claude)
- [ ] Pattern `components/simulador/AppleErrorState.tsx`: icon + AppleH3 + AppleBody + retry button
- [ ] Aplicado en: judge timeout, save failure, network error, auth error
- [ ] Microcopy accionable (HIG-RULES-WRITE-03)

### 6.3 Empty states (claude)
- [ ] AppleEmptyState aplicado en:
  - `/dashboard` sin team
  - `/dashboard` sin sessions activas
  - `/admin/review` queue vacía
  - `/admin/leads` lista vacía
  - `/onboarding/invite` lista emails vacía
- [ ] Cada uno con next-step CTA (HIG-RULES-WRITE-04)

### 6.4 404 + 500 + maintenance (codex)
- [ ] `app/not-found.tsx` custom con AppleEmptyState + CTA volver landing
- [ ] `app/error.tsx` global error boundary
- [ ] `app/maintenance/page.tsx` para deploy windows (optional)

**Criterio done sección 6:** todos los estados intermedios cubiertos en TODAS las 20 surfaces.

---

## 7. Backend wiring verify (30min, codex)

> Estos NO se modifican (back ya está hecho), solo verificar que las surfaces los consumen correctamente.

- [ ] `/auth/*` flow Supabase OK end-to-end
- [ ] `/api/orgs/*` consumido por onboarding wizard
- [ ] `/api/sessions/*` consumido por runtime
- [ ] `/api/sessions/[id]/evaluate` triggered al complete
- [ ] `/api/sessions/[id]/report` polling desde report page
- [ ] `/api/sessions/[id]/report/pdf` download
- [ ] `/api/sessions/[id]/report/share` share link generation
- [ ] `/api/stripe-webhook` recibe events OK
- [ ] `/api/stripe/create-checkout-session` triggered desde billing
- [ ] `/api/dashboard` consumido por dashboard
- [ ] `/api/admin/*` consumido por admin subroutes
- [ ] `/api/transcribe` (Whisper) consumido por voice recorder
- [ ] `/api/field-test/sessions/*` consumido por field-test

**Criterio done sección 7:** smoke test cada API endpoint responde correctamente.

---

## 8. Performance + Accessibility audit (1h, codex)

### 8.1 Performance budgets per surface
- [ ] Lighthouse perf ≥90 en TODAS las 20 rutas
- [ ] FCP <1.8s
- [ ] LCP <2.5s
- [ ] CLS <0.1
- [ ] TTI <3.5s
- [ ] Bundle size delta vs main <50KB por route
- [ ] Si alguna falla: optimize (lazy load, image optimization, font preload, code split)

### 8.2 Accessibility deep audit
- [ ] axe-core 0 critical + 0 serious en TODAS
- [ ] Lighthouse a11y ≥95 en TODAS
- [ ] Keyboard nav completa (Tab/Enter/Esc/arrows) manual verify cada surface
- [ ] Screen reader test (VoiceOver) en surfaces críticas: Landing, Runtime, Dashboard, Report
- [ ] `prefers-reduced-motion` respeta en TODAS
- [ ] Dark mode contraste 4.5:1 mínimo (7:1 para small text per DARK-03)
- [ ] Color blindness simulator (no info solo por color)
- [ ] Mobile touch targets 44×44 en TODAS

**Criterio done sección 8:** scripts/CI passing + manual smoke con reporte.

---

## 9. Mobile responsive (45min, codex + claude)

Per surface, verificar 375 / 768 / 1024 / 1280 / 1440:

### 9.1 Mobile-first checks
- [ ] Landing hero readable 375px
- [ ] Dashboard sidebar → drawer mobile
- [ ] Runtime topbar collapsible mobile
- [ ] Report dimensiones grid → single column mobile
- [ ] Onboarding wizard botones bottom sticky
- [ ] Forms inputs full-width mobile
- [ ] Modals max-h-screen mobile, scrollable

### 9.2 Tablet (768) breakpoint
- [ ] Dashboard 2-col grid
- [ ] Report layout 2-col donde aplica
- [ ] Landing bento 2x2

### 9.3 Desktop (1280+)
- [ ] Sidebars persistentes
- [ ] Multi-column layouts
- [ ] Hover states activos

**Criterio done sección 9:** screenshot 5 breakpoints × 20 rutas = 100 screenshots OK.

---

## 10. Animation polish específico (1h, claude)

Pasada fina de Motion en surfaces hero:

### 10.1 Landing hero
- [ ] FadeUp staggered max 50ms en hero CTA (HIG-RULES-MOTION-04)
- [ ] Scroll-linked gradient reveal en bento section
- [ ] Hover scale 1.02 max en cards interactivas
- [ ] FAQ accordion smooth expand con `--motion-base`

### 10.2 Dashboard
- [ ] KPI numbers count-up sutil (300ms) en mount
- [ ] Matriz cells fade-in conjunto (sin stagger per cell)
- [ ] Cards members fade-in con stagger 30ms (lista <8 items)

### 10.3 Report
- [ ] Recomendación banner: scale 0.95→1.0 + fade 600ms
- [ ] Dimensiones cards stagger 50ms (5 items, OK per MOTION-04)
- [ ] Risk events fade simple
- [ ] Plan 7 días stagger 30ms

### 10.4 Runtime
- [ ] Step transitions slide-x 200ms ease-out
- [ ] Voice recorder pulse sutil cuando recording
- [ ] Save indicator dot verde fade-in/out por save exitoso
- [ ] Brief Camila collapse animado con `--motion-slow`

### 10.5 Onboarding
- [ ] Step transitions slide-x igual que Runtime
- [ ] Progress dots active fade-color
- [ ] Done screen confetti minimal (skip if reduce-motion)

**Criterio done sección 10:** motion coherente y respetuoso en surfaces hero.

---

## 11. SEO + metadata + brand assets (30min, codex)

### 11.1 Metadata per surface
- [ ] `<title>` específico cada ruta
- [ ] `<meta name="description">` con value prop
- [ ] OpenGraph image (1200×630) per surface — generar con Next.js `opengraph-image.tsx`
- [ ] Twitter card meta
- [ ] Canonical URLs

### 11.2 Robots + sitemap
- [ ] `robots.txt` permite indexar landing + legal, bloquea /dashboard /admin /case /report (auth-only)
- [ ] `sitemap.xml` dinámico con landing + privacy + terms + field-test

### 11.3 Brand assets
- [ ] Favicon (32×32 + 16×16)
- [ ] Apple touch icon (180×180)
- [ ] OG default image
- [ ] Logo SVG inline en components/simulador/Logo.tsx
- [ ] Manifest.json (PWA-ready opcional)

**Criterio done sección 11:** metadata válida + assets generados.

---

## 12. QA + E2E + Demo (1h, codex + claude)

### 12.1 Build verify final
- [ ] `bun run build` PASS limpio
- [ ] `bun lint` PASS
- [ ] `tsc --noEmit` PASS strict
- [ ] No console.errors en dev server

### 12.2 Audit script ejecuta
- [ ] `scripts/simulador/hig-audit.mjs` PASS en 20 rutas (los 8 checks técnicos)

### 12.3 E2E Playwright (codex · C-006)
- [ ] `tests/simulador/e2e/v2-flows.spec.ts`
- [ ] Flow 1: Buyer onboarding (signup → org → team → checkout test mode → invite → done)
- [ ] Flow 2: Employee runtime (login con invitation → 6 sections → submit → ver loading)
- [ ] Flow 3: Manager dashboard (login manager → view team → drill-down member → ver report con risk event)
- [ ] Todos los flows pasan + screenshots auto-generados

### 12.4 Screenshot regression baseline
- [ ] Playwright snapshot de 20 rutas × 5 breakpoints = 100 screenshots
- [ ] Diff vs baseline (si existe) <5%
- [ ] Si no hay baseline, este es el baseline

### 12.5 Manual smoke (Pablo idealmente)
- [ ] Demo URL navega completo: `/` → signup → onboarding → dashboard → drill-down → report
- [ ] Field-test público probable en mobile + desktop
- [ ] Admin queue funcional

### 12.6 Demo grabada 5min
- [ ] Script de narración (claude)
- [ ] Grabar pantalla con Loom o similar (Pablo)
- [ ] Flow demo investor:
  1. Landing impacta (5s)
  2. Click "agendar diagnóstico" → signup Google (15s)
  3. Onboarding 5 steps (90s)
  4. Stripe checkout test mode (15s)
  5. Invitar 5 emails (10s)
  6. Login como empleado (15s)
  7. Completar caso 6 sections (40s acelerado)
  8. Submit → ver loading (5s)
  9. Volver dashboard manager → ver participante con banda (15s)
  10. Click → ver report completo con recomendación + plan 7d (30s)

**Criterio done sección 12:** demo grabada + 3 E2E pasan + screenshots OK + build PASS.

---

## 13. Asignación clara (sin pisarse)

### Codex hace (refactor mecánico + infra)
- PRE-A, PRE-B, PRE-D
- AppleToast, AppleProgressBar, AppleSkeleton, AppleSidebar, AppleTab, AppleIcon
- Bento pattern, Print styles
- Tier 3 polish (legal + admin)
- Auth callback + confirm
- Backend wiring verify
- Performance + a11y audit script + CI
- E2E Playwright
- Screenshot regression
- SEO metadata + sitemap + assets
- Mobile responsive scripts

### Claude hace (decisión + copy + UX)
- PRE-C, PRE-E
- Tokens simulador.css (radius, shadow, motion)
- AppleButton, AppleInput, AppleTextarea, AppleCard, AppleModal, AppleBadge, AppleEmptyState
- Typography components
- Tier 1 polish (Landing, Dashboard, Report, Runtime principalmente)
- Tier 2 polish (auth UI + invitation + field-test + onboarding wizard)
- Keyboard handlers Runtime (L-005)
- Microcopy review L-002 + L-003 todas las surfaces
- i18n LATAM helpers + middleware
- Animation polish específico
- Demo script narración

### Pablo hace (sign-off + manual)
- Aprueba PRE-0 cierre
- Manual smoke key surfaces
- Graba demo final 5min
- Sign-off PR final

---

## 14. Orden por dependencias (no por días)

```
┌─ Sección 0 (PRE-0 cierre) ────────────────────────────┐
│                                                        │
│  PRE-A, PRE-B, PRE-D (codex)                          │
│  PRE-C, PRE-E (claude)                                │
│  → bloquea TODO el resto                              │
└────────────────────────┬───────────────────────────────┘
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       v                 v                 v
┌─ Sección 1 ──┐  ┌─ Sección 2 ──┐  ┌─ Sección 7 ──┐
│ Tokens CSS   │  │ Apple wrappers│  │ Back wiring  │
│ (claude)     │  │ (claude+codex)│  │ (codex)      │
│ ~1h          │  │ ~2.5h         │  │ ~30min       │
└──────┬───────┘  └───────┬───────┘  └──────────────┘
       │                  │
       └────────┬─────────┘
                │
                v
┌─ Sección 3 (patterns) ────┐
│ Glass nav, Bento, Wizard  │
│ Voice rec, Save indicator │
│ ~1h                       │
└─────────────┬─────────────┘
              │
              v
┌─ Sección 4 (polish 20 surfaces) ──────────────────────┐
│                                                        │
│  4.1 Tier 1 (4 hero) — claude principal                │
│  4.2 Tier 2 (11 wizard+auth+field) — claude+codex      │
│  4.3 Tier 3 (5 legal+admin) — codex                    │
│                                                        │
│  ~5h paralelo                                          │
└────────────────────────┬───────────────────────────────┘
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       v                 v                 v
┌─ Sección 5 ──┐  ┌─ Sección 6 ──┐  ┌─ Sección 10 ─┐
│ i18n LATAM   │  │ Loading/Empty│  │ Motion polish│
│ (claude)     │  │ (ambos)      │  │ (claude)     │
│ ~45min       │  │ ~1h          │  │ ~1h          │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────┬────────┴─────────┬───────┘
                │                  │
                v                  v
┌─ Sección 8+9 (perf+a11y+responsive) ──┐
│  Audit + screenshots responsive        │
│  ~1.5h paralelo                        │
└─────────────────┬──────────────────────┘
                  │
                  v
┌─ Sección 11 (SEO+brand) ──┐
│ ~30min (codex)            │
└─────────────┬─────────────┘
              │
              v
┌─ Sección 12 (QA+E2E+demo) ──────┐
│ Build verify, E2E, screenshots, │
│ smoke, demo grabada             │
│ ~1h paralelo                    │
└─────────────┬───────────────────┘
              │
              v
       ┌──── PABLO SIGN-OFF ────┐
       │ último checkbox        │
       └────────────────────────┘
```

**Total estimado paralelo: ~10-12h efectivas de trabajo concentrado.**

---

## 15. Criterio de "perfecto" — checklist final cerrado

Cuando Pablo pregunte "¿quedó perfecto?", la respuesta es SÍ si y solo si:

### Técnico
- [ ] `bun run build` PASS
- [ ] `bun lint` PASS
- [ ] `tsc --noEmit` strict PASS
- [ ] `scripts/simulador/hig-audit.mjs` PASS 20 rutas
- [ ] `bun test:e2e` PASS los 3 flows críticos

### HIG compliance
- [ ] 20 `HIG_SURFACE_REVIEW_FORM` llenos, todos PASS o PASS-WITH-FIXES (sin FAIL)
- [ ] Todos los `MUST` de HIG-RULES cumplidos en 20 rutas (audit script confirma)
- [ ] Anti-patterns evitados en 20 rutas (audit script confirma)
- [ ] Decisiones nuevas registradas en `Decisiones Itera` section

### Performance
- [ ] Lighthouse perf ≥90 en 20 rutas
- [ ] FCP <1.8s en 20 rutas
- [ ] LCP <2.5s en 20 rutas

### Accessibility
- [ ] Lighthouse a11y ≥95 en 20 rutas
- [ ] axe-core 0 critical + 0 serious en 20 rutas
- [ ] Manual keyboard nav PASS en surfaces tier 1
- [ ] Dark mode + light mode visualmente OK + contraste verificado
- [ ] `prefers-reduced-motion` respeta

### Responsive
- [ ] 375 / 768 / 1024 / 1280 / 1440 visualmente OK en 20 rutas

### Backend
- [ ] 13 endpoints API responden correctamente
- [ ] Auth Supabase flow OK
- [ ] Stripe Checkout flow test mode OK
- [ ] Judge LLM evaluate flow OK

### Componentes
- [ ] 10 Apple wrapper components implementados y usados
- [ ] 6 patterns reusables implementados
- [ ] Iconografía Lucide stroke 1.5 sistemática
- [ ] Tokens CSS (radius, shadow, motion) usados en todo cleanroom

### Copy
- [ ] Voice Itera LATAM serio sin corporate-bot en TODAS las surfaces
- [ ] Capitalización consistente (Sentence case CTAs, UPPERCASE eyebrows, lowercase microcopy)
- [ ] Error messages accionables (qué hacer, no qué falló)
- [ ] Empty states con CTA siguiente

### i18n
- [ ] Format helpers funcionan es-MX / es-CO / es-AR
- [ ] Privacy variants por jurisdicción
- [ ] Disclaimers fiscales en billing

### QA
- [ ] Demo grabada 5min flow completo
- [ ] Screenshot regression baseline establecido
- [ ] Pablo smoke manual PASS

### Sign-off
- [ ] Pablo aprueba PR final
- [ ] Merge a `codex/simulator-front-cleanroom` (rama de trabajo) limpio
- [ ] (Opcional) PR a `main` cuando Pablo decida

---

## 16. Rules de coordinación durante ejecución

- **Branch única:** `codex/simulator-front-cleanroom`
- **Commit prefix:** `[agent:claude] [SS-NN] descripción` o `[agent:codex] [SS-NN] descripción` (SS = sección, NN = sub-tarea)
- **Pull antes de cada edit**
- **Build PASS por commit**
- **Coordinación async vía `INBOX_CODEX.md` / `INBOX_CLAUDE.md`** — sin pings 270s, sin loops
- **Si conflicto en archivo:** quien tocó primero gana, otro pull rebase
- **Form gate llenado obligatorio antes de commit polish de surface**
- **Pablo veta cualquier task** — si dice "no", se saca del plan sin discusión

---

— claude · 2026-05-20 · MASTER_PLAN_HOY.md v1.0
