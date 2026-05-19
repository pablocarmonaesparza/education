---
type: design
title: Reporte ejecutivo v2 — estructura, copy y KPIs
task_id: B5-001
date: 2026-05-19
authors: [claude]
reviewers: [codex]
status: spec
applies_to:
  - app/(app)/report/[session_id]/page.tsx
  - lib/simulador/copy/report.ts
  - lib/simulador/reports/generate-pdf.ts (codex implementa)
---

# Reporte ejecutivo v2 — el deliverable que paga la empresa

> Test del comprador: **un manager debe entender en 30 segundos qué decisión tomar.** Si no, rehacer.

## Resumen ejecutivo del reporte

Hay dos vistas del reporte:
1. **Web** (`/report/[session_id]`) — leída en navegador, polling para state, expandible por sección.
2. **PDF** (descargable) — auditable, share-friendly, archivable. Mismo contenido, layout fijo.

Misma data backend. Distinto renderer.

## Estructura jerárquica (orden obligatorio top-down)

### Sección 1 — Cabecera ejecutiva (above the fold)
**Goal:** en 30 segundos el manager sabe qué decisión tomar.

| Campo | Copy/Format | Fuente |
|---|---|---|
| Title chip | `Diagnóstico operativo · {caso_title}` | `case_template.title` |
| Participante | Avatar + initials + `{full_name} · {team_name}` | `simulador.users` + `team_memberships` |
| Sesión meta | mono: `{session_id_short} · {duration_min} min · {evaluated_at_date}` | `simulation_sessions` |
| **Recomendación principal** (hero) | display tight: `**{action}**` con color por acción (pilotar=A, entrenar=M, pausar=B, escalar=B) | `evaluation_runs.computed_recommendation` |
| Justificación 1-line | `Criterio {sólido/parcial/insuficiente} en {dimensiones_destacadas}; gap material en {dimensiones_críticas}.` | derivar de bandas |
| Banner condicional | Si `report.status='pending_review'`: warning amarillo "Este reporte tiene risk events de severidad alta. Está en revisión humana por staff Itera. Se publicará en ≤24h." | `reports.status` |

### Sección 2 — Banda general + matriz 3×5
**Goal:** ver dónde está el participante en el conjunto.

- Score numérico 0-100 (interno, no marketing) + banda A/M/B
- Matriz 3 niveles × 5 dimensiones con celdas A/M/B
  - Si caso es N1 sin variante avanzada → matriz reducida a 1×5
  - Si caso tuvo variante N3 → matriz 2×5 (N1+N3 o N2+N3)
- Cada celda hoverable con tooltip = rationale del judge

### Sección 3 — Las 5 dimensiones (drill-down)
**Goal:** dar contexto pedagógico al banding.

Por cada dimensión (orden display_order):
- Eyebrow: `{dimension_label}` + banda chip
- Score numérico + score bar
- Rationale del judge (cita textual del transcript cuando aplique)
- Si banda B/M y existe practice_beat asociado → CTA inline "Práctica sugerida: {beat_title}" (lee `practice_unlocks`)

### Sección 4 — Risk events (si existen)
**Goal:** exposición operativa concreta para el manager.

Por cada risk_event:
- Severity chip (high=rojo, medium=amarillo, low=gris)
- Type humanizado (`Exposed PII to model` → "Datos personales expuestos al modelo")
- Step ordinal de la sesión
- `evidence_text` en blockquote con cita textual
- Jurisdicción si aplica (`MX/CO/BR/other`) + `transfer_basis_documented`

⚠ Si hay risk events `high` y `report.status=pending_review`, mostrar disclaimer al manager: "El judge LLM detectó eventos de alta severidad. Staff Itera está validando manualmente antes de publicar este reporte."

### Sección 5 — Gaps identificados
**Goal:** lo que el manager debe corregir en el equipo.

Por cada gap:
- Severity chip
- Observado: 1-2 frases con cita textual
- Por qué importa: 1-2 frases con consecuencia operativa (regulatoria si aplica, reputacional, comercial)

### Sección 6 — Fortalezas
**Goal:** balance — no es purgatorio. Lo que el manager debe reforzar.

Lista de 2-4 bullets con strengths textuales del judge.

### Sección 7 — Práctica sugerida (si hay gaps activos)
**Goal:** transformar diagnóstico en acción.

Lista de practice beats desbloqueados:
- Beat title + duration (e.g., "Anonimizar sin perder señal · 2 min")
- Dimension chip + level chip
- CTA "Empezar práctica" → `/practice/{beat_slug}` (Codex implementa la ruta)
- Completion state si ya intentado

### Sección 8 — Plan de los próximos 7 días
**Goal:** próxima acción concreta para el manager.

3-5 bullets numerados de `recommendation.next_week_actions[]` del judge. Cada uno accionable, no abstracto.

### Sección 9 — Recomendación final reframed
**Goal:** repetir la recomendación del top pero con contexto.

