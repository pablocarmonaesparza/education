# División de tareas claude ↔ codex — polish Apple HIG + Typeform UX

> ⚠️ **HISTÓRICO — no vigente (2026-05-20).** Reparto de tareas de un sprint concreto; se conserva como registro. Reglas vigentes: `APPLE_HIG_RULES_FOR_ITERA.md`. Rutas: `FRONT_CONTRACT.md`. Verificación: `npm run check:simulador` (no `bun`). Iconos: AppleIcon → Tabler (`DEC-001`), no Lucide.

> Fuente de verdad de diseño: `APPLE_HIG_REFERENCE.md` (en la misma carpeta).
> Stack confirmado: Tailwind + HeroUI v2 + framer-motion + 21st.dev (referencia, no copy-paste wholesale).
> Filosofía Itera: "Apple HIG a rajatabla + simplicidad UX Typeform" — todo lo que construyamos cumple las dos.

---

## Filosofía de la división

Después del IDLE_HANDOFF_TO_CLAUDE de la sesión pasada (codex pasó bloque 2 a claude), reabrimos co-trabajo paralelo. La división se basa en **especialidad natural de cada agente**, no en aleatoriedad.

**Codex es mejor para:**
- Refactor mecánico sistemático (find-replace en N archivos, override de tokens, batch operations)
- Migrations / scripts / seeders / infra
- Tests automatizados (E2E Playwright, unit, integration)
- Build pipelines, CI/CD, observability hooks
- SQL queries, supabase MCP, schema work
- Refactors donde la regla es clara y aplicar es repetitivo

**Claude es mejor para:**
- Copy / UX writing / microcopy en español LATAM serio
- Decisiones de jerarquía visual (cuándo headline, cuándo eyebrow, cuándo body)
- Adaptación de patrones Apple HIG nativos a web (juicio interpretativo)
- Animation timing curves y feeling (no hay regla mecánica)
- Prompt engineering para judge LLM, generación de copy, voice de Camila
- Review visual contra screenshots, gap analysis surface por surface

**Ambos pueden:**
- Read/Write código React
- Build verify local
- Commit + push
- Coordinación via INBOX_*.md + git log

**Regla de coordinación:**
- Antes de tocar un archivo, anuncia en `INBOX_CODEX.md` o `INBOX_CLAUDE.md` qué surface vas a editar
- Si ves un commit del otro tocando el mismo archivo, pull primero y rebase
- Build verify NUNCA es opcional — cada commit cierra con `bun run build` PASS
- Mensajes de commit incluyen `[agent:claude]` o `[agent:codex]` prefix para auditoría visual de quién hizo qué

---

## Tareas del polish Apple+Typeform — bloque 3

> Pre-requisito: `APPLE_HIG_REFERENCE.md` debe existir y estar leído por ambos antes de arrancar tareas.

### Tareas codex (refactor sistemático)

**C-001 · Iconografía consistente stroke 1.5px**
- Audit: `grep -rn "lucide-react\|@phosphor-icons\|@heroicons" components/ app/`
- Si Lucide: agregar prop `strokeWidth={1.5}` a TODOS los íconos del cleanroom
- Si mezcla: estandarizar a Lucide React con stroke 1.5px (más Apple-thin que default 2)
- Crear `components/simulador/Icon.tsx` wrapper que aplique strokeWidth default 1.5
- Verifier: build PASS + grep `strokeWidth={2}\|strokeWidth="2"` → 0 hits
- Surface impactada: TODAS

**C-002 · Border radius scale tokens**
- Decisión Apple HIG (extraer del REFERENCE): radius scale típica 4/8/12/16/20/24 según tamaño
- Definir en `app/(app)/simulador.css`:
  ```
  --radius-xs: 4px;   /* badges, chips, tag */
  --radius-sm: 8px;   /* buttons, inputs, small cards */
  --radius-md: 12px;  /* cards default */
  --radius-lg: 16px;  /* cards grandes, modals */
  --radius-xl: 20px;  /* hero containers, popovers */
  --radius-2xl: 24px; /* sheets, presentation */
  --radius-full: 9999px; /* solo pills muy específicas */
  ```
- Override sistemático: buscar `rounded-full` en componentes y reemplazar por `rounded-[var(--radius-sm)]` etc.
- Excepciones documentadas (cuáles SÍ deben ser pill — chips de banda A/M/B, dots de progress)
- Verifier: grep `rounded-full` → ≤10 hits total (solo los justificados)

**C-003 · Shadow scale sutil Apple**
- Definir en `simulador.css`:
  ```
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.10);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.12);
  ```
- Override sistemático: reemplazar `shadow-lg`, `shadow-xl` de Tailwind defaults (que son demasiado pesados) por las nuevas variables
- Verifier: grep `shadow-(lg|xl|2xl)` en JSX → 0 hits

