# Duolingo — investigación del sistema de diseño y UX/UI

> **Qué es esto.** Documento de referencia, no de implementación. Reconstruye con el mayor detalle posible cómo está construido el diseño de Duolingo: tipografía, color, botones, profundidad, motion, gamificación y proceso. Sirve para entender su *craft* y decidir después qué (poco y selectivo) es adaptable a Itera. **No es una orden de "copiar Duolingo".** La sección de implicaciones para Itera va al final y es deliberadamente corta.
>
> **Leyenda de confianza**
> - ✅ **Verificado** — fuente oficial/primaria de Duolingo (design.duolingo.com, blog.duolingo.com, whitepaper, charlas del equipo) o prensa/proveedor de primera mano (Monotype, Rive, The Verge, Apple).
> - 🟡 **Inferido** — reverse-engineering de terceros (teardowns CSS, design-system refs). Consistente entre varias fuentes, pero Duolingo no lo publica oficialmente. Trátalo como aproximación, no como verdad de fábrica.
>
> Investigación: 2026-06-25 · vía búsqueda web (Exa). Fuentes completas al final.

---

## 0. Tesis de diseño en una frase

> "El secreto de Duolingo es que no somos una empresa de educación. Somos una empresa de diversión y motivación. La diversión es la parte más importante de lo que hacemos." — Ryan Sims, VP de Diseño ✅ (Apple Developer, *Behind the Design*, 2023)

Todo el sistema visual existe para **bajar la fricción emocional de una tarea aburrida** (estudiar) y convertirla en algo que se siente como un juego. Las decisiones de craft —el botón que se hunde, el color voltaje, la tipografía con forma de búho— no son decorativas: son el mecanismo. La frase interna que mejor lo resume es **"un libro infantil que creció"** ("a children's book that grew up"): estética de juguete ejecutada con rigor de producto maduro.

---

## 1. Tipografía

### 1.1 Las dos familias

| Rol | Familia | Origen | Uso ✅ |
|---|---|---|---|
| Display / títulos / impacto | **Feather Bold** | Tipografía a medida (bespoke), exclusiva de Duolingo | Titulares breves, momentos de personalidad, el logotipo |
| Cuerpo / UI / texto largo | **DIN Next Rounded** | Tipografía comercial (Monotype) | Subtítulos, párrafos, cualquier texto > 10 palabras |
| Sustituto cuando no hay marca | **Nunito** (Google Fonts, gratis) | Open source | Docs, Slides, fallback web |

✅ **Feather Bold es a medida y nació del propio búho.** La identidad la creó la consultora londinense **Johnson Banks** (2019); la tipografía la dibujó **Krista Radoeva en Fontsmith**, afinada con **Monotype**. El concepto: tomar la forma del ala emplumada de Duo y meterla en cada letra. Detalle citado: la **"g" lleva un *flick* que imita las cejas de Duo**. Hubo debate sobre si hacían falta mayúsculas; las "serif-wings" en caja alta rompían la unidad del alfabeto, así que optaron por mayúsculas simplificadas que "sirven y dejan brillar a la minúscula" (pensando además en idiomas como el alemán, intensivo en mayúsculas).

### 1.2 Reglas oficiales de uso ✅ (design.duolingo.com/identity/typography)

**Feather Bold:**
- Solo para titulares **breves** (≤ 10 palabras). Más largo que eso → usar DIN.
- **Siempre en minúsculas, nunca en caja alta.** Mayúsculas solo para nombres propios.
- Alineación **siempre a la izquierda**; nunca justificado.
- *Leading* (interlínea) **100–110%**. Por encima de 80px se puede reducir el leading conforme crece el cuerpo.
- Nunca en colores secundarios múltiples; color neutro (Eel) salvo impresión a un color.
- "Duolingo" se escribe en minúscula; teclear `~` en Feather Bold dispara el logotipo completo como glifo.

**DIN Next Rounded:**
- Titulares de > 10 palabras, subtítulos y **todo el cuerpo**.
- *Leading* **140%**.
- Cuando convive con el logotipo, va en peso **light** y a 1.5× la altura-x del logo (máx 2×).

**Combinándolas:** Feather ~150% más grande que DIN; DIN nunca se ve más grande que Feather cuando van juntas; no mezclar ambas en la misma frase.

### 1.3 Jerarquía de tamaños 🟡 (reconstruida de teardowns — *no* es tabla oficial)

> Esta escala viene de design-system refs de terceros (oh-my-design, shadcn.io). Úsala como aproximación del *ritmo*, no como spec de fábrica.

