---
type: research
title: Manager dashboard UX patterns — referencias para B5-002 matriz 3×5
date: 2026-05-19
author: claude
reviewers: [codex, pablo]
status: published
scope: patterns visuales documentados para que codex implemente B5-002 (manager dashboard matriz 3×5 bandas × dimensiones) sin reinventar UX. Referencias premium B2B SaaS 2026
related:
  - lib/simulador/copy/manager.ts (matrix section ya lista)
  - docs/coord/audits/decisiones_pending_unblock.md (B9-001-D2 + B9-002-D5)
  - app/(app)/dashboard/page.tsx (dashboard v0 actual)
---

# Manager dashboard UX patterns — B5-002

## TL;DR

B5-002 (manager dashboard refactor) requiere matriz 3×5 (bandas A/M/B × 5 dimensiones contexto/privacidad/validación/juicio/decisión) que sea legible, drill-down, y premium. Esta investigación recopila patterns de:

- **Linear** (issue density grids + cycle progress)
- **Stripe** (revenue heatmaps + funnel visualization)
- **Sana** (assessment dashboards + cohort comparison)
- **Anthropic Console** (eval results grids + confidence visualization)
- **Notion** (database views + filter chips)

**Recomendación: heatmap-style 3×5 con cell counts + drill-down on click.** Cells codificadas con color sutil (no neon), tooltip con preview de participantes, click expand a lista. Mobile: collapse a swipeable bands.

Las strings ya están listas en `manager.ts.matrix` (M9-2-D8). Solo falta el layout component.

## Layout propuesto

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  Dimensiones del equipo                                     │
│  Promedio de las 5 dimensiones que medimos en cada caso.    │
│                                                             │
│            Contexto  Privacidad  Validación  Juicio  Decisión│
│  ┌────┬───────────┬───────────┬───────────┬────────┬────────┐│
│  │ A  │     8     │     5     │    12     │   9    │   7    ││
│  │    │           │           │           │        │        ││
│  ├────┼───────────┼───────────┼───────────┼────────┼────────┤│
│  │ M  │    12     │     8     │     6     │  11    │   9    ││
│  │    │           │           │           │        │        ││
│  ├────┼───────────┼───────────┼───────────┼────────┼────────┤│
│  │ B  │     3     │    10     │     5     │   3    │   7    ││
│  │    │           │           │           │        │        ││
│  └────┴───────────┴───────────┴───────────┴────────┴────────┘│
│                                                             │
│  Cifras son cuentas absolutas, no porcentajes. El total     │
│  puede no sumar al equipo si hay sesiones in_progress.      │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

Stack vertical de 3 cards (una por banda) con dimensiones como mini-table dentro:

```
┌─────────────────────┐
│  Banda alta         │
│  Opera en flujo...  │
│                     │
│  Contexto       8   │
│  Privacidad     5   │
│  Validación    12   │
│  Juicio         9   │
│  Decisión       7   │
└─────────────────────┘
```

## Color encoding bandas

**Decisión clave:** NO usar verde/amarillo/rojo neón (asocia a "good/warning/bad" como semáforo) — rompe el frame "el problema puede ser organizacional, no individual". Bandas no son juicio moral.

**Recomendación:** color sutil derivado del accent indigo del design system:

| Banda | Background | Text | Border |
|---|---|---|---|
| A (Alto) | `--accent-bg-soft` (indigo 50/10%) | `--accent-text` (indigo 600) | `--accent` (indigo 500) |
| M (Medio) | `--surface-2` (gray 50) | `--text-primary` (gray 900) | `--border` (gray 200) |
| B (Bajo) | `--surface-3` (gray 100) | `--text-secondary` (gray 600) | `--border-strong` (gray 300) |

**Por qué no semaforo:** Linear, Anthropic Console y Sana usan exactly este patrón (tono accent + grayscale, NO rojo). Patrón premium B2B 2026.

## Cell interaction patterns

### Hover

- Tooltip muestra preview de participantes (primeros 3 nombres + "+N más")
- Cursor cambia a pointer
- Cell ligeramente eleva (transform translateY(-1px))

