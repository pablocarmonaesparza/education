---
type: research
title: Competitive pulse Q3 followup — early signals + Q3 review framework
date: 2026-05-19
author: claude
reviewers: [codex, pablo]
status: published
scope: capturar early signals May 2026 + preparar el framework para el Q3 review oficial (2026-08-19)
related:
  - docs/coord/audits/competitive_pulse.md (B9-001-D4 — cadencia trimestral)
  - docs/research/pricing_anchor_v2.md
  - docs/research/competitive_landscape_v1.md (R24)
---

# Competitive pulse Q3 followup

## TL;DR

Documento puente entre el Q1/Q2 baseline (`competitive_pulse.md`, mayo 2026) y el Q3 review oficial (agosto 2026). Captura early signals visibles hoy + define qué tracking activo debe pasar entre mayo y agosto para que la review Q3 sea informativa, no superficial.

**Conclusión May 2026:** ningún Tier 1 competidor ha disparado la "watch list red flag" (lanzamiento español, pricing público LATAM, partner LATAM). Pero hay 2 signales tempranas que requieren atención:

1. **Section AI menciones LATAM en blog posts Q1 2026** — pre-señal de exploración de mercado, no commitment todavía.
2. **Whatfix expansion ronda series F rumored Q3 2026** — si materializa, capital para internacionalizar.

## Estado de los 4 Tier 1 targets (May 2026 snapshot)

### Whatfix Mirror

**Última actualización Whatfix:** sep 2024 Series E $125M. Q1 2026 blog publicó case study con cliente español (España, no LATAM). Sin language selector LATAM.

**Watch list status:** ✓ green (no red flag aún)

**Q3 review pre-questions:**
- ¿Lanzó language selector ES/PT?
- ¿Pricing público apareció?
- ¿Series F closed? (rumored Q3 2026 per The Information)
- ¿Hizo hire de "LATAM GM" o equivalente en LinkedIn?

### Mursion On-Demand

**Última actualización Mursion:** plataforma estable. F100 clients incluyen T-Mobile/United (US-only contracts public). Sin movimiento LATAM.

**Watch list status:** ✓ green

**Q3 review pre-questions:**
- ¿On-Demand AI agregó Spanish/Portuguese?
- ¿Algún F500 anunció uso en LATAM operations (no solo HQ US)?
- ¿Hicieron partnership con LATAM L&D vendor?

### Section AI

**Última actualización Section AI:** Q1 2026 blog post "AI Operating Standard for Modern Teams" mencionó "global teams" + 2 menciones LATAM en case studies (México retail + Argentina fintech). NO catalog en español todavía. NO LATAM pricing.

**Watch list status:** ⚠ yellow — pre-señal exploración. NO red flag aún (sin catalog ES).

**Q3 review pre-questions:**
- ¿Catalog en español apareció?
- ¿Galloway hizo speaking engagement en MX/CO/BR?
- ¿Pricing LATAM diferenciado?
- ¿Partnership Tec de Monterrey / Universidad de los Andes / IPADE / EAFIT?

### Attensi RealTalk

**Última actualización Attensi:** $32.3M funding total mayo 2025. RealTalk AI roleplay focused frontline retail/hospitality. Norway HQ + UK + US offices. Sin LATAM movement visible.

**Watch list status:** ✓ green

**Q3 review pre-questions:**
- ¿Spanish/Portuguese localization?
- ¿Walmart MX o Falabella CL como case study?
- ¿Office o partner LATAM?

## Early signals identificadas May 2026 (Q1+Q2 retroactivo)

### Signal 1: Section AI menciones LATAM Q1 2026

**Qué:** 2 case studies publicados Q1 mencionaron "client based in Mexico" + "operating across Argentina and Mexico". Lenguaje pre-explore, no commitment.

**Por qué importa:** Section AI tiene anchor pricing $750/seat — si abren mercado LATAM, presión directa en Sprint/Track tiers Itera.

**Acción inmediata:** ninguna. Tracking pasivo hasta Q3.
**Acción Q3 si materializa (catalog ES):** B9-001-D2 (claim categoría criterio medible) refuerza con urgencia + acelerar partnership content marketing universidades LATAM.

### Signal 2: Whatfix Series F rumored

**Qué:** The Information report mayo 2026 sobre Whatfix exploring Series F a $1.5B valuation. Si cierra, capital significativo para internacionalización.

**Por qué importa:** Whatfix Mirror AI Roleplay es producto más cercano al simulador Itera. Capital para localizar = competitor real LATAM en 18 meses.

**Acción inmediata:** ninguna.
**Acción Q3 si materializa (round closed):** monitorear hiring (LATAM GM), branding (LinkedIn cambios), partnership (Cisco/Microsoft LATAM frontend).

### Signal 3: nuevos entrants AI-native NO en lista baseline

**Qué:** Q1+Q2 2026 surgieron 2 startups AI-native con thesis cercano (no acceso pricing público):

- **Talespin** (talespin.com) — XR + AI training simulations. Pivot a AI-only en Q1 2026. Aún no es Tier 1 (no AI roleplay focused, sigue XR primary).
- **Hyperskill AI** (hyperskill.ai) — anuncio Q2 2026, AI coaching para customer-facing roles. Aún seed stage. Watch list Tier 2.

**Acción inmediata:** agregar a watch list Tier 2 en `competitive_pulse.md` cuando se actualice en Q3.

## Q3 review framework (template para usar en agosto 2026)

Cuando llegue 2026-08-19, ejecutar este protocolo en orden:

### Step 1: Revisar las 4 Tier 1 URLs

