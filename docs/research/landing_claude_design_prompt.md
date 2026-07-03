# prompt maestro — landing de Itera para Claude Design

*"Libertad dirigida": fija el sistema (lo que evita el slop) y suelta la expresión (concepto, composición, momento memorable), para que Claude Design proponga un hero que no se te ocurrió. Versión óptima para la meta de "clase mundial / que no se vea hecho con AI / hero espectacular". Pasó review adversarial (PASS).*

---

## El prompt (pegar en Claude Design)

```
Eres director de arte de un estudio cuyo sello es identidad propia, no plantilla. Diseña la landing de itera. El trato es claro: te fijo las reglas duras de craft y de marca —innegociables, son lo que evita que esto se vea hecho con AI— y a cambio te suelto el concepto. No quiero "mi visión ejecutada". Quiero que me sorprendas con una idea que no se me ocurrió, dentro de estas reglas. Piensa con cuidado y ve más allá de lo obvio antes de proponer.

<que_es_itera>
itera es un instrumento de medición B2B para LATAM: un diagnóstico operativo que mide el CRITERIO de un equipo cuando usa IA (no enseña IA). Mide 5 dimensiones —contexto, privacidad, validación, juicio, decisión— y le entrega al manager un reporte por persona + un veredicto por persona: pilotar / entrenar / pausar / escalar. El comprador es Head/VP de Marketing, Growth u Operations en empresas LATAM (México, Colombia, Argentina, Chile) de 50–500 personas. Es escéptico, ocupado y alérgico al hype. La única objeción que importa es "¿esto realmente mide algo o es humo?".
</que_es_itera>

<reglas_duras_INNEGOCIABLES>
Estas no se tocan. Son el sistema. Todo lo demás es tuyo.

1. REPO-FIRST. Antes de diseñar, lee mi codebase y construye mi design system (colores, tipografía, componentes, hairlines, espaciado) desde:
   - lib/simulador/design-tokens.ts
   - app/(app)/simulador.css (incluye la utility `.mono` y el uso de tabular-nums)
   - app/(app)/report/[session_id]/page.tsx (el reporte real del producto)
   Si encuentras en el repo un semáforo de bandas vivo (verde/ámbar/rojo) en el scoring: NO lo heredes. Remapéalo a tints del azul + intensidad de gris. "Alto/medio/bajo" se lee por posición, longitud de barra y peso del label — JAMÁS por color de semáforo.
   Nota: el archivo del reporte es un componente de producción con lógica condicional. Si no puedes inferir el layout final desde ahí, prioriza los tokens y el CSS, y reconstruye el reporte del hero con la estructura visual y datos sintéticos — no con el código exacto.

2. PALETA (úsala como variables, cero hex inline nuevos): acento único #1472FF como señal pura (CTA, links, focus, estado activo), nunca decoración — todo lo demás en gris. CTA primario #0e5fcc (AA sobre blanco). Neutros fríos tipo Apple #fafafa / #f5f5f7 / texto #6e6e73, nunca cálido. Dark: canvas near-black con tinte azul #08090a (no negro puro), texto off-white #f5f5f7 (nunca #fff), elevación por luminancia no por sombra.

3. TIPOGRAFÍA: display = Darker Grotesque con tracking negativo medido (-0.02 a -0.03em). Body = Inter (es la fuente de marca — no la cambies por una "characterful"). Datos = la mono de sistema que ya existe (`.mono`). `font-variant-numeric: tabular-nums lining-nums slashed-zero` en CADA número visible. `text-wrap: balance` en titulares, `pretty` en párrafos. Jerarquía por tamaño/luminancia, no por bold apilado. Espaciado en escala estricta de 8px; márgenes verticales de sección generosos (mínimo ~120px en desktop).

4. EL PRODUCTO REAL ES EL HÉROE. El protagonista visual es el reporte/dashboard de itera con datos sintéticos creíbles, renderizado con el design system real, para que landing y producto se sientan un solo artefacto. Cero stock, cero render 3D, cero ilustración o mascota generada por IA. Los datos sintéticos tienen que PROBAR que el instrumento mide algo real: muestra los 4 veredictos distintos en una misma vista (al menos un pilotar, un entrenar, un pausar, un escalar), scores DISPARES por dimensión y por persona (nunca uniformes ni redondos), nombres LATAM, y al menos una nota de dimensión que se lea como observación real (ej. "usó el dataset sin anonimizar antes de pedir aprobación"), no como puntuación genérica. Un dashboard bonito con scores parejos refuerza la sospecha de humo; la dispersión y la nota concreta son lo que la vence.

5. NADA DE SLOP (estas son trampas concretas que tu default reintroduce): cero semáforo; cero gradiente morado/índigo, mesh gradient, glassmorphism, backdrop-blur, blur pastel, blobs; cero glow detrás del elemento LCP; hairlines a 0.06–0.08 (no ≥0.12); cero `transition: all`, cero ease-in en entradas, cero animar width/height/margin; cero emoji-como-ícono, carrusel de testimonios, logo soup; cero copy con superlativos ("transforma", "revoluciona", "all-in-one") ni hedging ("puede ayudar"). Si quieres atmósfera, máximo un grano SVG estático muy sutil o un radial mono-azul contenido — nunca sobre el LCP.

6. VOZ: minúsculas corporate, español neutro LATAM, honesta, anti-hype, específica. Nombra las 5 dimensiones y los 4 veredictos. Números honestos.

7. PERFORMANCE/A11Y (no negociable): LCP <2.5s móvil; INP <200ms; CLS ~0; el visual protagonista es el LCP, con dimensiones explícitas y sin lazy. Motion solo transform/opacity. `prefers-reduced-motion` como capa (conserva fades, quita movimiento). Contraste AA medido en render real, light y dark. Focus por box-shadow.
</reglas_duras_INNEGOCIABLES>

<tu_libertad>
Esto es TUYO — aquí es donde quiero criterio propio, no un plano que seguir:
- EL CONCEPTO DEL HERO. No te doy composición. La objeción a vencer es "¿de verdad mide algo?". Encuentra el modo más memorable de responderla mostrando, no diciendo. (Para calibrar el NIVEL de craft, no para copiar: Linear, Vercel, Stripe, Ramp, Clerk, Anthropic. Úsalos solo como vara de calidad, nunca como punto de partida visual — y NO caigas en la COMPOSICIÓN canónica de SaaS: headline minimalista con un mockup de UI flotando de telón decorativo. Eso es justo lo que se ve hecho con AI. Ojo: el producto SÍ es el protagonista (regla 4); lo que se prohíbe es usarlo como adorno de fondo en vez de hacerlo el centro vivo de la pantalla.)
- LA COMPOSICIÓN Y EL RITMO. El orden de las secciones, dónde está la densidad y dónde el aire, cómo el scroll cuenta la historia, qué rompe el grid. Tú decides la narrativa de problema → evidencia → acción. Lo único que debe existir (en el orden y ritmo que tú elijas): hero con headline + CTA + la prueba del producto, una vista de las 5 dimensiones, los 4 veredictos, y un CTA de cierre. Cuántas secciones y cómo fluyen es decisión tuya.
- EL MOMENTO MEMORABLE. Un único gesto de motion o de interacción que la gente recuerde — bien orquestado, dentro del presupuesto de performance. Tú lo inventas.
- LA METÁFORA VISUAL del instrumento (medición, evidencia, criterio). Si la metáfora no es el producto mismo, prefiere formas geométricas limpias antes que cualquier otra dirección — pero la elección es tuya.
</tu_libertad>

<lo_que_quiero_primero>
ANTES de construir nada, dame 2–3 CONCEPTOS de hero genuinamente DISTINTOS (no variaciones del mismo). Para cada uno: la idea central en 2–3 frases, cuál es el momento que la gente recuerda, y por qué responde la objeción del escéptico. NO te autocensures justificando cada concepto contra las reglas duras en esta vuelta — propón primero, filtramos juntos después; quiero ver tus ideas audaces, no solo las que ya pasaron tu propio filtro. Recomiéndame una y dime por qué. Después construyo la que elija — y ahí sí, llévala a nivel Awwwards: que no se vea hecho con AI, espectacular por densidad de detalle correcto (hairlines exactos, tabular-nums, microestados, tracking medido) y por UNA gran idea bien ejecutada, no por ruido.
</lo_que_quiero_primero>

<entrega>
El output es dirección visual + prototipo interactivo (HTML/CSS/JS está perfecto). La versión de producción la cierro yo con un handoff a Claude Code sobre mi stack real (Next.js 16 + React 19 + Tailwind + HeroUI + framer-motion), así que no te compliques con framework: enfócate en que el concepto y el craft sean impecables. Cuando construyas el prototipo, el motion sigue la regla dura 7 (solo transform/opacity, `prefers-reduced-motion` como capa). Justifica brevemente tus decisiones grandes de concepto, composición y motion contra las reglas duras.
</entrega>
```

---

## Cómo usarla
- **Te devuelve 2–3 conceptos de hero primero; eliges uno y recién ahí construye.** Ese paso es lo que abre espacio a que te sorprenda con algo que no se te había ocurrido.
- **El sistema sigue blindado:** paleta, tipografía, anti-slop, anti-semáforo, performance y voz son innegociables. Lo único suelto es la *expresión* (concepto, composición, ritmo, momento memorable).
- **Antes de conectar el repo:** mata el semáforo `BANDS` en `lib/simulador/design-tokens.ts` para que la herramienta no lo herede (el prompt se lo prohíbe, pero limpio es no mostrárselo).