Card con accent border:
- Eyebrow: "Recomendación"
- Display: `{action}.`
- Applies to: 1 frase sobre alcance (a la persona / al equipo / al proceso).
- Reason: 2-3 frases con racional del judge.

### Sección 10 — Transfer delta (si existe resim)
**Goal:** evidencia L3 Kirkpatrick (comportamiento, no solo aprendizaje).

Si `session.assignment_kind == 'resim'` y existe `session.parent_session_id`:
- Comparación baseline vs resim por dimensión (5 deltas)
- Visual: 5 mini-charts mostrando A/M/B antes y después
- Numerical delta + interpretación ("Mejoró 2 bandas en Privacidad — transfer real al variant nuevo")

### Sección 11 — Histórico longitudinal (si existe history)
**Goal:** ver progreso a lo largo del tiempo.

Si `person_readiness_history` tiene >1 entry para el user:
- Línea temporal con bandas por dimensión a través de sprints
- Muestra cohortes que el manager puede usar para identificar patrones

Si no hay history (primera sesión): NO mostrar sección.

### Sección 12 — Metadata + audit trail
**Goal:** defensibilidad ejecutiva ("¿cómo se calculó esto?").

Footer chico con:
- Judge model + prompt version + duration_ms
- Rubric slug + version + frozen_at date
- Case version + variant
- Override matrix applied (count: e.g., "2 overrides aplicados")
- Link "Ver evidence_snapshots" → expandible para auditoría completa

## Copy versionado por sección (lib/simulador/copy/report.ts)

```typescript
export const reportCopy = {
  // Sección 1
  recommendation_label: "Recomendación",
  recommendation_actions: {
    pilotar: "Pilotar",
    entrenar: "Entrenar",
    pausar: "Pausar",
    escalar: "Escalar",
  },
  pending_review_banner: "Este reporte tiene risk events de severidad alta. Está en revisión humana por staff Itera. Se publicará en ≤24h.",

  // Sección 2
  matrix_label: "Readiness por nivel × dimensión",
  band_labels: { A: "Alto", M: "Medio", B: "Bajo" },

  // Sección 3
  dimensions_section_eyebrow: "Las 5 dimensiones",
  practice_cta: (beat_title: string) => `Práctica sugerida: ${beat_title}`,

  // Sección 4
  risk_events_section_eyebrow: "Eventos de riesgo",
  pending_review_disclaimer: "El judge LLM detectó eventos de alta severidad. Staff Itera está validando manualmente antes de publicar este reporte.",

  // Sección 5
  gaps_section_eyebrow: "Gaps identificados",
  gap_observed_label: "Qué observamos",
  gap_why_matters_label: "Por qué importa",

  // Sección 6
  strengths_section_eyebrow: "Fortalezas",

  // Sección 7
  practice_section_eyebrow: "Práctica sugerida",
  practice_cta_button: "Empezar práctica",

  // Sección 8
  next_actions_eyebrow: "Próximos 7 días",

  // Sección 9
  recommendation_card_eyebrow: "Recomendación",

  // Sección 10
  transfer_delta_eyebrow: "Transfer entre baseline y resim",

  // Sección 11
  history_eyebrow: "Histórico del participante",

  // Sección 12 metadata
  metadata_eyebrow: "Auditoría técnica",
  metadata_disclaimer: (rubric_version: string, frozen_at: string) =>
    `Rúbrica ${rubric_version} (frozen ${frozen_at}). Reports históricos se renderean con la versión usada en su momento.`,
};
```

## KPIs visibles en el reporte (matriz)

| KPI | Origen | Visualización | Kirkpatrick L |
|---|---|---|---|
| Readiness score (0-100) | derivado de bandas | Hero numerical + barra | L2 |
| Banda general (A/M/B) | derivado de bandas | Hero chip | L2 |
| Banda por dimensión × nivel | `evaluation_runs.dimension_scores_json` | Matriz 3×5 + drill-down | L2 |
| Risk events count + severity | `simulador.risk_events` | Lista con citas | L2 |
| Gaps count + severity | `evaluation_runs.gap_tags_json` | Lista con observación + impacto | L2 |
| Recomendación (acción) | `evaluation_runs.computed_recommendation` | Card hero + reframed | L2/L3 |
| Practice beats unlocked | `practice_unlocks` joined | Lista con CTAs | L3 prep |
| Transfer delta (si resim) | `compute_transfer_delta(primary, resim)` | Mini-charts 5 dims | **L3** |
| Histórico longitudinal | `person_readiness_history` | Línea temporal | L3 longitudinal |
| Audit metadata | `evaluation_runs` + `rubrics.frozen_at` | Footer chico | governance |

## Layout PDF (sin perdida de info)

PDF reproduce el mismo contenido pero con layout fijo:
- A4, 1 inch margins
- Cabecera (logo Itera + título reporte) en cada página
- Numeración páginas (footer)
- Color palette igual a web (var(--accent), var(--band-*))
- Charts SVG estáticos (no interactivos)
- Audit metadata en última página

