---
type: audit
title: Loop audit extension (M9.2) — post copy batch wakeup loop
date: 2026-05-19
author: claude
reviewer: codex
status: published
scope: 5 nuevos copy files producidos después del M9 audit (runtime/manager/onboarding/field-test/billing)
---

# Loop audit extension M9.2 — post copy batch

## TL;DR

Audit refresh sobre los 5 copy files versionados que claude shipeó después del M9 audit (`loop_audit_pre_v1_launch.md`) durante el wakeup loop de 270s. Verifica que mantienen las mismas barras y que no se degradaron al producirse en cadencia rápida.

**Archivos cubiertos:**
- `lib/simulador/copy/runtime.ts` (commit 3933b41 — cierra C-R-2 del M9)
- `lib/simulador/copy/manager.ts` (commit bb980e8 — unblock B5-002)
- `lib/simulador/copy/onboarding.ts` (commit 7faa356 — unblock B7-001)
- `lib/simulador/copy/field-test.ts` (commit 4321e77 — refactor surface live)
- `lib/simulador/copy/billing.ts` (commit 49da67e — /pricing público + portal)

**Verdict global: PASS** sin C-R nuevos. Loop quality bar mantenida.

## Barras verificadas

Las mismas 5 del M9 original:

1. **Norte:** simulación → diagnóstico → práctica → re-simulación → evidencia → acción del manager
2. **Regla pedagógica:** "no enseñar antes de medir" (runtime mide, beats enseñan)
3. **Vocabulario canónico estricto:** criterio · evidencia · decidir/decisión · banda · diagnóstico · caso vivo · manager · pilotar/entrenar/pausar/escalar
4. **Voz:** español neutro LATAM corporate, lowercase en titulares/bodies gramaticales, cero AI slop, datos con fuente cuando aplique
5. **No spoilers de rúbrica:** ningún UI string al participante revela qué dimensión se evalúa ni cuál es "respuesta correcta"

## Tabla de verdicts

| Archivo | Norte | "No enseñar antes" | Vocab canon | Voz | Spoilers | Decisiones cited | Verdict |
|---|---|---|---|---|---|---|---|
| `runtime.ts` | ✓ | ✓ (mide, no enseña) | ✓ | ✓ | ✓ | C-R-2 + §7 | PASS |
| `manager.ts` | ✓ | n/a (audiencia manager) | ✓ | ✓ | n/a | B5-002 + B9-002-D5 + B5-001 | PASS |
| `onboarding.ts` | ✓ | n/a (público) | ✓ | ✓ | n/a | B7-001 + B9-001-D3 + B9-003-D2 + B9-003-D5 | PASS |
| `field-test.ts` | ✓ | ✓ (mide, fairness explícito) | ✓ | ✓ | ✓ | B6-001 + B6-002 + B9-001-D1 + B5-001-D3 | PASS |
| `billing.ts` | ✓ (no certificación) | n/a (comercial) | ✓ | ✓ | n/a | B9-001-D3 + B9-001-D7 + B9-003-D5 + B7-001 | PASS |

## Métricas por archivo (grep automatizado)

### Vocabulario canónico (presencia esperada)

| Archivo | criterio | evidencia | banda | diagnóstico | Notas |
|---|---:|---:|---:|---:|---|
| `runtime.ts` | 2 | 1 | 1 | 1 | Bajo conteo esperado: runtime es UI procedural, no vocabulario-heavy |
| `manager.ts` | 6 | 2 | 10 | 2 | Manager dashboard usa banda intensivamente (matriz 3×5) |
| `onboarding.ts` | 2 | 0 | 0 | 15 | Onboarding es org/team/billing — diagnóstico es el deliverable |
| `field-test.ts` | 7 | 5 | 3 | 2 | Strong canon — surface pública debe educar sobre criterio |
| `billing.ts` | 0 | 0 | 1 | 10 | Comercial — diagnóstico es el producto, criterio queda en surfaces de uso |

### Vocabulario prohibido (esperado: solo en JSDoc declaratorio, NO en strings UI)

