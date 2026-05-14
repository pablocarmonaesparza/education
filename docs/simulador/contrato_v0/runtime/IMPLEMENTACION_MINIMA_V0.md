# Implementacion minima v0

Codex agrego el primer nucleo tecnico en `lib/simulador/`.

## Que incluye

| Archivo | Proposito |
|---|---|
| `lib/simulador/types.ts` | Tipos canonicos del contrato: dimensiones, step types, evidence kinds, manager actions, case templates, variants, sprints, events. |
| `lib/simulador/contracts.ts` | Constantes y guards para validar valores canonicos. |
| `lib/simulador/validator.ts` | Validacion estructural de templates, variants, practice beats y sprint packages. |
| `lib/simulador/importer.ts` | Mapeo de contratos ya parseados a seed rows compatibles con el schema SQL candidate. |
| `lib/simulador/runtime.ts` | Runtime puro: crear session draft, avanzar steps, capturar events, risk events, decision replay y evaluation stub. |
| `lib/simulador/index.ts` | Export publico del modulo. |
| `scripts/simulador/validate-contracts.mjs` | CLI de validacion que lee los YAML reales del contrato y revisa cases, variants, practice beats, sprint y rubrica. |

## Que NO incluye todavia

- Importer YAML -> DB ejecutado.
- Seed SQL generado automaticamente.
- Escritura en Supabase.
- LLM-as-judge real.
- UI.

## Regla de seguridad

Este modulo es puro y no toca red ni base de datos. La migracion Supabase sigue bloqueada hasta aprobacion explicita de Pablo.

## Ajustes post-audit Claude CLI

- `step_key` se normaliza como `step_<id>` para que YAML numeric y DB no diverjan.
- `risk_events` aceptan `dimension` explicita; la inferencia por nombre queda solo como fallback.
- El importer conserva pricing completo en `pricing_json` y metadata de cada caso del Sprint: `status`, variantes, dimensiones, dificultad y tension.
- El validador cruza practice beats entre casos, catalogo del Sprint y archivos reales, ademas de validar refs primary/resim.

## Validacion corrida

```text
npx tsc --noEmit --pretty false --strict --skipLibCheck --module esnext --moduleResolution bundler --target ES2017 lib/simulador/*.ts
```

Resultado: OK.

```text
npm run simulador:validate
```

Resultado: OK. Resumen validado: 8 casos ready, 16 variantes, 20 practice beats, rubrica `rubric_marketing_v1@1.0.0`.

El typecheck global del repo sigue fallando por errores existentes fuera de este modulo (`app/api/dev/auto-login`, prototipo `app/simulator-system`, buttons compartidos y funciones Deno de Supabase).
