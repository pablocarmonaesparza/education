# Pablo input needed

Este archivo reemplaza el ping manual en chat. Si una decision requiere a Pablo, se registra con opciones y recomendacion. Si Pablo no responde en 24h, el lead puede decidir y documentar racional.

## decision policy

Solo bloquean sin default:

- gasto recurrente nuevo o proveedor nuevo
- cambio de pricing publico
- promesa comercial nueva
- borrado irreversible de datos
- cambio de direccion de producto fuera del loop del simulador

Todo lo demas debe incluir default. Si Pablo no responde en 24h, el lead ejecuta el default y documenta racional.

<!-- pablo:data:start -->
```yaml
items:
  - id: pablo-001
    topic: "Configurar rate limit para field-test publico en Vercel"
    question: "El field-test premium falla cerrado en production si no existen UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN. Vercel no los tiene configurados. Esto es un proveedor/env nuevo."
    options:
      - "Aprobar Upstash Redis REST para production (recomendado; mantiene guardrail premium)."
      - "Deshabilitar temporalmente FIELD_TEST_REQUIRE_RATE_LIMIT=false en production (no recomendado; reduce proteccion anti-abuse)."
      - "Cambiar a otro proveedor de rate limit antes de deploy."
    recommendation: "Aprobar Upstash Redis REST y cargar envs en Vercel Production/Preview antes de abrir field-test publico."
    owner: codex
    created_at: "2026-05-19T12:05:00-06:00"
    status: resolved
    resolution: "Codex elimino el proveedor nuevo: rate limit ahora puede usar Supabase/Postgres con service-role como fallback production. Upstash queda opcional, no bloqueante."
  - id: pablo-002
    topic: "Vercel no permite otro production deploy hoy"
    question: "Main ya está actualizado hasta `c216d87` con B8, B9-002-D6 y B10-001; migraciones remotas aplicadas. El deploy CLI volvió a fallar el 2026-05-19 con `api-deployments-free-per-day`. El proyecto sigue bajo límite diario del workspace o el CLI no está usando el plan Pro correcto."
    options:
      - "Confirmar/activar Pro en el workspace Vercel `pablo-7630s-projects` y reintentar deploy."
      - "Esperar al reset del límite diario y reintentar deploy mañana."
      - "Mover el proyecto a otro workspace Vercel con cuota disponible."
    recommendation: "Confirmar Pro en Vercel para `pablo-7630s-projects`; si ya se pagó, revisar que el upgrade aplique a este workspace y no a otra cuenta/equipo."
    owner: codex
    created_at: "2026-05-19T17:22:00-06:00"
    status: open
```
<!-- pablo:data:end -->