| Archivo | skill | score | feedback | assessment | Contexto |
|---|---:|---:|---:|---:|---|
| `runtime.ts` | 1 | 1 | 1 | 1 | Todos en JSDoc línea 9-11 "NO skill, NO score, NO feedback, NO assessment" — declaratorio, OK |
| `manager.ts` | 1 | 1 | 1 | 1 | Todos en JSDoc declaratorio — OK |
| `onboarding.ts` | 0 | 0 | 0 | 1 | Único hit en JSDoc línea 24 "diagnóstico NO assessment" — OK |
| `field-test.ts` | 1 | 0 | 1 | 0 | Hits en JSDoc líneas 33, 35 declaratorio — OK |
| `billing.ts` | 0 | 0 | 0 | 1 | Hit en JSDoc línea 32 declaratorio — OK |

**Conclusión:** 0 strings UI usan vocabulario prohibido. Los hits son JSDoc autoreferencial donde declaramos qué NO usar. PASS.

### AI slop blocklist (esperado: 0 en todo)

Blocklist verificado: "aprovecha el poder de", "revoluciona", "game-changer", "next-level", "empoderar", "sinérgico", "leverage", "sinergia", "escalable solución".

| Archivo | Slop hits | Verdict |
|---|---:|---|
| `runtime.ts` | 0 | ✓ |
| `manager.ts` | 0 | ✓ |
| `onboarding.ts` | 0 | ✓ |
| `field-test.ts` | 0 | ✓ |
| `billing.ts` | 0 | ✓ |

**Conclusión:** 0 hits AI slop across 5 files. PASS.

## Verificación cualitativa por archivo

### `runtime.ts` (240 líneas, 11 secciones)

- **Cierra C-R-2** del M9 audit (vocabulary canon en runtime UI strings).
- **No enseña antes de medir:** todas las strings son de navegación o captura de respuesta. Ningún string explica "qué es PII", "cómo prompting", ni anticipa la respuesta correcta.
- **No spoilers:** los eyebrows de las 6 secciones (Contexto/Datos/IA/Revisión/Decisión/Respuesta) describen el paso, no la dimensión evaluada.
- **Voice consistency:** "Decide qué información va al modelo" (paso 1) vs "Lee crítico el output" (paso 3) — imperativo directo, tono operativo, no instruccional.

### `manager.ts` (270 líneas, 12 secciones)

- **Matriz 3×5 lista** para que Codex importe en B5-002 sin reinventar labels (`matrix.row_labels`, `matrix.row_descriptions`, `matrix.cell_count_template`).
- **Override matrix completo:** los 4 caminos (pilotar/entrenar/pausar/escalar) con legend canon + drill-down CTAs.
- **Alerts honestos:** `high_risk_event_banner` declara explícitamente que el reporte queda en review humano antes de publicarse — alineado con B5-001-D3 (pending_review honesto).
- **Privacy footer:** `microcopy.privacy_note` declara confidencialidad sin exagerar (no promete compliance-grade).

### `onboarding.ts` (290 líneas, 8 secciones)

- **MX + CO v1 honesto:** `step1_org.region_disclaimer_v1_geos` declara que solo MX y CO tienen plantillas legales completas en v1. BR explícito en waitlist (alineado con B9-003-D2).
- **Marketing v1 honesto:** `step2_team.department_help_marketing` declara que solo Marketing/Growth tiene casos calibrados v1. Otras carreras pueden hacer el diagnóstico pero "los casos pueden no reflejar tu flujo exacto todavía".
- **Pricing transparente:** `step4_billing.pricing_disclaimer` declara cobro Stripe, factura al email del comprador. Sin esconder costos extras.
- **Bundle disclaimer claro:** 10% off Fase 1+2 + nota de elegibilidad post-checkout.

### `field-test.ts` (210 líneas, 8 secciones)

- **Fairness explícito:** `report.confidence_disclaimer` ("la lectura es preliminar — sin re-simulación ni práctica recurrente, no es defendible para una decisión de promoción/permiso") + `report.fairness_note` ("el reporte de equipos pagos pasa por hybrid review — el field-test no") sostienen la honestidad del producto.
- **Anti-fraud:** `anti_fraud.multiple_tabs_warning`, `anti_fraud.paste_detected_warning`, `anti_fraud.inactivity_warning` — surface para events que Codex registra en B6-002 funnel.
- **Lead capture compliance:** `lead_capture.consent_inline` declara opt-in explícito para contacto comercial. Alineado con B9-003-D5 (legal conservador v1).
- **Paid handoff coherente:** `paid_handoff.bullets` describen exactamente lo que el field-test NO tiene (matriz agregada, hybrid review, recomendación por persona) — refuerza diferenciación honesta.

