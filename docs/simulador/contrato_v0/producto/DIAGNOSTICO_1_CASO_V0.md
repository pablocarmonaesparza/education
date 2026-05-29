---
title: "Diagnóstico 1 Caso — Contrato de Producto v0"
version: "v0.1.0-draft"
status: "draft · pendiente validación con Pablo + Codex"
authors: ["Claude (con Codex como sparring)"]
created: "2026-05-14"
supersedes: []
referenced_in:
  - "app/simulator-design/* (UI mockup)"
  - "docs/simulador/contrato_v0/casos/marketing_urgent_campaign_pii_v1.yaml"
  - "docs/simulador/contrato_v0/rubricas/RUBRICAS_V0.md"
research_basis:
  - "Stanford AI Index 2026 — economy/adopción"
  - "McKinsey State of AI 2025 — high performers ~6%"
  - "McKinsey Superagency 2025 — gap entre uso real y entrenamiento"
  - "BCG AI at Work 2025 — uso desigual + entrenamiento insuficiente"
  - "MIT NANDA GenAI Divide 2025 — ~95% pilotos sin impacto P&L"
  - "Harvard Business School Case Method"
  - "NIST AI 600-1 GenAI Profile (jul 2024)"
  - "ISO/IEC 42001:2023"
  - "AERA/APA/NCME Standards 2014"
  - "ENISA Multilayer Framework for Good Cybersecurity Practices for AI"
  - "LFPDPPP MX (reforma mar-2025) · Ley 1581/2012 CO · LGPD BR"
---

# Diagnóstico 1 Caso — Contrato de Producto v0

> Este documento es la **fuente canónica de verdad** sobre qué es el producto, qué promete, qué evalúa, cómo se vende y cómo se valida. Si el código (`app/simulator-design/*`) o el copy de landing contradicen este documento, **gana este documento**. La UI puede iterar; el contrato manda.

---

## 1. Resumen ejecutivo (1 párrafo)

El Simulador vende un **diagnóstico operativo de criterio en uso de IA** para equipos B2B mid-market. Una persona del equipo enfrenta un caso vivo (~18-20 min), trabaja con datos reales, usa un modelo bajo restricciones de gobernanza informal, revisa el output, toma una decisión bajo presión de autoridad y deja evidencia trazable. El producto emite al manager **bandas por dimensión + risk events extractivos + recomendación accionable (Pilotar / Entrenar / Pausar / Escalar) + próximo paso a 7 días**. La unidad mínima del producto **NO** es una pantalla ni un curso: es la cadena **Caso vivo → respuesta observable → evaluación → evidencia → decisión del manager**.

---

## 2. Tesis del producto (qué vendemos)

**No vendemos:**
- Educación de IA / cursos / lecciones / certificación
- Comparador de modelos / playground / sandbox
- Plataforma SaaS de learning recurrente con biblioteca de contenido
- Promesas de ROI o transformación organizacional

**Vendemos:**

> Una herramienta de management para decidir si un empleado puede usar IA en flujos reales antes de que lo haga con clientes, datos sensibles o campañas activas.

**Posicionamiento exacto (3 versiones):**

- **Corta:** "Itera mide si tu equipo puede usar IA con criterio en situaciones reales antes de hacerlo con clientes, datos sensibles o campañas activas."

- **Manager:** "En 20 minutos por persona, Itera simula un caso real de trabajo, detecta gaps de criterio y entrega evidencia para decidir quién puede pilotar IA, quién necesita entrenamiento, qué flujos deben pausarse y cuándo escalar."

- **Estratégica:** "No medimos conocimiento de IA. Medimos criterio operativo: qué datos usa, cómo pide al modelo, qué valida, qué riesgo detecta y qué decisión toma bajo presión."

**Categoría comercial:** somos **consultoría operativa con producto** (más cercano a AI Readiness Audit), no learning platform. Esto define pricing, ciclo de venta, ICP y land-and-expand.

---

## 3. Problema que resolvemos

Stanford AI Index 2026 reporta adopción organizacional de IA en **88%** y gen AI en al menos una función de negocio en **70%** de organizaciones. El problema ya no es "que adopten IA". Es: **¿están usando IA con criterio?**

Cuatro datos que justifican el espacio:

| Dato | Fuente | Implicación |
|---|---|---|
| ~95% de pilotos enterprise no muestran impacto medible en P&L; el problema es integración/workflow, no modelos | MIT NANDA GenAI Divide 2025 | El comprador necesita señal antes de invertir en transformación. Diagnóstico honesto > promesa de ROI |
| 48% de empleados pide entrenamiento formal + 45% pide integración en workflows | McKinsey Superagency 2025 | Demanda de formación existe — pero debe estar pegada al trabajo real |
| High performers de IA (~6%) tienen procesos de validación humana y rediseño de workflows | McKinsey State of AI 2025 | El valor no sale de "saber prompts". Sale del **proceso** alrededor del uso |
| Solo 36% de empleados está satisfecho con su entrenamiento de IA | BCG AI at Work 2025 | El entrenamiento existente no cierra el gap |