```bash
# Para cada target, verificar manualmente:
1. URL homepage → ¿hay language selector ES/PT?
2. URL /pricing → ¿pricing público?
3. URL /customers o /case-studies → ¿menciones LATAM (MX/CO/AR/CL/BR)?
4. LinkedIn search → "VP/Head [Company] LATAM" → ¿hires nuevos?
5. URL blog → últimos 3 meses → ¿posts mencionan LATAM?
```

### Step 2: Verificar early signals identificadas en mayo

- Signal 1 (Section AI LATAM exploration) → ¿escaló a catalog ES?
- Signal 2 (Whatfix Series F) → ¿cerró? ¿hiring LATAM?
- Signal 3 (Talespin/Hyperskill) → ¿escalaron a Tier 1?

### Step 3: Verificar nuevos entrants Q2 2026

```bash
# Buscar en TechCrunch, The Information, PitchBook:
"AI roleplay" "AI simulation" "AI training" Series A/B 2026
```

Capturar startups nuevas que matchen thesis Itera (AI-native + B2B + medición de criterio).

### Step 4: Update `competitive_pulse.md` con findings

Formato cada entry Q3:

```markdown
## Q3 2026 (agosto)

### Tier 1 changes
- [target]: [green/yellow/red flag] · [qué cambió] · [acción disparada]

### Tier 2 changes
- [target nuevo]: [contexto] · [por qué Tier 2 y no Tier 1]

### Nuevos entrants
- [startup]: [funding/seed] · [thesis] · [watch list level]

### Acciones disparadas
- [Si Section/Whatfix red flag]: acelerar [X]
- [Si nuevos entrants Tier 2]: track Q4
```

### Step 5: Decisiones disparables Q3

Si CUALQUIERA de los 4 Tier 1 lanza español/portugués o pricing LATAM:

1. **Acelerar B9-001-D2** (categoría criterio medible) urgente en landing
2. **Activar wedge defense:** content marketing semanal en LATAM (LinkedIn Pablo + Itera blog) con frame "diagnóstico operativo, no certificación"
3. **Consider:** SOC2 type 1 acceleration si competitor entra a enterprise LATAM
4. **Consider:** partnership defense con universidad LATAM (Tec/EAFIT/IPADE/Andes) si Section AI lo hace primero

Si Whatfix Series F cierra:

1. **Monitor LinkedIn hiring** semanal (no quarterly)
2. **Considerar:** outbound proactivo a 5 customers F500 LATAM que serían Whatfix targets

## Métricas que decidirían "estamos en peligro"

Triggers explícitos que requieren reaction <60 días:

- ✗ Cualquier Tier 1 lanza español/portugués localization
- ✗ Cualquier Tier 1 abre pricing public LATAM (diferenciado por país)
- ✗ Cualquier Tier 1 anuncia partnership con universidad LATAM Tier 1 (Tec MX, Andes CO, EAFIT CO, UTDT AR, IPADE MX)
- ✗ Whatfix/Section/Workera abren GM o VP LATAM hire
- ✗ Nuevo entrant AI-native cierra Series A >$10M con thesis "AI proficiency assessment" en español

Si NINGUNO de los 5 triggers se dispara en Q3 → mantener cadencia trimestral. Si 2+ se disparan → switch a cadencia mensual + acelerar wedge defense.

## Estado de las cifras citadas

| Cifra | Fuente | Verificada |
|---|---|---|
| Whatfix Series E $125M sep 2024 | The Information sep 2024 + Whatfix press | ✓ |
| Whatfix Series F rumored $1.5B mayo 2026 | The Information mayo 2026 | ✓ (cita pública) |
| Section AI $750/seat | sectionai.com pricing page Q1 2026 | ✓ |
| Section AI Q1 2026 LATAM mentions | Section AI blog posts Q1 2026 | ✓ (citas públicas) |
| Attensi $32.3M total funding | attensi.com press + Pitchbook | ✓ |
| Mursion F100 clients US-only | mursion.com case studies | ✓ (públicos) |
| Talespin pivot AI-only Q1 2026 | talespin.com blog | parcial |
| Hyperskill AI seed Q2 2026 | TechCrunch Q2 2026 | parcial |

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D9
    decision: "Mantener cadencia trimestral competitive pulse Q3 2026-08-19; agregar tracking pasivo entre mayo y agosto solo si Tier 1 mueve (no proactive scan)"
    rationale: "Mayo snapshot muestra ningún Tier 1 disparó red flag. Las 2 early signals (Section AI LATAM mentions, Whatfix Series F rumor) requieren atención pasiva no reactive. Q3 review oficial agosto cubre. Cadencia mensual solo si ≥2 triggers explícitos se disparan."
    change_type: process
    files_to_touch:
      - docs/research/competitive_pulse_q3_followup.md
      - docs/coord/audits/competitive_pulse.md (update con Q1/Q2 retroactivo en Q3)
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D10
    decision: "Agregar Talespin y Hyperskill AI a watch list Tier 2 en Q3 review oficial"
    rationale: "Talespin pivot AI-only Q1 2026 + Hyperskill AI seed Q2 2026 son entrants nuevos no en baseline mayo. Aún no son Tier 1 (Talespin XR primary, Hyperskill seed stage) pero deben rastrearse cuatrimestralmente."
    change_type: tracking
    files_to_touch:
      - docs/coord/audits/competitive_pulse.md
    owner: claude
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** ninguna acción. Tracking pasivo hasta agosto 2026.
2. **Mayo-julio 2026:** si CUALQUIERA de los 4 Tier 1 publica algo LATAM (blog/press/LinkedIn), Pablo o claude flag inmediato → re-correr este doc fuera de cadencia.
3. **2026-08-19 (Q3 review oficial):** ejecutar el framework Step 1-5 de arriba y actualizar `competitive_pulse.md` con findings + acciones.
4. **2026-11-19 (Q4 review):** rebaseline thesis si cambió scenario competitive.
