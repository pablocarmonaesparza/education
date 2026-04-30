# R15 — analytics stack para Itera

> Decisión: qué herramienta de product analytics adoptar. Comparativa PostHog · Mixpanel · Amplitude · GA4 con datos verificados al 2026-04-22.
>
> **Desbloquea:** Backend P2.13 (event tracking), Wish List W1 (analítica web), Mailing transaccional metrics.

---

## 1. TL;DR — recomendación

**Adoptar PostHog cloud (US o EU).** Free tier de 1M eventos/mes cubre toda la fase de validación. Costo año 1 estimado: $0–150/mes.

**Razones operativas:**
1. Open source con opción real de self-host (única de las 4 con esta propiedad).
2. Suite all-in-one: analytics + session replay + feature flags + experiments + surveys + error tracking en una sola plataforma. Reduce sprawl de vendors.
3. Per-event pricing alinea bien con B2B donde el volumen lo determina la actividad real, no la cantidad de seats.
4. Built-in data warehouse para importar Stripe y Supabase sin stack extra (Mixpanel/Amplitude requieren conector).

**Notas honestas sobre los competidores:**

- **Mixpanel** ya cambió a per-evento ($0.28/1k eventos después de 1M free) y agregó session replay/feature flags. Es competitivo. La razón para preferir PostHog sobre Mixpanel es la suite all-in-one + opción de self-host, no el modelo MTU.
- **Amplitude** tiene Starter free hasta 10k MTUs / 2M eventos, incluye session replay, feature flags ilimitados, web experimentation y group analytics. Es la opción enterprise-first más fuerte. Si Itera prioriza enterprise sales B2B con clients que ya usan Amplitude (Rappi, Mercado Libre), considerar.
- **GA4** sigue siendo gratis para volumen estándar pero falta replay, A/B testing y feature flags. Útil para attribution de marketing, no para producto.

---

## 2. Comparativa de pricing (verificado 2026-04-22)

| Provider | Free tier | Cobro post-free |
|---|---|---|
| **PostHog** | 1M eventos/mes (todos los productos) | $0.00005/evento product analytics tras free tier |
| **Mixpanel** | 1M eventos/mes | $0.28 / 1k eventos |
| **Amplitude** Starter | 10k MTUs / 2M eventos | Growth: custom (MTU o evento volume) |
| **GA4** estándar | Sin tope publicado claramente; sampling/limits a partir de 10M hits | GA360 enterprise: pricing privado, no publicado |

Notas:
- El "10M eventos GA4" que circula en blogs es típicamente un límite de sampling/query, no de pricing. Google no publica un pricing per-event.
- GA360 ronda los seis dígitos anuales pero el dato concreto es propietario y bajo NDA — no usar números públicos como anchor.

