# Dashboard empleado copy — `/dashboard` (EmployeeShell)

> Audiencia: empleado invitado, NO manager.
> Diferencia clave: NO ve datos agregados de equipo. Solo sus casos y su reporte.

## Layout

EmployeeShell: sidebar simple + main.

**Sidebar:**
- Logo itera + nombre del empleado
- Nav vertical:
  - **Mis casos** (active)
  - Mi reporte (solo aparece cuando hay reporte publicado)
- Bottom: user avatar + dropdown logout

**Main:**

## Header

**Eyebrow:** {teamName} · sprint {sprintName}

**H1:** Hola {firstName}.

**Sub (caption):** Aquí está lo que te toca hacer.

---

## Estado activo: caso pendiente

### Card primary (interactive)

**Eyebrow:** TU CASO ACTUAL

**H2:** Marketing — campaña urgente con PII

**Sub:** ~18 minutos · nivel N1

**Body:** {briefSnippet — primeras 80 chars del brief de Camila}…

**CTA primary:** Empezar caso → (/case/marketing_urgent_campaign_pii_v1)

**Caption muted:** Te invitó {buyerName}. Puedes empezar cuando estés listo.

---

## Estado: caso en progreso

### Card

**Eyebrow:** EN PROGRESO

**H2:** Marketing — campaña urgente con PII

**Body:** Vas en el step {stepName} ({stepIdx}/6).

**Progress bar (visual):** {pct}% completado

**CTA primary:** Continuar caso →
**CTA secondary (ghost):** Empezar de nuevo (con confirm: "Tu progreso actual se borra. ¿Continuar?")

**Caption muted:** Último guardado hace {N} min.

---

## Estado: caso completado, reporte en review

### Card warning (border amber)

**Eyebrow:** ENVIADO

**H2:** Tu sesión está en revisión.

**Body:** Detectamos algo que requiere validación humana de nuestro equipo. Recibirás email cuando tu reporte esté listo (24h max).

**Caption muted:** Enviado hace {N}h.

---

## Estado: reporte publicado

### Card success (border green)

**Eyebrow:** TU REPORTE

**H2:** Reporte ejecutivo listo.

**Body:** Recomendación: {recommendation}. {rationaleShort}

**CTA primary:** Ver mi reporte → (/report/{session_id})

**Caption muted:** Publicado hace {N}h. Tu manager también lo recibió.

---

## Estado: empty — sin casos asignados

### Empty state

**Icon:** clock outline (Lucide stroke 1.5)

**H2:** Aún no tienes caso asignado.

**Body:** Cuando {buyerName} te asigne uno, aparecerá aquí. ¿Te invitaron por error? Escríbenos a hola@itera.la.

---

## Mis casos (sección secundaria, lista vertical)

(Solo aparece si hay >1 caso. Cuando solo hay 1, se muestra solo el card principal arriba.)

**Eyebrow:** TUS CASOS

**Lista cards compactas:**

| Caso | Estado | Acción |
|---|---|---|
| Marketing PII | Completado · reporte listo | Ver reporte → |
| Growth lead-mgmt | Pendiente | Empezar caso → |
| (futuro) | Bloqueado hasta finalizar el anterior | — |

---

## Notificaciones inline (toast/banner contextual)

| Evento | Mensaje |
|---|---|
| Caso recién asignado | "Tienes un caso nuevo: {caseName}." (banner border-l accent) |
| Reporte recién publicado | "Tu reporte de {caseName} está listo." (banner accent, link al reporte) |
| Práctica recomendada (post-reporte) | "Tu reporte sugiere práctica en {dimension}. Próximo paso: {nextStep}." |

---

## Microcopy estados

### Empty / loading / error

| Estado | Mensaje |
|---|---|
| Loading inicial | Skeleton cards (no spinner full-page) |
| Sin casos | "Aún no tienes caso asignado." (empty state above) |
| Network error | "No se pudo cargar tus casos. Recarga la página." |
| Permission denied | "No tienes acceso a esta sección. Verifica con tu manager." |

---

## Reglas anti-LMS

(Confirmar que el copy NO usa estos términos)

- ❌ "alumno" / "estudiante" / "aprendiz" → "tú" o "{firstName}"
- ❌ "curso" / "lección" / "módulo" / "clase" → "caso"
- ❌ "graduado" / "certificado" → "completado" / "reporte"
- ❌ "ejercicio" / "tarea" → "caso" / "step"
- ❌ "puntaje" / "calificación" / "nota" → "banda" / "recomendación"

— claude · 2026-05-20 · dashboard empleado copy v1.0
