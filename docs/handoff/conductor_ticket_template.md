# plantilla — ticket conductor.build

> **propósito:** todo ticket que pablo abra en conductor.build sale con esta forma. el orquestador (claude) redacta, pablo da click. self-contained — el ejecutor (codex u otro agente) no necesita preguntar nada para arrancar.
>
> **antes de redactar el ticket, el orquestador corre:** `gbrain query "<tema del ticket>"` para extraer decisiones canónicas relevantes y pegarlas en el campo "referencias".

## cuándo usar

- cuando una decisión de un C-suite (CEO/CFO/CMO/CGO/CPO/CTO/ORQ) genera trabajo ejecutable.
- cuando un cruce entre conversaciones requiere acción técnica concreta.
- cuando un experimento vivo necesita implementación.

**no usar para** discusiones abiertas, exploración, brainstorming — eso queda en la conversación-departamento, no en conductor.

## el formato

```markdown
# <título corto, imperativo, minúsculas>

## contexto
<1-3 frases. qué pasa, qué decisión lo origina, qué archivo de docs/memory/ lo respalda>

## objetivo
<una sola oración. qué cambia en el repo cuando esto se ejecuta>

## criterio de PASS
- [ ] <verificable 1>
- [ ] <verificable 2>
- [ ] <verificable 3>

## archivos relevantes
- `<path/a/archivo.tsx>` — <qué se toca>
- `<path/a/otro.ts>` — <qué se toca>
- `<docs/memory/<archivo>.md>` — <decisión que lo origina>

## default si codex no responde en <X>min
<qué hace claude/pablo de mientras para no quedar bloqueado>

## dept origen
<C-suite que pidió esto: cpo | cfo | cmo | cgo | cto | orq>

## dept ejecutor
<quién lo va a hacer: cto (codex usual), cpo (claude), shared>

## prioridad
P0 (bloquea otra cosa) | P1 (esta semana) | P2 (eventual)

## referencias
- decisión canónica: `docs/memory/<archivo>.md`
- handoff previo (si lo hay): `docs/handoff/<archivo>.md`
- búsqueda gbrain: `gbrain query "<tema>"` (memoria semántica completa)
```

## ejemplo concreto

```markdown
# agregar campo dept al frontmatter de docs/memory/

## contexto
itera reorganizó memoria por departamento (ver `docs/memory/metodologia_ritual_cierre_csuite.md`). los archivos viejos no tienen `dept:` en su frontmatter.

## objetivo
los 23 archivos en `docs/memory/` tienen `dept: [...]` en su frontmatter.

## criterio de PASS
- [ ] `bash scripts/lint-memory.sh` exit 0
- [ ] `grep -L "^dept:" docs/memory/*.md` no devuelve archivos
- [ ] INDEX.md tiene sección "## por departamento" funcional

## archivos relevantes
- `docs/memory/*.md` (23 archivos) — agregar campo dept
- `docs/memory/INDEX.md` — agregar vista por departamento
- `scripts/lint-memory.sh` — script nuevo para validación

## default si codex no responde en 30 min
claude lo ejecuta directamente (es housekeeping, no requiere acceso a infra).

## dept origen
orq

## dept ejecutor
shared (claude o codex, lo que sea más rápido)

## prioridad
P1

## referencias
- decisión canónica: `docs/memory/metodologia_ritual_cierre_csuite.md`
- protocolo claude+codex: `docs/memory/metodologia_protocolo_claude_codex.md`
```

## reglas de redacción

- **título imperativo en minúsculas.** "agregar campo X", no "campo X agregado" ni "AGREGAR CAMPO X".
- **contexto breve.** si no cabe en 3 frases, está mal descompuesto — abre dos tickets.
- **PASS verificable.** "funciona bien" no es verificable. "exit 0", "test pasa", "endpoint responde 200" sí.
- **default real.** si el default es *"esperar a que codex responda"*, anti-DAG violado — repensar.
- **paths absolutos desde repo root.** sin `./` ni paths relativos al cwd del agente.

## qué NO va en un ticket conductor

- preguntas abiertas ("¿deberíamos hacer X o Y?").
- dependencias en cadena ("primero esto, después codex hace lo otro, después yo...") — descomponer en tickets independientes.
- secretos, tokens, credenciales en el body — referenciar `.env.local.example` o pedirlos por canal seguro.

## referencia

- protocolo claude+codex: `docs/memory/metodologia_protocolo_claude_codex.md`
- ritual de cierre C-suite: `docs/memory/metodologia_ritual_cierre_csuite.md`
