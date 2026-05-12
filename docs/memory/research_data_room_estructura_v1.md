---
type: negocio
title: data room estructura v1 — baseline pre-wedge
date: 2026-05-09
tags: [fundraising, data_room, dd, cap_table, founder_bio, market_sizing, raise_target, baseline]
dept: [fundraising]
---

## resumen

estructura del data room de itera v1. baseline reusable: aplica con o sin wedge final lockeado. cuando el pivot cierre los 5 inputs (wedge / icp / métrica norte / pricing / canal), las secciones marcadas como `[post-wedge]` se rellenan; el resto ya tiene baseline.

principio operativo: **no inventar números.** donde no hay dato real, queda placeholder explícito o supuesto razonado con `[assumption: ...]`. coherente con `research_yc_canon_2026.md` § "be truthful and precise about revenue" — garry tan abril 2026.

## qué es un data room (y qué no)

un data room es la carpeta única que un investor pide **después** de una primera reunión con interés. contiene los documentos que el fondo necesita para decidir si invierte. **antes** de la primera reunión, el data room no se manda — solo deck + 1-pager.

para pre-seed / seed, el data room es ligero. para series a+, se vuelve serio (auditoría, contratos firmados, model financiero detallado). itera está en pre-seed → optamos por data room ligero y muy bien hecho.

## estructura del data room itera v1

### 1. one-pager (resumen ejecutivo)

`[post-wedge — depende de wedge final]`

una página, máximo 400 palabras. incluye:

- one-liner (test mamá-5s — ver `research_yc_canon_2026.md`)
- problema concreto + tamaño de mercado (1 número)
- producto (qué hace, no cómo)
- tracción (3 números: wau, mom%, mrr o paying users)
- founder credibility (1-2 frases)
- ask (raise target + uso de fondos resumido)

best practice heredada del canon yc.

### 2. deck (10-12 slides)

`[post-wedge en contenido — la estructura ya está alineada]`

cada slide se prepara como todo separado en el departamento fundraising:
1. misión
2. problema
3. solución
4. producto
5. demo (video 60s, no slide)
6. comunidad
7. mercado
8. go-to-market
9. modelo de negocio
10. equipo
11. financiamiento
12. momento (why now)
13. tracción

cuando wedge se lockee, los slides se reescriben con la versión final. la estructura no cambia.

### 3. cap table preliminar

**estado actual (verificable hoy):**

- pablo carmona esparza — 100% common equity
- sin safes, sin convertible notes
- sin advisors con equity, sin empleados con equity, sin contractors con equity
- sin entidad legal incorporada todavía
- plan post-aceptación yc o pre-ronda formal: incorporar delaware c-corp con founder vesting estándar (4 años, 1 año cliff)
- sin option pool todavía — se crea con el primer hire o ronda formal

**tabla cap table ilustrativa post-aceptación yc** (números recalcular al incorporar):

```
stakeholder              | shares      | %       | tipo
pablo carmona esparza    | 8,000,000   | ~80%    | common (founder, vested 4y/1y cliff)
yc safe ($125k @ 7%)     | -           | ~7%     | safe post-money fijo
yc mfn ($375k uncapped)  | -           | -       | safe mfn (sin cap, conversion en próxima ronda)
option pool reservado    | 1,000,000   | ~10%    | options no asignadas
buffer próxima ronda     | 300,000     | ~3%     | reservado
```

`[assumption: shares ilustrativos. el % real depende del cap que cierre la mfn en próxima ronda y del tamaño de la ronda formal post-yc.]`

post-yc, esto se redondea con un abogado de delaware c-corp standard (cooley / wsgr / orrick / clerky para cheap).

### 4. founder bio

plantilla a llenar por pablo. estructura recomendada (1 página máximo):

**pablo carmona esparza** — founder & ceo, itera

- **background técnico:** `[todo pablo: ¿desde qué edad codeas? ¿lenguajes/stacks principales antes de itera? ¿proyectos previos con métricas concretas?]`
- **educación:** `[todo pablo: institución, carrera, año. si hay overlap con anáhuac alumni network mencionado en context, anotarlo.]`
- **experiencia previa:** `[todo pablo: roles previos formato drew houston — "construí x que hizo y medible". cualquier startup, side project con tracción real, exits aunque sean pequeños, partnerships.]`
- **por qué itera, por qué tú:** "soy mexicano no-técnico-vuelto-técnico. aprendí a codear en mis veintes por trial and error. los 650m latam no-técnicos están en el mismo trap. los entiendo porque fui ellos." `[draft — refinar con pablo, añadir 1 dato cuantificado]`
- **logros cuantificables medibles:** `[todo pablo: 2-3 logros específicos con números. evitar "estudió x en y" — usar "construí x que hizo y medible".]`

