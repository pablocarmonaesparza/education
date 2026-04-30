# R13 — ICP definition deep-dive

> Perfil del cliente ideal (Ideal Customer Profile) para Itera B2B LATAM. Quién sí comprar, quién no, y cómo calificarlo en <5 minutos de primera llamada.
>
> **Desbloquea:** sales qualification (Finance), ICP filter de [R01](R01_pricing_b2b_latam.md), copy target de Landing L2, outbound templates para R02 (distribución).

---

## 1. TL;DR — el ICP en una línea

**PYMEs LATAM de 50-500 empleados en sectores digital-first (fintech, e-commerce, SaaS, retail/logística con componente tech, agencias de marketing) donde el champion es Head of L&D/HR o Head of Operations, el cost-per-hour promedio del seat target es ≥$15 USD, y el dolor explícito es "mi equipo no-técnico no sabe usar AI".**

Todo lo que se aleje de este perfil es no-fit. Sales dice no en ≤15 minutos.

---

## 2. Tres segmentos B2B ordenados por prioridad

### Segmento A — PYME tech-first LATAM (core ICP)
- **Tamaño:** 50-500 empleados
- **Sectores:** fintech, SaaS B2B, e-commerce, HR tech, legaltech, healthtech early-stage
- **Payroll load típico:** knowledge workers con costo-por-hora $15-40 USD
- **Geo:** MX (DF, Monterrey, Guadalajara), CO (Bogotá, Medellín), AR (Buenos Aires), CL (Santiago), PE (Lima)
- **Decision maker:** Head of L&D, Head of People, o founder/CEO en companies <100 empleados
- **Budget L&D típico:** $300-900 MXN/empleado/año base; hasta $1,500-4,000 MXN con implementación full. En USD: **$18-240/empleado/año** dependiendo del nivel.
- **Dolor articulado:** "mi equipo usa ChatGPT mal/no lo usa/lo usa Roberto nomás". Saben que AI importa, no saben cómo institutionalizarlo.
- **Punto de contacto típico:** LinkedIn outbound a Head of L&D; warm intros por aceleradoras/VC; webinars.

### Segmento B — Corporativo mid-market LATAM (secundario)
- **Tamaño:** 500-3,000 empleados
- **Sectores:** retail tradicional con componente digital, logística, telecom, agencias de publicidad/marketing, consultoras mid-size
- **Decision maker:** Head of Digital Transformation, Head of Innovation, CHRO
- **Budget:** mayor pero ciclo de compra más largo
- **Dolor:** "estamos perdiendo contra startups más ágiles que sí usan AI"
- **Ticket promedio esperado:** 80-200 seats × Business tier ($15/seat/mes) = $14-36k ACV
- **Challenge:** ciclo de 3-6 meses, procurement, compliance

### Segmento C — Aceleradoras/bootcamps partnership (distribución, no sales directo)
- **No es ICP directo pero es canal.** Ver [R02_distribucion_latam.md](R02_distribucion_latam.md).
- Ejemplo: licencia institucional → Itera llega a founders en el programa

---

## 3. Sectores priority

Ordenados por readiness (2026):

| Sector | Razón de priority | Tamaño típico | Decision maker |
|---|---|---|---|
| Fintech LATAM | Ya usan AI (scoring, chatbots); buscan upskill empleados | 50-300 | Head of People + CTO |
| SaaS B2B | Cultura producto; founders early-adopter | 20-150 | Founder/CEO o Head of Ops |
| E-commerce + D2C | ROI directo en content + ads | 50-300 | Head of Marketing o Ops |
| HR Tech / PeopleOps | Ironía sectorial: ellos enseñan AI a otros | 20-100 | Founder |
| Agencias de marketing | Necesidad de ganar eficiencia cliente | 30-200 | Head of Operations |
| Legaltech / Healthtech early | AI productiva + compliance | 30-150 | CTO o Head of Product |
| Telecom mid-market | Programas corporativos de AI upskill | 500-3,000 | Head of Digital Transformation |
| Retail con componente tech | Integraciones con AI para ops | 200-2,000 | Head of Digital |

**Ejemplos nombrables LATAM:** BBVA (fintech grande, probable top-tier), Nubank, Rappi, Mercado Libre (probably already tienen AI training interno — target mid-market lookalikes), Cemex (sector tradicional con esfuerzos de transformación), Clip, Kavak, Habi, Cornershop, Platzi (sí, como cliente), Crehana (como cliente), Ualá, Ebanx.