| Rol | Familia | Tamaño | Peso | Line-height | Tracking | Uso |
|---|---|---|---|---|---|---|
| Display hero | Feather Bold | 40px (web mkt: hasta 64px) | 700 | 1.2 | −0.5px | Hero de landing, celebraciones grandes |
| Display | Feather Bold | 32px | 700 | 1.25 | −0.25px | Headers de sección, lección completa |
| Heading L | Feather Bold | 24px | 700 | 1.33 | normal | Títulos de pantalla, headers de modal |
| Heading | Feather Bold | 20px | 700 | 1.4 | normal | Títulos de card |
| Subtítulo | Feather Bold | 17px | 700 | 1.4 | normal | Headers de lista, prompts |
| **Label de botón** | (ver nota) | 15px | 700 | 1.2 | **0.8px** | CTAs |
| Body L | DIN Next Rounded | 17px | 400 | 1.5 | normal | Frases de lección |
| Body | DIN Next Rounded | 15px | 400 | 1.5 | normal | Texto estándar |
| Caption | DIN Next Rounded | 13px | 400 | 1.4 | normal | Metadata, hints |
| Stat / número | Feather Bold | 24px+ | 700 | tight | normal | XP, racha, % |

**⚠️ Conflicto a resolver — mayúsculas en botones.** La guía oficial dice *Feather Bold nunca en caja alta*. Pero los labels de botón **sí** se ven en MAYÚSCULAS ("CONTINUE", "CHECK"). La explicación más probable (teardown shadcn.io): **los labels de botón en la app van en DIN Round 15/700 con tracking 0.8px**, no en Feather. Es decir, la regla "no all-caps" aplica a Feather; las CTAs en caja alta son DIN. Dato 🟡, pero reconcilia ambas observaciones.

### 1.4 Principios tipográficos

- **Feather para personalidad, DIN para leer.** Contraste deliberado: display gordo y caricaturesco vs. cuerpo modesto. Ese contraste *es* el ritmo de la marca.
- **Nada de pesos finos.** El sistema vive entre 400 (body) y 700 (todo lo demás). La sobriedad viene del **tamaño**, no de variar el peso. "Este sistema no susurra."
- **Los números se celebran.** XP, rachas y porcentajes se renderizan en Feather Bold grande: las stats de gamificación son tipografía de display, no texto.
- **El sitio de marketing usa un *navy* de display** (`#042C60`) para titulares, distinto del tinte de texto de la app (Eel `#4B4B4B`). 🟡

---

## 2. Paleta de color

✅ **Todos los HEX de esta sección salen de la guía de marca oficial** (design.duolingo.com/identity/color), con RGB/CMYK/PMS publicados. Los **nombres de animal** y los **roles semánticos finos** se corroboran con teardowns (🟡 donde lo indico). Convención: **todos los colores se nombran con animales/partes de Duo** — taxonomía deliberada que refleja el mundo del búho.

### 2.1 Core (los 4 que define la marca) ✅

| Nombre | HEX | RGB | Rol |
|---|---|---|---|
| **Feather Green** | `#58CC02` | 88 204 2 | Color núcleo de la marca. CTAs, correcto, el búho, la racha, progreso. "Cuando dudes, ponle verde." |
| **Mask Green** | `#89E219` | 137 226 25 | Verde secundario, sobre el que se posa Duo. Glows de éxito. |
| **Eel** | `#4B4B4B` | 75 75 75 | Tipografía. El "tinta" por defecto — **no negro puro.** |
| **Snow** | `#FFFFFF` | 255 255 255 | Fondo primario. |

> Jerarquía oficial de uso: Feather Green → Mask Green → Eel (texto) → Snow (fondo).

### 2.2 Secundarios (gamificación / "splashes of delight") ✅

| Nombre | HEX | RGB | Rol semántico 🟡 |
|---|---|---|---|
| **Macaw** | `#1CB0F6` | 28 176 246 | Azul. Acción secundaria, links, info, Super/Plus, streak-freeze. |
| **Cardinal** | `#FF4B4B` | 255 75 75 | Rojo. Incorrecto, error, destructivo, corazones/vidas. |
| **Bee** | `#FFC800` | 255 200 0 | Amarillo/oro. XP, logros, coronas, premios de racha. |
| **Fox** | `#FF9600` | 255 150 0 | Naranja. Highlights, recompensas secundarias, warnings, leaderboard. |
| **Beetle** | `#CE82FF` | 206 130 255 | Morado. Eventos especiales, branding de Super Duolingo. |
| **Humpback** | `#2B70C9` | 43 112 201 | Azul oscuro de apoyo. |

### 2.3 Neutros ✅