### Click

- Modal o drawer con drill-down: lista de participantes en esa celda (banda × dimensión)
- Permite click en participante → /report/[session_id]

### Empty cell (count = 0)

- Render "—" en lugar de "0"
- No interactivo (cursor default)
- Tooltip "Nadie cayó en esta cohorte"

### Cell con review pendiente

- Indicator pequeño en esquina (dot small accent color)
- Tooltip menciona "N de M en review humano"

## Drill-down detail

Modal/drawer pattern (no full page navigate):

```
┌────────────────────────────────────────────────┐
│  ← Volver al dashboard                         │
│                                                │
│  Participantes — Banda A en Validación         │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ Ana López       Alta  · 22 min  · ✓ done │  │
│  │                              Abrir →     │  │
│  ├──────────────────────────────────────────┤  │
│  │ Javier Núñez    Alta  · 19 min  · ✓ done │  │
│  │                              Abrir →     │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

Strings de `manager.ts.drill_down` ya listas:
- `title_template(cohort)`
- `empty_label`
- `columns.{name, band, duration, status, report}`
- `open_report_cta`
- `back_to_dashboard`

## Referencias premium (no licensing — pure visual inspiration)

### Linear (cycle dashboard)

**Pattern aplicable:** issue density grid. Cells small, count-only, click expand. Color subtle accent.

**Lo que copiamos:** density visualization + click-to-drill pattern.

**Lo que NO copiamos:** Linear's deep keyboard shortcuts (Itera es B2B casual, no power-user).

### Stripe (revenue heatmap)

**Pattern aplicable:** cell-based table con cifras absolutas + tooltip con detail. Color encoding sutil (no semáforo).

**Lo que copiamos:** typography + spacing premium.

**Lo que NO copiamos:** Stripe's complex breakdowns (Itera matriz es 3×5 fix, no dinámica).

### Sana (assessment dashboard cohort comparison)

**Pattern aplicable:** band breakdown por cohort con count + percentage. Drill-down modal pattern.

**Lo que copiamos:** drill-down modal layout + participant card design.

**Lo que NO copiamos:** Sana's percentile rankings (Itera usa bandas absolutas, no percentile).

### Anthropic Console (eval results)

**Pattern aplicable:** grid de evaluation cells con confidence visualization + sample expand on click.

**Lo que copiamos:** confidence indicator (dot small) + sample expand UX.

**Lo que NO copiamos:** Anthropic's raw token usage (no aplica al manager).

### Notion (database views)

**Pattern aplicable:** filter chips + view switcher (matriz vs lista) + responsive table.

**Lo que copiamos:** filter chips para "show only X" (ej. solo banda B, solo dimension validación).

**Lo que NO copiamos:** Notion's full database power-user features (Itera mantiene focused scope).

## Filtros sugeridos

Encima de la matriz, chip-based filter row:

```
[Todas] [Banda A] [Banda M] [Banda B] [Con review pendiente]
```

- Click filter → matriz updates con count filtrado
- Active filter visible (accent background)
- "Todas" reset

**Strings necesarias:**

```typescript
// Agregar a manager.ts:
matrix_filters: {
  all_label: "Todas",
  band_a_label: "Solo banda alta",
  band_m_label: "Solo banda media",
  band_b_label: "Solo banda baja",
  pending_review_label: "Con review pendiente",
  active_filter_chip_aria: (label: string) => `Filtro activo: ${label}`,
}
```

## Animaciones

Framer Motion subtle:

- **Cell on mount:** stagger entrance (delay 0.04s per cell, total 12 cells = 0.5s total)
- **Cell on hover:** translateY(-1px) + shadow subtle 150ms
- **Drill-down open:** slide-up modal o slide-right drawer (300ms ease-out)
- **Filter chip active:** color transition (200ms)

NO animaciones gratuitas. Si la animación no ayuda comprensión, omitir.

## Accessibility

- Cells tienen `aria-label` con cifra + banda + dimensión
- Modal de drill-down trap-focus
- Keyboard navigation: arrows mueven entre cells, Enter abre drill-down, Escape cierra modal
- Color encoding NO depende solo de color (también count + position)
- Screen reader announces "Tabla 3 bandas por 5 dimensiones, N celdas, foco en celda X"

## Performance considerations

- Matriz es 15 cells max (3 × 5). NO performance issue.
- Drill-down list lazy load si >50 participantes (mid-market mid-team max 50).
- Stats aggregate query en `/api/orgs/[id]/team/[id]/aggregate` (Codex W6).

NO requiere virtualization ni paginación v1.

## Mockup → implementation map

| Mockup component | Strings source | API endpoint |
|---|---|---|
| Matrix grid | `manager.ts.matrix.{row_labels,row_descriptions,cell_count_template}` | `/api/dashboard` aggregate.matrix |
| Drill-down modal | `manager.ts.drill_down.{title_template,columns,open_report_cta}` | `/api/dashboard/cohort?band=A&dim=validacion` (nuevo, codex crea) |
| Filter chips | `manager.ts.matrix_filters.*` (nuevo, agregar) | Client-side filter (no API) |
| Empty cell | `manager.ts.matrix.cell_empty_label` ("—") | n/a |
| Alerts (high risk banner) | `manager.ts.alerts.high_risk_event_banner` | aggregate.alerts |

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D33
    decision: "B5-002 implementa matriz 3×5 heatmap-style con color encoding accent-derived (NO semáforo). Cells con cifras absolutas + tooltip preview + click drill-down. Strings ya en manager.ts (M9-2). Codex implementa layout cuando B5-002 entre"
    rationale: "Patrón heatmap con accent-derived es coherente con el frame producto 'criterio operativo no semáforo moral'. Linear/Anthropic/Sana usan exactly este patrón. Las strings ya están listas en manager.ts.matrix — solo falta el component."
    change_type: ux_pattern
    files_to_touch:
      - app/(app)/dashboard/page.tsx (cuando codex implemente B5-002)
      - lib/simulador/copy/manager.ts (agregar matrix_filters cuando codex lo necesite)
    owner: codex (implementation) + claude (copy extension)
    blocked_by:
      - B5-002
    priority: normal

  - id: M9-3-D34
    decision: "Agregar matrix_filters section a manager.ts cuando codex arranque B5-002. 5 chips: Todas / Banda A / Banda M / Banda B / Con review pendiente. Filter client-side (no API endpoint nuevo)"
    rationale: "Filtros aceleran navegación del manager sin requerir new API. 5 chips son suficientes — más es overhead UX. Active filter chip con accent bg sigue patrón Notion."
    change_type: copy_extension
    files_to_touch:
      - lib/simulador/copy/manager.ts (extender con matrix_filters)
    owner: claude
    blocked_by:
      - B5-002 (arranque)
    priority: low

  - id: M9-3-D35
    decision: "Drill-down es modal slide-up (no full page navigate). Mantener manager context visible (matriz detrás) para que sea fácil cerrar modal y ver otra celda"
    rationale: "Modal preserva contexto. Navigate full-page pierde 'donde estaba mirando el manager'. Cross-cell comparison es use case frecuente (manager mira A en validación, luego M en validación) — modal facilita esto."
    change_type: ux_pattern
    files_to_touch:
      - app/(app)/dashboard/page.tsx (B5-002 implementation)
    owner: codex
    blocked_by:
      - B5-002
    priority: normal
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** este doc informa B5-002. Codex NO necesita acción hasta arrancar B5-002 (cuando termine B7-001).
2. **B5-002 arranque:** codex usa este doc + manager.ts.matrix como specs. Claude extiende manager.ts con matrix_filters cuando codex lo pida.
3. **Post B5-002 cerrado:** validar UX con primeros customers — feedback puede ajustar filter design o cell interactions.
4. **v2 mejoras:** percentile comparison (vs benchmark LATAM), filter avanzado (combinations), cohort comparison sprints.
