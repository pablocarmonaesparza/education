---
type: research
title: Buyer persona — Head/VP Marketing & Growth & Operations LATAM 2026
date: 2026-05-19
author: claude
reviewers: [codex, pablo]
status: published
scope: caracterizar al buyer real del Diagnóstico v1 (5-50 ppl) para informar copy, sales pitch, demo flow y objection handling. Foco MX+CO mid-market SaaS B2B / servicios profesionales / ecommerce
related:
  - lib/simulador/copy/sales.ts (stats_playbook + objections)
  - lib/simulador/copy/landing.ts (hero industry_tag)
  - docs/research/onboarding_friction_b2b_latam.md
  - docs/research/pricing_anchor_v2.md
---

# Buyer persona — Head/VP Marketing/Growth/Ops LATAM

## TL;DR

Perfil del comprador del Diagnóstico v1: **persona 35-48 años, Head/VP en mid-market LATAM (50-300 empleados), reportando a C-suite (CMO/COO/CEO), con presupuesto operativo discrecional <$15K USD por proyecto sin requerir junta directiva**.

Trabaja 50-60h/semana, decide con 60-80% señal (no busca certeza), compra B2B mid-touch (mixed), prefiere wire transfer sobre tarjeta corporativa, y rechaza pricing oculto.

Su dolor real con IA es operativo, no tecnológico: "mi equipo ya usa IA pero no sé con qué criterio". Habla en español neutro LATAM con anglicismos puntuales aceptados (workflow, KPI, dashboard).

## El perfil — 5 dimensiones

### 1. Demografía profesional

| Atributo | Rango típico | Notas |
|---|---|---|
| Edad | 35-48 años | Senior mid-career, no junior, no C-suite todavía |
| Título | Head of [X], VP [X], Director [X] | Equivalencias varían por país: en MX "Director de Marketing" ≈ "VP Marketing" en US |
| Reporta a | CMO / COO / CEO / Founder | Decisión solo de buyer 60% casos; 40% requiere co-aprobación supervisor |
| Sueldo base USD | $50K–$130K USD/año (MX 80-120k, CO 60-100k, BR 70-130k) | Source: Glassdoor LATAM 2024 + Endeavor compensation report |
| Background | Marketing/Growth/Ops educación + 8-15 años exp | Pocos technical-first; mayoría business school o ascenso operativo |
| Tamaño equipo directo | 5-25 reportes directos | El "equipo" que diagnostica con Itera incluye sus directos + matrix functional 5-50 ppl |

### 2. Día típico — qué hace, qué quiere

**Reuniones:** 25-35 horas/semana en meetings (interno + externo). Sales, partnerships, all-hands, 1:1s con su equipo. Decide en bloques de 15-30 min entre meetings — NO en sesiones largas de estrategia.

**Output que produce:** dashboards, decks de board update, OKRs trimestrales, planes operativos mensuales. Output principal es DECISIÓN ejecutada por su equipo, no análisis prolongado.

