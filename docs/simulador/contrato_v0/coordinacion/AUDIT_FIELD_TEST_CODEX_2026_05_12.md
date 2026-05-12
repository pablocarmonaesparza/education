# Audit Codex — field test v0 Fase A

> fecha: 2026-05-12
> alcance: `docs/simulador/field_test_v0/README.md`, `0_experiment_protocol.md`, `9_decision_matrix.md`
> resultado: `approved_with_fixes`

## veredicto

Fase A queda aprobada metodologicamente con fixes aplicados. No hay bloqueo tecnico para que Pablo revise/apruebe el lock experimental.

Codex no autoriza runtime, seed SQL, migracion Supabase, UI ni LLM-judge productivo. La unica autorizacion siguiente es que Claude produzca Fase B despues del OK explicito de Pablo.

## lo que esta solido

- El protocolo separa face validity, construct validity y buyer validity.
- El experimento declara explicitamente lo que NO valida con n=5.
- Grupo A y grupo B estan separados.
- Evaluadores humanos son externos y reciben rubrica ciega.
- El judge corre despues de los humanos.
- Wizard-of-oz queda reproducible: modelo, temperature, prompts y timestamps congelados.
- La decision matrix evita interpretar resultados a conveniencia.
- El runtime solo puede arrancar si pasa la matriz.

## fixes aplicados por Codex

1. **Cells evaluables corregidas**

El protocolo decia 25 cells por sesion (5 dimensiones x 5 steps). Eso era incorrecto porque el case template no evalua todas las dimensiones en todos los steps.

Fix: `0_experiment_protocol.md` ahora define cell evaluable como `step x dimension` declarada en `evaluates`, `evaluates_prompt` o `followup.evaluates`. Para el caso 1 son 15 cells por sesion y 75 cells totales.

2. **Varianza de scores aclarada**

El protocolo mezclaba "1 banda completa" con ejemplos A/M/B inconsistentes.

Fix: queda como "1 salto de banda adyacente" en al menos 3 de 5 dimensiones. A/B cuenta como senal mas fuerte.

3. **Completion sin ayuda endurecido**

La matriz aceptaba `<5 clarificaciones` como "sin ayuda", demasiado laxo.

Fix: "sin ayuda" ahora significa 0 clarificaciones de contenido/criterio, maximo 2 procedurales y cualquier pista de decision marca la sesion como "con ayuda".

4. **Risk events high estructurados**

El protocolo usaba high-risk recall pero no definia como capturar risk events high.

Fix: `risk_events high` se capturan como flags explicitos por step en hojas de evaluacion humana; no se infieren desde bandas A/M/B.

5. **Timeline corregido**

El protocolo decia que Claude redactaba Fase B inmediatamente, contradiciendo el lock experimental.

Fix: Fase B empieza despues del OK de Pablo a Fase A.

## riesgos no bloqueantes

- Los modelos concretos (`deepseek-v4-flash`, fallback `gemini-2.5-flash-lite`) deben congelarse de verdad en `8_judge_prompt_v0.md`; no basta mencionarlos en el protocolo.
- El formato YAML de `evaluator_1.yaml`, `evaluator_2.yaml`, `judge.yaml` y `responses.yaml` debe quedar suficientemente estructurado en Fase B para que Codex pueda auditar calculos.
- El commit hash de pre-registro sigue pendiente hasta que Pablo apruebe y se commitee Fase A.
- Con n=5, la calibracion judge sigue siendo direccional; el protocolo ya lo dice correctamente.

## siguiente paso

1. Pablo revisa Fase A.
2. Si Pablo aprueba, se commitea el lock experimental con hash visible.
3. Claude produce Fase B: los 7 archivos restantes del packet.
4. Codex audita Fase B contra reproducibilidad, rubrica ciega y estructura de captura.

## estado

No hay bloqueo de Codex sobre Fase A. Queda pendiente aprobacion de Pablo.
