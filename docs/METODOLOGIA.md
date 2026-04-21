# Metodología Itera — v0.10

> Documento vivo. Es el contrato pedagógico que gobierna la creación de cada lección en Itera.

---

## 1. Los dos principios fundacionales

### Principio Cero — Retención sobre información
Itera no vende acceso a información sobre AI. Esa información está disponible gratis en YouTube, blogs y documentación oficial. **Itera vende un sistema de retención que convierte información disponible en conocimiento aplicado.**

Filtro de decisión: *¿esto mejora la retención y el regreso del usuario, o solo la densidad informativa?*

### Principio Final — Ejecución sobre estudio
Itera no vende educación como fin. Vende educación como vehículo hacia ejecución con retorno práctico tangible. **Cada lección debe dejar al usuario capaz de aplicar lo aprendido a su vida, trabajo o negocio en las próximas 24 horas.**

Filtro de decisión: *¿el usuario puede ejecutar algo concreto al salir de esta lección?*

### Tensión productiva
Los dos principios se tensionan intencionalmente:
- **Cero** pide hacer la app adictiva (regreso).
- **Final** pide que el usuario salga a ejecutar (uso externo).

Esto no es contradicción, es diseño. Esta dualidad es la ventaja competitiva frente a Duolingo, que optimizó solo retención y sacrificó outcome real.

---

## 2. Columna vertebral pedagógica

### 2.1 Modelo 5E (Bybee, BSCS 1987)
El orden de las fases es no-negociable. La investigación confirma que invertir o saltar fases reduce la efectividad.

1. **Engage** — Hook. Activa conocimiento previo y curiosidad.
2. **Explore** — Experiencia antes del concepto. Hands-on, no explicación formal.
3. **Explain** — Nombrar y formalizar el concepto, ahora sí.
4. **Elaborate** — Aplicar a un contexto nuevo.
5. **Evaluate** — Verificar comprensión.

### 2.2 Productive Failure + Hypercorrection en Engage
- **Fundamento:** Kapur (2014, 2016) — Productive Failure. Cohen's d = 0.36 en transferencia.
- **Fundamento:** Butterfield & Metcalfe (2001) — Hypercorrection Effect.

**Aplicación:** Cada lección abre con una **pregunta-trampa de sentido común**, no de teoría. El principiante responde con confianza basado en su modelo mental intuitivo (incorrecto), se equivoca, y la corrección aterriza como revelación. Esto crea memoria episódica fuerte.

**Regla para generar preguntas-trampa:** situación cotidiana + misconception común + respuesta intuitivamente errónea. Nunca terminología técnica al abrir.

**Restricción de tipo:** el Engage usa **siempre opción múltiple con 3 opciones** (una correcta, dos distractores plausibles). Verdadero/falso no aplica — es 50% lotería y diluye el efecto de hypercorrection, que requiere confianza genuina antes del error.

**Sub-patrones permitidos del Engage** (para evitar que 50+ lecciones se sientan como copia):
- **Diagnóstico hacia atrás** — *¿qué pasó?* Persona pregunta a AI → recibe respuesta confiada → pregunta al usuario por qué. Para lecciones conceptuales.
- **Acción hacia adelante** — *¿cómo lo arreglas?* Persona intenta algo → obtiene mal resultado → pregunta al usuario qué cambiaría. Para lecciones procedimentales.
- **Elección razonada** — *¿qué deberías hacer?* Persona enfrenta decisión con 3 opciones — dos populares incorrectas, una correcta pero menos obvia. Para lecciones evaluativas o donde el tema central es decidir entre herramientas.

Los tres cumplen la estructura base (situación cotidiana + misconception + revelación). Opus elige el sub-patrón según la ruta cognitiva.

### 2.3 Auto-clasificación vía Bloom
Opus identifica el verbo dominante del learning objective y ajusta automáticamente la ratio explicación/ejercicio. No se le dice qué tipo de lección es; él lo descubre.

