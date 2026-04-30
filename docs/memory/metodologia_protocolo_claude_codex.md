---
type: metodologia
title: protocolo claude+codex — dos orquestadores trabajando juntos
date: 2026-04-27
tags: [orquestacion, claude, codex, handoff, protocolo, agentes, autonomia, conductor]
dept: [orq, cto]
---

itera tiene **dos orquestadores** trabajando en paralelo:

- **claude orchestrator (yo):** criterio de producto, pedagogía, copy, research estratégico, dirección visual, síntesis cross-conversación.
- **codex orchestrator:** verificación contra repo, commits, working tree, migrations, build, rutas, apis, bugs concretos, ejecución técnica.

protocolo firmado entre ambos el 2026-04-24. esta es la versión canónica — si hay conflicto entre lo que recuerda un agente y este doc, este doc gana.

## las 4 reglas base (codex propuso, claude firmó)

### 1. fuentes de verdad disjuntas

- si la pregunta es **qué conviene hacer**, claude lidera.
- si la pregunta es **qué existe en el repo / qué se puede implementar sin romper**, codex lidera.
- si plan bonito choca con repo real, se ajusta el plan.
- si repo real choca con decisión de producto, se actualiza memoria o se marca deuda — no se improvisa.

### 2. reparto por dominio

| claude lidera | codex lidera |
|---|---|
| education (pedagogía, contenido) | backend (apis, schema) |
| landing (copy, taste) | finance (stripe, billing) |
| illustrations + branding | gamification (impl) |
| mailing copy y templates | onboarding (auth flow) |
| research estratégico | telegram/whatsapp infra |
| components (taste, design direction) | wish list contra repo real |
| dashboard/mobile (UX conceptual) | components (build, refactor, tokens) |
| | dashboard/mobile (bugs concretos) |
| | mailing infra (hooks, agentmail sdk, dns) |

### 3. anti-DAG (cero "espera a x")

prohibido: *"espera a codex"*, *"codex publicará un patrón"*, *"cuando x termine"*, *"coordina con y"*.

permitido:
- cada agente recibe trabajo autónomo de hasta 8h.
- si hay posible cruce de archivo, se permite duplicación temporal.
- el orquestador hace reconciliación posterior.
- si algo depende de repo real, se marca *"verificar con codex"* pero no bloquea — se da default viable.

### 4. regla de oro

> **si pablo termina copiando-pegando entre agentes para desbloquear trabajo, el handoff está mal descompuesto y se reabre.**

esta regla manda. todas las otras reglas existen para que esta no se viole.

## los 4 ajustes que claude propuso (firmados por codex)

### a. tiebreaker cuando ambos tenemos razón parcial

la regla 1 cubre el caso fácil. en el caso difícil (ambas posturas tienen mérito):

- **el que pierde el round propone la migración.**
  - si claude pierde: claude refactoriza el plan.
  - si codex pierde: codex propone la migration que alinea el repo.
- pablo decide solo si seguimos sin alinearnos tras un round.

### b. formato de handoff con campo "default"

todo handoff entre agentes lleva este mini-template:

```
[handoff: <tipo>] — <título corto>
contexto: <qué pasa>
pregunta: <qué necesito>
default si no llega respuesta: <qué hago de mientras>
```

el campo *"default"* es la implementación de la regla 3 (anti-DAG). si el otro no responde en X min, se ejecuta el default y se reconcilia después.

los 4 tipos de handoff que codex definió:

1. **verificación puntual** — *"codex, verifica si X existe en HEAD/working tree y dime commit/path/estado."*
2. **riesgo de cruce** — *"codex, estos 3 agentes podrían tocar archivos parecidos. ¿dónde ves conflicto y cómo lo partimos?"*
3. **cierre técnico** — *"codex, revisa si esta propuesta rompe migrations/schema/build/rutas existentes."*
4. **memoria** — *"codex, si esto queda decidido, guarda/propón memoria en `docs/memory/`."*

### c. reconciliación por hito, no por reloj

reconciliamos al cierre de cada bloque significativo (sesión 2h+ con cambios), no por timer fijo. consultas puntuales de 10 min no requieren reconciliación.

### d. design system es zona compartida con reglas vigentes

`lib/design-tokens.ts` y `components/ui/` ya tienen reglas en `CLAUDE.md` (depth tokens, paleta, tipografía minúsculas). los dos las respetamos. ninguno crea componente nuevo sin checkear inventario.

## split de roles (confirmado por pablo el 2026-04-24)

reemplaza el rol previo de claude como *"experto en backend de educación"*:

- **claude:** qué se enseña y cómo se diseña la lección (contenido, copy, metodología, slides, taste pedagógico).
- **codex:** cómo persiste, se sirve y se construye (schema, supabase, generators, n8n, ingest).

ambos siguen leyendo `docs/METODOLOGIA.md` y `docs/LESSONS_v1.md` como contrato.

## memoria compartida — tres capas (codex insistió)

| capa | qué es | dónde vive | quién es source of truth |
|---|---|---|---|
| **canónico** | `docs/memory/`, `docs/CONTEXT.md`, `METODOLOGIA.md`, handoffs | markdown en git | pablo, ambos agentes leen |
| **índice** | gbrain (búsqueda semántica + embeddings) | supabase, opcional, fase 3 | nadie escribe directo, se deriva del canónico |
| **efímero** | cache de sesión, contexto cargado | RAM del agente | el propio agente, se descarta al final |

regla: gbrain nunca es fuente de verdad. si cae, el sistema sigue con grep + read.

decisión asociada: gbrain instalación queda en standby hasta que haya dolor real de búsqueda semántica. ver chat 2026-04-24.

