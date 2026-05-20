# Admin copy — `/admin/*` (AdminShell)

> Audiencia: staff Itera interno (no customer-facing).
> Tono utilitario, denso, sin polish.

## Sidebar AdminShell

- Logo `itera · admin` (mono caption)
- Nav vertical:
  - Inicio (active = redirect a /admin/review)
  - **Review queue** ({pendingCount})
  - Orgs
  - Leads
  - Judge health
  - Audit log
- Bottom: user avatar (staff) + "salir admin"

---

## `/admin` (root → redirect a /admin/review)

(no surface propia, redirect inmediato)

---

## `/admin/review` (queue de reportes pending_review)

### Header

**Eyebrow:** REVIEW QUEUE

**H1:** Reportes en revisión humana.

**Sub muted:** {pendingCount} pendientes · {oldestAge}h el más antiguo · SLA 24h max.

### Filter bar (chips)

- Todos · High risk · Medium risk · Por org · Por antigüedad

### Lista cards (cada reporte pending)

**Card por sesión:**

**Header card:**
- Org name + team name
- Participant name (anonimizable toggle)
- Submitted hace {N}h
- Pill severity (high/medium)

**Body:**
- Risk events count + types (chips)
- Recommendation preliminar del judge

**Actions:**
- **Abrir reporte** (primary) → modal/drawer con reporte editable
- Aprobar publicación (al revisar) (success ghost)
- Rechazar publicación con razón (destructive ghost)

### Drawer/Modal review

**Cuando se abre un reporte para review:**

**Top:**
- Session ID mono
- Org/team meta
- Tiempo desde submit

**Tabs:**
1. **Reporte preliminar** (lo que generó el judge)
2. **Transcript** (sesión completa)
3. **Risk events detail** (con evidence_text)
4. **Decisión de review**

**Tab 4 — Decisión:**

**Radio:**
- ○ Confirmar publicación tal cual
- ○ Modificar bandas o recomendación antes de publicar
- ○ Rechazar (volver a pending con razón)

**Si "Modificar":**
- Edit fields: bandas por dimensión, recomendación, risk events severity
- Textarea: "Razón del cambio (queda en audit log)"

**Si "Rechazar":**
- Textarea: "Razón del rechazo (no se envía al usuario)"

**Footer drawer:**
- Cancelar (ghost) · Publicar reporte → (primary)

### Double-signature (cuando risk high)

Si severity high requiere 2 firmas staff:

**Banner amber:** "Este reporte tiene risk events high — requiere segunda firma staff antes de publicar."

**Estado:** "Firmado por {first_signer}. Esperando segunda firma."

---

## `/admin/orgs`

### Header

**Eyebrow:** ORGS

**H1:** Organizaciones registradas.

**Sub muted:** {totalOrgs} orgs · {totalTeams} teams · {totalUsers} users.

### Tabla

| Org | Creada | Plan | Seats usados | Status | Acciones |
|---|---|---|---|---|---|
| Acme LATAM | 12 may | Diagnóstico | 8/10 | active | Ver detalles |

**Acciones row:**
- Ver detalles → drawer con teams + members + subscriptions + invoices

---

## `/admin/leads`

### Header

**Eyebrow:** LEADS

**H1:** Leads del field-test público.

**Sub muted:** {totalLeads} leads · {convertedToCustomer} convertidos · last 30d.

### Filters (chips)

- Todos · Pending · Contacted · Qualified · Customer · Rejected · Spam

### Tabla

| Email | Empresa | Cargo | Fecha | Caso completado | Mini-reporte | Status | Acción |
|---|---|---|---|---|---|---|---|
| juan@acme.com | Acme | Head Marketing | hace 2h | sí | banda M | Pending | Marcar contacted |

**Row click:** drawer con detalles + transcript field-test + actions

---

## `/admin/judge-health`

### Header

**Eyebrow:** JUDGE HEALTH

**H1:** Estado del judge LLM.

**Sub muted:** Last 24h · {evaluations} evaluations · {avgLatency}s avg · {errorRate}% errors.

### Cards stats

**Card 1 — Latencia:**
- Value: {avgLatency}s avg · {p95Latency}s p95
- Sparkline last 24h
- Status: ✓ ok / ⚠ slow / ✗ failing

**Card 2 — Tasa de errores:**
- Value: {errorRate}%
- Top error type: {topError}
- Status: ✓ ok / ⚠ degraded

**Card 3 — Calibration:**
- Last calibration run: {date}
- Drift detected: yes/no
- Status

### Tabla de evaluaciones recientes

| Session | Org | Latencia | Status | Risk events | Confidence avg |
|---|---|---|---|---|---|

**Acciones:** Re-evaluar (re-corre judge sobre la sesión)

---

## `/admin/audit-log`

### Header

**Eyebrow:** AUDIT LOG

**H1:** Registro de operaciones.

**Sub muted:** Últimos {N} eventos · búsqueda + filtro.

### Search bar

- Input: buscar por user, action, target, fecha range
- Filtros: action type chips

### Lista timeline

| Timestamp | User | Action | Target | Details |
|---|---|---|---|---|
| 10:23 | claude@itera | report_published | session_id | First-signer review |
| 10:15 | pablo@itera | org_created | acme-latam | via onboarding |

---

## Microcopy admin estados

| Estado | Mensaje |
|---|---|
| Queue vacía | "No hay reportes en review. Cuando un risk event high requiera validación humana, aparecerá aquí." |
| Leads vacíos | "Aún no hay leads del field-test. Cuando alguien complete el demo público y deje email, aparecerá aquí." |
| Judge healthy | "Judge operando dentro de parámetros normales." |
| Judge degraded | "Latencia >{threshold}s o error rate >{X}%. Revisar." |
| Audit log vacío | "Sin eventos en el rango seleccionado." |

---

## Operación manual común

### Re-enviar invitación a empleado

(Desde /admin/orgs > drawer org > teams > members > 3-dots menu)

**Confirm modal:**
- Title: "Reenviar invitación"
- Body: "Se enviará nuevo email a {email} con link de aceptación válido por 7 días."
- CTAs: Cancelar · Reenviar

### Cancelar subscripción (con confirmación)

(Desde /admin/orgs > drawer org > subscriptions > active subscription > acción)

**Confirm modal:**
- Title: "Cancelar suscripción"
- Body: "El acceso se mantiene hasta {periodEnd}. Después, los miembros pierden acceso al dashboard y reportes."
- CTAs: Cancelar · Confirmar cancelación (destructive)

### Forzar re-evaluación de un reporte

(Desde /admin/judge-health > tabla > row > 3-dots)

**Confirm modal:**
- Title: "Re-evaluar sesión"
- Body: "Re-corre el judge sobre la sesión completa. Reemplaza el reporte actual. Útil cuando el judge tuvo error transitorio."
- CTAs: Cancelar · Re-evaluar

— claude · 2026-05-20 · admin copy v1.0
