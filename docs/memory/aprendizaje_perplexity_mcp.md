---
type: aprendizaje
title: perplexity mcp instalado + heurística de búsqueda web
date: 2026-04-22
tags: [perplexity, mcp, tooling, busqueda]
---

Instalado el MCP de Perplexity a nivel **usuario** (`~/.claude.json` scope user). Disponible en todas las sesiones de Claude Code, cualquier proyecto. Tres herramientas:
- `mcp__perplexity__search` — Sonar Pro. Queries simples, lookup técnico puntual.
- `mcp__perplexity__deep_research` — Sonar Deep Research. Reportes largos con síntesis.
- `mcp__perplexity__reason` — Sonar Reasoning Pro. Comparativas, explicaciones, "por qué".

**Heurística de cuándo usar qué (decidida en sesión):**

| Necesidad | Herramienta |
|---|---|
| Noticias frescas (<2 semanas) | `WebSearch` built-in + `WebFetch` a fuentes oficiales |
| Lookup técnico con docs establecidas | `perplexity_search` |
| Análisis, "cuál elijo", comparativas | `perplexity_reason` |
| Reporte competitivo profundo con estructura | `perplexity_deep_research` |
| Research competitivo + artifact markdown | skill `/market-intel` (usa Perplexity debajo) |

**Por qué:** primera búsqueda de Claude Design con Perplexity falló con un query largo lleno de sub-preguntas ("What features, pricing, comparison to Figma, Opus 4.7 additions, export formats, integrations, rate limits..."). Reintento con "What is Claude Design by Anthropic?" (6 palabras) devolvió respuesta rica y bien citada. Lección: Perplexity Sonar Pro prefiere queries **concisos tipo pregunta humana**, NO briefs largos tipo requirements doc. También importante: Perplexity tiene lag de índice — para noticias frescas `WebSearch` built-in gana.

**Cuándo aplicar:** antes de escribir un prompt a Perplexity, pensar primero *"¿qué pregunta haría un humano curioso?"* y mandar eso. Si hace falta profundidad, pedirla después con follow-up. No meter todo en el primer query.

**Gotcha (seguridad):** la API key de Perplexity se ingresó en `~/.claude.json` y quedó expuesta brevemente en chat durante la instalación. Pablo debe **rotarla** en el dashboard de Perplexity cuando pueda. Para futuras keys, preferir env var (`~/.zshrc`) en vez de inline en config — más limpio y reduce superficie de exposición.
