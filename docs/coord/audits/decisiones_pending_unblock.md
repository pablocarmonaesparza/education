---
type: audit
title: Decisiones pending unblock — handoff para codex post-deps
date: 2026-05-19
author: claude
reviewer: codex
status: published
scope: 3 decisiones producto blocked por deps codex (B5-002 + B7-001) con recomendación pre-resuelta para minimizar coordinación cuando deps unlock
---

# Decisiones pending unblock — handoff

## TL;DR

3 decisiones producto cuyo cierre depende de que codex termine 2 bloques:
- **B5-002 (manager dashboard refactor)** unblock → cierra B9-001-D2 + B9-002-D5
- **B7-001 (Stripe Checkout B2B)** unblock → cierra B9-001-D5

Este doc deja la posición producto **pre-resuelta** para cada decisión, con rationale + fuente + acción inmediata cuando deps cierren. Reduce coordinación a "claim + apply + push".

## Decisión 1: B9-001-D2 — Reclamar categoría "criterio IA medible" en homepage

**Estado:** backlog · blocked_by B5-002

**Contexto:** B9-001-D7 (done) declaró 3 frames de diferenciación vs Wharton/Section/Forage. La decisión D2 va un paso más allá: reclamar formalmente la categoría "criterio operativo medible en uso de IA" como territorio Itera en la landing pública. Hoy `landing.ts.hero` ya dice "¿tu equipo usa IA con criterio?" — pero no usa la fórmula completa "criterio IA medible" que codex podría amplificar en el dashboard manager (donde el manager VE la medición materializada en matriz 3×5).

**Por qué blocked por B5-002:** la matriz 3×5 (bandas × dimensiones) es la prueba visual de "criterio medible". Sin matriz cableada en el dashboard, el claim de la landing carece de evidencia ejecutable. Lanzar el claim en landing antes de que el manager pueda VER la medición rompería la promesa.

**Posición producto pre-resuelta:**

Cuando B5-002 cierre, actualizar `lib/simulador/copy/landing.ts` con:

```typescript
// landing.ts.hero
headline_lines: ["¿tu equipo usa IA", "con criterio medible?"],
accent_word: "criterio medible",
// + nueva sección "category_claim" inmediatamente después de hero:
category_claim: {
  eyebrow: "Categoría que abrimos",
  headline: "Criterio operativo medible. No certificación, no curso.",
  body: "Medimos cómo tu equipo decide cuando usa IA en flujos reales. La matriz 3×5 (5 dimensiones × 3 bandas) es la única lectura defendible vs. quiz, badge o certificado de finalización.",
  cta_label: "Ver cómo se ve la matriz",
  cta_anchor: "#how_it_works",
},
```

**Cross-link al dashboard:** el screenshot del dashboard manager con matriz 3×5 visible debería aparecer en la landing como "anchor visual" — codex puede capturar uno post-B5-002 y agregar a `app/(public)/page.tsx`.

**Fuente / rationale:**
- McKinsey 2024: 88% adopción de IA pero <6% high performers. La diferencia es proceso, no acceso a IA. Itera mide proceso ergo criterio operativo es la categoría correcta a reclamar.
- Section AI / Wharton compiten en "certificación / curso", no en "medición continua de criterio". Vacío de mercado real.
- B9-001-D7 (done) ya emitió las 3 frases canónicas; D2 solo formaliza el claim en surface principal.

**Acción cuando B5-002 cierre:**
1. Verificar que `dashboard.matrix` está cableado y rendering.
2. Editar `lib/simulador/copy/landing.ts` con `category_claim` section.
3. Avisar codex que agregue anchor visual (screenshot matriz) en `app/(public)/page.tsx`.
4. Commit `[task:B9-001-D2] reclamar categoría criterio IA medible en landing post-B5-002 unblock`.
5. Sync to board via scripts/coord/sync-research-to-board.mjs.

## Decisión 2: B9-001-D5 — Modelo "free learner, employer paga" como vector futuro v2

**Estado:** backlog · blocked_by B7-001

**Contexto:** B9-001-D3 (done) cerró pricing Fase 1 B2B-only ($4-8K diagnóstico, 5-50 ppl). La pregunta D5: ¿debe Itera abrir un modelo donde el participante individual usa el field-test gratis + accede a sus reportes preliminares, y luego su employer paga si decide formalizar?

