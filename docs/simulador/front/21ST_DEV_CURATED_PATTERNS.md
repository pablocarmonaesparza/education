# 21st.dev curaduría — patterns aceptables para Itera Simulador

> Autoridad 5 (inspiración, no ley). Subordinado a `APPLE_HIG_RULES_FOR_ITERA.md`.
> **NUNCA pegar 21st.dev block sin adaptar a tokens HIG.**

## Reglas de uso

1. **No copy-paste wholesale.** Tomar el patrón, no el código.
2. **Adaptar al sistema de tokens** (`--radius-*`, `--shadow-*`, `--motion-*`, `--accent`, etc.) antes de mergear.
3. **Validar accesibilidad** — la mayoría de 21st.dev blocks no son a11y-first. Agregar focus visible, aria-labels, keyboard nav.
4. **Validar copy contra voice guide** — los patterns vienen en inglés genérico SaaS. Re-escribir voz Itera LATAM.
5. **Máximo 2-3 variantes exploradas por componente.** No barrer el catálogo.

## Patterns aceptables (curados por claude)

### 1. Sidebar app shell — para EmployeeShell / ManagerShell / RuntimeShell / AdminShell

**Ejemplos 21st.dev a referenciar (NO copy):**
- "Sidebar with collapsible sections" — split nav top items + bottom user menu
- "Vertical icon nav with expand on hover" — modo colapsada minimal

**Qué adaptar de Itera:**
- Header logo top-leading
- Nav vertical con icon + label (HIG-RULES-SIDE-03)
- Collapsible en desktop con toggle, drawer en mobile (HIG-RULES-SIDE-01)
- User menu bottom con avatar + dropdown
- Tokens: `--radius-sm` para items, `--shadow-xs` resting, `--shadow-sm` hover

**Tener cuidado:**
- 21st.dev blocks tipo "Premium sidebar" suelen tener gradients + glass excesivo → simplificar a Apple-like restraint
- Hover scale en items debe ser sutil (1.01-1.02 max, no 1.05)
- Quitar emojis decorativos de 21st.dev

### 2. Onboarding wizard — para OnboardingShell

**Ejemplos 21st.dev:**
- "Multi-step onboarding with progress dots top"
- "Wizard with side panel preview"

**Qué adaptar de Itera:**
- Topbar h-14 con progress dots horizontal (HIG-RULES-PROG-01)
- Main centered max-w-2xl
- Bottom nav sticky: ← Atrás · Continuar →
- Defaults sensatos en cada step (HIG-RULES-FORM-02)
- Validación inline (HIG-RULES-FORM-01)

**Tener cuidado:**
- 21st.dev wizards tipo "Stripe-style billing" pueden ser demasiado densos para B2B LATAM no-técnico
- Quitar progreso numérico fino tipo "Step 2/5 · 40% complete" (Apple HIG prefiere progressbar visual sin números)

### 3. Dashboard stats grid — para ManagerShell

**Ejemplos 21st.dev:**
- "Stats card grid with sparklines"
- "KPI hero strip with comparison"

**Qué adaptar de Itera:**
- KPI cards 4-col grid bento (HIG-RULES-LAYOUT-01)
- Display tight tracking para números (HIG-RULES-TYPO-04)
- Eyebrow UPPERCASE arriba de cada KPI
- Banda visual (A/M/B) en lugar de % cuando aplica
- No deltas decorativos sin baseline real

**Tener cuidado:**
- 21st.dev dashboard blocks tipo "Vercel/Linear premium" tienen gradient backgrounds → eliminar, usar surface flat (HIG-RULES-MAT-01)
- Sparklines OK pero sin labels excesivos
- No usar `text-blue-500` etc., usar `var(--accent)` (HIG-RULES-COLOR-03)

### 4. Report executive layout — para ReportShell

**Ejemplos 21st.dev:**
- "Executive summary card with recommendation"
- "Audit report with severity levels"

**Qué adaptar de Itera:**
- Header con Eyebrow + Display H1 (HIG-RULES-TYPO-04)
- Overall pull card border-l accent (recomendación + readiness)
- 5 dimensiones cards con pill banda + rationale
- Risk events cards con severity pill + evidence blockquote (italic)
- Plan 7 días lista ordenada con números mono

**Tener cuidado:**
- 21st.dev report blocks suelen tener charts overengineered (radar, polar, etc.) → Itera usa solo bandas A/M/B + pills, sin charts radar
- No usar emojis 🟢 🟡 🔴 — usar AppleBadge con letras A/M/B + colors tokens (HIG-RULES-A11Y-03)

### 5. FAQ accordion — ya implementado en Landing

**Ejemplos 21st.dev:**
- "FAQ with chevron toggle"
- "Accordion with smooth expand"