Fuentes: [posthog.com/pricing](https://posthog.com/pricing), [mixpanel.com/pricing/](https://mixpanel.com/pricing/), [amplitude.com/pricing](https://amplitude.com/pricing), [support.google.com/analytics/](https://support.google.com/analytics/).

---

## 3. Comparativa de features (estado actual)

| Feature | PostHog | Mixpanel | Amplitude | GA4 |
|---|---|---|---|---|
| Product analytics | ✅ | ✅ | ✅ | Parcial |
| Session replay | ✅ | ✅ (incluido) | ✅ (incluido) | ❌ |
| Feature flags | ✅ | ✅ (add-on) | ✅ (unlimited en Starter+) | ❌ |
| A/B testing | ✅ | ✅ (add-on) | ✅ (Web Experimentation) | ❌ |
| Surveys in-app | ✅ | ❌ | ❌ | ❌ |
| Error tracking | ✅ | ❌ | ❌ | ❌ |
| Group analytics (B2B accounts) | ✅ | ✅ | ✅ | ❌ |
| **Self-host** | **✅** | ❌ | ❌ | ❌ |
| Data warehouse built-in | ✅ | Add-on | ✅ (Snowflake-native) | Vía BigQuery export |

---

## 4. Costo proyectado para Itera año 1

Asunciones conservadoras de [`CONTEXT.md`](../CONTEXT.md):
- M0-M3: maintenance mode, ~50 beta users, ~50-100k eventos/mes.
- M3-M6: lanzamiento, ~500 users, ~300-500k eventos/mes.
- M6-M12: ~2000 users + 20-30 cuentas B2B, ~1.5-3M eventos/mes.

| Escenario | PostHog | Mixpanel | Amplitude Starter | GA4 (analytics solo) |
|---|---|---|---|---|
| M0-M3 | $0 | $0 | $0 | $0 |
| M3-M6 | $0 | $0 | $0 | $0 |
| M6-M12 (3M eventos/mes) | ~$100/mes | ~$560/mes | Custom (Growth) | $0 |
| **Total año 1** | **$300-700** | **$1,500-3,500** | **$0 (si encaja en Starter) o Growth custom** | **$0 directo** |

GA4 nominalmente $0 implica costos adicionales por session replay (LogRocket/FullStory ~$99-199/mes), feature flags (LaunchDarkly/Statsig ~$0-300/mes) y A/B testing (Statsig $0-500/mes). El stack equivalente con GA4 base ronda **$1.2k-12k/año** en herramientas adicionales.

---

## 5. Implementación en Next.js 16

PostHog publica SDK oficial JS + integración con Next.js App Router via `instrumentation-client.ts`. La inicialización canónica vive en ese archivo (no en un provider en `app/layout.tsx`).

Variables de entorno actuales:
```bash
NEXT_PUBLIC_POSTHOG_TOKEN=phc_xxx        # token público (ojo con el cambio de NEXT_PUBLIC_POSTHOG_KEY a TOKEN)
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Pageview capture en App Router se maneja automáticamente desde la SDK reciente (no es necesario `capture_pageview: false` + capture manual como en versiones pasadas).

Para detalles puntuales del wiring referirse a la guía oficial: [posthog.com/docs/libraries/next-js](https://posthog.com/docs/libraries/next-js).

**Nota sobre `person_profiles: 'identified_only'`:** este setting controla **cuándo se crea un person profile** (solo cuando hay identify), no el conteo de eventos. NO reduce el costo del free tier de manera directa. Si lo que se busca es bajar volumen, usar `disable_session_recording: true` para users anónimos o filtros de captura específicos.

---

## 6. Eventos críticos a trackear (lista mínima)

- `signup_started` / `signup_completed` (con `signup_source`)
- `lecture_started` (con `lecture_id`, `section_id`)
- `slide_completed` (con `slide_id`, `kind`, `xp_earned`, `time_spent_seconds`)
- `lecture_completed` (con `total_xp`, `total_time_seconds`)
- `slide_flagged` (cuando UI esté wired — la tabla `slide_flags` ya existe)
- `subscription_started` / `subscription_canceled` / `subscription_payment_failed`
- `tutor_message_sent`
- `b2b_seat_invited` / `b2b_seat_activated` (cuando B2B esté wired)

Group analytics activo desde día 1: `posthog.group('company', companyId)` para cuentas B2B.

---

## 7. Decisión recomendada

| Decisión | Recomendación |
|---|---|
| Tool | PostHog Cloud US |
| Plan inicial | Free tier (1M eventos/mes) |
| Region | US (latencia <100ms desde LATAM) |
| Identificación | Gather identification cuando user firma in (no eager) |
| Group analytics | Activar desde día 1 |
| Self-host | Documentado pero no implementado hasta exigencia explícita de cliente B2B |
| Plan B si pricing cambia | Mixpanel (per-event ahora, suite competitiva) |
| Plan C si enterprise lo exige | Amplitude (group analytics maduro, ya está en stacks de Mercado Libre/Rappi) |

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| PostHog sube precios | Self-host es opción real (open source genuino) |
| Free tier insuficiente antes de M12 | Volumen real M6-M12 esperado <3M/mes; costo en plan paid sigue bajo (~$100-150/mes) |
| Cliente B2B exige data residency LATAM | Self-host en infra propia (Hetzner/Fly.io en sa-east-1, ~$50-100/mes) |
| Analytics afecta performance | PostHog usa beacon API, latencia ~5ms, async |
| GDPR/LFPDPPP compliance | Cookie consent banner + opt-out flag, soportado nativo |

---

## 9. Fuentes

- [posthog.com/pricing](https://posthog.com/pricing)
- [mixpanel.com/pricing/](https://mixpanel.com/pricing/)
- [amplitude.com/pricing](https://amplitude.com/pricing)
- [support.google.com/analytics/](https://support.google.com/analytics/)
- [posthog.com/docs/libraries/next-js](https://posthog.com/docs/libraries/next-js)
- [posthog.com/blog/best-product-analytics-tools-for-startups](https://posthog.com/blog/best-product-analytics-tools-for-startups)

---

**Versión 2** — recomendación a 2026-04-22 con pricing y features verificados. Re-evaluar trimestralmente si hay cambios materiales en pricing o features.
