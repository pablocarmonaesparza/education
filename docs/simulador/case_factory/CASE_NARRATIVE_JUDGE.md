# Juez narrativo de casos (gate de coherencia automático)

Lo que el `check-assembled-case` y el `lint-case-copy` NO pueden cazar: que el
caso esté bien CONTADO. Este es el gate LLM que automatiza el Gate narrativo
del `CASE_QUALITY_CHECKLIST.md`.

## Principio (de Codex, F0)

El juez LLM NO es autoridad única ni se le pregunta "¿cumple las 10 preguntas?"
(tiende a aprobar). Primero **extrae una fact table** del caso y la compara
contra sí misma y contra la biblia. Devuelve **JSON, no prosa**. **Default =
FAIL** si encuentra una ruptura o si no puede citar evidencia. Se optimiza para
**falsos negativos** (mejor frenar de más que publicar basura coherente de
mentiritas).

No es un juez, son **cuatro jueces especializados**. Cada uno corre por separado
y cualquiera que falle reprueba el caso.

## Contrato de salida (todos los jueces)

```json
{
  "judge": "continuity | copy | manager_signal | adversarial",
  "verdict": "PASS | FAIL",
  "findings": [
    { "type": "string", "slide": "seccion/slotN", "evidence": "cita textual del caso", "fix": "qué corregir" }
  ]
}
```

Reglas duras del contrato:
- Cada finding DEBE citar evidencia textual del caso. Sin cita, no es finding.
- Si hay >= 1 finding, `verdict` es FAIL.
- Si el juez no puede leer el caso o dudar, `verdict` es FAIL (default conservador).

## 1. continuity_judge (el central)

Paso 1, extrae la FACT TABLE leyendo el caso de principio a fin:
- empresa; rol del participante;
- quién ASIGNA el trabajo (manager);
- quién RECIBE el mensaje que el participante construye (debe ser un cliente o
  segmento, NUNCA el manager ni el propio participante);
- las PROMESAS que el manager hace al inicio (lo que pide entregar);
- fechas y números clave;
- identidad de la herramienta de IA (qué hace, si se elige o es instrumento dado).

Paso 2, busca rupturas y repórtalas como findings con cita:
- `recipient_self`: el mensaje que construye el participante va dirigido al
  manager o a sí mismo ("te vendes a ti mismo").
- `promise_unfulfilled`: algo que el manager pide al inicio no se entrega en el caso.
- `data_contradiction`: un número o fecha contradice a otro entre slides.
- `job_switch`: el tipo de trabajo cambia a mitad (retención se vuelve adquisición).
- `tool_inconsistency`: la herramienta de IA se contradice (dice "no elijas modelo"
  y luego hay selector; o cambia de identidad).
- `ghost_entity`: persona/documento/comité que se nombra una vez y nunca se usa.

## 2. copy_judge

Lee solo el copy visible. Findings: relleno, frase de coach vacía, telegrama
(frases truncadas sin sentido), jerga. (Em dash y acrónimos ya los caza el
lint determinista; este juez ataca lo que un regex no ve.)

## 3. manager_signal_judge

¿El manager puede tomar una acción con lo que el caso produce? Si la decisión
final no es accionable o no conecta con el trabajo hecho, FAIL.

## 4. adversarial_judge

Su único trabajo es encontrar UNA razón concreta para reprobar el caso. Si no
encuentra evidencia citable, PASS. Si encuentra cualquier cosa, FAIL con cita.

## De-risk (F0, antes de conectar al loop)

El juez NO se conecta al loop de generación hasta que pruebe que caza casos
rotos. El test:
1. Corre el continuity_judge contra el caso de oro -> debe dar PASS.
2. Corre contra los fixtures narrativos rotos (recipient swap, data
   contradiction, promise unfulfilled de `test-case-factory.mjs`) -> debe dar
   FAIL, citando la ruptura.
3. Si rubber-stampea el golden a FAIL o aprueba un roto, se recalibra el prompt
   antes de avanzar.

Backend del de-risk: Codex CLI como LLM. En producción será una llamada a la API
de Claude/GPT con el mismo prompt, cacheada por hash del caso.