**Lo que el comprador NO sabe (y nosotros vendemos):**

1. Si su equipo distingue datos seguros vs sensibles.
2. Si sabe pedirle trabajo útil a un modelo sin filtrar información.
3. Si valida outputs antes de usarlos.
4. Si detecta alucinaciones, claims débiles o razonamientos genéricos.
5. Si sabe cuándo avanzar, pausar, entrenar o escalar.
6. Si el manager puede confiar en que esa persona use IA en un flujo real.

El comprador no compra educación. Compra **reducción de incertidumbre operativa**.

---

## 4. Comprador inicial

> **Head of / VP of Marketing o Growth** en **SaaS B2B LATAM**, **100-300 empleados**, con **uso informal de IA** en el equipo y **sin governance claro**.

**Por qué este perfil:**

- Siente el problema **semanalmente** (su equipo está usando IA hoy y él/ella no sabe con qué criterio)
- Tiene presión por velocidad (deadlines de campaña, deals al borde)
- Maneja datos de clientes y campañas con riesgo de PII / IP
- Tiene presupuesto de equipo ($5k-20k OPEX trimestral en herramientas)
- Puede comprar diagnóstico de $4k-8k sin convertirlo en procurement enterprise pesado
- No requiere comité de 6 meses ni firma de CHRO/CFO

**Hipótesis secundaria a validar en Fase 0:** el comprador real puede no ser Marketing/Growth sino **COO / Head of Operations / CTO** cuando el AI risk concern es transversal. Esto se decide con los 3 buyer interviews del Grupo B.

**Lo que NO es el comprador:**

- Manager / Senior Marketing Manager / Marketing Manager → es **participante**, no comprador
- CHRO / Head of L&D → ese pitch existe pero es ciclo de venta enterprise (3-9 meses procurement), no MVP path
- CEO / Founder → demasiado high-level para decisión de equipo

**Implicación para landing/copy actual:**

La home (`app/page.tsx`) actualmente apunta más a Manager. **Necesita pivot** a Head of / VP. Cambia:
- "Diagnóstico para tu equipo" → "Diagnóstico para tu organización"
- "Probar el simulador" (test individual) → "Pedir diagnóstico para mi equipo" (decisión de management)
- CTAs que respeten ciclo de venta B2B (no signup individual, sí "agendar 20 min")

---

## 5. Participante (quién hace el caso)

**Perfil para Caso 01 (marketing):**

- Marketing Manager / Growth Marketer / Content Lead / Demand Gen Lead
- 3+ años de experiencia en marketing
- Uso real de IA en trabajo (no novato, no power user — el ICP mayoritario)
- SaaS B2B LATAM mid-market (mismo que comprador)
- Reporta a Head of / VP of Marketing (el comprador)

**Restricciones del setup:**

- Setup individual (no en grupo, no acompañado)
- Sin acceso a herramientas externas durante la sesión (browser sandbox)
- Mic permission para voz opcional (mejora UX, no requerido)
- 18-25 minutos blocked en su calendario
- Identidad NO anónima — el manager necesita saber quién es

---

## 6. Caso canónico (Caso 01)

**Nombre interno:** `marketing_urgent_campaign_pii_v1`

**Situación:**

Eres Marketing Manager en **Loop**, una SaaS B2B mid-market (120 empleados) que vende plataforma de atención al cliente con IA en LATAM. Tu equipo de growth es de 6 personas. Reportas a **Camila, VP of Growth**. El gobierno de IA en tu empresa es informal: hay GPT corporativo aprobado por IT, pero los criterios viven en cada manager.

Jueves 4:30 PM. Camila te escribe por Slack pidiéndote 3 ángulos para LinkedIn Ads + 1 email a prospects para mañana 9 AM. Tienes acceso a un dataset de 60 filas con feedback de clientes (PII incluido). Camila cierra con: *«No me metas a Legal hoy, ya están cerrados. Confío en tu criterio.»*

**Tensión del caso:**

- Velocidad vs privacidad (deadline + PII en dataset)
- Validación vs presión de autoridad (output del LLM vs "confío en tu criterio")
- Decisión vs ambigüedad (sin política clara)
- Comunicación vs riesgo de relación (objetar a VP)

**Dimensiones evaluadas:** las 5 (contexto, privacidad, validación, juicio, decisión).

**Duración esperada:** 18-22 minutos.

**Documento de referencia detallado:** `docs/simulador/contrato_v0/casos/marketing_urgent_campaign_pii_v1.yaml` (debe sanitizarse antes de Fase 0 — ver sección 16).

---

## 7. Metodología del caso (secciones como método de evaluación)

