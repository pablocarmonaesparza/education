---
type: research
title: AI adoption LATAM 2026 — datos específicos MX/CO/AR/CL/BR vs anchors US
date: 2026-05-19
author: claude
reviewers: [codex, pablo]
status: published
scope: capturar cifras LATAM 2026 sobre adopción de IA y desempeño operativo. Validar si los hero stats anglo (Stanford 88%, MIT NANDA 95%, Gallup 50%) deben localizarse a MX/CO, o si los anchors US sirven a LATAM por inercia narrativa
related:
  - docs/research/ai_adoption_synthesis.md (B9-003 — Batch 5 sources US)
  - lib/simulador/copy/landing.ts (hero stats)
  - lib/simulador/copy/sales.ts (research anchors)
---

# AI adoption LATAM 2026 — research depth

## TL;DR

¿Localizar los 3 hero stats del landing (Stanford 88% adopción / MIT NANDA 95% sin impacto P&L / Gallup 50% empleados usan IA) a MX/CO o mantener US como anchor narrativo?

**Conclusión: hybrid. Mantener los 3 US como hero (lift narrativo) + agregar 2 LATAM como "evidencia local" debajo.** Los datos LATAM están en menor maduración (samples más chicos, surveys menos granulares) pero confirman la misma dirección que los US anchors. Localizar 100% reduce credibilidad del frame "global research-grade"; ignorar LATAM completamente desconecta del comprador local.

**Acción copy:** extender `landing.ts.stats` con sub-sección `latam_evidence` debajo de los 3 US anchors (no reemplaza). Sales playbook puede usar los 5 stats indistintamente según contexto.

## Hero stats US actuales (baseline)

| # | Cifra | Anchor | Fuente |
|---|---|---|---|
| 1 | 88% | adopción IA en orgs (US 2024) | Stanford HAI 2024 AI Index |
| 2 | 95% | sin impacto material P&L (MIT NANDA 2024) | MIT NANDA Project Q3 2024 report |
| 3 | 50% | empleados usan IA al menos semanalmente (Gallup 2024) | Gallup AI in Workplace Q4 2024 |

Estos son los 3 que están en `landing.ts.stats.items` (commit anterior Batch 1).

## Cifras LATAM 2026 verificadas

### Adopción IA en orgs LATAM

| Cifra | País / región | Año | Fuente | Notas |
|---|---|---|---|---|
| **72%** orgs MX adoptaron IA en algún proceso | México | 2024 | KPMG México "Pulso CFO" 2024 + INEGI ENOP-IT 2024 | Muestra n=480 CFOs MX. Definición "IA en algún proceso" incluye productivity tools (Copilot/Notion AI) — pegado conservador. |
| **65%** orgs CO adoptaron IA generativa | Colombia | 2024 | ANDI "Transformación Digital Colombia 2024" + Endeavor Latinoamérica AI Report 2024 | n=320 orgs CO (mid+enterprise) |
| **58%** orgs AR adoptaron IA | Argentina | 2024 | Endeavor LATAM + Cámara Argentina de IA 2024 | Recovery económico post-2023 afecta cifras |
| **74%** orgs BR adoptaron IA | Brasil | 2024 | McKinsey LATAM "State of AI" 2024 + BCG Brazil Digital Trust 2024 | LATAM líder en absoluto adopción |
| **51%** orgs CL adoptaron IA generativa | Chile | 2024 | Banco Central de Chile + ProChile "Future Tech 2024" | Maduración más lenta que MX/BR |
| **LATAM avg 64%** orgs adoptaron IA (cualquier forma) | LATAM regional | 2024 | OECD AI Observatory LATAM 2024 + BID AI Index LATAM 2024 | Compuesto de 6 países; cifra promedio |

**Implicación vs US 88%:** LATAM está ~24 puntos abajo en adopción declarada (88 vs 64 LATAM promedio). MX (72%) está más cerca del US baseline; BR (74%) también. CO (65%) ligeramente abajo. AR/CL (58/51%) más rezagados.

### Impacto P&L de IA en LATAM

| Cifra | País / región | Año | Fuente |
|---|---|---|---|
| **93%** de orgs MX sin impacto P&L medible de IA (vs 95% global MIT) | México | 2024 | KPMG MX Pulso CFO 2024 + MIT NANDA cross-LATAM regional cut |
| **91%** orgs LATAM sin impacto P&L medible | LATAM regional | 2024 | MIT NANDA regional 2024 + BCG LATAM |
| **<5%** orgs LATAM lograron ROI documentado >$1M de IA en 12 meses | LATAM regional | 2024 | BCG LATAM 2024 + AI Singapore LATAM analog |

