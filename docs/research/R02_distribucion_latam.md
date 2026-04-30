# R2 — plan de distribución LATAM

> Plan de distribución B2B Itera por **fase** (no por mes calendario), con CAC clarificado por nivel (per-account vs per-SQL) y mitigaciones a las inconsistencias de v1.
>
> **Contexto crítico:** Itera es **B2B empresa-first**. Mercado Pago ya eliminado (migration 010).

---

## 1. TL;DR — recomendación

**Plan en 3 fases gated por milestones, no por meses.** Cada fase termina cuando alcanza su criterio de salida, no cuando pasa cierto tiempo.

| Fase | Criterio de salida | Canal primario | Canal secundario | Budget mensual |
|---|---|---|---|---|
| **F1 Validación** | 5-10 design partners pagando + LTV:CAC ≥3:1 emergente | Founder-led outbound | LinkedIn organic | $0-500 |
| **F2 Reps** | $100k ARR + sales cycle <60d Business tier + churn <10% rolling | Outbound dirigido (founder + 1 SDR) | Webinars + 1 partnership pilot | $1.5-3k |
| **F3 Escalamiento** | $300k ARR + NRR >100% + 3+ partnerships activos | Partnerships institucionales | Paid ads B2B (LinkedIn + Google) | $5-15k |

**Razones operativas:**
- Founder-led outbound + LinkedIn organic es el único canal probado para SaaS B2B LATAM antes de $1M ARR.
- Paid ads B2B en LATAM funciona solo cuando hay LTV validado ≥$2k/cuenta.
- Partnerships institucionales (bootcamps, aceleradoras) es el move asimétrico cuando producto está maduro.
- YouTube/TikTok son trampas para B2B no-técnico LATAM (funcionan B2C educativo, no B2B sales).

---

## 2. Aclaración crítica — CAC ≠ CPL ≠ CPS

Mi v1 mezclaba tres métricas distintas. Aquí explícito:

| Métrica | Definición | Por qué importa |
|---|---|---|
| **CPL** (Cost per Lead) | Costo por lead entrando al funnel (cualquier formulario) | Métrica top-of-funnel; útil para optimizar canal de tráfico |
| **CPS** (Cost per SQL) | Costo por Sales Qualified Lead (lead calificado por sales) | Métrica mid-funnel; útil para evaluar calidad del canal |
| **CAC** (Customer Acquisition Cost) | Costo por cliente cerrado y pagando | Métrica bottom-funnel; única que valida unit economics |

**Relación típica B2B:** 100 leads → 30 SQLs → 5-10 customers. CAC = (gasto total) / (customers cerrados). NO es CPL × algo.

Los rangos de la tabla §3 son explícitos sobre cuál de las 3 métricas representan.

---

## 3. Canales — análisis honesto

### Founder-led outbound (F1, primario)

- **Costo mensual:** ~$150 tooling (Apollo + LinkedIn Sales Nav + Loom) + tiempo founder.
- **Volumen realista F1:** 80 outbound/semana → 15-20 conversaciones → 3-5 demos → 0.5-1 closed customer.
- **CAC efectivo:** si founder cuesta $0 marginal (cofounder), CAC ≈ $150/mes ÷ 2-4 customers = **$50-150 por customer cerrado**.
- **CPS:** ~$30-50 por SQL.
- **Cuándo:** F1 100% del tiempo, F2 50%, F3 30%.

### LinkedIn organic (F1-F3, complemento)

- **Costo:** $0-50/mes en herramientas (Buffer/Hypefury opcional).
- **Volumen realista:** 1-3 inbound leads/mes en F1-F2, 5-15/mes en F3.
- **CAC:** muy difícil de atribuir, estimado **$0-100 por customer** si conviertes ≥20% de inbound.
- **Cuándo:** siempre. Founder posts 3-5x/semana mínimo.

### LinkedIn paid (F3 only)

- **CPS estimado LATAM:** $200-500 por SQL B2B con Sponsored InMail/Conversation Ads.
- **CAC efectivo:** si SQL→close 20%, CAC = $1k-2.5k por customer.
- **Cuándo:** F3 con LTV validado ≥$5k/customer.

### Meta paid (Facebook/Instagram)

- **CPS estimado LATAM:** $80-200 por lead, pero **calidad B2B baja** (mucho B2C contamination).
- **Útil solo en retargeting** de visitas web.
- **CAC efectivo si es para acquisition B2B:** difícil de cerrar bajo $400 por contact rate de B2C noise.
- **Veredicto:** **NO usar para acquisition B2B.** Solo retargeting M9+.

### Google Ads (F2 testing, F3 si funciona)

