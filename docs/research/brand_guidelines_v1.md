---
type: research
title: Brand guidelines v1 — voz + tono + visual identity consolidados
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: documento de referencia canónico para voz, tono, vocabulario, visual identity. Cualquier futuro material (copy, email, slide deck, social post, sales doc) debe alinearse con esto. Consolidación de patterns ya emergentes en los 12 copy files + research depth
related:
  - lib/simulador/copy/ (12 archivos versionados como source of truth de voz)
  - docs/coord/audits/loop_audit_post_copy_batch.md (M9.2 vocab verification)
  - docs/research/buyer_persona_head_marketing_latam.md
  - docs/research/onboarding_email_sequences.md (voz Pablo)
---

# Brand guidelines v1 — Itera Simulador

## TL;DR

Itera Simulador comunica como **Pablo conversacional, no corporate-bot**. Voz: español neutro LATAM corporate honesto. Visual: minimalista premium derivado del design system actual (accent indigo, gray escalas). Vocabulario: estrictamente canónico (criterio/banda/diagnóstico/manager). Cero AI slop, cero promesas exageradas, cero jerga.

**Principio rector:** "Diagnóstico operativo, no certificación." Todo el branding sostiene este frame.

## Voz — quiénes somos cuando hablamos

### Personality traits

Itera es:

1. **Honesto antes que persuasivo.** Si un caso es difícil, lo decimos. Si v1 NO cubre Sales, lo decimos. Si Stripe NO está cerrado, lo decimos.
2. **Específico antes que vago.** "Reporte ejecutivo en 30s" > "rápido feedback".
3. **Educativo sin paternalismo.** Explicamos qué medimos, no por qué deberías comprar.
4. **Conversacional sin informal.** Lowercase + contracciones aceptables ("ya está listo"), pero NO emojis ni LOL ni vibes excesivos.
5. **Empírico sin tecnicismo.** Citamos research (Stanford 88%, MIT NANDA 95%) pero traducimos a buyer ("el problema no es el modelo, es el criterio").

Itera NO es:

1. ❌ **Corporate-bot.** "Estimad@/Apreciad@", "agradecemos su preferencia", "nos enorgullece anunciar".
2. ❌ **Marketing exagerado.** "Revoluciona", "transforma", "rompe paradigmas", "next-level".
3. ❌ **Tech-bro.** "Disruptive AI-native platform", "leveraging cutting-edge LLMs", "synergy".
4. ❌ **Defensivo.** "Sabemos que hay competencia pero..." (cero defensiveness vs. competitors).
5. ❌ **Promesa de ROI específico.** "Mejora 30% productividad" — no podemos garantizar.

### Voice spectrum

| Spectrum | Itera | NO Itera |
|---|---|---|
| Formal ↔ Casual | mid-casual (lowercase, contracciones, "directo") | corporate-formal o frat-casual |
| Serio ↔ Lúdico | mid-serio (honesty + precision) | sarcastic o playful exceso |
| Técnico ↔ Lay | lay-with-citations (research-grade visible) | jargon-heavy o oversimplified |
| Aspiracional ↔ Pragmático | pragmático (aterriza al buyer real) | aspiracional vacío |

### Pablo first-person OK

Cuando la voz es Pablo (emails, sales calls, LinkedIn posts), first-person OK:

> "Hola, soy Pablo. Estoy construyendo Itera Simulador. Si quieres ver cómo funciona con tu equipo, escribe directo."

Cuando es product copy (landing, dashboard, runtime), tercera persona o second-person:

> "Itera mide cómo tu equipo decide cuando usa IA."

NEVER mezclar in same surface. Landing usa "Itera" + "tu equipo" (no "yo"). Email Pablo usa "yo" + "tu" libremente.

## Tono — cómo modula según contexto

### Tono per surface

| Surface | Tone target | Por qué |
|---|---|---|
| `landing.ts` | Confident + research-anchored | First impression — establish credibilidad |
| `sales.ts` (internal) | Direct + frameworked | Acelera discovery calls |
| `report.ts` | Sober + executive | Manager lo comparte con C-suite |
| `runtime.ts` | Calm + procedural | Participante focused, no añadir ruido |
| `manager.ts` | Strategic + actionable | Manager toma decisiones, no rumia |
| `onboarding.ts` | Welcoming + clear | Reduce friction wizard |
| `field-test.ts` | Honest preliminar | Sin certificación, ofrece muestra |
| `billing.ts` | Transparent + no surprises | Pricing claro, refund explícito |
| `auth.ts` | Brief + utilitarian | Login no necesita charm |
| `errors.ts` | Empático sin zalamero | Asumimos error nuestro cuando aplique |
| `legal.ts` | Compliance neutral | LFPDPPP + Ley 1581 lenguaje formal |
| `emails.ts` | Pablo conversacional | First-person, lowercase, peer voice |

