---
name: componente-hig
version: 1.0.0
description: |
  Gate de diseño para componentes del Simulador. Cuando creas o modificas un
  componente de UI (components/simulador/apple/*), corre una auditoría contra el
  HIG de Apple + las reglas de diseño de Itera, MIDE el render real en el browser
  (no a ojo), itera en loop hasta que pasa la vara, lo presenta con evidencia, y
  lo registra en /design/components. Sin preguntas: loop silencioso hasta PASS.
  Invócala con /componente-hig <NombreDelComponente>.
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

# /componente-hig — Gate HIG para componentes del Simulador

Un componente no se da por bueno porque "se ve bien". Se mide contra el HIG de Apple
y contra las reglas de diseño de Itera, en el render real, y se itera hasta que pasa.
Esta skill es ese gate: convierte la regla de memoria
`metodologia_verificar_opiniones_diseno_con_hig.md` en un loop automático.

**Principio rector:** los componentes son centrales (`components/simulador/apple/*`).
Editas el archivo, cambia en todo el sitio. Esta skill protege esa fuente: ningún
componente entra (o se modifica) sin pasar la vara, y todo componente que pasa queda
registrado en `/design/components` para que sea editable desde un solo lugar.

## Cuándo se invoca

- Acabas de **crear** un componente nuevo en `components/simulador/apple/`.
- **Modificaste** un componente existente (tamaño, radius, color, estados).
- Pablo te da una opinión de diseño y la aterrizas en un cambio de componente.

Siempre que toques la fuente de un componente, esta skill cierra el ciclo.

## La vara (las metas de diseño que pusimos)

Cada punto es una compuerta PASS/FAIL **medible**. No se opina: se mide en el browser
con `browser_evaluate` y se compara contra el token o el umbral.

1. **Tokens, no valores sueltos.** Todo color, radius y espaciado referencia un
   `var(--token)` de `app/(app)/simulador.css`. Cero hex crudo, cero px mágicos que
   debieran ser token. *(Grep del archivo + comparar computed style contra el valor
   del token.)*
2. **Radius por proporción, no por píxeles (DEC-005).** La consistencia de redondeo es
   por ratio, no por valor absoluto. Los textfields van a ratio ~0.27 (12px / 44px).
   Un control chico (checkbox 20px) usa ~6px para igualar el *sentir*, NO 12px (que lo
   haría radio button). Medir `borderRadius / lado` y comparar contra ~0.27.
3. **Tipografía dentro de la escala.** Todo `font-size` existe en la escala de
   `simulador.css` (los `ts-*` / `--text-*`). Cero tamaños huérfanos (ej. un 13px donde
   el sistema usa 14px). Leer la escala canónica del CSS; cualquier px fuera de ella
   es FAIL.
4. **Rejilla de espaciado.** Gaps y márgenes caen en la rejilla de 4/8px. Nada de 10px
   ni 7px sueltos.
5. **Una sola señal primaria.** El acento `#1472ff` se reserva para la acción primaria
   de la pantalla. Secundario y fine-print (links legales, ayudas) van quietos (gris,
   subrayado, borde) para no competir con el botón. Dos azules compitiendo = FAIL.
6. **Estados completos.** hover, focus-visible (anillo visible), disabled, y
   selected/checked/active donde aplique. Cada estado definido y distinguible. Un
   componente sin focus-visible es FAIL de accesibilidad.
7. **Contraste AA.** Texto contra su fondo ≥ 4.5:1 (cuerpo) o ≥ 3:1 (texto grande /
   ≥18px). Medir luminancias y calcular el ratio.
8. **Paridad dark-mode.** Todos los tokens resuelven en claro y oscuro. Cero color
   hardcodeado que solo sirva en un tema. Medir en `.dark` y en claro.
9. **Balance y alineación.** El control se equilibra con su texto (ej. checkbox ≈1.4×
   el alto de la letra) y comparte borde con la columna (mismos `left` que inputs y
   botón). Medir bounding boxes.
10. **A11y mínima.** `aria-label`/rol correcto, hit target adecuado, label asociado.
11. **Registrado.** Aparece en `/design/components` con todas sus variantes y estados.

La fuente canónica de la vara son: el HIG de Apple, `app/(app)/simulador.css` (tokens),
y `docs/memory/metodologia_verificar_opiniones_diseno_con_hig.md`. Lee el CSS al inicio
de cada corrida — la escala y los tokens evolucionan.

## El loop (estilo ralph-wiggum: sin preguntas, iterar hasta PASS)

```
1. ENCUADRE
   - Lee simulador.css (tokens + escala vigentes) y el archivo del componente.
   - Asegura que el componente tenga (o crea) una entrada en /design/components
     que muestre TODAS sus variantes y estados. Sin entrada no hay qué medir.
   - Identifica el tipo de control para saber qué puntos de la vara aplican.

2. MEDIR (empírico, en el browser — nunca a ojo)
   - Dev server en host.docker.internal:3000 (el contenedor no ve localhost).
   - browser_navigate a /design/components.
   - browser_evaluate para extraer: tamaños, ratio de radius, colores vs token,
     font-sizes vs escala, gaps, alineación (left de la columna), contraste,
     y los estados (hover/focus/disabled/checked).
   - browser_resize + tema oscuro para paridad dark.
   - Screenshot de referencia.

3. AUDITAR
   - Para cada punto aplicable de la vara: PASS/FAIL con el NÚMERO medido y el
     umbral. "radius ratio 0.38 vs objetivo 0.27 → FAIL", no "se ve redondo".

4. REVISIÓN INDEPENDIENTE (ojos frescos)
   - Codex CLI sobre el diff del componente + las mediciones:
       codex exec "Revisa este componente contra el HIG y estas mediciones.
       PASS o FAIL con violación específica."
   - Si Codex no está, fallback: Agent (subagente adversarial) que intenta
     REPROBARLO con el screenshot + las mediciones + la vara.

5. EVALUAR
   - PASS  → paso 6.
   - FAIL  → corrige el ARCHIVO CENTRAL del componente (no el uso suelto),
             re-mide (paso 2), repite. Máx 4 vueltas; si no converge, presenta
             el diagnóstico legible de qué punto falla y por qué (fail-safe).

6. PRESENTAR + REGISTRAR
   - Tabla antes→después con mediciones.
   - Cada cambio aterrizado en su principio HIG (por qué el instinto era correcto).
   - Confirma que /design/components quedó actualizado con todas las variantes.
   - NO commitear: Pablo decide cuándo entra a git.
```

## Cómo medir (recetas para browser_evaluate)

**Radius por proporción** (punto 2):
```js
() => { const el = document.querySelector('SELECTOR'); const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return { lado: Math.round(r.width), radius: cs.borderRadius,
           ratio: +(parseFloat(cs.borderRadius)/r.width).toFixed(2) }; }
// objetivo ratio ~0.27 (controles medianos). Chicos: que IGUALE ese sentir, no 12px.
```

**Color contra token** (punto 1 y 5): leer el computed color y compararlo con el valor
del token (`getComputedStyle(document.querySelector('.simulador-root')).getPropertyValue('--accent')`).
Si un color visible no es ningún token → FAIL.

**Tipografía en escala** (punto 3): juntar todos los `font-size` del componente y
verificar que cada uno exista en la escala leída de simulador.css. Un px fuera = huérfano.

**Contraste AA** (punto 7):
```js
() => { const lum = (c)=>{const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;
    return v<=.03928? v/12.92 : ((v+.055)/1.055)**2.4;}); return .2126*r+.7152*g+.0722*b;};
  const el=document.querySelector('SELECTOR'); const cs=getComputedStyle(el);
  const L1=lum(cs.color)+.05, L2=lum(cs.backgroundColor)+.05;
  return +(Math.max(L1,L2)/Math.min(L1,L2)).toFixed(2); } // ≥4.5 cuerpo, ≥3 grande
```

**Estados**: medir el componente con `:hover`/`:focus-visible` (forzar focus con
`el.focus()` y leer `outline`/`box-shadow`), `[disabled]`, y `[checked]`/`[data-selected]`.

**Alineación de columna** (punto 9): comparar `left` del control contra el `left` del
input y del botón de la misma vista — deben coincidir.

## Reviewer independiente (paso 4)

Prompt para Codex / subagente adversarial:
```
Eres un crítico de diseño Apple-HIG. Te doy el código de un componente, un screenshot
y mediciones (radius ratio, colores vs token, font-sizes vs escala, contraste, gaps,
estados). Tu trabajo es REPROBARLO: encuentra cualquier violación del HIG o de estas
reglas Itera [pega la vara]. Para cada hallazgo: el punto violado + la medición que lo
prueba + el fix concreto. Si no encuentras violaciones reales, di PASS. Default a FAIL
si dudas.
```

## Criterios de PASS

Un componente pasa cuando, simultáneamente:
1. Los 11 puntos aplicables de la vara dan PASS con su medición.
2. El reviewer independiente confirma PASS (o sus FAIL ya se corrigieron y re-midieron).
3. Está en `/design/components` con todas sus variantes y estados, y se ve correcto en
   claro y oscuro.

Si tras 4 vueltas no converge, NO se fuerza el PASS: se presenta el punto que falla con
su medición y la hipótesis de por qué, para decisión humana. Truncar en silencio
(decir "listo" ocultando un FAIL) está prohibido.

## Reglas

- **Sin preguntas durante el loop.** Decide y corrige. Solo regresas al final (PASS) o
  ante un bloqueo real (no converge / dev server caído).
- **Corrige la fuente, no el uso.** El fix va en `components/simulador/apple/<X>.tsx`,
  nunca parchando una pantalla. Si el problema es estructural de HeroUI, se resuelve en
  el wrapper Apple para todo el sistema.
- **Mide, no opines.** Cada veredicto trae su número. "se ve chico" no es un veredicto.
- **Sin commit automático.** Pablo decide cuándo entra a git.
- **No silencies caps.** Si dejas algo sin verificar (un estado, dark-mode, un tamaño de
  viewport), dilo explícito.

## Output del orquestador

```
COMPONENTE-HIG · <Nombre>  ·  PASS ✓  (N vueltas)
────────────────────────────────────────────────
vara          medición            veredicto
radius        6px / 20px = 0.30   ✓ (≈0.27 inputs)
tipografía    14px                ✓ en escala
contraste     7.1:1               ✓ AA
acento        solo botón primario ✓ una señal
estados       hover/focus/disabled ✓
dark-mode     tokens resuelven    ✓
registrado    /design/components   ✓
Reviewer independiente: PASS
```
