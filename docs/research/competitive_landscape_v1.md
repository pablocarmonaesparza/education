---
type: research
title: competitive landscape v1 — síntesis ejecutiva
task_id: B9-001
date: 2026-05-19
status: published
authors: [claude]
reviewers: [codex]
sources_doc: docs/research/R24_competencia_simulator_category_v1.md
sources_complementary: [docs/research/R20_competencia_directa_v1.md]
---

# Competitive Landscape — síntesis ejecutiva (v1)

> Esta es la síntesis ejecutiva de B9-001. El análisis exhaustivo de los 6 competidores principales (Wharton Interactive, Forage, Attensi, Mursion, Whatfix Mirror, Section AI) con sources verificables, pricing, GTM channels, modelo pedagógico, LATAM presence y gaps explotables vive en `R24_competencia_simulator_category_v1.md` (588 líneas, 30+ fuentes citadas). Este doc consolida hallazgos + emite las decisiones de producto que sincronizan al BUILD_BOARD.

## TL;DR — 5 claims defendibles

1. **Wharton Interactive cerró su marketplace el 30 de abril de 2025.** La categoría "simulación seria académica + empresarial" tiene un vacío editorial de 12+ meses mientras transicionan 3 sims a Harvard Business Publishing (OPEQ, Startup Game, Customer Centricity).
2. **Ningún competidor relevante está localizado a LATAM en español neutro.** Wharton, Forage, Attensi, Mursion, Whatfix Mirror, Section AI — todos english-first. Mercado corporate training LATAM USD 24.8B (2025) → USD 43.6B (2034); 55% de empresas mexicanas dicen "falta de skills" es la barrera #1 para adoptar IA.
3. **La categoría "criterio IA medible" no tiene líder declarado.** Attensi/Whatfix lanzaron AI roleplay como features. Mursion lanzó On-Demand. Section AI vende coach + cursos. Ninguno tiene como tesis principal "entrenar criterio operativo para usar IA en trabajo real con evidencia medible".
4. **Section AI es el competidor más cercano semánticamente, pero NO usa simulación pura.** Modelo híbrido: cursos cohort-based + AI coach + dashboard. Pricing público: $41-82/mes consumer + $750/seat teams chicos. Sweet spot: enterprise US/UK >100 ppl perfil J&J, Nike, Unilever. Wedge Itera vs Section: "simulación + evaluador AI + evidencia de criterio" vs "cursos + coaching + adopción".
5. **Forage validó el modelo "free para learner, employer paga" a escala.** 10M+ engagements, adquirida por EAB abril 2024. Pero su tesis es career discovery (pre-hire), no readiness (post-hire). Itera puede heredar el modelo de monetización como vector futuro sin colisionar de funnel.

## Matriz feature × pricing × buyer × wedge

| Competidor | Producto core | Pricing visible | Buyer | LATAM | AI-native | Mide criterio |
|---|---|---|---|---|---|---|
| Wharton Interactive | Scripted/branching serious games | Cerrado (marketplace) | Facultad académica → HBP transition | No | No | No |
| Forage | Job simulations career discovery | Free learner / employer quote (~$60-150K/sim est) | Talent acquisition / DEI / early talent | No | Scripted, no GenAI dinámico | No |
| Attensi | Gamified frontline training + AI Roleplay (RealTalk 2024-2025) | Quote (~$20-80/seat est) | L&D enterprise, retail/hospitality | No | Híbrido | No |
| Mursion | Live/On-Demand AI roleplay para soft skills | Quote (~$49-164/sesión publicado) | Fortune 500, leadership/DEI | No | Sí (On-Demand) | No |
| Whatfix Mirror | Sandbox replicas + AI Roleplay para system adoption | Quote ($31K-300K rangos) | IT/L&D enterprise, system rollouts | No | Sí (Mirror) | No |
| Section AI | Cursos + AI coach + adopción dashboard | $41-82/mo consumer / $750/seat teams | L&D enterprise US/UK >100ppl | No (English) | Coach, no simulación | No |
| **Itera** | **Diagnóstico operativo de criterio en uso de IA** | **$4-8K sprint Fase 1 / $8-15K Fase 2 (range pricing)** | **Head/VP Marketing/Growth/Ops · SaaS B2B mid-market LATAM** | **Sí (español neutro, MX/CO/AR/CL)** | **Sí (judge LLM + override matrix)** | **Sí (5 dimensiones × bandas × risk events)** |