### Modulación según audiencia

| Audiencia | Tone shift |
|---|---|
| Head/VP Marketing (buyer principal) | educativo + ROI implícito |
| CMO/CEO (manager del manager) | strategic + executive summary |
| CFO (skeptical) | empírico + data-anchored (M9-3-D12 stats route) |
| CTO/VP Eng (technical skeptic) | defensibilidad 5 puntos (M9-3-D28) |
| Participante empleado | colaborativo + sin presión, NO juicio moral |
| Itera staff (Pablo, claude, codex) | direct + concise + decision-driven |

## Vocabulario canónico

### Términos OBLIGATORIOS

Usar SIEMPRE estos términos:

| Término canónico | Significado |
|---|---|
| **criterio** | qué medimos (NO "skill", "competencia", "habilidad") |
| **diagnóstico** | el producto Fase 1 (NO "assessment", "evaluación") |
| **caso vivo** | sesión runtime (NO "test", "examen", "simulación") |
| **banda** | resultado por dimensión A/M/B (NO "score", "puntuación", "nota", "grade") |
| **decidir / decisión** | output del participante (NO "feedback", "respuesta") |
| **manager** | comprador + lider del equipo (NO "líder", "jefe", "supervisor") |
| **participante** | empleado haciendo el diagnóstico (NO "alumno", "estudiante", "user") |
| **evidencia** | extracto textual del transcript (NO "results", "data") |
| **pilotar/entrenar/pausar/escalar** | 4 caminos override matrix (NO inventar synonyms) |
| **organización** | la org contratante (NO "empresa" inconsistente, NO "compañía") |
| **sprint** | unidad de contratación Fase 1 (NO "course", "program") |
| **asiento** | 1 participante = 1 asiento (NO "license", "seat license") |

### Términos PROHIBIDOS

NUNCA usar (excepto en JSDoc declaratorio que LISTE qué no usar):

- skill / skills / habilidad / competencia → usar "criterio"
- score / puntuación / nota → usar "banda"
- feedback / retroalimentación → usar "decisión", "evidencia"
- assessment → usar "diagnóstico"
- learner / student / alumno → usar "participante"

### Anglicismos aceptados

Estos son corporate LATAM 2026 estándar:

- email, dashboard, workflow, sprint, tier, app, link, status
- A/B testing, KPI, OKR, ROI (con caution), CSAT, NPS
- benchmark (cuidado — NO uses para describir Itera output)
- B2B, SaaS, mid-market

### Anglicismos a EVITAR

Innecesarios o pretenciosos:

- ❌ awesome, cool, vibes
- ❌ leverage, synergy, ecosystem, deep dive
- ❌ thought leadership, value add, low-hanging fruit
- ❌ scale, growth (over-used)

## Escritura

### Lowercase corporate LATAM

Convención: titulares y bodies en lowercase salvo:
- Nombres propios (Pablo, Itera, México, Colombia, Stanford, MIT)
- Comienzo de frase
- Acrónimos establecidos (UI, IA, PII, LATAM, RFC, NIT)
- Citas literales si la fuente las capitaliza

✅ "¿tu equipo usa IA con criterio?"
❌ "¿Tu Equipo Usa IA Con Criterio?"

### Frases cortas

Target 12-18 palabras/frase en body. Frases largas son OK ocasionalmente pero NO consistentes.

✅ "Itera mide cómo tu equipo decide cuando usa IA en flujos reales."
❌ "Itera es una plataforma integral, basada en research, que aprovecha la inteligencia artificial para ayudar a tu equipo a desarrollar criterio operativo en flujos de trabajo que utilizan IA generativa..."

### Voz activa

Usa voz activa, no pasiva:

✅ "El judge LLM detecta evidencia textual."
❌ "La evidencia textual es detectada por el judge LLM."

### Sin filler words

Elimina padding:

- ❌ "Cabe destacar que..." → directo al punto
- ❌ "Es importante mencionar..." → directo al punto
- ❌ "De alguna manera..." → específico o eliminate
- ❌ "Como mencionamos anteriormente..." → si lo dijiste, no repitas

## Visual identity

### Color palette

Heredado del design system actual (Apple-inspired):