| Nombre | HEX | Rol |
|---|---|---|
| **Eel** | `#4B4B4B` | Texto principal / headings (tinta). |
| **Wolf** | `#777777` | Texto secundario, captions, metadata. |
| **Hare** | `#AFAFAF` | Placeholder, texto deshabilitado, iconos inactivos. |
| **Swan** | `#E5E5E5` | Borde por defecto, divisores, fill de botón disabled, track de progress bar. |
| **Polar** | `#F7F7F7` | Superficie sutil, fills vacíos, filas alternas. |
| **Snow** | `#FFFFFF` | Fondo de página y cards. |

### 2.4 "Lips" / sombras 3D (tonos oscuros para profundidad) 🟡

Cada botón de color tiene una versión **más oscura de su propio tono** para el borde inferior (el "labio" 3D) y el estado pressed:

| Base | Lip / pressed |
|---|---|
| Feather Green `#58CC02` | **`#58A700`** (a veces "Tree" / "Feather Green Dark") |
| Macaw `#1CB0F6` | **`#1899D6`** ("Whale") |
| Cardinal `#FF4B4B` | **`#EA2B2B`** ("Cardinal Dark") |

### 2.5 Paleta de Duo (el personaje) ✅

Para dibujar a Duo correctamente, la marca publica colores por parte del cuerpo: Wing Overlay `#43C000`, Feather Green `#58CC02`, Mask Green `#89E219`, Beak Inner `#B66E28`, Beak Lower/Feet `#F49000`, Beak Upper `#FFC200`, Beak Highlight `#FFDE00`, Tongue Pink `#FFCAFF`, Eel `#4B4B4B`, Polar `#F7F7F7`, Snow `#FFFFFF`.

### 2.6 Notas sobre el sistema de color

- **Un solo acento saturado.** No hay segundo verde rival; Feather Green carga todas las CTAs y el wordmark. "Confianza por contención lúdica, no por suavizado corporativo." 🟡
- **Superficies blancas dominantes**; el color fuerte se **reserva para interacción y feedback**, no para rellenar pantallas.
- **Contraste / dark mode:** la guía oficial pública (color/typography) no documenta un dark mode ni ratios WCAG por token. Es un hueco real en las fuentes: Duolingo tiene dark mode en la app, pero **no encontré la spec oficial de sus tokens oscuros** — trátalo como no verificado.

---

## 3. El botón (componente firma)

El botón es **el** componente de marca: control gordo y táctil con un **labio inferior sólido** (color = sombra más oscura de sí mismo) que lo hace sentir como una tecla física. Al presionar, el botón baja y el labio colapsa.

### 3.1 Anatomía 🟡 (reconstruida de teardowns + el video de Builder.io)

| Propiedad | Valor (primary verde) |
|---|---|
| Fondo | `#58CC02` |
| Texto | `#FFFFFF`, 15px / 700, MAYÚSCULAS, tracking 0.8px |
| Borde | ninguno |
| **Labio / sombra** | **`0 4px 0 #58A700`** — sólido, **sin blur, sin spread** |
| **Radio** | **12px** (ver conflicto abajo) |
| Padding | `14px 20px` · min-height ~50px |
| **Pressed** | `translateY(4px)` y el labio colapsa a `0 0` |
| **Disabled** | fondo `#E5E5E5`, texto `#AFAFAF`, sin labio |
| Uso | **Una sola** acción primaria por pantalla — `CONTINUE`, `START`, `CHECK` |

### 3.2 La técnica exacta del press ✅ (transcript del video de Builder.io)

> "Background color y un box-shadow sin offset en X, un poco de offset en Y, **sin blur**, y un color un poco más oscuro que el fondo. Luego en `:active` quitas la sombra y usas `transform` para mover el botón en Y **la misma cantidad** que medía la sombra. Así obtienes el press suave y satisfactorio."

Dos métodos equivalentes que circulan (ambos 🟡, replican el efecto):

```css
/* Método box-shadow (el que más se acerca al feel real) */
.btn-primary {
  background: #58CC02;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border: none;
  border-radius: 12px;        /* 12–16px según fuente */
  padding: 14px 20px;
  box-shadow: 0 4px 0 #58A700; /* el "labio": sólido, sin blur */
  transition: filter 100ms ease;
}
.btn-primary:active {
  box-shadow: none;
  transform: translateY(4px);  /* baja exactamente lo que medía el labio */
  filter: brightness(0.95);
}
```

```css
/* Método border-bottom (alternativa; puede causar layout shift al presionar) */
.btn { border-bottom: 4px solid #58A700; border-radius: 12px; }
.btn:active { border-bottom: 0; transform: translateY(4px); }
```

