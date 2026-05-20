# Report copy — `/report/[session_id]`

> Audiencia: empleado viendo su reporte + manager viendo reporte de alguien de su equipo.
> "Wow moment" #2. Reporte ejecutivo legible en 30s.
> Narrativa: **qué pasó / qué significa / qué hacer.**

## Disclaimer top (banner sutil)

(Para ambas: pending o published)

**Dot + texto inline:**

- **Si pending_review:** Dot amber + "En revisión humana · judge {model} · rúbrica {version} · este reporte tiene risk events que requieren confirmación del equipo Itera antes de publicarse al manager."
- **Si published:** Dot verde + "Reporte publicado · judge {model} · rúbrica {version}."
- **Si shared:** Dot accent + "Reporte compartido · expira el {date} · datos sensibles anonimizados."

---

## Header

**Eyebrow:** REPORTE EJECUTIVO · PARTICIPANTE

**H1 (display-tight):** Diagnóstico operativo.

**Meta line (caption muted, mono para IDs):**

`{sessionIdShort}` · {evaluatedAtDate} · {caseVersionShort}

---

## Overall pull (recomendación + readiness)

**Card primary (border-l-4 accent):**

**Eyebrow:** READINESS GENERAL

**Big value (display 64px):** {overallScore}/100

**Pill banda:** Banda {bandLabel}

**Body (text-lg):** {recommendation.reason}

(rationale corta de 2-3 líneas explicando POR QUÉ esta recomendación — debe ser narrativa humana, no bullet list)

**Ejemplos por banda:**

**Banda A:** "Decisiones consistentes con criterio claro. Validó el dataset antes de generar copy, escaló cuando detectó opt-in ambiguo, y entregó recomendación con tradeoffs explícitos. Puede operar con IA en flujos similares sin supervisión continua."

**Banda M:** "Criterio base presente pero inconsistente. Generó copy útil pero no validó opt-in del dataset antes de recomendar disparo. Necesita práctica específica en validación de PII y escalamiento a Legal/Data antes de decisiones con datos personales."

**Banda B:** "Múltiples decisiones de alto riesgo en flujo. Procesó dataset con PII sin validar opt-in, copy generado expone identificadores, no escaló a equipos relevantes. Pausar flujos con datos de clientes reales hasta remediar gaps específicos."

---

## Recomendación section

**Card variant accent-soft:**

**Eyebrow:** RECOMENDACIÓN

**H2 (display):** {recommendation.action}.
(Pilotar / Entrenar / Pausar / Escalar)

**Sub (text-base):** {recommendation.applies_to}
(ej. "para flujos de marketing con datos de clientes")

### Próximos 7 días (lista ordenada)

**Eyebrow:** PRÓXIMOS 7 DÍAS

**Lista 3-5 acciones con número + descripción:**

01. Workshop 1h: validación de datasets con PII (recurso interno + asesoría externa).
02. Lectura: Anthropic prompt engineering guide — sección "system prompts y context".
03. Práctica: 3 mini-casos de la simulator (variantes B y C) para reforzar criterio en escalamiento.

(Acciones generadas por LLM según gaps + plan estándar Itera)

---

## Desempeño por dimensión (5 cards horizontal o grid responsive)

**Eyebrow:** DESEMPEÑO POR DIMENSIÓN

**H2:** Las cinco dimensiones.

### Card por dimensión

(repetir 5x: contexto, privacidad, validación, juicio, decisión)

**Header card:**
- Pill banda (A=verde / M=amber / B=destructive) con letra
- Heading dimension name
- Score numérico {N}/100 (caption mono)

**Body (text-base):** rationale 2 líneas

**Ejemplo dimensión "Privacidad":**
- Banda M
- "Detectó campo PII en el dataset pero no escaló a Legal antes de generar copy. Asumió opt-in implícito por proceso interno, sin verificar."

---

## Eventos de riesgo (solo si > 0)

**Eyebrow:** EVENTOS DE RIESGO

**H2:** Momentos críticos en la sesión.

**Cards verticales (uno por evento):**

**Header:**
- `Paso {stepOrdinal}` (mono caption)
- Pill severity (alta=destructive / media=amber / baja=neutral)
- Tipo de risk event en human-readable: {humanRiskType}

**Body blockquote (italic, border-l):**

«{evidence_text — redacted via redactSensitiveEvidence si severity high}»

**Caption muted bajo blockquote:**
"Tipo: {risk_event_type_canonical}"

