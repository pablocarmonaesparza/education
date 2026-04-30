# Identidad visual Itera — "itera-flat-v1"

> Sistema de ilustración pedagógica. Cada ilustración en Itera es un **memory hook** que sirve a la tesis de retención — no decoración. Este documento gobierna qué ilustrar, cómo ilustrarlo y cómo validarlo.

**Versión:** 1.0 (2026-04-22) · **Fuente de verdad visual** · **Motor:** Recraft v4 Pro

---

## 1. Tesis

Itera no vende información sobre AI — vende **retención + ejecución**. Cada slide de cada lección compite por espacio en la memoria del usuario. Una ilustración que no mejora recall es peor que ninguna: ocupa el canal visual sin pagar el costo cognitivo.

**Filtro de decisión para cualquier ilustración:**
> *¿esto funcionaría como único pista para re-activar el concepto 24h después, sin el texto al lado?*

Si la respuesta es no, es decoración — y en Itera, decoración es lastre.

---

## 2. Los 8 principios (derivados del research + metodología Itera)

1. **Distintividad por diseño, no por adición.** Cada ilustración debe ser perceptualmente distinguible del resto del mismo curso — en silhouette, color dominante, composición. Sin distintividad, no hay *picture superiority effect* (Mintzer & Snodgrass).

2. **Imagen-firma por concepto, re-usada dentro de la lección.** El Engage, Elaborate y Evaluate del mismo concepto comparten la misma ilustración canónica para maximizar *encoding specificity* (Tulving). Sin variaciones artísticas del mismo hook.

3. **La imagen complementa, no duplica el texto.** Ilustrar el *concepto*, no la frase. Si al tapar el texto la imagen pierde significado pedagógico, es decoración disfrazada (*coherence principle*, Mayer).

4. **Concreto > abstracto; escena > diagrama; objeto > símbolo.** Los conceptos abstractos de AI se ilustran a través de escenas humanas concretas o metáforas objetuales, no con flechas, nodos y etiquetas.

5. **Violación de expectativa en el feedback del Engage.** En la corrección post-hypercorrection, la imagen del correcto rompe la composición/color/personaje del error, con más peso visual. El contraste es el activo pedagógico, no un bug UX (Fazio & Marsh, 2009).

6. **Shape language estricto + arquetipos reusables.** Formas básicas redondeadas, outline grueso, paleta fija, y 3-5 arquetipos humanos universales (sin identidad individual, sin cross-lección) crean continuidad estilística sin romper autocontención.

7. **Optimización para adulto LATAM 50+ no-técnico.** Metáforas de vida cotidiana (cocina, construcción, conversación, hogar) — nunca oficina digital (folders, clipboards, hoodies, code). Outlines gruesos, contraste ≥4.5:1, representación humana diversa.

8. **Silhouette test + miniatura test como criterios de aceptación.** Una ilustración que no es reconocible a 64×64 px o en silueta negra no califica como memory hook. Si falla el test, no se publica.

---

## 3. Reglas de forma

### 3.1 Shape language

- Sólo formas básicas (rounded rectangles, círculos, triángulos) con **todas las esquinas redondeadas**. Cero puntas.
- **Outline exterior negro `#000000` uniforme** (~3px stroke equivalente). Único outline válido.
- **Perspectiva flat / front-facing.** La profundidad se sugiere por un **bottom-border más grueso** en color sombra (traduce el `border-2 border-b-4` del design system) — **nunca por drop shadows, blur o gradients**.
- **Exageración intencional de UN rasgo** por ilustración (un gesto, una proporción, una expresión) — amplifica distintividad perceptual.

### 3.2 Paleta oficial (= paleta Duolingo completa)

