---
type: aprendizaje
title: setup whatsapp business api desde mexico — checklist completo 2026
date: 2026-04-28
tags: [whatsapp, mexico, lfpdppp, waba, cloud_api, costos, templates]
dept: [cto, cfo]
---

# Setup WhatsApp Business API desde México — Research Completo 2026

> Research consolidado de 2 deep_research perplexity + verificación de docs Meta. Para retomar la implementación con datos correctos sin re-investigar.

## Cloud API Directo de Meta — sin BSP

**No se necesita Twilio, Wati, 360dialog ni ningún BSP intermediario.** Meta provee Cloud API directo, hosted, con setup gratis en 15 minutos.

### Test number (sandbox) — arrancable HOY

1. Crear app tipo "business" en developers.facebook.com (cuenta personal sirve)
2. Agregar producto "WhatsApp"
3. Meta auto-provisiona:
   - Test phone number (free)
   - WABA ID
   - Access token temporal (24h, después se reemplaza por system user token permanente)
4. Whitelist 5 números de prueba (Pablo + 4 testers internos)
5. Mandar mensajes via REST `POST /v18.0/{phone_number_id}/messages`

**Limitaciones del test number**:
- Max 5 recipients whitelisted
- Sin templates aprobados
- Sin business-initiated outside 24h window
- "From WhatsApp Business" como display name (no custom)
- Bajo throughput (dev only)
- No es para producción real con users desconocidos

**Útil para**: dogfooding Pablo + equipo + iteración de código + testing pedagógico mientras se procesa el papeleo de WABA real.

### Producción real — requisitos

Para mandar el cron diario a >5 users que no son tu equipo, necesitas:

1. **Business verification** en Meta Business Manager (1-3 días si docs OK)
2. **Número celular dedicado** registrado en CRT con tu operadora (5-10 días)
3. **Display name** aprobado (24-48h)
4. **Templates utility** aprobados (1-24h cada uno)
5. **Meta phone number** ID asignado (instant tras verification)

Cuando todo esté listo, el switch del sandbox a producción es **literalmente cambiar `phone_number_id` y `access_token` en supabase secrets**. Mismo código, mismo schema.

## Documentos México requeridos

### Bloque fiscal
- [ ] **RFC** activo (persona moral o física actividad empresarial)
- [ ] **Constancia de Situación Fiscal (CSF)** descargada del SAT
- [ ] **Acta constitutiva** notarizada (si persona moral)
- [ ] **Comprobante de domicilio** reciente (max 3 meses)
- [ ] **INE/pasaporte** del representante legal

### Bloque dominio + presencia
- [ ] **Footer de itera.la** con razón social + RFC + domicilio fiscal completo (Meta cross-checkea)
- [ ] **Aviso de privacidad** en español, separado, accesible — debe cubrir LFPDPPP 2025
- [ ] **Mecanismo ARCO** funcional (acceso/rectificación/cancelación/oposición)

### Bloque telefónico (gotcha 2026)
- [ ] **Número celular dedicado** para WABA (no usar el personal — luego no podrás usar WhatsApp app normal en él)
- [ ] **Registro CRT** del número con la operadora (telcel/movistar/AT&T) bajo el mandato CRT vigente desde enero 2026

## LFPDPPP 2025 — compliance crítico

Ley reformada marzo 2025. Multas hasta MXN ~1M+ por incumplimiento.

Requisitos para itera:

1. **Opt-in explícito y separado por canal**: casilla específica "acepto recibir lecciones por WhatsApp" — distinta de términos generales
2. **Aviso de privacidad debe nombrar a Meta** como tercero que procesa los datos (Cloud API hosting)
3. **Derechos ARCO accesibles** desde perfil del user (extender el flow de `/api/telegram-link DELETE` actual)
4. **Retención clara**: cuánto tiempo se guarda el número y los `slides_completed` antes de borrar
5. **Sensitive data**: si se incluye contenido de salud o emocional, requiere protecciones reforzadas

Costo estimado abogado mexicano LFPDPPP: **$200-400 USD** one-time para review del aviso. **No te metas tú, contrata.**

## Costos 2026 — pricing per-template-delivered desde abril 2026

Meta cambió el modelo desde abril 2026: cada template message delivered cuenta como billing event individual (antes era per-conversation).

| destination | utility | marketing | authentication |
|---|---|---|---|
| México | $0.0098 | $0.0351 | $0.0033 |
| Colombia | $0.0144 | $0.0207 | $0.0070 |
| Brasil | $0.0294 | $0.0294 | $0.0035 |
| Resto LATAM | ~$0.013 | ~$0.025 | ~$0.005 |

**Free-form messages dentro de 24h customer service window**: gratis (no son templates). Solo se paga por templates outbound + cualquier marketing template.

### Costos para itera B2B-first (target México)

Asumiendo daily lesson como template utility:

| user count | mensajes utility/mes | costo $/mes |
|---|---|---|
| 100 | 3,000 | **$29** |
| 1,000 | 30,000 | **$294** |
| 5,000 | 150,000 | **$1,470** |
| 10,000 | 300,000 | **$2,940** |

= **~$0.29 USD/user/mes** asumiendo 100% daily delivery.