bio para deck = 1 frase + 1 logro. bio para landing = más narrativa. bio para data room = 1 página.

### 5. market sizing

**datos verificables hoy (de research ya cargada en memoria):**

- **latam corporate training market:** $24.8b usd en 2025 → $43.6b proyectado a 2034. cagr 6.27% durante 2026-2034.
- **brasil lidera** el mercado actual.
- **ai literacy gap empresarial:** 82% de enterprises ofrecen ai training, 59% reporta skills gap. solo 35% tiene programa de upskilling maduro. organizaciones con programa maduro reportan ~2× roi.
- fuentes detalladas: ver web research del 2026-05-09 capturada en memoria de la conversación de fundraising (datacamp 2026, tredence 2026, openpr / market research 2026-2034).

`[post-wedge]`: si wedge angosta a un sub-segmento (ej: "ai readiness para mid-market mexicanas 100-500 empleados"), recalcular tam/sam/som:

```
tam (global ai corp training) — $x
sam (latam corp training, post-wedge filter) — $y
som (capturable a 5 años, post-wedge) — $z
```

regla operativa: cada número con fuente + año. nunca slide de mercado con "$2 trillion ai market" sin filtrar.

### 6. comparables

ver doc separado: `research_comparables_simulator_b2b_2026.md` (en escritura paralela).

comparables clave que se documentarán: wharton interactive, forage, attensi, mursion, whatfix mirror, section ai.

para data room, el output relevante es **1 tabla resumen + 2 frases** de "qué entendemos nosotros que ellos no":

```
| comparable | última ronda | valuación | pricing model | nuestro diferencial |
```

### 7. raise target + uso de fondos

`[post-wedge — depende de cuánto pedir]`

**marco para definir el raise:**

**pre-yc (si entramos a f26 o w27):**
- $500k yc standard deal ($125k safe @ 7% post-money + $375k mfn uncapped)
- diluye 7% + lo que mfn cierre en próxima ronda
- sin negociación posible — es estándar yc desde 2022 (ver `research_yc_canon_2026.md`)

**pre-seed independiente (si yc cae):**
- target: $300-500k usd
- estructura: safe post-money con cap (no priced round)
- cap depende de tracción a momento del raise:
  - pre-revenue + producto live → cap $5-8m post
  - $5-10k mrr + 10% w/w → cap $8-15m post
  - $20k+ mrr → cap $15-25m post
- lead: angel(s) o pre-seed micro-fund

**seed post-yc o post-pre-seed:**
- target: $1.5-3m usd
- estructura: priced round, conversion de safes anteriores
- valuación: anchored a benchmark del batch yc (w26 default $4m @ $40m post; pre-seed sin yc más bajo, ver `research_yc_traccion_benchmarks_w24_w26.md`)

**uso de fondos macro (ejemplo $300-500k pre-seed):**

```
hire (1-2 personas, 12 meses)              50%   = $150-250k
infra + ai apis (12 meses)                 15%   = $45-75k
marketing / canal principal                 20%   = $60-100k
runway buffer / contingencia                10%   = $30-50k
legal / incorporación / contratos            5%   = $15-25k
total                                      100%   = $300-500k
```

`[post-wedge]`: ajustar % según canal principal:
- si canal es content founder-led → marketing 5-10%
- si canal es paid acquisition → marketing 30-40%
- si canal es enterprise outbound → people 60-65% (sales hire), marketing 5-10%

**justificación del raise para deck:**
- "$x levanta 12-18 meses de runway con equipo de 2-3"
- "llegamos a $y mrr / z métrica norte para series a"
- "series a target: $1.5-2.5m arr, 3-4× growth post-pre-seed"

### 8. tracción real

estado vigente (2026-05-09): pre-revenue, producto en exploración estratégica post-pivot.

`[post-wedge + post-tracción]`: cuando se rompa el cero, esta sección se vuelve la más importante. estructura:

```
métrica norte: [valor actual] [delta semanal] [delta mensual]
usuarios activos: [wau / mau]
revenue: [mrr si aplica, jerarquía garry: loi → gmv → carr → transactional → mrr/arr — nunca llamar transactional a arr]
retención: [d7 / d30 cohort si aplica]
crecimiento: [w/w o mom% últimas 6-8 semanas, no smoothed]
```

**hoy, sin tracción real, esta sección queda:**

> "producto en transición tras pivote estratégico (mayo 2026). métrica norte y wedge final en proceso de lockeo durante fase 1 del plan 86 días. tracción reportada al momento de cada conversación con investor."