| Verbo Bloom | Tipo de ruta | Ratio explicación / ejercicio | Estrategia dominante |
|---|---|---|---|
| Recordar / Entender | Conceptual | 40 / 60 | Inducción + hypercorrection |
| Aplicar / Analizar | Procedimental | 25 / 75 | Progressive fading: worked example completo → completion task → problema abierto |
| Evaluar / Crear | Mixta avanzada | 30 / 70 | Casos + aplicación directa, con fading incorporado |

**Tiebreaker cuando el verbo es ambiguo.** El objetivo de aprendizaje puede reescribirse de muchas formas — y un autor podría flipar la ruta de la misma lección. Usa el **test de éxito** para romper el empate:

- Si al terminar la lección el usuario debe **explicar, diagnosticar o reconocer** → ruta **conceptual**.
- Si al terminar debe **producir, arreglar, secuenciar o decidir entre alternativas** → ruta **procedimental**.

Ejemplo: *Qué son los tokens* suena a "conocer" (conceptual). Pero si el outcome real es *estimar cuánto cuesta una app*, entonces el usuario debe **producir una estimación** — eso lo vuelve procedimental. El test de éxito manda sobre la intuición del verbo.

**Nota sobre los ratios:** son defaults operativos, no hallazgos de research. Funcionan como forcing function para mantener consistencia entre lecciones y constreñir la libertad creativa de Opus. Se ajustarán con datos reales de uso. Lo que sí está research-backed es el patrón de progressive fading (Sweller, Renkl) y la superioridad de worked examples sobre problem-solving para novices en tareas procedimentales (meta-análisis Barbieri, Clerjuste & Chawla, 2023: ~30% mejor retención en tests diferidos).

### 2.4 Spaced retrieval obligatorio
**Fundamento:** Butterfield et al. — el efecto hypercorrection decae después de una semana si no se refuerza.

**Aplicación:** cada concepto debe probarse (a) dentro de la misma lección donde se introduce, y (b) en al menos una lección posterior dentro de la misma unidad temática.

---

## 3. Reglas de forma

1. **Gramática natural del español.** Mayúscula al inicio de oración, nombres propios y siglas técnicas (API, MCP, LLM). Títulos de sección y lecciones en *Sentence case* (solo la primera letra va en mayúscula, salvo nombres propios). Ejemplo: *"Qué es un LLM"*, no *"qué es un llm"* ni *"Qué Es Un LLM"*. Regla derogada en v0.11: antes se exigía todo minúsculas; creaba fricción sin payoff real y colisionaba con el criterio gramatical del lector.
2. Bodies gramaticales, sin abreviaciones, para audiencia no técnica.
3. Inducción: experiencia → lógica → nombre. Nunca definir primero.
4. Escenarios evergreen, fun, universales. Nunca médicos, financieros o personales íntimos.

   | ❌ Evitar | ✅ Preferir |
   |---|---|
   | "correo para pedir cita médica" | "correo para pedir días libres e irse a Hawaii" |
   | "mensaje a tu ex" | "mensaje para convencer a un amigo de ir a un concierto" |
   | "resumen de tus gastos bancarios" | "plan para organizar un viaje de mochilero" |
   | "tarea de la universidad" | "propuesta para lanzar un food truck de tacos" |
   | "email a recursos humanos" | "email para pedir una reunión con tu ídolo" |

   La inmersión narrativa (narrative transportation) solo funciona si el alumno se siente representado sin incomodidad. Situaciones aspiracionales o lúdicas atraen a cualquiera; situaciones mundanas o íntimas excluyen.
