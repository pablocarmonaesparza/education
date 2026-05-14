---
type: decision
title: cerradas T1 (PLG dentro de B2B) y T2 (pricing reframe a $29/$25/$19) — marketing-side
date: 2026-05-09
tags: [plg, pricing, posicionamiento, t1, t2, marketing, decision-cerrada]
dept: [marketing, ventas, producto, finanzas]
---

CMO cerró las dos tensiones de marketing/growth que estaban pendientes desde 2026-04-27 en `gotcha_tensiones_producto_cross_departamental.md` y `FUNNEL_MAP.md` §4. Decisiones tomadas el 2026-05-09 con base en convergencia de data (memoria + research + estudios externos Stanford/Microsoft/OECD/Deloitte/PwC/McKinsey 2025-2026).

## T1 — PLG dentro de B2B: SÍ

**Decisión:** PLG dentro de B2B. Revenue 100% empresas, adquisición vía individuo (champion). El motor del funnel es "individuo prueba gratis → activación → champion identification → outbound asistido a su empresa → contrato B2B".

**Convergencia de data:**
- `ICP_v2.md` §3 ya añade champion individual como capa nueva.
- `FUNNEL_MAP.md` §1: sin PLG el funnel cae a outbound directo a L&D/HR — más caro, más lento, sin distribución orgánica.
- `R02_distribucion_latam.md` §3: CACs PLG-via-champion target <$30 vs cold outbound $50-150.
- TikTok personal de Pablo solo opera con PLG (sin él, es brand-building del founder, no growth channel).
- `POSICIONAMIENTO.md` §1 línea de descubrimiento ("es como duolingo, pero te enseña a usar ia en tu chamba") es B2C-shaped por diseño — ya estás en PLG implícito.
- Microsoft Work Trend Index 2026: "empleados avanzan más rápido que sus orgs" — el champion individual existe orgánicamente, hay que canalizarlo.
- OECD SME Workforce 2026: 31% PyMEs LATAM ya usan AI; 57.3% no-users dicen "no aplica a mi trabajo" — el champion individual produce la evidencia que destraba esa objeción.
- Voto preliminar CGO + CPO (gotcha) ambos PLG.

**Implicación inmediata:**
- ICP_v2 §3 (champion individual) se mantiene activo, no se elimina.
- TikTok founder-led se mantiene como canal de awareness (T4 de FUNNEL_MAP queda ratificado por T1).
- Funnel 7 etapas de FUNNEL_MAP queda íntegro.
- Champion identification heurística (CHAMPION_HEURISTIC_v1) entra en build queue.

## T2 — Pricing: REFRAME a $29 Team / $25 Business / $19 Enterprise

**Decisión:** override a R01 v2 ($19/$15/$11). Nuevo pricing B2B Itera:
- Team (5-19 seats): **$29/seat/mes anual prepagado**
- Business (20-99 seats): **$25/seat/mes anual prepagado**
- Enterprise (100+ seats): **custom desde $19/seat/mes anual prepagado**

**Convergencia de data:**
- `ICP_v2.md` §1 explícitamente reposiciona Itera vs Copilot/Glean/Notion AI ($30-50/seat) NO vs Platzi/Crehana/DataCamp ($14-21/seat). Categoría es "productividad AI", no "L&D training".
- `POSICIONAMIENTO.md` §3 (demo / contrato) ya cita "$400-500 USD por persona al año" = $33-42/mes — el reframe alinea pricing al posicionamiento ya escrito.
- `decision_tesis_concentracion_plataforma.md`: "operación = MOAT, contenido = commodity". El pricing del MOAT no es el pricing del commodity.
- Stanford Economy 2026: valor está en tareas medibles → operación con cuenta LLM real es exactamente eso → justifica premium.
- McKinsey State of AI 2025: high performers tienen "AI embedded + KPIs", no más cursos. Itera con operación cae en bucket high performer enabler, no L&D commodity.
- Deloitte 2026: 66% de empresas responden con educación cuando deberían rediseñar. Vendiendo a $19 = quedas en bucket commodity. Vendiendo a $29 con pitch operación = sales del 34% que rediseña.
- R13 §5 ya advertía: "$19 está en frontera superior del budget L&D $60-120" — para escapar de esa categoría, hay que reposicionar pricing también.
- R01 v2 era pre-tesis-operación (escrita Apr 22, tesis core Apr 27). Override justified.

**Tradeoff aceptado:**
- TAM se reduce ~30% (ICP v2 §9 T2): empresas con cost-per-hour <$25 quedan fuera. ICP B2B se contrae a empresas más maduras.
- LTV mejora proporcionalmente: con churn target <8% Business, LTV con $25 vs $15 es ~67% mayor.
- Diferenciación dura vs Platzi/Crehana: ya no compite por precio, compite por categoría.

**Implicación inmediata:**
- Landing `/empresa` (a crear) debe mostrar el pricing nuevo.
- Hero principal debe alinearse a tesis operación, no "ai de 0 a 100".
- Outbound LinkedIn templates de R08 deben actualizarse con nuevo pricing y categoría.
- CFO debe actualizar modelo de unit economics con nuevos seats price + ACV target.

## T3 — Producto B2B multi-tenant timeline: NO ES MARKETING-SIDE

CPO/CTO deciden timeline. Marketing arranca F1 sin esperar:
- Design partners (5-10) cierran con contrato simple 1 página + facturación por seats individuales (Stripe self-serve B2B Team o seats pre-asignadas en cuentas individuales con email corporativo + agreement firmado por separado).
- Multi-tenant production-grade se construye en paralelo a F1, no bloquea F1.
- Cuando esté listo, migración suave de design partners a admin panel.

## Cuándo aplicar

- En todo copy nuevo de marketing/landing/outbound/decks: usar pricing $29/$25/$19 + posicionamiento operación (Copilot-tier, no Platzi-tier).
- En conversaciones con prospects: framing "productividad AI con cuenta LLM real", no "training de AI con cursos".
- Si CFO produce un pricing model alternativo basado en data nueva (ej. design partners pagando), revisar T2.
- Si después de 5 cuentas cerradas el ACV promedio es <$2,000, reabrir T2 (pricing demasiado alto).

## Por qué se cerraron hoy y no antes

Pablo dijo "no me preguntes, toma decisiones basadas en datos" (2026-05-09). Las decisiones estaban marcadas como "pendientes de Pablo" en al menos 4 docs, pero la data convergente para cerrarlas marketing-side ya existía. La fricción era pedirle firma, no falta de data.