| color | base | sombra |
|---|---|---|
| azul | `#1472FF` | `#0E5FCB` |
| verde | `#23C55E` | `#14A349` |
| rosa | `#E74FB3` | `#C74399` |
| morado | `#C37BF9` | `#9C62C8` |
| amarillo | `#F9CC28` | `#DFB724` |
| azul marino | `#0A3876` | `#012147` |
| menta | `#03CD9D` | `#00A87F` |
| naranja | `#FF9602` | `#D37B00` |
| rojo | `#FF4B4C` | `#D33A3C` |
| blanco | `#FFFFFF` | `#EAEAEA` |
| gris | `#444444` | — |
| negro `#000000` | outline universal | — |

**Uso:** color base = relleno sólido · color sombra = borde inferior más grueso (efecto "3D border") · outline siempre negro · fondo siempre blanco con ~20% padding.

Nada fuera de esta paleta. Sin gradients, sin texturas, sin photorealismo.

### 3.3 Composición

- Un objeto o escena simple, **centrada**, ~20% de padding blanco alrededor.
- Legible a **64×64 px** (miniatura) y escalable a poster.
- Para escenas con personajes: máximo 2 figuras humanas. Más ruido = menos memory hook.

---

## 4. Reglas por tipo de slide

La intensidad visual se modula por tipo de slide. No todos necesitan ilustración, y los que sí, no todos necesitan lo mismo.

| tipo de slide | ¿lleva ilustración? | qué ilustra |
|---|---|---|
| `concept` | normalmente no | si acaso, mini-ícono decorativo — texto manda |
| `concept-visual` | **sí, central** | metáfora objetual concreta del concepto (sin personajes narrativos) |
| `celebration` | **sí, enérgica** | escena de celebración genérica (arquetipo + confeti + XP) |
| `mcq (Engage)` | **sí, imagen-firma** | escena del caso: arquetipo + objeto de la misconception |
| `mcq (Evaluate)` | **sí, MISMA imagen del Engage** | reutiliza el hook del Engage — encoding specificity |
| `mcq (otro)` | opcional | escena del caso si el contexto lo pide |
| `multi-select` | opcional | similar a mcq |
| `true-false` | raro | texto basta, salvo excepción |
| `fill-blank` | raro | raramente ayuda |
| `order-steps` | opcional | contexto del problema, no los pasos individuales |
| `tap-match` | opcional | pictogramas en `def` si ayudan a la asociación |
| `code-completion` | no | código lleva la carga |
| `build-prompt` | no | texto lleva la carga |

**Regla cruzada con METODOLOGIA 6.6:** personajes humanos **solo** en slides con caso/problema (`mcq`, `multi-select`, `celebration`, etc.). `concept` y `concept-visual` usan metáforas objetuales sin figuras humanas.

---

## 5. Reglas por fase 5E

| fase | carga visual | qué hacer |
|---|---|---|
| **Engage** (1 slide) | **máxima** — es el slide más crítico pedagógicamente | escena cotidiana del caso con arquetipo + objeto de misconception. Al revelar el correcto, la imagen debe romper composición/color del error y pesar MÁS visualmente. |
| **Explore** (1-2) | media-alta | metáforas objetuales (concept-visual) que introducen el concepto por experiencia, sin nombrarlo |
| **Explain** (1-2) | baja | el texto formaliza. Si hay imagen, es la **imagen-firma** del concepto que re-aparecerá |
| **Elaborate** (3-5) | media | escenas de aplicación con arquetipos en contextos nuevos — cada ejercicio puede tener su propia escena |
| **Evaluate** (2) | **máxima** — callback visual al Engage | mcq reutiliza la **misma** imagen-firma del Engage. Celebration con energía alta. |

**Regla de imagen-firma:** una vez elegida la ilustración canónica del concepto en el Engage, esa misma composición (no una variación) reaparece en el Evaluate. Encoding specificity es la palanca más fuerte que tenemos.

---

## 6. Arquetipos humanos (cast universal reusable)

La regla 14 de METODOLOGIA prohíbe personajes recurrentes cross-lección. La solución: **arquetipos visuales genéricos sin identidad individual**. Son roles funcionales, no personas.