5. Máximo 2-3 renglones de body — como proxy renderer-independent: **≤ 250 caracteres** o **≤ 45 palabras** por body de concept slide. Preferir 10 slides cortas a 3 largas.
6. Excepción: bullets o ejemplos enumerados pueden llegar hasta **≤ 400 caracteres** si cada bullet aporta información distinta y no se puede partir sin perder coherencia.
6.5. **Casos dentro de preguntas (mcq, true-false, etc.):** el setup del caso (antes de las opciones o antes del statement) debe caber en **máximo 3 renglones**. Dos es óptimo, uno es mejor, tres es aceptable, cuatro es inaceptable. Si el caso requiere más contexto, mueve el contexto al slide de concept anterior y deja la pregunta limpia. Como proxy: **≤ 180 caracteres** de prompt/setup (el renderer rompe ~60 chars por línea; 200 renderiza 4 líneas en casos con palabras largas).
6.6. **Personajes solo en casos y problemas.** Los slides puramente explicativas (concept, concept-visual) **no deben tener personajes** del roster. Los personajes existen para montar un caso o problema concreto; en slides informativas desvían la atención del concepto. La regla concreta: si el slide es explicación directa del mecanismo o la regla, no nombres a nadie; si el slide presenta un escenario, problema o pregunta, sí usa un personaje del roster.

6.7. **Slides explicativas sin personaje hablan al usuario directo.** Cuando un slide explica un concepto sin caso, **no narres en tercera persona** ("el usuario observa que…"). Habla al usuario con lenguaje directo: *"fíjate en…"*, *"la regla es X"*, *"ahora lo aplicas así"*. Mantiene la presencia sin inventar un protagonista artificial.

6.8. **Consistencia gramatical en listas.** Cada valor textual visible (pares de tap-match, pasos de order-steps, opciones de mcq, etiquetas de token en fill-blank/code-completion) sigue la gramática natural: mayúscula inicial cuando es el arranque de una frase, nombres propios respetados. La lista entera mantiene el mismo estilo sin mezclar casos (no poner una opción con mayúscula inicial y la siguiente en minúscula sin razón).

6.9. **En tap-match, `term` siempre es más corto que `def`.** El renderer usa un grid 25%/50% donde la columna del `term` es más angosta. Meter un texto largo ahí rompe el alineado y puede empujar el botón de comprobar fuera del viewport. Regla práctica: `term` ≤ 30 caracteres; `def` puede llegar a 80.
7. Al inicio usar ChatGPT en ejemplos (más popular). No "un asistente" abstracto.
8. Claude-first argumentado (datos, stack, coherencia). No publicitario.
9. Nada de palabras infantiles tipo "trucos". Lenguaje adulto.
9.1. **Nunca usar abreviaciones técnicas sin introducirlas.** La audiencia no es técnica. La primera vez que aparece `API`, `LLM`, `MCP`, `RAG`, `RLS`, etc., se introduce en palabras llanas (*"API — la manera programática de hablarle a un modelo"*). Después de introducida, se puede usar la sigla. Abreviaciones de chat (`msg`, `DM`, `q`) están prohibidas siempre.
10. Orientar antes de preguntar (la slide previa al ejercicio da el marco). **Excepción explícita:** la pregunta-trampa del Engage, por diseño.

11. **Order-steps exige orden estrictamente necesario.** Un ejercicio de ordenar pasos solo es válido si **cada par adyacente tiene una razón causal o lógica para estar en ese orden específico**. Si dos pasos pueden intercambiarse sin cambiar el resultado, no es un problema de ordenar — es una lista de criterios paralelos y va como bullet en un concept slide, no como ejercicio scoreable. **Proxy pre-envío:** antes de crear el ejercicio, Opus debe poder completar *"El paso N debe ir antes del paso N+1 **porque** ___"* para cada par. Si alguna razón se reduce a *"para que se vea ordenado"* o *"porque sí"*, el ejercicio está mal clasificado — conviértelo en bullets o reemplázalo por un mcq/tap-match que sí capture la relación real.