- **CPS estimado LATAM:** $150-400 por SQL para keywords B2B en español ("capacitación AI empresas", "training inteligencia artificial").
- **Volumen realista:** muy bajo en LATAM (la búsqueda existe pero es chica).
- **CAC efectivo:** $400-1k por customer.
- **Cuándo:** activar F2 con $500-1k/mes testing; expandir si conversion rate ≥2%.

### Partnerships con bootcamps y universidades

- **Costo:** tiempo de management + ocasionales kickbacks.
- **CAC efectivo:** $20-100 por customer **si funciona**. Asimétrico — un partnership con Platzi/Coderhouse/Henry/Ironhack puede generar 50-200 cuentas.
- **Cuándo:** F2 activar 1 pilot, F3 escalar a 3-5 partners.

### Referral B2B

- **Costo:** $200 credit a quien refiere + $200 a quien firma.
- **Volumen realista:** 5-15% del revenue F3+.
- **Cuándo:** F3+ con base de cuentas felices.

### Eventos / conferencias LATAM

- **CPS:** $300-800 por SQL.
- **Costo:** $2-10k por evento + viajes.
- **CAC efectivo:** $1k-3k por customer.
- **Veredicto:** F3 patrocinar 2-3 eventos selectos como brand building.

### Podcasts en español

- **Costo:** tiempo + producción mínima.
- **Volumen realista:** 1-5 leads por aparición en podcasts ≥10k listeners.
- **Veredicto:** complemento orgánico desde F2.

### YouTube en español

- **CPS si funciona:** $30-80.
- **Realidad:** funciona para B2C educational (Platzi, Crehana lo dominan). Para B2B requiere producir 1-2 videos/semana de alta calidad → costo de producción $2-5k/mes mínimo.
- **Veredicto:** **diferir hasta tener equipo de content y volumen B2B justificable** (probable F3 final o Year 2).

### TikTok

- **Veredicto:** NO. Audiencia B2C joven. Duolingo lo usa para reforzar marca consumer, no para acquisition.

---

## 4. Tabla resumen de canales

| Canal | Métrica | Estimado LATAM | Cuándo activar |
|---|---|---|---|
| Founder-led outbound | CAC | $50-150/customer | F1 (100% tiempo) |
| LinkedIn organic | CAC | $0-100/customer | F1+ (siempre) |
| LinkedIn paid | CPS | $200-500/SQL | F3 |
| Meta paid (B2B) | CPS | $200-400/SQL (calidad baja) | NO acquisition; solo retargeting F3 |
| Google Ads B2B | CPS | $150-400/SQL | F2 testing → F3 |
| Partnerships institucionales | CAC | $20-100/customer (asimétrico) | F2 (1 pilot) → F3 (3-5) |
| Referral B2B | CAC | $0-50/customer | F3+ |
| Eventos LATAM | CPS | $300-800/SQL | F3 selectivo |
| Podcasts español | CAC | $0-100/customer | F2+ |
| YouTube B2B | CPS | $300+/SQL | F3 final / Y2 |
| TikTok | — | — | Nunca para Itera B2B |

**Importante:** datos públicos de CAC SaaS B2B LATAM son escasos. Estos rangos son síntesis de Salesforce LATAM benchmarks, HubSpot B2B LATAM data, Andrés Ospina growth analyses, y pattern observado en SaaS B2B LATAM batches Y Combinator (W23-W25). Validar con datos propios en cada fase.

---

## 5. LTV target Itera B2B

Pricing recomendado en R1 (corregido): $180-228/seat/año Business tier.

Asumiendo cuenta promedio = 15 seats:
- ACV = $180-228 × 15 = **$2,700-3,420**
- Churn anual target = <10% Business tier
- LTV ≈ ACV / churn = **$27k-34k**

**LTV:CAC ratio target ≥3:1.** CAC máximo defendible: **~$9-11k por cuenta**.

Con CACs realistas $50-1.5k/cuenta, hay margin para escalar canales una vez validados.

**Implicación:** distribución NO es el problema unit-economic. El problema es validar que el producto retiene (churn <10%) y que las cuentas crecen orgánicamente (NRR >100%).

---

## 6. Plan recomendado — gated por milestones

### F1 — Validación

**Objetivo:** 5-10 design partners pagando + LTV:CAC ≥3:1 emergente + churn observable <15%.

**Acciones:**
- Founder-led outbound 100% del tiempo de growth.
- Volumen target: 80 outbound/semana, 5 demos/semana.
- LinkedIn organic 3 posts/semana del founder.
- 0 paid ads.
- Tooling: ~$150/mes.

**Métricas a trackear:**
- Demos/semana (target ≥3)
- Demo→close rate (target ≥10%)
- ACV inicial vs target
- Tiempo a primera ejecución reportada por cuenta