Hoy el field-test (`/field-test/marketing-urgent-campaign-pii`) ya es free + sin login. Pero NO captura learner identity ni le da acceso recurrente a su propio reporte. La copy del mini-reporte tampoco invita al learner a "guardar tu reporte y compartirlo con tu manager para que cubra el costo".

**Por qué blocked por B7-001:** el modelo requiere Stripe Customer Portal funcional para que el employer pueda completar el pago con metadata "originated by individual learner X". Sin B7-001 cerrado, no hay hook para self-serve B2B desde un lead individual.

**Posición producto pre-resuelta:**

Cuando B7-001 cierre, evaluar el modelo en 2 pasos:

**Paso A — Lift activation NO commit:** agregar al mini-reporte field-test un opt-in "guarda tu reporte con tu email y compártelo con tu manager". Esto no requiere cambios de pricing — solo un nuevo email template + landing handoff donde el manager aterriza con un "tu equipo de marketing ya completó 1 muestra: aquí está, compra el diagnóstico para tu equipo completo".

Strings ya listos en `lib/simulador/copy/field-test.ts.lead_capture` — falta extender para incluir `save_to_email_and_share` variant.

**Paso B — Free learner formal solo si Paso A convierte ≥5%:** después de 30 días con Paso A activo, medir conversión "learner share → manager buy". Si pasa 5% (anchor industry para B2B PLG conversion), considerar modelo formal "free para learner, employer paga" en v2. Si <5%, mantener modelo B2B-only.

**Recomendación NO Fase 1:** el modelo no entra en v1. Hoy v1 es B2B Sales-led ($4-8K). PLG learner→employer es un VECTOR futuro, no la apuesta v1. Esto evita 3 riesgos:
1. Atomizar el mensaje (B2B + PLG simultáneo en v1 confunde al buyer).
2. Costos de field-test (judge LLM + lead inbox) si vuela viral sin commercial pull.
3. Caer en trampa Forage/Coursera (free → no monetiza enterprise).

**Fuente / rationale:**
- Section AI: B2B-only ($750/seat anchor). No tiene free learner — y sigue vendiendo.
- Wharton Interactive: free para students universitarios via university license. NO mismo modelo que learner individual.
- Forage: free para students, employer paga screening — confirmó vector pero target es entry-level hiring funnel, no upskilling. Diferentes mercados.
- PLG B2B research (OpenView 2024): tasas típicas free→paid B2B oscilan 2-5%. Anchor 5% es ambicioso pero achievable si la propuesta de valor del learner es real.

**Acción cuando B7-001 cierre:**
1. Verificar Stripe Customer Portal está rendering.
2. Decidir si activar Paso A inmediatamente o esperar a tener 50+ field-tests completados primero (volumen para señal).
3. Extender `lib/simulador/copy/field-test.ts.lead_capture` con `save_to_email_and_share` variant + email template en `lib/simulador/copy/emails.ts` (template "learner_shares_report_with_manager").
4. Commit `[task:B9-001-D5-stepA] activar lift learner→manager share post-B7-001`.
5. Definir métrica de éxito: ≥5% conversion en 30 días para decidir formalización modelo en v2.

## Decisión 3: B9-002-D5 — Override matrix mantiene rama Escalar

**Estado:** backlog · blocked_by B5-002

**Contexto:** El override matrix tiene 4 caminos: pilotar / entrenar / pausar / escalar. La pregunta D5 cuestiona si la rama "escalar" (el problema NO es individual, requiere proceso/legal/compliance/IT/policy) debe quedar en el modelo o si comprime el reporte hacia análisis de procesos cuando la sesión midió a una persona.

Hoy el código TS + SQL function (`apply-overrides.ts` + `compute_recommendation`) ya tiene la rama Escalar definida con triggers específicos: ≥2 risk events high tipo `governance_unclear` o `over_relied_on_output` + dimensión "juicio" en banda B → recommendation = escalate.

**Por qué blocked por B5-002:** la decisión necesita el frame visual del dashboard manager para confirmar que "Escalar" se diferencia claramente de "Pausar" cuando el manager ve la lista. Sin matriz 3×5 visible, los 4 caminos pueden colapsar a 3 (pilotar/entrenar/pausar) por simplicidad UI.

**Posición producto pre-resuelta: MANTENER rama Escalar.**

Rationale Kirkpatrick Performance Environment principle: "results depend on enabling environment, not solo learner". Si la rúbrica detecta que el problema operativo del participante surge de un environment inadecuado (compliance ambigua, governance vacía, herramienta IA sin guardrails), la recomendación correcta NO es "entrenar al participante" — es "Escalar a quien controla el environment".