| Color | Usage | Token |
|---|---|---|
| Accent indigo | primary actions, links, accent highlights | `--accent` (indigo 500) |
| Accent soft | hover states, soft fill backgrounds | `--accent-bg-soft` (indigo 50/10%) |
| Surface white | main background | `--surface` |
| Surface 2 (light gray) | secondary background | `--surface-2` |
| Surface 3 (medium gray) | tertiary background | `--surface-3` |
| Text primary | main copy | `--text-primary` (gray 900) |
| Text secondary | meta copy | `--text-secondary` (gray 600) |
| Text tertiary | hints, captions | `--text-tertiary` (gray 400) |
| Hairline gray | dividers | `--hairline` (gray 200) |
| Border standard | inputs, cards | `--border` |
| Border strong | active inputs | `--border-strong` |

**Band colors** (para Alto/Medio/Bajo, NON-semáforo per M9-3-D33):
- A (Alto): accent-soft + accent-text
- M (Medio): surface-2 + text-primary
- B (Bajo): surface-3 + text-secondary

NEVER semáforo verde/amarillo/rojo para bandas — rompe frame "no juicio moral".

### Typography

Heredado del design system:

- **Display**: weight 700-800, large (40px+), lowercase, tight tracking
- **Headline**: weight 600-700, mid-large (24-32px), lowercase, normal tracking
- **Body**: weight 400, base (15-17px), normal case, line-height 1.5-1.6
- **Caption**: weight 400, smaller (12-13px), normal case
- **Mono**: weight 400, smaller (12-13px), used para metadata (timestamps, IDs)

System fonts (Inter o equivalent stack). NO Google Fonts custom load v1 — mantiene performance.

### Spacing system

Tailwind/spacing scale standard:
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px
- 4xl: 64px

Surfaces premium B2B 2026 usan generous spacing (lg+ default). NO usar 8px margin en surfaces principales.

### Iconography

- Lucide icons (open source, MIT) — usar consistentemente
- 16px o 20px standard size en context inline
- 24px+ en empty states o icon-driven cards
- Stroke width 1.5-2 (NO thinner, NO thicker)
- NO color-coded iconos como semáforo — match con text color

### Imagery

v1 NO incluye photo assets (Pablo no tiene budget photographer / no quiere stock photos genéricos). 

Future v2: si agregamos imagery:
- NO stock photos (Reuters/Getty/Unsplash) — se ve genérico
- NO renders de IA (rompe credibilidad frame "no AI slop")
- SÍ screenshots reales del producto (dashboard real con datos sintéticos OK)
- SÍ diagrams generados (matrix 3×5, flow charts) en mismo style del design system

## Tone do's and don'ts cross-surface

### ✅ DO

- "Itera mide cómo decide tu equipo cuando usa IA"
- "Diagnóstico operativo de 30 días"
- "Reporte ejecutivo por persona"
- "Risk events con evidencia textual"
- "Hybrid review humano cuando hay risks altos"
- "Sin certificación, sin curso"
- "Pago seguro vía Stripe (PCI DSS Level 1)"
- "Solo ves a las personas de tu team"

### ❌ DON'T

- "Itera es la plataforma de IA learning más avanzada de LATAM" (claim sin proof)
- "Revoluciona cómo tu equipo aprende IA" (cliché + framing wrong — no es learning)
- "Mejora tu ROI un 30% en 90 días" (promise sin garantía)
- "Powered by GPT-4 / Claude / etc." (over-shares tech stack)
- "Cohort experience inmersiva con cohort coaches" (Section AI language, no Itera)
- "Becoming an AI-fluent organization" (Workera language)
- "Empower your team to leverage AI synergistically" (AI slop + business jargon)

## Frame canónico para describir el producto

Cuando preguntan "¿qué hace Itera?", respuesta canónica:

> Itera mide cómo tu equipo decide cuando usa IA en flujos reales de trabajo. Diagnóstico operativo de 30 días que termina con un reporte ejecutivo por persona, dashboard agregado para el manager, y recomendación accionable (pilotar/entrenar/pausar/escalar) por cada participante. Sin certificación, sin curso — diagnóstico para decisiones.

Variantes según audiencia:

**Para CFO (data anchor):** "Stanford 88% adopción IA, MIT NANDA 95% pilotos sin impacto P&L, McKinsey 6% high performers — la diferencia es proceso, no prompts. Itera mide exactamente lo que diferencia al 6%."

**Para CMO (action anchor):** "Tu equipo de Marketing ya usa ChatGPT/Claude todos los días. Itera te muestra con qué criterio. Reporte ejecutivo, recomendación accionable, en 30 días."

**Para CTO (defensibilidad anchor):** "LLM detector de evidencia + override matrix determinístico + calibration set pre-deploy + hybrid review humano. Para escépticos de medición LLM, tenemos los 5 puntos defendibles."

## Anti-frames (NUNCA usar)