Fuentes: [missyera.com/blog/capacitacion-ia-empresas-latam/](https://missyera.com/blog/capacitacion-ia-empresas-latam/), [ecosistemastartup.com/ia-y-automatizacion-en-latam-guia-2026-para-founders/](https://ecosistemastartup.com/ia-y-automatizacion-en-latam-guia-2026-para-founders/).

---

## 4. Decision maker journey

### Champion (quien trae el deal)
- **Segmento A:** Head of L&D (5-50 empleados bajo su gestión), Head of People, o founder si <100 empleados.
- **Segmento B:** Head of Digital Transformation, Head of Innovation, HRBP senior.

### Influencers (hablan con champion)
- CEO/founder (aprueba presupuesto para pilots).
- CTO (valida que AI no es snake oil).
- Finance (calcula TCO).

### Approver (firma contrato)
- Segmento A: CEO/CFO en companies <200 empleados. Champion directo en startups.
- Segmento B: CHRO + CFO, con sign-off del CEO en contratos >$50k ACV.

### Procurement
- Segmento A: mínimo. Contrato simple 1 página, Stripe checkout self-serve para Team tier.
- Segmento B: legal review + vendor onboarding + ISO/SOC2 quizás (Itera no tiene aún — riesgo, ver compliance en R16 pendiente).

### Timeline típico
- Segmento A: 2-6 semanas desde primer contacto.
- Segmento B: 2-6 meses.

---

## 5. Budget reality — qué cobrar tiene sentido

Budget L&D LATAM medio para PYMEs 50-500 empleados: **$18-240 USD/empleado/año** full-stack (platform + content + implementation). Rango medio ~$60-120/empleado/año.

Pricing Itera de [R01](R01_pricing_b2b_latam.md):
- Team $19/seat/mes = **$228/seat/año**
- Business $15/seat/mes = **$180/seat/año**

**Lectura:** Itera está en la frontera superior del budget. Para caber necesita:
- O que el cliente no perciba Itera como "training" (categoría L&D tradicional $60-120) sino como "herramienta de productividad AI" (categoría SaaS $200-500/seat/año es normal).
- O vender solo una parte del headcount (ej. 20 seats de 100 = pilot-first).

**Pitch correcto:** "no estás pagando training; estás pagando una herramienta de productividad que convierte a tu equipo en AI-operators. El ROI es 1-2 horas automatizadas por semana × $20/hora = valor mensual de $80-160/seat, muy arriba del $15-19/seat que cobramos."

**Pitch incorrecto:** "plataforma de capacitación AI con 100 lecciones". Cae en budget L&D tradicional donde Crehana ($12-29) y Platzi Empresas baten en precio.

---

## 6. Señales de fit (green flags)

Cuando ≥4 de estas señales aparecen en discovery call, es ICP probado:

- [ ] Empresa 50-500 empleados, sector digital-first
- [ ] Cost-per-hour del seat target ≥$15 USD (knowledge workers, no operacional de piso)
- [ ] Champion es Head of L&D / People / Ops, no el "chief AI officer" recién creado
- [ ] Empresa YA probó con ChatGPT/Claude ad-hoc y sabe que falta estructura
- [ ] Dolor articulado explícitamente (no tienen que descubrirlo en sesión)
- [ ] Decision maker asiste a la primera llamada (o es fácil traerlo)
- [ ] Existe budget anual L&D o productividad, aunque sea pequeño
- [ ] Geo en países con Stripe LATAM (MX, CO, AR, CL, PE, UY, BR si inglés aceptado)
- [ ] Timeline de decisión <90 días
- [ ] El pitch hace click en los primeros 10 minutos (no hay "¿y en qué se diferencia de Platzi?")

---

## 7. Señales de no-fit (red flags) — descalifica rápido

Cuando aparece alguna de estas, sales dice no y ahorra el ciclo:

- **Empresa <15 empleados** → pricing B2B no tiene sentido, vende consumer.
- **Empresa >5,000 empleados** → procurement imposible a este estado del producto; no tenemos SOC2 ni SSO robusto ni customer success team.
- **Sector no-digital (construcción, manufactura pesada, agricultura tradicional)** → cost-per-hour del seat suele estar bajo $10, ROI no cierra.
- **Empleados operacionales de piso / ventas retail** → no son el seat target; pricing no funciona.
- **Champion es "head of AI" recién creado** → típicamente sin budget propio, sin autoridad, sin dolor real. Pasa pero ciclo largo.
- **Pregunta "¿viene con certificación oficial?"** → Itera cert no existe año 1 (ver [R03](R03_cert_market_ai.md)). Si es crítico, no somos fit.
- **Compara contra Coursera/Udemy por volumen de catálogo** → no ganamos en catálogo. Re-pitch o descalifica.
- **Exige SOC2 Type II o ISO 27001** → compliance no existe año 1 (ver R16 pendiente). Descalifica hasta que lo tengamos.
- **Budget anual L&D total <$5k USD** → margen para un pilot de 10-20 seats, no para Business tier.
- **"Necesitamos el producto en portugués"** → Itera es español LATAM primero; BR cuando decidas (decisión #4 CONTEXT.md).

---

## 8. Qualification call — 10 preguntas

Primera llamada de sales, target <30 minutos:

1. **¿Cuántos empleados son hoy?** *(fit básico de tamaño)*
2. **¿A qué se dedica tu empresa y cuál es el área que más se beneficiaría de usar AI?** *(descubre si champion conoce el dolor)*
3. **¿Alguien en tu equipo usa ChatGPT, Claude o similares en su día a día?** *(readiness)*
4. **¿Qué has intentado para que el equipo lo adopte de manera consistente?** *(abre dolor)*
5. **¿Quién toma la decisión sobre herramientas para el equipo — tú, un jefe, un comité?** *(decision structure)*
6. **¿Cuánto suele invertir tu empresa en herramientas para empleados al año (plataformas, capacitación)?** *(budget signal)*
7. **¿Qué problema específico resolver con AI sería un gran ganar este trimestre?** *(concreción de outcome)*
8. **¿Cuánto gana un empleado promedio del área que se beneficiaría?** *(valida cost-per-hour ≥$15)*
9. **¿Tu empresa necesita certificaciones formales como ISO o SOC2 para probar herramientas nuevas?** *(red flag detector)*
10. **Si arrancamos un pilot de 10 seats este mes, ¿podrías autorizarlo o necesitarías traer a alguien más?** *(cierre de calificación)*

**Reglas:**
- Si responde mal a ≥3, cerrar con "te agradezco el tiempo; creo que aún no somos fit, te contacto en 6-12 meses". No pushes.
- Si responde bien a ≥6, agendar demo.
- Si responde bien a 10/10, pilot closed en la call.

---

## 9. Lista de compañías target inicial (warm list)

**Para outbound founder-led en F1 (fase de validación, 5-10 design partners), prospectar:**

### Tier 1 — más probables de convertir
- Startups SaaS LATAM 50-200 empleados (Rippling LATAM, Blackbox, Habi early, Ceck, Fintoc, Trato)
- Fintechs mid-market: Clip, Kavak, Ualá, Bitso
- HR tech: Worky, RipeMango, AlianzaHR
- E-commerce: Tiendanube (Nuvemshop), Vtex LATAM clients

### Tier 2 — viables con más trabajo
- Agencias de marketing top LATAM (SWAT, Redbility, MullenLowe LATAM)
- Consultoras mid (Accenture Argentina/Mexico, GFT)
- Corporates en transformación digital (Grupo Modelo, Grupo Bimbo tech arm, Falabella)

### Tier 3 — nice-to-have pero ciclo largo
- Bancos LATAM (BBVA, Banorte, Bancolombia, Banco de Chile)
- Telecoms (Claro, Telefónica, Entel)
- Retail grandes (Soriana, Éxito, Cencosud)

**Approach:** founder-led outbound personal vía LinkedIn con mensaje corto + Loom de 90 segundos. No cold email masivo.

---

## 10. ICP ≠ TAM — aclaración

ICP es **donde empezamos**. TAM (Total Addressable Market) es mucho más grande e incluye sectores donde eventualmente podemos vender (con más producto, más compliance, más catálogo).

**Evolución esperada del ICP 2026-2028:**
- Year 1: Segmento A (PYME tech LATAM 50-500).
- Year 2: + Segmento B (corporativo mid-market) con SOC2 y SSO agregados.
- Year 3: + Enterprise (1,000+ seats) con ISO 27001 y customer success dedicado.
- Year 3+: expansión a sectores tradicionales (manufactura, retail de piso) cuando haya tier con pricing por empleado operacional.

---

## 11. Integración con otros research

- **[R01 pricing](R01_pricing_b2b_latam.md):** ICP filter "cost-per-hour del seat ≥$15" aquí está operacionalizado.
- **[R02 distribución](R02_distribucion_latam.md):** los canales de F1-F3 apuntan a este ICP. Partnerships institucionales (F3) es canal para llegar a startups batch por batch.
- **[R17 tutor cost](R17_tutor_ai_cost_modeling.md):** tutor cost sub-2% del ACV Business hace que el feature no sea blocker de margen para este ICP.
- **R16 compliance (pendiente):** SOC2/ISO no existen. Red flag si cliente lo pide → segmento B a veces, C siempre. Prioritize build cuando deals grandes lo exijan.

---

## 12. Fuentes

- [missyera.com/blog/capacitacion-ia-empresas-latam/](https://missyera.com/blog/capacitacion-ia-empresas-latam/)
- [ecosistemastartup.com/ia-y-automatizacion-en-latam-guia-2026-para-founders/](https://ecosistemastartup.com/ia-y-automatizacion-en-latam-guia-2026-para-founders/)
- [fortunebusinessinsights.com/es/b2b-saas-market-111446](https://www.fortunebusinessinsights.com/es/b2b-saas-market-111446)
- [magokoro.mx/blog/ia-recursos-humanos-reclutamiento-capacitacion-retencion](https://www.magokoro.mx/blog/ia-recursos-humanos-reclutamiento-capacitacion-retencion)
- [canada.revistafactordeexito.com/posts/58536/el-70-de-las-empresas-en-latam-planea-invertir-en-tecnologia-de-ai-agents](https://canada.revistafactordeexito.com/posts/58536/el-70-de-las-empresas-en-latam-planea-invertir-en-tecnologia-de-ai-agents-para-aumentar-sus-ventas)
- Pattern de ICP SaaS B2B LATAM batches Y Combinator W23-W25
- HubSpot B2B LATAM buyer persona research

---

**Versión 1** — 2026-04-22. Re-evaluar en M6 tras tener 10-20 design partners reales (ICP real vs hypótesis suele cambiar en primer cohort).