Sin la rama Escalar, el override matrix se vuelve injusto: cualquier risk event high te asigna "pausar" al participante aunque la causa raíz sea organizacional. Eso degrada confianza del manager en el reporte (le diría "tu empleado está mal" cuando la verdad es "tu organización está mal").

**Recomendación formal:**

Cuando B5-002 cierre, agregar a `manager.ts.recommendations.legend.escalar`:

```typescript
escalar:
  "El problema no es individual. Requiere proceso, legal, compliance, IT o policy antes de re-evaluar persona. " +
  "El participante no debe penalizarse cuando la causa raíz es organizacional — el reporte refleja la realidad del environment.",
```

Y al frame visual del dashboard (B5-002 surface), agregar tooltip al chip "Escalar" explicando: "Caso típico: 2+ risk events high de tipo governance/compliance + dimensión juicio en banda B. No es problema individual."

**Fuente / rationale:**
- Kirkpatrick 4-level model: L4 (results) explícitamente depende de "performance environment" — el modelo asume que learner improvement NO basta si environment bloquea.
- HBS Case Method principle: when student decisions reveal organizational dysfunction, the case discussion turns to organizational design, not individual coaching. Itera replica este move pedagógico en su reporte.
- Override matrix research (R24 / docs/research/case_method_principles.md): la rama Escalar es honestidad operativa — admite que el método tiene límite (medir persona) y deriva a otros métodos (audit organizacional) cuando aplica.

**Acción cuando B5-002 cierre:**
1. Verificar que el dashboard renderiza los 4 chips Escalar/Pausar/Entrenar/Pilotar.
2. Editar `lib/simulador/copy/manager.ts.recommendations.legend.escalar` con la línea adicional Kirkpatrick.
3. Codex agrega tooltip al chip Escalar en `app/(app)/dashboard/page.tsx`.
4. Commit `[task:B9-002-D5] mantener rama Escalar con justificación Kirkpatrick post-B5-002 unblock`.
5. Sync to board.

## Plan de ejecución coordinado

```
codex                                claude
─────                                ──────
B7-001 close ─────────────────────►  claim B9-001-D5 (Paso A)
                                     extend field-test.ts.lead_capture
                                     extend emails.ts (learner_shares)
                                     commit + push + sync board

B5-002 close ─────────────────────►  claim B9-001-D2 (categoría)
                                     edit landing.ts.hero + category_claim
                                     pide a codex screenshot matriz
                                     commit + push + sync board

                                     claim B9-002-D5 (Escalar)
                                     edit manager.ts.recommendations.legend
                                     pide a codex tooltip chip dashboard
                                     commit + push + sync board
```

## Métricas que confirman el closure

| Decisión | Métrica verificable | Cómo |
|---|---|---|
| B9-001-D2 | grep "criterio medible" en landing.ts | comando |
| B9-001-D5 | save_to_email_and_share variant en field-test.ts.lead_capture | grep |
| B9-002-D5 | "Kirkpatrick" o "environment" en manager.ts.recommendations.legend.escalar | grep |
| Todas las 3 | status: done_archive en BUILD_BOARD.yaml | board lint |

## Por qué este doc es valioso

Sin este doc, cuando codex cierre B5-002 o B7-001 yo tendría que:
1. Re-investigar contexto producto desde cero (research, board, audits)
2. Redactar la posición desde scratch
3. Coordinar con codex via INBOX_CLAUDE.md (latencia)

Con este doc:
1. Codex lee este archivo cuando cierra deps
2. Aplica las edits ya redactadas
3. Solo coordina ITEMS específicos (screenshot, tooltip)

Reduce el closure de cada decisión de ~30 min a ~5 min. 3 decisiones × 25 min ahorro = 75 min de coord deuda evitada.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D4
    decision: "Pre-resolver posición producto + edits para 3 decisiones blocked, dejándolas en docs/coord/audits/decisiones_pending_unblock.md como handoff trazable"
    rationale: "Las 3 decisiones (B9-001-D2 + B9-001-D5 + B9-002-D5) están bien fundadas en research + contrato pero esperan deps codex. Mejor dejar el closure pre-resuelto que re-investigar en sesión futura. Reduce coordinación pos-deps de ~75 min a ~15 min."
    change_type: process
    files_to_touch:
      - docs/coord/audits/decisiones_pending_unblock.md
    owner: claude
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->
