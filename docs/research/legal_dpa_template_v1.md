---
type: research
title: Legal DPA template v1 — Data Processing Agreement para primer enterprise customer
date: 2026-05-19
author: claude
reviewers: [pablo, codex, legal-counsel-LATAM]
status: published-draft
scope: estructura + cláusulas canónicas para DPA cuando primer customer enterprise lo solicite. NO se implementa hasta que llegue el ask real. Posición legal v1 sigue conservadora (B9-003-D5) — sin DPA proactivo
related:
  - lib/simulador/copy/legal.ts (consent banner + privacy policy MX/CO)
  - docs/research/onboarding_friction_b2b_latam.md (M9-3-D7 hybrid model)
  - docs/research/buyer_persona_head_marketing_latam.md (6 razones humano)
---

# Legal DPA template v1 — estructura canónica

## TL;DR + disclaimer crítico

**Claude NO es lawyer. Este documento es estructura técnica + research-grade, NO asesoría legal.** Cuando primer customer enterprise pida DPA, Pablo DEBE contratar counsel LATAM (México + Colombia, mínimo) para review + revision antes de firmar.

**Posición legal v1 (M9-3-D5, B9-003-D5):**
- v1 NO promueve DPA proactivamente
- v1 NO promete compliance-grade SOC2/ISO27001
- Field-test + Diagnóstico opera con datos sintéticos en demos
- Cuando primer customer pida DPA, escalate a counsel + usar este template como base estructural

Este doc define **estructura + cláusulas canónicas + red flags identificados** para acelerar el proceso cuando llegue el ask.

## Cuándo se activa este template

Triggers explícitos:
1. **Customer enterprise solicita DPA antes de firmar contrato** ($15K+ Track tier típicamente, mid-market a veces)
2. **Customer requiere passing compliance review interno** (CISO, DPO, Legal team review)
3. **Customer maneja datos sensibles** (financial, health, PII categorical) y necesita assurance

NO se activa por:
- ❌ Customer Diagnóstico básico $4-8K sin requerimiento explícito
- ❌ Customer en sectores low-regulation (ecom retail, services)
- ❌ Field-test public (no DPA aplica — datos sintéticos / lead opt-in)

## Estructura canónica DPA

### 1. Definiciones (Sección estándar)

Términos canónicos a incluir:

- **Personal Data** — definición alineada con LFPDPPP MX (DOF 20/03/2025) + Ley 1581 CO + GDPR Article 4 si customer enterprise multi-jurisdiccional
- **Processing** — Article 4(2) GDPR equivalent
- **Controller** — el customer / org enterprise (no Itera)
- **Processor** — Itera
- **Sub-processor** — terceros que Itera usa (Supabase, Anthropic, Stripe, AgentMail)
- **Data Subject** — empleados del customer que completan diagnóstico
- **Data Breach** — definición técnica + jurisdiccional

### 2. Roles y responsabilidades

**Customer (Controller):**
- Determine purposes + means of processing
- Obtain valid consent from data subjects (empleados) para participar en diagnóstico
- Notify Itera of any data subject requests (acceso, rectificación, eliminación)

**Itera (Processor):**
- Process data only on documented instructions del Controller
- Ensure confidentiality of personnel handling data
- Implement appropriate technical + organizational security measures
- NOT use Personal Data for marketing or analytics outside del scope contractual

### 3. Categorías de datos procesados

Definir explícitamente qué datos Itera procesa:

| Categoría | Datos típicos | Sub-processor |
|---|---|---|
| Identificación básica | nombre, email del participante | Supabase US-East |
| Datos de uso | respuestas del caso vivo, transcript de prompts | Supabase US-East |
| Outputs de IA | response del modelo durante el caso | Anthropic US (durante runtime) |
| Datos comerciales | nombre de org, tier contratado | Stripe US (billing) |
| Datos contacto | email post-sprint (surveys) | AgentMail |

**NO procesados:**
- ❌ Datos de salud / genéticos / biométricos (no aplican al producto)
- ❌ Datos financieros del participante (solo Stripe handles pagos del Controller, no del participante)
- ❌ Datos de menores de edad (Diagnóstico es B2B adultos exclusivamente)