**Por qué box-shadow > border-bottom:** el `border-bottom` reflowa el layout al colapsar; el `box-shadow` no toca el flujo, así que el press se siente más limpio. 🟡

**⚠️ Conflicto de radio.** Las fuentes no coinciden: oh-my-design dice **12px**, refero.design dice **12px** ("el único radio del sistema"), DesignMD dice **12px**, blakecrosley usa **16px**, y un par de clones en Medium usan **15px**. Lo más sólido: **botones ~12px**, **cards ~16px** (ver §4). Que varíe entre teardowns confirma que es **inferido**, no oficial.

---

## 4. Esquinas redondeadas (radii)

🟡 No hay tabla oficial; esta es la escala que más se repite en teardowns:

| Token | Valor | Uso |
|---|---|---|
| sm | 8px | Elementos chicos, progress bars |
| **md** | **12px** | **Botones, pills, answer tiles** — el radio de trabajo |
| lg | 16px | Cards, modales, plan tiles |
| full | 9999px | Avatares, chips de bandera, progress pill |

Principio: **un radio dominante (12px)** y casi todo lo demás deriva de ahí. Refero llega a decir que "12px es el único radio del sistema" — exageración, pero capta la idea de **poca variedad de radios**.

---

## 5. Profundidad / elevación

El modelo de profundidad de Duolingo es **físico, no atmosférico.** En lugar de sombras difusas (gaussianas), usa **offsets sólidos**: un tono más oscuro del propio elemento, pegado justo debajo. Eso es lo que hace que los botones se sientan teclas reales.

🟡 Niveles de elevación (reconstruidos):

| Nivel | Tratamiento | Uso |
|---|---|---|
| 0 — Flat | sin borde, sin sombra | Texto inline, fondo de página |
| 1 — Outlined | **borde sólido 2px `#E5E5E5`** | Cards, list rows, answer tiles |
| 2 — Lip | **`0 4px 0` sólido** (tono oscuro propio) | Botones, tiles seleccionables — el efecto 3D firma |
| 3 — Card flotante | outline 2px + `0 2px 0 rgba(0,0,0,0.05–0.1)` | Cards flotantes, planes seleccionados |
| 4 — Dialog | sombra más marcada `rgba(0,0,0,0.4)` | Modales |

**Filosofía de sombra** (clave): el labio 3D *siempre* es **color sólido (sin blur, sin spread)** y *siempre* un tinte más oscuro del componente. Las sombras difusas son raras y muy sutiles cuando aparecen. **Las cards llevan outline de 2px en vez de elevación suave** — la profundidad viene del borde, no del blur. Esta es probablemente la decisión más distintiva y más fácil de copiar mal: si pones blur, ya no es Duolingo.

---

## 6. Espaciado y layout

🟡 Escala de spacing reconstruida (base 4/8):

`xs 4 · sm 8 · md 12 · base 16 · lg 24 · xl 32 · xxl 48` (el sitio de marketing añade 96 para secciones).

Principios observables:
- **Touch targets grandes**, generoso whitespace.
- **Pantallas de foco único**: una acción clara a la vez. La CTA suele ser full-width abajo.
- **Canvas blanco edge-to-edge** en marketing: sin tinte crema, sin gradient mesh, sin franja hero oscura. Cada sección la ancla un personaje cartoon, no un degradado.

---

## 7. Iconografía e ilustración

### 7.1 Evolución del estilo ✅ (blog: *Shape language*, 2020)

- Inicio: formas estáticas, duras, sobre gris. 
- **2018:** trabajando en "Duolingo KIDS", el equipo de arte experimentó con ilustración más brillante, redonda y amistosa. Ese estilo migró a la app principal → **gran rediseño 2018** (colores vibrantes, botones redondeados, fondo blanco). Ahí nació la estética actual.
- Pasaron de raster hi-res a **vector** para escalar a cualquier pantalla y producir rápido.
- Estética: **minimalista y juguetona**, "rápida de producir, clara de entender, divertida para aprender". El humor sale de **exagerar detalles clave casi a la caricatura** + ritmo (variedad estratégica de formas y tamaños).

### 7.2 Duo y la lógica de los personajes ✅ (blog: *Building character* + The Verge)

**Duo tiene 4 componentes** que definen todo el lenguaje visual:
1. Construcción **geométrica** y simple (un cuerpo con alas).
2. **Ojos grandes** y entrañables.
3. **Forma de cuerpo única.**
4. **Pies despegados** (detached feet).

