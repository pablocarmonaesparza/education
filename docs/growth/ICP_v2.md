# ICP v2 — addendum a R13 con tesis "concentración + operación"

> Update del ICP de itera tras pivote a tesis core "vendemos concentración + operación, no información" (2026-04-27).
>
> **NO reemplaza** [`docs/research/R13_icp_definition.md`](../research/R13_icp_definition.md). Lo extiende en 4 dimensiones que R13 no tenía: (a) tesis nueva, (b) capa champion individual, (c) ajuste a fase operación, (d) amenaza Duolingo.
>
> **Owner:** CGO. **Audiencia:** CEO (sales), CMO (copy), CPO (producto), CFO (pricing).

---

## 1. TL;DR — qué cambió desde R13

**Cambio 1: pasamos de "training tradicional" a "herramienta de productividad".**
R13 ya lo señalaba (§5 budget reality), pero lo trataba como pitch. Ahora es decisión de producto. Itera no compite contra Crehana / Platzi Empresas en categoría L&D — compite contra Copilot / Glean / Notion AI en categoría productividad AI.

**Cambio 2: el ICP B2B se duplica con un ICP individual (champion).**
R13 cubre el ICP de la empresa que firma. Faltaba el ICP del individuo que evangeliza la herramienta dentro. Sin este perfil, el motor PLG se diseña a ciegas.

**Cambio 3: la fase operación cambia el qualification.**
"Cost-per-hour del seat ≥$15" sigue válido como filtro, pero hay un filtro nuevo: la empresa debe tener empleados cuyo trabajo es **producir output con LLMs** (no solo consumir información). Operación es el moat — solo aplica a empresas donde "operar AI" tiene sentido.

**Cambio 4: la amenaza no es Platzi/Coursera — es Duolingo.**
R13 dice "compara contra Coursera/Udemy" como red flag. Sigue válido, pero el verdadero competitor en 18 meses es Duolingo if pivotea a AI literacy con su músculo de hábito. Esto cambia el pitch de urgencia ("entra antes de que el espacio se cierre") y cambia el roadmap (operación es el wedge defensible).

---

## 2. ICP B2B refinado (extiende R13 §2-7)

R13 §2 sigue válido para los 3 segmentos (A: PYME tech 50-500, B: corporativo 500-3000, C: aceleradoras como canal). Lo que cambia es el **filtro de fit dentro de cada segmento**.

### Filtro nuevo: ¿la empresa tiene "AI operators" potenciales?

Antes solo preguntábamos "el seat es knowledge worker con $15+/hr". Ahora también:

> **¿Tiene esta empresa empleados cuyo output mejora 20-50% si supieran usar AI bien?**

**Sí (alto fit):**
- Marketing — copy, ads, content, research competitivo
- Sales — outbound, propuestas, calling research
- Customer Success — drafting respuestas, knowledge base
- Operations — automatización, dashboards, reportería
- Product — prototyping, user research, copy in-product
- Founders/Leadership — análisis, decision-making, presentaciones

**No (bajo fit):**
- Empleados operacionales de piso (warehouse, floor sales, manual labor)
- Trabajos altamente regulados sin output AI-mejorable (compliance officers, escribanos, médicos clínicos)
- Trabajos donde AI ya está integrado vía vendor SaaS dedicado (call centers con AI nativo, ej.)

**Por qué importa:** la fase operación de itera (conectar cuenta Claude/ChatGPT y trabajar adentro) solo crea valor si hay un workflow real que AI puede acelerar. Una empresa donde los empleados "no necesitan AI en su día" no va a renovar el contrato aunque firmen el pilot.

### Refinamiento de R13 §3 (sectores priority)

Mantener los 8 sectores de R13 con un solo cambio:

| Sector | R13 priority | v2 priority | Por qué cambia |
|---|---|---|---|
| Fintech LATAM | 1 | 1 | Sin cambio — sigue ideal |
| SaaS B2B | 2 | 2 | Sin cambio |
| E-commerce + D2C | 3 | 3 | Sin cambio |
| **Agencias de marketing** | 5 | **2** | **Sube fuerte:** caso de uso operación más obvio (todos los días producen output AI-mejorable) + ciclo de venta corto + dolor agudo |
| HR Tech | 4 | 4 | Sin cambio |
| Legaltech / Healthtech | 6 | 6 | Sin cambio (compliance complica) |
| Telecom | 7 | 7 | Sin cambio |
| Retail con tech | 8 | 8 | Sin cambio |

Razón del bump de agencias: dolor + ciclo + operación = los 3 alineados.

---

## 3. ICP individual (champion) — capa nueva

**Esto NO existía en R13.** Lo añade ICP v2 porque la apuesta PLG-dentro-de-B2B requiere un perfil del individuo, no solo de la empresa.

### Champion — definición

Un user individual cuya empresa cae en el ICP B2B (R13 §2) Y que tiene autoridad informal para empujar la decisión de compra. No es decision-maker (ese es el approver). Es el **evangelizador interno**.

### Perfil del champion ideal

| Dimensión | Valor ideal |
|---|---|
| Cargo | Manager, Lead, Head, Director (mid+ en jerarquía) |
| Función | Marketing, Sales Ops, RevOps, People Ops, Customer Success, Founder/CEO/COO |
| Antigüedad en empresa | ≥1 año (tiene capital político) |
| Tamaño de empresa | 50-500 empleados (R13 segmento A) |
| Industria | Tier 1-2 de R13 §3 |
| Comportamiento en itera | Activación D7 alta (≥5 lecciones, racha ≥5) |
| Email | Corporativo (no @gmail/@hotmail) |
| Señales explícitas | Comparte itera con colegas; pregunta features b2b en feedback; menciona empresa en perfil |

