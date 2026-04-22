---
type: experimento
title: hero rediseñado via claude design
date: 2026-04-22
tags: [hero, landing, claude_design, diseno]
---

Pablo va a traer un diseño de hero desde **Claude Design** (producto nuevo de Anthropic Labs lanzado el 17 abril 2026, disponible en `claude.ai/design`). El H1 actual — "un curso a partir de tu idea" — le gusta visualmente pero no comunica el posicionamiento nuevo de "aprender AI para tu empresa". Esperando el output para implementar.

**Por qué:** el pivote de posicionamiento (ver `gotcha_posicionamiento_empresa_vs_latam`) requiere reescribir el hero entero. Es cambio estructural, no solo copy. Claude Design permite pasar el design system de Itera (`CLAUDE.md` + `components/ui/` + `app/componentes`) y genera variantes alineadas al mismo lenguaje visual (depth 3D, Darker Grotesque, paleta `#1472FF`). En la misma sesión también se instaló el MCP de Perplexity (ver `aprendizaje_perplexity_mcp`) para research paralelo.

**Cuándo aplicar:** cuando Pablo traiga el output de Claude Design:
- Confirmar scope: **solo hero**, no toda la landing.
- Verificar constraints: usar solo componentes de `components/ui/`, cero hex inline, titulares en minúsculas (excepto nombres propios).
- Si el diseño propone componentes nuevos que duplican los existentes, rechazar y componer con primitivos.
- Verificar que el H1 nuevo refleje "aprender AI para tu empresa" y no vuelva al tono hobby/personal.
- El resto de secciones (`HowItWorks`, `AvailableCourses`, `Pricing`, `FAQ`) ya fueron realineadas al posicionamiento nuevo el 22 abril — mantener coherencia.
