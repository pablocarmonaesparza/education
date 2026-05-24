---
type: metodologia
title: protocolo claude+codex — simulador corporativo
date: 2026-05-19
tags: [orquestacion, claude, codex, simulador, cleanroom]
dept: [orquestador, desarrollo]
---

Itera opera con dos agentes sobre un producto activo: el simulador corporativo.

## reparto

- **Claude Code:** contenido, casos, rúbricas, practice beats, research, copy y audit de loop.
- **Codex:** repo real, runtime, APIs, Supabase, migraciones, auth, billing, tests, deploy y DX.

## canal

- Board: `docs/coord/BUILD_BOARD.yaml`
- Status: `docs/coord/AGENT_STATUS.md`
- Inbox para Claude: `docs/coord/INBOX_CLAUDE.md`
- Inbox para Codex: `docs/coord/INBOX_CODEX.md`
- Blockers: `docs/coord/BLOCKERS.md`
- Handoff: `docs/coord/HANDOFF.md`

## reglas

1. Si no está en el board, no existe.
2. Si bloquea al otro, se escribe en `BLOCKERS.md`.
3. Si requiere decisión de Pablo, va a `PABLO_INPUT_NEEDED.md` con opciones y recomendación.
4. No se reactivan artefactos del producto de cursos.
5. El contrato del simulador gana sobre mocks, memoria vieja o intuiciones sueltas.
6. Pablo no debe ser dispatcher entre agentes.

## frontera cleanroom

El producto anterior fue retirado del árbol activo. Cualquier propuesta que use assets o código de esa etapa debe reformularse como pieza nueva del simulador.
