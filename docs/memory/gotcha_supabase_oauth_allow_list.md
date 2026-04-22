---
type: gotcha
title: oauth de supabase: site_url + allow_list deben estar configurados con patterns /**
date: 2026-04-21
tags: [supabase, oauth, google, auth]
---

Si Supabase OAuth cae en `http://127.0.0.1:3000/?code=...` (o en la home en vez de `/auth/callback`), el problema es que el `redirectTo` que manda el cliente **no matchea el allow_list**, y Supabase hace fallback silencioso a `site_url`. El crash ocurre porque la home no tiene el handler para intercambiar el code.

Configuración canónica (vía Management API, proyecto `mteicafdzilhxkawyvxw`):

```
site_url = "https://itera.la"
uri_allow_list = "http://127.0.0.1:3000/**,http://localhost:3000/**,https://itera.la/**,https://*.itera.la/**,https://*.vercel.app/**"
```

Notas críticas:
- El `/**` al final es **obligatorio** — sin él no matchea `/auth/callback`.
- Incluir **ambos** `http://127.0.0.1:3000` y `http://localhost:3000` porque el browser redirige a 127.0.0.1 en algunos casos con Google OAuth.
- Incluir `*.vercel.app` para previews.
- Incluir `*.itera.la` para subdominios.

El fallback a `OAuthRedirectHandler.tsx` en la home es un band-aid que no debe reemplazar esta config.

**Por qué:** Supabase usa el allow_list como allowlist estricta; cualquier URL no matcheada se descarta y cae a `site_url`. No hay error visible — solo un redirect silencioso que confunde el debugging.

**Cuándo aplicar:** cualquier bug de OAuth donde el `?code=...` aparezca en la URL equivocada. También al agregar un nuevo ambiente (staging, preview, dominio custom).
