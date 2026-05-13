---
type: decision
title: archive del bot telegram diario — cron.unschedule ejecutado en supabase
date: 2026-05-13
tags: [telegram, bot, archive, legacy_freeze, simulador, pg_cron, edge_function]
dept: [desarrollo, producto, automatizacion]
---

## decisión

apagado el cron `telegram-daily-lesson` en supabase project `mteicafdzilhxkawyvxw` (Itera). pablo ya no recibe la notificación diaria del bot educativo.

ejecución directa del `legacy_freeze_plan`: el bot estaba marcado `archive` por contradecir la tesis del simulador.

## qué se apagó (exacto)

- **cron job**: `telegram-daily-lesson`
- **schedule original**: `0 15 * * *` (15:00 UTC, ~09:00 MX, todos los días)
- **comando original**: `net.http_post → /functions/v1/tg-daily-send`
- **status post-cambio**: `cron.job` vacía (0 jobs activos)
- **comando ejecutado**: `SELECT cron.unschedule('telegram-daily-lesson');` → returned `true`

## qué NO se tocó

- edge function `tg-daily-send` sigue desplegada (no se invoca sin cron)
- edge function `telegram-bot` (handler de comandos) sigue desplegada
- edge function `tg-debug` sigue desplegada
- migraciones `009b_telegram_lessons.sql` + `010_telegram_daily_send_idempotency.sql` siguen aplicadas
- tablas asociadas (`telegram_users`, `telegram_daily_sends`, etc.) intactas
- `app/api/telegram-link/route.ts` sigue activo
- bot @itera_la_bot puede recibir mensajes manualmente — solo dejó de enviar por agenda

filosofía: `archive` significa apagado del producto, no demolición. el código queda como sandbox por si se quiere re-activar con tesis nueva (improbable v0).

## por qué

el bot diario es contradictorio con la tesis simulador:

- enviar "tu lección de hoy" empuja la mente del usuario y del founder hacia "curso", no hacia "diagnóstico → práctica → evidencia"
- itera no es escuela; no manda contenido programado
- el simulador agenda re-simulaciones por evidencia de gap, no por calendario

ver [[decision_legacy_freeze_plan]] (categoría `forbidden v0` para "bot de lecciones diarias") y [[decision_pivot_whatsapp_canal_real]] (whatsapp ya había desplazado a telegram a sandbox; el daily send era el último vestigio operativo).

## reactivación

si en algún momento se decide reactivar (improbable en v0), aplicar la regla dura del legacy freeze:

1. owner asignado
2. razón documentada nueva (no solo "antes funcionaba")
3. revisión del orquestador
4. el bot debe pasar el filtro único: ¿ayuda a cerrar brecha detectada y demostrar mejora?

para re-activar técnicamente:

```sql
SELECT cron.schedule(
  'telegram-daily-lesson',
  '0 15 * * *',
  $$ select net.http_post(
       url := 'https://mteicafdzilhxkawyvxw.supabase.co/functions/v1/tg-daily-send',
       headers := jsonb_build_object('Content-Type', 'application/json'),
       body := '{}'::jsonb
     ); $$
);
```

## consecuencias inmediatas

- pablo deja de recibir el ping diario a las ~09:00 MX
- usuarios linkeados al bot (si hay alguno productivo) dejan de recibir lección diaria
- ahorro mínimo de invocaciones a edge function (no es decisión por costo, por foco)

## relacionados

- [[decision_legacy_freeze_plan]] — meta-decisión que autoriza este apagón
- [[decision_pivot_whatsapp_canal_real]] — whatsapp reemplazó telegram como canal real en 28-abr
- [[experimento_telegram_canal_lecciones]] — origen del bot
