# [ARCHIVADO — DECISIÓN REVERTIDA] R5 — ESP para email transaccional

> ⚠️ **Este research recomendó migrar a Resend. Pablo revirtió la decisión el 2026-04-23.**
> **ESP final: AgentMail** (ya wireado + MCP disponible). Ver
> [`docs/memory/decision_mailing_transaccional_only.md`](../memory/decision_mailing_transaccional_only.md).
>
> Conservado **solo como referencia histórica del análisis comparativo** — las
> secciones de setup/migración no aplican, el stack vigente es AgentMail.

---

# R5 — ESP para email transaccional

> Decisión: AgentMail vs Resend vs Loops vs Postmark para email transaccional de Itera.
>
> **Scope reducido:** Pablo descartó emails de engagement/lifecycle. Solo necesitamos transaccional puro (welcome, password reset, payment receipt, primera lección completada como milestone, payment failure).

---

## 1. TL;DR — recomendación

**Migrar de AgentMail a Resend.** Setup: ~30 minutos. Costo año 1: $0-20/mes.

Razones:
1. **DX nativa Next.js** — Resend está construido alrededor de React Email. Templates en JSX, preview local con `npx react-email dev`. AgentMail no tiene equivalente.
2. **Free tier de 3,000 emails/mes** cubre todo el período de validación M0-M9.
3. **Costo bajísimo a escala B2B** — incluso a 50k emails/mes son $20/mes.
4. **DKIM/SPF/DMARC managed** — setup vía Vercel domain o registrador del dominio en una sentada.
5. **AgentMail no aporta nada** que justifique seguir con él para transaccional puro. Se justificaría si fuéramos a hacer lifecycle multi-channel — descartado por Pablo.

**Plan B:** Postmark si en algún momento priorizamos compliance enterprise sobre DX (45 días de log retention vs 3 días en Resend).

---

## 2. Comparativa rápida

| ESP | DX Next.js | Free tier | Precio 50k emails/mes | Log retention | Mejor para |
|---|---|---|---|---|---|
| **Resend** ✅ | Excelente (React Email nativo) | 3k/mes | $20 | 3 días | Startups con stack Next.js |
| Postmark | Buena | 100/mes | $50 | 45 días | Compliance enterprise |
| Loops | Buena | Limitado | $49 (modelo subscriber) | N/A | Lifecycle marketing (no aplica) |
| AgentMail | Media | No claro | No publicado | N/A | Casos específicos AI workflows |

