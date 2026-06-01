# memoria itera

Memoria activa del simulador corporativo. La memoria histórica del producto anterior fue retirada del árbol activo durante la purga `20260519`.

Fuentes canónicas actuales:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/simulador/front/FRONT_CONTRACT.md`
- `docs/simulador/front/PRODUCT_VISION_ONE_PAGER.md`
- `docs/simulador/contrato_v0/`
- `docs/coord/`

## decisiones activas

- [framing marketing del Simulador](decision_marketing_simulator_framing_v1.md)
- [arquitectura v0 de El Simulador](decision_simulador_arquitectura_v0.md)
- [field test v0 del Simulador](decision_simulador_field_test_v0.md)
- [runtime mínimo del Simulador implementado por Codex](decision_simulador_runtime_minimo_codex.md)
- [Sprint marketing_30d completo](decision_simulador_sprint_marketing_completo_v1.md)

## operación

- [las claves de api son de los clientes, no de Claude para construir](aprendizaje_claves_api_son_de_clientes.md) — 2026-06-01 — `[desarrollo, producto]` — Claude ES el modelo: genera, juzga y evalúa él mismo; la llave es del cliente en producción
- [protocolo claude+codex](metodologia_protocolo_claude_codex.md)
- [estructura de dominios](metodologia_estructura_dominios.md)
- [ritual de cierre por dominio](metodologia_ritual_cierre_dominio.md)

## gotchas técnicos activos

- [`git commit` sin pathspec levanta archivos staged de otros agentes](gotcha_commit_staged_files.md)
- [supabase session pooler — usar aws-1-us-east-1](gotcha_supabase_pooler_aws1_us_east_1.md)
- [oauth de supabase: allow_list con patterns /** es obligatorio](gotcha_supabase_oauth_allow_list.md)
- [extraer pat de supabase cli desde macos keychain](gotcha_supabase_pat_desde_keychain.md)

## regla

Si una memoria menciona cursos, lecciones, slides, tutor legacy o gamification legacy, no debe estar en memoria activa.