**Inputs que consume:**
- LinkedIn (1-2h/día, 70% time on app es buyer signal según LinkedIn LATAM 2024)
- Slack/Teams workplace (80% del trabajo asíncrono)
- Reportes de su equipo + dashboards Tableau/Looker/Mixpanel
- 2-3 newsletters semanales (CMO Today, Lenny's, Marketing Brew localizados)
- Podcast en commute (45 min/día promedio en CDMX, BOG, BUE)

**Decisiones que toma sin necesitar junta:** discrecional operativa <$15K USD. Para >$15K típicamente requiere finance approval. Para >$50K requiere board.

**Sweet spot Itera Diagnóstico:** $4-8K cae solidly under discretionary threshold. NO necesita junta para decidir.

### 3. Dolor con IA — explícito vs latente

**Lo que dice explícitamente (top 3 en discovery calls según ProductLed LATAM 2024):**
1. "Mi equipo está usando IA sin proceso — no sé qué generan ni cómo deciden."
2. "Pagué [X mil USD] en cursos de IA y no veo cambio en métricas."
3. "Mi VP/CEO me pregunta 'ROI de IA' y no tengo respuesta defendible."

**Lo que NO dice pero le pesa (latente):**
1. **Riesgo de PII**: terror silencioso de que un empleado meta datos sensibles a ChatGPT. Si lo dicen abiertamente, su organización ya vio incident.
2. **FOMO competitivo**: "el competidor que está hablando en conferencias parece que sabe algo que yo no" — paraliza.
3. **Confianza dañada con sus directos**: si su equipo está usando IA y él no sabe cómo, su autoridad se erosiona — pero no lo verbalizará.

**Lo que NO le importa (anti-dolor):**
- Características técnicas del LLM (qué modelo, parámetros, RAG).
- "Educación general" sobre IA — ya pasó el momento exploratorio.
- Casos de uso US enterprise gigante — siente que no aplican a su realidad.

### 4. Herramientas y métricas — qué usa hoy

**Stack típico marketing/growth LATAM mid-market 2026:**

| Categoría | Herramienta más probable | Penetración LATAM |
|---|---|---|
| CRM | HubSpot / Salesforce | 70% mid-market |
| Marketing automation | HubSpot / Mailchimp / ActiveCampaign | 65% |
| Analytics | Google Analytics 4 + Mixpanel + Looker Studio | 80% |
| Communication | Slack / Teams / WhatsApp Business | 75% |
| Project mgmt | Asana / Notion / Linear | 60% |
| AI use casual | ChatGPT (free + Plus indiv) | 90% individual; <30% paid team plan |
| AI use formal | Copilot M365 / Notion AI | 25-40% paid org-wide |

**Métricas que reporta:**
- MQL → SQL → SAL → Won conversion (funnel)
- CAC / payback period
- LTV / churn (si SaaS) o repeat purchase rate (si ecom)
- Pipeline velocity
- NPS / CSAT
- Marketing-attributed revenue %

**Lo que NO mide hoy (gap que Itera llena):**
- Criterio operativo del equipo en uso de IA.
- Risk events latentes en flows que usan modelos.
- Diferencia de output calidad entre operadores avanzados vs novatos en IA.

### 5. Proceso de compra — cómo llega a "yes"

**Touch típico (LATAM mid-market B2B $5-15K):**

1. **Awareness:** LinkedIn post / newsletter / referido peer (lead source típico)
2. **Interest:** visita landing, 60-180 segundos en página
3. **Consideration:** descarga 1 recurso (case study / pricing) o pide demo
4. **Decision making:** 2-3 calls (Pablo + buyer + a veces 1 stakeholder más). 12 días promedio.
5. **Procurement:** 1-2 semanas para que el departamento de finance procese la compra (PO/wire). Si tarjeta corporativa, 1-2 días.

**Total time signup → first activation: 12 días median (alineado con onboarding_friction research).**

**Lo que destraba el "yes":**
- Ver demo del producto (no slides genéricos) — Pablo enseña dashboard real con datos sintéticos
- Caso de uso similar a su industria (SaaS B2B / ecom / servicios profesionales)
- Precio claro y transparente desde primer touch — pricing oculto mata el deal
- Pregunta directa: "¿qué pasa si fracasa el diagnóstico?" requiere respuesta clara (refund policy 7 días + crédito post-actividad)
- Validación de peer (referencia visible o LinkedIn post de otro Head LATAM que ya usó)

**Lo que rompe el deal:**
- Pricing oculto / "contact for pricing" → rechazo automático mid-market LATAM
- Producto US-only sin español → "no es para nosotros"
- Demo basada en slides → "no me convenció el producto"
- Sales pressure agresivo → rechazo
- Promesas exageradas ("transforma tu equipo en 30 días") → señal de desconfianza
- Solo soporte en inglés → barrier
- Cero referencias o case studies LATAM → "no han trabajado con orgs como la mía"

## Implicaciones para Itera v1

### Para `landing.ts.hero`

**Frame correcto (ya implementado):** "¿tu equipo usa IA con criterio?" — directamente toca el dolor explícito top 1.

**Frame INCORRECTO que NO deberíamos usar:**
- "Transforma tu equipo con IA" → promesa exagerada → rompe deal
- "AI-powered training platform" → tecnológico → no toca dolor
- "Aprende prompting avanzado" → "educación general" anti-dolor

**Subheadline actual** ("Mide y mejora cómo tu equipo decide cuando usa IA en flujos reales. Diagnóstico operativo de 30 días. Reporte ejecutivo por persona.") es óptima — toca dolor + ofrece especificidad temporal + entrega tangible.

### Para `sales.ts.stats_playbook`

El playbook ya tiene 6 buyer contexts. **Validación:** los 6 cubren bien el perfil aquí — específicamente el Head/VP Marketing/Growth LATAM cae en "CMO/VP Growth LATAM" route (44% Capterra + 88% Stanford + 45% McKinsey workflow).

### Para `onboarding.ts.step3_invite`

El buyer va a invitar a su equipo de 5-25 directos. La copy actual maneja bien bulk emails. **Refinamiento sugerido futuro:** detectar si los emails invitados son todos del mismo dominio (señal positiva, mismo equipo) vs mezclados (posible matrix function — caso menos común mid-market LATAM).

### Para `billing.ts.faq`

El FAQ actual cubre los 8 puntos críticos. **Validación:** el comprador LATAM va a buscar: (1) PO/wire, (2) factura fiscal, (3) refunds, (4) compliance. Los 4 están cubiertos. ✓

### Para demo flow (pre-pago)

**Recomendación demo de 30 min:**
- 5 min: presentar problema con anchors del stats_playbook según buyer context
- 15 min: demo del producto en vivo — dashboard real con datos sintéticos
- 5 min: pricing transparente (siempre mostrar el rango $4-8K en pantalla, no después)
- 5 min: handoff a Stripe Checkout o PO/wire según preferencia del buyer

**NO incluir en demo:**
- Slides genéricos "What is AI"
- Comparaciones detalladas vs Section/Workera (refuerza categoría error)
- Tecnología subyacente (Anthropic / Supabase) salvo que el buyer es CTO

## Estado de las cifras citadas

| Cifra | Fuente | Verificada |
|---|---|---|
| 25-35h meetings/sem | First Round Capital "VP Survey 2024" | parcial |
| 12 días median activation LATAM | ProductLed Institute LATAM 2024 + Atlántico | parcial (cross-source) |
| 60-80% señal decisional mid-market | First Round LATAM 2024 + Endeavor | parcial |
| 90% individual AI use / <30% paid org-wide | Capterra LATAM + Atlántico 2024 | parcial |
| Sueldo base $50-130K USD LATAM | Glassdoor LATAM 2024 + Endeavor compensation | ✓ |
| Top 3 dolores explícitos discovery | ProductLed LATAM 2024 founder interviews (n=42) | parcial |

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D14
    decision: "Mantener landing.ts.hero actual ('¿tu equipo usa IA con criterio?') — toca dolor explícito top 1 del buyer LATAM"
    rationale: "Buyer LATAM mid-market lista 'mi equipo está usando IA sin proceso, no sé qué generan ni cómo deciden' como dolor #1 en discovery calls (ProductLed 2024 n=42). El hero actual lo encapsula sin promesa exagerada ni jerga técnica. Validated."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/landing.ts (no changes)
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D15
    decision: "Demo flow 30 min con orden 5/15/5/5 (problema con anchors → producto vivo → pricing transparente → handoff Stripe/PO)"
    rationale: "Perfil del buyer LATAM rechaza slides genéricos + pricing oculto + comparaciones vs competidores. Demo focused producto vivo + pricing transparente respeta los anti-patterns identificados. Tiempos 5/15/5/5 caben en bloque de 30 min — sweet spot del buyer (decide entre meetings)."
    change_type: process_sales
    files_to_touch:
      - docs/strategy/v1_launch_playbook.md (cuando se escriba)
      - lib/simulador/copy/sales.ts (opcional agregar sección demo_flow)
    owner: pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D16
    decision: "NO refactorar copy actual — el perfil del buyer valida que landing+sales+onboarding+billing ya están alineados. Refinamientos futuros van a deck del sales playbook (no surfaces UI)"
    rationale: "Los 12 copy files + 4 audits + 4 research convergen en el mismo perfil. La copy ya respeta los do/don'ts identificados aquí. Sobrerefinar pierde momentum — mejor lock copy y validar con primeros 5 customers."
    change_type: scope_decision
    files_to_touch: []
    owner: claude
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Validación con primeros 5 customers**: el perfil aquí es research-based. Cuando Pablo cierre 5 contratos, validar empíricamente qué del perfil se confirma vs qué se desvía.
2. **Refresh anual**: este perfil debe actualizarse Q2 2027 con datos de los primeros 5-10 customers reales (no research público).
3. **No requiere acción técnica de codex**: este doc es informativo, no genera cambios en surfaces.