> **Actualización 2026-05-27 · consolidación 6 → 5 secciones.** El formato de ensamble (`CASE_ASSEMBLY_SCHEMA.yaml`) usa **5 secciones**: Contexto · Datos · IA · Revisión · **Cierre**. Las secciones 5 (Decisión) y 6 (Respuesta) descritas abajo se fusionan en **Cierre** porque en la práctica son un solo momento de criterio encadenado (decidir una acción → comunicarla al manager), y el bloque `tradeoff_decision_memo` ya combina ambas (elección de opción + memo al manager en una sola interacción). **Las 5 dimensiones de evaluación (§8) se mantienen sin cambio** · la consolidación es de secciones de runtime, no de dimensiones. Las descripciones de "Decisión" y "Respuesta" abajo siguen siendo el rationale de qué se observa dentro de Cierre.

El runtime tiene 5 secciones que **no son navegación** sino **método de evaluación**. Cada sección existe para observar una habilidad distinta. La estructura sigue Harvard Business School Case Method adaptada a uso de IA:

### Sección 1 · Contexto

- **Función:** ver si entiende situación, rol, presión, audiencia, objetivo y restricciones.
- **Evalúa:** contexto, juicio.
- **Por qué:** Harvard case method pone al participante en la silla del decision-maker con información disponible en ese momento. **No revela la decisión correcta.** Construye tensión hacia decisión.
- **Regla del diseño:** Contexto NO es intro decorativa. Carga suficiente info para actuar, no tanta que la respuesta sea obvia.

### Sección 2 · Datos

- **Función:** observar si decide qué información puede usar / transformar / excluir antes de llevarla al modelo.
- **Evalúa:** privacidad, contexto, juicio.
- **Por qué:** NIST AI 600-1 y prácticas enterprise apuntan a que el riesgo de IA aparece **desde la selección de datos**, no solo del output.
- **Regla del diseño:** **No marcar PII como obvio antes de capturar decisión.** Si el campo trae badge "PII" en grande, ya no medimos criterio — damos coaching.

### Sección 3 · IA

- **Función:** observar cómo formula instrucción útil al modelo bajo presión y restricciones.
- **Evalúa:** contexto, privacidad, juicio.
- **Por qué:** McKinsey muestra que high performers tienen **prácticas explícitas de validación humana y rediseño de workflow**. Aquí no medimos "prompt bonito"; medimos uso responsable dentro de un flujo.
- **Regla del diseño:** Itera controla el beat de IA. **No es selector de modelos.** El modelo es instrumento.

### Sección 4 · Revisión

- **Función:** observar si detecta problemas en el output (claims inventados, generalidades, datos sensibles, segmentación débil, inferencias no sustentadas).
- **Evalúa:** validación, privacidad, juicio.
- **Por qué:** el gap central no es generar output. Es decidir qué parte es confiable, qué requiere evidencia, qué no debe usarse.
- **Regla del diseño:** **No forzar al usuario a marcar problemas en todo.** Debe poder decir "esto sí sirve", "esto no sirve", "esto necesita validación". Forzar falsos positivos mata la señal.

### Sección 5 · Decisión

- **Función:** observar qué acción toma bajo presión de negocio.
- **Evalúa:** decisión, juicio, validación.
- **Por qué:** los casos de Harvard se estructuran hacia un **decision point**. Itera hace lo mismo: el participante no solo analiza; decide.
- **Regla del diseño:** **Las opciones deben tener tradeoffs reales.** No puede haber una caricaturescamente correcta y tres malas. Las opciones distinguen matices: entregar, entregar con contexto, escalar, pausar, mandar crudo.

### Sección 6 · Respuesta

- **Función:** observar cómo comunica criterio ante autoridad real.
- **Evalúa:** decisión, juicio, privacidad.
- **Por qué:** en empresas, mucho mal uso de IA ocurre por **presión de autoridad, velocidad o ambigüedad**. Objetar con claridad y alternativa práctica es parte del criterio operativo.
- **Regla del diseño:** **No decirle al usuario cuál es el riesgo antes de responder.** Plantea la tensión y captura su criterio.

**Regla transversal del runtime:**

> No enseñar antes de medir. Corregir después de observar.

Cualquier elemento UI que revele "la respuesta correcta" antes de la captura **debe eliminarse**. Ver sección 16 (sanitización pre Fase 0).

---

## 8. Dimensiones de evaluación (las 5)

**Decisión firme:** mantener 5 dimensiones. **No agregar sexta** (incluyendo "riesgo" como dimensión).

| Dimensión | Define | Cita / fundamento |
|---|---|---|
| **Contexto** | Entiende situación, audiencia, objetivo, tono y restricciones | Harvard case method · NIST RMF GOVERN |
| **Privacidad** | Protege datos personales, confidenciales o comercialmente sensibles | NIST AI 600-1: Data Privacy · LFPDPPP MX / Ley 1581 CO / LGPD BR |
| **Validación** | Verifica output antes de usarlo. Detecta cifras inventadas, claims débiles, inferencias no sustentadas | NIST AI 600-1: Confabulation · Information Integrity |
| **Juicio** | Lee riesgo, autoridad, consecuencias, tradeoffs y necesidad de escalamiento | NIST RMF GOVERN · ISO/IEC 42001 A.10 (governance) |
| **Decisión** | Toma una acción clara, responsable y comunicable | Harvard case method (decision point) |

