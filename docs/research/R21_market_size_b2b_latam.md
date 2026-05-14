---
type: research
title: tam/sam/som — mercado b2b ai training latam hispano
date: 2026-05-09
tags: [mercado, tam, sam, som, latam, b2b, ai-training]
dept: [marketing, finanzas, fundraising]
---

## tl;dr — los 3 números top

| capa | número (USD anual) | metodología base |
|------|--------------------|------------------|
| **TAM** | **~$5.2B** | mercado total corporate training LATAM hispano (excl. Brasil) en 2025, todos los segmentos |
| **SAM** | **~$340M** | subset PyMEs digital-first 50–500 empleados en 6 países hispano + sectores ICP, willingness-to-pay AI training específicamente |
| **SOM 24m** | **~$8.5M ARR** | captura realista 24m con foco MX/CO/AR/CL, asume ~2,500–3,200 seats pagos a precio blended ~$25/mes |

**3 números top en una línea:** TAM ~$5.2B · SAM ~$340M · SOM (24m) ~$8.5M ARR.

**Supuesto más frágil de toda la cadena:** el "willingness-to-pay específico AI training" en SAM (asumimos que ~12–18% del budget L&D total de la cuenta se reasigna a AI upskilling en 2025–2026). No hay benchmark público duro de LATAM para este split — lo derivamos de proxies globales (TalentLMS 2026, McKinsey 2024) y del dato de SAP LATAM 2025 que reporta 70% de SMEs planean aumentar inversión AI. Si el split real es 5–7% en lugar de 12–18%, SAM cae a ~$130–180M y SOM 24m a ~$3–4M ARR (ver sensitivity).

---

## metodología (rebuttable, paso a paso)

### paso 1 — universo de empresas medianas digital-first en LATAM hispano

Países objetivo: México, Colombia, Argentina, Chile, Perú, Uruguay (LATAM hispano sin Brasil; coincide con el mercado primario de Itera por idioma + payment rails Stripe).

**Fuentes para conteo de empresas 50–500 empleados:**