Aplicar esos 4 rasgos a un humano hace que el personaje "pertenezca al mismo mundo" que el búho. Por eso los **World Characters** (Project World, revelados 2020, ~9 personajes; diseño liderado por **Greg Hartman**, head of art) son humanos pero con el ADN de Duo. **Decisión clave:** no hacerlos otros animales — "el lenguaje está tan enraizado en la cultura humana que se sentía raro meter personajes que no son de nuestro mundo."

**El diseño maneja la personalidad** (no al revés): "la forma maneja al personaje". Triángulos = dinámico, cuadrados = sólido, círculos = divertido. Lily (pelo morado, ángulos filosos) → emo/sarcástica; Vikram (redondo, barba) → bondadoso; Junior (bloque + pelo rojo) → enérgico. Pares por contraste (Zari extrovertida vs Lily introvertida; Lin relajada vs Bea neurótica) para generar drama narrativo.

**Caso de rediseño con sensibilidad cultural ✅** (Vikram, 2024): recibieron feedback de que su torso esférico evocaba un estereotipo Sikh ("barrigón/jolly tipo Santa"). Trabajaron con un consultor de sensibilidad Sikh + comité de empleados sudasiáticos, ajustaron turbante y torso. Muestra que **el shape language es una herramienta con consecuencias**, no solo estética.

### 7.3 Sistema de íconos

No encontré una spec pública de la grilla de íconos. Por las ilustraciones: **flat, geométrico, vector, alto contraste, esquinas redondeadas**, coherente con el lenguaje de personajes. (Hueco de fuentes — no verificado a nivel de stroke/grid.)

---

## 8. Motion y animación

### 8.1 ⚠️ Corrección importante: usan Rive, no Lottie ✅

La suposición común es "Lottie". **Falso para los personajes.** Duolingo anima sus World Characters con **Rive** (blog *World character visemes*, 2022; charla oficial; Rive blog del AI Video Call con Lily).

**Por qué Rive y no Lottie:**
- **Archivos compactos** que encajan en la arquitectura de la app y data transfer mínimo (mucho menos que mandar un video).
- **State Machine:** representación visual de la lógica que conecta animaciones ("estados") y controla cuáles se llaman, cómo transicionan y se mezclan — **en tiempo real, reaccionando al usuario**.
- **Lip-sync (visemes):** dos sistemas que corren a la vez — uno solo para las bocas (llamable en cualquier orden) y otro para el cuerpo (idle → correcto/incorrecto). Independientes, así no se rompen entre sí. Animar a mano 10 personajes × todas las combinaciones de boca era inviable; Rive lo hace modular.
- **"Modular actor"** (AI Video Call de Lily): en vez de cientos de reacciones fijas, componen piezas reutilizables — "como un risograph: capas de ojos, cejas, boca". 8 animaciones de cabeza × 8 de cuerpo = **64+ variantes** de idle para que nunca se sienta repetitivo. Artboards anidados separan cabeza y cuerpo para movimiento independiente.

### 8.2 Principios de animación ✅

- **El timing lo es todo.** Múltiples pasadas de animación rough para experimentar variaciones antes de refinar ritmo y energía (blog del streak).
- **Las celebraciones como "power-ups" de videojuego.** En milestones de racha, **Duo físicamente cambia** ("Fire Duo" basado en la imagen del fénix — legible y poderosa entre culturas).
- **Animación = inversión de negocio, no adorno.** "Ecuación simple: más divertida y atractiva la app → más efectiva." Tanto que en **2023 internalizaron el estudio Gunner** (Detroit) para tener un "engine" de animación propio y poder ser "más audaces".
- **Micro-interacción estrella:** el press del botón (§3) — "la interacción más reconocible de Duolingo".

---

## 9. UI de gamificación

> Contexto para Itera: esto es **justo lo que Itera descartó** como mecánica (no somos un LMS gamificado). Lo documento para entender *cómo* lo construyen, no para traerlo. La psicología está bien estudiada y vale conocerla aunque no se use.

### 9.1 Racha (streak) — la mecánica central ✅🟡

- Es **la mecánica que carga todo el sistema**; casi todo lo demás existe para alimentarla o defenderla. La columna vertebral.
- Funciona por **aversión a la pérdida** (Kahneman-Tversky): perder duele ~2× más que ganar lo equivalente. Una racha de 90 días es "un activo que proteger". Suma **sunk-cost** ("ya llevo 47 días, ¿los tiro?") + **progreso visible** (la fluidez no se ve día a día; el número sí).
- **Capa defensiva** = lo que la distingue de copias: **streak freeze** (absorbe un día perdido) y **streak repair**. No es generosidad: es *retention engineering* — el momento en que la racha se rompe es justo cuando el hábito muere.
- Las **notificaciones, widgets y leagues** apuntan todas a la racha.