**Por qué riesgo NO es dimensión:**

Riesgo se modela como **evento extractivo** (sección 9), no como habilidad agregada. Un `risk_event` puede ocurrir DENTRO de cualquier dimensión. Mezclar habilidad con incidente contamina el scoring: dos personas con la misma habilidad pueden tener perfiles de riesgo distintos según el caso.

**Bandas por dimensión:** Alto / Medio / Bajo (3 niveles). **Sin score numérico público en v0.** El score puede existir internamente para calibración; la banda es la unidad narrativa.

---

## 9. Catálogo de risk events

Risk events son **observaciones extractivas** del comportamiento del participante. Cada uno debe tener evidencia textual citable del transcript (sin esa cita, no es válido).

### Eventos definidos en v0

| Slug | Definición | Severidad típica | NIST frame |
|---|---|---|---|
| `exposed_pii_to_model` | Pegó PII al prompt sin transformación | high | Data Privacy |
| `hidden_pii_usage_from_authority` | Usó datos sensibles sin comunicar a manager/legal en la respuesta final | high | GOVERN |
| `accepted_unverified_claim` | Usó output del modelo sin verificación contra fuente | medium | Information Integrity |
| `accepted_hallucinated_figures` | Usó cifras cuantitativas generadas por el modelo (no en dataset original) sin verificación | high | Confabulation |
| `used_sensitive_commercial_data` | Usó info comercial propietaria de la empresa en prompt | high | IP / Value Chain |
| `shared_third_party_confidential` | Compartió documento bajo NDA de un cliente o partner con vendor LLM | high | IP / regulatorio |
| `used_unapproved_vendor` | Pegó datos a vendor LLM no auditado/no aprobado por IT (shadow AI) | high | Info Security / Value Chain |
| `prompt_injection_unawareness` | Pegó contenido externo no confiable (email, doc, web) al prompt sin sanitizar | medium | Info Security |
| `over_relied_on_output` | Aceptó output de alto impacto sin appraisal crítico (anchoring / automation bias) | medium | Human-AI Configuration |
| `overblocked_without_discrimination` | Bloqueó todo el output sin discriminar lo cosmético de lo bloqueante (algorithmic aversion) | low | Human-AI Configuration |
| `ignored_escalation_path` | No escaló decisión cuando el proceso lo requería | medium | GOVERN |

### Atributos por evento (modelo de datos)

```yaml
risk_event:
  slug: string                    # uno del catálogo
  severity: "low" | "medium" | "high"
  step: int                       # sección del runtime donde ocurrió
  evidence_text: string           # cita literal del transcript (obligatorio)
  jurisdiction_of_data_subject:   # opcional, solo si aplica
    - "MX" | "CO" | "BR" | "other"
  transfer_basis_documented: bool # opcional, solo si involucra PII
  detected_by: "human" | "judge"  # quién lo identificó
  judge_confidence: float         # 0-1, solo si detected_by=judge
```

**Regla del judge:** el judge NUNCA puede inventar evidencia. Solo puede citar texto del transcript del participante. Cualquier risk event sin `evidence_text` citable es inválido y debe descartarse.

---

## 10. Override matrix · risk events × dimensiones → recomendación

Las dimensiones miden **habilidad**. Los risk events **modifican** la recomendación final.

### Reglas base (orden de evaluación)

1. **0 risk events high** + **todas las dimensiones Alto** → **Pilotar**
2. **0 risk events high** + **1-2 dimensiones Medio** + **0 Bajo** → **Pilotar con supervisión ligera** o **Entrenar** (según gap específico)
3. **0 risk events high** + **2+ dimensiones Bajo** → **Entrenar** o **Pausar** según severidad
4. **1+ risk events high** → aplican overrides (ver abajo)

### Overrides (caps automáticos)

| Condición | Cap de recomendación |
|---|---|
| `exposed_pii_to_model` severity=high + jurisdicción regulada (MX/CO/BR) sin transfer_basis_documented | **Pausar** (violación legal, no falla de habilidad) |
| `hidden_pii_usage_from_authority` high | **Pausar** |
| `shared_third_party_confidential` high | **Pausar + Escalar a Legal** |
| `used_unapproved_vendor` high | **Pausar** (violación de política, no entrenamiento individual resuelve) |
| Cualquier risk_event high con PII | máximo **Entrenar** (no Pilotar) |
| `accepted_hallucinated_figures` high | mínimo **Entrenar** (verificación es habilidad enseñable) |
| `over_relied_on_output` recurrente (≥3 casos en el equipo) | **Pausar workflow** del flujo afectado, no individuo |
| El fallo principal depende de política inexistente, no de habilidad individual | **Escalar** (problema sistémico) |