**Qué adaptar de Itera (ya hecho W1):**
- `<details>/<summary>` native HTML con `[&_summary::-webkit-details-marker]:hidden`
- Group-open rotate-45 icon "+"
- Padding y-5
- Divide-y hairline

**Validar:**
- Keyboard nav: Tab focus + Enter expand (native HTML lo da gratis)
- aria-expanded automático con `<details>` (gratis)

### 6. Pricing table horizontal — ya planeado en Landing

**Ejemplos 21st.dev:**
- "Comparison pricing table horizontal"
- "B2B pricing with feature matrix"

**Qué adaptar de Itera:**
- Tabla horizontal, NO cards 3-col SaaS genéricas
- Highlight de tier "popular" sutil (border accent, no fluorescent badge)
- Features comparables con check/cross discreto

**Tener cuidado:**
- Quitar "Most popular" badges escandalosos
- Sin gradients en headers de columnas

### 7. CTA strip — ya implementado en Landing

**Ejemplos 21st.dev:**
- "Final CTA section with two buttons"
- "Newsletter-style CTA with input"

**Qué adaptar de Itera (ya hecho W1):**
- H2 simple + sub + 2 CTAs (primary + ghost)
- max-w-4xl centered
- Background surface-tinted

**NO usar:**
- 21st.dev "Cookie banner-style sticky CTAs"
- Email capture en CTA strip (Itera no captura emails en landing — usa field-test)

### 8. Footer 4-columnas — ya implementado en Landing

**Ejemplos 21st.dev:**
- "Footer with 4-column links + newsletter"
- "Minimal footer with grid layout"

**Qué adaptar de Itera (ya hecho W1):**
- 4 columns: Producto / Empresa / Legal / Acceso
- Mono caption labels uppercase tracking-widest
- Bottom row con © + geoTarget

**NO usar:**
- Newsletter signup en footer (Itera no tiene newsletter publica)
- Social media icons gigantes (Itera no tiene social activo en LATAM aún)

---

## Patterns RECHAZADOS (no usar)

### ❌ Hero con video background autoplay
- Contradice HIG-RULES-A11Y-04 (prefers-reduced-motion)
- Performance penalty
- Apple HIG: "Avoid autoplaying audio and video"

### ❌ Testimonial avatars circulares con quotes
- Itera no tiene customers reales aún
- Falsificar testimonials es anti-ético + viola contrato producto

### ❌ Floating action button (FAB) Material-style
- Apple HIG no usa FAB
- Itera usa CTAs explícitos en context

### ❌ Animated counters (count-up de números KPI)
- Subtle OK (300ms once), agresivo NO
- Apple HIG: "feedback animations brief and precise" — count-up debe ser <500ms total

### ❌ Pricing toggle "Monthly/Yearly" con switch
- Itera vende sprints de 30 días — no es subscription mensual/anual
- No aplica al modelo de negocio

### ❌ "Trusted by X companies" logo bar
- Falso hasta tener 10+ customers reales
- Quitar hasta v1.x

### ❌ Chatbot widget bottom-right
- Itera tiene `hola@itera.la` mailto, no chatbot
- Chatbot agrega ruido + falsa expectativa de respuesta inmediata

### ❌ Modal de "Welcome tour" full-screen primer login
- Contradice HIG-RULES-ONB-03 (teach by interactivity, not text)
- Itera usa context tips contextuales si aplica

### ❌ Gradient mesh backgrounds psychedelic
- Contradice HIG-RULES-MAT-01 (Liquid Glass solo en chrome)
- Distrae del contenido

---

## Cómo evaluar un pattern 21st.dev nuevo

Checklist antes de adaptarlo:

- [ ] ¿Sirve a una surface concreta de las 20? (si no, descartar)
- [ ] ¿Cumple HIG-RULES-A11Y-01..07? (contraste, hit target, keyboard, aria, reduced-motion)
- [ ] ¿Usa tokens semánticos o hex hardcoded? (si hex, hay que portar)
- [ ] ¿Tiene copy genérico SaaS? (si sí, re-escribir voz Itera LATAM)
- [ ] ¿Su animation respeta HIG-RULES-MOTION-02 (duraciones)?
- [ ] ¿Tiene emojis decorativos? (quitar)
- [ ] ¿Funciona en dark mode? (verificar)

Si responde "no" a más de 1, **descartarlo** o **adaptarlo profundamente** (>50% del código cambia).

---

## Workflow recomendado para codex

1. Para una surface, identifica patron necesario (ej "dashboard stats")
2. Busca 2-3 variantes en 21st.dev (no más)
3. Toma el patrón conceptual (estructura, no código)
4. Implementa con HeroUI components + tokens HIG + voice Itera
5. Valida con checklist arriba
6. Si pasa: commit con prefix `[agent:codex] [inspired-by-21stdev:<pattern-name>]`
7. Si no pasa: descarta y vuelve a HeroUI base

---

— claude · 2026-05-20 · 21st.dev curaduría v1.0