**C-004 · Letter-spacing displays**
- Apple HIG: displays >32px usan letter-spacing -0.022em (extraer cifra exacta del REFERENCE)
- Agregar utility class `.display-tight` en simulador.css con `letter-spacing: -0.022em`
- Audit: `grep "text-\[4[0-9]" components/ app/` (todos los >40px)
- Aplicar `display-tight` o equivalente en todos
- Verifier: ningún H1/H2 >32px sin tight tracking

**C-005 · CapitalizationCorrecta minúsculas + Title Case**
- Apple usa Title Case en muchos buttons / labels — pero Itera default es lowercase per CLAUDE.md
- Conflict resolution: definir regla operacional
  - Botones de acción primaria: **Sentence case** ("Agendar diagnóstico", "Continuar")
  - Labels/captions/microcopy: **lowercase** ("nombre", "email")
  - Headings (H1/H2/H3): **Sentence case** ("Las cinco dimensiones.")
  - Eyebrows (sm uppercase): **UPPERCASE** ("DIAGNÓSTICO OPERATIVO")
- Audit cleanroom: encontrar mismatches en Landing/Dashboard/Report/Runtime
- Generar reporte de cambios propuestos antes de aplicar (Pablo aprueba)

**C-006 · Tests E2E Playwright para 4 surfaces tier 1**
- `tests/simulador/e2e/v2-tier1-surfaces.spec.ts`
- Smoke por surface: render OK, no console errors, no broken images, semantic HTML correct
- Snapshot visual (Playwright screenshot diff con baseline) — si hay regresión visual >5%, falla
- Verifier: `bun test:e2e` PASS

**C-007 · Audit imports legacy final**
- `grep -rn "@/components/ui\|@/components/shared\|HashScrollHandler\|lib/design-tokens" app/ components/ lib/` → debe retornar 0
- Si encuentra residuos: limpiarlos
- Verifier: grep 0 hits

---

### Tareas claude (decisión de diseño + copy)

**L-001 · Adaptar Apple HIG Foundations a Itera Design Tokens**
- Después de `APPLE_HIG_REFERENCE.md` (en construcción por agent):
- Leer secciones Foundations (Color, Typography, Layout, Motion, Materials)
- Producir `docs/simulador/front/DESIGN_TOKENS_v2.md`: traducción Apple HIG → tokens CSS que ya tenemos en `simulador.css`
- Para cada token actual, anotar: ✓ ya Apple-compliant / ⚠ requiere ajuste / ✗ contradice Apple
- Output: PR plan con cambios necesarios + Pablo aprueba antes de aplicar

**L-002 · Microcopy review pase 1 — Landing**
- Leer Landing copy actual contra Apple Writing guidelines + voice Itera (LATAM serio, no corporate-bot)
- Especial atención:
  - CTAs: ¿son específicos? ("Agendar diagnóstico" ✓ vs "Empieza ahora" ✗)
  - FAQ answers: ¿conversacionales? ¿precisas? ¿sin jerga?
  - Hero sub: ¿claro qué se vende?
  - Footer microcopy: ¿coherente?
- Output: lista de cambios propuestos en formato diff (old → new) antes de aplicar
- Aplicar después de aprobación de Pablo

**L-003 · Microcopy review pase 2 — Runtime (caso vivo)**
- RuntimeExperience.tsx tiene labels en cada step
- Audit por sección (intro/data/draft/escalate/deliver/reflect):
  - ¿Suena a Camila (CMO humana, presión real) o a formulario seco?
  - ¿Las preguntas guían sin spoilers evaluativos? (Recordar contrato_v0 sección 16: sin pistas de qué se evalúa)
  - ¿Botones dicen qué pasa al click ("Enviar respuesta y continuar") o son genéricos ("Siguiente")?
- Output: lista de cambios + aplicar después de aprobación

**L-004 · Animation timing & easing curves Apple**
- Apple HIG Motion: extraer durations canónicas + easing curves (probablemente cubic-bezier ease-out-quart o similar)
- Definir en `simulador.css`:
  ```
  --motion-fast: 150ms;     /* tap, hover */
  --motion-base: 250ms;     /* state changes */
  --motion-slow: 450ms;     /* page transitions */
  --motion-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* solo donde Apple usa spring */
  ```
- Audit framer-motion usage en cleanroom: usar las nuevas variables consistently
- Decidir cuándo Motion spring vs ease (Apple HIG es claro: spring solo en sheet presentations + drag responses, NO en hover ni page nav)

**L-005 · Keyboard handlers Runtime (Typeform UX)**
- En RuntimeExperience.tsx:
  - `Enter` (cuando step válido) → continuar al siguiente
  - `Esc` → volver al step anterior (con confirm si hay cambios)
  - `Cmd+K` → abrir sidebar/index del caso
  - `Cmd+S` → forzar save (UI feedback "guardado" sutil)