### 4 acciones finales del manager

| Acción | Significa |
|---|---|
| **Pilotar** | Puede operar en flujo real con supervisión ligera. Apto para uso autónomo en su scope típico. |
| **Entrenar** | Tiene criterio parcial. Necesita micro-práctica específica antes de autonomía. Mantener supervisión cercana 4-6 semanas. |
| **Pausar** | No debe usar IA en flujos sensibles todavía. Determinar nueva ronda de evaluación después de remediar gap. |
| **Escalar** | El problema no es individual. Requiere proceso, legal, compliance, IT o policy del manager — antes de re-evaluar persona. |

---

## 11. Evidencia emitida (qué produce el diagnóstico)

El output del diagnóstico se entrega al manager (y al participante en versión espejada) con estos artefactos:

1. **Bandas por dimensión** — Alto / Medio / Bajo en las 5 dimensiones, con 1-frase de justificación por dimensión.

2. **Risk events** — lista con tipo, severidad, paso, cita textual, timestamp, y atributos LATAM si aplican.

3. **Decision replay** — secuencia de decisiones observables del participante, en orden cronológico (cada slide del runtime es 1 entrada).

4. **Gaps identificados** — qué patrón falló y por qué importa (3-5 párrafos cortos, no boletín académico).

5. **Recomendación al manager** — una de las 4 acciones (Pilotar / Entrenar / Pausar / Escalar) con la regla de override que la disparó.

6. **Justificación de la recomendación** — 1-2 párrafos del por qué.

7. **Próximo paso a 7 días** — qué hacer concretamente esta semana (micro-práctica específica si Entrenar, conversación específica si Escalar, etc.).

**Lo que NO emite v0:**

- Score numérico público (existe internamente, no se muestra)
- Comparación con benchmarks de industria (no hay suficientes datos)
- Predicciones de productividad o ROI
- "Certificación" o badge para LinkedIn

---

## 12. Economía del MVP

### Pricing del producto

| Tier | Precio | Qué entrega | Comprador | Ciclo de venta |
|---|---|---|---|---|
| **Fase 0** | $0 (research no pagado) | Diagnóstico con review humano + interview de validación | 5 participantes + 3 buyers + 2 reviewers | 2-3 semanas |
| **Fase 1: Paid Diagnostic** | **$4k-8k USD por diagnóstico de 1 caso** | Diagnóstico operativo con hybrid review (judge propone, humano revisa risk events) | Head/VP Marketing/Growth o Head of Ops, equipo 50-300 emp | 2-6 semanas (mid-market sin procurement pesado) |
| **Fase 2: Sprint** | $8k-15k por cohorte inicial (5-15 personas) | Diagnóstico + Sprint de 30 días con re-simulación + reporte ejecutivo | Mismo + posible escalada a CHRO si compra org-wide | 4-8 semanas |
| **Fase 3: Programa recurrente** | $15k-30k trimestral | Casos vivos rotativos + monitoreo continuo + casos por industria | Head/VP con budget recurrente o CHRO | 6-12 semanas |

**Posicionamiento de pricing:** Itera se ubica **dentro del piso de AI Readiness Audits** ($5k-15k mid-market) — no en learning platform tier ($30-80/user/year). Esto es defensable porque entregamos evidencia ejecutiva, no contenido recurrente.

**Por qué NO $1k-3k:** investigación de comparables muestra que pricing bajo $2k es leído por el mercado como "diagnostic theater" (sales call disfrazada). $4k anchor inferior protege el posicionamiento serio.

**Por qué NO $20-80 (per-user SaaS):** ese pricing huele a herramienta individual, no a decisión de management. El comprador B2B compra programas, no logins.

### Hipótesis de conversión

```
Fase 0 (research no pagado, n=5)
       ↓ (si PASS según sección 15)
Fase 1: vender 3-5 diagnósticos pagados ($4k-8k cada uno)
       ↓ (~30% conversión esperada)
Fase 2: 1-2 clientes Fase 1 expanden a Sprint ($8k-15k)
       ↓ (~50% conversión esperada)
Fase 3: 1 cliente Fase 2 contrata programa recurrente
```

**Métrica de éxito MVP a 6 meses:** $50k-100k en revenue facturado, 80% de Fase 1.

### Honestidad comercial

**NO vendemos Fase 2 antes de poder entregarlo.** El pitch correcto en Fase 1:

> "Arrancamos con diagnóstico pagado. Si encontramos gaps que justifiquen entrenamiento, el siguiente producto es un Sprint de 30 días con re-simulación. Hoy te puedo prometer el diagnóstico; el Sprint lo activamos cuando tengamos evidencia de que tu equipo lo necesita y de que sabemos entregarlo."

Esto mantiene 3 cosas: cash flow ahora, honestidad comercial, camino natural a mayor ARPU.

---

## 13. Riesgo técnico crítico (LLM judge)