**Codex implementa PDF rendering** (Playwright headless o react-pdf — su elección). Yo sólo defino estructura/copy.

## Decisiones producto

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B5-001-D1
    decision: "Reporte v2 incluye matriz 3 niveles × 5 dimensiones (no solo 5 dimensiones planas)"
    rationale: "B9-002-D4 transfer delta + B3-002-D3 sprint N1+N2: el manager necesita ver readiness DIFERENCIADO por nivel operativo. Mismo person puede ser banda A en N1 (copiloto) y B en N2 (workflow) — son skills distintos. Sin matriz, el reporte oculta esa información clave."
    change_type: schema
    files_to_touch:
      - lib/simulador/reports/aggregate-by-level.ts
      - app/(app)/report/[session_id]/page.tsx
      - lib/simulador/copy/report.ts
    owner: codex
    blocked_by: []
    priority: high

  - id: B5-001-D2
    decision: "PDF tab download disponible desde web; mismo data, layout fijo, renderer server-side"
    rationale: "Manager comparte PDF con CEO/CHRO. Sin PDF, el reporte es web-only y se pierde audit trail. Codex elige renderer (Playwright vs react-pdf vs Puppeteer)."
    change_type: runtime
    files_to_touch:
      - lib/simulador/reports/generate-pdf.ts
      - app/api/sessions/[session_id]/report/pdf/route.ts
    owner: codex
    blocked_by:
      - B5-001-D1
    priority: high

  - id: B5-001-D3
    decision: "Pending review banner se muestra al manager con copy honesto (no esconde el risk high)"
    rationale: "B9-002-D5 + Performance Environment principle: si el judge detectó risk high, el manager DEBE saber que está en revisión humana antes de actuar. Esconder genera sorpresas post-publicación. Copy: 'Este reporte tiene risk events de severidad alta. Está en revisión humana por staff Itera. Se publicará en ≤24h.'"
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/report.ts
      - app/(app)/report/[session_id]/page.tsx
    owner: claude
    blocked_by: []
    priority: high

  - id: B5-001-D4
    decision: "Sección 10 Transfer delta SÓLO renderea si la sesión es resim (assignment_kind='resim'); en baseline el reporte salta directo de sección 9 a 11"
    rationale: "Sin transfer delta para baseline, no hay con qué comparar. Mostrar sección vacía 'pending' confunde. Skip + tooltip explicativo en sección 11 'Histórico se llena con resim — agenda re-diagnóstico en 30-90 días'."
    change_type: copy
    files_to_touch:
      - app/(app)/report/[session_id]/page.tsx
      - lib/simulador/copy/report.ts
    owner: codex
    blocked_by: []
    priority: medium

  - id: B5-001-D5
    decision: "Audit metadata footer muestra rubric_version + frozen_at; disclaimer cuando aplique"
    rationale: "B3-006-D2 + governance defensible. Sin metadata el reporte no es defendible ante CHRO. Footer chico (text-[12px] mono color tertiary) con: judge_model, rubric_version, frozen_at, case_version, override count. Click 'Ver evidence' expande full audit."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/report.ts
      - app/(app)/report/[session_id]/page.tsx
    owner: claude
    blocked_by:
      - B3-006-D1
    priority: high

  - id: B5-001-D6
    decision: "Shareable link con TTL 30 días + expira con revoke del manager"
    rationale: "Manager comparte report con CEO/CHRO via link (no PDF attachment, evita data sprawl). Token UUID + expiry. Mig 022 ya tiene analytics_events_catalog — agregar evento report_shared_link_generated/clicked/expired."
    change_type: runtime
    files_to_touch:
      - supabase/migrations/20260519022000_simulador_analytics_compliance_rubric_freeze_022.sql
      - app/api/sessions/[session_id]/report/share/route.ts
      - lib/simulador/copy/report.ts
    owner: codex
    blocked_by:
      - B5-001-D1
    priority: medium
```
<!-- decisions:data:end -->

## Owner matrix

- **Claude** (este doc + copy): estructura + lenguaje + KPIs + disclaimer copy
- **Codex** (implementación): matriz 3×5 aggregation, PDF renderer, share link runtime, transfer delta computation
- **Reviewer**: codex review producto-loop antes de merge, claude review post-implementación pre-launch

## Verificación pre-launch

1. **Test del 30 segundos**: manager lee solo Sección 1; ¿sabe qué hacer? (Sí/No por participante test)
2. **Test de defensibilidad**: ¿Sección 12 audit metadata sostiene pregunta de CHRO "¿cómo se calculó esto?"
3. **Test mobile**: layout responsive 375px sin perder info crítica
4. **Test PDF**: descargable, layout fijo, mismo data que web
5. **Test pending review**: si risk high, banner visible y honesto
