# FUNNEL MAP v1 — itera growth funnel end-to-end

> Mapa del funnel completo de itera con owner por step, tensiones abiertas y conexiones a docs existentes.
>
> **Owner del doc:** CGO. **Estado:** v1 — 2026-04-27, tras pivote a tesis "concentración + operación".
>
> **Lo que NO es:** plan de distribución (eso vive en `docs/research/R02_distribucion_latam.md`), ICP detallado (`docs/research/R13_icp_definition.md` + `docs/growth/ICP_v2.md`), ni stack técnico de analytics (`docs/research/R15_analytics_stack.md`). Es la vista unificada que conecta los tres.

---

## 1. TL;DR — el funnel itera en 1 línea

**TikTok personal de pablo / linkedin organic / partnerships → individuo prueba gratis (PLG) → activación a hábito → identificación de champion → outbound asistido a su empresa → demo → contrato b2b → expansión.**

El motor es **PLG dentro de B2B**: revenue 100% empresas, adquisición vía individuo. Cierra al final con cuenta b2b multi-seat. Sin la fase individual, el funnel se reduce a outbound directo a L&D/HR — más caro, más lento, con cero distribución orgánica.

**Decisión que aún no está cerrada (la marco abajo):** confirmar PLG dentro de B2B, o cerrar puerta a individuos completamente. Sin esto, CMO y CGO operan con tesis distinta.

---

## 2. fases del funnel — 7 etapas

| # | Etapa | Definición | Owner primario | Owner secundario |
|---|---|---|---|---|
| 1 | **Awareness** | Persona descubre que itera existe | CMO | CEO (founder presence) |
| 2 | **Consideration** | Visita landing, lee, no se va | CMO | CPO (copy producto) |
| 3 | **Signup** | Crea cuenta, individuo gratis | CPO | CTO (auth flow) |
| 4 | **Activación** | Completa primera lección + vuelve día 2 | CPO | CGO (definir señal) |
| 5 | **Champion identification** | User individual con perfil + comportamiento que sugiere puede traer empresa | **CGO** | CPO (datos de uso) |
| 6 | **Outbound a empresa** | Founder/sales contacta empresa del champion con contexto | CEO | CGO (lista, mensaje) |
| 7 | **Cierre + expansión** | Demo → pilot → contrato → más seats | CEO | CFO (pricing) |

**Loop fuera de mapa:** referral B2B, viral coefficient interno (champion 1 trae champion 2 dentro de la empresa). F3+, no antes.

---

## 3. fase por fase — qué pasa, qué medir, quién ejecuta

### fase 1 — Awareness

**Hipótesis:** itera vive en feeds de pablo (TikTok) + linkedin (founder + posts) + boca a boca de comunidad warm (AMJE/CONAJE, Anáhuac, Grupo Alfa TI).

**Canales prioritarios fase 0-3 meses (basado en R02 + budget $2.5k/mes):**

- TikTok personal pablo (orgánico) — **DEPENDE de decisión PLG, ver §6**
- LinkedIn organic founder (3-5 posts/semana)
- LinkedIn outbound founder-led (R02 §3, 80 outbound/semana → 5 demos/semana target)
- Partnerships warm via Grupo Alfa TI / AMJE
- Cero paid ads hasta validar LTV (R02 §7)

**Lo que NO va aquí (decisión cerrada):** YouTube primary, Meta paid acquisition, TikTok como B2B sales channel. Ver R02.

**Métricas:**
- Visitas únicas a landing/mes (top-of-funnel)
- Followers TikTok (si PLG confirmado)
- Engagement rate LinkedIn pablo
- Source de conversión (UTM tracking — handoff a CTO)

**Ejecuta:** CMO (contenido, copy, ads, brand). CEO solo para presence personal.

---

### fase 2 — Consideration

**Hipótesis:** la landing convierte si el visitante entiende en <10s qué hace itera y por qué le importa **a él**, no a su empresa abstracta.

**Estado actual (de memoria):** landing = Hero (shader + "ai de 0 a 100") → Pricing → FAQ. `/landingPrueba` con 6 candidatas espera eval. Ver `decision_landing_estructura_post_pivote_b2b.md`.

**Lo que el funnel necesita aquí:**
- Hero con tesis "concentración + operación", no "información"
- Path dual: (a) "soy individuo, quiero probar" → signup gratis; (b) "represento empresa, quiero demo" → calendly o form
- Social proof (cuando exista — hoy 0 testimonios)

**Métricas:**
- Bounce rate
- Scroll depth
- Click rate a CTA primario (signup) y secundario (demo)
- Conversion landing → signup
- Conversion landing → demo request