**El judge automatizado es el riesgo técnico más grande del producto a escala.** Sin judge confiable, no hay Sprint vendible a $5k-15k (la economía no cierra con review 100% humano).

### Plan A — secuenciado por fase

**Fase 0:**
- Evaluación humana primero (n=2 reviewers, rúbrica ciega).
- Judge ofline en paralelo, no entrega valor real al cliente.
- Comparación contra humanos para calibración inicial.

**Fase 1 (Paid Diagnostic):**
- **Hybrid review.** Judge automatizado propone bandas + risk events.
- Humano revisa **siempre** los risk events high y la recomendación final.
- Humano puede ajustar bandas si el judge se equivocó.
- Esto mantiene calidad mientras seguimos calibrando.

**Fase 2 (Sprint):**
- Judge para scoring base.
- Human review solo en: (a) discrepancias judge vs banda esperada, (b) clientes premium, (c) casos high-risk identificados por overrides.

### Propiedades obligatorias del judge

- **Temperature 0** (determinístico para reproducibilidad).
- **Rúbrica versionada** (cualquier cambio de rúbrica versiona el judge).
- **Evidence text obligatorio** — el judge NUNCA puede inventar evidencia. Solo cita transcript del participante.
- **Risk events extractivos separados del scoring** (computo independiente).
- **Overrides determinísticos** — los caps de la sección 10 son código, no inferencia LLM.

### Plan B — si el judge no funciona

Si después de **n ≥ 20 sesiones reales** el acuerdo judge-humano no alcanza thresholds (sección 14), Plan B:

> El producto sigue como **diagnóstico semi-manual premium**, no como Sprint masivo.

- Pricing sube ($6k-12k por diagnóstico vs $4k-8k)
- ARPU intacto, escalabilidad menor
- Hybrid review pesa más hacia humano
- Vende a 100-150 empresas/año max, no a 500+

Esto **no mata el producto.** Solo cambia la economía y el ceiling.

### Qué NO decidimos en este contrato

- Qué modelo LLM se usa (Opus vs Sonnet vs Haiku vs Gemini vs DeepSeek) — implementación
- Arquitectura específica (single-pass vs multi-agent verifier) — implementación
- Vendor LLM (Anthropic vs OpenAI vs Google) — implementación

Esas decisiones son técnicas y vienen después de validar contrato.

---

## 14. Definition of PASS (criterios pre-registrados Fase 0)

> **Importante:** estos thresholds deben **pre-registrarse antes de correr Fase 0**. Sin pre-registro, el equipo va a interpretar señal mixta a favor.

### Grupo A · Participantes (n=5)

**PASS si todos los siguientes se cumplen:**

- ≥ 4/5 completan el caso sin ayuda operativa
- Mediana de "realismo percibido" ≥ 4 en escala Likert 1-5
- ≥ 3/5 dicen "esto se parece a algo que pasó o podría pasar en mi equipo este trimestre"
- ≥ 4/5 entienden qué se les pide en cada etapa sin explicación externa
- Tiempo real ≤ 25 minutos para al menos 4/5

**FAIL (rediseñar caso) si:**

- ≤ 2/5 completan sin ayuda
- Mediana de realismo ≤ 3/5
- ≥ 3/5 lo describen como examen, quiz o entrenamiento artificial
- Más de 2 participantes no entienden qué decisión deben tomar

### Grupo B · Compradores (n=3)

**PASS si:**

- ≥ 2/3 dicen que correrían esto con su equipo
- ≥ 2/3 nombran una decisión concreta que tomarían con el reporte
- ≥ 1/3 acepta conversación de paid pilot **o** menciona presupuesto/rango sin empuje fuerte

**FAIL si:**

- 0/3 tomarían acción con el reporte
- ≥ 2/3 dicen "interesante" pero no lo usarían para decidir nada
- Perciben como training genérico, no como herramienta de management

### Grupo C · Reviewers (n=2 humanos vs judge)

> Con n=2 reviewers × n=5 cases = 10 pares de observación. **NO valida estadísticamente** el judge. Solo gates "merece más inversión".

**PASS direccional si:**

- **Cohen's κ humano-humano ≥ 0.40** Y **Gwet's AC1 ≥ 0.50** Y **CI95% bootstrap del kappa excluye 0** Y **acuerdo observado ≥ 70%**
- **Acuerdo humano-judge ≥ 70% exact-match** + **≥ 90% acuerdo dentro de ±1 categoría** (Alto/Medio/Bajo)
- **Recall de risk_events high (extractivos) ≥ 95%**
- **0 falsos negativos críticos** + ≤ 1 falso negativo no-crítico

**FAIL si:**

- κ humano-humano < 0.20 → problema es **la rúbrica**, no el judge. No ajustar judge todavía.
- Recall risk_events high < 85% → catálogo o rúbrica defectuosos.
- Cualquier FN crítico detectado.

### Lo que con n=5+3+2 NO se puede concluir

