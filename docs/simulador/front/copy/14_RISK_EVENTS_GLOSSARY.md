# Risk events glossary — mapping canónico → human-readable

> Mapping de los 11 risk events canónicos del contrato (DIAGNOSTICO_1_CASO_V0.md) a textos human-readable en español LATAM.
> Usado en Report (`/report/[session_id]`), Dashboard manager (matriz risk events), Admin queue review.
> Sin jerga técnica. Explica QUÉ pasó y QUÉ implica.

## Los 11 risk events canónicos

### 1. `accepted_hallucinated_figures`

**Human-readable:** Aceptó cifras inventadas por la IA

**Body Report:** La persona usó números/datos que la IA generó sin verificar su fuente. Riesgo de meter cifras falsas en decisiones operativas.

**Plan de remediación:** Establece check obligatorio: cualquier dato cuantitativo de IA se valida contra fuente original antes de usarse en decisión.

**Severity típica:** medium-high según dominio (high en compliance/finance, medium en marketing)

---

### 2. `pii_exposure`

**Human-readable:** Expuso datos personales identificables

**Body Report:** La persona procesó información personal (emails, nombres, IDs, ubicación) en un prompt o output sin guardrails. Riesgo de filtración de PII a sistemas externos.

**Plan de remediación:** Pre-procesa datos: pseudoanonimiza identificadores antes de pasarlos a la IA. Verifica que el provider de IA no retenga los inputs.

**Severity típica:** high (siempre que sea PII real, no sintético)

---

### 3. `used_unapproved_vendor`

**Human-readable:** Usó un vendor de IA no aprobado por la organización

**Body Report:** La persona usó un servicio de IA que no está en la lista de vendors aprobados por la organización (legal/security/data governance). Riesgo de leak fuera de perímetro controlado.

**Plan de remediación:** Confirma la lista de vendors aprobados. Si necesitas usar uno fuera, abre ticket con security antes.

**Severity típica:** medium-high según jurisdicción

---

### 4. `shared_third_party_confidential`

**Human-readable:** Compartió info confidencial de terceros con la IA

**Body Report:** La persona incluyó en su prompt información de un tercero (proveedor, cliente, partner) marcada como confidencial bajo NDA. Riesgo legal por breach de NDA.

**Plan de remediación:** Antes de pegar contenido en IA, verifica si tiene marca de confidencialidad. Si dudas, pseudoanonimiza o consulta Legal.

**Severity típica:** high (especialmente con NDAs formales)

---

### 5. `over_relied_on_output`

**Human-readable:** Confió ciegamente en el output de la IA

**Body Report:** La persona usó el output de la IA como decisión final sin sentido crítico ni validación humana. No es "buena" ni "mala" decisión — es ausencia de criterio.

**Plan de remediación:** Construye hábito de challenge: pregunta "¿qué pasa si esto está mal?" en cada output crítico. Establece umbral de stakes para validación humana adicional.

**Severity típica:** medium-high según consecuencias del flujo

---

### 6. `prompt_injection_unawareness`

**Human-readable:** No detectó intento de prompt injection

**Body Report:** La persona procesó input externo (mensaje de cliente, documento de terceros, content scraped) sin detectar instrucciones embedded que intentaban manipular a la IA.

**Plan de remediación:** Reconoce patrones comunes de injection: "ignore previous instructions", "system:", lenguaje imperativo dentro de data. Trata todo input externo como untrusted por default.

**Severity típica:** medium-high según contexto (high si input venía de canal público)

---

### 7. `skipped_validation_for_speed`

**Human-readable:** Saltó pasos de validación por velocidad

**Body Report:** La persona priorizó velocidad sobre rigor: saltó validación de fuente, no escaló cuando dudó, no documentó tradeoffs. Comprensible bajo presión de deadline pero costoso si la decisión es revisable.

