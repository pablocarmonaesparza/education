# METRICS v1 — KPIs growth de itera mapeados a PostHog

> Métricas core que CGO necesita para decidir, mapeadas a los eventos de [`docs/research/R15_analytics_stack.md`](../research/R15_analytics_stack.md). Handoff a CTO para instrumentar.
>
> **Owner:** CGO. **Consumido por:** CTO (instrumenta), CMO (optimiza canal), CEO (decide foco), CFO (modela LTV/CAC).
>
> **Lo que NO es:** stack de analytics (decidido en R15: PostHog Cloud US, free tier). Catálogo completo de eventos (R15 §6 lo cubre). Métricas de producto puras (CPO las define).

---

## 1. TL;DR — los 10 KPIs core

Ordenados por importancia decreciente. Si solo medimos 10, son estos:

| # | KPI | Definición | Fase del funnel | Frecuencia |
|---|---|---|---|---|
| 1 | **Empresas en pipeline B2B con ≥1 champion activo** | North star CGO | 5+6 | Semanal |
| 2 | **Activación D2** | % signups que vuelven día 2 a empezar segunda lección | 4 | Diaria |
| 3 | **Champion identification rate** | % signups individuales que cualifican como champion en 14 días | 5 | Semanal |
| 4 | **Demo agendada → contrato cerrado** | conversion de fondo de funnel | 6+7 | Por cohorte |
| 5 | **Signups individuales con email corporativo / semana** | leading indicator de pipeline B2B | 1-3 | Semanal |
| 6 | **Source attribution** | qué canal trae signups (UTM) | 1 | Semanal |
| 7 | **Time-to-first-lesson (TTFL)** | mediana de horas signup → primera lección completa | 3-4 | Diaria |
| 8 | **Activación D7** | % completan ≥3 lecciones en 7 días | 4 | Diaria |
| 9 | **Sales cycle days** | mediana de días primer contacto → contrato firmado | 6+7 | Por cohorte |
| 10 | **NRR rolling 90 días** | net revenue retention (post-pmf) | 7 | Mensual |

**Hoy podemos medir 0 de los 10** porque PostHog no está wired. Esto es el bloqueante #1 del CGO en semana 1.

---

## 2. north star — empresas en pipeline B2B con ≥1 champion activo

**Definición operativa:**

Una "empresa en pipeline" es una organización (identificada por domain de email) donde:
- ≥1 user individual tiene email @{domain de la empresa}
- Ese user tiene comportamiento que cumple ≥4 de las 7 señales de champion (ver `ICP_v2.md` §3 + futuro `CHAMPION_HEURISTIC_v1.md`)
- Empresa cae en R13 segmentos A o B (filtro size + sector)

**Fórmula:**
```
NORTH_STAR = COUNT(DISTINCT company_domain) WHERE
  COUNT(users WITH champion_score >= 4 AND domain = company_domain) >= 1
  AND company_meta.fits_R13_segment IN ('A', 'B')
```

**Por qué esta:**
- Pre-revenue: MRR es 0 los primeros 60 días. Necesitamos métrica que ya se mueve hoy.
- Refleja la apuesta PLG-dentro-de-B2B (no signups solos, no MRR — la intersección).
- Drives behavior correcto: CMO debe atraer al perfil correcto, no solo volumen.
- Cuando empieza a haber MRR, esta métrica predice MRR con 30-60 días de adelanto.

**Cuándo retirarla:** cuando ≥10 empresas tengan contrato firmado. Ahí mover NS a NRR rolling 90.

**Implementación PostHog:**
- Group analytics activo desde día 1 (R15 §6: `posthog.group('company', companyId)`)
- `companyId` derivado de domain de email en signup
- Custom property `champion_score` calculado server-side, sync periódico a PostHog
- Custom property `fits_segment` derivado de enrichment via Clay/Apollo (cuando esté wired)

---

## 3. KPIs por fase del funnel

### Fase 1-2 — Awareness + Consideration

| KPI | Definición | Evento PostHog | Target F1 (validación) |
|---|---|---|---|
| Visitas únicas/semana a landing | unique sessions | `$pageview` con identify=anon | 200-500 |
| Source attribution | UTM source/medium del primer touch | `$pageview` con `utm_*` props | mix legible (no "direct" >50%) |
| Engagement landing | scroll depth + tiempo en página | `landing_engaged` (custom: scroll>50% AND time>30s) | ≥30% de visitas |
| CTA primary click rate | % clicks en CTA signup | `cta_clicked` con `cta_id='signup'` | ≥10% de visitas |
| CTA demo click rate | % clicks en CTA demo | `cta_clicked` con `cta_id='demo'` | ≥3% de visitas |

**Owner ejecución:** CMO. **Owner medición:** CGO + CTO.

### Fase 3 — Signup