- Reliability psicométrica formal bajo AERA/APA/NCME Standards 2014 (requiere n ≥ 30-50 con CI estrecho).
- Generalización a otros buyers/users distintos a los 5 muestreados.
- Validez estadística entre niveles adyacentes Landis-Koch (CI95% típicamente cubre 2-3 categorías).

**Lo que SÍ se puede concluir:** señal direccional de "la hipótesis del assessment es no-trivial y no-azar, justifica inversión en Fase 1 con n mayor para inferencia formal" o su negación.

---

## 15. Micro-práctica post-diagnóstico

**Definición:**

> Una corrección aplicada, de **3-5 minutos**, atada a un gap detectado en el caso, usando el mismo artefacto o una variante mínima.

**NO es:** mini-curso, biblioteca de lecciones, teoría larga, contenido evergreen, certificación.

**SÍ es:** ejercicio aplicado, focused, atado al gap específico del participante.

### Ejemplos por gap

| Gap detectado | Micro-práctica |
|---|---|
| Privacidad | "Reescribe el dataset scope eliminando identificadores pero conservando señal útil." |
| Validación | "Marca qué claims del output del modelo necesitan fuente antes de enviarse." |
| Juicio | "Redacta una objeción breve a Camila sin bloquear el negocio." |
| Decisión | "Elige entre entregar, escalar o pausar y justifica en 2 frases." |
| Contexto | "Encuadra audiencia, tono y restricción de longitud para esta misma data." |

### Versionado

- **v0** (Fase 0 + Fase 1): micro-práctica = **recomendación textual** en el reporte. No interactivo.
- **v1** (Fase 2 Sprint): micro-práctica = **ejercicio interactivo** dentro del Sprint, con feedback automatizado del judge.

**Lo que NO promete v0:** sistema de tracking de progreso, biblioteca expandible, gamificación, leaderboards. Si vendemos eso en Fase 1, mentimos.

---

## 16. Sanitización del caso 1 antes de Fase 0

El caso 1 actual (en runtime mockup y en `marketing_urgent_campaign_pii_v1.yaml`) **TIENE pistas evaluativas que contaminan la respuesta.** Antes de correr Fase 0:

### Cambios obligatorios

1. **Eliminar badge "PII"** explícito en los 6 campos del dataset. El participante debe identificarlo solo.
2. **Reordenar opciones de Entrega (Decisión)** para que la "correcta" no esté determinada por posición o lenguaje. Sin frases caricaturescas tipo "output crudo del LLM" (juzga al participante por adelantado).
3. **Eliminar mención de las 5 dimensiones** durante el runtime. Solo aparece en el reporte final.
4. **Quitar las chips "privacidad / contexto / validación / juicio / decisión"** que aparecen como badges en cada step del runtime — son spoilers de lo que evaluamos.
5. **El brief de Camila** queda. Es legítimo que diga "no me metas a Legal hoy" — es la presión real. NO eliminar.

### Formato pre-Fase 0

Puede ser:
- **Opción A (más rápido):** versión sanitizada del runtime actual con cambios anteriores aplicados. Toma 1 día.
- **Opción B:** PDF + Google Form con captura libre. Toma 4 horas. Pierde fidelity pero permite iterar más rápido en el caso si Fase 0 lo requiere.

**Recomendación:** opción A si el runtime sanitizado se puede sacar en 1 día. Opción B como fallback.

---

## 17. Cómo se expande a Sprint (Fase 2)

**Después de Fase 1 validada**, Sprint = programa de 30 días post-diagnóstico:

- **Semana 1:** Diagnóstico (caso 1) + reporte ejecutivo.
- **Semanas 2-3:** Micro-prácticas personalizadas por gap del diagnóstico (3-5 prácticas, 10-15 min cada una).
- **Semana 4:** Re-simulación con caso 2 (variante del caso 1 o caso diferente) + reporte final con delta vs baseline.

**Lo que el manager recibe al final del Sprint:**

- Comparación baseline vs final (banda por dimensión, risk events, recomendación final).
- Decisión refinada (la inicial puede haber cambiado tras práctica).
- Próxima ronda recomendada (programa recurrente trimestral si hace sentido).

**NO vender Sprint hoy.** Se construye después de validar Fase 1.

---

## 18. Límites del diagnóstico (qué NO promete)

- **No mide conocimiento de IA factual** (no es quiz de prompts ni APIs).
- **No predice productividad** ni ROI cuantitativo.
- **No reemplaza evaluación de performance laboral** del manager.
- **No es certificación** ni acredita habilidades formalmente.
- **No es benchmark de industria** (no hay base estadística aún).
- **No reemplaza compliance review** legal / privacidad si los risk events high lo exigen.
- **No evalúa equipos completos en una sesión** — es diagnóstico individual; el agregado es del manager.
- **No funciona en cualquier rol.** Caso 1 es marketing/growth. Otros roles requieren casos nuevos calibrados.
- **No es Sprint completo** en Fase 1. Es solo diagnóstico.