### Por qué ESTE perfil

- **Cargo mid+:** suficiente autoridad para proponer pero no tan senior que ya delega herramientas.
- **Función operacional:** sufre el dolor de "mi equipo usa AI mal" diariamente.
- **Antigüedad ≥1 año:** capital político para pushar sin que se vea como vendor pitch.
- **Activación alta en itera:** el champion no se vende, se gana — solo evangeliza si el producto funcionó para él.

### Anti-perfil del champion (NO target)

- "Chief AI Officer" recién creado (sin budget, sin autoridad real)
- Junior individual contributor (sin influence)
- C-level senior (no usa el producto él mismo)
- Empleado de 1-2 meses (no tiene capital político)
- Freelancer o contractor (no representa empresa)

---

## 4. qualification call ajustada (extiende R13 §8)

Las 10 preguntas de R13 §8 siguen válidas. Añadir 2 que validan tesis nueva:

**Pregunta 11 — operación.**
*"Cuando un empleado tuyo necesita producir [X output típico de su rol] hoy, ¿qué hace? ¿Le pasa el cerebro 30 minutos, abre ChatGPT 5 minutos, o usa una herramienta integrada?"*

- Respuesta "ChatGPT 5 minutos pero queda regular" → fit alto, dolor articulado
- Respuesta "le pasa el cerebro" → fit medio, dolor latente, hay que articularlo
- Respuesta "tiene herramienta integrada" → fit bajo, ya hay sustituto, descalifica

**Pregunta 12 — champion.**
*"Si compraras itera para 20 personas hoy, ¿quién en tu equipo sería el primero en usarlo todos los días sin que nadie le diga?"*

- Si menciona persona concreta con nombre → champion identificado, pedir intro
- Si "no estoy seguro" → red flag (no hay pull interno, va a churnear)
- Si "sería yo mismo" → caso especial (decision-maker = champion = power user, ideal)

---

## 5. señales de fit ajustadas (extiende R13 §6)

Añadir a la checklist de R13 §6:

- [ ] La empresa tiene empleados cuyo output mejora 20-50% si supieran usar AI bien (operación-fit)
- [ ] El champion identificado lleva ≥1 año en la empresa
- [ ] Champion tiene cargo mid+ (manager, lead, head)
- [ ] Cuando preguntas "¿qué herramienta usan hoy?", la respuesta no es un vendor SaaS dedicado AI

---

## 6. señales de no-fit (extiende R13 §7)

Añadir a la checklist de R13 §7:

- [ ] **El champion es chief AI officer recién creado** (sin budget propio).
- [ ] **La empresa ya invirtió en Copilot/ChatGPT Enterprise** y reportó éxito interno → en muchos casos itera es duplicado, descalificar.
- [ ] **La empresa ya invirtió en Copilot/ChatGPT Enterprise** y reportó fracaso interno → contradictorio: puede ser fit alto si el fracaso fue "no sabíamos cómo usarlo" (esto es lo que itera resuelve), o fit nulo si fue "no aplica a nuestro trabajo".
- [ ] El producto que sustituye explícitamente es Duolingo (B2C, mass-market). Itera B2B no es eso. Re-pitch.

---

## 7. cómo operacionalizar este ICP — handoffs

| Output | Owner | Consumido por |
|---|---|---|
| Lista de empresas Tier 1 (R13 §9 + filtro v2) | CGO + CEO | CEO para outbound; CMO para targeting de ads cuando F3 |
| Heurística de scoring de champion (próximo doc `CHAMPION_HEURISTIC_v1.md`) | CGO | CTO para automatizar; CEO para outbound asistido |
| Copy de landing alineada a "operación, no información" | CMO | Visitantes |
| Pricing alineado a "productividad AI" no "training" | CFO | CEO para negociación |
| Roadmap producto que prioriza fase operación | CPO | Construcción |

---

## 8. evolución esperada del ICP (extiende R13 §10)

R13 §10 traza año 1-3+. Mantener.

Añadir checkpoint:

- **Trimestre 2 (M3-M6):** validar empíricamente si "agencias de marketing" sube a Tier 1 (apuesta v2). Si las primeras 3 cuentas cerradas son agencias, confirmado.
- **Trimestre 3 (M6-M9):** validar si la fase operación está construida y vendida. Si todavía estamos en "educación pura" sin operación, re-pitch hacia Crehana/Platzi compite directo y ICP debe contraerse.

---

## 9. tensiones abiertas que afectan ICP

Heredadas de `gotcha_tensiones_producto_cross_departamental.md` y `FUNNEL_MAP.md`:

- **T1 — PLG sí/no:** sin PLG, el ICP individual (§3) no se usa y todo este addendum es teoría.
- **T2 — pricing $19 vs $29-49:** afecta budget-fit del ICP. Con $29-49/seat/mes, el filtro "cost-per-hour $15" sube a "$25-30" (porque el ROI tiene que justificar más). Reduce el TAM ~30% pero aumenta LTV.
- **T3 — producto B2B timeline:** si multi-seat tarda >60 días, el ICP B2B se queda en teoría hasta entonces; la única acción es construir lista warm.

---

## 10. cuándo re-evaluar este doc

- Tras 5 contratos B2B cerrados → validar si el perfil real matches este ICP.
- Tras decisión T1 (PLG sí/no) → si NO, eliminar §3 (champion) entero.
- Tras decisión T2 (pricing) → ajustar §5 filtros budget.
- Tras 90 días sin cierre → revisar si el ICP es real o necesitamos pivote a otro segmento.

---

**Versión 1** — 2026-04-27. Addendum a R13 v1. Reemplaza §6 + §7 de R13 si hay conflicto; en lo demás coexiste.
