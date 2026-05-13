---
type: decision
title: legacy freeze plan — 5 categorías para limpieza post-pivot al simulador
date: 2026-05-12
tags: [legacy, freeze, simulador, pivote, archive, plan, orquestador, producto]
dept: [orquestador, producto, desarrollo, marketing]
---

## decisión

post-pivot al simulador (ver `decision_tesis_concentracion_plataforma.md` + `decision_simulador_arquitectura_v0.md`), aplicar **legacy freeze** quirúrgico — no delete all — usando 5 categorías y un filtro único.

**filtro único** para cada asset:

> ¿ayuda a cerrar una brecha detectada por simulación y demostrar mejora?
> sí → core / retain / reposition. no → archive / forbidden v0.

## 5 categorías

| categoría | uso |
|---|---|
| **core** | en producto v0 simulador. ej: `lib/simulador/`, `docs/simulador/` |
| **retain** | motor invisible (infra, marca, decisiones) sin cambios. ej: auth, billing, design system, memoria |
| **reposition** | rol cambia, contenido se reusa. ej: 100 lecciones → pool de practice beats; embeddings → matcher gap→beat |
| **archive** | apagado del producto, código se queda en `app/legacy/`. ej: landing v1, dashboard alumno, gamification viral |
| **forbidden v0** | prohibido reintroducir hasta v1. ej: catálogo de cursos como navegación, $19 como flagship, drip emails |

## regla dura

archivado NO se desarchiva sin (a) owner asignado, (b) razón documentada nueva, (c) revisión del orquestador. si no → contaminación de tesis por la puerta de atrás.

## tabla granular

vive en [`docs/simulador/LEGACY_FREEZE_PLAN.md`](../simulador/LEGACY_FREEZE_PLAN.md). cubre:

- app/ routes (~25 routes clasificadas)
- app/api endpoints (~18)
- components/landing v1 + v2 (~26 componentes)
- lib/ módulos (~16)
- supabase migrations (~26)
- docs/ canónicos
- notion / external (database Departamentos + obsidian vault)

## por qué no "delete all"

el trabajo previo NO fue desperdicio. la educación cambia de **producto principal** a **remediación accionada por evidencia**:

> simulación → diagnóstico → gap detectado → principio → micro-práctica → re-simulación → evidencia de mejora

la inversión pedagógica (5E, hypercorrection, 100 lecciones, schema, embeddings) se transfiere directo al motor de remediación. el 70% del código previo es reusable; el 25-30% se archiva o reposiciona.

## fundamentos investigados

(via codex review)

- chernikova et al. 2020 — simulation-based learning en higher education
- cook et al. 2013 / mayo clinic — features de simulación efectiva: feedback, repetitive practice, distributed practice, range of difficulty, mastery learning, individualized learning
- rapid cycle deliberate practice — ciclos cortos de intento → feedback dirigido → reintento hasta dominio

## consecuencias inmediatas

1. NO mover rutas todavía. el plan es documento, no ejecución. ejecución viene post-field-test.
2. todo asset nuevo se clasifica antes de mergear.
3. memoria + research nunca se tocan.
4. el filtro único aplica a cualquier propuesta futura.

## decisiones que esta supersede o complementa

- `decision_tesis_concentracion_plataforma.md` — tesis vigente (simulador)
- `decision_simulador_arquitectura_v0.md` — schema/runtime
- `decision_simulador_sprint_marketing_completo_v1.md` — 8 cases canónicos
- `decision_simulador_field_test_v0.md` — field test antes de runtime
- `gotcha_posicionamiento_empresa_vs_latam.md` — B2B-empresa confirmado

## next steps

1. pablo aprueba el plan
2. crear `app/simulator/` + `app/legacy/_archive/`
3. correr field test v0
4. decision matrix
5. si pasa → migración 017 (schema simulador) + endpoints + `app/manager/`
6. si no pasa → revisar tesis antes de continuar build
