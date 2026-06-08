---
name: verification-design
version: 1.1.0
description: |
  Gate de diseño para cualquier UI / visual / componente / página / pulido de frontend
  de Itera. Antes de entregar: lee la doctrina de diseño (HIG docs + /design + /design/components
  + tokens + componentes Apple centrales), reusa o PROMUEVE al design system (fuente única —
  todo apunta a /design/components para que un cambio futuro propague), verifica el render real
  en browser (mide, no a ojo), corre el HIG review, y cierra con loop de Codex: si Codex reprueba,
  yo (Claude Code) reparo y reenvío a Codex una y otra vez hasta PASS.
  A nivel componente aplica además compuertas numéricas medidas en browser (absorbe la antigua
  componente-hig). Úsala cuando Pablo pida UI, diseño visual, componente, página o frontend.
  Invócala con /verification-design <lo que vas a construir o cambiar>.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
  - TodoWrite
  - mcp__MCP_DOCKER__browser_navigate
  - mcp__MCP_DOCKER__browser_evaluate
  - mcp__MCP_DOCKER__browser_take_screenshot
  - mcp__MCP_DOCKER__browser_snapshot
  - mcp__MCP_DOCKER__browser_resize
  - mcp__MCP_DOCKER__browser_click
---

# /verification-design — gate HIG + design system + loop Codex

No basta con "se ve bien". El objetivo es que **cada objeto apunte de vuelta al design system de Itera**, de modo que un cambio futuro en `/design`, `/design/components` y `components/simulador/apple/*` propague a todo el sistema. Yo construyo, verifico contra la doctrina, y Codex es el gate final.

## Fuentes requeridas (leer ANTES de tocar UI)

Carga primero el mapa `references/itera-design-source-map.md`, luego abre solo las secciones relevantes de:

- `docs/simulador/front/APPLE_HIG_RULES_FOR_ITERA.md` — autoridad de diseño top
- `docs/simulador/front/HIG_SURFACE_REVIEW_FORM.md` — formulario de review (P00–P15)
- `docs/simulador/front/PRODUCT_VISION_ONE_PAGER.md` — feeling premium/serio/B2B
- `docs/simulador/front/FRONT_CONTRACT.md` — contrato de rutas/roles
- `docs/memory/metodologia_design_system_fuente_unica.md` — método de fuente única
- `docs/memory/metodologia_verificar_opiniones_diseno_con_hig.md` — aterrizar opiniones de Pablo en principio HIG + medir
- `app/design/page.tsx`, `app/design/components/page.tsx`
- `components/simulador/apple/index.ts`, `lib/simulador/design-tokens.ts`, `app/(app)/simulador.css`

## Workflow

1. **Define la superficie.** Ruta, página, componente, estado, viewport, rol. Revisa `FRONT_CONTRACT.md` antes de exponer rutas. No revivas superficies legacy de curso/LMS.

2. **Carga el contrato de diseño.** Orden de `APPLE_HIG_RULES_FOR_ITERA.md`: HIG + accesibilidad → contrato de producto → decisiones de Pablo → productos de referencia → taste del agente. Si una regla escrita choca con un patrón central establecido, NO elijas en silencio: preserva el patrón central localmente y marca el conflicto.

3. **Si Pablo dio una opinión de diseño**, aterrízala primero en el principio HIG que aplica y **mídelo empíricamente** (computed styles, posición vs centro del viewport, contraste, radios reales) — no a ojo. Luego aplica al nivel correcto (token / componente compartido / global / pantalla).

4. **Reusa antes de crear.** Prefiere exports de `components/simulador/apple/index.ts`. No reimplementes botones, cards, inputs, tabs, modales, progress, íconos, toasts ni primitivos de ejercicio si ya existe un componente central.

5. **Promueve UI reusable al sistema.** Si el objeto es reusable: créalo en `components/simulador/apple/`, expórtalo en `index.ts`, agrégalo a `app/design/components/page.tsx`, y haz que el origen lo CONSUMA. Nunca dejes copias feature-local duplicadas. (Regla de Pablo: diseñas primero donde vive la feature → promueves al design system → el origen pasa a apuntar ahí.)

6. **Respeta tokens.** Usa tokens y CSS variables existentes. Nada de hex inline, sombras arbitrarias, radios arbitrarios ni tipografía one-off salvo que actualices los token files y `/design` intencionalmente.

7. **Construye.** Premium, serio, enfocado, B2B. Evita LMS, dashboards SaaS genéricos, gradientes decorativos, course cards, certificados, copy hype, y exponer scoring interno antes de que el participante responda.

8. **Verifica visualmente — mide, no a ojo.** Browser/Playwright contra la app local. Inspecciona la superficie cambiada y `/design/components`. Desktop y mobile cuando el layout cambie. Sin overlaps, controles con dimensiones estables, dark/light donde aplique, foco/teclado usable.
   - **A nivel componente** (`components/simulador/apple/*`): aplica las **compuertas de medición empírica** de `references/component-measurement-gates.md` — 11 puntos PASS/FAIL medidos con `browser_evaluate` (radius ratio ~0.27, contraste con fórmula de luminancia ≥4.5:1, font en escala, grid 4/8px, una sola señal primaria, estados completos, paridad dark, alineación de columna, registro en /design/components). Cada veredicto trae su número. Corrige la **fuente central** del componente, no el uso suelto. Máx 4 vueltas; si no converge, presenta el punto que falla con su medición — nunca fuerces PASS ni truncar en silencio.

9. **Corre el HIG review.** Aplica `HIG_SURFACE_REVIEW_FORM.md` (P00 técnico + P01–P15). Cualquier issue sin resolver de accesibilidad, token, duplicación, contrato de ruta, rúbrica oculta o visual severo = FAIL.

10. **Gate de Codex.** Revisa el diff con Codex como revisor independiente (no autor):
    ```bash
    codex exec "Review este diff de UI de Itera contra HIG + design-system single-source. Verifica objeto por objeto que apunte a components/simulador/apple + tokens, sin duplicados ni hex inline. PASS o FAIL con issues bloqueantes específicos."
    ```
    No entregues como aprobado mientras quede un MUST.

11. **Reparo y reintento (loop).** Si Codex devuelve FAIL: yo (Claude Code, en el loop principal) aplico la reparación dirigida a los issues listados — scope ajustado, sin tocar archivos no relacionados — luego repito verificación visual + gate de Codex. Continúa hasta PASS o un blocker real. Si el mismo blocker se repite 3 veces, dilo claro y preserva el mejor estado verificado; no finjas PASS. (Para reparación independiente, opcionalmente lanza un subagente `Agent` con ojos frescos.)

## Estándar de entrega

Reporta: qué componentes/tokens centrales se reusaron o promovieron; qué fuentes de diseño se revisaron; qué rutas visuales se verificaron; qué checks pasaron y qué riesgo queda; y el resultado del gate de Codex (PASS). Nunca declares aprobación de diseño solo por taste — requiere alineación de fuente + componente central + verificación visual + Codex PASS.
