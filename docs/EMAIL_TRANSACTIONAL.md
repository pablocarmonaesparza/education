# Itera — correo transaccional

> **Scope:** B2B transaccional-only. Sin engagement, sin lifecycle, sin weekly report, sin win-back.
> Si alguien propone reintroducir esas piezas, leer primero [`docs/memory/decision_mailing_transaccional_only.md`](./memory/decision_mailing_transaccional_only.md).
>
> La estrategia de engagement histórica está archivada en [`docs/EMAIL_STRATEGY.archived.md`](./EMAIL_STRATEGY.archived.md) como referencia, no como plan.

---

## 1. Los cinco correos

| Correo | Trigger | Canal de disparo | Template |
|---|---|---|---|
| **welcome** | signup (auth/callback) + opcionalmente post-checkout | `lib/email/send.ts::sendWelcome` | `emails/WelcomeEmail.tsx` |
| **password reset** | Supabase Auth (recovery) | `app/api/auth/email-hook/route.ts` | `emails/PasswordResetEmail.tsx` |
| **primera lección completada** | frontend llama `/api/email/first-lesson` al cerrar la primera lección | `lib/email/send.ts::sendFirstLesson` | `emails/FirstLessonEmail.tsx` |
| **payment receipt** | Stripe webhook `invoice.payment_succeeded` | `app/api/stripe-webhook/route.ts` (inline) | `emails/PaymentReceiptEmail.tsx` |
| **failed charge** | Stripe webhook `invoice.payment_failed` | `app/api/stripe-webhook/route.ts` (inline) | `emails/FailedChargeEmail.tsx` |

No hay más. Cualquier correo nuevo requiere decisión explícita del founder y debe caer en una de estas categorías:
- confirma una acción que el user acaba de hacer
- reporta un evento de billing
- celebra un milestone **ya cumplido** (no una invitación a cumplirlo)

---

## 2. Stack técnico

```
                 ┌────────────────────┐
                 │  AgentMail (ESP)   │
                 │  api.agentmail.to  │
                 │  inbox:            │
                 │  itera@agentmail.to│
                 └─────────▲──────────┘
                           │
                           │ REST API
                           │ (SDK: agentmail)
                           │
         ┌─────────────────┴────────────────────┐
         │                                       │
   ┌─────▼────────┐                    ┌────────▼─────────┐
   │ lib/email/   │                    │ Supabase Auth    │
   │   send.ts    │                    │                  │
   │   agentmail  │                    │ Send-Email Hook  │
   │   .ts        │                    │ → /api/auth/     │
   │              │                    │   email-hook     │
   │ Callers:     │                    │                  │
   │  • auth/cb   │                    │ (AgentMail NO    │
   │  • stripe-wh │                    │ expone SMTP —    │
   │  • /api/*    │                    │ hook es la ruta) │
   └──────────────┘                    └──────────────────┘
        │
        ▼
   ┌────────────────────────┐
   │ emails/*.tsx           │
   │ React Email templates  │
   │ + _shared.tsx layout   │
   │ + AuthActionEmail.tsx  │
   └────────────────────────┘
```

- **ESP:** AgentMail (`agentmail@0.4.19` SDK). Razones + historia en [`docs/memory/decision_mailing_transaccional_only.md`](./memory/decision_mailing_transaccional_only.md).
- **Inbox actual:** `itera@agentmail.to` (creado 2026-04-22). El `from` de cada correo es ese inbox.
- **Reply-to:** `hola@itera.la` → Google Workspace humano (configurable via `AGENTMAIL_REPLY_TO`).
- **Render:** `@react-email/components` + `@react-email/render`. Todos los templates usan `emails/_shared.tsx` para chrome/colores consistentes.
- **Preview local:** `npm run email:preview` → http://localhost:3030 (no manda correos, solo renderiza).

**Nota sobre Supabase Auth:** AgentMail no expone SMTP estándar, solo su API REST. Por eso los correos de Auth (password reset, signup confirm, magic link, email change) se interceptan con el **Send Email Hook** de Supabase (`/api/auth/email-hook`) que renderiza los templates y los manda via AgentMail. No hay "opción SMTP custom" como con otros ESPs.

---

## 3. Variables de entorno

Ver `.env.local.example` para el detalle. Mínimo viable:

```bash
AGENTMAIL_API_KEY=                                # Obligatorio
AGENTMAIL_INBOX_ID=itera@agentmail.to             # Default del repo
AGENTMAIL_REPLY_TO=hola@itera.la                  # Default si no se setea
SUPABASE_AUTH_HOOK_SECRET=                        # Solo para password reset / auth emails
```

Sin `AGENTMAIL_API_KEY` o `AGENTMAIL_INBOX_ID`, los helpers loguean warn y devuelven `{ ok: false, reason: 'not_configured' }`. Nunca lanzan.

---

## 4. Supabase Auth — via Send Email Hook

AgentMail no expone SMTP → la única ruta es interceptar los correos con el hook:

1. Supabase Dashboard → Authentication → Hooks → **Send Email Hook** → Enable.
2. URL: `https://itera.la/api/auth/email-hook`
3. Secret: dejar que Supabase lo genere (formato `v1,whsec_<base64>`) y guardar en `SUPABASE_AUTH_HOOK_SECRET`.
4. Supabase delega cada correo de auth a tu endpoint, que:
   - Verifica firma Standard Webhooks (HMAC sha256, timestamp ±5min).
   - Renderiza el template React Email correcto según `email_action_type`.
   - Manda via AgentMail SDK.

Action types soportados:
- `recovery` → `PasswordResetEmail`
- `signup` → `AuthActionEmail` (variant `signup`)
- `magiclink` → `AuthActionEmail` (variant `magiclink`)
- `email_change` → `AuthActionEmail` (variant `email_change`)
- `invite` → skip (manejar manualmente si hace falta)

**Si el hook NO está habilitado**, Supabase manda con su template default y SMTP default — los correos llegarán pero con branding genérico.

---

## 5. Hooks en el código

### Signup (wired)
[`app/auth/callback/route.ts`](../app/auth/callback/route.ts) — atomic claim sobre `users.welcome_email_sent_at IS NULL` + rollback si el envío falla. Race-safe frente a callbacks concurrentes.

### Post-checkout (pendiente — coordinar con Backend P0.3 + Onboarding O3)
El welcome también debería dispararse cuando un user completa checkout de Stripe sin haber sido signup previo (caso: invitación B2B directa a URL de pago). Backend añadir en `checkout.session.completed`:
```ts
// Mismo patrón que auth/callback: atomic claim + rollback
const { data: claimed } = await supabase
  .from('users')
  .update({ welcome_email_sent_at: now })
  .eq('id', userId)
  .is('welcome_email_sent_at', null)
  .select('id')
  .maybeSingle();
if (claimed) await sendWelcome({...});
```

### Primera lección (wired)
[`app/api/email/first-lesson/route.ts`](../app/api/email/first-lesson/route.ts). Frontend llama `POST` con `{ lessonTitle, nextLessonUrl, nextLessonTitle? }`. Atomic claim sobre `users.first_lesson_email_sent_at IS NULL`. **Requiere migration** para añadir la columna (aún pendiente — por ahora cae a send sin guard).

### Stripe receipts (wired)
[`app/api/stripe-webhook/route.ts`](../app/api/stripe-webhook/route.ts):
- `invoice.payment_succeeded` → `sendPaymentReceipt` (await; idempotencia via `markEventProcessed` dedup table).
- `invoice.payment_failed` → `sendFailedCharge` en cada attempt fallido.

---

## 6. Testing

### Preview de templates (sin mandar correos)
```bash
npm run email:preview
# → http://localhost:3030 — navega los 6 templates con data mock
```

### E2E via MCP AgentMail (desde el agente de mailing)
Desde Claude con MCP AgentMail conectado:
```
mcp__agentmail__send_message(inboxId="itera@agentmail.to", to=["destino@test.com"], subject="...", html="...", text="...")
```
Útil para dogfood rápido sin tocar el endpoint HTTP.

### E2E via endpoint HTTP
```bash
# Welcome — requiere sesión
curl -X POST http://localhost:3000/api/email/welcome \
  -H "Cookie: <sb-session-cookie>"

# Primera lección
curl -X POST http://localhost:3000/api/email/first-lesson \
  -H "Cookie: <sb-session-cookie>" \
  -H "Content-Type: application/json" \
  -d '{"lessonTitle":"fundamentos de ia","nextLessonUrl":"https://itera.la/lesson/2"}'
```

### Stripe webhooks
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
# En otra terminal:
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

Verificar en AgentMail dashboard → inbox `itera@agentmail.to` → Sent que el correo salió con la etiqueta `kind:payment_receipt` o `failed_charge`.

### Deliverability
- [mail-tester.com](https://mail-tester.com): correr después de configurar custom domain en AgentMail (si aplica). Ver [`EMAIL_DNS_SETUP.md`](./EMAIL_DNS_SETUP.md).

---

## 7. Tono y copy

Heredado del contrato pedagógico (`docs/METODOLOGIA.md`):
- Minúsculas en subjects y headings (salvo nombres propios).
- Lenguaje adulto, directo, sin jerga.
- Moneda siempre USD; si el banco del user aplica conversión, se menciona en el receipt.
- Sin emojis al inicio del subject (rompen alineación en clientes de correo).
- Sin urgencia falsa, sin "trucos", sin "últimas oportunidades".
- Cada correo tiene UNA sola acción principal (un botón).

---

## 8. Lo que NO hacemos — y por qué

Ver [`docs/memory/decision_mailing_transaccional_only.md`](./memory/decision_mailing_transaccional_only.md) para el razonamiento completo.

Descartado explícitamente:
- Onboarding sequences ("define tu meta", "qué automatizaste")
- Weekly progress report
- Win-back at-risk / resurrection / dormant
- Lifecycle state computation
- Event tracking de `last_app_open`
- Re-engagement de ruta personalizada
- Payment lifecycle completo (conservamos solo failed charge; no dunning escalado)
- Preference center

La regla: si Itera pivota a B2C consumer con volumen, reabrimos esta lista. Hoy, B2B empresa-first, todo esto es ruido.
