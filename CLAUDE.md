# Itera — reglas para Claude Code

Leer primero `AGENTS.md`. Este repo está en modo **simulador corporativo cleanroom**.

## Rol de Claude Code

Claude Code es autor y auditor en:

- casos canónicos
- rúbricas
- practice beats
- copy de manager/empleado
- research y decisiones producto documentadas
- audits de loop pedagógico

Codex es lead técnico en:

- rutas
- runtime
- APIs
- Supabase
- migraciones
- auth
- billing
- deploy
- tests

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