12. **Trampas de mcq deben ser robustas contra AI moderno Y exigir pensamiento adulto.** El misconception que explota la pregunta-trampa (Engage) o cualquier mcq conceptual debe cumplir **dos pruebas**:

    **a) Robustez técnica** — La respuesta incorrecta debe ser inequívocamente incorrecta en 2026. Si un usuario puede defender la respuesta "mala" con *"pero ChatGPT ahora puede buscar en internet / ver imágenes / usar herramientas"*, la pregunta está rota. **Zonas seguras:** datos privados no públicos, matemática que el modelo puede inventar, detalles específicos pedidos sin web search activado. **Zonas grises a evitar:** *"¿quién es el mejor X de mi colonia?"* (web search lo resuelve), *"¿qué dice esta imagen?"* (multimodal lo resuelve).

    **b) Altura intelectual** — El misconception tiene que ser algo que un **adulto no-técnico defendería con confianza genuina**, no una pifia obvia disfrazada de pregunta. Si la respuesta correcta se intuye por descarte o porque las otras opciones suenan absurdas, la trampa no enseña nada — condesciende. El objetivo es que el alumno responda mal *con convicción* antes de que la corrección aterrice.

    - **Ejemplos que pasan ambas pruebas:** *"un token es una palabra"* (intuitivo pero falso: *"Platzi"* son 3 tokens); *"el modelo te avisa cuando no sabe"* (se asume humanización, es falso); *"más contexto siempre mejora la respuesta"* (falso: ventana de contexto degrada al final); *"un prompt más largo siempre es mejor"* (falso: dilución de instrucción).
    - **Ejemplos que fallan (demasiado tontos):** *"¿itera tiene videos o ejercicios?"* (se resuelve mirando el curso), *"¿la AI aprende cuando le enseñas?"* (pregunta mecánica básica sin tensión real).
    - **Prueba pre-envío:** *"¿un adulto inteligente que nunca ha usado AI puede defender con convicción la respuesta incorrecta?"* Si no, sube la barra.

13. **Markdown inline solo en `body` y `explanation`.** El renderer solo aplica markdown (`**bold**`, `*italic*`, bullets) en dos campos: `body` de concept/concept-visual (vía `renderMarkdownBody`) y `explanation` de cualquier ejercicio (vía `renderInlineMarkdown`). En **todo lo demás** — `title`, `prompt`, `statement`, `options[].text`, `steps[]`, `pairs[].term`/`def`, `tokens[]`, `sentenceBefore`, `sentenceAfter` — el JSON se renderiza **tal cual**, así que `*algo*` y `**algo**` aparecen literal con asteriscos visibles.
    - **Regla de autor:** nunca metas `*...*` ni `**...**` en los campos no-soportados.
    - **Emphasis alternativo en esos campos:** usa comillas dobles (`"hazme un párrafo"`), cursivas tipográficas del español con comillas simples, o reformula la frase para que el énfasis sea sintáctico (p. ej. *"le dio otro párrafo distinto"* → *"le dio un párrafo completamente distinto"*).
    - **Títulos (`title`):** el componente `<Title>` ya los renderiza extrabold por default. `**bold**` dentro es redundante y visible como asteriscos. Si necesitas un acento tipográfico dentro de un título, reformula o parte el concepto en dos slides — no intentes meter énfasis inline.

14. **Lecciones autocontenidas. Cero callbacks cross-lección.** Cada lección debe funcionar tomada en cualquier orden, sin referencias a personajes, situaciones o slides de otras lecciones. El único callback permitido es **dentro de la misma lección** (Engage ↔ Evaluate), que es parte fundamental del patrón de hypercorrection. **Recap de sección**, si existe, apunta a **conceptos aprendidos** (*"ya viste tokens, ventana de contexto y alucinación"*), nunca a personajes (*"recuerdas a María de la lección 2"*).
    - **Razones pedagógicas:** la ruta personalizada del curso arma cursos custom eligiendo lecciones según el input del usuario. Si una lección referencia otra que el usuario no tomó, el callback rompe la narrativa. Lecciones autocontenidas = ruta personalizada viable.
    - **Razones técnicas:** generadores automáticos (`/generate-lecture` skill futura) escriben una lección por vez. Sin memoria cross-lección el prompt al modelo es tractable (input: `lecture_title` + `bloom_verb` → output: 10 slides). Con memoria cross-lección, el prompt debe cargar contexto de 20+ lecciones previas y la probabilidad de error crece exponencialmente.
    - **Test pre-envío:** si sacaras esta lección del curso y la pusieras sola en un landing page, ¿sigue funcionando igual de bien? Si no, rompe la regla — quita las referencias cruzadas.

