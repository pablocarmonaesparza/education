---
type: experimento
title: telegram como canal alterno de lecciones diarias
date: 2026-04-24
tags: [telegram, lecciones, canal_alterno, mvp, bot]
dept: [cgo, cto]
---

# Telegram como canal alterno de lecciones diarias — estado al cerrar sesión 2026-04-24

> Última actualización: 2026-04-24
> Estado: **MVP construido + en pausa esperando decisión de Pablo sobre identidad del bot**

## TL;DR

Se construyó end-to-end un sistema para que un user vinculado reciba **una lección diaria por Telegram** y la haga slide-por-slide en el chat (modo lección, no tutor Q&A). Schema, edge functions, cron, idempotencia, todo deployado y revisado por codex (PASS). Falta una decisión humana antes de lanzar a más users: cuál bot es el oficial.

## Arquitectura final

```
9am MX (15:00 UTC)
   pg_cron job 'telegram-daily-lesson'  ← ACTUALMENTE UNSCHEDULED (pausa)
       └── net.http_post → tg-daily-send edge function
              ├── itera telegram_links
              ├── INSERT en telegram_daily_sends (idempotencia, PK user_id+date)
              ├── get_next_lesson_for_user() RPC → próxima lectura pendiente
              └── sendMessage con [empezar →] inline button

Usuario tap "empezar →"  →  callback_query "start_hoy"
   └── telegram-bot edge function (verify_jwt:false, ?secret=FUNCTION_SECRET)
          ├── userFromTg(telegram_user_id) → user_id
          ├── getSession(chat_id) ó startLesson()
          ├── presentSlide(lecture_id, slide_index, last_message_id)
          └── upsertSession con state machine

Cada slide:
   - 8 kinds renderizados nativos: concept, celebration, mcq, true-false,
     fill-blank, multi-select, order-steps, tap-match
   - 3 kinds con renderer fallback: concept-visual, code-completion,
     build-prompt (no publicados aún en DB)
   - Todo inline keyboards + editMessageText in-place (sin sendPoll)

Al completar slide 10:
   UPDATE user_progress SET is_completed=true, completed_at=now()
   → trigger on_user_progress_complete (migration 006) otorga XP y streak
   → mensaje de cierre con stats (xp total, nivel, sección X/10)
```

## Estado de infraestructura en Supabase (project mteicafdzilhxkawyvxw)

| Recurso | Estado |
|---|---|
| Migration `009_telegram_sessions_and_scheduling` (aplicada por MCP) | mirror en repo: `009b_telegram_lessons.sql` |
| Migration `010_telegram_daily_send_idempotency` | aplicada + mirror en repo |
| Tabla `telegram_sessions` | creada, vacía |
| Tabla `telegram_daily_sends` | creada, 1 row de prueba (Pablo) |
| RPC `get_next_lesson_for_user(uuid)` | grant solo a service_role |
| Extensión `pg_net` | instalada |
| Extensión `pg_cron` | instalada |
| Edge function `telegram-bot` v9 | ACTIVE, verify_jwt:false |
| Edge function `tg-daily-send` v2 | ACTIVE, verify_jwt:false |
| Edge function `tg-demo` | borrada |
| pg_cron job `telegram-daily-lesson` | **UNSCHEDULED (pausa, reactivar con `cron.schedule(...)` cuando se resuelva bot identity)** |
| `FUNCTION_SECRET` | rotado 2026-04-24 (el viejo `itera_tg_2024_secret` quedó en logs) |
| `TELEGRAM_BOT_TOKEN` | apunta a `@itera_ia_bot` (id 8714326778) |
| Webhook de `@itera_ia_bot` | configurado al edge function `telegram-bot` con `?secret=<nuevo>` |
| Webhook de `@itera_la_bot` | desconocido — no tengo el token; si tenía webhook al edge function con `?secret=itera_tg_2024_secret`, ahora da 401 (zombie) |

## Decisión bloqueante pendiente — bot identity

Existen **dos bots Itera registrados en Telegram**:

| Bot | id | Token disponible | Description set | Estado |
|---|---|---|---|---|
| `@itera_ia_bot` | 8714326778 | sí, en TELEGRAM_BOT_TOKEN | "Educación de IA" | activo, recibe webhooks, manda mensajes |
| `@itera_la_bot` | desconocido | **NO está en filesystem ni Supabase secrets** | ninguna (cascarón) | existe pero token sólo accesible vía @BotFather |

Pablo expresó molestia porque los mensajes le llegan de `@itera_ia_bot` y él esperaba `@itera_la_bot` (matching brand `itera.la`). La UI del dashboard apuntaba originalmente a `@itera_la_bot`; en `app/dashboard/perfil/page.tsx:475` se editó a `@itera_ia_bot` (cambio sin commit).

**Caminos para resolver:**

- **A. Quedarse con `@itera_ia_bot`**: commitear el cambio de UI, rotar token (porque se pegó en chat), borrar `@itera_la_bot` en BotFather.
- **B. Migrar a `@itera_la_bot`**: Pablo trae el token desde `@BotFather` → `/mybots` → `@itera_la_bot` → `API Token`. Yo roto `TELEGRAM_BOT_TOKEN`, seteo webhook nuevo, reverto UI, deshabilito `@itera_ia_bot`.