### 4. Localización de datos + transferencias

Estado v1 (M9-3-D2 launch geos MX+CO):

- **Almacenamiento primario:** Supabase US-East (Virginia, US)
- **Procesamiento LLM:** Anthropic US infrastructure
- **Backups:** Supabase automated (US-East)

**Transferencias cross-border (MX → US y CO → US):**
- Requieren transfer_basis_documented (alineado con schema simulador.risk_events.transfer_basis_documented)
- Mecanismo legal v1: Standard Contractual Clauses (SCCs) entre customer y Itera + entre Itera y sub-processors
- LFPDPPP MX (DOF 2025) Artículo 36: transferencia requiere consent del titular + garantías equivalentes
- Ley 1581 CO Artículo 26: transferencia internacional con autorización titular

**NO disponibles v1:**
- Localización LATAM-only (Supabase no tiene region LATAM hoy, AWS LATAM exists pero no Supabase Premium)
- EU storage compliance (post v3 cuando expand a EU)

### 5. Retención y eliminación

Política propuesta:

| Tipo de dato | Retención |
|---|---|
| Sessions activas (in_progress) | duración del sprint window (30-90 días) + 30 días post-cierre |
| Reportes ejecutivos publicados | 12 meses post-cierre del sprint, luego anonimizado |
| Transcripts de runtime | 6 meses post-cierre del sprint |
| Audit logs (risk_events + behavior_events) | 24 meses (regulatory baseline) |
| Marketing data (RCI/NPS surveys) | 36 meses |
| Datos eliminados a solicitud | dentro de 30 días del request (Articles 8/9 LFPDPPP + Ley 1581 Art 8) |

**Request de eliminación:**
- Data subject puede solicitar eliminación via email a `privacy@itera.la` o via Controller
- Itera elimina dentro de 30 días + confirma en escrito
- Backups quedan sujetos a rotation policy (max 90 días total)

### 6. Sub-processors

Itera utiliza estos sub-processors v1:

| Sub-processor | Servicio | Localización | DPA con Itera |
|---|---|---|---|
| Supabase | DB + Auth + Storage | US-East | Standard Supabase DPA |
| Anthropic | LLM (Opus 4.5 / Sonnet 4.5) | US | Anthropic Enterprise DPA |
| Stripe | Pagos | US | Stripe DPA |
| AgentMail | Email transaccional | US | AgentMail DPA |
| Vercel | Hosting | US | Vercel DPA |

**Propuestas v2 (post enterprise customer ask):**
- Sentry / observability (cuando se active)
- Customer.io / Hubspot CRM (cuando se active)

**Notificación de cambio de sub-processor:** Itera notificará al Controller 30 días antes de agregar nuevo sub-processor que procese Personal Data.

### 7. Security measures

Itera implementa:

**Técnicas:**
- TLS 1.3 in transit
- AES-256 at rest (Supabase managed)
- Row Level Security (RLS) multi-tenant en DB (verified per B2-001/B10-002)
- Authentication via Supabase + Google OAuth + Magic link
- API rate limiting (DB-level via Supabase, post B1-004)
- Audit logs en `simulador.behavior_events` + `simulador.risk_events`

**Organizacionales:**
- Acceso a Production DB limitado a Pablo + Codex (single-threaded operations v1)
- 2FA obligatorio para Supabase + Stripe + Vercel admin
- Code review pre-merge en branch protections (Codex enforces)
- Incident response procedure (v1: Pablo + Codex respond <2h business hours)

**NO disponibles v1:**
- ❌ SOC2 Type II audit (M9-3-D2 v1 launch sin compliance grade formal)
- ❌ ISO27001 certification
- ❌ Penetration testing third-party formal (informal review only)
- ❌ 24/7 SOC monitoring
- ❌ HIPAA compliance (no aplica)

Esto se documenta honestamente en el DPA — NO se promete lo que no se entrega.

### 8. Data breach notification

