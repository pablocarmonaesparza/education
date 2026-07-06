# EDUCATIVE_ENGINE_SPEC — el segundo motor, desde el contenido

> **PILAR DEL NEGOCIO — vigente en v1.** Decisión Pablo 2026-07-06 (revisa la del
> 2026-07-02): la capacitación continua ES la retención de la suscripción — "vender
> solo exámenes sin cursos no tiene sentido". El pipeline E1/E2/E3 está OPERABLE
> (workflow `educative-module` + `pack-module.mjs` + MOTOR_RUNBOOK.md; interim
> pablo-007 con Claude como LLM). Superficie del producto: `/aprender`. Cadencia:
> un módulo de tema por semana mínimo.

Spec del motor educativo desde la óptica de contenido y pedagogía. Este doc define
**qué es un módulo educativo, cómo se escribe y cómo enseña**, para que el contenido
sea coherente caso a caso. (Desde 2026-07-02 el repo opera en modo ejecutor único:
Claude Code ejecuta también la parte técnica cuando esto se retome.)

Lectura obligatoria antes: el plan del motor educativo y
`docs/simulador/case_factory/ENGINE_CONTRACT.md`.

## 1. Qué es (y qué no)

El motor educativo es el **segundo motor** de Itera, al lado del operativo:

| | Operativo (existe) | Educativo (este spec) |
|---|---|---|
| Para quién | Una empresa (bespoke) | Todas las empresas (broadcast) |
| Disparador | El conocimiento y la meta de la empresa | Un update del mercado de inteligencia artificial |
| Propósito | Medir criterio bajo presión | Enseñar a usar lo nuevo, con feedback |
| Frescura | Lento, caduca mal | Semanal, la caducidad es el latido |
| Economía | Caro por cliente | Un módulo sirve a todos |

**No es** un curso, un video con quiz, una biblioteca de prompts ni un tutorial
pasivo. Es **práctica activa corta** con los mismos bloques del operativo, que
enseña con feedback inmediato. Si se vuelve "lee esto y responde", falló (regla
anti-regresión de CLAUDE.md).

## 2. La herramienta del primer módulo (elección con criterio)

Primer módulo: **conectores de inteligencia artificial** (conectar ChatGPT,
Claude o similares a tu Drive, correo y base de clientes). Por qué, en dos
líneas: es la capability más **transversal y fresca de 2026** para equipos no
técnicos (research web jun 2026: los conectores y agentes de workspace fueron el
salto del año), y su riesgo central, *qué datos reales expones al conectar*, cae
justo sobre las 6 dimensiones de Itera (datos, juicio, validación sobre todo).
Universal, enseñable con los bloques que ya existen, bajo riesgo para un primer
corte.

Artefactos del ejemplo: `example_brief_connectors_n1.yaml` y
`example_module_connectors_n1.yaml`.

## 3. El brief educativo (input del motor)

~8 campos (contra ~25 del operativo). Ver `example_brief_connectors_n1.yaml`:
`tool_name`, `tool_version`, `what_changed`, `why_matters`, `level (N1/N2/N3)`,
`selected_blocks[]`, `voice_style`, `business_context`, `audience_scope: broadcast`.
Sin empresa, sin escenario bespoke, sin biblia de continuidad.

## 4. El pipeline, desde lo pedagógico (E1 / E2 / E3)

- **E1 · explicar** (1 llamada de inteligencia artificial): produce la pantalla
  de contexto (un `reading_passive` de ~300 palabras): qué es, qué cambió, qué
  puede, qué no puede, los riesgos, por qué importa. Es la única parte expositiva
  y es corta. Prompt en `PROMPTS_E1_E2.md`.
- **E2 · ejercitar** (1 llamada): genera 4-6 ejercicios cortos, uno por bloque de
  `selected_blocks`, cada uno con su contenido visible + su `feedback` (respuesta
  de referencia + el porqué). Prompt en `PROMPTS_E1_E2.md`.
