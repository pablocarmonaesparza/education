---
type: audit
title: Competitive pulse — vigilancia trimestral de competidores AI-native
task_id: B9-001-D4
date: 2026-05-19
authors: [claude]
reviewers: [codex]
status: active
cadence: trimestral
next_review: 2026-08-19
---

# Competitive pulse — vigilancia trimestral

## TL;DR

Cuatro competidores tienen AI-native simulation/roleplay y están a 18-24 meses de internacionalizar a español. Si cualquiera lanza español/portugués o entra a LATAM, Itera tiene que reaccionar en <60 días. Esta página define qué monitorear, dónde y cuándo.

**Cadencia:** trimestral (Q1 = febrero, Q2 = mayo, Q3 = agosto, Q4 = noviembre). Owner: claude (CMO/CPO hat). Cada Q deja entry abajo con findings + acciones disparadas.

## Targets de vigilancia

### Tier 1 — amenaza realista 18-24 meses

| Competidor | URL homepage | Señal crítica | Por qué |
|---|---|---|---|
| **Whatfix Mirror** | whatfix.com/mirror | Language selector con español/portugués · pricing publicado · "LATAM" en case studies | Whatfix Series E $125M (sep 2024), $150M ARR target. AI Roleplay lanzado marzo 2026 — si pivotan a español pueden cubrir LATAM fast. |
| **Mursion On-Demand** | mursion.com/platform | Spanish localization · pricing público · partner LATAM · F500 en LATAM | Mursion tiene Fortune 100 ya en LATAM (T-Mobile, United, Best Western). Si su On-Demand AI agrega español, captura enterprise LATAM existente. |
| **Section AI** | sectionai.com | Spanish course catalog · teams pricing LATAM · partnerships universidades LATAM (Tec, EAFIT) | Section AI brand pull (Galloway) es masivo. Tienen $750/seat teams pricing. Si abren español, anchor competitor directo. |
| **Attensi RealTalk** | attensi.com | Spanish + Portuguese · LATAM partners frontline | Attensi $32.3M funding total (mayo 2025). RealTalk AI roleplay lanzado 2024-2025. Si frontline LATAM grande (retail Walmart MX, Falabella CL), entra cerca. |

### Tier 2 — vigilancia ligera (improbable LATAM <24 meses)

| Competidor | URL | Por qué tier 2 |
|---|---|---|
| **Wharton Interactive (post-HBP)** | interactive.wharton.upenn.edu | Marketplace cerrado abr-2025; sólo 3 sims migrando a HBP. Inercia institucional 24+ meses para revivir AI-native. |
| **Forage (post-EAB)** | theforage.com | Career discovery (pre-hire), no readiness (post-hire). Diferente funnel. Pero EAB tiene distribución a 500+ corp + 350+ universidades — si pivotan a "AI readiness simulator", amenaza estructural. |
| **BetterUp** | betterup.com | Coaching enterprise. Si agregan simulation + AI integration explícita, ICP overlap parcial con managers. |
| **Sana / Sana Learn** | sanalabs.com | Enterprise AI platform + LMS. Knowledge delivery, no diagnóstico. Si pivotan a evaluación, overlap. |

## Qué monitorear (signals)

Por cada competidor del Tier 1, checkear en cada review trimestral:

1. **Language selector en homepage / pricing page** — el indicador más claro de internacionalización. Si aparece "ES" o "PT", drop everything → respond.
2. **Pricing publicado** — si Whatfix/Mursion publican pricing público (hoy es quote-based), están en land-grab mode. Itera transparente compite mejor.
3. **Case studies LATAM** — partners con operaciones en MX/CO/AR/CL/BR mencionados explícitamente.
4. **Job listings** — buscar "Spanish-speaking", "LATAM", "Mexico City", "Bogotá", "São Paulo" en su careers page. Hiring signal precede launch por 3-6 meses.
5. **Eventos/conferencias** — sponsorships en eventos LATAM (Endeavor, Latitud, Singularity, RAID).
6. **Partnerships estratégicos** — alianzas con consultoras LATAM, universidades, gobiernos.
7. **Funding news** — rondas grandes pueden financiar expansion geo. Especialmente Whatfix (post-Series E) y Attensi (post-non-dilutive).
8. **Press releases / blog posts** — anuncios oficiales de expansion.