- Test manual + commit
- Verifier: keyboard nav funciona en todos los steps sin trabarse

**L-006 · Tap feedback motion en HeroUI Button override**
- Crear `components/simulador/AppleButton.tsx` wrapper de HeroUI Button con:
  - `whileTap={{ scale: 0.98, opacity: 0.96 }}`
  - `transition={{ duration: 0.1 }}`
  - Shadow scale tokens de C-003
  - Radius tokens de C-002
- Migrar usages de `Button` de HeroUI a `AppleButton` en surfaces tier 1 (5 archivos máximo)
- Verifier: build PASS + visual smoke

**L-007 · Empty states + loading states audit**
- Apple HIG Patterns: "Loading" y "Onboarding" definen estados intermedios
- Audit cleanroom surfaces:
  - /dashboard sin team data → ¿hay empty state? (existe parcialmente, mejorar)
  - /report en pending_review → ¿hay state? (existe, audit visual)
  - /case/[id] cargando session → ¿skeleton screen o spinner? Decidir
- Definir patrón consistente: skeleton screens > spinners para datos esperados; spinners para acciones <2s

---

### Tareas conjuntas claude + codex

**CL-001 · Polish surface por surface, una a la vez**
- Orden: Landing → Dashboard → Report → Runtime → Onboarding wizard → Auth → Legal
- Por surface, ciclo:
  1. **claude** redacta gap report (qué falta vs APPLE_HIG_REFERENCE)
  2. **codex** aplica fixes mecánicos (radius, shadow, stroke)
  3. **claude** aplica fixes de copy / jerarquía / motion
  4. Ambos: build verify + screenshot diff vs baseline
  5. Commit conjunto si ambos aprobaron
- Coordinación: INBOX_CODEX/INBOX_CLAUDE entre cada handoff

**CL-002 · APPLE_HIG_REFERENCE.md como living document**
- Cuando aparezca una decisión que el doc no cubre, añadir sección "Decisiones Itera" al final con la regla + razón
- No editar el contenido scraped de Apple — solo agregar al final
- Versionar con date stamps

**CL-003 · 21st.dev curaduría**
- claude identifica 3-5 patrones de 21st.dev que aplicarían a Itera (sidebar app shell, bento landing, dashboard stats, onboarding wizard, FAQ)
- codex evalúa technical feasibility (deps requeridas, posibles conflictos con HeroUI)
- Decisión conjunta: ¿adoptar / adaptar / descartar?
- Pablo aprueba antes de integrar cualquiera

---

## Orden de ejecución sugerido

**Día 1 (hoy):**
- ⏳ Agent scrape APPLE_HIG_REFERENCE.md (15-30 min, en background)
- ⏳ Pablo lee + aprueba el reference doc
- ⏳ Claude redacta L-001 (DESIGN_TOKENS_v2.md proposal)
- ⏳ Pablo aprueba el plan de polish

**Día 2:**
- Codex: C-001 (iconografía) + C-002 (radius) + C-003 (shadows) — refactor mecánico
- Claude: L-004 (motion tokens) + L-006 (AppleButton wrapper)
- Build verify + commit
- Surface 1 (Landing): polish completo (claude microcopy L-002, ambos motion + tokens)

**Día 3:**
- Surface 2 (Dashboard): polish completo
- Surface 3 (Report): polish completo
- Codex: C-006 (Playwright tests baseline)

**Día 4:**
- Surface 4 (Runtime): polish + L-003 microcopy + L-005 keyboard handlers
- Codex: C-005 (capitalization audit) + C-007 (legacy imports final)

**Día 5:**
- Surfaces tier 2 (auth + onboarding + field-test)
- Smoke E2E + screenshot diff vs baseline
- Demo grabada 5min

---

## Reglas de coordinación operacional

1. **Branch única `codex/simulator-front-cleanroom`** — ambos commiteamos ahí, sin sub-branches
2. **Pull antes de cada edit** — `git pull --rebase origin codex/simulator-front-cleanroom`
3. **Build PASS por commit** — no se mergea código que rompa build
4. **Commit prefix obligatorio**: `[agent:claude] [c-001] iconografía stroke 1.5` o `[agent:codex] [l-006] tap feedback motion`
5. **INBOX coord**: si vas a tocar surface X, anuncia en INBOX antes (no permission, solo aviso para evitar conflict)
6. **APPLE_HIG_REFERENCE.md es read-only** durante ejecución del polish — solo se agrega "Decisiones Itera" al final
7. **Pablo veta cualquier task** — si responde "no", la sacamos del plan sin discusión

---

— claude · 2026-05-19 · pre-bloque 3 polish Apple+Typeform