- **E3 · empacar** (sin inteligencia artificial): portada (`case_cover`) +
  ejercicios -> el `playable_json` educativo. Sin `manager_outcome`, sin biblia.

Gates: `lint-case-copy` (reusa) sobre lo visible + `check-assembled-case --educative`
(adaptado, salta 5 secciones / manager_outcome / biblia). **Sin juez narrativo**
(no hay mundo que sostener). Resultado: ~1 minuto, 2 llamadas.

## 5. Modo formativo (la diferencia clave)

En el operativo, un bloque **mide** (sin ayuda, bajo presión, el feedback llega
al final como reporte). En el educativo, el mismo bloque **enseña**:

- Tras responder cada ejercicio, se muestra el `feedback`: la respuesta de
  referencia y el porqué (no antes, para que el participante intente primero).
- Se permite reintentar.
- El cierre no es un reporte sumativo, es "qué practicaste / qué sigue".

Regla de copy que cambia respecto al operativo: el anti-spoiler aplica al copy
**visible antes de responder** (títulos, body, opciones, labels). El `feedback`
**sí revela la respuesta** porque su trabajo es enseñar; va en campos separados y
no se renderiza hasta que la persona responde.

## 6. Cómo mueve las métricas (decidido con Pablo)

- El educativo **mueve las 6 dimensiones** en señal **formativa** (practicaste,
  con ayuda), no comprobada bajo presión. Cada ejercicio declara qué dimensiones
  toca (`evaluates_dimensions`), igual que el operativo.
- Enciende el **sello educativo**, nunca el práctico.
- Los **sellos son barras de progreso/cobertura** (suben con tu actividad de ese
  modo; el efecto "anillo que quieres cerrar"). Para el perfil completo hay que
  hacer ambos modos.
- El **sello práctico es la marca de confianza** sobre las 6 dimensiones: dims
  altas con práctico bajo se leen como "lo entiende, no lo ha comprobado bajo
  presión".

## 7. Rúbrica formativa (cómo dar feedback por dimensión)

No es la rúbrica sumativa del operativo (bandas A/M/B + reporte al manager). En
formativo, por dimensión que toca el ejercicio, el feedback usa una señal suave
de tres niveles, siempre acompañada del porqué y de qué reintentar:

| Señal | Cuándo | Qué muestra |
|---|---|---|
| **Lo tienes** | La respuesta coincide con la de referencia | Confirma y explica por qué estuvo bien |
| **Casi** | Parcial o por la razón equivocada | Muestra qué faltó, invita a reintentar |
| **Repasa esto** | Lejos de la referencia | Explica el principio y enlaza al `reading_passive` |

El feedback siempre es específico al ejercicio, en segunda persona, sin regañar.
Mueve la dimensión hacia arriba aunque sea "casi" (es práctica, no examen), pero
con menos peso que una respuesta comprobada en el operativo.

## 8. Qué reusa del operativo (mismo estilo, mismos ejercicios)

- **Bloques** (15 de 17; se excluyen `workflow_builder` y `dashboard_pivot`, que
  piden datos bespoke de empresa).
- **Voz y reglas de copy**: español neutro LATAM, sin em dash, sin acrónimos en
  prosa (la inteligencia artificial se nombra "inteligencia artificial" o "IA").
- **El runtime** (`RuntimeExperienceV2` con `feedbackMode='formative'`) y el
  `ExerciseBlockRenderer`.
- **El juez de evaluación** (`lib/simulador/judge/`) para mover las 6 dims, con
  salida formativa. NO el juez narrativo de generación.

## 9. Bloques aptos por nivel (guía de autoría)

- **N1**: `reading_passive`, `categorize_rows`, `ai_output_review`,
  `ai_comparison`, `ai_textfield_guided`, `tradeoff_decision_memo`.
- **N2**: agrega `model_tradeoff_sliders` y `ai_textfield_free`.
- **N3**: foco en juicio y decisión (`tradeoff_decision_memo`, `categorize_rows`,
  `ai_output_review`).
- Siempre `case_cover` al inicio. Un módulo educativo cabe en 5-7 pantallas.
