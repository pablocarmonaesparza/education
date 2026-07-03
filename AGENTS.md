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

## Jerarquía de reglas

Las reglas del sistema viven en muchos archivos. Cuando dos fuentes chocan, este es el
orden de autoridad de **intención** (qué regla es la que queremos):

1. **Decisión viva de Pablo** — `docs/memory/decision_*.md` y resoluciones en
   `docs/coord/PABLO_INPUT_NEEDED.md`. La más reciente gana.
2. **Contrato canónico del dominio** — un archivo por dominio (tabla abajo).
3. **Docs guía** — specs, notas, planes.
4. **Comentarios de código** — descripción, nunca autoridad.

El código y la BD son **el estado, no la regla**: si el código contradice la regla
vigente, es un hallazgo — o se arregla el código, o se deroga la regla con una decisión
nueva. Nunca se dejan las dos versiones vivas. El registro de contradicciones abiertas y
su resolución vive en `docs/coord/RULES_LEDGER.md`.

**Regla madre de enforcement:** una regla sin gate (código, CI, constraint de BD) y sin
dueño es una aspiración, no una regla — no puede usarse para bloquear trabajo ni para
prometer nada a clientes. Al escribir una regla nueva, se declara su gate o se marca
`aspiracional` explícitamente.

Fuente canónica por dominio:

| Dominio | Fuente canónica |
|---|---|
| Motor de casos (estructura, bloques, anti-spoiler, no-prefill) | `docs/simulador/case_factory/CASE_ASSEMBLY_SCHEMA.yaml` + `ENGINE_CONTRACT.md` |
| Judge y rúbricas | `docs/simulador/contrato_v0/rubricas/*.yaml` + `docs/simulador/rubric_semver_policy.md` |
| Quality bar de contenido | `docs/quality/case_admission_checklist.md` + quality bar de `CLAUDE.md` |
| Rutas, roles y exposición | `docs/simulador/front/FRONT_CONTRACT.md` |
| Schema y seguridad de datos | `supabase/migrations/` (los docs de schema son snapshots, no autoridad) |
| Billing y asientos | `lib/simulador/billing.ts` + decisión de pricing vigente en `docs/memory/` |
| Diseño | `/design` + `/design/components` + `APPLE_HIG_RULES_FOR_ITERA.md` §19 (`DEC-*`) |
| Proceso entre agentes | este archivo + `docs/coord/INBOX_SCHEMA.md` |

## Superficie activa

Las rutas activas viven en `docs/simulador/front/FRONT_CONTRACT.md` (fuente única, derivada del código). Esa tabla manda: si una ruta no está ahí, no existe; su columna **estado** dice si es productiva, utilitaria, dev-only o ambigua (duplicado a resolver).

No crear rutas nuevas sin actualizar `FRONT_CONTRACT.md`. Todo lo que no esté en esa tabla queda fuera del árbol activo del repo.

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

- Usar componentes existentes de `components/simulador/apple/` (barrel `index.ts`,
  espejo completo en `/design/components`).
- Tokens de `app/(app)/simulador.css` vía `var(--…)` y clases `ts-*`. No meter hex
  inline nuevos ni tamaños tipográficos sueltos.
- Accent de marca `#1472FF` (`--accent`); fondos sólidos bajo texto blanco usan
  `--accent-strong` (DEC-009).
- No reimplementar buttons/cards/inputs si ya existe componente central; UI reusable
  nueva se promueve a `components/simulador/apple/` y se registra en `/design/components`.
- Todo el diseño debe quedar referenciado a `/design`: un cambio de token ahí propaga a
  todo el sistema (vía `DesignOverridesInjector` + tokens canónicos).
- La UI nueva sigue el contrato visual del simulador, no el estilo de cursos heredado.

## Comunicación con Pablo

Pablo no es dispatcher. Si falta una decisión:

1. Escribir opciones claras en `docs/coord/PABLO_INPUT_NEEDED.md`.
2. Recomendar una opción.
3. Si no hay respuesta y no es irreversible, avanzar con la opción recomendada y documentar el racional.
