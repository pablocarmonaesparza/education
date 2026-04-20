# Prompt de inicio para conversaciones sobre Itera

> Copia-pega el bloque de abajo al inicio de **cualquier conversación nueva** con Claude (Claude Code, Claude web, otra herramienta). Le da el contexto mínimo para que no arranque ciego.

---

## 🚀 Prompt corto (default — pégalo al inicio)

```
Voy a trabajar en Itera. Antes de responder nada:

1. Lee `CLAUDE.md` y `docs/CONTEXT.md` de este repo. Son la fuente de verdad del
   design system y del producto. No me dictes su contenido, solo tenlo en cabeza.

2. Si vamos a tocar lecciones o slides, lee también `docs/METODOLOGIA.md`.
   Si tocamos migrations/queries, lee `docs/SCHEMA_v1.md`.

3. Si tienes acceso al MCP de Supermemory, haz `recall` con query
   "Itera decisiones recientes <tema de la sesión>" y usa lo que encuentres
   para no repetir decisiones ya tomadas ni sugerir cosas ya rechazadas.

4. Confírmame en UNA línea qué cargaste y arrancamos.

Reglas de operación conmigo:
- Español informal, directo, sin floripondios.
- Después de cambios de código sube a GitHub (salvo que estemos en rama
  de experimento — pregunta si dudas).
- UI siempre con los componentes y tokens del design system (nunca hex
  inline, nunca depth manual).
- Minúsculas en títulos y bodies gramaticales.
- Moneda en USD.

Ahora te digo qué quiero hacer.
```

---

## 🔬 Prompt largo (usar solo cuando es un trabajo estratégico serio)

Para sesiones sobre pricing, landing, roadmap, expansión a B2B, decisiones de producto grandes — donde quieres que Claude tenga TODO el contexto.

```
Voy a trabajar en Itera en algo estratégico. Quiero que antes de responder:

1. Lee en este orden (en paralelo cuando puedas):
   - `CLAUDE.md` (design system + reglas de operación)
   - `docs/CONTEXT.md` (qué es Itera, audiencia, pricing, roadmap, decisiones
     abiertas)
   - `docs/METODOLOGIA.md` si vamos a tocar lecciones
   - `docs/LESSONS_v1.md` si hablamos del catálogo
   - `docs/SCHEMA_v1.md` si hablamos de base de datos

2. Corre `git log --oneline -20` para ver los últimos commits.

3. Si tienes Supermemory MCP, haz un `recall` amplio:
   query: "Itera decisiones estratégicas pivotes rechazados pricing landing"

4. Ubícate con la info que encontraste:
   - ¿Qué hay en CONTEXT.md que contradiga lo que actualmente muestra la
     landing / el dashboard?
   - ¿Qué decisiones están abiertas (sección 10 de CONTEXT.md) que el tema
     de hoy pueda tocar?
   - ¿Qué hay en el backlog (sección 9) relevante?

5. Antes de proponer nada, preséntame:
   a) Qué entendiste del contexto relevante a la sesión (3-5 bullets).
   b) Qué decisiones abiertas afectan lo que vamos a hacer.
   c) Qué datos faltan que necesites preguntarme.

6. Cuando cierremos la sesión, si hubo decisiones nuevas, guárdalas en
   Supermemory con formato "<mes año> — <área>: <decisión> porque <razón>".
   Si la decisión es estable para repetirse, proponme promoverla a
   `docs/CONTEXT.md` en vez de a memoria fuzzy.

Ahora te digo qué quiero trabajar.
```

---

## 📌 Prompt para cerrar sesión (al final)

Cuando hayas terminado un trabajo significativo y quieras que no se pierda:

```
Antes de que me vaya, consolida lo aprendido:

1. Lista las 3-5 decisiones o aprendizajes clave de esta sesión.

2. Para cada uno, decide:
   - ¿Va a Supermemory? (decisión mediana, 1-3 sesiones de vida útil)
   - ¿Va a un doc de `docs/`? (regla estable, 3+ sesiones de vida útil)
   - ¿Solo va al commit message? (trivial, no rehúsa contexto futuro)

3. Ejecuta lo que corresponda:
   - `memory` con fecha y contexto suficiente
   - `Edit` al doc correspondiente con una sección nueva
   - `git commit` con mensaje informativo

4. Confírmame en una línea qué guardaste y dónde.
```

---

## 🧩 Snippets rápidos

### Al empezar cualquier cosa
```
/itera-context load
```
(si estás en Claude Code con el skill instalado)

### Al terminar
```
/itera-context save
```

### Para buscar en memoria
```
Haz recall en Supermemory: "<tema>"
```

---

**Mantenimiento:** si cambias las reglas de operación o los docs, actualiza
este archivo. Es la única fuente para onboardear un Claude nuevo en 30
segundos.
