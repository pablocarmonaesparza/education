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
- [verificar opiniones de diseño de Pablo contra el HIG](metodologia_verificar_opiniones_diseno_con_hig.md) — 2026-06-05 — `[producto]` — toda opinión visual de Pablo se complementa, mide y valida contra el HIG antes de aplicar
- [textfields sin label arriba, solo placeholder](decision_textfields_placeholder_only.md) — 2026-06-05 — `[producto]` — la instrucción va en el placeholder; nunca labels visibles arriba (regla de Pablo, system-wide)
- [pantallas limpias para review — sin overlays de dev](decision_pantallas_review_sin_dev_overlays.md) — 2026-06-05 — `[producto]` — devIndicators:false; nada de badges/botones de dev encima de las superficies de producto
- [indicador de pasos = AppleStepBar, no texto "Paso N de 5"](decision_indicador_pasos_stepbar.md) — 2026-06-06 — `[producto]` — barra segmentada consistente con la página de ejercicio; single source en components/simulador/apple/AppleStepBar.tsx
- [el design system es el espejo de todo — promover, no duplicar](metodologia_design_system_fuente_unica.md) — 2026-06-06 — `[producto]` — diseñas en el lab → promueves al design system → el lab consume; nunca dos copias divergentes
- [consolidación agent-safe del design system (DEC-005..011)](decision_consolidacion_design_system_agent_safe.md) — 2026-06-07 — `[producto]` — HIG/contrato/tokens alineados con el código; fuente única + punteros; accent-strong #0e5fcc para AA; rutas /case conectada vs /jugar huérfana
- [dark mode por clase .dark y heroui en azul itera](decision_darkmode_class_heroui_azul_itera.md) — 2026-06-12 — `[producto, desarrollo]` — tailwind darkMode:class alineado a next-themes; heroui primary #1472FF, secondary eliminado
- [protocolo claude+codex](metodologia_protocolo_claude_codex.md)
- [estructura de dominios](metodologia_estructura_dominios.md)
- [ritual de cierre por dominio](metodologia_ritual_cierre_dominio.md)

## gotchas técnicos activos

- [`git commit` sin pathspec levanta archivos staged de otros agentes](gotcha_commit_staged_files.md)
- [supabase session pooler — usar aws-1-us-east-1](gotcha_supabase_pooler_aws1_us_east_1.md)
- [oauth de supabase: allow_list con patterns /** es obligatorio](gotcha_supabase_oauth_allow_list.md)
- [extraer pat de supabase cli desde macos keychain](gotcha_supabase_pat_desde_keychain.md)
- [codigo "sin imports" que sí está vivo — falsos positivos de knip/grep](gotcha_codigo_sin_imports_que_vive.md) — 2026-06-12 — `[desarrollo]` — analytics.ts leído como texto, gen/* vía child_process, copy modules canónicos, @x402/fetch lo necesita agentmail

## regla

Si una memoria menciona cursos, lecciones, slides, tutor legacy o gamification legacy, no debe estar en memoria activa.
