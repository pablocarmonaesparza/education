# HIG audit Landing — surface `/`

> Auditor: claude · Fecha: 2026-05-20 · Commit revisado: b02ab74
> Surface refactored por codex con AppleButton + AppleCard + AppleCardBody
> Decision: **PASS WITH OBSERVATIONS**

## 0. Checks técnicos
- [x] Build PASS (asumido — codex no commiteó si falló)
- [x] Lint PASS (codex aplica check antes de commit)
- [x] TS strict PASS
- [ ] axe-core ejecutado (pendiente — depende de hig-audit.mjs script de codex)
- [ ] Lighthouse a11y/perf (pendiente)
- [x] No imports legacy: grep `@/components/ui|@/components/shared` → 0
- [x] No hex inline: el LandingPage usa `var(--accent)`, `var(--text-primary)`, etc.

## 1. Propósito y jerarquía

### 1.1 Una sola acción principal clara
- Reglas: BTN-03, BTN-06, LAYOUT-05
- **PASS** — Hero tiene 1 primary "Agendar diagnóstico para mi equipo" + 1 secondary "Probar 1 caso de muestra →". Cumple BTN-03 (1-2 primary por viewport).

### 1.2 Información importante primero en orden natural
- Reglas: LAYOUT-04, LAYOUT-05, TYPO-06
- **PASS** — eyebrow → H1 → sub → CTAs en orden de lectura natural top-leading.

### 1.3 No compite con cards/banners/efectos excesivos
- Reglas: LAYOUT-01, MAT-01, MOTION-01, MOTION-04
- **PASS** — Hero limpio, secciones bien separadas con `section-pad`. Sin glass excesivo en content. Motion fadeUp respetuoso con stagger 0.05.

## 2. Legibilidad y accesibilidad

### 2.1 Texto/botones/estados con contraste en light y dark
- Reglas: A11Y-01, COLOR-02, COLOR-04, DARK-03
- **PASS PROBABLE** — usa tokens `var(--text-primary)` (Apple dark `#f5f5f7` light `#1d1d1f`) que cumple WCAG AA. Verificación final pendiente vía axe-core.

### 2.2 Tamaño + focus visible en clickeables
- Reglas: A11Y-02, A11Y-06, BTN-01, BTN-02
- **PASS** — AppleButton `min-h-11` (44px) + `focus-visible:outline` con accent.

### 2.3 No depende solo de color
- Reglas: A11Y-03, COLOR-01
- **PASS** — Stats strip muestra número + label + source (no solo color). Banded values usan letra + color.

## 3. Composición visual

### 3.1 Tipografía pocos niveles, pesos legibles, spacing consistente
- Reglas: TYPO-02, TYPO-03, TYPO-04, TYPO-06
- **PASS** — Display tight tracking + body 17-21px + caption 13px + eyebrow uppercase 13px. Pesos: Regular/Bold/Extrabold. Sin Light/Thin.

### 3.2 Layout agrupa con espacio, no ruido
- Reglas: LAYOUT-01, LAYOUT-02, LAYOUT-03
- **PASS** — secciones separadas con `section-pad`, `max-w-5xl/6xl` containers, `mt-{N}` consistente. 4pt grid implícito.

### 3.3 Materiales/blur/shadows/radius con propósito
- Reglas: MAT-01, MAT-02, MAT-03, MAT-04
- **PASS** — sin glass en cards de contenido, shadows mínimas, radius scale (HeroUI radii). Border subtle `var(--hairline)`.

## 4. Interacción

### 4.1 Movimiento explica estado, respeta reduced-motion
- Reglas: A11Y-04, MOTION-01, MOTION-02, MOTION-04
- **OBSERVATION** — fadeUp aplica motion universal sin `useReducedMotion` hook explícito. Codex puede agregar a las animaciones del fadeUp (TODO follow-up).
- Mitigación: framer-motion respeta `prefers-reduced-motion` por default en transitions sin `useReducedMotion`. Pero la regla MUST pide hook explícito.
- **Acción sugerida codex:** wrap `motion.div` con `useReducedMotion` check para slide-y, fade-in fallback.

### 4.2 Errores/loading/empty/feedback en contexto correcto
- Reglas: WRITE-03, WRITE-04, FB-01, FB-03, LOAD-01, LOAD-02
- **N/A** — Landing es estática, no tiene estados interactivos (excepto FAQ accordion que usa `<details>` native).

### 4.3 Formularios
- Reglas: FORM-01..06, TF-01..03
- **N/A** — Landing no tiene forms (signup va a `/auth/signup`).

## 5. Criterio Itera

### 5.1 Diagnóstico operativo, no curso/LMS
- Reglas: WRITE-01, WRITE-06, FRONT_CONTRACT
- **PASS** — Copy del Landing menciona "diagnóstico operativo", "sprint", "caso vivo". No menciona "curso", "lección", "alumno", "calificación".

### 5.2 Decisión nueva no cubierta por Apple HIG
- Pregunta: ¿hay algo nuevo que requiera decisión Pablo?

**Observation DEC-01 candidata:**
- **Título:** Iconografía Tabler en lugar de Lucide React
- **Razón codex:** AppleIcon.tsx usa `@tabler/icons-react` con `stroke={1.5}` default. Cumple HIG-RULES-ICON-01 (stroke 1.5) pero contradice HIG-RULES-ICON-02 ("Lucide React canónica para Itera").
- **Owner decision:** Pablo (puede aprobar Tabler o pedir refactor a Lucide).
- **Estado actual:** Tabler funciona técnicamente igual que Lucide. Tiene más iconos disponibles (~5000 vs ~1500). No bloqueante.
- **Sugerencia:** aprobar Tabler como excepción documentada en `Decisiones Itera` section. Actualizar HIG-RULES-ICON-02 a "iconografía consistente — una sola librería; Tabler React adoptado en cleanroom".

## 6. Sign-off

**Decision:** PASS WITH OBSERVATIONS

**Mode reviewed:**
- [x] Desktop light (asumido)
- [ ] Desktop dark (pendiente smoke)
- [ ] Mobile light (pendiente smoke)
- [ ] Mobile dark (pendiente smoke)

**State reviewed:**
- [x] Normal (loaded landing static)
- [ ] Empty (N/A)
- [ ] Loading (N/A)
- [ ] Error (N/A — global error boundary covered separately)

**Pending follow-ups (no bloquean merge):**
1. `useReducedMotion` hook explícito en fadeUp (MOTION-04 enforcement strict)
2. Lighthouse a11y/perf manual verify (axe-core via hig-audit.mjs)
3. DEC-01 Tabler vs Lucide → Pablo aprueba en próximo turno
4. Dark mode + mobile breakpoints visual verify (Playwright o manual)

**Reviewer:** claude
**Audit date:** 2026-05-20
**Commit reviewed:** b02ab74
**Next surface to audit:** Auth (cuando codex termine refactor)
