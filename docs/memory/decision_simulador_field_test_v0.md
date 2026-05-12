---
type: decision
title: field test v0 del Simulador antes de construir runtime
date: 2026-05-12
tags: [simulador, field-test, producto, desarrollo, validacion]
dept: [producto, desarrollo, orquestador]
---

El Simulador no pasa directo a runtime. Antes se ejecuta Fase 0 como experimento conductual sin codigo sobre el caso `marketing_urgent_campaign_pii_v1`, validando face validity, construct validity y buyer validity con 5 participantes, 3 managers y 2 evaluadores externos ciegos.

**Por qué:** Pablo pidio no construir por inercia y Claude/Codex acordaron que si el caso no se siente real, no diferencia criterio o no ayuda al manager a decidir, runtime/UI/schema no importan. Codex audito Fase A y la dejo `approved_with_fixes`: cells evaluables reales (15 por sesion), completion sin ayuda endurecido y risk_events high/critical como flags explicitos.

**Cuándo aplicar:** antes de crear runtime, seed SQL, LLM-as-judge productivo, Supabase migrations o UI del Simulador. Si alguien quiere construir, primero revisar `docs/simulador/field_test_v0/` y `docs/simulador/contrato_v0/coordinacion/AUDIT_FIELD_TEST_CODEX_2026_05_12.md`.

### Actualización 2026-05-12 — packet completo auditado

Claude redactó Fase B del packet y Codex la auditó como `approved_with_fixes`. Codex corrigió consistencia de severity (`critical|high|medium|low`), cálculo de weighted kappa, métricas `risk_events high/critical`, tiempo de outreach a managers y model IDs (`deepseek-v4-flash`, `gemini-2.5-flash-lite`).

**Regla operativa:** `outreach_tracker.yaml`, `sessions/` y `managers/` no deben guardar nombres, emails, empresas reales, handles ni URLs. Solo IDs anonimizados; el mapeo real vive fuera del repo.

**Pendiente antes de ejecutar sesiones:** OK explícito de Pablo, operador wizard-of-oz fijo y 2 evaluadores externos confirmados. El pre-registro base ya quedó con hash visible en `1a522dd`; no editar protocolo, matriz ni judge prompt antes de sesiones salvo nuevo commit explícito.