---

## 4. Personajes

### 4.1 Roster de nombres (efecto Coca-Cola)
Rota personajes entre slides para maximizar la probabilidad de que el usuario vea su propio nombre o uno cercano. No inventes personajes nuevos fuera del roster.

**Roster base (30 nombres LATAM diversos):**

María · Diego · Lucía · Tomás · Paola · Rodrigo · Sofía · Andrés · Valeria · Jorge · Ana · Carlos · Mariana · Pablo · Sebastián · Camila · Fernanda · Luis · Renata · Emilio · Daniela · Gabriel · Natalia · Ricardo · Ximena · Javier · Isabella · Mauricio · Alejandra · Samuel.

### 4.2 Variable `{user_first_name}` — self-reference effect
**Fundamento:** Symons & Johnson (1997, meta-análisis, d ≈ 0.5) — Self-reference effect: información asociada con uno mismo se retiene significativamente mejor. Replicado en e-learning: Hou (2014), Van Dijck (2019).

**Aplicación técnica:** el string `{user_first_name}` en el JSON de un slide se reemplaza al render por el nombre del usuario autenticado. Funciona en `title`, `body`, `prompt`, `statement`, `options[].text`, etc.

**Cuándo usarlo:**
- **Engage** (pregunta-trampa, slide 1): **siempre roster**. El Engage monta un escenario narrativo fuerte con personaje + situación + misconception. Meter el nombre del usuario ahí rompe la distancia que hace la hypercorrection memorable.
- **Explore / Explain**: roster por default. `{user_first_name}` solo si el slide es un callout directo al usuario, no una narrativa de tercera persona.
- **Elaborate / Evaluate**: aquí puedes usar `{user_first_name}` en contextos genéricos (recibir un PDF, redactar un correo, decidir qué modelo usar). En contextos específicos (un rol narrativo fijo — "dueño de cafetería que vende frappés") sigue siendo roster.

**Regla de decisión:** si el escenario funciona con cualquier persona anónima del mundo, puedes usar `{user_first_name}`. Si el personaje necesita un rol, oficio o historia específica para que el ejercicio tenga sentido, usa roster.

---

## 5. Anatomía de una lección

### 5.1 Tipos de slide (11 vivos + 1 deferido)

**Informativas (sin respuesta correcta):**
- Concepto — título + body corto
- Concepto visual — con SVG/diagrama
- Celebración — cierre: emoji, XP, racha, confeti

**Ejercicios (evalúan):**
- Opción múltiple — una correcta
- Opción múltiple — varias correctas
- Verdadero / falso
- Completar el hueco (con fichas, no escritura libre)
- Ordenar pasos
- Emparejar (dos columnas)
- Completar código
- Escribir un prompt (auto-verificación)

**Deferido:** prompt evaluado por AI (pendiente por costo de API por llamada).

**Nota sobre "escribir un prompt (auto-verificación)":** este tipo **no forma parte del algoritmo por defecto**. Se reserva para lecciones cuyo skill *enseñado* sea específicamente escribir prompts (cursos de prompting avanzado), y aun ahí requiere una rúbrica determinista atada a la lección concreta — nunca el analizador genérico. Razones para excluirlo por defecto: (1) la calificación puede contradecir la lección recién dada, (2) costo de tokens si se conecta a un LLM real, (3) es redundante con mcq/order-steps/tap-match, que ya hacen retrieval practice con scoring determinista.

