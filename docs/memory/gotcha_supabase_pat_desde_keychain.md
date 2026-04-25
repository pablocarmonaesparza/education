---
type: gotcha
title: extraer el pat de supabase cli desde macos keychain para usar management api
date: 2026-04-21
tags: [supabase, cli, macos, keychain, management-api]
dept: [cto]
---

El Supabase CLI guarda el Personal Access Token en macOS Keychain (servicio "Supabase CLI", cuenta "supabase") en formato `go-keyring-base64:<base64>`. Para usarlo con la Management API sin pedirle al usuario que genere uno nuevo:

```bash
security find-generic-password -s "Supabase CLI" -a "supabase" -w | sed 's/^go-keyring-base64://' | base64 -d
```

Eso devuelve un token `sbp_...` válido para endpoints de https://api.supabase.com/v1/ (ej. `PATCH /v1/projects/{ref}/config/auth`).

**Por qué:** en un momento necesitaba cambiar `site_url` y `uri_allow_list` vía API porque `supabase config push` (v2.75 y v2.90) no exponía todos los campos. Pedirle a Pablo que genere un PAT nuevo en la UI era fricción innecesaria. La feedback literal de Pablo fue: *"Espera todo lo que me pides puedes hacerlo tu directamente"*. Esto destapó el truco.

**Cuándo aplicar:**
- Cuando el CLI no soporta una key de config (el schema se queda atrás de los campos reales).
- Cuando necesitas hacer un PATCH puntual a la auth config (HIBP, password policy, allow_list) sin tocar toml.
- Cuando vas a operar sobre un proyecto existente y el usuario ya ha hecho `supabase login` alguna vez.

No guardar nunca el token extraído en un archivo. Usar inline en un Bash call y listo.