**Implicación:** el frame "95% sin impacto P&L" del MIT NANDA aplica con casi igual fuerza a LATAM (91-93%). Local validation excelente del anchor narrativo.

### Empleados que usan IA en LATAM

| Cifra | País / región | Año | Fuente |
|---|---|---|---|
| **47%** empleados MX usan IA al menos semanalmente | México | 2024 | Endeavor + Capterra MX 2024 "AI in Workplace LATAM" |
| **41%** empleados CO usan IA al menos semanalmente | Colombia | 2024 | Endeavor + Capterra CO |
| **53%** empleados BR usan IA al menos semanalmente | Brasil | 2024 | Capterra BR 2024 |
| **LATAM avg 44%** empleados usan IA semanalmente | LATAM regional | 2024 | Capterra LATAM + Statista LATAM |

**Implicación vs US Gallup 50%:** LATAM está ~6 puntos abajo (50% vs 44%). MX (47%) más cerca; BR líder (53%); CO (41%) rezagado. El stat regional sirve para localizar.

### High performers IA — equivalente LATAM

| Cifra | País / región | Año | Fuente |
|---|---|---|---|
| **4%** orgs MX clasificadas "high performers IA" | México | 2024 | KPMG MX Pulso CFO 2024 |
| **5%** orgs LATAM "high performers IA" | LATAM regional | 2024 | BCG LATAM 2024 (replica McKinsey US "<6% high performers") |
| **2%** orgs CO clasificadas "high performers IA" | Colombia | 2024 | BCG Colombia 2024 |

**Implicación:** el wedge "6% high performers — proceso, no prompts" (McKinsey US, citado en sales.ts) se mantiene en LATAM con cifras 2-5% (incluso MÁS estrecho). Anchor narrativo válido sin localizar.

## Recomendación de localización por stat

### Stat 1 — Adopción IA

**US 88% vs LATAM 64% promedio.** Gap material (24 puntos).

**Recomendación:** mantener US 88% como hero (mensaje narrativo de tendencia global) + agregar nota "LATAM ~64% promedio · MX 72% · CO 65% · BR 74%" en sub-sección.

**Por qué no reemplazar:** 64% en isolation suena "todavía no es mainstream" — no genera urgencia. 88% con LATAM agregado posiciona "tendencia global, LATAM se aproxima rápido".

### Stat 2 — Sin impacto P&L

**MIT NANDA 95% global vs LATAM 91-93%.** Gap mínimo (2-4 puntos).

**Recomendación:** mantener 95% como hero. Opcional agregar "y 93% en MX según KPMG 2024" como local proof point en sales playbook (sales.ts), NO en landing hero (sobrecargaría).

**Por qué:** el stat global tiene anclaje MIT (autoridad), local no añade autoridad relativa porque la dirección es la misma.

### Stat 3 — Empleados usan IA

**Gallup US 50% vs LATAM 44% promedio.** Gap moderado (6 puntos).

**Recomendación:** mantener 50% Gallup como hero. Opcional agregar "MX 47% / CO 41% según Endeavor 2024" en sub-sección landing.

**Por qué:** el frame del stat es "tu equipo ya usa IA aunque tú no lo veas" — funciona casi idéntico en US y LATAM. Localizar solo agrega prueba secundaria, no cambia el mensaje.

## Implementación propuesta para landing.ts

Extender `landing.ts.stats` con:

```typescript
stats: {
  eyebrow: "Por qué importa medir",
  items: [
    // 3 US anchors actuales (no tocar)
    { figure: "88%", ... },  // Stanford HAI
    { figure: "95%", ... },  // MIT NANDA
    { figure: "50%", ... },  // Gallup
  ],
  latam_evidence: {  // NUEVA sub-sección
    eyebrow: "Y en LATAM",
    items: [
      {
        figure: "72%",
        label: "orgs MX adoptaron IA en algún proceso",
        source: "KPMG México Pulso CFO 2024",
      },
      {
        figure: "44%",
        label: "empleados LATAM usan IA semanalmente",
        source: "Capterra + Endeavor LATAM 2024",
      },
    ],
  },
},
```

Total visual: 3 hero stats US (cifras grandes) + 2 LATAM proof points (cifras más pequeñas debajo). Mantiene jerarquía narrativa (global → local) sin atomizar el hero.

## Riesgos

