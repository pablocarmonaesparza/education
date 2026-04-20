---
name: itera-context
description: Carga el contexto de producto, pedagógico y técnico de Itera antes de trabajar en copy, pricing, landing, lecciones o estrategia. Úsalo al inicio de cada sesión sobre estos temas, y al final para guardar decisiones en memoria persistente. Triggers típicos — "vamos a trabajar en la landing", "actualizar pricing", "crear/editar lecciones", "revisar estrategia", "qué hemos decidido sobre X", "guarda esto en memoria".
---

# Skill: itera-context

Este skill garantiza que cualquier Claude que trabaje en Itera tenga el contexto completo antes de cambiar algo estratégico, y que lo aprendido en la sesión no se pierda.

Tiene **dos modos**: `load` (al inicio) y `save` (al final).

---

## Modo `load` — al iniciar una sesión

Ejecuta estos pasos en orden, **en paralelo cuando sea posible**:

### 1. Leer los documentos de producto

Lee estos archivos del repo antes de responder cualquier cosa estratégica. Resume mentalmente los puntos clave, no le dictes al usuario lo que ya sabe.

| Doc | Siempre | Solo si... |
|---|---|---|
| `docs/CONTEXT.md` | ✅ | — |
| `CLAUDE.md` | ✅ | — |
| `docs/METODOLOGIA.md` | — | vas a crear/editar lecciones o tocar el renderer |
| `docs/LESSONS_v1.md` | — | vas a crear/editar lecciones |
| `docs/SCHEMA_v1.md` | — | vas a tocar migrations o queries de Supabase |

### 2. Hacer `recall` en Supermemory

Ejecuta `mcp__mcp-supermemory-ai__recall` con una query relevante al tema de la sesión:

- Sesión sobre landing → `query: "Itera landing page copy pricing decisiones"`
- Sesión sobre lecciones → `query: "Itera lecciones contenido decisiones pedagógicas"`
- Sesión sobre dashboard → `query: "Itera dashboard UX retos videos decisiones"`
- Sesión genérica → `query: "Itera decisiones recientes iteraciones probadas"`

Si hay memorias relevantes, úsalas para no repetir decisiones ya tomadas.

### 3. Revisar git log reciente

```bash
git log --oneline -20
```

Así sabes qué se commiteó recientemente — a veces una decisión vive solo en un commit message.

### 4. Confirmar brevemente al usuario

Dile al usuario en **una sola línea** qué cargaste. Ejemplo:

> Cargado: `CONTEXT.md` (producto/pricing), últimos 20 commits. Supermemory: 3 memorias sobre landing. Listo.

**No** le vomites el contenido de los docs — él los escribió, los conoce. Solo confirma que los tienes en cabeza.

---

## Modo `save` — al terminar trabajo significativo

Invoca este modo cuando:

- El usuario dice "guarda esto en memoria" / "anota esto"
- Se tomó una decisión estratégica (pricing, roadmap, rechazar una feature)
- Se probó algo y no funcionó (para no volver a intentarlo)
- Se descubrió una convención o preferencia del usuario
- Cerraste una sesión larga con iteraciones valiosas

### Qué guardar en Supermemory (y qué NO)

**✅ Sí guardar:**
- Decisiones con su razonamiento ("decidimos X porque Y, rechazamos Z porque W")
- Experimentos fallidos con diagnóstico
- Preferencias del usuario descubiertas en la sesión
- Cambios de dirección ("pivotamos de videos a ejercicios el día X")
- Conocimiento tribal — cosas que Pablo sabe pero no están documentadas

**❌ NO guardar:**
- Cosas que ya están en `docs/CONTEXT.md` o `METODOLOGIA.md` (duplicación)
- Detalles técnicos de implementación (eso vive en el código y en commits)
- Información sensible (API keys, credenciales, datos privados de clientes)
- "Hoy hicimos X" sin por qué — el git log ya lo dice

### Qué promover a `docs/` en vez de Supermemory

Si una decisión ya es estable y se va a repetir aplicándola, **no** la guardes en Supermemory — **agrégala a `docs/CONTEXT.md`** o al doc específico. Supermemory es para memoria fuzzy de corto-mediano plazo; los docs son para reglas duras permanentes.

Regla heurística: *si esta decisión la voy a tomar en 3+ sesiones futuras, va a `docs/`. Si solo es útil esta vez y en 1-2 sesiones más, va a Supermemory.*

### Cómo guardar

Usa `mcp__mcp-supermemory-ai__memory` con:
- **Un memory por decisión/aprendizaje** (no un mega-dump)
- Fecha en el texto (`abr 2026:` al principio) para temporal reasoning
- Contexto suficiente para que un Claude futuro lo entienda sin más info
- Tag `itera` o `itera-<área>` si el MCP lo soporta

Ejemplo de memoria bien formateada:

> **abr 2026 — decisión sobre landing pricing.** Pablo rechazó mostrar el tier Pro ($199/mes) arriba en la comparativa porque el salto de $19 a $199 se siente brutal y asusta al visitante casual. Decidimos ocultar Pro detrás de un link "ver plan pro para equipos" hasta que tengamos sales team. Revisit en Q3 2026 cuando haya pipeline B2B real.

### Después de guardar

Confirma al usuario con una sola línea:

> Guardado en memoria: 3 decisiones (landing pricing, rechazo de Pro arriba, plan Q3).

---

## Reglas de oro del skill

1. **Nunca empieces a escribir código estratégico (copy, landing, pricing, lecciones) sin correr `load` primero.** Si el usuario dice "vamos a cambiar la landing", responde *"déjame cargar contexto"* y corre `load`.
2. **Guarda pronto, guarda chico.** Mejor 10 memorias atómicas que 1 mega-memoria.
3. **No reproduzcas lo que ya está en docs.** Supermemory complementa, no duplica.
4. **Recall antes de proponer.** Si vas a sugerir algo, primero haz `recall` a ver si ya se propuso y rechazó.
5. **Temporal context en cada memoria** — incluye fecha porque decisiones caducan.