1. **Aprendiz curioso** — adulto LATAM genérico con gesto de pregunta o duda.
2. **AI personificado** — máquina/asistente estilizado (no un robot humanoide; prefiero una forma geométrica con rasgos faciales simples).
3. **Resultado inesperado** — personificación visual del "output" — una entidad gesticulando sorpresa, confusión o satisfacción.
4. **Mensajero / portador** — alguien entregando o recibiendo algo (un dato, un prompt, un resultado).
5. **Observador** — un tercero mirando la escena, útil para framing.

Los arquetipos varían ligeramente en apariencia cada lección (ropa, pose, tono de piel) para evitar que el usuario los registre como "personajes recurrentes" que rompan la autocontención. El rol funcional se mantiene; la identidad individual no.

**Representación humana**: edades, tonos de piel, y vestimenta variados por default. Evitar uniformidad "joven urbano tech".

---

## 7. Metáforas — qué usar, qué evitar

| ✅ usar | ❌ evitar |
|---|---|
| cocina, recetas, ingredientes | folders, archivos, clipboards |
| construcción, herramientas físicas | hoodies, silicon valley, "coder" aesthetics |
| conversación, llamada, carta | terminales, código con sintaxis |
| transporte, viaje, mapa físico | dashboards, gráficas con nodos y flechas |
| juegos de mesa, bloques, piezas | circuits, redes neuronales literales |
| tienda, mercado, oficio | mouse pointers, browser tabs |

La audiencia de Itera no comparte la cultura visual tech. Un LLM ilustrado como "un ayudante que recibe tu pregunta en un mostrador" funciona; como "un cerebro con circuitos brillantes" no.

---

## 8. Prompt base (Recraft v4)

### 8.1 Prompt de creación del preset (uso único)

Este prompt se corre **una sola vez** con un objeto semilla (ej. `a smiling pencil`) para generar las imágenes base. Luego se guarda como style preset **"itera-flat-v1"** en Recraft, y los prompts operativos se reducen a una palabra.

```
Flat vector illustration of {SEMILLA}, designed as a retrieval cue for
an adult non-technical LATAM learner.

Composition: single object or simple scene, centered on pure white
background, ~20% padding. Must be instantly recognizable in silhouette
at 64×64 px. Built from basic geometric shapes (rounded rectangles,
circles, triangles), with ALL corners fully rounded — no sharp points
anywhere. Front-facing flat perspective. Exaggerate ONE distinctive
feature (a gesture, a proportion, a quirk) to amplify perceptual
distinctiveness and memorability.

Style: bold, bouncy, friendly — Duolingo-inspired shape language.
Thick uniform black (#000000) outlines, ~3px stroke. Solid flat colors
only — no gradients, no drop shadows, no textures, no photorealism.
Depth rendered by a thicker bottom-edge outline in each shape's shadow
color (a "3D border" effect), NEVER by drop shadows or blur.

Strict Duolingo-style palette — use ONLY these base/shadow pairs:
Blue #1472FF / #0E5FCB · Green #23C55E / #14A349 ·
Pink #E74FB3 / #C74399 · Purple #C37BF9 / #9C62C8 ·
Yellow #F9CC28 / #DFB724 · Navy #0A3876 / #012147 ·
Mint #03CD9D / #00A87F · Orange #FF9602 / #D37B00 ·
Red #FF4B4C / #D33A3C · White #FFFFFF / #EAEAEA ·
Grey #444444. Outline always Black #000000.

Purpose: memory hook for a concept in Itera (AI learning platform for
non-technical Latin American adults). Must be perceptually distinct
from other illustrations in the same course, legible at 64×64 px, and
carry meaning without caption. Avoid office/tech culture metaphors
(folders, code, hoodies); prefer everyday-life metaphors (kitchen,
construction, conversation, household).
```

### 8.2 Prompt operativo (post-preset)

