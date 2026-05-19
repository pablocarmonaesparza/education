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
```
<!-- pablo:data:end -->