**Ejecuta:** CMO (copy + posicionamiento) + CPO (UX flow). CGO consume los datos para ver dónde leak.

---

### fase 3 — Signup

**Estado producto (de tu mensaje + memoria):** signup individual EXISTE. Signup empresa con multi-seat NO existe. CPO está armando roadmap.

**Implicación crítica:** **hoy solo podemos cerrar la mitad B2C/PLG del funnel**. La mitad B2B (multi-seat, admin panel, invite flow, billing per company) es bloqueante para fase 6-7.

**Lo que el funnel necesita en signup individual (hoy):**
- Email + password o OAuth
- Welcome email transaccional (ya existe — `gotcha_welcome_email_hook_signup_existe.md`)
- Direct path a primera lección (no fricción)

**Lo que el funnel va a necesitar en signup empresa (semana 3+):**
- Form "soy decision-maker / champion / curioso"
- Si DM: direct a demo agendada
- Si champion: signup individual + flag interno "potencial champion"
- Si curioso: signup individual

**Métricas:**
- Signups/día (actual + target)
- Signup → email verified (si aplica)
- Time-to-first-lesson (TTFL) — proxy de friction

**Ejecuta:** CPO (UX) + CTO (infra).

---

### fase 4 — Activación

**Definición operativa:** user completa **primera lección de 10 slides** + vuelve **día 2 a empezar segunda lección**. Doble check: completar y volver.

**Por qué esta definición:** una sola lección puede ser curiosity. Volver es primera señal de hábito (tesis core: "vendemos concentración + hábito"). Si no vuelve día 2, los días 7/14 son irrelevantes.

**Estado producto:** gamification P2 cerrada (visual + 2 rachas + badges sin tier rareza). Loops Hooked-style en construcción (CPO entregable a). Ver `decision_gamification_duolingo_b2b.md`.

**Lo que el funnel necesita aquí:**
- Recordatorio día 2 (transaccional, NO engagement-marketing — dec mailing transaccional-only). Discusión con CPO/CTO sobre si recordatorio "tu lección de hoy te espera" cae en transaccional o engagement.
- Streak visual desde lección 1
- Microcommit que asegure que el user salió con **algo concreto** que aplicar (1 prompt, 1 ajuste, 1 idea)

**Métricas (las más importantes del funnel):**
- **Activación D1:** % de signups que completan primera lección
- **Activación D2:** % que vuelven día 2
- **Activación D7:** % que completan ≥3 lecciones
- **Time-to-activation:** mediana de horas entre signup y primera lección completa
- **Drop-off por slide:** dónde abandonan dentro de la lección (handoff a CPO + CTO)

**Ejecuta:** CPO (mecánicas, copy, UX) + CTO (instrumentación). CGO define la métrica + monitorea.

**Tensión abierta:** recordatorios día 2 vs política "transaccional-only" del mailing. Decisión pendiente CPO + CFO.

---

### fase 5 — Champion identification

**Esta es mi cancha más pura. Aquí es donde el CGO añade valor que ningún otro agente cubre.**

**Definición:** un "champion" es un user individual cuya empresa puede pagar y donde él/ella tiene autoridad informal para empujar la decisión. No es decision-maker (ese es el approver). Es el usuario evangelizador interno.

**Señales de champion (heurística operativa):**

| Señal | Peso | Cómo se detecta |
|---|---|---|
| Email corporativo (no @gmail/@hotmail) | Alto | Domain check en signup |
| Domain matchea empresa con ≥30 empleados | Alto | LinkedIn enrichment via Clay/Apollo |
| Activación D7 alta (≥3 lecciones, racha ≥3) | Medio | PostHog event chain |
| Comparte itera (referral signup desde su link) | Muy alto | UTM + referral tracking |
| Pregunta features b2b (multi-seat, admin) en email/feedback | Muy alto | Manual review de feedback + slide_flags |
| Cargo en LinkedIn ≥mid-level (manager+, head, director) | Medio | Enrichment |
| Industria fit con R13 (fintech, saas, agencia, e-commerce) | Medio | Enrichment |

**Score compuesto:** suma ponderada → top X% de signups/mes son "champion candidates" → handoff a CEO para outbound asistido.

**Métricas:**
- # de champion candidates identificados/mes
- Tasa champion → demo agendada con su empresa
- Tasa demo → contrato cerrado para empresas sourced via champion
- Comparado con tasa de empresas sourced via outbound directo (control)

**Ejecuta:** CGO (define heurística + score) + CTO (instrumentación + enrichment automation). CEO consume la lista.

