# Referencia — loop de verificación

Usa esta referencia cuando un run de verification-work necesite el loop de reparación explícito.

## Forma del review de Codex

Codex revisa el trabajo como si lo hubiera escrito otro ingeniero.

- **PASS** = no quedan issues bloqueantes.
- **FAIL** = al menos un issue bloqueante queda y el trabajo no puede entregarse como hecho.
- Cada hallazgo identifica archivo, comportamiento, riesgo y la corrección mínima necesaria.

Invocación típica desde la raíz del repo:
```bash
codex exec "Review este diff. PASS o FAIL con issues bloqueantes específicos (archivo + comportamiento + corrección mínima)."
```
Para revisar contra el working tree sin commit, también:
```bash
codex review --uncommitted "Review estos cambios. PASS o FAIL."
```

## Reparación (yo, Claude Code)

Cuando Codex devuelve FAIL, la reparación la hago yo en el loop principal — no shelleo a otra CLI. Por cada issue bloqueante:

1. Localizo el archivo y el comportamiento exacto.
2. Aplico la corrección más pequeña que lo resuelve.
3. No toco archivos no relacionados ni revierto trabajo dirty ajeno.
4. Sigo `AGENTS.md` y los contratos activos del simulador.
5. Prefiero componentes, utilidades, schemas y tests existentes; nada de dependencias o servicios pagos nuevos.

Reparación independiente opcional: si el mismo blocker resiste, lanzo un subagente `Agent` con ojos frescos que reciba el objetivo + la lista FAIL de Codex + los archivos relevantes, y proponga la corrección. Reviso su salida antes de aplicarla.

## Cierre del loop

Tras cada reparación: re-corro verificación local (tests/lint/build/browser) y vuelvo a pasar el gate de Codex. El loop termina cuando Codex devuelve PASS, o cuando un blocker real se repite 3 veces — en ese caso lo digo plano, preservo el mejor estado verificado y no declaro PASS falso.