| KPI | Definición | Evento PostHog | Target F1 |
|---|---|---|---|
| Signups/semana | nuevos accounts creados | `signup_completed` (R15 §6) | 20-50 |
| Signup completion rate | signups completados / signups iniciados | ratio `signup_completed`/`signup_started` | ≥80% |
| % signups con email corporativo | filtra @gmail @hotmail @outlook @yahoo | property `email_domain_type='corporate'` | ≥40% |
| Welcome email delivery | transaccional sin bounces | (handoff a CTO + CFO via AgentMail) | ≥98% |

**Owner ejecución:** CPO + CTO. **Owner medición:** CGO.

### Fase 4 — Activación

**La más importante de todas las fases.** Sin activación no hay champion, sin champion no hay pipeline.

| KPI | Definición | Evento PostHog | Target F1 |
|---|---|---|---|
| **TTFL** (Time-to-First-Lesson) | mediana horas signup → primera `lecture_completed` | derivado de `signup_completed` + `lecture_completed` | <2 horas |
| **Activación D1** | completan primera lección día del signup | cohort: `lecture_completed` count≥1 within 24h of `signup_completed` | ≥40% |
| **Activación D2** | vuelven día 2 a iniciar segunda lección | cohort: `lecture_started` event_count≥2 across ≥2 distinct days | ≥25% |
| **Activación D7** | completan ≥3 lecciones en 7 días | cohort: `lecture_completed` count≥3 within 7d | ≥15% |
| Drop-off por slide kind | dónde abandonan dentro de lección | funnel `lecture_started`→`slide_completed`(by kind) | identificar kinds problemáticos |
| Streak D3 | usuarios con racha activa de ≥3 días consecutivos | derivado de `user_stats.dailyStreak` | ≥10% |

**Owner ejecución:** CPO. **Owner medición:** CGO + CPO.

### Fase 5 — Champion identification

| KPI | Definición | Evento PostHog | Target F1 |
|---|---|---|---|
| Champion candidates/semana | users con champion_score≥4 | custom event `champion_qualified` | ≥3 |
| Champion conversion rate | % de signups individuales que califican como champion en 14 días | cohort | ≥10% |
| Champions per company | promedio de champions activos en empresas con ≥1 champion | derivado | ≥1.2 |
| Champion → demo agendada (su empresa) | % de champions cuya empresa agenda demo | manual tracking inicialmente | ≥30% |

**Owner ejecución:** CGO (define + score). **Owner medición:** CGO + CTO (instrumenta).

### Fase 6-7 — Outbound + Cierre

| KPI | Definición | Fuente | Target F1 |
|---|---|---|---|
| Demos agendadas/semana | total demos en calendario | Calendar/CRM (no PostHog) | ≥3 |
| Demo show rate | % de demos agendadas que ocurren | manual tracking | ≥80% |
| Demo → propuesta enviada | % de demos que avanzan | manual tracking | ≥50% |
| Demo → contrato firmado | conversion final | manual tracking | ≥15% |
| Sales cycle days | mediana días primer touch → contrato | manual tracking | <60d (target R02 F2) |
| **ACV inicial** | revenue contrato firmado | Stripe + manual | $1,500-3,500 (R02 §5) |
| Cohorte cold vs champion-assisted | conversion comparada | manual tracking | champion-assisted ≥2× |

**Owner ejecución:** CEO. **Owner medición:** CGO (analiza cohort) + CFO (LTV/CAC).

### Loop — Retención (post-cierre)

| KPI | Definición | Fuente | Target F2+ |
|---|---|---|---|
| MRR | recurring revenue mensual | Stripe | crecimiento mes/mes |
| Churn anual rolling | % de cuentas perdidas anual | Stripe + cohort | <10% (R02 §6) |
| **NRR rolling 90d** | (MRR_inicial + expansion - churn - downgrade) / MRR_inicial | derivado Stripe | >100% |
| Seats por empresa (mediana) | cuántos seats activos / cuenta | DB | crecimiento mes/mes |
| LTV efectivo | ACV / churn rate | derivado | ≥$15k F1, ≥$27k F2 |

**Owner ejecución:** CPO (delivery del pilot). **Owner medición:** CFO + CGO.

---

## 4. métricas de canal — qué optimizar dónde

Heredado de R02 §3 + tabla §4. Por canal:

| Canal | KPI prioritario | Target F1 | Owner |
|---|---|---|---|
| Founder-led outbound | Demos agendadas/semana | ≥3 | CEO |
| LinkedIn organic | Inbound leads/semana | ≥1 | CMO + CEO |
| TikTok personal pablo | Signups attributed/semana | ≥5 (si T1=PLG) | CMO |
| Partnerships warm | Intros agendadas/semana | ≥1 | CEO + CGO |
| Paid ads | NO ACTIVAR F1 (R02 §7) | — | — |

