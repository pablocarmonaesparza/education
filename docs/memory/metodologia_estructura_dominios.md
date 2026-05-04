---
type: metodologia
title: estructura de dominios funcionales (reemplaza modelo C-suite)
date: 2026-05-04
tags: [orquestacion, dominios, agentes, csuite, refactor]
dept: [orquestador]
---

## qué cambió y por qué

el 2026-05-04 itera migró del modelo "C-suite virtual" (CEO, CFO, CMO, CGO, CPO, CTO, ORQ, Legal) al modelo **por dominios funcionales**.

el modelo C-suite simulaba roles humanos. funcionaba pero tenía 3 problemas:

1. **artificio de persona.** "CMO" implica un humano con cv. itera no contrata humanos, opera con agentes. el rol obscurecía la naturaleza real (workflow, no persona).
2. **mezclaba dimensiones distintas.** "CMO" cubría copy + canales + diseño visual + redes sociales — 4 cosas con tools y workflows muy distintos.
3. **dejaba huecos.** "automatización" no era de nadie. "imágenes" caía en CMO pero requería tools propios. "soporte" no existía hasta primer cliente, momento en que nadie estaba listo.

el modelo por dominios resuelve los 3.

## los 14 dominios

| dominio | qué cubre | dueño operativo |
|---|---|---|
| **automatizacion** | crons, hooks, scheduled-tasks, agent workflows que corren solos | claude code + codex |
| **datos** | north star metric, analytics, dashboards, cohort analysis, instrumentation | claude code (orq lidera) |
| **desarrollo** | backend, schema, infra, security, DX, deploys, dependencies | codex (lado claude code soporta) |
| **educacion** | contenido pedagógico, slides, metodología, lecciones, ejercicios | claude code (curriculum design) |
| **finanzas** | costos, runway, forecast, pricing, billing, unit economics | claude code (CFO) |
| **fundraising** | pitch, investor research, deck, data room, network mapping, raises | claude code (fundraising) |
| **imagenes** | branding visual, ilustraciones, recraft, figma, video assets | claude code (creative) |
| **legal** | contratos, privacidad, IP, compliance, gobierno (INPI/INAI/Indautor) | claude code (legal) |
| **marketing** | copy, positioning, mensaje, campañas, brand voice, email content | claude code (CMO) |
| **orquestador** | sync cross-dominio, scope, OKRs, roadmap, decisiones one-way door | claude code (este chat) |
| **producto** | plataforma, UX, dashboard, features, PRD, user flow | claude code (CPO) |
| **redes-sociales** | TikTok, IG, X, LinkedIn, comunidad, contenido founder-led | claude code (creative + CMO) |
| **soporte** | atención cliente, KB, churn signals, refund SOP, account management | claude code (cuando exista) |
| **ventas** | pipeline B2B, prospects, outbound, demos, onboarding cliente, renovaciones | claude code (CGO + sales) |

## mapping del modelo viejo

para futuras lecturas de docs antes de 2026-05-04:

| viejo | nuevo |
|---|---|
| CEO | orquestador |
| CFO | finanzas |
| CMO | marketing (+ redes-sociales + imagenes según contexto) |
| CGO | ventas |
| CPO | producto (+ educacion según contexto) |
| CTO | desarrollo (+ automatizacion según contexto) |
| ORQ | orquestador |
| Legal | legal |
| Shared | orquestador (asume coordinación) |

## reglas operativas

### dominio único o múltiple

la mayoría de docs tienen 1 dominio (`dept: [marketing]`). los cross-dominio (gamification, mailing, landing) llevan lista (`dept: [producto, marketing]`).

### dueño operativo vs orq

**el orquestador NO ejecuta dominios — los coordina.** si una decisión de marketing requiere eng, orquestador lee marketing y desarrollo, sintetiza, y propone handoff. nunca actúa como cmo o cto.

### cuándo usar cada uno

regla mental: **"si una persona contratada con cv específico haría esta tarea, ese dominio es el dueño."**

- ¿un community manager lo haría? → redes-sociales
- ¿un CFO lo haría? → finanzas
- ¿un illustrator lo haría? → imagenes
- ¿un growth marketer lo haría? → marketing o ventas (según si es awareness o pipeline)
- ¿un VP Eng lo haría? → desarrollo
- ¿un instructional designer lo haría? → educacion

si dudas entre 2, lista los 2 y avanza.

### dominios silenciosos

el linter (`bash scripts/lint-memory.sh`) reporta dominios sin output (>7d). al iniciar 2026-05-04 hay 5 dominios vacíos:

- **datos:** crítico, primero a llenar (north star metric definida)
- **fundraising:** depende de cuándo arranque pablo
- **redes-sociales:** depende de cuándo arranque content founder-led
- **soporte:** crítico desde primer paying user
- **ventas:** crítico desde primer outbound

el silencio NO es deuda automática — es señal de que ese dominio aún no tiene actividad. solo es problema si hay actividad sin documentar.

## ritual de cierre por dominio

ver `metodologia_ritual_cierre_dominio.md`. cada conversación-dominio escribe a `docs/memory/<tipo>_<slug>.md` con frontmatter `dept: [<dominio>]` antes de cerrar.

## skills planeados (uno por dominio)

cuando se implementen, vivirán en `.claude/skills/itera-<dominio>/SKILL.md`:

- `itera-automatizacion`
- `itera-datos`
- `itera-desarrollo` (lado claude — codex tiene su AGENTS.md)
- `itera-educacion`
- `itera-finanzas`
- `itera-fundraising`
- `itera-imagenes`
- `itera-legal`
- `itera-marketing`
- `itera-orquestador` (este chat)
- `itera-producto`
- `itera-redes-sociales`
- `itera-soporte`
- `itera-ventas`

los 4 existentes (`itera-context`, `itera-memory-save`, `itera-memory-load`, `itera-review`) son cross-dominio y no se renombran.

## cuándo reabrir esta estructura

- si un dominio acumula >20 docs y necesita subdividirse (ej. desarrollo → backend + frontend + infra).
- si un dominio queda vacío >90 días sin justificación → eliminar.
- si emerge un dominio nuevo no contemplado (ej. partnerships, eventos físicos).
- si el modelo se vuelve carga en lugar de claridad — entonces se rediseña.
