# 9 — matriz de decisión post-fase-0

> **versión:** 1.0.0
> **fecha de pre-registro:** 2026-05-12
> **estado:** congelado al commit. los umbrales NO se mueven post-sesión.
> **autor:** claude (producto)
> **auditor:** codex (técnico/metodológico)
> **sponsor decisor:** pablo
>
> **regla:** este archivo se commitea **antes** de la sesión 1. los umbrales
> definidos abajo NO se editan después de ver resultados. modificación
> posterior al commit requiere fila en bitácora + justificación + reset
> del análisis.

---

## propósito

al cierre de Fase D (análisis post-sesiones), este archivo define **qué
acción tomar** con el caso 1 sin permitir interpretación a conveniencia.

3 acciones posibles:

| acción | qué significa |
|---|---|
| **construir runtime** | Codex arranca seed SQL + importer + runtime mínimo + LLM-judge calibrado para el caso 1 |
| **iterar** | iteramos packet/caso/rúbrica sin construir runtime, repetimos fase 0 con 3 participantes nuevos |
| **matar caso** | el caso 1 no funciona; re-pensar tensión, ICP, o producto antes de seguir |

---

## las 6 señales (mismas que hipótesis pre-registradas en 0_experiment_protocol)

cada señal tiene 3 umbrales:

- **umbral mantener** (señal positiva → contribuye a "construir runtime")
- **zona intermedia** (no es claro → contribuye a "iterar")
- **umbral matar** (señal negativa → contribuye a "matar caso")

los umbrales son **numéricos cuando se puede**. cualitativos solo cuando es inevitable.

---

### señal 1 — completion sin ayuda (face validity operacional)

**qué mide:** ¿el participante completa los 5 steps del caso sin que el operador
tenga que explicar más allá del brief inicial?

|  | umbral |
|---|---|
| **mantener** | ≥ 4/5 participantes completan sin ayuda mid-session |
| **zona intermedia** | 3/5 completan (alguno requiere clarificación leve) |
| **matar** | ≤ 2/5 completan sin ayuda |

**captura:** operador anota cada vez que tiene que clarificar algo
durante la sesión. <5 clarificaciones por sesión = "sin ayuda".

---

### señal 2 — "se parece a mi trabajo" (face validity de tensión)

**qué mide:** ¿los participantes reconocen el escenario como similar a
una situación real que vivieron?

captura en pregunta 1 de `5_post_test_interview_protocol.md`:
> *"¿este escenario se parece a una situación que viviste en tu trabajo
> el último trimestre? si sí, ¿qué tan similar?"*

|  | umbral |
|---|---|
| **mantener** | ≥ 3/5 participantes dicen "sí, parecido" o "sí, exacto"; al menos 2 citan ejemplo concreto |
| **zona intermedia** | 2/5 dicen "sí, parecido" sin ejemplo concreto |
| **matar** | ≤ 1/5 reconoce el escenario como suyo |

**aclaración:** "sí pero no a mi rol" cuenta como zona intermedia. "sí
pero a otra industria" cuenta como zona intermedia.

---

### señal 3 — varianza de scores entre participantes (construct validity)

**qué mide:** ¿el caso diferencia entre participantes? si todos
scorean A, A, A, A, A en todas las dimensiones, el caso no separa
criterio bueno de criterio malo.

calculado sobre evaluación humana (promediada entre evaluador1 y
evaluador2 cuando coinciden; tomada de tie-breaker cuando aplica).

|  | umbral |
|---|---|
| **mantener** | en ≥ 3 de las 5 dimensiones, hay al menos 1 banda completa de diferencia entre el participante top y el bottom |
| **zona intermedia** | en 2 de las 5 dimensiones hay 1 banda de diferencia |
| **matar** | en ≤ 1 dimensión hay varianza; los demás scorean similar todos |

**ejemplo:**
- **mantener:** dimensión privacidad → participante top=A, bottom=B. ✓
- **matar:** todas las 5 dimensiones → 4 participantes en M, 1 en A. ✗ (poca varianza)