### 9.2 Corazones / vidas ✅🟡

Errores limitados por lección. Combina **castigo por fallar** + **recompensa variable** (en algunas preguntas pierdes corazón, en otras no — incertidumbre tipo slot machine). Recurso finito bajo amenaza → urgencia y engagement más cuidadoso. Se recuperan practicando o pagando (unlimited hearts en Super).

### 9.3 XP, leagues y leaderboards ✅🟡

- **XP** = puntos por lección; alimenta leagues y leveling.
- **Leagues:** leaderboard semanal de **30 usuarios** asignados al azar, rankeados por XP de 7 días. Diseño deliberado:
  - **7 días** es el horizonte correcto: corto para que el premio siga visible, largo para exigir esfuerzo sostenido. Reset dominical aprovecha la procrastinación de fin de semana como palanca.
  - **Promoción + descenso (demotion):** el descenso es lo que mete aversión a la pérdida — cada semana "subes o defiendes", quedarse quieto no es opción estable.
  - **Sin atajos:** ni una semana brutal te salta dos tiers. Premia **consistencia** sobre picos.
  - **Matchmaking por nivel de actividad:** no compites contra alguien de 400 XP/día si haces 20 — mantiene la competencia "ganable".
- Respaldo en su **whitepaper académico** (2023): leaderboards > metas de "hacer tu mejor esfuerzo" como motivador (Landers et al. 2017).

### 9.4 El loop y su crítica honesta

Es el modelo "Hooked" de Nir Eyal (trigger → acción → **recompensa variable** → inversión). **Falla conocida (y que Itera debe tener clarísima):** XP mide *lecciones completadas, no aprendizaje*. El leaderboard optimiza **cantidad**, lo que incentiva *speed-running* de lecciones fáciles para proteger la racha — **engagement sin aprendizaje**. Self-Determination Theory advierte que las recompensas externas pueden **desplazar la motivación intrínseca**: si aprendes "por la racha" y la racha se rompe, no queda nada. La postura de Duolingo: "cualquier aprendizaje es mejor que ninguno; si la racha hace que alguien practique 5 min/día que de otro modo no practicaría, es una victoria."

### 9.5 El "Path" — rediseño 2022 ✅

El cambio de UI más grande en 3 años. De **"the tree"** (árbol con rutas elegibles, donde dos personas con las mismas horas terminaban en lugares distintos) a **"the path"**: una **ruta lineal única**, paso a paso, sin elegir la siguiente lección.

- **Ciencia detrás (blog oficial):** el orden se basa en **repetición espaciada** — mezcla conceptos nuevos con repaso de previos en vez de "dominar y avanzar". Cada círculo del path = 1 nivel de corona; niveles de distintas skills intercalados. Stories y practice integrados en el path.
- **Objetivos declarados:** "bajar la confusión y subir los resultados de aprendizaje" (Luis von Ahn, CEO).
- **Resultados (portafolio de Holly Munson, content designer del proyecto):** retención positiva, **+3.7% bookings (~$16k/día)**, **+18% IAPs (~$8k/día)**; mayor rediseño en 3 años, cobertura de prensa muy positiva.
- **Manejo del cambio:** hubo **backlash fuerte** (Reddit, fans de años). El CEO no dio marcha atrás: lo lanzaron **primero a usuarios nuevos** para medir engagement antes del rollout general. "Es importante escuchar el feedback, pero también entender que la gente es averso al cambio. Mantener dos sistemas es muy difícil." Lección de proceso: **rollout gradual + datos por encima de la opinión ruidosa.**

---

## 10. Sistema de diseño y proceso

### 10.1 ¿Hay design system público? Parcial ✅

Duolingo publica **guías de marca** (design.duolingo.com: color, tipografía, logo, Duo) — es lo más cercano a un design system oficial y **es excelente como referencia de tokens**. Pero **no publica** la librería de componentes de la app (botones, cards, spacing) con specs: todo lo de §3–§6 es reverse-engineering de terceros. Quien diga "el design system de Duolingo" como librería pública, casi siempre se refiere a teardowns/clones (oh-my-design, refero, shadcn.io), no a algo oficial.

### 10.2 Cultura de experimentación ✅ (lo más transferible)

