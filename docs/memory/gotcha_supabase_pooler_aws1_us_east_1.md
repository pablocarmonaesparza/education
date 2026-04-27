---
type: gotcha
title: supabase session pooler — usar aws-1-us-east-1, no aws-0-us-east-1
date: 2026-04-27
tags: [supabase, pooler, gbrain, dns, connection]
dept: [cto]
---

cuando un proyecto supabase está en region us-east-1, hay 2 pools del session pooler: `aws-0-us-east-1.pooler.supabase.com` y `aws-1-us-east-1.pooler.supabase.com`. el proyecto puede vivir en cualquiera de los dos — no es predecible por region sola.

síntoma del pool incorrecto: error `Tenant or user not found` al conectar. parece error de credenciales pero no lo es.

**fix:** probar ambos prefijos. el dashboard de supabase muestra el correcto en Settings → Database → Connection Pooler → Session.

**caso real:** el proyecto "LLM's Memory" (`bfybskvhngitvyoewoeq`, us-east-1) responde solo en `aws-1`, no `aws-0`. configurado para gbrain el 2026-04-27.

**también:** el host directo `db.<ref>.supabase.co` puede ser **IPv6-only** (sin A record). node/bun no resuelve eso por default → fallback obligatorio al pooler. el pooler tiene DNS IPv4 + IPv6.