Fuentes: [nuntly.com/versus/resend-vs-postmark](https://nuntly.com/versus/resend-vs-postmark), [sequenzy.com/versus/resend-vs-loops](https://www.sequenzy.com/versus/resend-vs-loops), [postmarkapp.com/compare/resend-alternative](https://postmarkapp.com/compare/resend-alternative).

---

## 3. Por qué Resend

### Modelo de precio
- $0/mes hasta 3,000 emails
- $20/mes hasta 50,000
- $90/mes hasta 100,000
- $350/mes hasta 500,000

A volumen Itera año 1 (estimado 5-10k emails/mes con 500-2000 users transaccionales): **$0-20/mes**.

### Stack technical fit
- React Email components escritos en JSX/TSX.
- `npx react-email dev` para preview local sin enviar correos.
- SDK oficial Node + edge-compatible (corre en Vercel Edge functions).
- Webhooks para `delivered` / `bounced` / `complained` listos para conectar a PostHog (R15).

### Lo que pierdes vs Postmark
- Log retention de solo 3 días (Postmark da 45). Para debugging de bounces históricos puede ser limitante.
- Postmark tiene track record de 16 años; Resend tiene ~3.

**Para Itera año 1 esto no importa.** Si en M12 hay problema de deliverability institucional, evaluar migración a Postmark.

---

## 4. Setup mínimo (lo que hay que hacer)

### Paso 1 — DNS de `itera.la` (crítico, Mailing M3)

Registros que hay que añadir:

```
SPF (TXT en raíz):
v=spf1 include:_spf.resend.com ~all

DKIM (CNAME, Resend te da los valores específicos):
resend._domainkey.itera.la → resend._domainkey.<resend-id>.com

DMARC (TXT en _dmarc):
v=DMARC1; p=quarantine; rua=mailto:dmarc@itera.la
```

Tiempo: ~15-30 min con acceso al registrador o Vercel DNS.

### Paso 2 — código

```bash
npm install resend @react-email/components
```

```typescript
// lib/email/client.ts
import { Resend } from 'resend'
export const resend = new Resend(process.env.RESEND_API_KEY)
```

```typescript
// emails/welcome.tsx (React Email template)
import { Html, Head, Body, Container, Text, Button } from '@react-email/components'

export default function Welcome({ firstName }: { firstName: string }) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>bienvenido a itera, {firstName}.</Text>
          <Button href="https://itera.la/dashboard">comienza tu primera lección</Button>
        </Container>
      </Body>
    </Html>
  )
}
```

```typescript
// app/api/email/welcome/route.ts (o desde server action)
import { resend } from '@/lib/email/client'
import Welcome from '@/emails/welcome'

await resend.emails.send({
  from: 'itera <hola@itera.la>',
  to: user.email,
  subject: 'bienvenido a itera',
  react: <Welcome firstName={user.first_name} />,
})
```

### Paso 3 — webhooks

Endpoint en `app/api/webhooks/resend/route.ts` que recibe `delivered`, `bounced`, `complained` y los manda a PostHog (R15) como eventos `email_delivered`, `email_bounced`, `email_complained`.

---

## 5. Templates a construir (transaccional puro)

Lista mínima viable, todos en React Email:

| Template | Trigger | Owner |
|---|---|---|
| `welcome.tsx` | Sign-up completado + checkout completado (idempotencia con `users.welcome_email_sent_at`) | Mailing F1 |
| `password-reset.tsx` | Wired a Supabase Auth password reset flow | Mailing |
| `payment-receipt.tsx` | Stripe `invoice.payment_succeeded` webhook | Finance F13 + Mailing |
| `payment-failed.tsx` | Stripe `invoice.payment_failed` webhook | Finance + Mailing |
| `lesson-milestone.tsx` | Primera lección completada (celebración) | Mailing |
| `b2b-seat-invite.tsx` | Cuando admin B2B invita seat (post-M9) | Mailing |

**Lo que NO se construye** (Pablo descartó):
- Daily reminder
- Weekly progress report
- At-risk reactivation
- Resurrection (30+ días)
- Re-engagement campaigns
- Preference center
- A/B testing framework para subject lines

---

## 6. Migración desde AgentMail

Si AgentMail está conectado a algo:

1. Identificar todos los `from:` actualmente firmados con AgentMail.
2. Wire equivalentes a Resend.
3. Cambiar registros DNS de AgentMail → Resend (no se pueden tener dos al mismo tiempo o conflictúa SPF).
4. Verificar deliverability con [mail-tester.com](https://www.mail-tester.com).
5. Cancelar AgentMail.

Tiempo estimado: 2-3 horas si AgentMail tiene <5 templates wired.

---

## 7. Decisión sobre dominio de envío

| Opción | Recomendación |
|---|---|
| `hola@itera.la` | ✅ Para email producto (welcome, milestone) |
| `pagos@itera.la` | ✅ Para Stripe/billing (payment receipt, failed) |
| `noreply@itera.la` | ❌ Anti-pattern. Genera bounces. Evitar siempre. |
| `pablo@itera.la` | ✅ Para founder-led outbound (no transaccional, separado) |

**Subdominio para mail:** opcional `mail.itera.la` para aislar reputation. Para Itera año 1 con volumen bajo, **no necesario** — usar dominio raíz.

---

## 8. Métricas a trackear (vía PostHog R15)

Por email type:
- Sent count
- Delivered rate (target ≥98%)
- Bounce rate (alarm si >2%)
- Complaint rate (alarm si >0.1%)

A nivel canal:
- Deliverability score (mail-tester.com 10/10 al setup)
- Reputation domain (Google Postmaster Tools)

---

## 9. Decisiones tomadas

| Decisión | Valor |
|---|---|
| ESP | Resend |
| Plan inicial | Free tier (3k emails/mes) |
| Templates engine | React Email |
| Domain primario | `itera.la` raíz |
| Subdominios | `hola@`, `pagos@`, `pablo@` (no `noreply@`) |
| Webhooks → analytics | PostHog (R15) |
| Migración AgentMail | Sí, pre-lanzamiento |
| Plan B | Postmark si compliance institucional lo exige post-M12 |

---

## 10. Fuentes

- [nuntly.com/versus/resend-vs-postmark](https://nuntly.com/versus/resend-vs-postmark)
- [sequenzy.com/versus/resend-vs-loops](https://www.sequenzy.com/versus/resend-vs-loops)
- [buildcamp.io/blogs/resend-vs-loopsso-choosing-the-right-email-platform-for-your-saas](https://www.buildcamp.io/blogs/resend-vs-loopsso-choosing-the-right-email-platform-for-your-saas)
- [postmarkapp.com/compare/resend-alternative](https://postmarkapp.com/compare/resend-alternative)
- [agentmail.to/blog/5-best-email-api-for-developers-compared-2026](https://www.agentmail.to/blog/5-best-email-api-for-developers-compared-2026)
- [resend.com/blog/new-features-in-2025](https://resend.com/blog/new-features-in-2025)

---

**Versión 1** — recomendación a 2026-04-22 con scope transaccional-only confirmado por Pablo.