**Definición de breach:** acceso, divulgación, modificación o eliminación NO autorizada de Personal Data.

**Notification timeline (alineado con LFPDPPP MX Art 64 + Ley 1581 CO Art 17):**
- Itera notifica al Controller dentro de **72 horas** del descubrimiento
- Notification incluye:
  - Nature del breach (datos afectados, scope)
  - Aproximada cantidad de data subjects afectados
  - Medidas tomadas
  - Próximos pasos

**Reporting al autoridad:** responsabilidad del Controller (Itera asiste con datos técnicos pero no reporta directamente).

### 9. Data subject rights

Customer (Controller) responsable de cumplir requests de data subjects. Itera asiste:

| Request | Itera role | Timeline |
|---|---|---|
| Acceso (Art 8 LFPDPPP) | Provee datos al Controller | 5 días business |
| Rectificación (Art 24 LFPDPPP) | Modifica datos a instrucción del Controller | 5 días business |
| Eliminación (Art 25 LFPDPPP) | Elimina dentro de 30 días | 30 días |
| Oposición (Art 32 LFPDPPP) | Detiene processing específico | 5 días business |
| Portabilidad (CO Art 8) | Exporta en formato standard | 10 días business |

### 10. Liability + limitation

Standard caps:
- Liability cap: 12 meses de fees pagados por customer (industry standard B2B SaaS mid-market per OneTrust 2024 templates)
- Excluida: indirect/consequential damages, lost profits
- NO exclusiones: gross negligence, willful misconduct, breach of confidentiality, data breach por Itera

**Indemnity:** Itera indemnifica de claims arising from Itera negligence en data processing.

### 11. Term + termination

- DPA active mientras Itera procese Personal Data del Controller
- Upon termination del MSA/sprint contract: Itera retains data per Section 5 (retention policy) hasta auto-eliminación
- Customer puede solicitar return o destruction al final del término

### 12. Jurisdiction + governing law

**Propuesta v1 (MX+CO launch):**
- Customer MX: jurisdiction CDMX, legislation México
- Customer CO: jurisdiction Bogotá, legislation Colombia
- Customer multi-LATAM: por defecto MX, customer puede solicitar específico
- Customer US (cuando expand v3): Delaware

**Disputas:** intentar resolución amigable 30 días antes de litigio. Mediación opcional.

## Red flags identificados

Cláusulas a EVITAR / negotiar fuerte si customer las pide:

### ❌ Red flag 1: liability uncapped o caps muy altos

Standard mid-market: 12 meses fees. Si customer pide uncapped o 5x fees, escalate a counsel — usually negotiable.

### ❌ Red flag 2: SOC2 / ISO compliance as contractual obligation

v1 NO podemos comprometer SOC2 (M9-3-D2). Si customer requiere, escalate — workaround: roadmap commitment con timeline + actions.

### ❌ Red flag 3: data residency LATAM-only

v1 NO disponible (Supabase no tiene region LATAM). Si customer requiere, escalate — workaround: SCCs + transfer_basis documented honestamente.

### ❌ Red flag 4: 24h breach notification (sub-72h)

LFPDPPP + Ley 1581 = 72h estándar. Si customer pide 24h, OK accept si Itera capacity lo permite (Pablo + Codex single-threaded → realistically 24h doable pero stressful). Negotiate 48h como midpoint.

### ❌ Red flag 5: insurance requirements

Customer puede pedir cyber insurance $1M+. v1 NO tenemos cyber insurance contratada. Si requested, escalate + considerar contratar (~$1-3K/año para coverage básica).

### ❌ Red flag 6: penalty clauses específicas por SLA

v1 sin SLA formal contractual. Si customer pide penalties por downtime ≥99.9% uptime, escalate — workaround: best-effort language + commitment a investigate root cause + remediar.

### ❌ Red flag 7: right to audit Itera infrastructure

Customer enterprise puede solicitar derecho de auditar facilities/code. NO disponible v1 (single-threaded ops). Workaround: provide SOC2-equivalent attestation post-customer-zero o invitation a code review remote.

