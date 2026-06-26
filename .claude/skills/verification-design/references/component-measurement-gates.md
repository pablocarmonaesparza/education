# Compuertas de medición + gate anti-hardcode

Dos cosas viven aquí: (A) el **gate anti-hardcode** por grep, que corre en TODA superficie (página o componente); (B) las **11 compuertas numéricas** medidas en browser, que aplican a trabajo a nivel de componente (`components/simulador/apple/*`). Las dos: PASS/FAIL **con su número**, nunca a ojo.

---

## A. Gate anti-hardcode (TODA superficie — página incluida)

> La sintaxis `prop-[...]` de Tailwind **no** es hardcode por sí misma. `rounded-[var(--radius-lg)]`, `bg-[var(--surface)]`, `shadow-[var(--shadow-md)]` son el patrón **correcto** del repo (1500+ usos). El gate caza el **VALOR CRUDO** dentro del corchete: un `#hex`, un `Npx`/`Nrem` de tipografía o radius, o un fallback `var(--x,#hex)`. NUNCA conviertas un `prop-[var(--token)]` a otra cosa, ni marques PASS "porque `rounded-[` siempre tiene matches" — estos greps ya excluyen `var()` por construcción y deben dar 0 limpios.

```bash
FILES=$(git diff --name-only --diff-filter=d HEAD | grep -E '\.(tsx|ts|css)$')
rg -n 'text-\[[0-9.]+(px|rem|em)\]' $FILES                                   # 1 font-size crudo → usa ts-*
rg -n '\b(text-(xs|sm|base|lg|xl|[2-9]xl))\b' $FILES                         # 2 tipografía built-in de Tailwind (fuera de la escala Itera)
rg -n '(bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|rounded)-\[[^]]*#[0-9a-fA-F]{3,8}' $FILES  # 3 hex crudo en arbitrary value
rg -n 'var\(--[a-z-]+\s*,\s*#[0-9a-fA-F]' $FILES                             # 4 fallback hex disfrazado: var(--token,#xxx)
rg -n 'rounded-\[[0-9.]+(px|rem)\]' $FILES                                   # 5 radius crudo → usa var(--radius-*)
rg -n 'shadow-\[[^]]*[0-9]+px' $FILES                                        # 6 sombra con offsets crudos → usa var(--shadow-*)
```

Los 6 DEBEN dar **0**. Reporta `anti-hardcode: 0/0/0/0/0/0 ✓`.

**Excepciones legítimas** (el grep puede devolverlas; se ANOTAN, NO se "arreglan" ni se borran):
- `app/opengraph-image.tsx` y cualquier `next/og` / `ImageResponse`: corre fuera del DOM, no lee CSS vars → hex inline obligado.
- Fills exactos de logos de terceros (Google: `#4285F4/#34A853/#FBBC05/#EA4335` en `auth/login`, `auth/signup`): el color de marca es dato del logo, no un token de Itera.
- Deuda viva conocida a **no replicar**: `components/simulador/RuntimeExperienceV2.tsx` usa `var(--token,#fallback)` con hex y mezcla `text-xs/text-sm` con `ts-*`. No copies ese patrón a una página nueva.

Cualquier otra coincidencia = **FAIL real**: corrige antes del gate independiente. Si crees tener una excepción nueva, NO la auto-apruebes — anótala como riesgo para decisión humana.

### Tabla de snapping px → clase `ts-*` (régimen post-migración 2026-06-26)

NUNCA escribas `text-[Npx]`. Si un mock trae px, mapéalo a la clase más cercana:

| px | clase | px | clase |
|----|-------|----|-------|
| 9-10 | `ts-caption-2` | 24-26 | `ts-title-2` |
| 11 | `ts-caption-1` | 27-31 | `ts-title-1` |
| 12 | `ts-footnote` | 32-37 | `ts-display` |
| 13 | `ts-subhead` | 38-47 | `ts-display-lg` |
| 14 | `ts-callout` | 48-54 | `ts-display-xl` |
| 15-16 | `ts-body` | 55-58 | `ts-display-2xl` |
| 17-18 | `ts-headline` | 59-62 | `ts-display-3xl` |
| 19-20 | `ts-body-lg` | 63-72 | `ts-display-4xl` |
| 21 | `ts-body-xl` | 73+ | `ts-display-5xl` |
| 22-23 | `ts-title-3` | | |