- **"Test everything."** Cientos de experimentos A/B **simultáneos cada semana** — desde cambiar un botón hasta lanzar Leaderboards. Releases de iOS/Android **semanales**.
- **Método:** grupo A (control) vs B (cambio); hipótesis + métricas definidas *antes*; rollout gradual con monitoreo; si rompe algo o daña métricas, se pausa; si es estable, se sube; al final se lanza o se mata.
- **"Cuando no estamos de acuerdo, probamos ideas y dejamos que las métricas decidan"** (Handbook). Principio operativo "Ship It": no por velocidad sino por **maximizar oportunidades de aprender**.
- **Product Review (PR):** estructura formal calcada del code review de ingeniería; un grupo rotativo de líderes de Product y Design opina.
- **Feedback cuali + cuanti:** A/B + research de eficacia + **dogfooding extensivo**. Proyectos tempranos se apoyan más en cuali antes de pasar a métricas.
- **Server-Driven UI (SDUI):** mandan instrucciones de UI desde el backend → experimentan y arreglan bugs **sin esperar release cycles** ni divergencia entre versiones. Corrieron 18 experimentos (incl. rediseño completo de la tienda) sin tocar el cliente.
- **Copy testing (Expurrimenter / CopyCAT):** A/B de *copy* por idioma, conectado a su analytics. En 3 meses **duplicaron** su volumen histórico de tests de copy. Insight: lo que motiva a un alemán no motiva a un hispanohablante — copy localizado y testeado, no traducido.

### 10.3 Cómo investigan con expertos ✅

- El path se construyó con **UX researcher + product designer + content designer + liderazgo**, anclado en **ciencia del aprendizaje** (repetición espaciada).
- Mantienen **whitepapers** ("The Duolingo Method", 2023) firmados por su equipo de investigación (Freeman, Kittredge, Wilson, Pajak) que citan literatura académica (motivación extrínseca/intrínseca, leaderboards, child-centered design).
- Para personajes: **consultores de sensibilidad** + comités internos de empleados de la comunidad representada.
- Para voces: actor de voz por personaje + **TTS custom con Microsoft**.

### 10.4 Principios de diseño que se pueden destilar

1. **Diversión primero** (es la estrategia, no el adorno).
2. **Un solo color de marca, contención cromática.**
3. **Profundidad física (borde/labio sólido), nunca atmosférica.**
4. **Foco único por pantalla, una acción clara.**
5. **Personajes en vez de degradados.**
6. **Bold sobre fino** (jerarquía por tamaño, no por peso).
7. **Las métricas deciden; la opinión propone.**
8. **Hacer visible el progreso invisible.**

---

## 11. Fuentes

**Oficiales / primarias (✅):**
- Duolingo Brand Guidelines — Color · https://design.duolingo.com/identity/color
- Duolingo Brand Guidelines — Typography · https://design.duolingo.com/identity/typography
- Blog — *The Science Behind Duolingo's Home Screen Redesign* (2022) · https://blog.duolingo.com/new-duolingo-home-screen-design/
- Blog — *Improving Duolingo, One Experiment at a Time* (2020) · https://blog.duolingo.com/improving-duolingo-one-experiment-at-a-time/
- Blog — *Shape language: Duolingo's art style* (2020) · https://blog.duolingo.com/shape-language-duolingos-art-style/
- Blog — *Building character* (2020) · https://blog.duolingo.com/building-character/
- Blog — *How Duolingo Animates Its World Characters* (visemes/Rive, 2022) · https://blog.duolingo.com/world-character-visemes/
- Blog — *Animating the Duolingo Streak* (Fire Duo, 2022) · https://blog.duolingo.com/streak-milestone-design-animation/
- Blog — *Redesigning Vikram* (2024) · https://blog.duolingo.com/vikram-redesign/
- Blog — *The Stories Behind Duolingo's Female Characters* (2022) · https://blog.duolingo.com/duolingo-female-character-origin-stories/
- Blog — *Server-Driven UI* (2024) · https://blog.duolingo.com/server-driven-ui/
- Blog — *Copy Testing / Expurrimenter* (2022) · https://blog.duolingo.com/copy-testing-experiments/
- The Duolingo Handbook · https://handbook.duolingo.com/
- Whitepaper *The Duolingo Method* (2023) · https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_duolingo_method_2023.pdf
- Apple Developer — *Behind the Design: Duolingo* (2023, Ryan Sims) · https://developer.apple.com/news/?id=jhkvppla
- Monotype — *The Duolingo Font: Exploring Feather* · https://www.monotype.com/resources/duolingo-custom-font-inspired-their-owl-mascot-duo
- Fonts In Use — *Duolingo app* (crédito Krista Radoeva/Fontsmith, Johnson Banks) · https://fontsinuse.com/uses/59497/duolingo-app
- The Verge — *How Duolingo designed the new characters for Project World* (2020) · https://www.theverge.com/2020/9/26/21456628/
- NBC News — *Duolingo's redesign… CEO* (2022) · https://www.nbcnews.com/tech/tech-news/duolingos-update-redesign-luis-von-ahn-interview-rcna44655
- Creative Review — *How Duolingo created its in-house animation engine* (Gunner, 2023) · https://www.creativereview.co.uk/duolingo-gunner-animation/
- Rive — *Duolingo's AI-powered Video Call brings Lily to life* · https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life
- Builder.io (Steve) — *How Duolingo makes satisfying button press effects in pure CSS* · https://www.youtube.com/watch?v=qew5Hf_jT8E
- Holly Munson — portafolio del *new learning path* (métricas) · https://www.hollyvwmunson.com/duolingo-new-learning-path