honestidad sobre el reset > inflar números. ver `research_yc_canon_2026.md` § "lo que matan: mentir = descalificación permanente. garry: 'you're gonna go to jail'".

### 9. modelo financiero / projections

`[post-wedge + post-pricing]`

sheet de 36 meses con:

- ingresos por tier (individual / team / enterprise) — postula tras pricing final
- cogs (anthropic api, supabase, agentmail, stripe fees, openai embeddings, cohere rerank)
- gross margin per tier
- opex (people, tooling, marketing)
- burn mensual + cash position acumulada
- runway

**lo que SÍ se puede hacer hoy** (sin wedge ni pricing final):

- costos ai apis por usuario activo (perfil de uso típico de las 100 lecciones existentes en producción)
- stripe fees por transacción (usd, mexico merchant)
- costos infra fijos:
  - supabase pro $25/mes (necesario para hibp y otros features pro — ver `negocio_supabase_plan_free_hibp_bloqueado.md`)
  - vercel pro / next.js hosting
  - agentmail (transaccional only — ver `decision_mailing_transaccional_only.md`)
  - dominios + servicios menores

cuando wedge cierre, este baseline se levanta a sheet completo.

### 10. anexos

- **stack técnico** (1 página): next.js 15 / react 19 / tailwind / supabase / postgres 17 / pgvector / anthropic / openai / cohere / stripe / agentmail / vercel.
- **roadmap producto** (1 página, post-wedge).
- **legal:** pablo es solo founder, sin obligaciones outstanding. backlog v1 documentado en `decision_legal_backlog_v1.md`.
- **políticas:** privacidad + términos ya en producción en itera.la.
- **press / mentions:** `[todo: si los hay, listar. si no, omitir sección.]`

## qué NO va en el data room v1

- auditorías financieras → no aplica para pre-seed solo founder bootstrapped
- contratos enterprise firmados → no existen todavía (flageado en `research_yc_canon_2026.md`)
- patentes / ip exclusivo → no aplica
- cap table con múltiples stakeholders → pablo es 100%, no hay nadie más
- letras de intención (lois) → solo si son reales y firmadas. inventarlas mata la app.

## flujo de uso del data room

1. **antes de primera reunión:** solo deck + 1-pager. **no** mandar data room.
2. **después de primera reunión exitosa:** mandar link (notion / google drive / docsend para tracking de quién abre qué).
3. **dd process:** investor pregunta → responder con sección específica + 1 frase de contexto.
4. **updates:** cuando hay nueva tracción material, actualizar one-pager + sección 8 (tracción) + sección 5 (market sizing si cambió por wedge final).

## handoff cuando wedge se lockee

cuando los 5 inputs del pivot cierren (ver `research_yc_plan_86_dias.md` § inputs sprint 1), revisar este doc y rellenar las secciones marcadas `[post-wedge]`:

1. one-pager — reescribir con wedge final
2. deck — los 13 todos del departamento fundraising se ejecutan con wedge final
3. cap table preliminar — confirmar delaware c-corp si avanza la incorporación
4. founder bio — pablo llena los `[todo pablo: ...]` directamente
5. market sizing — recalcular tam/sam/som con wedge filter
6. comparables — el doc paralelo se revisa contra wedge final para ajustar "qué entendemos que ellos no"
7. raise target — definir monto y estructura
8. tracción — sección activa cuando se rompa el cero
9. modelo financiero — sheet 36 meses con pricing real

## todos del departamento fundraising que dependen de este baseline

- pitch (misión / problema / solución / producto / demo / comunidad / mercado / gtm / modelo / equipo / financiamiento / momento / tracción) — se ejecutan post-wedge encima de las secciones 1-2 y 5-9 de este doc.
- y combinator (desde cero) — el data room es input para la app de yc; one-pager + tracción + bio van directo a campos del form.
- inversores (research) — se cruza con `research_inversores_b2b_simulator_ai_readiness_2026.md` (paralelo) para shortlist de outreach.

## related

- `research_yc_canon_2026.md` — anatomía de la app, formato truthful en revenue, "be truthful and precise" garry tan 2026.
- `research_yc_plan_86_dias.md` — fechas de los 2 shots f26 + w27, dictan timing del raise.
- `research_yc_traccion_benchmarks_w24_w26.md` — benchmarks de valuación por batch.
- `research_comparables_simulator_b2b_2026.md` — comparables (paralelo, en escritura).
- `research_inversores_b2b_simulator_ai_readiness_2026.md` — mapping de inversores (paralelo, en escritura).
- `decision_tesis_concentracion_plataforma.md` — tesis vigente y estado de exploración.
- `decision_legal_backlog_v1.md` — items legales prioritarios.
