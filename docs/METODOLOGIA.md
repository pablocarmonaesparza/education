# Metodología Itera — v0.3

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

### 2.3 Auto-clasificación vía Bloom
Opus identifica el verbo dominante del learning objective y ajusta automáticamente la ratio explicación/ejercicio. No se le dice qué tipo de lección es; él lo descubre.

| Verbo Bloom | Tipo de ruta | Ratio explicación / ejercicio | Estrategia dominante |
|---|---|---|---|
| Recordar / Entender | Conceptual | 40 / 60 | Inducción + hypercorrection |
| Aplicar / Analizar | Procedimental | 25 / 75 | Progressive fading: worked example completo → completion task → problema abierto |
| Evaluar / Crear | Mixta avanzada | 30 / 70 | Casos + aplicación directa, con fading incorporado |

**Nota sobre los ratios:** son defaults operativos, no hallazgos de research. Funcionan como forcing function para mantener consistencia entre lecciones y constreñir la libertad creativa de Opus. Se ajustarán con datos reales de uso. Lo que sí está research-backed es el patrón de progressive fading (Sweller, Renkl) y la superioridad de worked examples sobre problem-solving para novices en tareas procedimentales (meta-análisis Barbieri, Clerjuste & Chawla, 2023: ~30% mejor retención en tests diferidos).

### 2.4 Spaced retrieval obligatorio
**Fundamento:** Butterfield et al. — el efecto hypercorrection decae después de una semana si no se refuerza.

**Aplicación:** cada concepto debe probarse (a) dentro de la misma lección donde se introduce, y (b) en al menos una lección posterior dentro de la misma unidad temática.

---

## 3. Reglas de forma

1. Títulos en minúsculas.
2. Bodies gramaticales, sin abreviaciones, para audiencia no técnica.
3. Inducción: experiencia → lógica → nombre. Nunca definir primero.
4. Escenarios evergreen, fun, universales. Nunca médicos, financieros o personales íntimos.
5. Máximo 2-3 renglones de body. Preferir 10 slides cortas a 3 largas.
6. Excepción: bullets o ejemplos enumerados pueden tener más renglones.
7. Al inicio usar ChatGPT en ejemplos (más popular). No "un asistente" abstracto.
8. Claude-first argumentado (datos, stack, coherencia). No publicitario.
9. Nada de palabras infantiles tipo "trucos". Lenguaje adulto.
10. Orientar antes de preguntar (la slide previa al ejercicio da el marco). **Excepción explícita:** la pregunta-trampa del Engage, por diseño.

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
- **Contexto genérico** (cualquier persona podría estar en esa situación — recibir un PDF largo, redactar un correo, pedirle algo a ChatGPT): puedes usar `{user_first_name}` en lugar de un nombre del roster.
- **Contexto específico** (un rol narrativo fijo — "María, dueña de cafetería que vende frappés"): usa un nombre del roster. Meter el nombre del usuario como "dueño de cafetería" rompe inmersión si no lo es.

**Regla:** el generator puede elegir entre roster y `{user_first_name}` según el contexto. No hay cuota obligatoria.

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

### 5.2 Mapeo de slides por fase

| Fase | Slides | Tipos permitidos |
|---|---|---|
| Engage | 1 | Opción múltiple una correcta (pregunta-trampa, 3 opciones) |
| Explore | 1–2 | Concepto, concepto visual |
| Explain | 2–3 | Concepto + (V/F o completar el hueco) |
| Elaborate | 3–4 | OM varias correctas, ordenar pasos, emparejar, completar código, escribir prompt |
| Evaluate | 2 | OM una correcta (callback a Engage) + celebración |

**Total: 10–12 slides por lección.**

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
2. ¿Cada concepto introducido se prueba al menos una vez dentro de la misma lección?
3. ¿El callback final demuestra que el usuario ahora entiende lo que al inicio no entendía, o es simple repetición de la pregunta inicial?
4. ¿El usuario sale con algo concreto aplicable en las próximas 24 horas?
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

**Versión:** 0.3 — Ajustes desde v0.2: Engage restringido a opción múltiple (no V/F por lotería) · roster de 30 nombres + variable `{user_first_name}` con self-reference effect · check #10 del rubric cualitativo sin umbral · callout en check #1 sobre excepción a regla de forma #10 · `SKILL.md` siguiente paso movido al backlog · backlog expandido con índice de conceptos para spaced retrieval operacional.
