---
type: metodologia
title: estructura de departamentos funcionales (reemplaza posiciones)
date: 2026-05-08
tags: [orquestacion, departamentos, dominios, agentes, refactor]
dept: [orquestador]
---

## departamentos visibles

Estos son los departamentos que deben existir como conversaciones/proyectos visibles cuando pablo organice el sistema:

| conversación | dominio |
|---|---|
| `Itera: Automation` | automatizacion |
| `Itera: Desarrollo` | desarrollo |
| `Itera: Education` | educacion |
| `Itera: Finanzas` | finanzas |
| `Itera: Fundraising` | fundraising |
| `Itera: Imágenes` | imagenes |
| `Itera: Legal` | legal |
| `Itera: Marketing` | marketing |
| `Itera: Orquestador` | orquestador |
| `Itera: Producto` | producto |
| `Itera: Redes Sociales` | redes-sociales |
| `Itera: Ventas` | ventas |

En la captura del 2026-05-08 faltaban tres conversaciones visibles: **Desarrollo, Imágenes y Redes Sociales**.

`datos` y `soporte` siguen siendo dominios válidos para memoria/frontmatter, pero no necesitan conversación visible todavía. Se crean cuando haya trabajo recurrente real: analytics/north star para `datos`; primer cliente, KB, SLA o churn para `soporte`.

## qué cambió y por qué

el 2026-05-04 itera migró del modelo "C-suite virtual" (CEO, CFO, CMO, CGO, CPO, CTO, ORQ, Legal) al modelo **por dominios funcionales**.

el 2026-05-08 pablo confirmó el ajuste de lenguaje y operación: **volver a departamentos, no posiciones/personas**. en la UI de conversaciones/proyectos, el patrón debe ser `Itera: <Departamento>`, no cargos tipo CEO/CPO/CMO ni personajes.

el modelo C-suite simulaba roles humanos. funcionaba pero tenía 3 problemas:

1. **artificio de persona.** "CMO" implica un humano con cv. itera no contrata humanos, opera con agentes. el rol obscurecía la naturaleza real (workflow, no persona).
2. **mezclaba dimensiones distintas.** "CMO" cubría copy + canales + diseño visual + redes sociales — 4 cosas con tools y workflows muy distintos.
3. **dejaba huecos.** "automatización" no era de nadie. "imágenes" caía en CMO pero requería tools propios. "soporte" no existía hasta primer cliente, momento en que nadie estaba listo.

el modelo por dominios resuelve los 3.

## los 14 dominios

| dominio | qué cubre | conversación dueña |
|---|---|---|
| **automatizacion** | crons, hooks, scheduled-tasks, agent workflows que corren solos | `Itera: Automation` |
| **datos** | north star metric, analytics, dashboards, cohort analysis, instrumentation | sin conversación visible por ahora |
| **desarrollo** | backend, schema, infra, security, DX, deploys, dependencies | `Itera: Desarrollo` |
| **educacion** | metodología, casos, practice beats, re-simulación y remediación | `Itera: Education` |
| **finanzas** | costos, runway, forecast, pricing, billing, unit economics | `Itera: Finanzas` |
| **fundraising** | pitch, investor research, deck, data room, network mapping, raises | `Itera: Fundraising` |
| **imagenes** | branding visual, ilustraciones, recraft, figma, video assets | `Itera: Imágenes` |
| **legal** | contratos, privacidad, IP, compliance, gobierno (INPI/INAI/Indautor) | `Itera: Legal` |
| **marketing** | copy, positioning, mensaje, campañas, brand voice, email content | `Itera: Marketing` |
| **orquestador** | sync cross-dominio, scope, OKRs, roadmap, decisiones one-way door | `Itera: Orquestador` |
| **producto** | plataforma, UX, dashboard, features, PRD, user flow | `Itera: Producto` |
| **redes-sociales** | LinkedIn, X, comunidad, contenido founder-led y distribución social | `Itera: Redes Sociales` |
| **soporte** | atención cliente, KB, churn signals, refund SOP, account management | sin conversación visible por ahora |
| **ventas** | pipeline B2B, prospects, outbound, demos, onboarding cliente, renovaciones | `Itera: Ventas` |

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

la mayoría de docs tienen 1 dominio (`dept: [marketing]`). los cross-dominio (reportes, billing, landing) llevan lista (`dept: [producto, marketing]`).

### dueño operativo vs orq

**el orquestador NO ejecuta dominios — los coordina.** si una decisión de marketing requiere eng, orquestador lee marketing y desarrollo, sintetiza, y propone handoff. nunca reemplaza al departamento dueño.

### cuándo usar cada uno

regla mental: **"si esto caería naturalmente en un departamento real, ese dominio es el dueño."**

- ¿un community manager lo haría? → redes-sociales
- ¿es presupuesto, costos o cobros? → finanzas
- ¿es ilustración, assets o dirección visual? → imagenes
- ¿es awareness/mensaje o pipeline/comercial? → marketing o ventas
- ¿es repo, infra, seguridad o deploy? → desarrollo
- ¿es caso, practice beat o metodología? → educacion

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
