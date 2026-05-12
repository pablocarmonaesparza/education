# Audit Codex — field test v0 packet completo

> fecha: 2026-05-12
> alcance: `docs/simulador/field_test_v0/README.md`, `0_experiment_protocol.md`, `1_participant_brief.md`, `2_response_form.md`, `3_rubric_human_simplified.md`, `4_manager_report_template.md`, `5_post_test_interview_protocol.md`, `6_calibration_sheet.md`, `7_outreach_script.md`, `8_judge_prompt_v0.md`, `9_decision_matrix.md`
> resultado: `approved_with_fixes`

## veredicto

El packet queda aprobado para revision de Pablo y pre-registro, con fixes aplicados por Codex.

Esto NO autoriza runtime, seed SQL, migracion Supabase, UI, dashboard ni LLM-judge productivo. Autoriza solo preparar la ejecucion manual de Fase 0 cuando Pablo confirme: participantes, managers, evaluadores externos y operador wizard-of-oz.

## lo que esta solido

- El packet separa las 3 validez: `face`, `construct`, `buyer`.
- Grupo A (5 participantes) y Grupo B (3 managers) no se mezclan.
- Evaluadores humanos externos reciben rubrica ciega, sin pesos ni gap triggers internos.
- El judge corre despues de humanos, no antes.
- Las respuestas quedan capturadas en estructura exportable a runtime futuro: participante, step, answer, timestamps, evaluator_id, bands y risk_events.
- La decision matrix tiene umbrales de mantener, iterar y matar caso.
- El packet conserva la regla central: no construir producto si el caso no prueba criterio operativo bajo presion.

## fixes aplicados por Codex

1. **Alineacion de severity**

`8_judge_prompt_v0.md` y el reporte de manager usaban `critical`, pero la rubrica humana solo permitia `high|medium|low`.

Fix: `3_rubric_human_simplified.md` y `6_calibration_sheet.md` ahora aceptan `critical|high|medium|low`.

2. **Metricas high/critical consistentes**

El protocolo hablaba de `high-risk`, pero el judge ya distingue `critical`.

Fix: `0_experiment_protocol.md`, `6_calibration_sheet.md` y `9_decision_matrix.md` ahora calculan recall/precision sobre `risk_events high/critical`.

3. **Formula de weighted kappa corregida**

La hoja de calibracion tenia una formula tipo kappa simple bajo el nombre `weighted`.

Fix: `6_calibration_sheet.md` ahora define pesos A/M/B: misma banda = 1, adyacente = 0.5, opuesta = 0, y calcula `kappa_weighted` con `po_weighted` y `pe_weighted`.

4. **Tiempo del outreach manager corregido**

El script prometia 45 min al manager aunque el protocolo de Grupo B era 15 min lectura + 15 min entrevista.

Fix: `7_outreach_script.md` ahora pide 30 min.

5. **Copy operativo limpio**

El follow-up de outreach tenia emoji y tono innecesario.

Fix: se cambio a una salida neutral: `dime "no por ahora"`.

6. **Model IDs actualizados**

El packet usaba `deepseek-chat` y `gemini-3.1-flash-lite`.

Fix: se actualizo a `deepseek-v4-flash` y `gemini-2.5-flash-lite`. Verificacion 2026-05-12:

- DeepSeek docs listan `deepseek-v4-flash` y advierten que `deepseek-chat` sera deprecado como alias.
- Google Gemini docs listan `gemini-2.5-flash-lite` como modelo estable; no encontre `gemini-3.1-flash-lite` como modelo oficial vigente.

7. **Tracker de outreach anonimizado**

Claude agrego `outreach_tracker.yaml`, `sessions/README.md` y `managers/README.md`. Codex corrigio el tracker para que no guarde nombres, emails, empresas reales, URLs ni handles dentro del repo. El mapeo real debe vivir fuera del repo.

## bloqueos antes de ejecutar sesiones

1. **Pre-registro base ya existe**

El packet quedo commiteado en `1a522dd` (`feat(simulador): field_test_v0 Fase C arranque — artefactos paralelos a reclutamiento`). `0_experiment_protocol.md`, `8_judge_prompt_v0.md` y `9_decision_matrix.md` no deben editarse antes de la sesion 1 salvo nuevo commit explicito. Si se editan despues de ver respuestas, la corrida queda contaminada.

2. **Reporte sintetico para Grupo B recibido**

Claude agrego `field_test_v0/manager_report_synthetic_v0.md`. Codex reviso que tenga disclaimer sintetico, score variado, gaps observables y al menos 1 risk_event high.

3. **Operador wizard-of-oz debe quedar nombrado**

El packet permite Pablo o Claude. Antes de la sesion 1 debe quedar una persona fija. Cambiar operador durante las 5 sesiones introduce ruido.

4. **Evaluadores externos deben estar contratados antes de la sesion 1**

Si los evaluadores se contratan despues, se atrasa calibracion y se puede perder contexto de respuesta.

5. **Confidentiality note recibido**

Codex agrego `field_test_v0/confidentiality_note.md` como texto ligero. Si una empresa pide NDA formal, esto no lo reemplaza.

## riesgos no bloqueantes

- Con n=5, el judge calibration sigue siendo direccional. Correcto: el packet ya lo declara.
- La regla del judge "si dudas, no marques risk_event" puede bajar recall de riesgos. Correcto para medirlo, pero si recall cae bajo 85%, no se construye judge productivo.
- El manager report sample sintetico podria sesgar buyer validity si se ve demasiado perfecto. Debe incluir gaps reales y una recomendacion accionable imperfecta.
- El packet es fuerte para Marketing LATAM SaaS B2B; no valida otros departamentos ni verticales.
- Si Pablo pega nombres reales en `outreach_tracker.yaml`, se viola la regla de privacidad del packet. Usar solo IDs.

## decision Codex

Estado: `approved_with_fixes`.

Siguiente paso:

1. Pablo aprueba o corrige el packet.
2. Pablo nombra operador wizard-of-oz fijo.
3. Pablo recluta Grupo A, Grupo B y evaluadores externos.
4. Codex no construye runtime hasta que la decision matrix cierre Fase 0.