**Teardowns / reverse-engineering de terceros (🟡):**
- oh-my-design-cli — Duolingo DESIGN.md (tokens reconstruidos) · https://unpkg.com/oh-my-design-cli@1.8.2/web/references/duolingo/DESIGN.md
- Refero Styles — Duolingo design system · https://styles.refero.design/style/95b472c5-fc07-46a8-a11f-c5432e290fcd
- shadcn.io — Duolingo Design System for React · https://www.shadcn.io/design/duolingo
- DesignMD — Duolingo · https://www.designmd.co/d/duolingo
- Blake Crosley — *Gamification as Design Language* · https://blakecrosley.com/guides/design/duolingo
- Medium (Lil Skyjuice Bytes) — *Replicating Duolingo's Iconic Button in Pure CSS* · https://medium.com/@lilskyjuicebytes/clone-the-ui-1-replicating-duolingos-button-in-pure-css-bd37a97edb7e
- Deconstructor of Fun — *Duolingo Leagues* · https://duolingo.deconstructoroffun.com/mechanics/leagues
- DEV / Medium / Vmobify — teardowns de gamificación (psicología de racha/leagues)

---

## 12. Implicaciones para Itera (corto y selectivo)

> Itera es **B2B premium, criterio bajo presión, no LMS gamificado**. La doctrina actual es Apple HIG, sobriedad, sin semáforos infantiles. Duolingo está en el polo opuesto del *tono*. Por eso lo de abajo separa **craft adaptable** de **lo que NO traer**.

**Adaptable (el método, no el disfraz):**
1. **Disciplina de tokens con nombres y roles claros.** No el "animal naming", sino el rigor: cada color tiene un rol semántico único y publicado. Itera ya va por ahí (DEC-008/009); Duolingo valida que **un sistema chico y bien-nominado gana**.
2. **Profundidad por borde sólido, no blur** — es una decisión de craft *neutral en tono*. Una versión sobria (labio de 1–2px, no 4px arcade) podría dar tactilidad premium sin volverse juguete. **A explorar, no a copiar.**
3. **Contención cromática:** un acento que carga todo (Itera ya: `#1472ff` / `accent-strong #0e5fcc`). Duolingo confirma que **un solo acento saturado** lee como confianza.
4. **Foco único por pantalla, una acción clara.** Esto **coincide** con lo que Pablo ya pidió ("un item del sidebar por cosa, una vista limpia"). Duolingo es prueba de que funciona a escala.
5. **Jerarquía por tamaño/peso, no por colorinche.** El "bold sobre fino" es compatible con premium si el color es sobrio.
6. **Cultura de experimentación + métricas deciden + rollout gradual ante cambios grandes.** Esto es 100% transferible y es quizá lo más valioso del documento para producto.
7. **Personajes/mascota geométrica como ancla de marca** — encaja con la memoria de Itera ([[project_identidad_visual]], mascota geométrica estilo Duo, sin humanos). El "shape language" (Duo = 4 componentes) es un modelo replicable para la mascota de Itera.

**NO traer (rompe la tesis de Itera):**
- Racha / corazones / XP / leagues / leaderboards como mecánica de producto → es exactamente el *engagement sin aprendizaje* que Itera quiere evitar (medir **criterio**, no logins).
- Tono arcade: verde voltaje, all-caps gritón, sombras de 4px tipo juguete, celebraciones explosivas.
- Caja alta gritona en CTAs.

**Tensión honesta a decidir (no la resuelvo aquí):** la memoria de Itera dice "Duolingo aplicado a paleta Itera" para **ilustración**, pero la doctrina de UI es Apple HIG sobrio. Duolingo y Apple HIG son filosofías de profundidad **opuestas** (labio sólido vs. elevación atmosférica). Hay que elegir conscientemente **dónde** Itera es "Duolingo-ish" (ilustración, mascota, contención cromática, foco único) y dónde es "Apple-ish" (depth, tipografía, densidad). Mezclarlas sin decidir es lo que produce inconsistencia.
