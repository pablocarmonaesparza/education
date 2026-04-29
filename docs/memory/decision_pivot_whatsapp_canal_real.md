---
type: decision
title: pivot a whatsapp como canal real, telegram queda como sandbox
date: 2026-04-28
tags: [whatsapp, telegram, canal, distribucion, b2b]
dept: [cto, cmo, cfo, cpo]
---

# Pivot a WhatsApp como canal real, Telegram queda como sandbox interno

## Decisión

**WhatsApp es el canal de distribución de producción de Itera.** Telegram seguirá vivo solo como sandbox interno para dogfooding y testing pedagógico de Pablo + equipo.

Razones:
1. **Penetración LATAM**: WhatsApp ~90%+ vs Telegram <10%. la audiencia objetivo (profesionales no-técnicos LATAM) está en WA.
2. **Branding del producto**: itera.la se siente más "serio/empresarial" en WhatsApp; Telegram tiene connotación más casual/dev.
3. **Adopción B2B**: empresas en MX/LATAM usan WhatsApp Business para comunicación interna y con proveedores. encaja con el pitch B2B-first.
4. **Costo aceptable**: ~$5-10 MXN/user/mes con smart pausing, <2% del revenue target $20 USD.

## Lo que NO es Telegram

- **NO es prototipo a tirar**: el bot Telegram seguirá funcionando para que Pablo y testers internos puedan iterar pedagógicamente sin tocar WhatsApp producción.
- **NO duplica esfuerzo**: el backend (slides, sessions, daily-send, idempotencia, RPC) es 100% reusable entre canales. solo cambia el render layer.
- **NO se mantiene perfecto**: cualquier bug exótico de Telegram que solo afecte a Pablo y nadie más, se vive con él.

## Las 3 correcciones que hicimos durante esta sesión

### Corrección 1: BSP (Twilio/Wati) NO es necesario

**Mi recomendación inicial (incorrecta)**: usar Twilio o Wati como BSP intermediario.

**Lo correcto (Pablo me corrigió)**: WhatsApp Cloud API de Meta es accesible **directo**, sin BSP. Setup en 15 min con test number gratis para dogfooding. Para producción solo necesitas WABA verificada + número real registrado en CRT.

Diferencia de costo a 1k users: ~$50-100 USD/mes (eliminando markup BSP).

### Corrección 2: arquitectura de slides — columnas paralelas, no transformer único

**Mi recomendación inicial (incorrecta)**: single source `slides.content` + thin transformer en render time + endurecer caps en METODOLOGIA.md.

**Lo correcto (Pablo me corrigió)**: agregar columnas paralelas `content_wa jsonb` y `kind_wa text` en `slides`. Cada canal tiene su propia versión adaptada al medio. El `kind_wa` puede DIFERIR del `kind` original (ej: tap-match TG → mcq WA porque WA no tiene equivalente nativo).

Razones por las que la jugada paralela gana:
1. No es duplicación, es adaptación al medio. La metodología pedagógica (5E, hypercorrection) es una; la forma depende del canal.
2. Forzar caps WA sobre TG = degradación pedagógica sin razón en TG.
3. Migración gradual (`lectures.wa_ready` boolean por lecture).
4. Permite que kinds difieran por canal — adaptación pedagógica real.
5. A/B testing posible por canal a futuro.

Schema agregado:

```sql
alter table slides
  add column content_wa jsonb,
  add column kind_wa text;

alter table lectures
  add column wa_ready boolean default false;

create table whatsapp_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  whatsapp_phone_e164 text unique not null,
  whatsapp_display_name text,
  linked_at timestamptz default now()
);

create table whatsapp_sessions (
  phone_e164 text primary key,
  user_id uuid references auth.users(id),
  current_lecture_id uuid references lectures(id),
  current_slide_index smallint,
  last_message_id text,
  slide_state jsonb,
  in_flow_id text,
  conversation_window_expires_at timestamptz,
  updated_at timestamptz default now()
);

create table whatsapp_daily_sends (
  user_id uuid,
  send_date date,
  lecture_id uuid,
  whatsapp_phone_e164 text,
  template_name text,
  sent_at timestamptz default now(),
  primary key (user_id, send_date)
);
```

### Corrección 3: el costo de WA no escala con engagement

**Mi cálculo inicial (incompleto)**: $5 MXN/user/mes asumiendo daily delivery.

**Lo correcto (Pablo cuestionó)**: el cálculo $5 era el techo si TODOS engagean diario. Con smart pausing (pausar inactivos 8-14 días, dormant 15-30 días, deep-dormant >30 días), el promedio ponderado real cae a ~**$3-10 MXN/user/mes** dependiendo del peso del AI tutor.

Insight contraintuitivo: **menos engagement = menos costo de WA** (porque template solo se cobra al delivered y smart pausing reduce envíos a inactivos). El problema con bajo engagement no es costo, es churn.

Lo que sí escala con engagement: el AI tutor (claude/gpt para Q&A). Power users (10% de la base) consumen $1.50-3.00 USD/mes en LLM. Necesita rate limiting + cache + claude haiku para preguntas simples.

## Pricing tentativo

$20 USD/user/mes (B2C consumer) o $20 USD/empleado/mes (B2B per-seat con descuentos por volumen).

Pendiente de decisión: ¿cobrar B2C self-serve, B2B per-seat, o ambos? Esa decisión define CAC, sales motion y churn esperado. **Pablo cerró sesión sin resolver eso. Retomar en otro turno.**

Gross margin a $20 con costos típicos (~$0.60-2.00 COGS): **88-95%**. SaaS-grade.

## Por qué Telegram NO se descontinuó (todavía)

- Sirve como **sandbox interno**: tester (Pablo + 4 internos) puede probar contenido pedagógico nuevo sin esperar approval de templates de Meta.
- El backend es compartido. Mantener TG vivo cuesta ~0 hours/mes.
- Cuando WhatsApp esté en producción y estable >3 meses, evaluamos si vale la pena descontinuar TG.

## Próximas decisiones pendientes (cuando retomemos)

1. **B2C vs B2B per-seat**: define todo el resto del plan comercial.
2. **Implementar la migration SQL**: tablas WA + columnas paralelas en slides.
3. **METODOLOGIA.md**: agregar contrato pedagógico de slides para WhatsApp (caps específicos).
4. **Linter de slides**: extender para validar contrato WA cuando `content_wa is not null`.
5. **AI adapter**: prompt que toma `content` y genera `content_wa` respetando caps WA.
6. **Edge function `whatsapp-bot`**: clon de `telegram-bot` con render layer WA.
7. **Papeleo MX**: RFC, CSF, abogado LFPDPPP, registro CRT del número celular dedicado.

Ver [research_whatsapp_setup_mexico.md](research_whatsapp_setup_mexico.md) para el detalle técnico/legal.
