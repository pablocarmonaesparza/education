# Itera — simulador corporativo

## Producto activo

Itera ya no es un LMS ni una plataforma de cursos. La superficie activa es un **simulador corporativo de criterio operativo en uso de IA** para equipos de empresas.

Loop canónico:

`simulación -> diagnóstico -> práctica -> re-simulación -> evidencia -> acción manager`

Fuentes de verdad actuales:

| Doc | Uso |
|---|---|
| `docs/simulador/front/FRONT_CONTRACT.md` | rutas activas, roles, datos por pantalla |
| `docs/simulador/front/PRODUCT_VISION_ONE_PAGER.md` | visión visual y experiencia esperada |
| `docs/simulador/contrato_v0/` | contrato de casos, rúbricas, variantes y field test |
| `docs/coord/` | coordinación Codex / Claude Code |
| `docs/quality/` | quality bars de casos, loop y gates |

No reactivar rutas, APIs, tablas, docs, scripts ni copy del producto anterior sin owner + razón documentada en `docs/coord/PABLO_INPUT_NEEDED.md`.

## Superficie activa

Rutas permitidas:

- `/`
- `/auth/login`
- `/auth/signup`
- `/field-test/marketing-urgent-campaign-pii`
- `/dashboard`
- `/case/[case_id]`
- `/report/[session_id]`
- `/admin`

Todo lo demás debe estar fuera del árbol activo del repo.

## Operación compartida

Antes de tocar trabajo del simulador:

```bash
git pull --quiet origin main 2>/dev/null || true
gbrain query "<tema de la task>" --no-expand 2>/dev/null | head -20 || true
bash scripts/lint-memory.sh | tail -15
```

Si `gbrain` falla, usar `rg` sobre `docs/simulador`, `docs/coord` y `docs/research`.

Coordinación:

- `docs/coord/BUILD_BOARD.yaml` es la fuente de tareas.
- `docs/coord/AGENT_STATUS.md` recibe heartbeat.
- `docs/coord/INBOX_CLAUDE.md` e `INBOX_CODEX.md` son el canal async.
- `docs/coord/BLOCKERS.md` registra bloqueos.
- `docs/coord/HANDOFF.md` cierra bloques.

## Reglas técnicas

- Código vivo debe apuntar al schema `simulador`, no a tablas legacy de `public`.
- No usar `public.users`, `payments`, `sections`, `lectures`, `slides`, `intake_responses`, tutor legacy ni gamification legacy.
- No crear rutas fuera de la allowlist sin actualizar `FRONT_CONTRACT.md`.
- No duplicar lógica de evaluación: field-test y flujo autenticado deben compartir scoring/judge.
- No exponer rúbrica, dimensiones internas ni risk events antes de que el participante responda.
- Todo cambio user-facing necesita telemetría y smoke test.
- Después de cambios relevantes, correr:

```bash
npm run check:simulador
npm run lint:simulador
npm run build
```

## Design system

- Usar componentes existentes de `components/ui/` y `components/simulador/`.
- Mantener el accent color `#1472FF`.
- No meter hex inline nuevos.
- No reimplementar buttons/cards/inputs si ya existe componente.
- La UI nueva debe seguir el contrato visual actual del simulador, no el estilo de cursos heredado.

## Comunicación con Pablo

Pablo no es dispatcher. Si falta una decisión:

1. Escribir opciones claras en `docs/coord/PABLO_INPUT_NEEDED.md`.
2. Recomendar una opción.
3. Si no hay respuesta y no es irreversible, avanzar con la opción recomendada y documentar el racional.
