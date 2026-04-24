# Evaluate slides audit — gap entre METODOLOGIA y contenido real

> Audit empírico ligado a la decisión **Wish List #18** (retos rebuild vs eliminar vs restaurar capa de deliverable).
> **Pregunta que responde**: ¿las lecciones actuales ya entregan "ejecución real aplicable en 24h" como mandata METODOLOGIA Rubric #4, o hay un gap?
> **Fecha**: 2026-04-23. **Autor**: Wish List agent. **Scope**: 100/100 lecciones publicadas en `content/lessons/`.

---

## 1. TL;DR (ejecutivo)

- **Codex tenía razón, con un matiz**: Evaluate slides NO reemplazan la función de "ejecución"; son retrieval practice.
- **El gap no es ausencia de retos — es incumplimiento de METODOLOGIA**. El propio Rubric #4 exige deliverable concreto en cada lección. En el muestreo: **0/5 lecciones cumplen plenamente**.
- **Implicación para #18**: el debate "rebuild retos vs no" oculta una opción más barata — **rewrite de las 100 celebration slides para que cumplan Rubric #4**. Sin rebuild, sin schema change, sin feature nueva.

---

## 2. Metodología del audit

**Fuentes**:
- `docs/METODOLOGIA.md` §5.2 (mapeo de slides por fase) + §7 (Rubric de auto-review, ítem #4).
- `content/lessons/*.json` (100 archivos, scan con node).
- 5 lecciones leídas en detalle: cross-sección (prompting × 2, cold email, vibe coding, MCP).

**Definiciones operativas**:
- **Rubric #4 PASS**: la lección produce al menos uno de {prompt copy-paste, decisión explícita tomada, checklist/bucle con nombre propio}, entregado como **artefacto en slide** (no como exhortación "aplícalo hoy").
- **Rubric #4 PARTIAL**: la lección nombra la forma del deliverable (ej. "los 4 ingredientes") pero no lo entrega listo para usar.
- **Rubric #4 FAIL**: la celebration es pura "ahora ya sabes X" sin checklist, prompt, ni decisión.

---

## 3. Datos cuantitativos (scan 100/100 lecciones)

| Métrica | Valor |
|---|---|
| Total lecciones | 100 |
| Evaluate = `mcq + celebration` | **100/100 (100%)** |
| Última slide = `celebration` | **100/100 (100%)** |
| Lecciones con `build-prompt` (prompt production) | 5/100 (5%) |
| Lecciones con `code-completion` | 7/100 (7%) |
| Lecciones con `order-steps` (checklist interactivo) | 23/100 (23%) |
| Lecciones con `tap-match` (emparejar) | 100/100 (100%) |
| Lecciones con `ai-prompt` (evaluación LLM) | 0/100 (0%) |

**Lectura**: el arsenal usado es dominante en retrieval (mcq, tap-match). Las unidades de producción (`build-prompt`, `code-completion`) están infrautilizadas.

---

## 4. Análisis cualitativo — 5 lecciones muestreadas

### 4.1 `07-los-4-ingredientes-del-prompt.json`

> **Celebration body**: *"Tienes la receta para que un prompt salga bien al primer intento: rol, tarea, contexto, formato. Pruébala hoy con un caso real tuyo."*

- Nombra un checklist (4 ingredientes). Positivo.
- Pero no entrega un **template** copiable que contenga esos 4 ingredientes aplicados.
- "Pruébala hoy" = exhortación, no deliverable.
- **Rubric #4: PARTIAL** — checklist nombrado, artefacto ausente.

### 4.2 `08-iterar-un-prompt.json`

> **Celebration body**: *"Ya sabes convertir un output tibio en algo publicable en minutos: leer, identificar, pedir cambio específico. Hoy puedes iterar tu próximo correo en 3 pasos en vez de pelearlo a mano."*

- Nombra un bucle de 3 pasos. Positivo.
- No hay worked example guardado, ni una versión "antes/después" que el user pueda reusar.
- **Rubric #4: PARTIAL** — bucle nombrado, sin artefacto.

### 4.3 `10-08-cold-email-ai.json`

> **Celebration body**: *"Ya puedes redactar correos de ventas que sí consiguen reuniones."*

- Sin checklist. Sin template. Sin decisión explícita.
- Afirmación de capacidad sin base empírica — precisamente el anti-patrón que METODOLOGIA §7.4 prohíbe: *"si termina con 'ahora ya sabes X' sin producir uno de esos tres outputs, no cumple"*.
- **Rubric #4: FAIL**.

### 4.4 `9-01-que-es-vibe-coding.json`

> **Celebration body**: *"Ya entiendes qué es vibe coding, qué desbloquea y qué sigue exigiendo criterio. Hoy puedes describir una mini-app personal en tres frases y elegir la herramienta que encaje."*

- "Describir en 3 frases + elegir herramienta" es micro-tarea.
- Decisión implícita ("elegir la herramienta"), pero sin la tabla de decisión que respalde esa elección.
- **Rubric #4: PARTIAL** — decisión gesticulada, sin artefacto guía.

### 4.5 `11-01-que-es-mcp.json`

> **Celebration body**: *"Tienes la pieza más importante del stack AI 2026. La siguiente lección: escribe tu primer MCP server."*

- Cliffhanger a la siguiente lección.
- Sin checklist, sin decisión, sin artefacto.
- **Rubric #4: FAIL**.

### 4.6 Resumen de muestra

| Lección | Rubric #4 |
|---|---|
| 4 ingredientes del prompt | PARTIAL |
| Iterar un prompt | PARTIAL |
| Cold email con AI | FAIL |
| Qué es vibe coding | PARTIAL |
| Qué es MCP | FAIL |

**Tasa de cumplimiento en muestra**: PASS 0/5, PARTIAL 3/5, FAIL 2/5.

---

## 5. La brecha METODOLOGIA ↔ contenido

METODOLOGIA §7 Rubric #4 (citado verbatim):

> *"¿El usuario sale con algo concreto aplicable en las próximas 24 horas? 'Concreto' = al menos uno de: un prompt listo para copiar y pegar, una decisión tomada (qué modelo elegir, qué flujo seguir), un checklist o bucle repetible. Si la lección termina con 'ahora ya sabes X' sin producir uno de esos tres outputs, **no cumple**."*

El contenido empírico:

- Los 2 slides de Evaluate son mcq callback + celebration en 100/100 lecciones (spec correcta).
- Pero la **spec de la celebration slide** (donde el deliverable debería vivir) no está aplicada con rigor. Muchas celebraciones son "ahora ya sabes X" puras.
- Resultado: la tesis "retención + ejecución, no información" (CONTEXT.md:13) se compromete en el producto real.

---

## 6. Implicación para Wish List #18

El framing original era **binario**: rebuild retos o eliminar retos. Codex propuso un tercer frame: restaurar capa de deliverable como unidad nueva de producto. Este audit sugiere un **cuarto frame más barato**:

### Opción 4 (emergente): rewrite de las 100 celebration slides para cumplir Rubric #4

- **Qué cambia**: el body de las 100 celebration slides se rewrita para incluir al menos uno de {prompt template copiable, decisión con criterio, checklist nombrado con pasos ejecutables}.
- **Qué NO cambia**: no se reintroduce retos-as-feature. No se agrega slide kind nuevo. No se toca schema. No se rebuild el pipeline de generación de deliverables eliminado en `d146ed7`.
- **Riesgo**: bajo. Content-only, reversible, no afecta arquitectura.
- **Esfuerzo**: S-M (1-2 semanas con asistencia AI + Pablo curando). 100 rewrites × ~15 min con plantilla estructurada.
- **Alineación con tesis**: alta — el deliverable en 24h es literalmente lo que Itera promete en CONTEXT.md:13.
- **Compatibilidad con Open Claw**: lecciones avanzadas (secs 7-8) podrían elevar el deliverable a "prompt ejecutado con tu API key" una vez que Open Claw exista. Pero el MVP de Opción 4 ya entrega valor sin Open Claw.

### Cómo esta opción reencuadra #18

| | Opción 1 (ratificar) | Opción 2 (capa deliverable) | Opción 3 (congelar) | **Opción 4 (rewrite celebration)** |
|---|---|---|---|---|
| Honra decisión `d146ed7` | ✅ | ⚠️ similar a retos 2.0 | ✅ | ✅ |
| Cumple Rubric #4 | ❌ | ✅ | ❌ (aplaza) | ✅ |
| Scope | 0 | L | 0 | S-M |
| Requiere schema / feature nueva | ❌ | ✅ | ❌ | ❌ |
| Reversible | sí | no fácil | sí | sí (git) |
| Alinea producto con tesis | ❌ | ✅ | aplaza | ✅ |

**Recomendación reformulada (mía, post-audit)**: Opción 4 como ejecución, Opción 3 como decisión estratégica paralela.

1. **Ahora**: rewrite de las 100 celebration slides con criterio Rubric #4 explícito. Ataca el gap real, no la sombra del gap.
2. **En paralelo**: "adoptamos PostHog" + 4 semanas de data. Luego decides si Opción 2 (capa deliverable con schema propio) todavía hace falta **con evidencia**.
3. **#18 queda congelado con criterio**: "se reconsidera si post-rewrite + 4 semanas de data muestran que los users NO aplican el deliverable (completion alta pero retention/ejecución baja)".

---

## 7. Limitaciones honestas de este audit

- Muestra de 5 lecciones para análisis cualitativo (5% del total). Mayor confianza requeriría leer las 100. Data cuantitativa sí cubre 100/100.
- No medí retención real ni feedback de usuarios. Sin esto, "Rubric #4 FAIL" es una señal de diseño, no de product-market outcome.
- Asumo que Pablo firma Rubric #4 como estándar. Si él considera que la versión actual de celebration es suficiente "por ahora", la Opción 4 deja de ser obvia.
- No auditada: si los slides de Elaborate (3-5 por lección) compensan el gap entregando el deliverable antes. Scan rápido sugiere que `build-prompt` (5/100) y `code-completion` (7/100) son las únicas slides con "producción"; el resto es retrieval.

---

## 8. Siguientes pasos

- **Para Pablo**: leer este audit + decidir si Opción 4 reemplaza el debate original (1/2/3). No requiere codex round 2 si convences.
- **Para Wish List tracker**: actualizar #18 con las 4 opciones y el criterio de freeze sugerido por codex ("4 semanas de data O 50 usuarios activos").
- **Para Content agent / Education** (si ellos ejecutan Opción 4): plantilla de rewrite de celebration slide con placeholders {tipo de deliverable, template/decisión/checklist, caso aplicable en 24h}.

---

## 9. Template para rewrite de celebration (para el pilot)

Propuesta de estructura fija para la celebration slide cuando se ejecute la Opción 4. Tres bloques, en orden:

```
CELEBRATION SLIDE — BODY TEMPLATE (Rubric #4 compliant)

[1. ancla de cierre — 1 línea]
    "ya sabes X." / "ya tienes el criterio para Y."
    (opcional, si aporta; puede omitirse si el tipo de deliverable ya se explica solo)

[2. EL DELIVERABLE — obligatorio, uno de estos tipos]
    • tipo A — plantilla copiable:
        "copia y pega esto la próxima vez que necesites Z:"
        ```
        rol: [eres X]
        tarea: [haz Y]
        contexto: [datos, audiencia, tono]
        formato: [longitud, estructura]
        ```

    • tipo B — decisión explícita con criterio:
        "para elegir entre X/Y/Z, usa este criterio:"
        - si tu caso tiene A → elige X
        - si tu caso tiene B → elige Y
        - por defecto → elige Z

    • tipo C — checklist / SOP repetible:
        "la próxima vez que hagas X, sigue estos pasos:"
        1. [paso ejecutable en <30 seg]
        2. [paso ejecutable]
        3. [paso ejecutable]

    • tipo D — prompt final producido:
        "tu prompt queda así:"
        ```
        [el prompt completo armado a lo largo de la lección]
        ```

[3. disparador de aplicación — 1 línea]
    "aplícalo hoy/mañana en [escenario de trabajo concreto del user]."
```

**Reglas del template**:

- **Obligatorio**: bloque 2 (deliverable tangible). Sin uno de los 4 tipos, la slide no es válida por Rubric #4.
- **Prohibido**: "ahora ya sabes X" + "pruébalo" solos (como hoy 40% de las lecciones).
- **Longitud máx del deliverable**: ≤ 350 chars visibles (cabe en una slide sin scroll en mobile).
- **Aplicabilidad real**: el escenario del bloque 3 debe ser evergreen de oficina LATAM (reporte, correo, decisión de proveedor, etc.). Ver METODOLOGIA §4 (audiencia).

**Ejemplo aplicado a `07-los-4-ingredientes-del-prompt.json`** (que hoy es PARTIAL):

**Antes**:
> *"Tienes la receta para que un prompt salga bien al primer intento: rol, tarea, contexto, formato. Pruébala hoy con un caso real tuyo."*

**Después (tipo A — plantilla copiable)**:
> *"copia esta plantilla la próxima vez que necesites un prompt que funcione al primer intento:*
> ```
> rol: [qué es el modelo — ej. "gerente de marketing"]
> tarea: [qué quieres — ej. "escribe un correo"]
> contexto: [para quién, tono, datos — ej. "a mi equipo pidiendo puntualidad"]
> formato: [longitud, estructura — ej. "4 renglones, tono directo"]
> ```
> *úsala mañana en el primer correo que te dé flojera redactar."*

**Ejemplo aplicado a `11-01-que-es-mcp.json`** (que hoy es FAIL):

**Antes**:
> *"Tienes la pieza más importante del stack AI 2026. La siguiente lección: escribe tu primer MCP server."*

**Después (tipo B — decisión con criterio)**:
> *"para conectar AI con una herramienta que uses, decide así:*
> - *si existe MCP oficial (Notion, Gmail, GitHub, Slack) → instala ese.*
> - *si no existe pero la herramienta tiene API REST pública → busca MCP de comunidad.*
> - *si ninguna aplica → escribe tu propio MCP (siguiente lección).*
> *revisa esta semana qué herramienta usas más en tu trabajo y busca su MCP."*

---

## 10. Plan piloto (input para WISHLIST #18c)

1. **Selección de 10 lecciones** diversas cubriendo los 4 tipos de deliverable (3× tipo A prompt, 3× tipo C checklist, 2× tipo B decisión, 2× tipo D prompt final).
2. **Rewrite manual** (Pablo firma) o asistido por LLM con el template arriba.
3. **Review cualitativo**: lecciones pilotadas vs 10 de control (mantienen celebration original). ¿Se siente distinto? ¿El user al terminar tiene algo tangible?
4. **Métrica cualitativa (si #4 instalado)**: tiempo en slide final + clicks / copy events (si se implementa `copy-to-clipboard` sobre el deliverable).
5. **Decisión post-pilot**: si se percibe mejor, rollout a 100/100. Si no, revisar si el problema es de deliverable-shape o de audiencia.

**Esfuerzo estimado**: 1-2 días de rewrite (con asistencia AI) + 1 día de review cualitativo. Total S.

---

**owner**: Wish List (#19 → emergent audit relevante a #18).
**referencias**: `docs/METODOLOGIA.md` §5.2, §7.4; `docs/CONTEXT.md` §1; `content/lessons/*.json` (100 archivos); codex review 2026-04-23 documentado en conversación Wish List agent.
