# Dashboard manager copy — `/dashboard` (ManagerShell)

> Audiencia: buyer Head/VP Marketing/Growth/Ops viendo su equipo después del sprint.
> "Wow moment" #1 del producto. Manager debe entender estado en 5s, tomar acción en 30s.

## Layout

ManagerShell: sidebar collapsible + main wide.

**Sidebar:**
- Logo itera + selector org (dropdown si >1)
- Nav vertical:
  - **Inicio** (active = dashboard)
  - Equipo (lista de personas)
  - Reportes (todos los reportes publicados)
  - Configuración (org settings + billing)
- Bottom: user menu (avatar + nombre + dropdown logout)

**Main:**

---

## Header

**Eyebrow:** {teamName} · SPRINT {sprintName}

**H1:** {sprintName} — semana {N}.

**Sub muted:** {completed}/{total} personas completaron · reporte agregado actualizado hace {timeAgo}.

**Acción derecha (button outline):** Descargar reporte completo (.pdf)

---

## KPI strip (4 cards bento responsive)

### Card 1 — Progreso del sprint

**Eyebrow:** PROGRESO DEL SPRINT

**Value (display):** {completedPct}%

**Progress bar:** {completed}/{total} cap

**Sub:** {completed} completaron · {inProgress} en curso · {notStarted} sin iniciar

### Card 2 — Readiness promedio

**Eyebrow:** READINESS PROMEDIO

**Value (display):** {avgScore}/100

**Visual:** 3-segment band indicator (A/M/B) con punto current

**Sub:** {bandAlto} en alto · {bandMedio} medio · {bandBajo} bajo

### Card 3 — Risk events

**Eyebrow:** EVENTOS DE RIESGO

**Value (display):** {totalRiskEvents}

**Sub:** {highCount} altos · {mediumCount} medios · {lowCount} bajos

**Si pending review >0:** banner amber inline: "{pendingReviewCount} en revisión humana"

### Card 4 — Recomendación dominante

**Eyebrow:** RECOMENDACIÓN DOMINANTE

**Value (display):** {dominantRecommendation}
(Pilotar / Entrenar / Pausar / Escalar)

**Sub:** {recommendationCount} de {total} personas

**Caption muted:** Acción sugerida la próxima semana: {nextWeekActionShort}

---

## Banner atención (solo si high_risk > 0 o pending_review > 0)

**Card border-l-4 destructive:**

**Eyebrow:** ATENCIÓN OPERATIVA

**Body:** {highRiskCount} eventos de riesgo alto · {pendingReviewCount} reportes en review humano. Revisa antes de expandir autonomía.

**CTA inline (link):** Ver eventos →

---

## Matriz personas × dimensiones

**Eyebrow:** MATRIZ POR PERSONA

**H2:** Personas × dimensiones.

**Sub:** Cada celda muestra la banda alcanzada (A/M/B). Click en fila para ver el reporte individual.

**Tabla (responsive: tabla en desktop, accordion en mobile):**

| Persona | Criterio | Verificación | Ética/PII | Comunicación | Decisión | Recomendación |
|---|---|---|---|---|---|---|
| María González | A | A | M | A | A | **Pilotar** |
| Juan Pérez | M | A | M | M | M | **Entrenar** |
| Pedro López | B | B | B | M | B | **Pausar** ⚠ |

**Celdas:** pill colored con letra (A=verde / M=amber / B=destructive)
**Hover en celda:** tooltip con rationale corta (~80 chars)
**Click en fila:** drill-down → `/report/{session_id}` de esa persona

**Empty state matriz:** "Aún no hay sesiones completadas. Cuando alguien complete, aparece aquí."

---

## Risk events agregados

(Solo si total > 0)

**Eyebrow:** EVENTOS DE RIESGO

**H2:** Patrones detectados.

**Tabla compacta:**

| Tipo | Count | Severidad mayoritaria | Personas afectadas |
|---|---|---|---|
| accepted_hallucinated_figures | 3 | alta | María, Juan, Pedro |
| pii_exposure | 2 | alta | Juan, Pedro |
| over_relied_on_output | 4 | media | (varios) |

**Empty state:** "Sin risk events detectados en esta sesión. Buena señal."

---

## Actividad reciente (timeline vertical)

**Eyebrow:** ACTIVIDAD RECIENTE

**H2:** Últimos eventos.

**Timeline:**
- {timeAgo} · {personName} completó el caso.
- {timeAgo} · Reporte de {personName} publicado.
- {timeAgo} · Risk event high en sesión de {personName} → en review humano.
- {timeAgo} · {personName} empezó el caso.

(últimos 10 eventos máx · "ver todos" link al final)

---

## Acciones recomendadas (4 cards grid 2x2)

**Eyebrow:** ACCIONES RECOMENDADAS

**H2:** Cuatro caminos por persona.

**Card por acción (con count):**

### Pilotar.
{N} personas
Esta persona puede operar con IA en flujos sensibles sin supervisión continua.

### Entrenar.
{N} personas
Tiene criterio base pero necesita práctica en dimensiones específicas. Plan de 7 días anexado al reporte.

### Pausar.
{N} personas
Riesgo operativo en uso actual de IA. Pausar flujos sensibles hasta remediar gaps específicos.

### Escalar.
{N} personas
Caso de excepción que requiere revisión adicional por staff Itera. Ya te contactamos por email.

---

## Empty states dashboard

### Equipo sin invitaciones

**Empty state full-section:**

**H2:** Aún no invitaste a nadie.
**Body:** Vuelve al onboarding y completa el step de invitar a tu equipo.
**CTA:** Invitar a mi equipo → (/onboarding/invite)

### Invitaciones pendientes (nadie aceptó)

**H2:** Esperando a tu equipo.
**Body:** Enviamos {N} invitaciones. Nadie las aceptó todavía. ¿Reenvías?
**CTA secondary:** Reenviar invitaciones

### Sesiones en progreso (nadie completó)

**H2:** {N} personas empezaron.
**Body:** Cuando completen, verás resultados aquí. Esto típicamente toma 18-30 minutos por persona.

### Sin risk events

(No es empty state pesimista — es positivo)

**Caption inline:** "Sin risk events relevantes en esta cohort."

---

## Microcopy de bandas (sin juicio moral)

| Banda | Visible al manager | NO usar |
|---|---|---|
| A (alto) | "Puede pilotar autónomo" | ❌ "Excelente", "Top performer" |
| M (medio) | "Necesita práctica específica" | ❌ "Promedio", "Necesita mejorar" |
| B (bajo) | "Requiere pausa + remediación" | ❌ "Bajo desempeño", "Falla" |

**Regla:** las bandas describen capacidad operativa en uso de IA, no valor moral de la persona.

---

## Microcopy de acciones (verbo + objeto + razón)

| Acción | Patrón |
|---|---|
| Pilotar | "Pilotar: ampliar scope con IA en {area}." |
| Entrenar | "Entrenar: práctica de 7 días en {dimension}." |
| Pausar | "Pausar: retirar de {flow} hasta resolver {gap}." |
| Escalar | "Escalar: review staff Itera por {reason}." |

---

## Reglas anti-jerga executive

| ❌ Mal | ✅ Bien |
|---|---|
| "Performance overview" | "Estado del sprint" |
| "Top performers" | "Banda alta" |
| "Coaching opportunities" | "Personas que necesitan práctica" |
| "Risk exposure" | "Eventos de riesgo alto" |
| "ROI of sprint" | (no usar — no medimos ROI desde la app) |
| "Engagement rate" | (no usar — no es métrica del producto) |

— claude · 2026-05-20 · dashboard manager copy v1.0
