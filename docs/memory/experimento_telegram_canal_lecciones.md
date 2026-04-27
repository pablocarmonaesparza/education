---
type: experimento
title: telegram como canal alterno de lecciones diarias
date: 2026-04-27
tags: [telegram, lecciones, canal_alterno, mvp, bot]
dept: [cgo, cto]
---

# Telegram como canal alterno de lecciones diarias — activo en prod desde 2026-04-27

> Última actualización: 2026-04-27 (sesión ralph-wiggum, 2 rounds)
> Estado: **MVP en producción con cron diario activo. Bot oficial: `@itera_la_bot` (id 7717722983). 1 user vinculado: Pablo.**

## ⚠️ Corrección importante — la memoria del 24 abril estaba equivocada sobre el bot

La memoria escrita el 2026-04-24 decía que `TELEGRAM_BOT_TOKEN` apuntaba a `@itera_ia_bot` (id 8714326778). **No es así.** Verificado con `getMe` el 2026-04-27: el token actual es de `@itera_la_bot` (id `7717722983`, username `itera_la_bot`). No sé si rotó después o si la memoria nació mal — pero la realidad es la que cuenta. La UI debe apuntar a `@itera_la_bot`.

## Cambios 2026-04-27 (ralph-wiggum, round 1 + round 2)

**Round 1** — reactivación:
- Limpiada sesión atorada de Pablo en `telegram_sessions` (slide 1 desde 2026-04-23)
- POST manual a `tg-daily-send` → respuesta `{"ok":true,"total":1,"sent":1,...}` HTTP 200
- Cron `telegram-daily-lesson` re-schedulado: `jobid=2, schedule='0 15 * * *', active=true`
- UI commiteada (incorrectamente) a `@itera_ia_bot` siguiendo memoria stale
- Mirrors de migrations + functions commiteados

**Round 2** — fix del callback muerto:
- Pablo tapeó [empezar →] y no pasó nada. Diagnóstico vía edge function temporal `tg-debug`:
  - bot real es `@itera_la_bot` (no `@itera_ia_bot`)
  - webhook URL apuntaba bien al edge function `telegram-bot` PERO con secret viejo (`itera_tg_2024_secret`)
  - telegram recibía 401 en cada callback, `pending_update_count: 1` con `last_error_message: "Wrong response from the webhook: 401 Unauthorized"`
- Reset webhook con `setWebhook` usando el `FUNCTION_SECRET` actual (64 chars) + `drop_pending_updates: true`
- Revertida UI a `@itera_la_bot` en `app/dashboard/perfil/page.tsx:475`
- Re-disparado `tg-daily-send` para que Pablo reciba un mensaje fresh con [empezar →]
- `tg-debug` queda deployada como herramienta de diagnóstico, gateada por `FUNCTION_SECRET` (acciones: `info`, `setwebhook`)

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
| pg_cron job `telegram-daily-lesson` | ACTIVO (`jobid=2`, `schedule='0 15 * * *'`, reactivado 2026-04-27) |
| `FUNCTION_SECRET` | rotado 2026-04-24 (el viejo `itera_tg_2024_secret` quedó en logs) |
| `TELEGRAM_BOT_TOKEN` | apunta a `@itera_ia_bot` (id 8714326778) |
| Webhook de `@itera_ia_bot` | configurado al edge function `telegram-bot` con `?secret=<nuevo>` |
| Webhook de `@itera_la_bot` | desconocido — no tengo el token; si tenía webhook al edge function con `?secret=itera_tg_2024_secret`, ahora da 401 (zombie) |

## Bot identity — RESUELTO 2026-04-27 (round 2 corrigió el malentendido)

Bot oficial: **`@itera_la_bot`** (id `7717722983`). Verificado vía `getMe` con el token activo en supabase secrets.

| Bot | id | Estado actual |
|---|---|---|
| `@itera_la_bot` | 7717722983 | OFICIAL — webhook activo con `?secret=<FUNCTION_SECRET>`, manda mensajes en prod |
| `@itera_ia_bot` | 8714326778 | DEPRECADO — solo existía en memoria stale del 24 abril, nunca fue el bot real con el token actual. Pablo puede borrarlo en `@BotFather` |

## Riesgos pendientes (requieren acción humana de Pablo en BotFather)

