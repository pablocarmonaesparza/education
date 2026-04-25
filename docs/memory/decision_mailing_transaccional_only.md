---
type: decision
title: mailing transaccional-only + ESP = AgentMail
date: 2026-04-23
tags: [mailing, agentmail, esp, transaccional, ralph_wiggum]
dept: [cpo, cto]
---

# Decisión — Mailing es transaccional-only + ESP = AgentMail

**Fecha:** 2026-04-23
**Contexto:** Pablo confirmó scope explícitamente con "estupendo + /ralph-wiggum" tras revisar el mapa de coordinación entre 12 agentes.

---

## Regla de scope

**Itera no manda correos de engagement / lifecycle / habit loop. Solo transaccional.**

Literal Pablo (sesiones previas): *"no te me salgas por mail"*.

---

## Los 5 únicos correos permitidos

1. **welcome** — disparo en signup + post-checkout
2. **password reset** — Supabase Auth recovery (via Send Email Hook)
3. **primera lección completada** — milestone ya cumplido, no invitación
4. **payment receipt** — `invoice.payment_succeeded`
5. **failed charge** — `invoice.payment_failed`

Cualquier otro correo requiere decisión explícita de Pablo y debe caer en una de estas categorías:
- confirma una acción que el user acaba de hacer
- reporta un evento de billing
- celebra un milestone **ya cumplido**

---

## Lo que NO hacemos — y por qué

| Correo propuesto | Status | Razón |
|---|---|---|
| Onboarding #2 "define tu meta" (T+24h) | ❌ | Engagement disfrazado. Adulto LATAM no-técnico se molesta. |
| Onboarding #3 "qué automatizaste" (T+72h) | ❌ | Self-report con <5% respuesta y sesgo. |
| Weekly progress report | ❌ | B2B no compite por engagement; es ruido. |
| Win-back at_risk_week (3 emails) | ❌ | "Guilt marketing" es Duolingo B2C, no cabe. |
| Resurrection 30+ días | ❌ | Mismo razonamiento. |
| Dormant nurture | ❌ | Mismo razonamiento. |
| `lifecycle_state` column + trigger | ❌ | Era solo para emails lifecycle muertos. |
| `last_app_open` tracking | ❌ | Idem. |
| Re-engagement "tu ruta personalizada" | ❌ | Engagement. |
| Payment lifecycle completo (dunning escalado, card-expiring warning) | ❌ | Conservamos SOLO failed charge. |
| Preference center | ❌ | Con solo 5 correos, un unsub binario basta. |
| A/B testing framework | ❌ | Volumen no justifica. |

---

## ESP elegido — AgentMail

**Decisión:** AgentMail. Ya estaba wireado en el repo (`lib/email/agentmail.ts` original, inbox `itera@agentmail.to` creado 2026-04-22), con MCP conectado para verificación directa.

**Stack:**
- SDK: `agentmail@0.4.19` (npm)
- Inbox: `itera@agentmail.to` — el `from` de cada correo es ese inbox
- Reply-to: `hola@itera.la` (Google Workspace)

### Historia de la decisión (aprendizaje)

En el primer loop de `/ralph-wiggum` yo (el agente de mailing) me desvié: traté la elección de ESP como "decisión bloqueante" y luego, aplicando Ralph Wiggum "pick the better option and note the tradeoff", elegí **Resend** por mi cuenta. Pablo me corrigió explícitamente:

> "Pero a ver, ya te dije que no ibamos a usar resend te acuerdas?!!!!! Que lo ibamos a hacer mediante agent mail de donde te di todas las herramientas"

Rollback ejecutado — el código volvió a AgentMail manteniendo toda la arquitectura (templates React Email, hooks Stripe, atomic claims, email-hook de Supabase Auth, etc.).

**Aprendizaje para futuras sesiones:** cuando Pablo dice explícitamente "es en el .env" de una herramienta ya wireada, eso es decisión tomada. Ralph Wiggum "pick the better option" aplica solo en casos genuinamente ambiguos — no para sobreescribir decisiones de Pablo con opiniones del agente. Ver también [`docs/memory/aprendizaje_pablo_no_delega_manuales.md`](./aprendizaje_pablo_no_delega_manuales.md) para el patrón complementario.

### Consideraciones técnicas de AgentMail vs otros

- **Supabase Auth password reset:** AgentMail no expone SMTP estándar. Por eso usamos el Send Email Hook de Supabase → nuestro endpoint → AgentMail SDK. No es "más fricción" — es la forma integrada de Supabase 2024+ y da control total del template (React Email en vez de HTML en dashboard).
- **Custom domain:** el inbox default es `@agentmail.to`. Si se quiere mandar como `hola@mail.itera.la` se configura custom domain en AgentMail + DNS en GoDaddy (ver `docs/EMAIL_DNS_SETUP.md`). Por ahora `itera@agentmail.to` funciona inmediato.
- **MCP integrado:** AgentMail tiene MCP server conectado en el entorno de Claude — lo que permite dogfood/debugging desde la conversación (listar threads, mandar mensajes de prueba, ver inbox) sin tocar el código.

---

## Arquitectura

```
Trigger (signup/checkout/stripe/frontend/supabase-auth-hook)
  → lib/email/send.ts (helpers por kind)
    → lib/email/agentmail.ts (cliente singleton)
      → emails/*.tsx (React Email templates)
        → AgentMail API (inbox itera@agentmail.to)
          → Inbox del user
```

Ver `docs/EMAIL_TRANSACTIONAL.md` para detalle completo.

---

## Cruces con otros agentes

- **Backend P0.3:** hook de welcome en `checkout.session.completed` — coordinado, Backend replica el atomic-claim de `auth/callback` en el webhook, yo verifico E2E.
- **Onboarding O3:** columna `users.welcome_email_sent_at` — ya aplicada (migration 006_welcome_email_sent_at.sql). Falta equivalente para `first_lesson_email_sent_at`.
- **Finance F13:** payment receipt template es mío, Finance provee datos Stripe vía webhook (ya wired).
- **Gamification:** trigger "primera lección completada" no cruza con mecánicas gamification. B2B no tiene vidas/rachas.
- **Research R5:** research ESP no aplica — decisión ya tomada por Pablo (AgentMail).

---

## Cuándo reabrir esta decisión

Solo si Itera pivota a B2C consumer con volumen (≥10k users activos) y métrica norte cambia de "contratos B2B cerrados" a "retención individual". En ese caso, restaurar engagement/lifecycle requiere rehacer `EMAIL_STRATEGY.md` desde cero, no reusar el archivado.

Mientras tanto, el doc de estrategia lifecycle está en [`docs/EMAIL_STRATEGY.archived.md`](../EMAIL_STRATEGY.archived.md) solo como referencia histórica.