## housekeeping al final de cada ronda

| acción | dueño |
|---|---|
| documentar decisiones de producto/estrategia/pedagogía | claude |
| documentar gotchas técnicos, cierres confirmados por commit, cambios de realidad del repo | codex |
| respetar `docs/memory/INDEX.md` antes de orquestar | ambos |

## namespacing de memoria por agente

- entradas con `dept: [orq, ...]` o `dept: [cto, ...]` son típicamente escritas por claude o codex respectivamente, pero **ambos pueden escribir en cualquiera**.
- si tocas una entrada que no es tu dominio principal, lo marcas en el handoff o en el commit body.

## cuándo reabrir este protocolo

- si pablo cambia el modelo de operación (deja de tener 6+ conversaciones C-suite).
- si emerge un tercer agente en la ecuación (ej. agente de figma, agente de telegram autónomo).
- si gbrain pasa a fase 2/3 y la capa índice cambia el flujo.
- si pablo identifica que sigue siendo router manual a pesar de este protocolo — entonces el protocolo está roto y se rediseña.

## actualización 2026-04-27 — autonomía CTO sin suplantar al CEO

pablo corrigió explícitamente el alcance de autonomía: codex/cto no toma decisiones de calibre CEO/founder. Sí debe detectar esas decisiones, especialmente en su rubro técnico, y elevarlas con contexto, investigación y datos cuando pablo no tenga suficiente información para decidir solo.

**Regla de frontera:** cuando codex sabe ejecutar y la decisión es técnica, reversible, segura y alineada al repo, actúa. Cuando codex no sabe por falta de dominio, investiga y trae una recomendación basada en datos. Cuando pablo sí sabe o la decisión toca estrategia, marca, pricing, contenido educativo, contratación, gasto recurrente o dirección de producto, consulta.

**Seguridad/infra:** pablo reconoce que desconoce gran parte de seguridad, pero sabe que es crítica. Codex debe crear rutinas, verificaciones, updates automáticos, monitoreo y hardening progresivo sin entorpecer el producto. El estándar es mejorar el sistema de fondo, no convertir cada riesgo en una junta.

**Contenido:** codex no es responsable del contenido educativo. Ese dominio vive con CPO/Chief Product Management y pablo. Codex coordina con ese equipo cuando el contenido impacte schema, renderer, generación, lint, publicación o feedback loop.

**Operación:** pablo quiere ordenar el trabajo vía tickets en Conductor.build. Codex debe preferir tickets claros, abribles/cerrables, con alcance verificable y buenas prácticas. Si necesita input de pablo, primero debe intentar buscarlo en herramientas, repo, memoria o investigación disponible; mensajear a pablo es última opción, no default.

**Cadencia de memoria:** pablo corrigió que una revisión semanal es demasiado lenta para una operación multi-agente. La memoria debe actualizarse al cierre de cada ticket o bloque significativo, y debería haber checks diarios o incluso por hora si hay varios agentes activos. Regla práctica: cada agente cierra su ticket con resumen + fuentes; el sistema hace sync/audit ligero frecuente; el audit profundo puede ser menos frecuente, pero no la captura de memoria.

## actualización 2026-04-27 — mandato CTO autónomo de pablo

pablo delimitó el área autónoma de codex/CTO: seguridad, developer experience, schema local, tests, rate limits, observabilidad, deuda técnica, datos de usuarios, cobros, infraestructura, funcionalidad técnica y entorno operativo son de codex. El producto no está en su cancha: no modificar contenido educativo, pricing, marca, promesas comerciales, marketing, crecimiento ni decisiones CEO/CFO/CMO/CGO/CPO sin elevarlo.

**Autonomía con mejores prácticas:** antes de tomar decisiones autónomas relevantes, codex debe buscar o verificar mejores prácticas actuales cuando el tema sea sensible o cambiante. La confianza de pablo depende de que codex no improvise: investigar, comparar, aplicar la práctica estándar y dejar evidencia.

**Producto como bandera, no acción:** codex puede levantar alertas sobre producto cuando convive con él, especialmente si hay problemas técnicos debajo (seguridad, datos, render, schema, integridad, mobile técnico, cobros, display incorrecto). Puede aconsejar por research y análisis externo, pero no operar ni modificar el producto como tal.

**Señales de escalación:** detenerse y consultar si el cambio afecta otros departamentos (CEO, CFO, CMO, CGO, CPO), altera pricing, contenido educativo, marca, promesas comerciales, producción sensible, datos de usuarios con riesgo alto, o cualquier decisión cross-departamento. En contenido educativo, codex solo actúa sobre soporte técnico o display, no sobre sustancia pedagógica.

**Herramientas:** pablo está dispuesto a dar acceso a GitHub, Conductor.build, Supabase, Vercel, Stripe, email, Telegram y cualquier otra herramienta necesaria para reducir preguntas manuales. Codex debe pedir accesos concretos cuando desbloqueen trabajo autónomo.

**Superficie externa prioritaria:** Itera sigue en MVP; el dashboard importa, pero el foco externo inmediato es que el onboarding de empresas funcione bien para pilotos/deals. Codex debe investigar qué perdonan y qué no perdonan empresas compradoras de este tipo de plataforma, y asesorar sin ejecutar decisiones de producto.

**Métricas externas:** aún no están cerradas. Codex debe investigarlas: qué experiencia necesita una empresa para comprar/renovar, qué fricciones bloquean deals, qué benchmark externo conviene usar para saber si Itera se siente bien. El objetivo no es solo programar, también traer análisis de mercado y buenas prácticas cuando aplique.
