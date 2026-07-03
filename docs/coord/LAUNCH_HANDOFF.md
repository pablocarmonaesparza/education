# Handoff de lanzamiento — lo que necesita Pablo (F5/F6)

Todo el código está listo y en `main`. Esto es lo que **solo tú puedes ejecutar**
porque necesita tus keys, cuentas o tarjeta real. Ordenado por bloqueo.

## 1. Keys y envs en Vercel (bloqueante — nada cobra sin esto)

- [ ] **ANTHROPIC_API_KEY** — rotar la actual (está inválida, 401). El judge corre en
      fallback DeepSeek sin ella. Ponerla en Vercel + `.env.local`. Después: re-correr la
      calibración contra la API real (`npm run simulador:judge-calibration`) y tratar
      cualquier celda divergente como bloqueo (regla en `judge_calibration_spec.md`).
- [ ] **STRIPE live**: `STRIPE_SECRET_KEY` (live), `STRIPE_WEBHOOK_SECRET`,
      `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Confirmar que existen en Vercel (prod).
- [ ] **Stripe → webhook endpoint** apuntando a `https://itera.la/api/stripe-webhook` con
      estos eventos habilitados (el código ya los maneja):
      `checkout.session.completed`, `customer.subscription.updated`,
      `customer.subscription.deleted`, `invoice.payment_failed`.
- [ ] **AgentMail / email**: DNS ya generado (F-1). Confirmar propagación y que los alias
      (`ayuda@`, `soporte@`, `hola@`, `ventas@`, `facturas@`) reciben de verdad, o
      consolidar a 2-3 y avisar para corregir el copy.

## 2. Toggles de dashboard (no son código)

- [ ] **Supabase Auth → Leaked password protection**: ON (advisor lo flagea).
- [ ] **Supabase Auth → MFA**: habilitar al menos TOTP (advisor lo flagea).
- [ ] **Supabase → Backups**: confirmar snapshot pre-launch + PITR del plan; hacer **un
      restore de prueba** a una branch antes de ir a vivo.
- [ ] **Vercel → Web Analytics**: ON (funnel mínimo, gratis).
- [ ] **Monitoreo**: Sentry free tier (o alertas de Vercel) para 500s en `/api/sessions/*`
      y `/api/stripe-webhook`; + alerta de webhook fallido en el dashboard de Stripe.
      Probar: forzar un 500 → confirmar que te llega la notificación.

## 3. Purga de datos demo (antes de ir a vivo)

- [ ] Correr `node scripts/simulador/purge-demo-data.mjs --confirm` sobre el **remoto**
      (borra orgs/usuarios/sesiones demo sembrados). Sin `--confirm` hace dry-run y lista
      qué borraría. Revisar la lista antes de confirmar.

## 4. Guion humano completo (la única verificación que cuenta)

Con dinero real en `https://itera.la`, en este orden:

1. **Compra**: signup → onboarding (org, team, billing) → paga con **tarjeta real**.
   → Verifica: la suscripción queda `active` en Supabase (`simulador.subscriptions`), el
   tier correcto por seats, el webhook `checkout.session.completed` registrado.
2. **Invita**: invita a una persona de confianza (email real). Prueba también invitar por
   encima de tus asientos → debe rechazar con el copy de asientos (409, R-03).
3. **Juega**: esa persona acepta la invitación, entra a un caso y lo completa (25 slides).
4. **Judge**: al cerrar, se evalúa → reporte visible en tu dashboard de manager.
5. **Práctica**: confirma que se desbloqueó práctica y es visible.
6. **Cancela**: desde `/empresa` → "Cancelar suscripción". Verifica: acceso hasta fin de
   período, webhook `customer.subscription.updated` con `cancel_at_period_end`, y que ya no
   puedes invitar/asignar nuevo.
7. **Reembolso**: prueba el reembolso dentro de 7 días (proceso manual desde Stripe).

Si los 7 pasos pasan con dinero real, **el producto está en el mercado**.

## 5. CFDI / facturación fiscal (proceso manual v1)

- [ ] Definir el proceso: el comprador responde al recibo de Stripe con RFC/NIT/CUIT y tú
      emites en 1-2 días (PAC/Facturama). Documentar dueño y el inbox donde llegan.
      (El copy del FAQ y el TOS ya prometen esto — cúmplelo o suaviza la promesa.)

## 6. Crons / retención (decisión pendiente)

- [ ] R-16 (SLA de doble firma de reportes) y la retención de "12 meses" que promete
      `legal.ts`: decidir si se implementa un cron de Vercel o se deroga formalmente en el
      RULES_LEDGER. Sin cron, la promesa de retención es aspiracional.

---

**Estado del código para todo lo anterior:** webhooks negativos, seats gate, pricing
per-seat, TOS, RLS, rate limits y headers están implementados, tipados y en `main`. Lo que
falta es 100% de tu lado (keys/tarjeta/toggles). El e2e de CI cubre el flujo hasta reporte;
el guion humano cubre el dinero real que CI no puede tocar.
