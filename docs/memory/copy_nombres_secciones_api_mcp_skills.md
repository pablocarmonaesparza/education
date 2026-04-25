---
type: copy
title: nombres de secciones — "api" (no "apis"), "mcp y skills" (skills plural)
date: 2026-04-21
tags: [copy, secciones, nombres]
dept: [cmo]
---

Reglas de nombres de sección decididas con Pablo:

- **"API"** (no "APIs"). La forma natural sería "API's" pero no se puede, así que se queda en singular.
- **"MCP y Skills"** (no "MCPs y Skills"). MCP en singular igual por la misma regla.
- **"Skills"** sí lleva la s — es el nombre propio del producto de Anthropic, no un plural.

Aplicado en prod:

```sql
UPDATE public.sections SET name = 'API' WHERE id = 7;
UPDATE public.sections SET name = 'MCP y Skills' WHERE id = 11;
```

Y sincronizado en `docs/LESSONS_v1.md`.

**Por qué:** quote literal de Pablo: *"Necesito que las secciones no se llamen APIS porque es API's, pero como no se puedes, mejor cambia el nombre a API solamente e igual MCP, el que si se queda con S es SKILLS"*.

**Cuándo aplicar:** al crear copy nuevo (landing, lecciones, marketing) que mencione estas secciones. No pluralizar siglas en general — escribir "crea una API" / "usa MCP", no "crea APIs" / "usa MCPs". Skills sí puede aparecer plural porque es nombre propio.
