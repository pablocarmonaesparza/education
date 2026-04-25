---
type: aprendizaje
title: pablo no quiere instrucciones manuales — ejecutar directamente vía mcp/cli
date: 2026-04-21
tags: [operacion, pablo, workflow]
dept: [orq]
---

Cuando hay una operación que yo puedo ejecutar directamente (via MCP Supabase, Supabase CLI, Management API, gh, git, etc.), **hacerla directamente** en vez de pedirle a Pablo que entre al Dashboard y haga clics. Feedback literal: *"Espera todo lo que me pides puedes hacerlo tu directamente."*

Aplica incluso a cosas que uno asume que requieren UI:
- Cambiar `site_url` o `uri_allow_list` → Management API con PAT del Keychain.
- Aplicar migrations → `mcp__supabase__apply_migration` o CLI.
- Renombrar datos en prod → `mcp__supabase__execute_sql` con UPDATE directo.
- Revisar advisors → `mcp__supabase__get_advisors`.

Si genuinamente no puedo ejecutar algo (ej. approve billing, subir de plan Free → Pro, aceptar TOS nuevo), explicar **por qué** no puedo y dar el link exacto. Nunca decir "abre el Dashboard y ve a Authentication > X" cuando existe un endpoint o CLI.

**Por qué:** fricción. Pablo está en flow y cualquier context switch al browser mata la sesión. Además, las instrucciones verbales a UIs envejecen mal (Supabase Dashboard redesigna cada par de meses).

**Cuándo aplicar:** siempre. Antes de escribir "ve a X en el Dashboard", preguntarse: ¿tengo un MCP/CLI/API para esto? Si sí, úsalo. Si no, di exactamente qué y por qué.