### 5.2 Mapeo de slides por fase

| Fase | Slides | Tipos permitidos |
|---|---|---|
| Engage | 1 | Opción múltiple una correcta (pregunta-trampa, 3 opciones) |
| Explore | 1–2 | Concepto, concepto visual |
| Explain | 1–2 | Concepto + (V/F o completar el hueco) |
| Elaborate | 3–5 | OM varias correctas, ordenar pasos, emparejar, completar código, escribir prompt |
| Evaluate | 2 | OM una correcta (callback a Engage) + celebración |

**Total: 10 slides por lección (fijo en MVP).** Los rangos por fase permiten balance conceptual vs procedimental. Subir a 11–12 slides solo se justifica si el tema requiere un worked example extra; si crece más, la lección probablemente debe dividirse en dos.

### 5.3 Distribución por ruta cognitiva

**Ruta conceptual** (Bloom: Recordar / Entender)
- Engage 1 · Explore 2 · Explain 2 · Elaborate 3 · Evaluate 2 = 10 slides
- Ratio: 4 explicación / 6 ejercicios

**Ruta procedimental** (Bloom: Aplicar / Analizar)
- Engage 1 · Explore 1 · Explain 1 · Elaborate 5 · Evaluate 2 = 10 slides
- Ratio: 2–3 explicación / 7–8 ejercicios
- **Regla especial:** en Elaborate, el primer ejercicio debe ser un worked example completo (muestra la solución paso a paso) antes de ejercicios abiertos.

---

## 6. Caso canónico: pregunta-trampa

Para toda lección, Opus debe generar el Engage bajo estas restricciones:

- Personaje con nombre del roster (sección 4.1) y contexto cotidiano.
- Situación real del día a día (cafetería, taller, oficina, hobby, familia no íntima).
- Pregunta con 3 opciones donde la intuitiva es incorrecta.
- La "trampa" apuesta contra el **misconception más común** del principiante, no contra trucos de redacción.
- La respuesta correcta debe revelar el mecanismo real que la lección nombrará formalmente más adelante.

**Ejemplo conceptual — lección "qué es RAG":**

> María tiene una cafetería. Le pregunta a ChatGPT: *"¿Cuántos frappés vendimos la semana pasada?"*
>
> ChatGPT responde con seguridad: *"Vendieron 247 frappés."*
>
> ¿Qué pasó?
> - a) ChatGPT consultó la caja registradora
> - b) ChatGPT se inventó un número creíble
> - c) ChatGPT le preguntó al empleado

**Ejemplo procedimental — lección "cómo escribir un prompt efectivo":**

> Diego acaba de abrir su taller mecánico y quiere un post de LinkedIn anunciando sus servicios.
>
> Le escribe a ChatGPT: *"Escríbeme un post de LinkedIn sobre mi taller."*
>
> ChatGPT le da un post genérico, que podría ser de cualquier taller del mundo, sin mencionar nada de lo que hace especial al suyo.
>
> ¿Cuál es el problema más importante?
> - a) ChatGPT no entiende bien de talleres mecánicos
> - b) Diego no le dijo a ChatGPT qué incluir ni para quién
> - c) LinkedIn detecta los posts escritos con AI y los penaliza

**Diferencia de patrón según ruta cognitiva:**

- **Conceptual:** persona pregunta → AI responde confiado → *"¿qué pasó?"* (diagnóstico hacia atrás)
- **Procedimental:** persona hace algo → obtiene mal resultado → *"¿cómo se arregla?"* (acción hacia adelante)

Ambos comparten estructura base: situación cotidiana + misconception común + revelación del mecanismo real que la lección nombrará formalmente más adelante.

---

## 7. Rubric de auto-review

Antes de entregar una lección, Opus debe verificar estos diez puntos. Si falla alguno, regenera.