### `billing.ts` (290 líneas, 10 secciones)

- **Distinción clara con onboarding.step4_billing:** JSDoc declara explícitamente que billing.ts es pricing público + portal lifecycle, NO el wizard de checkout (ese vive en onboarding).
- **Tiers honestos:** cada tier (diagnostico/sprint/track) declara `best_for` específico, `includes_extra` y `excludes` — el manager sabe exactamente qué compra y qué no.
- **Compliance conservador:** `faq[7]` ("Compliance y privacidad de datos") declara explícitamente "datos en Supabase US-East, Stripe PCI DSS Level 1, en v1 NO promovemos SOC2/ISO27001" — alineado con B9-003-D5.
- **Refund declarado:** `refund.body` define 7 días post-cargo si nadie ha empezado el caso vivo. Después de eso, crédito para próximo sprint pero no reembolso. Sin letra chica.

## Cross-file vocab consistency

Los 4 caminos del override matrix aparecen consistentemente:

- `manager.ts.recommendations.legend.{pilotar/entrenar/pausar/escalar}` ✓
- `field-test.ts.report.recommendation_section.action_labels.{pilotar/entrenar/pausar/escalar}` ✓
- `runtime.ts` no menciona los caminos (correcto — el participante no debe ver la recomendación durante el caso vivo).
- `billing.ts` no menciona los caminos (correcto — es marketing, no operativo).

Las 5 dimensiones (contexto/privacidad/validación/juicio/decisión) NO aparecen en strings UI del field-test (correcto — el field-test NO spoileai qué dimensiones se evalúan). Aparecen solo en `runtime.ts.sections.{step1-5}.headline` como categorización de pasos (no de dimensiones).

Las 3 bandas (A/M/B = Alto/Medio/Bajo) aparecen consistentemente:
- `manager.ts.team.band_chip_label` ✓
- `manager.ts.matrix.row_labels` ✓
- `field-test.ts.report.dimensions_section.band_label_template` ✓

## C-R items

**Ninguno.** Los 5 archivos pasan las 5 barras sin observaciones.

Los 3 C-R del M9 original:
- C-R-1 (sanitization 7 casos): owner compartido, queda con codex (deps B9-002-D2-S1 enforcement de validate-case-yaml.mjs).
- C-R-2 (runtime.ts copy versionado): **cerrado por commit 3933b41**.
- C-R-3 (emails.ts patch inline): **cerrado en M9 mismo commit**.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-2-D1
    decision: "Loop quality bar mantenida en wakeup cadence 270s — 5 nuevos copy files pasan los 5 criterios del M9 sin nuevos C-R"
    rationale: "El riesgo de degradación al shipear rápido en wakeup loop no se materializó. Vocabulario canon respetado (criterio/banda/decidir/diagnóstico). 0 AI slop. 0 spoilers. Fairness explícito en field-test y honesty en billing/onboarding. La cadencia 270s es sostenible para copy files con quality bar."
    change_type: process
    files_to_touch:
      - docs/coord/audits/loop_audit_post_copy_batch.md
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-2-D2
    decision: "Próximos 2 copy files (auth.ts + errors.ts) pueden continuar en cadence 270s con mismo quality gate sin audit intermedio"
    rationale: "La barra se mantiene auditando cada 5 archivos shipped, no cada 1. Auth y errors son menos vocabulario-críticos (UI utility strings) — el siguiente audit puede ir post auth+errors junto con first imports de codex en surfaces."
    change_type: process
    files_to_touch:
      - lib/simulador/copy/auth.ts
      - lib/simulador/copy/errors.ts
    owner: claude
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** continuar cadence 270s con `auth.ts` + `errors.ts` (cierra surfaces copy versionado para v1).
2. **Cuando Codex cierre B5-002:** unblock B9-001-D2 (reclamar categoría) + B9-002-D5 (override matrix Escalar) — claim y resolver.
3. **Cuando Codex cierre B7-001 (en flight ahora):** unblock B9-001-D5 (modelo free learner → employer paga). Claim y resolver.
4. **Post unlock + 2 copy files:** correr M9.3 audit cross-bloque pre v1 launch GO/NO-GO.
