---
type: decision
title: mailing itera — scope transaccional-only, sin engagement emails
date: 2026-04-22
tags: [mailing, emails, b2b, scope, lifecycle]
dept: [cpo, cto]
---

El scope de Mailing para Itera es **transaccional-only**. Todos los emails de engagement / lifecycle / nurture están descartados. Esta decisión es la aplicación concreta del pivote B2B empresa-first + el descarte explícito de mecánicas B2C de Duolingo (ver `decision_gamification_duolingo_b2b.md` y `gotcha_posicionamiento_empresa_vs_latam.md`).

**Emails que sí van:**
- **Welcome** — trigger: signup (hook ya existe en `app/auth/callback/route.ts:114-121`) + `checkout.session.completed` (hook nuevo pendiente). Ver `gotcha_welcome_email_hook_signup_existe.md`.
- **Password reset** — trigger: Supabase Auth request.
- **Payment receipt** — trigger: `invoice.payment_succeeded`, datos de Stripe. Dueño de template: Mailing. Finance provee data.
- **"Primera lección completada"** — celebración milestone única, no reminder recurrente.

**Emails que NO van:**
- Onboarding #2 (T+24h "define tu meta")
- Onboarding #3 (T+72h "ejecución real")
- Weekly progress report (viernes)
- Win-back `at_risk_week` (3 emails)
- Resurrection (30+ días)
- Re-engagement "tu ruta personalizada sigue aquí"
- Payment lifecycle completo (dunning, tarjeta expirando) — **excepción: email único de failed charge permitido, no serie de 3**.
- Preference center (sin engagement, nada que preferenciar)
- A/B testing framework para emails
- Columna `lifecycle_state` + trigger en `user_progress` (era para cron-emails descartados)
- Columna `last_app_open` + event tracking dirigido a emails
- Job scheduler (n8n, Vercel Cron, Supabase Edge Function cron) para emails

**Consecuencias operativas:**
- `docs/EMAIL_STRATEGY.md` hay que **tirar y reescribir** con scope transaccional-only. No aplicar correcciones parciales sobre el doc viejo.
- Research R5 (ESP comparativo) ya no aplica — decisión de Pablo fue **AgentMail queda** (ya estaba wireado en el repo + MCP disponible). El research histórico en `docs/research/R05_esp_transaccional.md` es referencia, no acción.
- Research R9 (open rate edtech LATAM benchmarks) muere — era para email lifecycle.
- Gamification no necesita coordinar con Mailing para triggers compuestos en `user_progress` — el trigger 006 queda sin competidor.
- **ESP final: AgentMail** (SDK `agentmail@0.4.19`, inbox `itera@agentmail.to`). Ver `decision_mailing_transaccional_only.md` para el storytelling completo de la decisión.

**Por qué:** literal de Pablo en sesión anterior: *"no te me salgas por mail"*. Itera es B2B empresa — la retención viene del contrato con la empresa, no de hooks virales al individuo. Email reminders, win-backs y re-engagement son mecánicas B2C de engagement adictivo que no aplican al empleado corporativo.

**Cuándo aplicar:**
- Antes de proponer cualquier secuencia de emails, drip, lifecycle flow o nurture en Itera: leer esta memoria. Si lo que propones no está en la lista "sí van", no va.
- Al auditar `lib/email/`, `emails/`, `app/api/email/`: cualquier template que no sea uno de los 4 transaccionales listados es candidato a borrar.
- Si Mailing propone retomar una pieza descartada con justificación nueva, requiere confirmación explícita de Pablo antes de ejecutar.
- El espíritu (no hostigar al empleado corporativo con reminders virales) aplica universalmente — también a Telegram, WhatsApp, push. Pero cada canal tiene su propia decisión; esta memoria es específica de email.
