# System states copy — 404 / 500 / loading / empty / maintenance / pending

> Cubre estados intermedios que el usuario puede encontrar.
> Patrón global: icon + heading + body + next-step CTA.

## `/not-found` (404 — Next.js `app/not-found.tsx`)

**Layout:** PublicShell o standalone (sin sidebar).

**Icon:** AppleIcon `MapPinOff` o `Search` con muted color.

**Eyebrow:** ESTA PÁGINA NO EXISTE

**H1 (display-tight):** No encontramos lo que buscas.

**Body (text-lg muted):**
El link puede estar mal escrito o la página fue movida. Aquí algunos lugares útiles:

**Lista de links:**
- Volver al inicio → /
- Probar el demo → /field-test/marketing-urgent-campaign-pii
- Iniciar sesión → /auth/login

**Caption muted:**
¿Encontraste un link roto? Escríbenos a hola@itera.la.

---

## `/error` (500 — Next.js `app/error.tsx` global error boundary)

**Layout:** standalone (sin chrome para evitar más errores).

**Icon:** AppleIcon `AlertOctagon` color destructive.

**Eyebrow:** ALGO NO FUNCIONÓ

**H1:** No pudimos cargar esta página.

**Body:**
Tuvimos un problema técnico al procesar tu solicitud. Nuestro equipo ya está enterado y trabajando para resolverlo.

**Si dev mode:** Show error details collapsible (stack trace).

**CTAs:**
- Reintentar (primary) — onClick={() => window.location.reload()}
- Volver al inicio → /

**Caption muted:**
Si persiste, escríbenos a soporte@itera.la con el código `{errorDigest}` y te ayudamos.

---

## `/maintenance` (manual mode — solo en deploy windows críticos)

**Layout:** standalone full-screen.

**Icon:** `AppleIcon name="settings"` (o agregar `IconTool` al wrapper si se prefiere una llave).

**Eyebrow:** EN MANTENIMIENTO

**H1:** Volvemos pronto.

**Body:**
Estamos haciendo una actualización rápida del simulador. Esto toma {estimatedMinutes} minutos máximo.

**Detalles (caption muted):**
- Inicio: {startTimeISO}
- Vuelta estimada: {endTimeISO}
- Razón (opcional): {reason}

**CTA:** Refrescar página (link a `/`)

**Caption:**
¿Urgente? Escríbenos a hola@itera.la.

---

## Loading global (cuando no hay surface específica)

**Layout:** centered con AppleSkeleton.

**Header skeleton:** placeholder line wide
**Content skeleton:** 3-4 cards placeholder

(No texto explícito "Cargando…" — el skeleton ya comunica. Caption discreta debajo si tarda >2s.)

**Si tarda >5s:**
**Caption muted appears:** "Cargando contenido…"

**Si tarda >15s:**
**Caption inline:** "Esto está tardando más de lo normal. Si no carga en 30s, recarga la página."

---

## Empty states por surface (referencia rápida)

### Dashboard manager sin team
**H2:** Aún no invitaste a nadie.
**Body:** Vuelve al onboarding y completa el step de invitar a tu equipo.
**CTA:** Invitar a mi equipo → /onboarding/invite

### Dashboard manager con team pero sin sesiones
**H2:** Esperando a tu equipo.
**Body:** Enviamos {N} invitaciones. Nadie las aceptó todavía.
**CTA:** Reenviar invitaciones (calls /api/orgs/.../invitations/resend)

### Dashboard manager con sesiones in_progress (sin completed)
**H2:** {N} personas empezaron.
**Body:** Cuando completen, verás resultados aquí. Esto típicamente toma 18-30 minutos por persona.

### Dashboard empleado sin caso asignado
**H2:** Aún no tienes caso asignado.
**Body:** Cuando {buyerName} te asigne uno, aparecerá aquí. ¿Te invitaron por error? Escríbenos a hola@itera.la.

### Admin queue vacía
**H2:** Sin reportes en revisión.
**Body:** Cuando un risk event high requiera validación humana, aparecerá aquí.

### Admin leads vacíos
**H2:** Aún no hay leads.
**Body:** Cuando alguien complete el demo público y deje email, aparecerá aquí.