---

### señal 4 — humano-humano kappa (sanidad de rúbrica)

**qué mide:** ¿los 2 evaluadores externos coinciden entre ellos?
si no coinciden, la rúbrica no comunica criterios; el problema NO es
del judge, es de la rúbrica.

|  | umbral |
|---|---|
| **mantener** | kappa weighted entre humano1 y humano2 ≥ 0.4 |
| **zona intermedia** | kappa entre 0.2 y 0.4 — invocamos 3er evaluador (tie-breaker) |
| **matar** | kappa < 0.2 — rúbrica no funciona; iterar antes que matar caso |

**aclaración importante:** señal 4 bajo umbral matar NO mata el caso —
mata la **rúbrica como está**. iteramos rúbrica simplificada
(`3_rubric_human_simplified.md`) y re-evaluamos las mismas sesiones con
los 2 humanos. esto puede tomar 1 semana adicional.

---

### señal 5 — judge agreement con humanos en risk_events HIGH (asimétrica)

**qué mide:** el LLM-judge puede ser laxo en muchas cosas, pero NO en
identificar riesgos altos. si el judge pierde riesgos high, no se puede
vender al manager. esta es la única métrica del judge con peso de matar
caso en fase 0.

calculado: judge detectó X% de los risk_events high detectados por al
menos UN humano.

|  | umbral |
|---|---|
| **mantener** | recall del judge en risk_events high ≥ 85% Y false negatives críticos high ≤ 1 en toda la prueba |
| **zona intermedia** | recall 60-85% O 1-2 false negatives críticos |
| **matar el judge automatizado** | recall < 60% O ≥ 3 false negatives críticos |

**si señal 5 cae en "matar el judge"** pero las otras 5 señales pasan
mantener, el caso vive pero el judge se reemplaza por evaluación humana
hasta calibrar con n ≥ 20. **runtime puede construirse sin el judge
automatizado.**

**precision del judge:** NO mata caso ni judge. precision baja
(sobre-llamar riesgos) es calibrable iterando prompt.

---

### señal 6 — manager declara decisión accionable (buyer validity)

**qué mide:** ¿los 3 managers del grupo B, leyendo el reporte
anonimizado, declaran que tomarían una acción concreta?

captura: pregunta abierta a cada manager:
> *"si recibieras este reporte sobre tu equipo, ¿qué harías mañana?"*

**la respuesta debe nombrar una acción específica, no genérica.**

- ✓ accionable: "pondría a Mariana en piloto pero a los otros 2 los pondría en pausa de IA hasta entrenamiento"
- ✗ no accionable: "lo discutiría con el equipo" / "necesito pensarlo"
  / "está interesante"

|  | umbral |
|---|---|
| **mantener** | ≥ 2/3 managers nombran acción específica (referencia datos del reporte) |
| **zona intermedia** | 1/3 nombra acción específica |
| **matar el reporte como está** | 0/3 nombra acción específica |

**igual que señal 4:** si señal 6 cae en "matar el reporte", NO mata
caso. mata el formato del reporte. iteramos
`4_manager_report_template.md` y re-probamos con los 3 managers en 1
semana.

---

## regla de agregación

al cierre de fase 0, contar cada señal contra sus umbrales y aplicar:

### A) **construir runtime** si:
- ≥ 5 de las 6 señales están en "umbral mantener" (incluyendo señal 1 y señal 2 obligatorias en mantener)
- ninguna señal en "umbral matar"

→ Codex inicia seed SQL + importer + runtime mínimo + LLM-judge contra el caso 1.

### B) **iterar** si:
- 3-4 señales en mantener, el resto en zona intermedia
- 0 señales en "umbral matar"
- O: señal 4 (humano-humano kappa) en matar → iteramos rúbrica
- O: señal 6 (manager accionable) en matar → iteramos reporte