1. ¿La lección abre con ejercicio (fase Engage), no con concepto o explicación? *Excepción intencional a la regla de forma #10; el Engage funciona por hypercorrection y no necesita orientación previa.*
2. ¿Cada concepto introducido se prueba al menos una vez dentro de la misma lección? *Un "concepto" = una idea nombrable (ej: **alucinación**, **token**, **ventana de contexto**, **los 4 ingredientes del prompt**). "Probarlo" = al menos un slide scoreable que evalúe comprensión directa — reconocerlo en un escenario nuevo, no recordar su nombre.*
3. ¿El callback final demuestra que el usuario ahora entiende lo que al inicio no entendía, o es simple repetición de la pregunta inicial?
4. ¿El usuario sale con algo concreto aplicable en las próximas 24 horas? *"Concreto" = al menos uno de: un **prompt listo para copiar y pegar**, una **decisión tomada** (qué modelo elegir, qué flujo seguir), un **checklist o bucle repetible** (ej: los 4 ingredientes del prompt, el bucle AI-literate). Si la lección termina con "ahora ya sabes X" sin producir uno de esos tres outputs, no cumple.*
5. ¿Se respetaron las 10 reglas de forma?
6. ¿La ratio explicación/ejercicio corresponde al verbo Bloom del objetivo?
7. ¿El lenguaje es adulto, claro, sin hacerse el cool?
8. ¿Los escenarios son evergreen y universales (nunca médicos, financieros, personales íntimos)?
9. ¿La pregunta-trampa del Engage cumple presencia y calidad — existe, es una situación cotidiana con misconception genuino del principiante, es opción múltiple con 3 opciones, y no es trivia ni respuestas rebuscadas?
10. ¿Hay variedad de exercise types a lo largo de la lección (anti-habituación)? — *evaluación cualitativa, sin umbral fijo; endurecer si los datos lo piden.*

---

## 8. Backlog (no implementar aún)

- Conexión con API/CLI de OpenAI, Anthropic, Google (ejecución asistida estilo OpenClaw).
- Métrica de outcome: self-report de aplicación al día siguiente.
- Índice de conceptos introducidos por lección (concept_id ↔ lecture_id ↔ slide_id) para que el spaced retrieval cross-lección sea operacional y no aspiracional.
- Ruta mixta avanzada (Bloom: Evaluar / Crear) sin diseñar en detalle.
- Prompt evaluado por AI (activar cuando el producto escale).
- Skill `/generate-lecture` para Claude Code que tome `lecture_title` + `bloom_verb` y genere los 10-12 slides siguiendo este contrato + `docs/SLIDE_SCHEMA.md`.

---

**Versión:** 0.11 — Ajustes desde v0.10 (feedback de uso real sobre intro renderizada): **regla 1** derogada — ya no se exige todo minúsculas; se usa gramática natural del español (mayúscula al inicio de oración, nombres propios, siglas técnicas). Títulos de lecciones y secciones en *Sentence case*. **Regla 12 endurecida** — las pregunta-trampas ahora deben pasar DOS pruebas: robustez técnica (incorrecta en 2026) + altura intelectual (un adulto no-técnico la defendería con confianza genuina). Se rechaza trivia disfrazada tipo *"¿itera tiene videos o ejercicios?"*. **Regla 6.8 reformulada** — consistencia gramatical en lugar de mayúscula inicial forzada. Eliminada la sección de introducción del curso (meta-lecciones sobre el formato tienden a condescender); ahora son 10 secciones × 100 lecciones empezando por fundamentos.

v0.10 — Ajustes desde v0.9 (pivote a arquitectura 10 secciones × 100 lecciones con ruta personalizada): **regla 14** nueva — lecciones autocontenidas, cero callbacks cross-lección. El único callback permitido es dentro de la misma lección (Engage ↔ Evaluate). Recap de sección, si existe, apunta a conceptos no a personajes. Razones: (1) ruta personalizada solo funciona si una lección cae en cualquier orden, (2) generadores automáticos escriben una lección por vez sin memoria cross-lección, lo que hace el prompt tractable.