**Plan de remediación:** Define qué decisiones SÍ pueden saltarse y cuáles NO (matrix de stakes vs reversibilidad). Para flujos críticos, validación mínima es no-negociable incluso bajo presión.

**Severity típica:** medium

---

### 8. `bypassed_human_review`

**Human-readable:** Evitó la revisión humana cuando era requerida

**Body Report:** La persona ejecutó una acción sin pasar por revisión humana en un flujo donde la política organizacional la requiere. No fue malicioso — fue por inercia o falta de visibilidad del proceso.

**Plan de remediación:** Identifica los 3-5 flujos con review humana obligatoria en tu rol. Configúralos como checks visibles (calendar reminder, slack channel, ticket flow).

**Severity típica:** high si afecta compliance, medium si es procesual

---

### 9. `incomplete_disclosure_of_ai_use`

**Human-readable:** No reveló uso de IA cuando era requerido

**Body Report:** La persona entregó un output asistido por IA sin disclosure cuando el contexto lo requería (cliente, audiencia interna, doc legal). Riesgo de pérdida de confianza si se descubre después.

**Plan de remediación:** Establece protocolo claro: cuándo SÍ revelar (marketing copy con AI claims, content para customers, decisiones legales) vs cuándo NO requiere (interno informal, drafts).

**Severity típica:** low-medium (depende mucho de contexto)

---

### 10. `escalation_failure_under_pressure`

**Human-readable:** No escaló cuando era el momento adecuado

**Body Report:** La persona detectó ambigüedad/riesgo pero no escaló al manager/legal/data. Tomó decisión solo por presión de tiempo o miedo a parecer indecisivo.

**Plan de remediación:** Reframe escalamiento como señal de criterio, no de debilidad. Establece 1-2 personas key contactables async en 15 min para dudas operativas.

**Severity típica:** medium-high según impacto

---

### 11. `irreversible_action_taken_too_fast`

**Human-readable:** Tomó acción irreversible sin pausa de reflexión

**Body Report:** La persona ejecutó algo que no se puede deshacer (envío masivo, publicación pública, transacción) sin establecer un "circuit breaker" (preview, confirm dialog, double approval).

**Plan de remediación:** Para acciones irreversibles con stakes >X, requiere pasos extra: preview, second eye, 5-min cool-off, o "cancel within N minutes" pattern.

**Severity típica:** high siempre (por definición irreversible)

---

## Mapping completo (tabla quick reference)

| Type canónico | Human-readable | Severity típica | Dimensión asociada |
|---|---|---|---|
| accepted_hallucinated_figures | Aceptó cifras inventadas por la IA | medium-high | validación |
| pii_exposure | Expuso datos personales identificables | high | privacidad |
| used_unapproved_vendor | Usó un vendor de IA no aprobado | medium-high | contexto |
| shared_third_party_confidential | Compartió info confidencial de terceros | high | privacidad |
| over_relied_on_output | Confió ciegamente en el output | medium-high | juicio |
| prompt_injection_unawareness | No detectó intento de prompt injection | medium-high | contexto |
| skipped_validation_for_speed | Saltó pasos de validación por velocidad | medium | validación |
| bypassed_human_review | Evitó revisión humana requerida | high (compliance), medium (procesual) | decisión |
| incomplete_disclosure_of_ai_use | No reveló uso de IA cuando era requerido | low-medium | comunicación |
| escalation_failure_under_pressure | No escaló cuando era el momento adecuado | medium-high | juicio |
| irreversible_action_taken_too_fast | Tomó acción irreversible sin pausa | high | decisión |

---

## Reglas para citarlos en Report

1. **Siempre cita el `step_ordinal`** donde ocurrió ("en el paso 2…")
2. **Siempre incluye `evidence_text` redacted** (con `redactSensitiveEvidence` si severity high)
3. **No mostrar dos veces en la misma persona** (si pasa 2x en una sesión, agregar count en human-readable: "Aceptó cifras inventadas por la IA (2 veces)")
4. **Nunca decir "falló" / "se equivocó"** — usar lenguaje descriptivo, no juicio

