---
type: research
title: Retention metrics B2B SaaS assessment — contract→expansion no ARR clásico
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: define las métricas de retention que importan para Itera Simulador (B2B SaaS assessment con contratos discretos $4-15K, no recurring SaaS). Establece definiciones canónicas para tracking en v1_launch_playbook week 4/12 + v2_roadmap F4
related:
  - docs/strategy/v1_launch_playbook.md (week 12 RETENTION metrics)
  - docs/strategy/v2_roadmap_post_customer_zero.md (F4 CAC payback evaluation)
  - docs/research/pricing_anchor_v2.md (M9-3-D6 upgrade trigger metric)
  - docs/research/buyer_persona_head_marketing_latam.md
---

# Retention metrics B2B SaaS assessment

## TL;DR

Itera NO es B2B SaaS clásico (ARR/MRR/NRR/Churn estándar). Es **B2B SaaS assessment** con contratos discretos pago-único ($4-15K) por sprint. Las métricas estándar SaaS no aplican directamente — requieren adaptación.

**Métricas canónicas adaptadas para Itera:**

1. **Repeat Contract Rate (RCR)** = % de orgs que contratan ≥2 sprints en 12 meses ≈ retention real
2. **Expansion Revenue Rate (ERR)** = revenue del 2do contrato como % del 1ro (upsell signal)
3. **Time to Repeat Contract** = días entre sprint 1 cerrado y sprint 2 contratado
4. **CAC Payback (sprint level)** = sprints contracted necesarios para recuperar costo de adquisición del primer customer
5. **NPS post-sprint (90d delayed)** = sentiment medido 90 días después de cierre del sprint, no inmediato

**Target verde v1:** RCR ≥40% a 12 meses, ERR ≥110%, CAC payback <2 sprints.

## Por qué métricas clásicas SaaS NO aplican directo

| Métrica clásica SaaS | Por qué NO aplica directo a Itera v1 | Adaptación |
|---|---|---|
| **MRR** (Monthly Recurring Revenue) | Itera NO es recurrente — sprints son pago único por 30/45/90 días | Reemplazado por Sprint Revenue (SR) |
| **ARR** (Annual Recurring Revenue) | Mismo problema. Itera puede tener 0 ARR pero $X en sprints anuales | Reemplazado por Annualized Contract Revenue (ACR) = sum sprints completados en 12 meses |
| **Churn rate** | "Churn" requiere subscription continua. Itera tiene "expired sprints" — fenómeno distinto | Reemplazado por Non-Repeat Rate (NRR) = % orgs que NO contratan 2do sprint |
| **NRR/GRR** (Net/Gross Revenue Retention) | Mismo issue de subscription continua | Reemplazado por Repeat Contract Revenue (RCR$) = revenue del 2do sprint / revenue 1ro |
| **DAU/MAU** | Itera NO es daily use product — uso es event-driven (sprint window) | Reemplazado por Active Sprint Sessions = participantes activos en sprint window |
| **LTV** (Lifetime Value) | Requiere "vida" estimable. Itera v1 muy temprano para estimar LTV | Diferido — solo válido post 50+ customers |

## Métricas canónicas Itera v1+v2

### 1. Repeat Contract Rate (RCR)

**Definición:** % de orgs que contratan al menos 2 sprints (cualquier combinación: Diagnóstico→Diagnóstico, Diagnóstico→Sprint, Sprint→Track, etc.) dentro de 12 meses del primer cierre.

**Cálculo:**
```
RCR = (orgs con ≥2 sprints cerrados en 12m) / (orgs con ≥1 sprint cerrado hace 12+ meses)
```

**Target verde v1:** ≥40% a 12 meses.

**Por qué 40%:** anchor mid-market B2B assessment industry (Workera, Section, Coursera Business reportan 30-50% reorder en 12m según OpenView 2024 + Bessemer SoC 2025). Empezar conservador.

**Cuándo medible:** primer dato 12 meses post-customer-zero. Antes, métrica proxy es Repeat Contract Intent (ver abajo).

### 2. Expansion Revenue Rate (ERR)

**Definición:** revenue del 2do contrato como % del 1er contrato, por org.

**Cálculo:**
```
ERR = revenue_2do_contrato / revenue_1er_contrato
```

**Targets:**
- **ERR < 100%**: down-sell (org redujo seats o cambió a tier menor) — signal negativo
- **ERR = 100%**: lateral repeat (mismo tier mismo seats) — signal neutro
- **ERR 100-150%**: organic expansion (más seats o upgrade tier) — verde
- **ERR ≥ 150%**: aggressive expansion (multi-tier upgrade) — excelente

**Target verde v1:** mediana ERR ≥110% en customers con repeat.

### 3. Time to Repeat Contract (TTRC)

**Definición:** días entre fecha de cierre del 1er sprint y fecha de contratación del 2do.

**Target verde v1:** mediana ≤120 días (4 meses).

