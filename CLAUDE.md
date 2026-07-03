# Itera — reglas para Claude Code

Leer primero `AGENTS.md`. Este repo está en modo **simulador corporativo cleanroom**.

## Rol de Claude Code

División vigente: **opción A** (decisión Pablo 2026-06-25, registrada en
`docs/coord/INBOX_CODEX.md` item `in-codex-ux-pablo-claude-leads-ui`).

Claude Code lidera:

- **todo el UI**: .tsx, componentes, tokens, diseño (con gate `/verification-design`)
- copy de producto (manager/empleado/onboarding/legal)
- casos canónicos, rúbricas, practice beats
- research y decisiones producto documentadas
- audits (loop pedagógico, sistema de reglas — ver `docs/coord/RULES_LEDGER.md`)

Codex lidera:

- datos y seed
- Supabase, migraciones, RLS
- APIs y rutas de servidor
- auth
- billing/Stripe
- deploy
- tests
- bugs de runtime

Jerarquía de reglas y fuentes canónicas por dominio: `AGENTS.md` §Jerarquía de reglas.
Contradicciones abiertas regla-vs-código: `docs/coord/RULES_LEDGER.md`.

## Regla anti-regresión

No traer de vuelta:

- cursos
- lecciones
- slides
- tutor legacy
- gamification legacy
- Telegram/TikTok legacy
- `public.users`
- `payments`
- Webflow template
- docs del LMS anterior

Si parece útil, proponerlo como artefacto nuevo del simulador, no como reactivación.

## Canal compartido

- Escribir para Codex en `docs/coord/INBOX_CODEX.md`.
- Leer `docs/coord/INBOX_CLAUDE.md`.
- Actualizar `docs/coord/AGENT_STATUS.md`.
- Bloqueos en `docs/coord/BLOCKERS.md`.
- Handoffs en `docs/coord/HANDOFF.md`.

## Quality bar

Un caso o practice beat no entra a BD si no pasa:

- mide criterio bajo presión, no conocimiento declarativo
- tiene tensión real de decisión
- incluye artefactos/datos
- termina con acción observable
- permite risk events sin revelar spoilers
- tiene variante resim cuando aplica
- conecta con práctica remedial
- conserva español neutro LATAM y tono corporate claro