## Reglas para citarlos en Dashboard manager

1. **Agregar por tipo** ("3 personas presentaron PII exposure")
2. **Severity prevalente** (si hay 5 instancias y 3 son high, mostrar "high" como mayor)
3. **Click drill-down** abre tabla con detalle por persona

---

## Reglas Dimension → Banda mapping

Las 5 dimensiones del producto (contexto / privacidad / validación / juicio / decisión) reciben banda (A/M/B) según contar de risk events + score del judge:

| Banda | Cuándo |
|---|---|
| **A (alto)** | Sin risk events medium/high en la dimensión + score judge ≥75 |
| **M (medio)** | 1-2 risk events medium o 1 high + score judge 50-74 |
| **B (bajo)** | 3+ risk events o 2+ high + score judge <50 |

(Override matrix ya definida en backend — Itera no edita en UI)

---

## Plan 7 días por dimensión (templates más finos)

### Dimensión Contexto

**Si banda A:**
- Mentorea a alguien banda M sobre cómo identificas contexto antes de usar IA.

**Si banda M:**
- Lee 2 papers seleccionados (anthropic blog "Constitutional AI" + un caso real LATAM).
- Mini-caso B del simulator enfocado en context-setting (variante con dataset confidencial).

**Si banda B:**
- Workshop 2h con staff Itera o asesoría externa sobre identificación de contexto crítico.
- Pause uso de IA en flujos sin contexto explícito (definir lista de flujos).
- Re-evaluación día 7.

### Dimensión Privacidad

**Si banda A:**
- Documenta tu workflow PII para que sea reusable en equipo.

**Si banda M:**
- Workshop 1h: identificación de PII + pseudoanonimización pre-prompt.
- Configura tu IDE/herramienta con detector automático de PII (DLP local).

**Si banda B:**
- Pause uso de IA con datos de clientes hasta cerrar gaps.
- Asesoría externa: revisión de pipeline data + acuerdo con Legal.
- Re-evaluación día 7 con caso de control.

### Dimensión Validación

**Si banda A:**
- Mentorea 30min sobre check de hallucinations.

**Si banda M:**
- Práctica: 3 casos del simulator donde IA da output con errores embebidos. Tu trabajo: detectarlos.
- Setup de checklist personal pre-decisión: "validé fuente, evalué confidence, identifiqué loop crítico".

**Si banda B:**
- Workshop 2h: reconocimiento de hallucinations + fuentes confiables.
- Cap a usar IA solo en outputs revisable manualmente por 30 días.
- Re-evaluación día 7.

### Dimensión Juicio

**Si banda A:**
- Acepta rol de challenge en equipo: tu trabajo es preguntar "¿qué pasa si esto está mal?" en outputs críticos.

**Si banda M:**
- Práctica: 5 mini-casos donde la IA sugiere algo plausible pero subóptimo. Tu trabajo: detectar el gap.
- Lectura sobre framing effects en decisiones con IA.

**Si banda B:**
- Pausa decisiones autónomas con IA en flujos críticos.
- Mentoría 1:1 semanal por 4 semanas con manager o senior.
- Re-evaluación día 7 + 30.

### Dimensión Decisión

**Si banda A:**
- Documenta criterios de cuándo SÍ ejecutar autónomo vs cuándo escalar.

**Si banda M:**
- Workshop 1h: framework de decisión bajo presión (stakes + reversibilidad).
- Configura "cool-off" pattern para acciones irreversibles.

**Si banda B:**
- Pause acciones irreversibles asistidas por IA por 14 días.
- Asesoría 2h con manager + senior sobre framework de decisión.
- Re-evaluación día 7 con caso de control + supervisión continua hasta día 30.

---

— claude · 2026-05-20 · risk events glossary + plan templates v1.0