v0.9 — Ajustes desde v0.8 (feedback de render real sobre L2): **regla 13** nueva — markdown solo vive en `body` y `explanation`; en todos los demás campos el JSON se renderiza literal, así que `*...*` y `**...**` aparecen con asteriscos visibles. Para emphasis en título/prompt/opciones/pairs/tokens/steps usar comillas o reformular. **Proxy de regla 6.5** apretado de ≤200 a ≤180 chars — el renderer rompe ~60 chars/línea y 200 se iba a 4 renglones en casos con palabras largas. **Renderer:** `renderMarkdownBody` y `renderInlineMarkdown` extendidos para soportar `*italic*` además de `**bold**` (antes solo bold, por eso *recuerda* aparecía literal en body).

v0.8 — Ajustes desde v0.7 (feedback de uso real sobre L1): **regla 11** order-steps solo es válido si cada par adyacente tiene causa/lógica que justifique el orden exacto; si dos pasos pueden intercambiarse, no es ordering — es lista paralela, va como bullets · **regla 12** trampas de mcq deben ser robustas contra capacidades 2026 de ChatGPT (web search, multimodal, tools); escenarios tipo *"el mejor electricista de mi colonia"* están rotos porque web search los resuelve. Zonas seguras documentadas: datos privados internos, matemática inventada, sin-web-search.

v0.7 — Consolidación: absorbida la memoria personal `MEMORY.md` + 4 feedback files (body_copy, miyagi_pedagogy, scenarios, no_creative_fixes) para que este documento sea la **única fuente de verdad pedagógica**. Contenido migrado: **regla 4** ahora incluye tabla ❌ vs ✅ de escenarios + explicación de narrative transportation · **regla 9.1** nueva: nunca usar abreviaciones técnicas (API, LLM, MCP, RAG, RLS) sin introducirlas primero en palabras llanas · **sección 5.1** aclaración: "escribir un prompt (auto-verificación)" no forma parte del algoritmo por defecto; reservado para cursos de prompting con rúbrica determinista.

v0.6 — Ajustes desde v0.5 (feedback UX sobre lecciones renderizadas): **regla 6.7** slides explicativas sin personaje hablan al usuario directo (no narrar en tercera persona cuando no hay caso) · **regla 6.8** mayúscula inicial consistente en todo valor textual visible (tap-match, order-steps, opciones de mcq, tokens) · **regla 6.9** en tap-match, `term` siempre ≤ `def` para que el grid 25/50 del renderer no rompa el alineado.

v0.5 — Ajustes desde v0.4 (feedback de uso real): **regla 6.5** casos dentro de preguntas ≤ 3 renglones (óptimo 2, ideal 1, 4 inaceptable; proxy ≤ 200 chars de setup) · **regla 6.6** personajes solo en casos/problemas, no en slides puramente explicativas · bonus técnico: en tap-match el campo `term` siempre debe ser más corto que `def` (grid 25%/50% del renderer).

v0.4 — Ajustes desde v0.3 (Codex review): total de slides fijo a 10 con rangos coherentes entre 5.2 y 5.3 · tiebreaker explícito conceptual vs procedimental por test de éxito · regla clara de cuándo usar roster vs `{user_first_name}` (Engage siempre roster, Elaborate/Evaluate según contexto genérico/específico) · 3 sub-patrones del Engage documentados para evitar template fatigue · rubric #2 y #4 operacionalizados con criterio auditable · proxies renderer-independent para "2-3 renglones" (≤ 250 chars / 45 palabras).

Desde v0.2: Engage restringido a opción múltiple (no V/F por lotería) · roster de 30 nombres + variable `{user_first_name}` con self-reference effect · check #10 del rubric cualitativo sin umbral · backlog expandido con índice de conceptos para spaced retrieval operacional.
