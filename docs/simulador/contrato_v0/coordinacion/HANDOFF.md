# Handoff vivo — El Simulador contrato v0

Ultima actualizacion: 2026-05-12

## Estado actual

Codex creo la estructura base, runtime logico, modelo de datos, SQL candidate y runtime minimo en `lib/simulador/`. Claude completo el primer paquete de producto: 8 casos canonicos, 16 variantes, rubrica, 20 practice beats, copy y sprint package.

Claude CLI audito el candidate tecnico y Codex ya resolvio los bloqueantes: pricing completo en `pricing_json`, metadata por caso del Sprint, assignments primary/resim, step keys estables y dimension explicita en risk events.

Fase actual: field test v0. Pablo aprobo arrancar con lock experimental antes de construir runtime. Fase A y Fase B del packet ya estan redactadas y auditadas por Codex.

## Regla de colaboracion

Claude trabaja producto en archivos acordados o stdout cuando Codex lo invoque por CLI. Codex mantiene la consolidacion tecnica y no corre migraciones sin revision cruzada.

## Responsabilidad de Codex

- Mantener esta estructura.
- Mantener schema SQL candidate.
- Definir runtime logico.
- Integrar archivos de producto que Claude proponga.
- Validar coherencia tecnica antes de bajar a migraciones o runtime.

## Responsabilidad de Claude

- Escribir casos canonicos completos.
- Escribir rubricas con dimensiones publicas y criterios internos.
- Escribir copy de manager/empleado cuando haga falta.
- Auditar schema/runtime cuando afecte el producto.

## Revision cruzada obligatoria

- Antes de cerrar el primer caso canonico.
- Antes de cerrar una rubrica nueva.
- Antes de correr la primera migracion SQL.
- Antes de definir copy importante de manager/empleado.
- Antes de una decision fuerte de comprador o pricing.

## No requiere revision cruzada

- Lint.
- Refactors.
- Estructura de carpetas.
- Wiring tecnico menor.
- Fixes locales.

## Bloqueos actuales

Fase A y Fase B del field test fueron recibidas y auditadas por Codex.

Resultado: `approved_with_fixes`.

Auditorias:

- `coordinacion/AUDIT_FIELD_TEST_CODEX_2026_05_12.md`
- `coordinacion/AUDIT_FIELD_TEST_PACKET_CODEX_2026_05_12.md`

Pendiente antes de ejecutar sesiones:

- OK explicito de Pablo para el packet completo.
- operador wizard-of-oz fijo.
- 2 evaluadores externos confirmados.

Pre-registro base ya tiene hash visible: `1a522dd` (`feat(simulador): field_test_v0 Fase C arranque — artefactos paralelos a reclutamiento`). No editar protocolo, matriz, judge prompt ni materiales de sesion antes de la sesion 1 salvo nuevo commit explicito.

Regla de privacidad: `outreach_tracker.yaml`, `sessions/` y `managers/` usan solo IDs anonimizados. No poner nombres, emails, empresas reales, handles ni URLs dentro del repo.

No correr migracion remota hasta aprobacion explicita de Pablo y revision cruzada final.

Nota operativa: `gbrain import docs/memory/ --no-embed` corrio bien el 2026-05-12. `gbrain embed --stale` fallo por cuota 429, asi que Claude/Codex deben tratar `docs/memory/` markdown como fuente de verdad y usar gbrain solo si el indice local ya responde.

## Siguiente paso recomendado para Claude

Si Pablo aprueba el packet completo, no crear mas estructura. Ayudar a Pablo a preparar reclutamiento, evaluadores externos y scheduling usando los archivos existentes.

No ejecutar sesiones hasta que el pre-registro este commiteado.

## Siguiente paso recomendado para Codex

- Esperar aprobacion de Pablo al packet completo.
- Despues, ayudar a congelar pre-registro y revisar que no haya drift en modelos/prompts.
- No construir runtime, seed SQL, LLM-judge ni Supabase hasta que la fase 0 pase.

## Nota para Codex

Antes de editar archivos que Claude pudo tocar, revisar:

```bash
git status --short
find docs/simulador/contrato_v0 -type f -maxdepth 4 -print
```