### Admin orgs vacías (solo en setup inicial)
**H2:** Aún no hay organizaciones.
**Body:** Esto significa que ningún cliente terminó onboarding todavía. Verifica que Stripe y AgentMail estén funcionando.

### Report sin data (sesión recién enviada)
**H2:** Tu reporte se está generando.
**Body:** Esto toma 30-60 segundos. Polling cada 4s.

### Search results vacíos
**H2:** Sin resultados.
**Body:** Intenta con otros términos o quita los filtros.

---

## Pending review state (Report)

**Layout:** Report page con banner pending.

**Banner amber border-l-4:**

**Eyebrow:** EN REVISIÓN HUMANA

**H1:** Tu reporte está en revisión.

**Body:**
Detectamos {N} eventos de riesgo alto que requieren validación de nuestro equipo. Recibirás email cuando el reporte esté listo (24h max).

**Sub muted:**
Esto pasa cuando el judge identifica algo crítico que necesita ojo humano antes de mostrarse al manager.

**Mostrar (en pending):**
- Header del reporte (sin score)
- Disclaimer
- Caption "Tu sesión se procesó correctamente. Estamos validando el output del judge."

**NO mostrar (oculto hasta published):**
- Bandas por dimensión
- Risk events detail
- Recomendación
- Plan 7 días
- Botón "Descargar PDF" o "Compartir"

---

## Loading + saving indicators

### Save indicator (Runtime, Onboarding)
- **Idle:** invisible
- **Saving:** dot amber + tooltip "Guardando…"
- **Saved:** dot verde fade-in 1s + caption "guardado" + auto-fade-out
- **Failed:** dot rojo + toast destructive "No se pudo guardar. Reintenta."

### Button loading (cualquier acción)
- Spinner inline en button (HeroUI `isLoading={true}`)
- Caption replace del button label: "Enviando…" / "Guardando…" / "Cargando…"
- Disabled durante loading

### Page transition (durante navigation)
- NextJS `loading.tsx` per route con skeleton matching layout
- NO spinner full-page (Apple HIG prefiere skeleton)

---

## Toast patterns

| Tipo | Cuándo | Duration | Position | Color |
|---|---|---|---|---|
| Success | Save, send, copy | 4s auto-dismiss | top-right desktop, top-full mobile | --accent o --success |
| Info | Status update, notification | 5s auto-dismiss | top-right | --accent |
| Warning | Atención no-blocker | 8s auto-dismiss | top-right | --warning amber |
| Destructive | Error que requiere acción | 10s manual-dismiss | top-right | --destructive |

**Stack max 3 visible.** Older drops.

---

## Confirmation modals

### Pattern destructive

**Modal centered max-w-md:**

**Title:** "{Verbo} {objeto}"
- "Eliminar reporte"
- "Cancelar suscripción"
- "Revocar link compartible"

**Body (text-base):** Explicar consecuencia, no solo confirmar.
- "Esta acción no se puede deshacer."
- "Tu equipo perderá acceso al dashboard a partir de {periodEnd}."
- "El link dejará de funcionar inmediatamente."

**CTAs:**
- Cancelar (ghost, default focus) — NO responde a Enter
- "{Verbo destructivo}" (destructive) — responde solo a click explícito

### Pattern non-destructive

**Modal:** mismo layout, CTAs primary + ghost. Primary RESPONDE a Enter.

---

## Network states

### Offline
**Banner sticky top:**
"Sin conexión. Algunos cambios pueden no guardarse hasta que recuperes internet."

**Caption muted en save indicator:**
"Esperando conexión…"

### Slow connection (>3s sin respuesta API)
**Caption inline en action:**
"Tomando más de lo normal…"

### Reconnected
**Toast info 3s:**
"Conexión restaurada. Sincronizando."

---

## Accessibility text alternatives

Para todos los icons sin label visible:

| Icon | aria-label |
|---|---|
| MapPinOff (404) | "Página no encontrada" |
| AlertOctagon (500) | "Error del servidor" |
| Wrench (maintenance) | "En mantenimiento" |
| Search empty | "Sin resultados" |
| Inbox empty | "Bandeja vacía" |
| Clock pending | "En espera" |
| Mic recording | "Grabando audio" |
| X close | "Cerrar" |
| Check success | "Completado" |
| AlertCircle warning | "Advertencia" |

— claude · 2026-05-20 · system states copy v1.0