Responsive: `sm:/md:/lg:ts-*` (set completo en `simulador.css`). Los `ts-*` mapean a `--text-*`. Spacing macro: `var(--space-section)`/`--space-section-sm`/`--reading-max`; micro-spacing = escala Tailwind. Para un size en prop (no clase), `text-[length:var(--text-*)]` es válido; un número crudo NO. La escala evoluciona — lee `app/(app)/simulador.css` al inicio de cada corrida.

---

## B. La vara a nivel componente — 11 puntos medibles

1. **Tokens, no valores sueltos.** Todo color, radius y espaciado referencia un `var(--token)`. Cero hex crudo, cero px mágicos. *(Gate anti-hardcode + comparar computed style contra el token.)*
2. **Radius por proporción, no px (DEC-005).** Consistencia de redondeo por ratio. Textfields ~0.27 (12/44). Un control chico (checkbox 20px) usa ~6px para igualar el *sentir*. Medir `borderRadius / lado` vs ~0.27.
3. **Tipografía dentro de la escala.** Todo `font-size` resuelve a un `--text-*` (vía clase `ts-*`). Cero tamaños huérfanos; cero built-ins `text-xs/sm/...`. (Snap table arriba.)
4. **Rejilla de espaciado.** Gaps y márgenes en la rejilla 4/8px (o `var(--space-*)` para macro). Nada de 10px ni 7px sueltos.
5. **Una sola señal primaria.** El azul accent se reserva para la acción primaria: **fondo `accent-strong` (#0e5fcc, `DEC-009`)** en botones/badges con texto blanco, y `#1472ff` para links/focus/bordes. Dos azules compitiendo = FAIL.
6. **Estados completos.** hover, focus-visible (anillo visible), disabled, y selected/checked/active donde aplique. Sin focus-visible = FAIL de accesibilidad.
7. **Contraste AA.** Texto vs fondo ≥ 4.5:1 (cuerpo) o ≥ 3:1 (texto ≥18px). Medir luminancias y calcular ratio.
8. **Paridad dark-mode.** Todos los tokens resuelven en claro y oscuro. Cero color hardcodeado de un solo tema (incluye `var(--x,#hex)`). Medir en `.dark` y claro.
9. **Balance y alineación.** El control se equilibra con su texto (checkbox ≈1.4× alto de letra) y comparte borde con la columna (mismo `left` que inputs y botón). Medir bounding boxes.
10. **A11y mínima.** `aria-label`/rol correcto, hit target ≥44px, label asociado.
11. **Registrado y medido.** Aparece **renderizado** en `/design/components` con todas sus variantes/estados — no solo creado. Verifícalo (ver receta de paridad abajo): si no aparece en la ruta, "registrado" = FAIL.

Fuente canónica: HIG de Apple, `app/(app)/simulador.css` (tokens), `docs/memory/metodologia_verificar_opiniones_diseno_con_hig.md`.

---

## Recetas para `preview_eval`

Arranca el server UNA vez: `preview_start` config **"simulator-design"** (de `.claude/launch.json` → `npm run dev:simulador`, autoPort). **No asumas 3000** — `dev:simulador` puede usar 3003 y subir si está ocupado; usa la URL/puerto que `preview_start` devuelve. Mide computed styles con `preview_eval`, render con `preview_screenshot`, árbol accesible con `preview_snapshot`, runtime con `preview_console_logs`. Navega a `/design/components` o a la superficie nueva. *(Fallback legacy si el preview no levanta: `mcp__MCP_DOCKER__browser_*` contra `host.docker.internal`.)*

**Confirma que cargó (antes de medir nada):**
```js
() => ({ ok: !!document.querySelector('main'), title: document.title, path: location.pathname })
// ok !== true → página no cargó: re-navega, NO cuentes como PASS.
```

**Radius por proporción (punto 2):**
```js
() => { const el = document.querySelector('SELECTOR'); const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return { lado: Math.round(r.width), radius: cs.borderRadius,
           ratio: +(parseFloat(cs.borderRadius)/r.width).toFixed(2) }; }  // objetivo ~0.27
```

**Tipografía en escala (punto 3) — recorre el DOM y caza huérfanos:**
```js
() => {
  const root = getComputedStyle(document.querySelector('.simulador-root') || document.documentElement);
  const names = [...new Set(
    [...document.styleSheets].flatMap(s=>{try{return [...s.cssRules]}catch{return[]}})
      .map(r=>r.cssText||'').join(' ').match(/--text-[a-z0-9-]+/g) || [])];
  const allowed = new Set(names.map(n=>root.getPropertyValue(n).trim()).filter(Boolean));
  const huerfanos = new Set();
  document.querySelectorAll('main *').forEach(el=>{
    if (el.textContent.trim()) { const fs = getComputedStyle(el).fontSize; if(!allowed.has(fs)) huerfanos.add(fs); }
  });
  return { escala:[...allowed], huerfanos:[...huerfanos] };  // huerfanos debe ser []
}
// huerfanos !== [] = FAIL: hay un font-size que no es ningún --text-* (px suelto o clase ts-* mal escrita).
```

**Contraste AA (punto 7):**
```js
() => { const lum = (c)=>{const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;
    return v<=.03928? v/12.92 : ((v+.055)/1.055)**2.4;}); return .2126*r+.7152*g+.0722*b;};
  const el=document.querySelector('SELECTOR'); const cs=getComputedStyle(el);
  const L1=lum(cs.color)+.05, L2=lum(cs.backgroundColor)+.05;
  return +(Math.max(L1,L2)/Math.min(L1,L2)).toFixed(2); }  // ≥4.5 cuerpo, ≥3 grande
```

**Estados:** fuerza `el.focus()` y lee `outline`/`box-shadow`; mide `[disabled]`, `[data-selected]`, `:hover`.
**Alineación de columna (punto 9):** compara `left` del control vs `left` del input y botón de la misma vista.
**Paridad dark (punto 8):** `document.documentElement.classList.toggle('dark', true)` → re-mide colores; ninguno debe ser un hex de un solo tema.
**Paridad catálogo↔exports (punto 11):** confirma que `/design/components` renderiza TODOS los exports de `apple/index.ts` (número dinámico, no lo hardcodees). Un export ausente del catálogo = FAIL de registro.

## Reglas del loop

- **Corrige la fuente, no el uso.** El fix va en `components/simulador/apple/<X>.tsx`, nunca parchando una pantalla. Si es estructural de HeroUI, se resuelve en el wrapper Apple para todo el sistema.
- **Mide, no opines.** Cada veredicto trae su número. "se ve chico" no es veredicto.
- **Sin commit automático.** Pablo decide cuándo entra a git.
- **Máx 4 vueltas.** Si no converge, NO fuerces PASS: presenta el punto que falla con su medición e hipótesis. Truncar en silencio (decir "listo" ocultando un FAIL) está prohibido.

## Output del gate

```
SUPERFICIE · <ruta/Componente>  ·  PASS ✓  (N vueltas)
────────────────────────────────────────────────
anti-hardcode  text-px 0 · hex 0 · radius 0 · shadow 0 · tipo-builtin 0   ✓
tipografía     todas en --text-* (0 huérfanos)                            ✓
radius         6px / 20px = 0.30                                          ✓ (≈0.27)
contraste      7.1:1                                                      ✓ AA
acento         solo acción primaria                                       ✓
estados        hover/focus/disabled                                       ✓
dark-mode      tokens resuelven en .dark                                  ✓
registrado     render en /design/components                              ✓
verificación   typecheck 0 · lint 0 · consola 0 · shots desktop/mobile/dark
Reviewer independiente (Codex o Agent): PASS
```
