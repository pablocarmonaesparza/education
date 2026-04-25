---
type: negocio
title: hibp (leaked password protection) requiere supabase pro — bloqueado en free
date: 2026-04-21
tags: [supabase, pricing, seguridad, plan]
dept: [cto, cfo]
---

Activar **HaveIBeenPwned leaked password protection** en Supabase devuelve `402 Payment Required` con el mensaje *"Configuring leaked password protection via HaveIBeenPwned.org is available on Pro Plans and up."* en el plan Free.

Estado actual del proyecto `mteicafdzilhxkawyvxw`: plan **Free** (org "Beta AI" `lhxcwfagdkyzvheqbzqy`). Password policy sí se pudo aplicar (min 8 chars + letters_digits). HIBP queda pendiente hasta que suba a Pro ($25/mes).

**Por qué:** Supabase gate a este feature en Pro. No hay workaround por CLI ni config.toml — es enforcement del billing layer.

**Cuándo aplicar:**
- Si el advisor de seguridad reporta "Leaked Password Protection Disabled", explicar a Pablo que es una decisión de plan, no un bug técnico.
- Antes de anunciar la plataforma públicamente, considerar si HIBP vale los $25/mes (sí, si llega tráfico real; por ahora no).
- Cualquier otra feature gated en Pro (branching, log retention >1 día, compute upgrades) tendrá el mismo tipo de error 402.