**Bloqueado hasta:** que tengamos ≥30-50 signups individuales para validar la heurística empíricamente. Hoy con 0 users la heurística es teoría.

---

### fase 6 — Outbound a empresa

**Hipótesis:** outbound asistido por champion convierte 5-10× mejor que outbound cold. Es la apuesta central de PLG-dentro-de-B2B.

**Playbook (basado en R02 §3 + R08 templates):**

**Outbound cold (control):**
- Founder-led LinkedIn a Head of L&D / Head of People de empresas R13 Tier 1
- Mensaje + Loom de 90s
- 80 outbound/semana → ~5 demos/semana
- CAC efectivo ~$50-150/customer

**Outbound asistido por champion (apuesta PLG):**
- Founder-led LinkedIn al jefe directo del champion, mencionando "vi que [champion] está usando itera para [outcome concreto]"
- Mensaje + Loom + métrica del champion ("lleva X días, completó Y lecciones")
- Volumen menor (limitado por champion identification rate) pero conversion mayor
- CAC efectivo target: <$30/customer (hipótesis a validar)

**Métricas:**
- Demos agendadas/semana (cold vs champion-assisted)
- Demo → close rate (cold vs champion-assisted)
- Sales cycle (cold vs champion-assisted)

**Ejecuta:** CEO (conversación, demo, close) + CGO (lista + mensaje + tracking de cohorte). CFO valida pricing en negociación.

**Bloqueado hasta:** producto B2B (multi-seat) listo. Sin esto, CEO puede cerrar verbal pero no facturar.

---

### fase 7 — Cierre + expansión

**Estado actual:** $19/mes Team / $15/mes Business per seat (R01). CFO está en reframe a $29-49/seat/mes basado en comps de aplicación AI. **No diseño este paso fino hasta que CFO publique pricing v2.**

**Lo que sí puedo dejar marcado:**
- Pilot estándar: 10-20 seats, 30-60 días, contrato simple 1 página
- Auto-renew anual con opt-out
- Expansión: cuando pilot cierra ≥70% activación, pitch para expandir headcount

**Métricas:**
- ACV inicial
- Time to first contract from demo
- Pilot → expansion rate
- NRR rolling 90 días

**Ejecuta:** CEO (conversación) + CFO (pricing/contracting) + CPO (delivery quality del pilot).

---

## 4. tensiones abiertas que bloquean el funnel

Estas las recopilo de las 6 conversaciones del 2026-04-27 + memoria. **Ninguna es decisión mía** — las marco para que Pablo cierre.

| # | Tensión | Bloquea | Owner de decisión | Voto preliminar CGO |
|---|---|---|---|---|
| T1 | PLG dentro de B2B vs B2B-only | Fases 1-5 (todo upper funnel) | CEO + CPO | PLG. Sin esto, TikTok de pablo se desperdicia y CAC sube ~10×. |
| T2 | Pricing final ($19/mes vs $29-49/mes) | Fases 7 + cálculos LTV/CAC | CFO + CEO | Reframe a aplicación AI ($29-49) si producto incluye fase operación; mantener $19 si solo educación. |
| T3 | Producto B2B (multi-seat) timeline | Fases 6-7 | CPO + CTO | 30 días para fase 6 mínima viable; sin esto outbound cierra verbal sin poder facturar. |
| T4 | TikTok founder-led: ¿canal o ruido? | Fase 1 | CMO + CEO | Solo válido si T1 = PLG. Si T1 = B2B-only, TikTok = brand building del founder, no growth channel. |
| T5 | Recordatorios día 2: transaccional o engagement | Fase 4 | CPO + CFO | Caso "tu lección de hoy" es transaccional disfrazado; revisar política. |

---

## 5. estado de cada fase hoy (2026-04-27)

| Fase | Existe en producto | Ejecutado | Métricas instrumentadas | Bloqueante |
|---|---|---|---|---|
| 1 Awareness | N/A | TikTok pablo en marcha; linkedin parcial | UTM no validado | Decisión T1 + T4 |
| 2 Consideration | Landing v3 prod | Sí | Bounce/scroll no instrumentado | PostHog no wired |
| 3 Signup individual | Sí | Sí | Welcome email sí, otros no | PostHog no wired |
| 3 Signup empresa | NO | No | — | T3 |
| 4 Activación | Parcial (gamification P2) | Solo individual | TTFL/D1/D2/D7 no instrumentados | PostHog no wired |
| 5 Champion ID | NO | No | — | Necesita ≥30 signups + enrichment |
| 6 Outbound asistido | N/A | No | — | T3 + Fase 5 |
| 7 Cierre + expansión | NO | No | — | T2 + T3 |