## Process operacional cuando customer pide DPA

**Step 1 (Pablo):** receive ask via ventas@itera.la o sales call. Document customer profile (industry, size, jurisdiction, contract value).

**Step 2 (Pablo):** evaluate fit:
- Contract value ≥$15K (Track tier típicamente) → proceed
- Customer en industry regulada (finance, health, gov) → escalate counsel
- Customer enterprise (1000+ employees) → escalate counsel
- Customer mid-market sin regulatory concern → use este template + counsel review optional

**Step 3 (Pablo):** contratar counsel local (Mexico + Colombia mínimo cuando expand a LATAM amplía).

Counsel recommendations LATAM (verify availability):
- Mexico: Galicia Abogados, Greenberg Traurig MX, Mijares Angoitia Cortés y Fuentes
- Colombia: Brigard Urrutia, Posse Herrera Ruiz, DLA Piper CO
- Costo estimado: USD 3-8K para primer DPA review (typical mid-market range)

**Step 4 (claude + Pablo + counsel):** customize este template:
- Definitions + jurisdictions
- Sub-processors list
- Security measures (sincero, no aspirational)
- Liability caps standard
- Red flags negotiate or escalate

**Step 5 (Pablo + counsel):** review final DPA con customer counsel cuando aplique. Negotiate cláusulas.

**Step 6 (Pablo + customer):** firma DPA + start sprint.

**Step 7 (claude):** actualizar este template con learnings + crear sub-processor agreements actualizados.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D57
    decision: "DPA template v1 con 12 secciones estructurales + 7 red flags identificados. NO se ofrece proactivamente — se activa cuando primer customer enterprise lo solicita. Pablo escalate a counsel local MX+CO cuando ask llegue"
    rationale: "Posición v1 conservadora (M9-3-D5, B9-003-D5): sin DPA proactivo + sin compliance-grade promesas. Template estructural acelera el proceso cuando ask real llega (3-8K USD counsel + ~2-4 semanas elapsed). Sin template, cada DPA es scratch — ineficiente."
    change_type: legal_template
    files_to_touch:
      - docs/research/legal_dpa_template_v1.md
    owner: claude (structure) + counsel local (legal review)
    blocked_by:
      - first_enterprise_customer_dpa_ask
    priority: low

  - id: M9-3-D58
    decision: "Sub-processors list canónica v1 (Supabase, Anthropic, Stripe, AgentMail, Vercel). Cualquier nuevo sub-processor que procese Personal Data requiere 30 días notification al Controller. Customer enterprise puede consent objetar"
    rationale: "Transparency de supply chain es expected en B2B DPAs 2026. Lista publicada en DPA evita re-negotiate con cada customer. Notification policy 30 días alineada con GDPR Article 28 + LATAM equivalents."
    change_type: legal_policy
    files_to_touch:
      - docs/research/legal_dpa_template_v1.md
      - lib/simulador/copy/legal.ts (futuro: add sub_processors_list public)
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D59
    decision: "Cyber insurance NO contratada v1. Si customer enterprise lo requiere, evaluar contratar ($1-3K/año para coverage básica). NO bloquea v1 launch, bloquea solo enterprise deals que la requieran explícitamente"
    rationale: "Insurance cost v1 ($1-3K) es marginal vs valor de un contract enterprise ($15K+). Sin signal real de demand, no contratar proactivamente. Cuando primer customer la requiera, evaluar fit del deal antes de comprar."
    change_type: operations
    files_to_touch:
      - docs/research/legal_dpa_template_v1.md
    owner: pablo
    blocked_by:
      - customer_request_insurance
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **NO action inmediata.** Template está ready para cuando llegue el ask.
2. **Primer customer enterprise solicita DPA:** Pablo evalúa fit + contrata counsel local + customize este template (Step 1-7 process).
3. **Primer enterprise customer LATAM cerrado con DPA:** refresh este doc con learnings (M9-3-D57 indica iterative refinement).
4. **v3 (post US expansion):** agregar US/CCPA/Delaware sections + counsel US.