**Costo total mensual:** ~$150 herramientas + tiempo founder. Sin paid.

**Salida:** ≥5 design partners cerrados + datos preliminares de churn favorables.

### F2 — Reps

**Objetivo:** $100k ARR + sales cycle <60d Business + churn rolling <10%.

**Acciones:**
- Founder-led outbound 50% del tiempo (todavía clave).
- 1 SDR LATAM remoto (Argentina/Colombia, ~$1.5-3k/mes).
- LinkedIn organic 5 posts/semana founder.
- Webinars mensuales en español (lead magnet).
- 1 pilot con bootcamp LATAM.
- Google Ads testing $500-1k/mes en keywords B2B.

**Métricas:**
- ARR mensual
- LTV:CAC efectivo
- Demo→close rate
- Sales cycle days
- Channel mix (qué % viene de cada canal)

**Costo total:** ~$3-5k/mes ops + 1 SDR = **~$5-8k/mes**.

**Salida:** $100k ARR + canales probados (cuáles funcionan, cuáles no).

### F3 — Escalamiento

**Objetivo:** $300-500k ARR + NRR >100% + 3+ partnerships activos.

**Acciones:**
- Founder-led outbound 30% del tiempo (founder = ICP coach).
- Equipo SDR ampliado a 2-3 reps.
- 3-5 partnerships institucionales activos.
- LinkedIn paid: $3-5k/mes Sponsored InMail + Conversation Ads.
- Google Ads: $1-2k/mes en keywords con SQL conversion ≥2%.
- 2-3 eventos LATAM patrocinados.
- Referral program activo.

**Costo total:** ~$15-30k/mes con team de 3-4 personas en growth.

---

## 7. Lo que NO hacer

1. **No paid ads en F1.** Producto inmaduro + tracking inmaduro = sangrar dinero.
2. **No YouTube como canal primario.** Costo producción inviable a esta escala.
3. **No TikTok.**
4. **No copiar playbook B2C consumer-led growth (Duolingo).** Itera es B2B; el playbook es Slack/Notion/Linear early days.
5. **No comprar listas email LATAM.** Calidad mala, problema legal LFPDPPP, daña dominio.
6. **No traer growth lead antes de $200k ARR.** Founder-led ES la growth function en SaaS B2B early stage.
7. **No internacionalizar a US/España/Brasil antes de validar LATAM hispano.** Decisión #4 de [`CONTEXT.md`](../CONTEXT.md), diferida.

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Founder-led outbound es lento | Es el costo de validación. Acelerar con SDR en F2. |
| Empresas LATAM resistentes a SaaS USD | Pricing publicado USD pero conversión local en checkout. Stripe maneja. |
| Procurement LATAM lento (3-6 meses) | Contratos simples 1 página, anuales. Auto-renew. |
| LinkedIn LATAM saturado de outbound spam | Diferenciación con video personalizado (Loom). 2x reply rate vs cold email. |
| No hay growth talent LATAM accesible | Argentina y Colombia tienen pool decente. Contratar remoto $1.5-3k/mes. |
| Bootcamps no quieren partnership | Empezar con regionales más pequeños. Después escalar a Platzi/Crehana. |
| ICP no encaja con pricing por costo de hora del seat <$15 | Sales califica al inicio (R1). Excluir explícitamente. |

---

## 9. Métricas norte por fase

### F1
- Design partners signed: 5-10
- ARR: $5-15k
- Time to first reported execution: <14 días

### F2
- Cuentas pagas: 30-50
- ARR: $100k
- LTV:CAC: ≥3:1 (no una sola medición; rolling 3 meses)
- Demo→close: ≥15%
- Churn anual rolling: <10%

### F3
- Cuentas pagas: 100+
- ARR: $300-500k
- NRR: >100%
- Sales cycle Business: <60d
- CAC payback: <12 meses
- Channel diversity: ≥3 canales con >10% del MRR

---

## 10. Fuentes

- [andresospina.co/el-futuro-del-growth-en-latam-lo-que-veo-venir](https://andresospina.co/el-futuro-del-growth-en-latam-lo-que-veo-venir)
- [salesforce.com/mx/blog/costo-de-adquisicion-de-clientes/](https://www.salesforce.com/mx/blog/costo-de-adquisicion-de-clientes/)
- [blog.hubspot.es/marketing/marketing-b2b](https://blog.hubspot.es/marketing/marketing-b2b)
- Pattern observado en SaaS B2B LATAM batches Y Combinator W23-W25
- HubSpot B2B LATAM benchmark reports

---

**Versión 2** — corregido tras review: CAC vs CPS clarificado, fases gated por milestones (no por meses), Meta CAC consistente, ICP filter explícito.
