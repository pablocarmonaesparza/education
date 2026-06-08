# Compuertas de medición empírica (nivel componente)

Para trabajo a **nivel de componente** (`components/simulador/apple/*`), no basta con "se ve bien". Se mide el render real en el browser con `browser_evaluate` y se compara contra el token o el umbral. Cada punto es PASS/FAIL **con su número**. (Absorbido de la antigua skill `componente-hig`.)

## La vara — 11 puntos medibles

1. **Tokens, no valores sueltos.** Todo color, radius y espaciado referencia un `var(--token)` de `app/(app)/simulador.css`. Cero hex crudo, cero px mágicos. *(Grep + comparar computed style contra el token.)*
2. **Radius por proporción, no px (DEC-005).** Consistencia de redondeo por ratio, no valor absoluto. Textfields ~0.27 (12/44). Un control chico (checkbox 20px) usa ~6px para igualar el *sentir*, no 12px. Medir `borderRadius / lado` vs ~0.27.
3. **Tipografía dentro de la escala.** Todo `font-size` existe en la escala de `simulador.css` (`ts-*` / `--text-*`). Cero tamaños huérfanos (un 13px donde el sistema usa 14px = FAIL).
4. **Rejilla de espaciado.** Gaps y márgenes en la rejilla 4/8px. Nada de 10px ni 7px sueltos.
5. **Una sola señal primaria.** El acento `#1472ff` se reserva para la acción primaria. Secundario y fine-print van quietos (gris, subrayado, borde). Dos azules compitiendo = FAIL.
6. **Estados completos.** hover, focus-visible (anillo visible), disabled, y selected/checked/active donde aplique. Sin focus-visible = FAIL de accesibilidad.
7. **Contraste AA.** Texto vs fondo ≥ 4.5:1 (cuerpo) o ≥ 3:1 (texto ≥18px). Medir luminancias y calcular ratio.
8. **Paridad dark-mode.** Todos los tokens resuelven en claro y oscuro. Cero color hardcodeado de un solo tema. Medir en `.dark` y claro.
9. **Balance y alineación.** El control se equilibra con su texto (checkbox ≈1.4× alto de letra) y comparte borde con la columna (mismo `left` que inputs y botón). Medir bounding boxes.
10. **A11y mínima.** `aria-label`/rol correcto, hit target adecuado (≥44px), label asociado.
11. **Registrado.** Aparece en `/design/components` con todas sus variantes y estados.

Fuente canónica de la vara: HIG de Apple, `app/(app)/simulador.css` (tokens), y `docs/memory/metodologia_verificar_opiniones_diseno_con_hig.md`. Lee el CSS al inicio de cada corrida — la escala evoluciona.

## Recetas para browser_evaluate

Dev server: `host.docker.internal:3000` (el contenedor no ve localhost). Navega a `/design/components`.

**Radius por proporción (punto 2):**
```js
() => { const el = document.querySelector('SELECTOR'); const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return { lado: Math.round(r.width), radius: cs.borderRadius,
           ratio: +(parseFloat(cs.borderRadius)/r.width).toFixed(2) }; }
// objetivo ratio ~0.27 (medianos). Chicos: que IGUALE ese sentir, no 12px.
```

**Color contra token (puntos 1 y 5):** lee el computed color y compáralo con el token:
`getComputedStyle(document.querySelector('.simulador-root')).getPropertyValue('--accent')`. Color visible que no sea ningún token = FAIL.

**Tipografía en escala (punto 3):** junta todos los `font-size` del componente; cada uno debe existir en la escala leída de simulador.css. Un px fuera = huérfano.

**Contraste AA (punto 7):**
```js
() => { const lum = (c)=>{const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;
    return v<=.03928? v/12.92 : ((v+.055)/1.055)**2.4;}); return .2126*r+.7152*g+.0722*b;};
  const el=document.querySelector('SELECTOR'); const cs=getComputedStyle(el);
  const L1=lum(cs.color)+.05, L2=lum(cs.backgroundColor)+.05;
  return +(Math.max(L1,L2)/Math.min(L1,L2)).toFixed(2); } // ≥4.5 cuerpo, ≥3 grande
```

**Estados:** mide con `:hover`/`:focus-visible` (fuerza `el.focus()` y lee `outline`/`box-shadow`), `[disabled]`, `[checked]`/`[data-selected]`.

**Alineación de columna (punto 9):** compara `left` del control vs `left` del input y del botón de la misma vista — deben coincidir.

## Reglas del loop a nivel componente

- **Corrige la fuente, no el uso.** El fix va en `components/simulador/apple/<X>.tsx`, nunca parchando una pantalla. Si es estructural de HeroUI, se resuelve en el wrapper Apple para todo el sistema.
- **Mide, no opines.** Cada veredicto trae su número. "se ve chico" no es veredicto.
- **Sin commit automático.** Pablo decide cuándo entra a git.
- **Máx 4 vueltas.** Si no converge, NO fuerces PASS: presenta el punto que falla con su medición e hipótesis, para decisión humana. Truncar en silencio (decir "listo" ocultando un FAIL) está prohibido.

## Output del gate a nivel componente

```
COMPONENTE · <Nombre>  ·  PASS ✓  (N vueltas)
────────────────────────────────────────────────
vara          medición            veredicto
radius        6px / 20px = 0.30   ✓ (≈0.27 inputs)
tipografía    14px                ✓ en escala
contraste     7.1:1               ✓ AA
acento        solo botón primario ✓ una señal
estados       hover/focus/disabled ✓
dark-mode     tokens resuelven    ✓
registrado    /design/components   ✓
Reviewer independiente (Codex): PASS
```