## Riesgo de seguridad pendiente (Pablo manual)

Pablo pegó en chat el token `8714326778:AAEpRUhwGLpqbuOYBJMSwS8b49ye25SzFks` de `@itera_ia_bot`. Token expuesto en logs de conversación. **Acción**: rotar en `@BotFather` → `/token` y actualizar `supabase secrets set TELEGRAM_BOT_TOKEN=<nuevo>`.

## To-dos diferidos del codex review (no bloquean MVP, sí cuando escale)

1. `SLIDE_COUNT = 10` hardcoded en `telegram-bot/index.ts`. Schema de `lectures` permite 8-15 vía `est_slides`. Parametrizar.
2. Race condition en callbacks concurrentes (<100ms): pueden corromper `slide_state` en multi-select / tap-match / order-steps. Fix: `SELECT … FOR UPDATE` en `upsertSession`.
3. `callback_data` sin versión / lecture binding. Botón viejo (mensaje de ayer) puede operar sobre sesión de hoy. Fix: prefix `<lectureId>:<slideIdx>` y validar en handler.
4. `tg-daily-send` no paginado. La query `select * from telegram_links` rompe a >1000 users. Fix: paginar o RPC set-based.
5. N+1 queries en `tg-daily-send` (3 selects por user). Fix: 1 query con joins.
6. `DAILY_SEND_SECRET` env var vacío → endpoint `tg-daily-send` es público. Cualquier POST dispara envío masivo (idempotente, pero igual). Fix: setear secret + cron URL incluirlo.
7. Dead code `rGeneric` para slide kinds no publicados. Si Education saca `concept-visual` / `code-completion` / `build-prompt`, hay que escribir sus renderers reales.
8. Tablas legacy `tutor_conversations` y `tutor_messages` con `source='telegram'` ya no se alimentan (3+6 rows residuales). Decidir si borrar o conservar para historial.

## Verificación end-to-end pendiente

Pablo NO ha tapeado el botón [empezar →] en el mensaje que le mandé via tg-daily-send. Por tanto no se ha confirmado en producción real:
- Que el flujo slides 1→10 funciona slide por slide
- Que `editMessageText` actualiza el mensaje en su lugar (UX clave)
- Que al completar slide 10 dispara correctamente el trigger `on_user_progress_complete` y otorga XP + streak

Hay un row de prueba en `telegram_daily_sends` (Pablo, 2026-04-23) que se backfilleó manualmente — esto bloquea el envío de hoy 2026-04-24 si se reactiva el cron, **a menos** que se borre primero.

## Archivos modificados sin commit

```
app/dashboard/perfil/page.tsx         # 1 línea: itera_la_bot → itera_ia_bot (revertir si camino B)
supabase/functions/telegram-bot/index.ts        # nuevo (mirror del v9)
supabase/functions/tg-daily-send/index.ts       # nuevo (mirror del v2)
supabase/migrations/009b_telegram_lessons.sql   # nuevo (mirror)
supabase/migrations/010_telegram_daily_send_idempotency.sql  # nuevo (mirror)
docs/memory/experimento_telegram_canal_lecciones.md  # este archivo
docs/memory/INDEX.md                  # actualizar con la línea nueva
```

## Coordinación con otros agentes (del orquestrador)

- **Education T2.5**: cuando saquen API REST `/api/lectures/[id]`, el bot puede consumirlo en lugar de queries directas a `slides`/`lectures`. Sin urgencia.
- **Mailing**: si en el futuro un evento dispara por ambos canales (ej. "primera lección completada"), dedupe. Hoy no hay traslape.
- **B2B empresa-first** (gotcha_posicionamiento_empresa_vs_latam): copy del bot es seco/profesional, sin "no pierdas tu racha", sin emojis FOMO. No mandar engagement.

## Reactivación del cron (para futuro yo o futuro orquestador)

Cuando se resuelva bot identity:

```sql
-- 1. Limpiar idempotencia stub si todavía hay row backfill de 2026-04-23
delete from telegram_daily_sends where send_date < current_date;

-- 2. Re-schedulear el cron (mismo schedule que tenía)
select cron.schedule(
  'telegram-daily-lesson',
  '0 15 * * *',
  $$
  select net.http_post(
    url := 'https://mteicafdzilhxkawyvxw.supabase.co/functions/v1/tg-daily-send',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);
```

Si camino B (migrar a @itera_la_bot), antes de re-schedulear:
1. `supabase secrets set TELEGRAM_BOT_TOKEN=<nuevo>` con el token de `@itera_la_bot`
2. `supabase functions deploy telegram-bot` (refresca env)
3. `curl https://api.telegram.org/bot<NUEVO>/setWebhook?url=https://mteicafdzilhxkawyvxw.supabase.co/functions/v1/telegram-bot?secret=<FUNCTION_SECRET>&drop_pending_updates=true&allowed_updates[]=message&allowed_updates[]=callback_query`
4. (opcional) revertir UI: `app/dashboard/perfil/page.tsx:475` itera_ia_bot → itera_la_bot
