---
name: verification-design
version: 1.2.0
description: |
  Gate de diseño para cualquier UI / visual / componente / PÁGINA / pulido de frontend de Itera.
  Caso principal: creas una página nueva → la invocas → te obliga a componer desde componentes YA
  existentes (components/simulador/apple/*, espejados en /design/components) y a usar tokens (clases
  ts-*, var(--…)) SIN hardcode. Antes de entregar: lee la doctrina, reusa o PROMUEVE al design system
  (fuente única — todo apunta a /design + /design/components para que un cambio propague), corre el
  GATE DURO anti-hardcode (greps = 0), verifica el render real en browser (mide, no a ojo), el HIG
  review, y cierra con Codex (o un Agent revisor si Codex está caído) en loop hasta PASS. A nivel
  componente aplica además las compuertas numéricas medidas.
  Úsala cuando Pablo pida UI, diseño visual, componente, página o frontend.
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
  - mcp__Claude_Preview__preview_start
  - mcp__Claude_Preview__preview_eval
  - mcp__Claude_Preview__preview_screenshot
  - mcp__Claude_Preview__preview_snapshot
  - mcp__Claude_Preview__preview_console_logs
  - mcp__Claude_Preview__preview_resize
  - mcp__Claude_Preview__preview_click
  - mcp__Claude_Preview__preview_stop
  - mcp__MCP_DOCKER__browser_navigate
  - mcp__MCP_DOCKER__browser_evaluate
  - mcp__MCP_DOCKER__browser_take_screenshot
---

# /verification-design — gate HIG + design system + loop Codex

No basta con "se ve bien". El objetivo es que **cada objeto apunte de vuelta al design system de Itera** — componentes desde `components/simulador/apple/*` (espejados en `/design/components`) y valores desde tokens (editables en `/design`) — para que un cambio futuro en el sistema propague a todo. Yo construyo, verifico contra la doctrina, **mido** el render, corro el gate anti-hardcode, y un revisor independiente cierra.

**Regla de oro: cero hardcode, cero duplicación.** Tipografía = clases `ts-*`. Color/radio/sombra/motion = `var(--…)`. Spacing macro = `var(--space-*)`. Componentes = exports de `apple/index.ts`. Si algo reusable no existe, se **PROMUEVE** al sistema; no se inventa local.

## Fuentes requeridas (leer ANTES de tocar UI)

Carga primero el mapa `references/itera-design-source-map.md`, luego abre solo las secciones relevantes de:

- `docs/simulador/front/APPLE_HIG_RULES_FOR_ITERA.md` — autoridad de diseño top (lee §19 «Decisiones Itera» `DEC-*`)
- `docs/simulador/front/HIG_SURFACE_REVIEW_FORM.md` — formulario de review (P00–P15)
- `docs/simulador/front/PRODUCT_VISION_ONE_PAGER.md` — feeling premium/serio/B2B
- `docs/simulador/front/FRONT_CONTRACT.md` — contrato de rutas/roles · `docs/simulador/front/SHELL_SPEC.md` + `docs/simulador/front/copy/` al construir una página
- `docs/memory/metodologia_design_system_fuente_unica.md` · `docs/memory/metodologia_verificar_opiniones_diseno_con_hig.md`
- **El inventario vivo:** `components/simulador/apple/index.ts` (TODOS los exports — son ~42 y crecen; léelo, no lo recites de memoria), `app/design/components/page.tsx`, `lib/simulador/design-tokens.ts`, `app/(app)/simulador.css`

## Workflow

1. **Define la superficie.** Ruta, página, componente, estado, viewport, rol. Revisa `FRONT_CONTRACT.md` antes de exponer rutas. No revivas superficies legacy de curso/LMS.

2. **Carga el contrato de diseño.** Orden de `APPLE_HIG_RULES_FOR_ITERA.md`: HIG + accesibilidad → contrato de producto → decisiones de Pablo → productos de referencia → taste del agente. Si una regla escrita choca con un patrón central establecido, NO elijas en silencio: preserva el patrón central localmente y marca el conflicto.

3. **Si Pablo dio una opinión de diseño**, aterrízala primero en el principio HIG que aplica y **mídelo empíricamente** (computed styles, posición vs centro del viewport, contraste, radios reales) — no a ojo. Luego aplica al nivel correcto (token / componente compartido / global / pantalla).

4. **Inventario antes de crear (gate de reuso).** ANTES de escribir un solo JSX: `cat components/simulador/apple/index.ts`. Para CADA región de la superficie (header · estado vacío · error · lista · tabla · KPI · chip · badge · tabs · modal · banner/toast · input/select/textarea · botón · link de acción) **nombra el export apple que la cubre**, o declara por qué ninguno aplica. Recordatorios: vacío = `AppleEmptyState`, error = `AppleErrorState`, métrica = `AppleKpiCard`, tabla = `AppleDataTable`, lista ordenable = `AppleSortableList`, mensaje = `AppleMessageCard`, timeline = `AppleTimeline`, adjunto = `AppleAttachmentCard`, **link/acción de texto sin chrome = `AppleButton size="inline"`** (no un `<a>` estilizado). Región sin export nombrado = no se construye hasta resolver.
   - **Test de los 3 nudos** antes de crear cualquier control: (1) ¿ya existe un export que lo cubre (aunque con otro nombre)? → consúmelo, reimplementar = FAIL. (2) ¿es composición de primitivos (botón+ícono+texto)? → compón inline, NO crees archivo. (3) ¿control nuevo, reusable, con estados propios? → es promovible (paso 5). "Era más rápido custom" no es un nudo.

5. **Promueve UI reusable al sistema.** Si el objeto es reusable: créalo en `components/simulador/apple/`, expórtalo en `index.ts`, **regístralo en `app/design/components/page.tsx`** (bloque `<Section name purpose importName>` con un demo que muestre TODAS las variantes/estados, no un placeholder), y haz que el origen lo CONSUMA. Para eliminar una copia local sin romper imports: conviértela en **re-export shim** (`export { AppleX as NombreViejo } from "@/components/simulador/apple"`, como `_shared/SortableList.tsx`), luego `rg "NombreViejo" app/` y confirma que todos resuelven a la fuente única. Cuerpo duplicado sobreviviendo = FAIL.

6. **Tokens, sin hardcode (regla ejecutable).** Tipografía = clases `ts-*` (mapean a `--text-*`); para elegir el token usa la **tabla de snapping** de `references/component-measurement-gates.md` — NUNCA `text-[Npx]` ni las built-ins `text-xs/text-sm/text-base/…` de Tailwind. Color/radio/sombra/motion = `var(--…)`. Spacing macro = `var(--space-section)`/`--space-section-sm`/`--reading-max`; micro-spacing = escala Tailwind. **`prop-[var(--token)]` es el patrón correcto del repo (1500+ usos) — NO lo conviertas; el hardcode es el VALOR CRUDO dentro del corchete** (un `#hex`, un `Npx`, o un fallback `var(--x,#hex)`).

7. **Construye.** Premium, serio, enfocado, B2B. Evita LMS, dashboards SaaS genéricos, gradientes decorativos, course cards, certificados, copy hype, y exponer scoring interno antes de que el participante responda.

8. **Verifica visualmente — mide, no a ojo.** Levanta el preview con `preview_start` config **"simulator-design"** (`.claude/launch.json` → `npm run dev:simulador`, autoPort — **no asumas 3000**; usa el puerto que devuelve `preview_start`). Confirma que cargó (`preview_eval` → `!!document.querySelector('main')`). Mide con `preview_eval` (computed styles), `preview_screenshot`, `preview_snapshot`, `preview_console_logs`. Inspecciona la superficie cambiada **y** `/design/components`. Si `preview_eval` devuelve `null/undefined`, es selector roto o página sin cargar → FAIL de verificación, no PASS. (Fallback legacy si el preview no levanta: `mcp__MCP_DOCKER__browser_*` contra `host.docker.internal`.)
   - **A nivel componente** (`components/simulador/apple/*`): aplica las **11 compuertas de medición** de `references/component-measurement-gates.md` (radius por ratio, contraste con fórmula, font en escala, grid 4/8, una sola señal primaria, estados completos, paridad dark, alineación, registro). Cada veredicto trae su número. Corrige la **fuente central** del componente, no el uso suelto. Máx 4 vueltas; si no converge, presenta el punto que falla con su medición — nunca fuerces PASS.

9. **Gate duro anti-hardcode (corre SIEMPRE — páginas incluidas).** Sobre los archivos tocados, estos greps DEBEN dar 0. Ver el bloque canónico + excepciones en `references/component-measurement-gates.md` § «Gate anti-hardcode». Resumen:
   ```bash
   FILES=$(git diff --name-only --diff-filter=d HEAD | grep -E '\.(tsx|ts|css)$')
   rg -n 'text-\[[0-9.]+(px|rem|em)\]' $FILES                                   # font-size crudo
   rg -n '\b(text-(xs|sm|base|lg|xl|[2-9]xl))\b' $FILES                         # tipografía built-in fuera de ts-*
   rg -n '(bg|text|border|ring|fill|stroke|from|via|to|shadow|rounded)-\[[^]]*#[0-9a-fA-F]{3,8}' $FILES  # hex en arbitrary value
   rg -n 'var\(--[a-z-]+\s*,\s*#[0-9a-fA-F]' $FILES                             # fallback hex disfrazado en var()
   rg -n 'rounded-\[[0-9.]+(px|rem)\]' $FILES                                   # radius crudo
   ```
   Excepciones legítimas (se ANOTAN, NO se "arreglan"): `app/opengraph-image.tsx` y cualquier `next/og`/`ImageResponse` (no lee CSS vars); fills exactos de logos de terceros (Google: `#4285F4/#34A853/#FBBC05/#EA4335`). Cualquier otra coincidencia = FAIL.

10. **HIG review.** Aplica `HIG_SURFACE_REVIEW_FORM.md` (P00 técnico + P01–P15). Issue sin resolver de accesibilidad, token, duplicación, contrato de ruta, rúbrica oculta o visual severo = FAIL.

11. **Gate independiente (Codex, o Agent si Codex está caído).** Revisa el diff con Codex como revisor independiente, pasándole el inventario:
    ```bash
    codex exec "Review este diff de UI de Itera contra HIG + design-system single-source. Aquí los exports válidos: $(rg '^export' components/simulador/apple/index.ts). Para CADA control del diff nombra el export apple que lo cubre; FAIL cualquier <button>/<input>/<select>/<div role>/card/empty/error/table/kpi a mano que ya tenga primitivo. FAIL si un componente reusable nuevo no está registrado en app/design/components/page.tsx, o si hay hex/px crudos. PASS o FAIL con issues bloqueantes específicos."
    ```
    **Si `codex exec` falla por auth caído** (gotcha recurrente del Codex CLI), NO te saltes el gate: lanza un subagente `Agent` revisor con ojos frescos y el MISMO prompt + inventario. Regla dura: o Codex PASS o Agent-revisor PASS — auto-declararse PASS sin revisor externo está **prohibido**. No entregues mientras quede un MUST.

12. **Repara y reintenta (loop).** Si el gate devuelve FAIL: aplico la reparación dirigida a los issues — scope ajustado, sin tocar archivos no relacionados — luego repito verificación + gate. Continúa hasta PASS o un blocker real. Si el mismo blocker se repite 3 veces, dilo claro y preserva el mejor estado verificado; no finjas PASS.

13. **Cierre de verificación — los 4 deben pasar, sin excepción.** Pega la salida real; sin esto no hay PASS:
    ```bash
    npm run typecheck:simulador     # 0 errores de tipos en scope
    npm run lint:simulador          # 0 errores de lint en scope
    # + los 5 greps del paso 9 = 0 (salvo excepciones registradas)
    ```
    Más: `preview_console_logs` de la superficie = **0 errores/warnings** de runtime; `preview_screenshot` en **desktop, mobile y dark** (`document.documentElement.classList.toggle('dark', true)` antes del screenshot). Cualquier gate en rojo = FAIL, no se entrega.

## Para una PÁGINA nueva (caso principal)

1. Ruta/rol → verifica `FRONT_CONTRACT.md` (no expongas ruta sin actualizar el contrato). Carga `SHELL_SPEC.md` + el `copy/` de esa surface.
2. **Compón SOLO con exports de `apple/index.ts`** (paso 4). Cero `<button>`/`<input>`/`<div className=card>` crudos. Si falta algo reusable, promuévelo (paso 5) y haz que la página lo consuma.
3. **Tipografía SOLO clases `ts-*`** (paso 6 + tabla de snapping). Spacing macro `var(--space-*)`.
4. **Mide el render real** (paso 8): `preview_eval` confirma que `getComputedStyle(fontSize)` de los textos clave cae en un `--text-*` real (no a ojo); `preview_screenshot` desktop+mobile+dark; `preview_console_logs` = 0.
5. **Cierra** con el gate anti-hardcode (paso 9) + el cierre de verificación (paso 13) + el gate independiente (paso 11).

## Estándar de entrega

Reporta: qué exports apple se reusaron o promovieron (nombrados) + qué tokens; qué fuentes de diseño se revisaron; qué rutas visuales se midieron (con números: contraste, font-size resuelto, radios); el resultado del gate independiente (PASS); y **SIEMPRE** la línea anti-hardcode con sus conteos:

```
anti-hardcode   text-px 0 · hex 0 · radius 0 · shadow 0 · tipo-builtin 0   ✓
verificación    typecheck 0 · lint 0 · consola 0 · screenshots desktop/mobile/dark
gate indep.     Codex (o Agent revisor): PASS
```

Sin esa evidencia no hay PASS de diseño. Nunca declares aprobación solo por taste — requiere alineación de fuente + componente central + medición de render + gate independiente.