**Tipos humanizados (mapping):**

| Type canónico | Human-readable |
|---|---|
| accepted_hallucinated_figures | Aceptó cifras inventadas por la IA |
| pii_exposure | Expuso identificadores personales |
| used_unapproved_vendor | Usó vendor no aprobado |
| shared_third_party_confidential | Compartió info confidencial de terceros |
| over_relied_on_output | Confió ciegamente en el output |
| prompt_injection_unawareness | No detectó intento de injection |
| ... | ... |

---

## Fortalezas (solo si hay)

**Eyebrow:** FORTALEZAS

**H2:** Qué hizo bien.

**Lista con bullets accent:**

- Verificó el origen del dataset antes de continuar.
- Escaló cuando detectó ambigüedad en consentimiento.
- Entregó recomendación con tradeoffs explícitos, no como verdad absoluta.

---

## Transcript expandible (collapsible default false)

**Eyebrow:** TRANSCRIPT

**H2 (con icon chevron):** Ver tu sesión paso a paso

(al expandir muestra 6 sections con timestamp + input del usuario + comentario judge si aplica)

**Por step:**

**Step {N} — {stepName}**
- Timestamp: {timestamp}
- Tu respuesta:
  > {userInput}
- (si aplica) Judge observa: {judge_comment_short}

---

## Acciones bottom

**Botones primary + outline:**

- **Descargar PDF** (primary, con loading state durante generación)
- **Generar link compartible** (outline) — al hacer click:
  - Modal con link generado + caption "válido por 30 días · datos sensibles anonimizados"
  - Botón "Copiar link" con toast "Link copiado"
- **Vista del manager** (outline) → /dashboard
- **Volver al landing** (ghost) → /

### Microcopy share link

**Cuando se genera:**

**Title modal:** Link compartible

**Body:**
Este link permite a cualquier persona ver el reporte sin login.

**Detalles (caption muted):**
- Expira en 30 días
- Los datos sensibles de risk events high se muestran anonimizados
- Puedes revocar el link en cualquier momento desde admin

**Link box (mono, copy button):**
https://itera.la/shared/report/{token}

**CTAs modal:**
- Copiar link (primary)
- Revocar link (destructive ghost)

---

## Meta footer (caption mono)

`Judge {model}` · `Rúbrica {version}` · `Caso {case_version}` · `Variante {variant}` · `Eval {duration}s`

---

## Estados shell

### Loading (polling judge result)

**Layout:** SurfaceNav + centered.

**Spinner + texto:**

**H1:** Tu reporte se está generando.
**Body (large):** Esto toma 30-60 segundos. No cierres la pestaña.
**Caption muted:** Polling cada 4s · timeout 2 min.

### Pending review (risk high detectado)

**H1:** Tu reporte está en revisión humana.

**Body:** Detectamos risk events que requieren validación de nuestro equipo. Recibirás email cuando esté listo (24h max).

**Sub (caption muted):** Esto pasa cuando el judge identifica algo crítico que necesita ojo humano antes de mostrarse al manager.

### Error judge timeout

**H1:** No se pudo generar el reporte.

**Body:** El judge no respondió en tiempo. Esto a veces pasa. Reintenta en unos minutos o contacta a hola@itera.la si persiste.

**CTA:** Reintentar generación

### 404 session not found

**H1:** No encontramos esta sesión.

**Body:** Verifica el link o pide a tu manager que te lo reenvíe.

**CTA:** Volver al dashboard

---

## Disclaimer final (footer card discreto)

**Card muted (caption text-xs):**

"Este reporte es un **diagnóstico operativo de criterio en uso de IA**. No es certificación. No es assessment psicométrico. No es predicción de desempeño futuro. Sus recomendaciones aplican al contexto específico del caso evaluado y deben interpretarse junto con la operación real del equipo."

---

## Reglas anti-juicio moral

- ❌ "Aprobado" / "Reprobado" / "Pasó" / "Falló"
- ❌ "Buen empleado" / "Mal empleado"
- ❌ "Top performer" / "Underperformer"
- ❌ Emojis de juicio: ✅ ❌ 🎉 (excepto donde estado técnico)
- ✅ "Banda alta / media / baja"
- ✅ "Recomendación: pilotar / entrenar / pausar / escalar"
- ✅ "Capacidad operativa en uso de IA en flujos similares"

— claude · 2026-05-20 · report copy v1.0
