---
name: verification-work
version: 1.0.0
description: |
  Loop de implementación verificada para trabajo de código en Itera. Yo (Claude Code)
  escribo el código, verifico local (tests / lint / build / browser), y Codex es el gate
  independiente: si Codex reprueba, reparo los issues y reenvío a Codex una y otra vez
  hasta que devuelva PASS. Solo entrego después de PASS o de un blocker real.
  Úsala cuando Pablo pida implementar/arreglar código y quiera entrega solo tras verificación.
  Invócala con /verification-work <lo que hay que implementar>.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
  - TodoWrite
---

# /verification-work — implementar → verificar → gate Codex → reparar → repetir

Convierte la tarea en un loop: implemento, testeo, Codex revisa, reparo si hace falta, y repito hasta aprobado. **Codex es el gate; yo soy quien implementa y repara.**

## Workflow

1. **Fija el target.** Reformula el objetivo, criterios de aceptación, archivos afectados y nivel de riesgo. Inspecciona el repo real antes de afirmar nada. Si toca el simulador, respeta `AGENTS.md`, `FRONT_CONTRACT.md` y el loop de producto activo.

2. **Preflight cuando aplique.** Para trabajo del simulador o repo compartido, desde la raíz:
   ```bash
   git pull --quiet origin main 2>/dev/null || true
   bash scripts/lint-memory.sh | tail -15
   ```
   Si necesitas contexto de docs, búscalo con `rg`/`Grep`.

3. **Protege el trabajo existente.** No reviertas archivos dirty no relacionados. Lee los archivos antes de editarlos. Mantén el cambio acotado al objetivo y a los patrones actuales del repo.

4. **Implementa.** El cambio completo más pequeño que satisface el objetivo. Prefiere utilidades, schemas, componentes y tests existentes. Evita servicios pagos, rutas nuevas o abstracciones nuevas sin razón clara.

5. **Verifica local.** Tests enfocados primero. Para cambios del simulador, corre los gates salvo que la tarea claramente no toque esa superficie:
   ```bash
   npm run check:simulador
   npm run lint:simulador
   npm run build
   ```
   Para cambios de UI, corre verificación en browser de la ruta afectada. **Si es cambio de diseño, invoca `/verification-design`.**

6. **Gate de Codex.** Revisa el diff con Codex como si lo hubiera escrito otro ingeniero:
   ```bash
   codex exec "Review este diff de Itera. Busca bugs, regresiones, tests faltantes, drift de contrato, leakage de producto legacy (curso/LMS/pagos/gamification), problemas de seguridad y gaps de comportamiento user-facing. PASS solo si no hay issues bloqueantes; si no, FAIL con la lista específica."
   ```
   Marca PASS solo cuando Codex no reporte bloqueantes.

7. **Reparo cuando Codex reprueba.** Si Codex devuelve FAIL, yo (Claude Code, en el loop principal) aplico la reparación más pequeña a cada issue de la lista: scope ajustado, sin editar lo no relacionado, siguiendo `AGENTS.md` y los contratos del simulador, prefiriendo componentes/utilidades/schemas/tests existentes. Luego vuelvo a verificación local + gate de Codex. (Para una reparación con ojos frescos e independientes, opcionalmente lanza un subagente `Agent`.)

8. **Repite hasta aprobado.** Continúa verificar → gate Codex → reparar hasta que Codex devuelva PASS. Si el mismo blocker se repite 3 veces, o Codex no está disponible, dilo claro, preserva el mejor estado verificado, y no finjas que pasó.

## Checklist de review de Codex

- El cambio satisface los criterios de aceptación de Pablo.
- El diff está acotado y no revierte trabajo no relacionado.
- Tests/gates cubren el comportamiento cambiado al nivel correcto.
- El trabajo del simulador usa el schema `simulador` activo y rutas activas.
- Cambios user-facing incluyen verificación en browser o smoke donde aplique.
- No se revivió ninguna superficie legacy LMS/curso/pago/gamification.
- No se introdujo gasto externo nuevo, exposición de secretos ni bypass de producción.

## Estándar de entrega

Entrega solo tras PASS o un blocker real. El estado final menciona archivos cambiados, verificación corrida, resultado pass/fail y riesgo residual. Si un comando no pudo correr, nómbralo directo y di por qué.