1. **Rotar token de `@itera_la_bot`** — el token actual nunca fue pegado en chat (el de `@itera_ia_bot` sí, pero ese bot no es el activo). De todos modos, vale la pena rotarlo periódicamente. Pasos: `@BotFather` → `/token` → `@itera_la_bot` → confirmar → copiar nuevo → `supabase secrets set TELEGRAM_BOT_TOKEN=<nuevo>` → invocar `tg-debug?action=setwebhook&secret=<FUNCTION_SECRET>` para resetear el hook con el nuevo token.
2. **Borrar `@itera_ia_bot`** en BotFather (`/deletebot`). Cleanup — nunca fue el bot oficial con el token actual.
3. **Verificación end-to-end real (Pablo)** — tap [empezar →] en el mensaje fresh que se reenvió en round 2 y completar slides 1→10. Confirma que `editMessageText` in-place + trigger `on_user_progress_complete` funcionan.

## To-dos diferidos del codex review (no bloquean MVP, sí cuando escale)

1. `SLIDE_COUNT = 10` hardcoded en `telegram-bot/index.ts`. Schema de `lectures` permite 8-15 vía `est_slides`. Parametrizar.
2. Race condition en callbacks concurrentes (<100ms): pueden corromper `slide_state` en multi-select / tap-match / order-steps. Fix: `SELECT … FOR UPDATE` en `upsertSession`.
3. `callback_data` sin versión / lecture binding. Botón viejo (mensaje de ayer) puede operar sobre sesión de hoy. Fix: prefix `<lectureId>:<slideIdx>` y validar en handler.
4. `tg-daily-send` no paginado. La query `select * from telegram_links` rompe a >1000 users. Fix: paginar o RPC set-based.
5. N+1 queries en `tg-daily-send` (3 selects por user). Fix: 1 query con joins.
6. `DAILY_SEND_SECRET` env var vacío → endpoint `tg-daily-send` es público. Cualquier POST dispara envío masivo (idempotente, pero igual). Fix: setear secret + cron URL incluirlo.
7. Dead code `rGeneric` para slide kinds no publicados. Si Education saca `concept-visual` / `code-completion` / `build-prompt`, hay que escribir sus renderers reales.
8. Tablas legacy `tutor_conversations` y `tutor_messages` con `source='telegram'` ya no se alimentan (3+6 rows residuales). Decidir si borrar o conservar para historial.

## Verificación parcial 2026-04-27

✅ **Token válido**: POST manual a `tg-daily-send` respondió `{ok:true, total:1, sent:1}` HTTP 200
✅ **Idempotencia funciona**: row del 2026-04-27 creado en `telegram_daily_sends`
✅ **Mensaje entregado**: Telegram aceptó el `sendMessage` (status 200)
⏳ **Flujo slide 1→10**: pendiente — requiere Pablo tap [empezar →] y completar
⏳ **Trigger XP/streak vía bot**: pendiente — depende de completar la lección

## Archivos commiteados 2026-04-27

```
app/dashboard/perfil/page.tsx         # @itera_la_bot (final, después de revertir el cambio incorrecto del round 1)
supabase/functions/telegram-bot/index.ts        # mirror del v9 deployed
supabase/functions/tg-daily-send/index.ts       # mirror del v3 deployed
supabase/functions/tg-debug/index.ts            # nueva — herramienta de diagnóstico gateada por FUNCTION_SECRET
supabase/migrations/009b_telegram_lessons.sql   # mirror
supabase/migrations/010_telegram_daily_send_idempotency.sql  # nuevo (mirror)
docs/memory/experimento_telegram_canal_lecciones.md  # este archivo
docs/memory/INDEX.md                  # actualizar con la línea nueva
```

## Coordinación con otros agentes (del orquestrador)

- **Education T2.5**: cuando saquen API REST `/api/lectures/[id]`, el bot puede consumirlo en lugar de queries directas a `slides`/`lectures`. Sin urgencia.
- **Mailing**: si en el futuro un evento dispara por ambos canales (ej. "primera lección completada"), dedupe. Hoy no hay traslape.
- **B2B empresa-first** (gotcha_posicionamiento_empresa_vs_latam): copy del bot es seco/profesional, sin "no pierdas tu racha", sin emojis FOMO. No mandar engagement.

## Cron diario — referencia (ya activo)

```sql
-- jobid=2, active=true desde 2026-04-27
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

-- para pausar (si hace falta)
-- select cron.unschedule('telegram-daily-lesson');

-- para invocar manualmente (test)
-- curl -X POST https://mteicafdzilhxkawyvxw.supabase.co/functions/v1/tg-daily-send -H "Content-Type: application/json" -d '{}'
```