---

## 5. dashboard mínimo que necesito (ask a CTO)

**3 vistas en PostHog:**

**Dashboard 1 — Funnel completo (vista CGO/CEO diaria)**
- Visits → Signups → Activación D2 → Champion qualified → Demo agendada → Contrato firmado
- Cada step con conversion rate %
- Filtros: por canal (UTM source), por semana, por segmento R13

**Dashboard 2 — Activación deep-dive (vista CPO+CGO diaria)**
- TTFL distribución
- D1/D2/D7 cohort comparison semana-a-semana
- Drop-off por slide kind
- Streak distribution

**Dashboard 3 — Champion + pipeline (vista CGO+CEO semanal)**
- Lista de champion candidates ranked by score
- Lista de empresas en pipeline con detalle de champions
- Cohorte cold vs champion-assisted

**Tooling:**
- PostHog Insights + Cohorts (R15)
- Group analytics activo (R15 §6)
- Eventos custom listados en §3 (handoff CTO)
- Enrichment de domain → company → segment via Clay/Apollo (futuro, no F1)

---

## 6. instrumentación crítica que falta hoy

Listado para handoff a CTO. Sin esto el funnel es ciego:

| Item | Prioridad | Estimado |
|---|---|---|
| 1. Wire PostHog SDK en Next.js (R15 §5) | P0 | 2h |
| 2. Eventos R15 §6 + custom de §3 de este doc | P0 | 4h |
| 3. UTM capture en `$pageview` + persistence en signup | P0 | 1h |
| 4. Group analytics: `posthog.group('company', domain)` en signup | P0 | 1h |
| 5. Property `email_domain_type` (corporate/personal) | P0 | 1h |
| 6. Cohort definitions D1/D2/D7 en PostHog UI | P0 | 1h |
| 7. Welcome email delivery tracking via AgentMail webhook | P1 | 3h |
| 8. Champion score sync (custom property server-side) | P1 | 4h |
| 9. Domain enrichment via Clay/Apollo (size + sector) | P2 | 8h |
| 10. CRM/calendar integration para demos agendadas | P2 | 6h |

**Total P0:** ~10h de CTO. Es el bloqueante del CGO esta semana.

---

## 7. lo que NO vamos a medir (decisiones explícitas)

Para no entrar en metric porn:

- **Vanity metrics:** total users, total signups, total visits sin contexto de calidad.
- **Métricas que no afectan decisión:** time on page sin scroll context, click maps de elementos no críticos.
- **NPS/CSAT formal en F1:** demasiado caro de operar con <50 users. Re-evaluar F2.
- **Activación D30 antes de F2:** F1 dura ~60 días total; D30 contamina si se mide muy pronto.
- **CAC blended antes de F2:** los canales en F1 son mayoritariamente $0 marginal (founder time). El cálculo serio entra en F2.

---

## 8. cuándo cambian estas métricas

**F1 → F2 (al alcanzar 5-10 design partners pagando):**
- North star pasa de "empresas con champion" a "ARR + sales cycle"
- Activación D7 se vuelve más importante que D2
- LTV/CAC entra como métrica primaria

**F2 → F3 (al alcanzar $100k ARR):**
- North star pasa a NRR rolling 90 días
- Channel diversity entra como KPI (≥3 canales con >10% MRR)
- CAC payback como métrica de salud

---

## 9. tensiones abiertas que afectan métricas

| # | Tensión | Métrica afectada | Voto preliminar CGO |
|---|---|---|---|
| T1 | PLG sí/no | NS + KPIs 3, 5, 7, 8 (PLG-driven) se simplifican o se eliminan | Confirmar PLG |
| T2 | Pricing | LTV, CAC payback, ACV target | Esperar reframe CFO |
| T3 | Producto B2B timeline | Cuándo activar KPIs §3 fase 6-7 | Necesito timeline |

---

## 10. dependencias

| Doc | Qué aporta |
|---|---|
| [`R15_analytics_stack.md`](../research/R15_analytics_stack.md) | Stack + eventos base |
| [`R02_distribucion_latam.md`](../research/R02_distribucion_latam.md) | Métricas norte por fase F1/F2/F3 |
| [`R13_icp_definition.md`](../research/R13_icp_definition.md) | Filtros de segmento para cohort |
| [`FUNNEL_MAP.md`](./FUNNEL_MAP.md) | Owners por fase + tensiones |
| [`ICP_v2.md`](./ICP_v2.md) | Definición operativa de champion |
| `decision_gamification_duolingo_b2b.md` (memoria) | Mecánicas permitidas — afecta qué se puede medir como activación |

---

**Versión 1** — 2026-04-27. Re-evaluar tras: (a) wire PostHog y 4 semanas de datos reales, (b) decisión T1, (c) primer contrato B2B cerrado.