## Diferenciación articulada (3 frases para sales/marketing)

1. *"Lo que Wharton Interactive fue para business school clásica, Itera lo es para la era IA — simulaciones serias en español, hechas para entrenar criterio en situaciones reales de trabajo."*
2. *"Section AI te da cursos + coaching + dashboard. Itera te da simulaciones + evaluador AI + evidencia de criterio. Ambos miden readiness; nosotros la entrenamos donde los empleados realmente se equivocan."*
3. *"Forage usa simulaciones para descubrir talento que aún no contrataste; Itera usa simulaciones para entrenar y medir el criterio del talento que ya tienes."*

## Riesgos / vigilancia

- **Whatfix Mirror y Mursion On-Demand** son los AI-native más cercanos técnicamente. Si crecen y deciden internacionalizar a español, son la amenaza más realista a 18-24 meses. **Vigilar trimestralmente** (release notes, news, language selectors).
- **Section AI** no usa simulación pero su brand pull (Galloway) es masivo y podrían comprar/construir un módulo simulator en cualquier momento.
- **EAB/Forage** tiene distribución a 500+ corporates y 350+ universidades. Si pivotan de "career discovery" a "AI readiness simulator", son amenaza estructural.

## Decisiones producto

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B9-001-D1
    decision: "Posicionar Itera como heredera narrativa de Wharton Interactive — capitalizar vacante editorial 12-meses pre-HBP transition"
    rationale: "Wharton cerró marketplace 30-abr-2025; sólo 3 sims migraron a HBP, 1 todavía en transición (A/B testing sim). Vacante de 'simulación seria para criterio empresarial' sin incumbente. Outreach a facultad LATAM (Tec, EAFIT, IAE, Andes) que usaba OPEQ/Customer Centricity puede generar primeros design partners académicos a costo bajo."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/landing.ts
      - lib/simulador/copy/sales.ts
      - docs/coord/audits/loop_audit_landing.md
    owner: claude
    blocked_by: []
    priority: high

  - id: B9-001-D2
    decision: "Reclamar la categoría 'criterio IA medible' explícitamente en homepage + materiales B2B"
    rationale: "Attensi, Whatfix, Mursion lanzaron AI roleplay pero como features tactically agregadas, no como tesis principal. Section AI vende coach. Ninguno tiene 'criterio IA' como categoría discreta. Itera puede declarar categoría sin pelear con incumbente."
    change_type: copy
    files_to_touch:
      - app/(public)/page.tsx
      - lib/simulador/copy/landing.ts
    owner: claude
    blocked_by:
      - B5-002

  - id: B9-001-D3
    decision: "Pricing tier de Sprint Fase 1: USD 4,000-8,000 para cohortes 5-50 personas (validado contra anchors Section $750/seat + Whatfix $31K-300K range)"
    rationale: "Section AI $750/seat es el anchor explícito B2B en categoría adyacente. Whatfix Mirror $31K-300K confirma que enterprise no se asusta de tickets de 5 cifras. Itera Fase 1 $4-8K para 5-50 personas implica $80-1600/seat dependiendo de volumen — todo el rango está debajo de Section, lo cual permite posicionarse como 'premium accesible' en LATAM."
    change_type: schema
    files_to_touch:
      - lib/simulador/config.ts
      - docs/specs/migration_022_pricing.sql
    owner: claude
    blocked_by:
      - B2-001

  - id: B9-001-D4
    decision: "Vigilancia trimestral de Whatfix Mirror release notes + Mursion On-Demand language selector — son los AI-native más cercanos técnicamente"
    rationale: "Si cualquiera de los dos lanza español/portugués o entra a LATAM, hay que reaccionar en <60 días. Quien tiene que tomar señal: CMO (claude) trimestral, no codex."
    change_type: process
    files_to_touch:
      - docs/coord/audits/competitive_pulse.md
    owner: claude
    blocked_by: []
    priority: low

  - id: B9-001-D5
    decision: "Explorar modelo 'free para learner, employer paga' como vector futuro v2 — NO Fase 1"
    rationale: "Forage validó 10M+ engagements con este modelo. Itera puede explorarlo como track separado (sims públicas free → readiness reports B2B → upsell sprint) sin colisionar con Fase 1 cobrada. Pero NO arrancar antes de tener 5+ design partners en Fase 1 — riesgo de cannibalizar pricing premium."
    change_type: process
    files_to_touch:
      - docs/strategy/monetization_v2_hypothesis.md
    owner: claude
    blocked_by:
      - B7-001
    priority: low

  - id: B9-001-D6
    decision: "Field-test público en /field-test/marketing-urgent-campaign-pii ES el canal Forage-style — captura email opcional, demo del producto sin login"
    rationale: "Codex ya construyó la surface. Forage validó que 10M+ users completan job sims gratis y dejan datos. Itera puede capturar leads cualificados de SaaS LATAM via field-test público sin barrera de signup. Esto es Bloque 6 (B6-*), no nuevo."
    change_type: process
    files_to_touch:
      - app/field-test/marketing-urgent-campaign-pii/page.tsx
      - lib/simulador/copy/field-test.ts
    owner: codex
    blocked_by:
      - B1-004

  - id: B9-001-D7
    decision: "Diferenciación copy en sección 'how we compare' del landing/sales — incluir las 3 frases canónicas vs Wharton, Section, Forage"
    rationale: "Sales necesita anclas mentales para prospects que mencionen estos competidores. Las 3 frases son defendibles y memorables. Va en lib/simulador/copy/landing.ts + en deck de sales."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/landing.ts
      - lib/simulador/copy/sales.ts
    owner: claude
    blocked_by: []