Con smart pausing realista (pausar inactivos 8-14 días, dormant 15-30, deep-dormant >30): **~$0.16 USD/user/mes promedio ponderado** = ~$3 MXN.

## Constraints técnicos WhatsApp interactive messages

### Reply Buttons (max 3 botones)
- Max **3 buttons**, label **20 chars** cada uno
- Body 1024 chars, header 60, footer 60
- Header puede ser texto, imagen, video, documento
- Uso en itera: mcq ≤3 opciones, true-false (2 buttons)

### List Messages (max 10 rows)
- Max **10 rows** organizadas en max **10 sections**
- Row title **24 chars**, descripción **72 chars**
- Body 4096 chars
- Uso en itera: mcq 4-10 opciones, multi-select simple

### WhatsApp Flows (UI rica, multi-screen)
- Forms con componentes (text input, dropdown, checkbox, navigation)
- Branching conditional posible
- **Requiere aprobación Meta ~3-7 días** por Flow
- Round-trip server <500ms recomendado, <2s tolerable
- Uso en itera: tap-match, order-steps, multi-select complejo

### Templates (cron diario fuera de 24h window)
- Body con variables `{{1}}`, `{{2}}` para personalización
- Header opcional (texto/imagen/video/documento)
- Footer opcional
- Max **4 quick-reply buttons** o 2 CTA buttons
- Categorías: Authentication, Marketing, Utility, Service
- **Daily lesson cron debe ser categoría utility** (transactional, no promocional)

### 24h customer service window
- Se abre cuando el user manda mensaje al bot (incluyendo tap a un button con callback)
- Dentro de la ventana: mensajes free-form gratis (no templates)
- Fuera de la ventana: solo templates aprobados, costo per-delivered
- Cada template message reabre la ventana al ser tapeado por el user

## Migración Telegram → WhatsApp — el plan paralelo

Meta + papeleo se procesa en background (4-8 semanas). Mientras tanto se construye:

### Track técnico (paralelo al papeleo)

1. **Migration SQL**: tablas `whatsapp_links`, `whatsapp_sessions`, `whatsapp_daily_sends` + columnas `slides.content_wa`, `slides.kind_wa`, `lectures.wa_ready`
2. **METODOLOGIA.md**: nueva sección "contrato pedagógico WhatsApp" con caps específicos
3. **Linter slides**: extender para validar contrato WA cuando `content_wa is not null`
4. **AI adapter**: prompt que convierte `slides.content` → `slides.content_wa` respetando caps WA. Iterar contra los 1000 slides actuales sin tocar WA.
5. **Edge function `whatsapp-bot`**: clon de `telegram-bot/index.ts`, distinto render layer:
   - `sendMessage` → `POST /v18.0/{phone_number_id}/messages`
   - `editMessageText` → ya no existe (todo es mensaje nuevo)
   - inline_keyboard → `interactive: { type: "button" | "list" }`
   - callback_query → webhook con `messages[0].interactive.button_reply.id`
6. **`wa-debug`**: clon mental de `tg-debug` con acciones `info`, `setwebhook`, `replay`, `open_window`, `send`
7. **`whatsapp_events`**: tabla para loguear inbound + outbound (debugging crítico en piloto)

### Mapping kinds → WA primitives

| kind itera | render WA | nota |
|---|---|---|
| concept | text body (1024) + header media opcional | imagen para conceptos visuales |
| celebration | text body + emoji | sin botones |
| true-false | reply buttons (2 botones) | trivial |
| mcq ≤3 opts | reply buttons | natural |
| mcq 4 opts | list message (1 sección, 4 rows) | OK |
| fill-blank | text body + reply buttons con candidatos | downgrade a MCQ implícito |
| multi-select ≤5 | list message + lógica re-render por toggle | v1 |
| multi-select cualquiera | WhatsApp Flow | v2 cuando aprueben Flow |
| order-steps | WhatsApp Flow | obligatorio (sin equivalente nativo) |
| tap-match | WhatsApp Flow | obligatorio |
| code-completion | render como concept | no hay equivalente nativo |
| build-prompt | render como concept | idem |

## Pipeline operacional steady state

```
contenido nuevo → AI adapt (content → content_wa) → linter PASS → eval pedagógico PASS → wa_ready=true → elegible cron WA
```

Métricas a vigilar (en orden de importancia):

1. **delivery rate** por operadora MX (telcel/movistar/AT&T) — meta >97%
2. **completion rate por lecture** (slides_completed/10) — meta inicial 60%
3. **drop-off slide-by-slide** — corregir slides culpables
4. **24h window expiry rate** — si >40% es señal de mal timing del cron
5. **costo $/user/mes** — debe converger ~$0.29 USD
6. **NPS / satisfacción** preguntado dentro del bot cada 7 días

## Recursos para retomar

- Sesión 2026-04-28 con research deep en perplexity:
  - "WhatsApp Business API setup and documentation requirements for a Mexican EdTech company in 2026"
  - "WhatsApp Cloud API 2026 interactive messages complete reference for educational micro-learning bot"
- Decisión maestra: [decision_pivot_whatsapp_canal_real.md](decision_pivot_whatsapp_canal_real.md)
- Telegram (sandbox actual): [experimento_telegram_canal_lecciones.md](experimento_telegram_canal_lecciones.md)
