# dirección de arte — landing de itera (documento maestro)

*Síntesis de research de 8 dimensiones + veredicto adversarial. Aterrizado al repo real, no a supuestos.*

> **Nota de partida (corrección al brief de research):** seis de las ocho dimensiones asumen que "itera ya mató el semáforo". **Es falso.** `lib/simulador/design-tokens.ts` define hoy `band-a` (verde #0a7e3a), `band-m` (ámbar #cc8800) y `band-b` (rojo #c0282b), y `simulador.css` los usa en light y dark. El semáforo está **vivo en el producto**. Esto cambia la prioridad #1: antes de mostrar el reporte en la landing hay que rediseñar el scoring de las 5 dimensiones a una escala monocromática (tints del azul + intensidad de gris). Todo este documento parte de esa realidad, no del supuesto.

---

## 1. Tesis de diseño

La landing de itera debe **ser el instrumento**, no un folleto del instrumento. Es una superficie de medición seria —rigurosa, densa, honesta— donde el héroe es el producto real (reporte por persona, dashboard del manager) con datos sintéticos creíbles, renderizado con el mismo design-system que la app, de modo que landing y producto se sientan **un solo artefacto medido**. El color trabaja como señal quirúrgica (#1472FF en la acción, nunca en decoración), la jerarquía se construye con tipografía y luminancia (no con sombras ni semáforos), y la prueba de seriedad es la **densidad de detalle correcto** —números que cuadran, alineación tabular, microestados pulidos— no los efectos.

Lo que **NO** debe ser: otro SaaS genérico de centro de distribución ("editorial minimalism" limpio pero olvidable), ni un clon dark del look-Linear (gradiente mesh + pill Cmd-K + grano geométrico, que en 2026 ya lee a template), ni una página con un hero gigante de mensaje vacío y cero producto a la vista. Cero stock, cero render/ilustración IA, cero blobs/glassmorphism/gradiente pastel, cero semáforo.

---

## 2. Craft vs slop: el checklist anti-AI

Auditá la landing contra esto **antes** de publicar. Regla de corte: si aparecen **≥3** señales de slop, refactorizar.

### Señales de slop a matar (checklist verificable)
- [ ] **Semáforo verde/ámbar/rojo** en el scoring de las 5 dimensiones o en el veredicto *(prohibido por marca — y hoy vive en `BANDS`)*.
- [ ] Hero centrado-simétrico: eyebrow + H1 de 64–80px + uno o dos CTA y **cero producto visible** *(es el hero actual de `LandingPage.tsx`)*.
- [ ] Glassmorphism (cards frosted con `backdrop-blur`), blur pastel de fondo, blobs orgánicos, gradiente morado-índigo o gradiente-mesh multicolor.
- [ ] Un único `border-radius` repetido en TODO con la misma sombra suave idéntica.
- [ ] Bordes demasiado visibles (rgba ≥0.12) — el craft está en 0.06–0.08.
- [ ] `font-weight: 700` en todos los headings; jerarquía por bold apilado.
- [ ] `line-height: 1.5` universal; tracking del navegador por default en displays grandes.
- [ ] Números proporcionales que "bailan" (sin `tabular-nums`).
- [ ] Tres feature-cards idénticas con ícono arriba + secuencia 1-2-3 + stat-banner + logo soup + FAQ accordion (el combo template).
- [ ] Emoji como íconos; carrusel de testimonios.
- [ ] `transition: all`, `ease-in` en entradas, botones que "saltan" sin easing.
- [ ] Cualquier ilustración isométrica, render 3D, mascota IA o stock de "equipos felices en oficina".
- [ ] Copy con superlativos ("transforma", "revoluciona", "all-in-one") o hedging ("puede ayudar").

### Señales de craft a perseguir
- [ ] **El producto real es el héroe** — mockup denso del reporte/dashboard con las 5 dimensiones nombradas (contexto, privacidad, validación, juicio, decisión) y el veredicto (pilotar/entrenar/pausar/escalar) **en escala azul-neutro, sin semáforo**.
- [ ] `font-variant-numeric: tabular-nums lining-nums slashed-zero` en cada score, fecha, ID y métrica.
- [ ] Tracking negativo medido en display (-0.02 a -0.03em), jerarquía por **tamaño/color**, no por peso.
- [ ] Profundidad por **escalera de superficie + hairlines** (no sombras en el chrome).
- [ ] Un solo acento racionado: 1 CTA primario por banda visual, links, focus ring, estado activo.
- [ ] La regla Verdigris de separación de superficies: **tinte sutil + borde 1px + label** combinados, cada uno casi invisible.
- [ ] Asimetría intencional y sistemática que dirige al comprador escéptico problema → evidencia → acción.
- [ ] Copy específico en la voz de itera: nombra las 5 dimensiones, los 4 veredictos, números honestos.
- [ ] Page-load orquestado con staggered reveals (`animation-delay`), <300ms, ease-out — no micro-interacciones dispersas.

---

## 3. El hero

El hero es una **demostración**, no un eslogan sobre un gradiente. Estructura en 2 columnas (desktop), apilada en móvil con el mockup **debajo** del texto.

### Estructura
- **Columna izquierda (texto):**
  - *Eyebrow* en mono (stack de sistema, ver §4) con un dato concreto del método — no el puntito-y-línea genérico. Ej: `diagnóstico operativo · 5 dimensiones`.
  - *Headline* que aterriza el **dolor** del Head/VP, no la capability. Mal: "diagnóstico de criterio con IA en 5 dimensiones". Bien: el dolor de no saber a quién del equipo dejar pilotar IA y a quién pausar. En Darker Grotesque, `clamp(2.75rem, 2rem + 3.5vw, 5rem)`, `line-height: 1.05`, `letter-spacing: -0.03em`, `text-wrap: balance`.
  - *Subhead* en Inter que aterriza la **prueba**: el mecanismo (mide criterio bajo presión en flujos reales) + el resultado observable (reporte por persona + recomendación accionable).
  - *Dual CTA:* primario `agendar diagnóstico` en `--accent-strong` (#0e5fcc, AA sobre blanco); secundario ghost `ver un reporte de muestra` que ancla al mockup. (Los split-tests muestran que el CTA único pierde en tráfico mixto de intención.)
  - *Prueba honesta:* un número específico en el fold ("N equipos diagnosticados", "M personas medidas"), sin badges ni carrusel.

- **Columna derecha (el protagonista):** mockup real del **reporte por persona** con las 5 dimensiones y el veredicto, datos sintéticos creíbles, **scoring en azul+neutro** (barras/puntos en `--accent` con intensidad variable y gris para el resto; el "alto/medio/bajo" se lee por **posición, longitud de barra y peso del label**, jamás por verde/ámbar/rojo). Es el elemento LCP.

### El visual protagonista — propuestas reales y construibles (sin imagery AI)
1. **Mockup estático de alta fidelidad (default, baseline seguro):** el reporte renderizado con el design-system real, exportado como imagen optimizada o renderizado como HTML estático. Tratarlo como Stripe trata sus mockups: flotando con sombra difusa suave (≤0.05 opacidad), ligeramente solapando la sección de abajo (truco Mintlify).
2. **Panel "vivo" CSS-driven (upgrade de alto impacto, condicionado a performance):** el diagnóstico "corriendo" — estado `midiendo validación…` con un score formándose. Estilo Vercel/Claude Code/NeuralOps, **100% CSS, cero JS pesado**. Solo si no compromete el LCP móvil (<2.5s); si lo compromete, va debajo del fold o se difiere.
3. **Hero interactivo (la jugada de élite, estilo Clerk):** toggle entre las 5 dimensiones o entre los 4 veredictos, y el reporte real cambia. Responde la pregunta del escéptico ("¿esto realmente mide algo?") mostrando, no diciendo.

### Tipografía del hero
Darker Grotesque para el headline (disciplina: solo tamaño + tracking, sin flourish ni itálicas). Inter para subhead. Mono para eyebrow y para cualquier dato numérico visible.

### El primer movimiento
Entrada escalonada: eyebrow → headline (+60ms) → subhead (+140ms) → CTA. Cada uno `opacity 0→1` + `translateY(8–12px)→0`. `ease-out` custom (`cubic-bezier(0.16,1,0.3,1)`, ya en `--motion-ease`), <300ms, **solo transform/opacity**. El CTA primario se renderiza instantáneamente y es focusable antes de que termine la animación. `prefers-reduced-motion` → fade de opacidad sin transform.

### Versión mobile
1 columna, texto arriba + porción nítida del reporte abajo. El mockup es LCP: `fetchpriority="high"`, sin `loading="lazy"`, dimensiones explícitas (CLS=0). **No** cargar el panel-vivo pesado si compromete el LCP móvil; en móvil priorizá headline-dolor + 1 CTA + un fragmento legible del reporte. LCP <2.5s, FCP <1.8s, CLS ~0.

---

## 4. Sistema visual

### Tipografía
Base actual: Darker Grotesque (display) + Inter (body) vía `next/font/google` (que ya self-hostea woff2 en build — **el "migrar a self-host" del research es un no-op**; el gap real es que Darker Grotesque carga 6 pesos 400–900: **auditar y podar** a los 2–3 pesos que se usan de verdad).

Upgrades de alto retorno / bajo riesgo:
- **Tercera capa mono = la mono de sistema que YA existe** (`.mono` en `simulador.css`: `ui-monospace, SF Mono, Menlo…`). Da el tell "engineered/medición" con **cero bytes y cero CLS**. Usarla en eyebrows, IDs de sesión, scores numéricos, version chips, captions de dato. **No** meter Geist Mono / JetBrains como webfont — agrega una tercera familia al budget para retorno marginal; es experimento, no default.
- **Tracking negativo medido** en displays (gratis, alto impacto): -0.02 a -0.03em en `text-display-*`, -0.01em en `text-title-*`. Es lo que mata el tell de "tracking que nunca cambia".
- **`font-variant-numeric: tabular-nums lining-nums slashed-zero`** en todo número del reporte/dashboard (ya parcialmente presente; faltaba el mockup del hero, que es donde el comprador lo ve primero).
- **`text-wrap: balance`** en titulares, **`text-wrap: pretty`** en párrafos. Degradan silenciosamente.
- **opsz de Inter:** *no es flag trivial* — Inter vía `next/font/google` no expone el eje `opsz` como variable sin reconfigurar la carga, e "Inter Display" es un corte óptico estático distinto. Retorno bajo a 1 viewport de distancia. **Priorizar tracking negativo (gratis) sobre opsz.**
- **Serif editorial en el headline (decisión abierta, NO ejecutar a ciegas):** Anthropic —referencia de itera— hace exactamente esto y el dato Edelman da +64% "established"; la audiencia de itera es marketing/ops, no devs, así que es jugada legítima de credibilidad. Pero Darker Grotesque a pesos altos ya da carácter. **Tratar como A/B de 14 días** (Instrument Serif gratis como sonda, antes de licenciar Tiempos/GT Sectra), no como cambio obligado.

Reemplazar cualquier escala uniforme por `clamp()` fluido con **contraste display agresivo** y max-width deliberado (~1024–1080px), no `max-w-7xl`.

### Color, textura, profundidad
La paleta actual es correcta en el alma pero le falta craft de superficie:
- **Disciplina de acento:** auditar dónde aparece hoy `#1472FF` y reducirlo a **señal pura** (1 CTA por sección, links, focus ring, estado activo, tint de los ejes). Todo lo demás en gris. `--accent` ya existe como variable única — mantener la prohibición de hex inline.
- **Temperatura:** itera quiere sentirse instrumento, no editorial. **Quedarse en gris frío/neutro tipo Vercel-Linear**, nunca mezclar cálido. Los neutros actuales (`#fafafa`, `#f5f5f7`, `#6e6e73`) son coherentes. *Sobre OKLCH: itera no lo usa hoy y los grises Apple ya son coherentes; portar la rampa a OKLCH es un nice-to-have de mantenimiento, no un salto de percepción — no priorizar.*
- **Profundidad por border-first:** ya tenés `hairline` a 0.06/0.08 (correcto). Reservar las sombras (`shadow-*`, ya escalonadas bien) para elementos flotantes reales (popover, modal, **el mockup del reporte**), nunca para el chrome base. En dark, elevación por **luminancia** (+5–8% por nivel sobre `surface-2`/`surface-3`), nunca drop-shadow oscuro.
- **Riqueza sin slop:**
  - *Grano feTurbulence a opacidad 0.03–0.06* en el fondo del hero/bandas — **pero como SVG estático / data-URI cacheado**, no renderizado en vivo a tamaño hero (el feTurbulence live es caro en pintado y degrada LCP/INP en móvil de gama baja).
  - *Glow ambiental:* **úsalo con cautela** — el propio research marca el "dark-SaaS glow detrás del headline" como trap en otra dimensión (contradicción interna). Veredicto: un único radial-gradient mono-azul muy contenido (`rgba(20,114,255, ~0.10)`), y **nunca detrás del elemento LCP** (si el H1 es LCP, el glow va en otra capa o se omite).
- **Dithering/duotono azul: descartado.** Suena sofisticado pero es efecto "de portfolio", introduce un shader/canvas que contradice el presupuesto de performance (LCP<1s, solo transform/opacity) y es off-brand para "instrumento honesto". El fondo correcto es superficie limpia + hairlines + (opcional) grano estático.
- **Mesh gradient multicolor: descartado.** Rompe el monocromo y lee genérico. Sustituto = el glow mono-azul contenido.

---

## 5. Layout y composición

- **Grid base:** escala de 8px estricta (8/16/24/32/48/64/96), contenedor ~1024–1080px centrado, columnas modulares atadas a variables que escalan por breakpoint — no 12 columnas abstractas. Mantener la misma posición de grid entre páginas (landing → demo) para que navegar no se sienta layout-shift.
- **Textura blueprint honesta:** patrón de líneas 1px a **opacidad ~6%** (gris o azul muy desaturado) con crosshairs en intersecciones detrás del hero. Refuerza "diagnóstico/medición" sin caer en el grano-geométrico-cliché. Regla: si el grid es lo primero que notás, bajalo. **Sobre claro y muy sutil** (en dark ya es uno de los 5 tells del look-Linear).
- **Whitespace Stripe-style:** tomá el padding que parece suficiente y **doblalo**. 96–160px entre secciones en desktop. El azul como único color que trabaja.
- **Bento legítimo:** las 5 dimensiones son un caso de bento perfecto **si cada celda muestra evidencia real** (un fragmento del reporte, un dato sintético medido), nunca íconos genéricos. Proof (mockup completo) en fila 2–3. Degrada a 2 columnas (visual) / 1 (texto) en móvil. Marcadores de "alto/medio/bajo" por **tamaño/peso/posición**, jamás por color.
- **Ritmo alternado:** hero aireado → bloque denso tipo dashboard (reporte + veredicto) → sección aireada de proceso → bento de dimensiones. **Nunca dos secciones de alto impacto consecutivas.** Máximo 3–5 secciones narrativas (6+ de peso similar = fatiga de comité).
- **Romper el grid** solo en el hero y en la pieza de evidencia destacada; el resto estructurado. El comprador debe encontrar "qué es y por qué creerle" en <5s.
- **Alineación óptica** en chips de dimensión, botones con ícono y marcadores del reporte (círculo +112.84% vs cuadrado; centroide del triángulo en el play).
- **Hub de descubrimiento (estilo Vanta):** como el comprador ya siente el dolor, ofrecer puertas de entrada por dimensión / rol (Marketing/Growth/Ops) / tamaño de equipo, no un embudo narrativo único forzado.
- **Cero blobs / asimetría orgánica** — la evidencia 2026 confirma que no se shippea en B2B serio.

---

## 6. Motion y efectos

Tokens ya definidos en `MOTION` (`--motion-ease` = `cubic-bezier(0.16,1,0.3,1)`, fast 150 / base 250 / page 600). Endurecer así:

### Lo que vale (priorizado)
| Efecto | Cómo | Costo perf |
|---|---|---|
| **Page-load orquestado del hero** | stagger 60–80ms, ease-out, <300ms, solo transform/opacity | Nulo (compositor) |
| **Reveal del reporte al entrar al viewport** | `translateY(8–12px)→0` + `opacity`, stagger 50ms entre filas de las 5 dimensiones | Bajo |
| **Contador odometer en métricas clave** | track CSS de dígitos, `translate` + `transition` offloaded, `tabular-nums`, depth mask sutil, **una vez** (no loop) | Bajo — comunica "medición" literalmente |
| **Micro-feedback en CTA** | `transform: scale(0.97)` en `:active` a ~160ms, `@media (hover:hover)` | Nulo |
| **Hover de acento** | `transition: background-color` específica `#1472FF→#0E5FCC` | Nulo |

### Las trampas (evitar)
- `transition: all` → siempre la propiedad específica (prohibir en lint).
- `ease-in` en UI, botones que saltan, `scale(0)` de entrada (empezar en `scale(0.95)`).
- Animar `width/height/margin/top` → solo `transform`/`opacity`.
- En Framer/Motion, los shorthands `x/y/scale` **no** son hardware-accelerated → usar el string `transform`.
- Parallax decorativo, blobs animados, custom cursors, magnetic buttons, WebGL inmersivo sin función, confetti, cualquier semáforo animado.

### Stack y guardrail
Para lo simple: **scroll-driven CSS nativo** (`animation-timeline: view()` + `animation-range`) envuelto en `@supports` + `@media (prefers-reduced-motion: no-preference)` — off-main-thread, cero JS. Para storytelling pesado del reporte (pin + scrub): GSAP ScrollTrigger, solo si se justifica. Transición landing→demo: View Transitions API con `view-transition-name` compartido en logo/título.

**Guardrail `prefers-reduced-motion`:** es una **capa, no un off-switch**. Mantener fades de opacity/color (ayudan a comprensión), quitar solo el movimiento por transform. Todo a 60fps protegiendo **INP <200ms** y **CLS ~0**.

---

## 7. Cómo mostrar el producto sin mentir

Sin imagery AI ni stock, el activo visual principal se **construye**:

1. **Mockup real del reporte por persona** — las 5 dimensiones nombradas + el veredicto (pilotar/entrenar/pausar/escalar), datos sintéticos creíbles (nombres LATAM, scores), renderizado con el design-system real. **El scoring se rediseña a azul+neutro** (esto es trabajo previo obligatorio: hoy usa `BANDS` semáforo).
2. **Dashboard del manager** — vista agregada del equipo, con números tabulares que no desplazan el layout. Tratado como mockup flotante (sombra ≤0.05, solapando la sección siguiente).
3. **Data-viz del reporte** — el desglose de las 5 dimensiones como **visual ancla**: distribución de criterio, dispersión, barras en intensidad de azul. Es la "firma imposible de fingir" equivalente al GDP-counter de Stripe (ej. criterio agregado medido en N equipos, o contador de diagnósticos corridos), renderizada con `tabular-nums`.
4. **Demo inline interactiva** (estilo Clerk) — toggle entre dimensiones/veredictos que cambia el reporte real. Máximo retorno para el escéptico.
5. **Diagramas geométricos limpios** del flujo de diagnóstico o de las 5 dimensiones cuando se necesite marca visual no-producto. Si hace falta un glifo, la mascota geométrica propia (ya en memoria) antes que cualquier ilustración isométrica.

**Performance del mockup:** imágenes optimizadas o HTML estático, **no iframes del app real** (pesados). El reporte es el LCP: `fetchpriority="high"`, dimensiones explícitas, sin lazy.

---

## 8. Guardrails

### Performance budget
- **LCP** <2.5s móvil (objetivo agresivo <1s, alineado a Vercel 0.6s / Linear 0.8s); el mockup del reporte es el LCP → `fetchpriority="high"`, sin lazy, dimensiones explícitas.
- **INP** <200ms (p75) — solo animar transform/opacity, prohibir `transition: all`.
- **CLS** ~0 — dimensiones explícitas en mockups, `next/font` para fuentes (sin flash), `size-adjust` en fallbacks.
- **FCP** <1.8s. SSR/HTML estático.
- Podar pesos de Darker Grotesque; mono de sistema (cero webfont extra); grano como SVG estático.

### Accesibilidad
- Contraste **medido en el render, no en el token** (el fallo más común es CTA a 2.5:1). `--accent-strong` (#0e5fcc) ya está calibrado AA sobre blanco para texto.
- Focus rings con `box-shadow` (`--accent-ring`), no `outline` que se recorta.
- `prefers-reduced-motion` como capa (fades sí, transform no).
- AA 4.5:1 body / 3:1 headings grandes, en light **y** dark.
- `@media (hover:hover) and (pointer:fine)` para no disparar hovers falsos en tap.

### Mobile-first
- Hero 2-col → 1-col, mockup debajo del texto. Reading order probado a 375px.
- No cargar el panel-vivo pesado si compromete LCP móvil.
- Bento degrada a 2/1 columnas.

### Dark mode
- Canvas casi-negro con tinte (el `surface` dark actual es `#000000` puro → **cambiar a near-black con tinte azul**, ej. `#08090a`, para evitar el "agujero" plano).
- Texto off-white (`#f5f5f7` actual, correcto — nunca `#fff` puro).
- Bordes blancos translúcidos (`hairline` dark 0.08, correcto).
- **Subir luminosidad del azul en dark** para que `#1472FF` no se apague.
- Elevación por luminancia, no sombra.

---

## 9. Referencias anotadas

| Referencia | URL | Qué robar |
|---|---|---|
| **Anthropic** | anthropic.com | Ritmo de bandas claro↔oscuro full-bleed en vez de gradientes; sistema de dos voces (serif "rigor/investigación" + grotesque "herramienta") con el contraste haciendo el trabajo; profundidad por block-color, no sombra. |
| **Linear** | linear.app | Disciplina a nivel token: bordes a 6% no 12%, un solo acento solo en estados interactivos, jerarquía por surface-lift y peso tipográfico. Continuidad total landing↔producto. NO copiar el dark-slate por default. |
| **Vercel / Geist** | vercel.com · vercel.com/geist/typography | Blueprint grid a 5–10% con crosshairs; hairline #ebebeb reemplaza sombras; tracking -0.04/-0.06em en display; "dato vivo" como wow honesto + métricas reales en el fold. |
| **Stripe** | stripe.com | `tnum` en cada celda numérica como ADN financiero; el GDP-counter como firma irrepetible; whitespace ("doblá lo que parece suficiente"); un solo indigo como CTA por banda; bento modular para storytelling. |
| **Ramp** | ramp.com | El ADN más cercano: "restraint como autoridad". CTA pequeño y discreto, un solo peso tipográfico, numerales tabulares right-aligned, "el dato es el héroe". |
| **Claude Code** | claude.com/product/claude-code | El producto EN ACCIÓN con estado de proceso visible (`◓Debugging…`) — el modelo del panel-vivo "midiendo validación…". |
| **Clerk** | clerk.com | Hero interactivo: UI real funcional + toggle entre escenarios. El patrón para "alterná entre las 5 dimensiones / 4 veredictos y mirá cambiar el reporte". |
| **Mintlify** | mintlify.com | Escala tipográfica responsive (72→56→44→36) + mockup que **solapa el borde** entre hero y la sección siguiente; sombras ≤0.05 ("felt more than seen"); geometría cuadrada. |
| **Resend** | resend.com | Jerarquía de tres voces (display / body / mono-datos); glows atmosféricos sutiles en vez de gradientes full-bleed; baja densidad (una idea por viewport). |
| **Vanta** | vanta.com | Homepage como hub de descubrimiento para comprador con alta consciencia de problema — entradas por framework/rol/etapa. |
| **Emil Kowalski** | emilkowal.ski/ui/great-animations · animations.dev | Las tablas exactas de curvas/duraciones como tokens de motion; "frequency decide si animás"; salidas 20% más rápidas que entradas. |
| **Rauno Freiberg** | rauno.me/craft · github.com/raunofreiberg/interfaces | `tabular-nums`, focus por `box-shadow`, no animar scale 0→1, pausar loops off-screen; distribución de novedad (dos secciones de alto impacto nunca consecutivas). |

---

## 10. Priorización

**Lo que mueve la aguja (en orden):**

1. **Rediseñar el scoring de las 5 dimensiones a escala azul+neutro y eliminar el semáforo de `BANDS`.** Es bloqueante: sin esto, el héroe (el reporte) viola la regla dura #1 de marca en pantalla. *Gap #1 del veredicto.*
2. **Reemplazar el hero actual** (centrado-simétrico, cero producto) por el hero de 2 columnas con el **mockup real del reporte como protagonista y LCP**. Es el salto de percepción más grande: convierte "demo genérica" en "instrumento serio", y es lo único que prueba el producto a un escéptico sin stock/IA.
3. **Micro-tipografía del reporte:** `tabular-nums lining-nums slashed-zero` + tracking negativo medido en displays. Barato, alto impacto, convierte "mockup" en "instrumento". Incluir el mockup del hero.
4. **Disciplina de acento + border-first:** auditar `#1472FF` a señal pura; profundidad por hairlines + surface-lift; sombra solo para flotantes; dark `surface` a near-black con tinte.
5. **Motion del page-load + reveal del reporte + odometer en métricas**, con `prefers-reduced-motion` como capa. Endurecer lint contra `transition: all`.
6. **Layout:** whitespace doblado, bento de dimensiones con evidencia real, blueprint grid a 6%, ritmo alternado.

**Nice-to-have (no antes de lo anterior):**
- Panel-vivo / hero interactivo (estilo Clerk) — gran impacto pero condicionado a no romper LCP móvil; iterar después del baseline estático.
- Serif editorial en el headline — **A/B de 14 días**, no decisión.
- Grano feTurbulence estático, glow mono-azul contenido — pulido fino, fácil de meter mal.
- OKLCH, opsz de Inter, webfont mono dedicada — retorno marginal; **no priorizar**.

**Descartado del research (off-brand o contra-presupuesto):** dithering/duotono GPU, mesh gradient multicolor, "migrar fuentes a self-host" (ya lo está vía `next/font`), glow detrás del elemento LCP.

---

### Archivos relevantes (rutas absolutas)
- `/Users/pablocarmona/Desktop/Projects/Itera/Development/Web/lib/simulador/design-tokens.ts` — catálogo de tokens; aquí vive el **semáforo a eliminar** (`BANDS`, líneas 106–116) y el sistema de acento (líneas 95–101).
- `/Users/pablocarmona/Desktop/Projects/Itera/Development/Web/app/(app)/simulador.css` — implementación de tokens en light/dark, utility `.mono`, uso de `tabular-nums`.
- `/Users/pablocarmona/Desktop/Projects/Itera/Development/Web/components/simulador/LandingPage.tsx` — hero actual (centrado-simétrico, sin producto) a reemplazar.
- `/Users/pablocarmona/Desktop/Projects/Itera/Development/Web/app/layout.tsx` — carga de fuentes vía `next/font/google` (ya self-hosteadas; podar pesos de Darker Grotesque).
- `/Users/pablocarmona/Desktop/Projects/Itera/Development/Web/app/(app)/report/[session_id]/page.tsx` — reporte real, fuente del mockup del héroe.