```
<!-- decisions:data:end -->

## Fuentes

Ver sección completa de 30+ fuentes en `R24_competencia_simulator_category_v1.md` (línea 501-560). Fuentes principales por competidor:

- **Wharton Interactive:** [Marketplace closure 30-abr-2025](https://interactive.wharton.upenn.edu/), HBP transition tracking
- **Forage:** [EAB acquisition press 8-abr-2024](https://eab.com/about/newsroom/press/eab-acquires-forage/), [10M+ engagements 2025](https://eab.com/about/newsroom/press/forage-job-simulations-surpass-10-million-student-engagements/)
- **Attensi:** [USD 25M non-dilutive growth funding mayo 2025](https://finance.yahoo.com/news/attensi-secures-over-25m-non-112600783.html), [Tracxn funding profile](https://tracxn.com/d/companies/attensi/)
- **Mursion:** [Mursion platform](https://www.mursion.com/platform/), [Yoodli pricing breakdown](https://yoodli.ai/blog/mursion)
- **Whatfix Mirror:** [Series E USD 125M sept 2024](https://whatfix.com/newsroom/press-releases/whatfix-raises-125-million-series-e/), [AI Roleplay marzo 2026](https://www.finanzwire.com/press-release/whatfix-etr-whatfix-introduces-ai-roleplay-training-in-mirror)
- **Section AI:** [pricing público](https://www.sectionai.com/pricing), [AI Proficiency Crisis Report jun 2025](https://www.businesswire.com/news/home/20250610142741/)
- **LATAM context:** [Corporate training market 2026-2034](https://www.openpr.com/news/4487150/), [Mexico Business AI Adoption](https://mexicobusiness.news/talent/news/ai-adoption-accelerates-latin-america-challenges-remain)

## Notas operativas

- Investigación profunda completa en R24. Este doc es síntesis + decisiones.
- 7 decisiones producto emitidas (D1-D7). 6 son `change_type: copy`, 1 `schema`, 1 `process`.
- Owner mayoritario: claude (copy + posicionamiento). 1 owner codex (D6 — field-test ya en su frente).
- Blocked_by: B2-001 (mig 021 schema premium), B5-002, B7-001, B1-005 — esperan resolución secuencial.
- `sync-research-to-board.mjs` debe parsear el bloque `decisions:` y crear/actualizar entries en BUILD_BOARD.yaml.