**Conclusión brutal:** **hoy no hay funnel medible end-to-end**. Hay landing + signup + lección. El resto del funnel es teoría hasta que (a) PostHog esté wired, (b) producto B2B exista, (c) las 5 tensiones estén cerradas.

---

## 6. plan de construcción del funnel — secuencia recomendada

**Semana 1 (esta semana):**
1. Pablo cierra T1 (PLG dentro de B2B sí/no) — **bloqueante**.
2. Pablo cierra T2 (pricing) — bloqueante para LTV.
3. CTO wire PostHog con eventos R15. Sin esto el funnel es ciego.
4. CGO define heurística champion v1 (este doc + un script) — listo para activar cuando haya signups.

**Semana 2-3:**
5. CPO entrega gamification fase 4 (loops de hábito) → activación medible.
6. CMO produce contenido validando si TikTok funciona como funnel a signup individual (depende T1).
7. CTO/CPO arma signup empresa + multi-seat MVP (fase 3 b2b).

**Semana 4-5:**
8. Producto b2b mínimo listo → fase 6 abierta.
9. CGO + CEO arrancan outbound cold (paralelo a champion-assisted cuando haya señal).
10. Primer pilot b2b cerrado.

**Mes 2:**
11. F1 milestone (R02): 5-10 design partners pagando + LTV:CAC ≥3:1 emergente.

---

## 7. north star metric

Propuesta CGO: **número de empresas en pipeline B2B con ≥1 champion individual activo**.

**Por qué esta:**
- Refleja la apuesta PLG-dentro-de-B2B (no es ARR, no es signups individuales — es la intersección).
- Inquestionable visualmente: una empresa con champion = oportunidad real, sin champion = lead frío.
- Drives behavior correcto: CMO atrae individuos, CPO los retiene, CGO los identifica como champions, CEO cierra la empresa.
- Pre-revenue: indicador líder más confiable que MRR (que será 0 los primeros 60 días).

**Cuándo cambiar:** cuando ≥10 empresas tengan contrato pagando, mover north star a NRR rolling 90 días.

**Métrica de control (early warning):** signups/semana con email corporativo de empresa fit-R13. Si esto cae, todo el funnel se seca aguas abajo.

---

## 8. entregables siguientes del CGO

1. **`docs/growth/ICP_v2.md`** — addendum a R13 con tesis nueva (concentración + operación) + criterios de champion. **Esta semana.**
2. **`docs/growth/METRICS_V1.md`** — los 8-10 KPIs core del funnel mapeados a eventos PostHog del R15. Handoff a CTO. **Esta semana.**
3. **`docs/growth/CHAMPION_HEURISTIC_v1.md`** — heurística operativa de identificación de champion. Bloqueada hasta confirmación T1. **Semana 2.**
4. **`docs/growth/EXPERIMENT_PORTFOLIO_q3.md`** — 5-7 experimentos priorizados con hypothesis, métrica, owner. **Semana 4 cuando producto B2B esté armando.**

---

## 9. dependencias con otros docs

| Doc | Qué aporta | Versión leída |
|---|---|---|
| [`docs/CONTEXT.md`](../CONTEXT.md) | Tesis, audiencia, modelo, decisiones abiertas | Apr 23 |
| [`docs/research/R01_pricing_b2b_latam.md`](../research/R01_pricing_b2b_latam.md) | Pricing actual + comps | Apr 22 (CFO está reframeando) |
| [`docs/research/R02_distribucion_latam.md`](../research/R02_distribucion_latam.md) | Plan de distribución por fase | v2 Apr 22 |
| [`docs/research/R08_partnerships_latam.md`](../research/R08_partnerships_latam.md) | Templates + lista de aceleradoras/bootcamps/uni | v1 Apr 22 |
| [`docs/research/R13_icp_definition.md`](../research/R13_icp_definition.md) | ICP B2B detallado | v1 Apr 22 (este doc lo extiende en `ICP_v2.md`) |
| [`docs/research/R15_analytics_stack.md`](../research/R15_analytics_stack.md) | PostHog stack + eventos | v2 Apr 22 |
| `docs/memory/decision_tesis_concentracion_plataforma.md` | Tesis core 2026-04-27 | Apr 27 |
| `docs/memory/gotcha_tensiones_producto_cross_departamental.md` | Las 3 tensiones cross-dept | Apr 27 |
| `docs/memory/decision_gamification_duolingo_b2b.md` | Mecánicas permitidas/descartadas | Apr 22 |

---

**Versión 1** — 2026-04-27. Re-evaluar tras decisiones T1+T2 + 30 días de funnel real instrumentado.