**Interpretación:**
- **<60 días**: contratación impulsiva o relación muy fuerte
- **60-120 días**: signal de fit — sprint generó pain que justifica seguir
- **120-240 días**: cooling period normal — org evaluó, decidió
- **>240 días**: signal de stalled relationship — probable no-repeat

### 4. CAC Payback (sprint level)

**Definición:** número de sprints necesarios para recuperar el costo de adquisición de un customer.

**Cálculo:**
```
CAC = total sales+marketing spend / new customers cerrados (mismo período)
Avg Sprint Revenue = mean(revenue) de todos sprints cerrados
CAC Payback (sprints) = CAC / Avg Sprint Revenue
```

**Target verde v1:** <2 sprints (un customer rentable después de 1-2 contratos).

**Por qué 2:** B2B mid-market healthy CAC payback es 12-18 meses (ChartMogul 2024). Si cada sprint cierra en ~6 meses elapsed, 2 sprints = 12 meses payback. Aceptable.

**Caveat v1:** sin marketing spend formal (M9-3-D18 cero paid acquisition), CAC = mostly Pablo time + overhead. Estimación rough vs precise.

### 5. NPS post-sprint (90d delayed)

**Definición:** Net Promoter Score medido 90 días después del cierre del sprint (NO inmediato).

**Por qué 90 días:** post-sprint immediate NPS está sesgado por "deliverable shine" — el reporte ejecutivo recién entregado se ve impresionante. 90 días después, mide si el reporte se USÓ o se archivó.

**Cálculo:**
```
NPS = % promoters (9-10) − % detractors (0-6)
```

**Target verde v1:** ≥30 a 90 días post-sprint. Healthy B2B SaaS benchmark per HubSpot 2024 es 30+ NPS.

**Trigger acción:**
- NPS <0: producto no entrega valor real (90d retention test fails)
- NPS 0-30: producto entrega valor pero no genera advocacy
- NPS 30-50: healthy
- NPS >50: excellent (advocacy + referrals natural)

## Métricas proxy pre-customer-zero (semana 1-12 post-launch)

Antes de tener data de retention real (que requiere 12+ meses), usar proxies:

### Repeat Contract Intent (RCI)

**Definición:** durante onboarding del 2do touch (post-deliverable email), preguntar "¿planeas contratar Itera otra vez?" Respuesta Si/No/TBD.

**Cálculo:** % de orgs que responden "Si" o "TBD positive".

**Target verde:** ≥60% intent.

**Caveat:** intent ≠ action. Validar contra RCR real cuando madurez aplique.

### First-Sprint Recommendation Rate (FSRR)

**Definición:** durante exit survey al cerrar sprint, "¿recomendarías Itera a otro Head/VP de tu network?" Sí/No/Quizás.

**Target verde:** ≥70% "Sí" o "Quizás" (proxy de NPS adelantado).

### Engagement Within Sprint Window

**Definición:** % de participantes invitados que completan el caso vivo dentro del sprint window (Diagnóstico 30d, Sprint 45d, Track 90d).

**Target verde:** ≥80% completion rate.

**Por qué:** alta completion = manager está engaging con su equipo correctamente. Baja completion = product not embedded, retention probable baja.

## Dashboard de métricas (cómo trackear)

### v1 manual (semana 1-12)

Pablo + claude trackean en spreadsheet o Notion DB:

| Campo | Update cadence |
|---|---|
| Customer name | event-driven |
| Sprint cerrado date | event-driven |
| Sprint type (Diagnóstico/Sprint/Track) | event-driven |
| Seats contratados | event-driven |
| Revenue USD | event-driven |
| Engagement % (completed / invited) | post-sprint |
| Exit survey FSRR | post-sprint +14d |
| RCI (repeat intent) | post-sprint +30d |
| NPS 90d delayed | post-sprint +90d |
| Repeat contract (sí/no/pending) | post-sprint +180d |

### v2 automated (post-customer-zero)

Codex agrega tabla `simulador.customer_retention_events` con campos:

```sql
create table simulador.customer_retention_events (
  id uuid primary key,
  organization_id uuid references simulador.organizations(id),
  event_type text check (event_type in (
    'sprint_closed', 'survey_sent', 'survey_response', 'nps_response',
    'repeat_intent', 'repeat_contracted', 'churn_explicit'
  )),
  payload_json jsonb,
  captured_at timestamptz default now()
);
```

Y dashboard `/admin/retention` con queries:

- RCR a 12 meses (rolling cohort)
- ERR median + distribution
- TTRC distribution
- CAC payback per cohort
- NPS 90d (rolling)

**Cuándo codex implementa esto:** Fase 4 v2 roadmap o cuando ≥10 customers genera signal estadístico (lo que llegue primero).

## Interpretación cross-metric

Combinaciones que importan:

| Combinación | Interpretación | Acción |
|---|---|---|
| RCR alto + ERR alto + NPS alto | producto-market fit fuerte | scale comms + considerar pricing upgrade |
| RCR alto + ERR bajo (~100%) + NPS alto | repeat valuado pero NO expansion-natural | investigate qué bloquea expansion (tier mismatch? seats overlap?) |
| RCR bajo + NPS alto + FSRR alto | one-shot value extraction (customer satisfied pero no needs recurring) | OK para acquisition pero LTV bajo |
| RCR bajo + NPS medio + Engagement bajo | producto no embedded | iterate UX, onboarding, manager training |
| RCR bajo + NPS bajo | producto-market mismatch | retrospectiva profunda — replantear |
| Engagement bajo + NPS alto | manager engaged pero participantes no | iterate participant UX, motivación, comms |

## Anti-patterns en métricas retention B2B SaaS assessment

### Anti-pattern 1: confundir engagement con retention

Engagement intra-sprint NO predice retention post-sprint. Manager puede tener 100% engagement del equipo durante el sprint pero NO contratar el 2do. Engagement = condition necessary, not sufficient.

### Anti-pattern 2: NPS immediate como retention proxy

NPS al cerrar sprint está sesgado por "shine" del deliverable. Use 90d delayed.

### Anti-pattern 3: contratar customer-zero como signal

Primer customer es signal MUY débil de fit. ChartMogul 2024 reporta que ~30% de primeros customers son outliers (super-fan, edge use case). Esperar 5+ customers antes de tomar decisiones de roadmap retention-driven.

### Anti-pattern 4: forecastear ARR a 12 meses con N=3

Hubspot 2024 "Pivotal Curve" warn: B2B SaaS con <50 customers no tiene curva ARR predictiva. Es estadísticamente ruido. NO comunicar "ARR projection" a inversores con N<50.

### Anti-pattern 5: tracking 20 métricas

Vanity metrics. Stick con las 5 canónicas + 3 proxy = 8 total tracked. Más es overhead sin signal.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D39
    decision: "5 métricas canónicas Itera v1+v2: RCR (12m repeat) + ERR (expansion) + TTRC (time to repeat) + CAC Payback (sprint level) + NPS 90d delayed. Métricas SaaS clásicas (MRR/ARR/Churn) NO aplican directo — usar adaptadas"
    rationale: "Itera es B2B SaaS assessment (contratos discretos), no SaaS subscription continuo. Las métricas estándar no capturan el modelo. Definir las 5 canónicas previene re-litigar definitions cuando llegue 12m post-launch."
    change_type: metrics
    files_to_touch:
      - docs/research/retention_metrics_b2b_saas_assessment.md
      - docs/strategy/v1_launch_playbook.md (week 12 metrics ya alineadas)
      - docs/strategy/v2_roadmap_post_customer_zero.md (F4 CAC payback ya alineado)
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D40
    decision: "Tracking manual v1 (spreadsheet) en semanas 1-12 post-launch. Codex implementa tabla simulador.customer_retention_events + dashboard /admin/retention solo en Fase 4 v2 roadmap o cuando ≥10 customers (lo que llegue primero)"
    rationale: "Building automated retention dashboard pre-customer-zero es premature. Manual tracking con 5 customers max es trivial. Automate cuando volume justifica."
    change_type: implementation_timing
    files_to_touch:
      - supabase/migrations/0XX_retention_events.sql (futuro)
      - app/(app)/admin/retention/page.tsx (futuro)
    owner: codex
    blocked_by:
      - 10_customers OR fase_4_v2
    priority: low

  - id: M9-3-D41
    decision: "NPS measure 90d delayed (NO immediate post-sprint). Repeat Contract Intent (RCI) +30d como proxy adelantado"
    rationale: "Immediate post-sprint NPS está sesgado por 'deliverable shine'. 90 días después mide retention real (¿el reporte se usó o se archivó?). RCI +30d es señal anticipada pero menos confiable."
    change_type: measurement_methodology
    files_to_touch:
      - docs/research/retention_metrics_b2b_saas_assessment.md
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D42
    decision: "NO forecastear ARR a 12 meses con N<50 customers. Cualquier projection con N<10 es ruido estadístico, NO comunicar a inversores"
    rationale: "Hubspot 2024 'Pivotal Curve' principle. B2B SaaS con N<50 customers no tiene curve ARR predictiva — estadísticamente unreliable. Comunicar proyecciones débiles daña credibilidad cuando misses."
    change_type: comms_constraint
    files_to_touch:
      - docs/research/retention_metrics_b2b_saas_assessment.md
    owner: pablo
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** este doc informa tracking manual de v1_launch_playbook. NO requiere implementación técnica todavía.
2. **Semana 1-12 post-launch:** Pablo + claude tracking manual de las 5 + 3 métricas en spreadsheet.
3. **Post 10 customers o Fase 4 v2:** codex implementa tabla `customer_retention_events` + dashboard `/admin/retention`.
4. **12 meses post-customer-zero:** primer dato real de RCR. Validar contra target verde 40%. Si <30%, retrospective profunda.