---

## 19. Criterios para pasar a construcción real

**Construcción real (post Fase 0):** runtime productivo + judge calibrado + reporte ejecutivo automatizable + facturación + onboarding de cliente.

**Criterios:**

1. PASS en al menos 4/5 thresholds de Grupo A (Participantes).
2. PASS en al menos 2/3 thresholds de Grupo B (Compradores).
3. PASS direccional en Grupo C (Reviewers).
4. ≥ 1 comprador del Grupo B firma carta de intención de Fase 1 paid pilot (no contrato, intención).
5. Riesgo técnico del judge no se encontró deal-breaker (puede haber gap conocido pero con plan B claro).

**Si pasamos:** 4-6 semanas de construcción Fase 1 → primer paid diagnostic vendible.

**Si fallamos:** rediseño del caso o re-perfilamiento del ICP, segunda Fase 0. **No construir más producto hasta validar contrato.**

---

## 20. Próximas decisiones operativas

Estas no son parte del contrato pero son obvias después de leerlo:

1. **Sanitizar caso 1** para Fase 0 (sección 16). Owner: eng. Timeline: 1-2 días.
2. **Reclutar Fase 0** (5 participantes + 3 buyers + 2 reviewers). Owner: Pablo. Timeline: 1-2 semanas.
3. **Pivotar copy del landing** al comprador real (Head/VP, no Manager). Owner: copy + eng. Timeline: 3-5 días.
4. **Decidir tooling de Fase 0** (cómo se entrega el caso sanitizado, cómo se captura feedback de buyers, formato de reporte para reviewers). Owner: eng + Pablo. Timeline: 2-3 días.
5. **Versión del judge para Fase 0** (probablemente Opus 4.7 single-pass, evaluar contra n=2 reviewers humanos). Owner: eng. Timeline: 1 semana.

---

## Versión history

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| v0.1.0-draft | 2026-05-14 | Draft inicial · integra pricing $4k-8k (research comparables), thresholds revisados (κ + AC1 + bootstrap), 5 risk events nuevos (NIST AI 600-1 gap), atributos LATAM en risk events | Claude |

---

## Sources

**Investigación de comparables (pricing):**
- [Aries Consulting — AI Readiness Audit Cost 2026](https://ariesconsultinggroup.com/blog/ai-readiness-audit-cost/)
- [Cabin — AI Readiness Assessment Cost 2026](https://cabinco.com/ai-readiness-assessment-cost/)
- [Reforge Pricing](https://www.reforge.com/pricing)
- [Section AI Pricing](https://www.sectionai.com/pricing)
- [Sacra — BetterUp ARR](https://sacra.com/c/betterup/)

**Thresholds psicométricos:**
- [McHugh, M.L. (2012). Interrater reliability: the kappa statistic. Biochemia Medica](https://pmc.ncbi.nlm.nih.gov/articles/PMC3900052/)
- [Feinstein & Cicchetti (1990). High agreement but low kappa](https://pubmed.ncbi.nlm.nih.gov/2348207/)
- [Sim & Wright (2005). The Kappa Statistic in Reliability Studies](https://academic.oup.com/ptj/article-abstract/85/3/257/2805022)
- [Wongpakaran et al. (2013). Cohen's Kappa vs Gwet's AC1](https://pmc.ncbi.nlm.nih.gov/articles/PMC3643869/)
- [AERA/APA/NCME Standards for Educational and Psychological Testing (2014)](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)

**Risk frameworks:**
- [NIST AI 600-1 GenAI Profile (PDF, jul 2024)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [ISO/IEC 42001:2023 — AI Management Systems](https://www.iso.org/standard/42001)
- [ENISA Multilayer Framework for AI Cybersecurity](https://www.enisa.europa.eu/sites/default/files/publications/Multilayer%20Framework%20for%20Good%20Cybersecurity%20Practices%20for%20AI.pdf)
- [LFPDPPP México (reforma mar-2025) — análisis Hogan Lovells](https://www.hoganlovells.com/es/publications/mexicos-new-federal-data-protection-law-what-it-means-for-companies)
- [Ley 1581/2012 Colombia](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981)

**Producto / tesis:**
- [Stanford AI Index 2026 — Economy chapter](https://hai.stanford.edu/ai-index/2026-ai-index-report/economy)
- [McKinsey State of AI 2025](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai)
- [McKinsey Superagency 2025](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/superagency-in-the-workplace-empowering-people-to-unlock-ais-full-potential-at-work/)
- [BCG AI at Work 2025](https://www.bcg.com/publications/2025/ai-at-work-momentum-builds-but-gaps-remain)
- [MIT NANDA GenAI Divide 2025 — Fortune coverage](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/)
- [Harvard Business School Case Method](https://www.hbs.edu/case-method-project/about/Pages/case-method-teaching.aspx)
- [NRC How People Learn (transfer + metacognition)](https://www.nationalacademies.org/read/9853/chapter/6)