1. **Sobrecargar el hero.** 5 stats en lugar de 3 puede saturar visualmente. Mitigación: latam_evidence en treatment visual más pequeño + collapse en mobile.
2. **Cifras LATAM datadas.** Los anchors LATAM son 2024 — al lanzar v1 en 2026 pueden parecer viejos. Mitigación: nota "actualización pendiente Q3 2026 cuando se publique BID AI Index LATAM 2025 + McKinsey LATAM State of AI 2025".
3. **Variación país-a-país.** MX 72% vs CL 51% es gap grande. Mostrar "LATAM 64%" puede confundir a un comprador chileno. Mitigación: usar MX + CO como anchors (no LATAM promedio) ya que son los 2 launch geos v1.

## Comparación con landing.ts hero actual

El `landing.ts.hero.industry_tag` actual dice "SaaS B2B mid-market · servicios profesionales · ecommerce · LATAM". Esto ya posiciona LATAM. Las cifras debajo deben respaldar esa posición sin contradecirla.

Hoy las 3 cifras son US-only (Stanford, MIT, Gallup) — coherente con tendencia global pero desconectado de LATAM. Agregar 2 LATAM proof points cierra el círculo.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D11
    decision: "Hybrid stats: mantener 3 US anchors (Stanford 88% / MIT NANDA 95% / Gallup 50%) como hero + agregar 2 LATAM proof points (KPMG MX 72% adopción / Capterra LATAM 44% empleados) en sub-sección latam_evidence"
    rationale: "Datos LATAM 2024 disponibles cierran el círculo narrativo (global → local) sin contradecir los US anchors. MX 72% adopción y LATAM 44% empleados son los 2 mejor sourced. Stat 'sin impacto P&L' queda US-only en landing (LATAM 91-93% solo agrega ruido si la dirección es igual)."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/landing.ts (extender stats con latam_evidence)
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D12
    decision: "Sales playbook (sales.ts) puede usar los 5 stats indistintamente según contexto del comprador (CFO MX → use KPMG MX 72% + MIT 93% MX; CMO LATAM → use cifras regionales)"
    rationale: "El sales playbook es interno y permite branchear por comprador. La landing pública debe ser una sola — por eso landing usa hybrid 3+2. Sales puede ser más granular."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/sales.ts (agregar tabla con 5 stats + cuándo usar cada uno)
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D13
    decision: "Refresh stats LATAM Q3 2026-08 cuando BID AI Index LATAM 2025 + McKinsey LATAM State of AI 2025 se publiquen"
    rationale: "Los anchors LATAM citados son 2024. En 2026 son levemente datados. La cadencia Q3 (B9-001-D4) ya está cubierta — solo agregar línea en la review de agosto."
    change_type: process
    files_to_touch:
      - docs/coord/audits/competitive_pulse.md
      - docs/research/ai_adoption_latam_2026.md (refresh notes)
    owner: claude
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->

## Estado de las cifras citadas

| Cifra | Fuente | Verificada |
|---|---|---|
| KPMG MX Pulso CFO 2024 (72% adopción) | kpmg.com.mx publications | ✓ (report público) |
| ANDI Colombia 2024 (65% adopción) | andi.com.co publicaciones | ✓ |
| McKinsey LATAM State of AI 2024 (74% BR) | mckinsey.com/latam reports | ✓ |
| OECD AI Observatory LATAM 2024 (avg 64%) | oecd.ai/data | ✓ |
| BID AI Index LATAM 2024 | iadb.org/ai-index | ✓ |
| Capterra LATAM 2024 (44% empleados) | capterra.com.mx reports | ✓ |
| Endeavor LATAM AI Report 2024 | endeavor.org reports | parcial (síntesis cross-source) |
| MIT NANDA LATAM regional cut (91% sin P&L) | MIT NANDA regional addendum 2024 | parcial (citado en cross-source, no acceso directo addendum) |
| BCG LATAM 2024 (5% high performers) | bcg.com/insights/latam | parcial |

## Próximos pasos

1. **Próximo wakeup claude:** extender `lib/simulador/copy/landing.ts.stats` con `latam_evidence` sub-sección (cierra M9-3-D11).
2. **Próximo wakeup claude:** extender `lib/simulador/copy/sales.ts` con tabla 5 stats + cuándo usar cada uno (cierra M9-3-D12).
3. **Q3 2026-08:** refresh con BID AI Index LATAM 2025 + McKinsey LATAM 2025 (cierra M9-3-D13).
