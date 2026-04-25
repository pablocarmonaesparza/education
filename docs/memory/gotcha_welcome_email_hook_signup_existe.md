---
type: gotcha
title: welcome email — hook en signup ya existe, falta hook en checkout
date: 2026-04-22
tags: [email, welcome, stripe, signup, onboarding]
dept: [cto]
---

El email de bienvenida de Itera **ya tiene hook implementado** en `app/auth/callback/route.ts:114-121` que dispara al completar signup (email + Google OAuth). La infraestructura (`lib/email/agentmail.ts`, `emails/WelcomeEmail.tsx`, `lib/email/welcome.ts`, `app/api/email/welcome/route.ts`) está en disco.

**No hay que reimplementar el hook de signup.** Lo que falta para cerrar el loop:

1. **Segundo hook al `checkout.session.completed`** en `app/api/stripe-webhook/route.ts` — para reforzar con onboarding post-pago o cubrir casos donde se pagó sin signup explícito previo. Dueño: Backend P0.3.

2. **Idempotencia con columna `users.welcome_email_sent_at timestamp null`**. Hoy la heurística "no existe fila en `public.users`" es frágil: `auto-login`, `generate-course` y otros ya hacen insert/upsert en `public.users`, rompiendo la suposición. Sin esta columna, si un usuario entra por Google OAuth después de haber sido creado por `auto-login`, no recibe welcome. Dueño: Onboarding O3.

3. **Verificación E2E real** — signup con email real, confirmar que llega a inbox (no spam). Dueño: Mailing F1.

4. **DKIM / SPF / DMARC de `itera.la`** configurado vía Vercel MCP o API del registrador. Sin esto el email llega a spam independientemente del hook. Dueño: Mailing M3. Ejecutar directamente, no pedir DNS manual a Pablo (ver `aprendizaje_pablo_no_delega_manuales.md`).

**Por qué:** el 2026-04-22 en la ronda de orquestación Backend reportó "email de bienvenida via AgentMail... falta el hook al signup" como P0.3. Eso era error — Mailing y Onboarding confirmaron independientemente que el hook ya dispara en signup. El bug real es scope más chico: hook al checkout + idempotencia + E2E + DKIM.

**Cuándo aplicar:**
- Antes de proponer "implementar hook de welcome": grepear `lib/email/welcome`, `app/auth/callback`, `emails/WelcomeEmail`. Si existen (sí existen), **no reimplementar** — añadir lo que falta.
- Si una conversación pregunta "dónde dispara el welcome": la respuesta corta es `app/auth/callback/route.ts:114-121` hoy; eventualmente también `app/api/stripe-webhook/route.ts` cuando se añada el segundo hook.
- Si se añade la columna `welcome_email_sent_at`, actualizar esta memoria con el número de migración y el commit correspondientes.