❌ "Itera enseña IA a tu equipo" — somos diagnóstico, NO training
❌ "Certificación AI de tu equipo" — NO somos cert
❌ "Curso de prompting" — NO somos curso
❌ "Skills assessment" — NO somos skill test
❌ "AI roleplay platform" — NO somos roleplay
❌ "Coaching cohort experience" — NO somos cohort
❌ "Quiz interactivo" — NO somos quiz

## Aplicación cross-channel

### Landing page

Tone: confident + research-anchored
Hero copy: ya cubierto en landing.ts.hero
Citations: visible inline ("Stanford AI Index · 2026") en stats section

### LinkedIn posts (Pablo)

Tone: Pablo conversacional first-person
Length: 800-1500 caracteres
Structure: hook (1-2 frases) + body (3-5 párrafos cortos) + CTA simple
Frequency: 2-3 posts/semana max
Hashtags: 3-5 max, lowercase, no spam (#ia #criterio #b2b #latam)

### Email transactional (`emails.ts`)

Tone: clear + utilitarian
Length: ≤400 caracteres body
No HTML pesado

### Email nurture (`onboarding_email_sequences`)

Tone: Pablo conversacional
Length: 200-500 caracteres
1 CTA primary, max 2

### Sales calls (Pablo)

Tone: educativo + frameworked
Demo flow 5/15/5/5 (M9-3-D15)
NO slides genéricos
NO selling pressure

### Customer support (`soporte@itera.la`)

Tone: empático + accionable
Response time: <12h target (M9-3-D19)
Identify P0/P1/P2 + escalate appropriately

### Documentación interna (board, audits, research)

Tone: direct + decision-driven
Vocabulary: same canónico
Format: structured (headers + bullets + tables)
Length: necesario para resolver decisión, NO exhaustive

## Auditing brand fidelity

Quick checks para validar cualquier material:

1. **¿Usa vocabulario canónico?** grep skill/score/feedback/assessment → si hits, refactor.
2. **¿Cita anglicismos prohibidos?** leverage/synergy/awesome → si hits, refactor.
3. **¿Lowercase corporate consistent?** primer letras MAYÚSCULAS en titulares ≠ permitido (excepto nombres propios).
4. **¿Frame "diagnóstico no certificación" sostenido?** si hay frases que suenan a curso/cert/skill, refactor.
5. **¿Voz Pablo o producto consistente per surface?** si mezcla "Itera" + "yo" en mismo párrafo, refactor.
6. **¿Citations source visible si claim research?** "Stanford 88%" sin "(Stanford AI Index 2026)" no es válido.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D63
    decision: "Brand guidelines v1 es referencia canónica para cualquier futuro material (copy, email, slide, social, sales doc). Toda nueva creación se valida contra los 6 audit checks antes de ship"
    rationale: "Consolidar brand evita drift cuando claude o codex agregan copy futuro. Los 6 audit checks son ejecutables en ~2 min (greps + visual scan). Brand cohesion es differentiator vs competidores que usan AI-slop voice."
    change_type: brand
    files_to_touch:
      - docs/research/brand_guidelines_v1.md
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D64
    decision: "v1 NO incluye imagery (photo assets) en marketing materials. Si necesario v2: screenshots reales del producto > stock photos > zero imagery. NUNCA renders generados por IA"
    rationale: "Stock photos rompen credibilidad frame 'research-grade'. AI renders rompen credibilidad frame 'no AI slop'. Screenshots reales son mejor (incluso con datos sintéticos en demo) porque muestran producto real. v1 con cero imagery es OK — keep clean."
    change_type: visual_identity
    files_to_touch:
      - docs/research/brand_guidelines_v1.md
    owner: claude + pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D65
    decision: "Frame canónico para describir el producto es OBLIGATORIO usar literal o variación cercana. NO improvisar descripciones nuevas — usa los 3 variantes per buyer audience (CFO/CMO/CTO)"
    rationale: "Frame inconsistency en discovery calls genera customer confusion. Pablo NO improvisa frame bajo presión — usa la versión canónica. Variantes per buyer ya están en sales.ts.stats_playbook y aquí — listed para easy reference."
    change_type: comms_discipline
    files_to_touch:
      - docs/research/brand_guidelines_v1.md
      - lib/simulador/copy/sales.ts (ya alineado)
    owner: pablo
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** brand guidelines son referencia. NO requiere implementación.
2. **Aplicación pre-launch:** cualquier nueva LinkedIn post o sales materials Pablo lo valida contra los 6 checks.
3. **Post-launch:** refresh guidelines con learnings de discovery calls (qué frames resonaron vs no).
4. **v2 trigger:** si imagery becomes necessary (case studies, social), revisit M9-3-D64.