## Cadencia operativa

### Cada trimestre (claude)

1. WebFetch (vía Bash o /market-intel skill) las URLs de Tier 1 + Tier 2.
2. Extract los 8 signals × 4 Tier 1 competidores.
3. Comparar contra entry del trimestre previo (diff highlights).
4. Si **cualquier Tier 1** muestra signal de español/portugués → escalate a PABLO_INPUT_NEEDED.md con priority urgent + propuesta de respuesta.
5. Documentar findings + acciones en este archivo (append-only entries).

### Trigger out-of-cycle (cualquiera de los 2 agentes)

Si en Twitter/HackerNews/HN/TechCrunch aparece noticia mayor sobre Tier 1 (funding, product launch, partnership LATAM):
- Crear entry en este archivo aunque no sea quarterly tick.
- Notificar al otro agente via INBOX urgent.

## Plan de respuesta (si amenaza realiza)

Triada de acciones inmediatas si un Tier 1 lanza español:

1. **Defensa de wedge LATAM** — refinar copy "categoría AI-native simulation × criterio IA × LATAM español" en landing/sales decks.
2. **Acelerar primer Sprint pagado** — meter velocidad a contratos pendientes para tener case studies LATAM antes que el competidor.
3. **Bloquear LinkedIn ad bidding** — si tienen budget marketing LATAM, Itera bid en keywords protectivos (no superpuestos pero defensivos).
4. **Diferenciación específica** — actualizar `lib/simulador/copy/sales.ts.differentiation` con la frase específica vs ese competidor en español.
5. **Plan B comercial** — explorar partnership/M&A con consultoras LATAM grandes (Bain LATAM, McKinsey, BCG) si el competidor es enterprise-pesado.

## Entries trimestrales

### Q2 2026 (2026-05-19) — baseline

| Competidor | Lang selector | Pricing público | Case studies LATAM | Hiring LATAM | Status |
|---|---|---|---|---|---|
| Whatfix Mirror | EN only | NO (quote) | NO | NO visible | sin movimiento LATAM |
| Mursion On-Demand | EN only | NO (quote) | NO (F100 US/UK) | NO visible | sin movimiento LATAM |
| Section AI | EN only | SÍ ($62.50/mo individual; teams custom) | NO | NO visible | sin movimiento LATAM |
| Attensi RealTalk | EN/NO/DE/SE | NO (quote) | NO | NO visible | sin movimiento LATAM |

**Findings Q2 2026:**
- Cuadrante LATAM español sigue **vacante** entre Tier 1.
- Section AI publicó pricing individuos pero NO teams — sigue siendo opaco para enterprise.
- Whatfix Mirror lanzó AI Roleplay en Marzo 2026 pero feature táctico, no tesis principal.
- Mursion sin rondas 2024-2026 (posible steady-state o strategic exit en curso).

**Acciones disparadas:** ninguna. Wedge sigue defensible.

**Next review:** 2026-08-19 (Q3 2026)

## Decisiones producto (derivadas)

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B9-001-D4-S1
    decision: "Owner: claude (CMO hat). Cadencia: trimestral fija Q1=feb / Q2=may / Q3=ago / Q4=nov"
    rationale: "Sin owner único, vigilancia se diluye. Sin cadencia fija, se posterga. Owner claude + cadencia calendarizada evita drift."
    change_type: process
    files_to_touch:
      - docs/coord/audits/competitive_pulse.md
    owner: claude
    blocked_by: []

  - id: B9-001-D4-S2
    decision: "Trigger out-of-cycle = cualquier agente al ver noticia mayor (funding, launch LATAM, partnership)"
    rationale: "Trimestral es default pero noticias mayores requieren respuesta <60 días. Codex también monitorea Twitter/HN tech mientras hace ops; si ve algo, escribe entry."
    change_type: process
    files_to_touch:
      - docs/coord/audits/competitive_pulse.md
    owner: shared
    blocked_by: []
```
<!-- decisions:data:end -->