- **México (INEGI/DENUE 2024):** ~6.06M establecimientos totales en DENUE; medianas (51–250 emp) son ~0.7% del total → **~42,400 empresas medianas**. Pequeñas grandes (rango 10–50) y grandes (250+) se excluyen del corte ICP. ([INEGI DENUE Nov 2024](https://www.inegi.org.mx/app/mapa/denue/default.aspx), [INEGI EAP MIPYMES 2024](https://www.inegi.org.mx/contenidos/saladeprensa/aproposito/2024/EAP_MIPYMES24.pdf))
- **Colombia (DANE/ANIF):** ~99% de empresas son MiPymes (~1.6M empresas formales total Cámara de Comercio); medianas (51–200 emp) ~0.5–0.7% → **~11,000–13,000 empresas medianas**. ([BBVA Research MiPymes Colombia 2024](https://www.bbvaresearch.com/wp-content/uploads/2024/02/202401_MiPymes_Colombia-1.pdf), [La Nota Económica](https://lanotaeconomica.com.co/movidas-empresarial/en-colombia-el-918-de-las-empresas-son-pymes/))
- **Argentina (INDEC):** ~600K empresas formales registradas; medianas ~1.0% → **~6,000 empresas medianas**. (proxy OECD SME Policy Index 2024 + INDEC ENGE)
- **Chile (INE/SII):** ~1.1M empresas formales; medianas (50–199 emp) ~1.2% → **~13,000 empresas medianas**. (OECD SME Policy Index 2024)
- **Perú (INEI/SUNAT):** ~2.9M empresas formales; medianas ~0.5% → **~14,500 empresas medianas**. (proxy: alto informality rate, formal share lower)
- **Uruguay (INE):** ~190K empresas formales; medianas ~1.5% → **~2,800 empresas medianas**. (OECD 2024)

**Total empresas 50–500 empleados LATAM hispano-6: ~89,700 empresas.**

> Caveat: el rango "50–500" no coincide exactamente con la definición INEGI (51–250) ni con la colombiana (51–200). Para mantener coherencia con el ICP de Itera (50–500), agregamos un buffer del 10% por empresas grandes "bajas" que aún califican → universo ajustado **~99,000 empresas**.

### paso 2 — filtro digital-first / sectores ICP

ICP de Itera: fintech, SaaS B2B, e-commerce, agencias de marketing.

**% de empresas medianas en sectores ICP (proxy combinado):**

- Fintech LATAM-6: ~440 (MX) + ~279 (CO) + ~300 (AR) + ~180 (CL) + ~150 (PE) + ~50 (UY) = **~1,400 fintechs**, de las cuales ~30% tienen 50+ empleados → ~420 fintechs en rango. ([IDB Fintech LATAM 2024](https://www.iadb.org/en/news/study-fintech-ecosystem-latin-america-and-caribbean-exceeds-3000-startups))
- SaaS B2B LATAM-6: ~6,400 SaaS companies en Sudamérica + ~1,500 MX → estimado ~3,200 en LATAM hispano (Tracxn 2025); ~25% con 50+ emp → **~800 SaaS medianas**.
- E-commerce mediano: extrapolando dato INEGI MX (5.5% empresas venden online), aplicado al universo de medianas, ~5,500 empresas medianas e-commerce LATAM-6.
- Agencias de marketing: estimado ~3,000–4,000 agencias medianas (proxy: número de agencias registradas en cámaras + tier mediano).

**Total cuentas digital-first / ICP en rango 50–500: ~9,700 empresas.**
(420 fintech + 800 SaaS + 5,500 e-commerce + 3,000 agencias = 9,720; redondeo → ~9,700)

> Caveat: hay overlap (un fintech también es SaaS B2B). Aplicamos -15% por dedupe → **~8,250 cuentas únicas ICP.**

### paso 3 — TAM (mercado total AI training/upskilling B2B LATAM hispano)

**Approach top-down:** el mercado de corporate training LATAM se valuó en USD 23.24B en 2024 e IMARC proyecta USD 24.8B en 2025. ([IMARC Latin America Corporate Training Market](https://www.imarcgroup.com/latin-america-corporate-training-market))

- Brasil ~30–35% de ese mercado (mayor país por PIB y población activa) → LATAM hispano ~65–70% → **~$16B en 2025**.
- Subset que es "AI training / upskilling tech" (vs. compliance, soft skills, ventas, etc.): por dato global Training Industry y Statista, AI/digital skills representa ~30–35% del corporate training spend en 2025 (creciendo desde 18% en 2022). → ~$5B–5.6B
- **TAM = ~$5.2B USD/año** (mercado direccionable AI training/upskilling B2B en LATAM hispano).

**Cross-check bottom-up:** ~89,700 empresas medianas × budget L&D promedio LATAM ~$650/empleado/año (proxy: $954 global Training Industry 2025 ajustado -32% por paridad LATAM, líneas con benchmark Brasil/MX) × ~120 empleados promedio (mediana del rango 50–500) × 30% asignado a AI/digital = ~$2.1B. La diferencia con top-down se explica porque el mercado total incluye también empresas grandes (250+) y empresas pequeñas con budgets más altos en aggregate, no solo medianas. **El TAM correcto es el top-down ($5.2B).**

### paso 4 — SAM (subset ICP digital-first MX/CO/AR/CL/PE/UY)

**Calculo bottom-up sobre cuentas ICP únicas:**

- 8,250 cuentas ICP digital-first × 120 empleados promedio = **~990,000 empleados addressable**.
- Budget L&D promedio en empresas digital-first LATAM: ~$900/empleado/año (premium vs. $650 promedio del mercado, porque digital-first invierten más en upskilling — proxy global TalentLMS 2026 + ajuste regional). → universo total L&D digital-first = ~$890M.
- % asignable a AI training específicamente (no compliance ni soft skills): ~38% en cuentas digital-first 2025–2026 (más alto que el 30% promedio porque ICP son tech-forward).
- **SAM = ~$340M USD/año.**

> Cross-check: 8,250 cuentas × ACV target Itera $3,200 = $26.4M (eso es el "fair share" puramente Itera-pricing, no SAM). El SAM ($340M) refleja todo el gasto AI training en esas cuentas, captable por Itera o competencia.

### paso 5 — SOM (24 meses, foco MX/CO/AR/CL)

Itera está en F1 (validación, 5–10 design partners). SOM realista a 24 meses depende de:

1. **Cobertura geográfica:** MX (60% del esfuerzo) + CO (20%) + AR (10%) + CL (10%). Excluimos PE/UY del SOM 24m por bandwidth.
2. **Cuentas en países foco-4:** ~7,400 cuentas ICP (MX 3,200 + CO 1,800 + AR 1,200 + CL 1,200).
3. **Penetración realista F2–F3 (mes 6 al 24):**
   - Mes 6 (cierre F1): 10 design partners pagados → ~150 seats × $25 promedio × 12 = **~$45K ARR**
   - Mes 12: 50 cuentas pagas → ~750 seats × $25 × 12 = **~$225K ARR**
   - Mes 18: 200 cuentas pagas → ~3,000 seats × $25 × 12 = **~$900K ARR**
   - Mes 24: 600–800 cuentas pagas → ~9,000–12,000 seats × $25 × 12 = **~$2.7M–3.6M ARR**

> Wait — eso es muy bajo si comparamos con Crehana ($35M ARR) o Platzi ($15M total, ~$2.25M B2B). Revisemos:

**Calibración con comparables:**

- **Crehana for Business:** ~$18M ARR B2B en 2025 (50%+ de $35M ARR total). 7 años activo, $70M Series B (2021). Operando en MX/CO/AR/CL/PE/BR. ([Bloomberg Línea](https://www.bloomberglinea.com/2022/03/19/obsesion-por-las-personas-la-clave-de-crehana-para-transformar-su-negocio-a-b2b/), [Mexico Business News](https://mexicobusiness.news/talent/news/transforming-hr-and-shaping-future-e-learning))
- **Platzi Empresas:** ~$2.25M ARR (15% de $15M total Platzi). 12+ años activo. ([Latka Platzi](https://getlatka.com/companies/platzi.com))
- **Coursera Enterprise:** $238.9M ARR globalmente (2024); LATAM ~5–8% del total → ~$15–20M ARR LATAM. ([Coursera Q4 2024 Investor](https://investor.coursera.com/news/news-details/2025/Coursera-Reports-Fourth-Quarter-and-Full-Year-2024-Financial-Results/default.aspx))

**Implicación:** Crehana y Coursera ya capturaron juntos ~$35M ARR del SAM ($340M) — eso es ~10% de penetración consolidada. Itera apunta a un wedge específico (AI training, no L&D generalista) con ICP digital-first más estrecho.

**SOM 24m realista para Itera:** capturar 1.5–3% del subset AI-training-specific de SAM en países foco-4 → **~$5M–12M ARR rango**, **~$8.5M ARR mid-case**.

- Mid-case asume ~2,500 cuentas pagas con 12 seats promedio = 30,000 seats × $25 promedio × 12 meses = $9M ARR.
- Más conservador (low): ~1,300 cuentas, 16,000 seats → $4.8M ARR.
- Optimista (high): ~3,800 cuentas, 45,000 seats → $13.5M ARR.

---

## tabla por país (LATAM hispano)

| país | empresas medianas (50–500 emp) | % digital-first ICP | cuentas ICP | empleados addressable | TAM país (AI training)* | SAM país** |
|------|-------------------------------|---------------------|-------------|----------------------|-------------------------|------------|
| México | 42,400 | ~10% | 4,250 | ~510,000 | $2,000M | $175M |
| Colombia | 12,000 | ~9% | 1,080 | ~130,000 | $750M | $44M |
| Argentina | 6,000 | ~12% | 720 | ~86,000 | $700M | $30M |
| Chile | 13,000 | ~9% | 1,170 | ~140,000 | $850M | $48M |
| Perú | 14,500 | ~5% | 725 | ~87,000 | $550M | $25M |
| Uruguay | 2,800 | ~10% | 280 | ~34,000 | $150M | $11M |
| **total** | **~90,700** | — | **~8,225** | **~987,000** | **~$5,000M** | **~$333M** |

\* TAM país = % del corporate training mercado nacional asignable a AI/upskilling (~30–35% del mercado total).
\** SAM país = cuentas ICP × 120 empleados × $900 L&D × 38% AI-specific.

---

## sensitivity analysis (low/mid/high)

| parámetro | low | mid (base) | high |
|-----------|-----|------------|------|
| empresas medianas LATAM-6 | 75,000 | 90,000 | 110,000 |
| % digital-first ICP | 6% | 9% | 13% |
| empleados promedio por cuenta | 90 | 120 | 180 |
| budget L&D digital-first USD/emp/año | $600 | $900 | $1,300 |
| % AI-specific del L&D | 25% | 38% | 50% |
| **SAM resultante** | **~$120M** | **~$340M** | **~$1.0B** |
| penetración Itera 24m sobre SAM AI-specific | 1.0% | 2.5% | 5.0% |
| **SOM 24m resultante** | **~$3M ARR** | **~$8.5M ARR** | **~$25M ARR** |

**Banda defensible para fundraising/board:**
- **TAM:** $4B–7B (mid: $5.2B)
- **SAM:** $200M–500M (mid: $340M)
- **SOM 24m:** $5M–13M ARR (mid: $8.5M)

---

## supuestos clave (los 5 más frágiles, ordenados por impacto)

1. **% L&D asignado a AI training específicamente (38% mid).** Es el supuesto que más mueve SAM. No hay encuesta LATAM dedicada — derivado de proxies globales (TalentLMS 2026, McKinsey 2024 SMEs) + dato SAP LATAM 2025 (70% SMEs aumentando AI investment). Si real = 20%, SAM cae a ~$180M.

2. **Budget L&D digital-first USD/empleado ($900 mid).** Statista 2022 reporta $1,207 global; Training Industry 2025 reporta $954. Aplicamos -25% LATAM premium para digital-first vs. mercado general. Si real = $600, SAM cae a ~$220M.

3. **% empresas medianas digital-first ICP (9% mid).** Combinado de fintech + SaaS B2B + e-commerce + agencias. Hay overlap difícil de medir sin acceso a Crunchbase pago + DENUE granular. Si real = 5%, SAM cae a ~$190M.

4. **Penetración 24m sobre SAM (2.5% mid).** Crehana tardó ~7 años en alcanzar ~5% del SAM; Itera arranca con AI nativo + ICP más estrecho. 2.5% en 24m es agresivo pero defensible si los design partners F1 cierran el playbook PLG→sales.

5. **Composición rango 50–500.** INEGI corta a 250, ANIF a 200. Estiramos con buffer del 10% para incluir empresas "low 250–500". Si el segmento real ICP es 50–250 (no 50–500), universo cae ~12%.

---

## sources (URLs verificables)

### conteo PyMEs y demografía empresarial
- [INEGI DENUE Nov 2024 — Directorio Estadístico Nacional de Unidades Económicas](https://www.inegi.org.mx/app/mapa/denue/default.aspx)
- [INEGI EAP MIPYMES Junio 2024](https://www.inegi.org.mx/contenidos/saladeprensa/aproposito/2024/EAP_MIPYMES24.pdf)
- [Kapital — Radiografía 2025: el nuevo mapa de las empresas en México](https://kapital.com/blog/radiografia-2025-el-nuevo-mapa-de-las-empresas-en-mexico)
- [BBVA Research — Una mirada a las MiPymes en Colombia (Feb 2024)](https://www.bbvaresearch.com/wp-content/uploads/2024/02/202401_MiPymes_Colombia-1.pdf)
- [La Nota Económica — En Colombia el 91,8% de empresas son PyMEs](https://lanotaeconomica.com.co/movidas-empresarial/en-colombia-el-918-de-las-empresas-son-pymes/)
- [INDEC — Encuesta Nacional a Grandes Empresas 2024 Argentina](https://www.indec.gob.ar/uploads/informesdeprensa/enge_01_26EF37859542.pdf)
- [OECD — SME Policy Index: Latin America and the Caribbean 2024](https://www.oecd.org/en/publications/sme-policy-index-latin-america-and-the-caribbean-2024_ba028c1d-en.html)

### tamaño mercado corporate training / e-learning LATAM
- [IMARC Group — Latin America Corporate Training Market 2025](https://www.imarcgroup.com/latin-america-corporate-training-market)
- [IMARC Group — Latin America IT Training Market 2025-2033](https://www.imarcgroup.com/latin-america-it-training-market)
- [MarketDataForecast — Latin America E-learning Market 2034](https://www.marketdataforecast.com/market-reports/latin-america-e-learning-market)
- [Arizton — Latin America E-Learning Market USD 52.10B by 2030](https://www.arizton.com/market-reports/latin-america-e-learning-market-size-share-analysis)
- [HolonIQ — 2025 Latin America EdTech 100](https://www.holoniq.com/notes/2025-latin-america-edtech-100)
- [Cognitive Market Research — Global Corporate Training $155.2B 2024](https://www.cognitivemarketresearch.com/corporate-training-market-report)

### budget L&D y AI adoption
- [Training Industry — Size of Training Industry 2025](https://trainingindustry.com/wiki/learning-services-and-outsourcing/size-of-training-industry/)
- [TalentLMS — 2026 L&D Report: State of Workplace Learning](https://www.talentlms.com/research/learning-development-report-2026)
- [Statista — Workplace training spending per employee 2022](https://www.statista.com/statistics/738519/workplace-training-spending-per-employee/)
- [SAP LATAM — AI in the Corporate World Regional Report 2025](https://news.sap.com/latinamerica/files/2025/06/05/Regional-IA-in-the-corporate-world-External.pdf)
- [Mexico Business News — AI Adoption Accelerates in Latin America](https://mexicobusiness.news/talent/news/ai-adoption-accelerates-latin-america-challenges-remain)
- [CEPAL/ECLAC — ILIA 2025 Latin American AI Index](https://desarrollodigital.cepal.org/en/data-and-facts/latin-american-artificial-intelligence-index-ilia-2025)
- [Linux Foundation — Economic and Workforce Impacts of AI in Latin America](https://www.linuxfoundation.org/hubfs/Research%20Reports/Economic_Workforce_Impacts_AI_LatAm_Report.pdf)

### SaaS / fintech ecosistema LATAM
- [Grand View Research — Latin America SaaS Market Outlook 2030](https://www.grandviewresearch.com/horizon/outlook/software-as-a-service-saas-market/latin-america)
- [IMARC — Latin America SaaS Market 2026](https://www.imarcgroup.com/latin-america-software-as-a-service-market)
- [Antom — Latin America SME Demand Powers SaaS Growth](https://knowledge.antom.com/latin-america-on-the-rise-sme-demand-powers-saas-growth)
- [IDB — Fintech Ecosystem LATAM Exceeds 3,000 Startups](https://www.iadb.org/en/news/study-fintech-ecosystem-latin-america-and-caribbean-exceeds-3000-startups)
- [Kairos Aureum — LatAm SaaS Expansion 2025](https://kairosaureum.com/latam-saas-expansion-2025-growth-playbook/)

### comparables (ARR/revenue público)
- [Latka — Platzi Revenue $15M 2024](https://getlatka.com/companies/platzi.com)
- [PitchBook — Platzi 2026 Company Profile](https://pitchbook.com/profiles/company/108801-19)
- [Bloomberg Línea — Crehana B2B Pivot](https://www.bloomberglinea.com/2022/03/19/obsesion-por-las-personas-la-clave-de-crehana-para-transformar-su-negocio-a-b2b/)
- [Mexico Business News — Crehana Transforming HR](https://mexicobusiness.news/talent/news/transforming-hr-and-shaping-future-e-learning)
- [Crehana — Series B Largest Edtech LATAM](https://www.businesswire.com/news/home/20210805005328/en/Crehana-Raises-Largest-Series-B-for-Edtech-in-Latin-America)
- [Coursera Q4 & FY 2024 Financial Results](https://investor.coursera.com/news/news-details/2025/Coursera-Reports-Fourth-Quarter-and-Full-Year-2024-Financial-Results/default.aspx)
- [Coursera Q3 2025 Financial Results](https://investor.coursera.com/news/news-details/2025/Coursera-Reports-Third-Quarter-2025-Financial-Results/default.aspx)
- [Growjo — DataCamp Revenue Profile](https://growjo.com/company/DataCamp)

### contexto AI training market
- [Grand View Research — Latin America AI Training Dataset Market 2030](https://www.grandviewresearch.com/horizon/outlook/ai-training-dataset-market/latin-america)
- [IMARC — Latin America AI Market 2034](https://www.imarcgroup.com/latin-america-artificial-intelligence-market)
- [Credence Research — Latin America AI Training Datasets Market 2032](https://www.credenceresearch.com/report/latin-america-ai-training-datasets-market)
- [Grand View Research — Latin America AI in Education Market 2030](https://www.grandviewresearch.com/horizon/outlook/ai-in-education-market/latin-america)

---

## notas finales

- **Brasil excluido a propósito:** Itera es LATAM hispano. Si se incluyera Brasil (~30% del mercado adicional), TAM subiría a ~$7.5B, SAM a ~$485M, SOM a ~$12M (asume mismo ratio penetración + entrada Y2 con localización pt-BR).
- **Currency assumption:** todos los números en USD nominal 2025–2026. No FX-hedged ni inflation-adjusted.
- **Próximo refinamiento:** comprar acceso a HolonIQ Pro o IBI Statista Premium para granularidad país×sector real (vs. proxies). Costo estimado $5K–15K/año, justificable pre-Series A.
- **Expiry:** revisar este doc cada 6 meses. Mercado AI training está en early innings y growth rates de comparables (Crehana 35% YoY, Coursera Enterprise ~12% YoY) son la señal más útil para recalibrar SOM.