Una vez guardado `itera-flat-v1` en Recraft, el prompt es de 1-3 palabras + selección del preset:

- `notebook`
- `database`
- `laptop`
- `soda can`
- `curious person holding a letter` (para escenas con arquetipos)

El preset aplica shape language, outline, paleta y composición automáticamente.

---

## 9. Criterios de aceptación (antes de publicar cualquier ilustración)

Checklist rápido. Si falla alguno, se regenera.

1. **Silhouette test**: ¿es reconocible como silueta negra sólida?
2. **Miniatura test**: ¿se lee a 64×64 px sin perder significado?
3. **Distintividad**: ¿es claramente distinta (silueta, color dominante, composición) de las otras ilustraciones del mismo curso?
4. **Sin duplicación**: ¿aporta información no presente en el texto del slide?
5. **Sin gradients / shadows / texturas / photorealism**: ¿respeta el shape language?
6. **Paleta estricta**: ¿todos los colores están en la tabla oficial?
7. **Metáfora adecuada**: ¿usa referencia cotidiana LATAM y no oficina/tech?
8. **Imagen-firma**: si es Engage o Evaluate de la misma lección, ¿es la misma ilustración?

---

## 10. Backlog de identidad visual

Se implementa cuando el producto lo pida, no antes.

- **Variantes del preset** si se descubre que objetos vs escenas con personajes requieren prompts distintos (`itera-flat-v1/object`, `itera-flat-v1/scene`).
- **Biblioteca de arquetipos** en SVG editable, pre-generados y versionados en `/public/illustrations/archetypes/`.
- **Sistema de slide → ilustración** en el generador automático (`/generate-lecture`), que sugiera el tipo de ilustración correcto según fase 5E y tipo de slide.
- **A/B de distintividad**: medir recall a 24h con vs sin imagen-firma para validar empíricamente el principio de retrieval cue.

---

## 11. Referencias

**Picture superiority y distintividad:**
- Mintzer & Snodgrass — Increasing word distinctiveness eliminates the picture superiority effect ([Memory & Cognition](https://link.springer.com/article/10.3758/s13421-018-0858-9))

**Dual coding / multimedia learning:**
- Mayer — Principles for reducing extraneous processing in multimedia learning ([Cambridge](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles/CD5B7AE1279A9AB81F8EEBB53DBEC86E))

**Retrieval cues / context-dependent memory:**
- Wing et al. — Encoding contexts are incidentally reinstated during retrieval ([Cerebral Cortex](https://academic.oup.com/cercor/article/32/22/5020/6519540))

**Hypercorrection + imagen:**
- Metcalfe & Finn — People's hypercorrection of high confidence errors ([PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3079415/))
- Fazio & Marsh — Surprising feedback improves later memory ([PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4036076/))
- Sinclair & Barense — Prediction errors disrupt hippocampal representations ([PNAS](https://www.pnas.org/doi/10.1073/pnas.2117625118))

**Duolingo design:**
- Shape language: Duolingo's art style ([Duolingo Blog](https://blog.duolingo.com/shape-language-duolingos-art-style/))
- Behind the Design: Duolingo — entrevista Ryan Sims, Greg Hartman ([Apple Developer](https://developer.apple.com/news/?id=jhkvppla))

**LATAM / adultos 50+ / low-literacy:**
- Medhi-Thies et al. — Actionable UI design guidelines for smartphone apps inclusive of low-literate users ([ACM CSCW](https://dl.acm.org/doi/10.1145/3449210))
- Design guidelines of mobile apps for older adults — systematic review ([JMIR mHealth](https://mhealth.jmir.org/2023/1/e43186))

---

**Próximo paso pendiente:** generar las 4 imágenes base con el prompt de §8.1 y guardarlas como style preset `itera-flat-v1` en Recraft. Semilla recomendada a definir con Pablo (pencil, notebook, database, o arquetipo humano).