→ no se construye runtime. iteramos archivo(s) problemático(s) y
re-probamos fase 0 con 3 participantes nuevos (no los mismos). budget
estimado: ~2 semanas adicionales + $500 USD adicional (incentivos).

### C) **matar caso** si:
- ≥ 3 señales en "umbral matar"
- O: señal 1 (completion sin ayuda) en matar
- O: señal 2 (face validity) en matar AND señal 3 (varianza) en matar

→ no se construye runtime. el caso 1 no funciona como pivote inicial.
re-pensamos:
- ¿es la tensión equivocada para el ICP?
- ¿es el ICP equivocado?
- ¿es el formato del experimento equivocado?
- ¿el simulador debería diagnosticar otra cosa primero?

esto NO mata al Simulador como producto. mata al caso 1 como vehículo
inicial. los otros 7 casos del Sprint marketing_30d quedan disponibles
para probarlos como pivote alternativo, pero NO se construye runtime
hasta que UN caso pase fase 0.

---

## casos especiales y edge cases

### ¿qué pasa si solo se completan 3 sesiones (no 5)?

reclutamiento es el critical path. si pasamos día 21 con solo 3
sesiones completadas:

- **opción 1:** extender 1 semana, intentar completar 5
- **opción 2:** declarar fase 0 inconclusa (NO matar, NO construir).
  re-iniciar reclutamiento.

**default:** opción 1 hasta día 28. después → opción 2.

con 3 sesiones, los umbrales numéricos NO aplican directamente:
"≥4/5" se traduce a "≥3/3" (más estricto, no menos). el experimento
pierde poder estadístico pero la disciplina del pre-registro se mantiene.

### ¿qué pasa si hay un participante atípico (outlier)?

mantener al outlier en el análisis. documentar en notas. no excluir
post-hoc — eso es manipulación.

excepción: si el outlier no cumplió criterios de inclusión (sección 4.2
del protocolo), excluir + reemplazar + re-correr.

### ¿qué pasa si Pablo, Claude o Codex creen que la matriz "está mal"?

esperado. la matriz está pre-registrada antes de ver resultados.
modificación post-resultados = manipulación.

opciones legítimas:

- documentar el desacuerdo en bitácora de cambios
- continuar con la decisión que dicta la matriz
- escribir lecciones aprendidas para fase 0.5 / fase 1, NO modificar
  retroactivamente la decisión actual

---

## responsables de la decisión

| paso | quién decide |
|---|---|
| medir las 6 señales | claude + codex (audit de cálculo) |
| llenar la fila de cada señal vs umbral | claude |
| aplicar regla de agregación | claude propone, codex verifica, pablo confirma |
| ejecutar la acción decidida | construir → codex; iterar → claude; matar → pablo + claude + codex sesión conjunta |

---

## formato de output al cierre de fase D

`field_test_v0/sessions/_decision_v1.md` con:

1. tabla de las 6 señales con su valor medido y su umbral
2. regla aplicada y resultado (A / B / C)
3. acción ejecutada
4. firma de pablo (commit message)
5. link a evidencia raw (`sessions/<participant_id>/`)

---

## bitácora de cambios

| fecha | autor | cambio | razón |
|---|---|---|---|
| 2026-05-12 | claude | v1.0.0 inicial — pre-registro | arrancar lock experimental |

**regla:** cualquier cambio post-sesión-1 requiere:
- fila en esta tabla
- justificación textual (≥2 párrafos)
- aprobación de pablo + codex (no solo claude)
- reset de análisis para considerar resultados pre-modificación como invalidados

---

## firma de pre-registro

este archivo se considera **pre-registrado** cuando:

- está commiteado en `main` con git hash visible
- README del paquete enlaza a este archivo
- `0_experiment_protocol.md` está commiteado simultáneamente
- Pablo ha dado OK explícito en mensaje (capturado en commit message o en handoff)

referencia del git hash inicial se rellena post-commit:

```
git hash inicial: [SE COMPLETARÁ AL COMMITEAR]
fecha de pre-registro: 2026-05-12
```
