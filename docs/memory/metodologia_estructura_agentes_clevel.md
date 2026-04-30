---
type: metodologia
title: estructura actual de agentes — c-level (no más 12 conversaciones por dominio)
date: 2026-04-27
tags: [metodologia, orquestacion, agentes, estructura]
dept: [orq]
---

La estructura de orquestación cambió desde abril 2026. Ya **no son 12 conversaciones por dominio técnico** (Backend, Components, Dashboard, Education, Finance, Gamification, etc.) — esa estructura quedó deprecada. Ver `metodologia_orquestacion_12_conversaciones.md` como histórico.

**Estructura nueva (al 2026-04-27):**

| Agente | Responsabilidad | Runtime |
|---|---|---|
| CEO | Visión, hitos, decisiones top-level, fundraising | Claude Code |
| CFO | Pricing, unit economics, runway, billing, forecast | Claude Code |
| CMO | Marketing, branding, narrativa pública, ads, contenido | Claude Code |
| CGO | Growth, adquisición, canales, SEO, outbound | Claude Code |
| CTO | Eng, infra, arquitectura, costos técnicos, eng execution | Claude Code |
| CPO | Producto, experiencia, stickiness, roadmap producto, copy interno | Claude Code |
| Orquestador | Coordina cruces entre los C-level | Claude Code |
| (sitio en Codex) | — | Codex |

**Pablo es el único humano** y operate solo. Los agentes ejecutan, el Orquestador coordina, Pablo decide los puntos no delegables.

**Implicaciones para cada rol:**
- Ya **no hay** "conversación Landing", "conversación Dashboard", "conversación Education", etc. Esos dominios técnicos los ejecuta CTO. Los dominios producto los lleva CPO. La narrativa/copy público lo lleva CMO.
- Cualquier referencia en docs/memory previas a "Itera: Backend", "Itera: Components", etc. está stale.
- El Orquestador trabaja sobre 6 inputs (5 C-level + sí mismo), no sobre 12.

**Stage real del producto (al 2026-04-27):**
- Producto recién salido al mercado.
- Pablo solo operando.
- Budget aproximado: 50k MXN total, ~8k MXN/mes de costo del producto.
- Target del mes: cerrar ~10 usuarios.
- NO hay runway Q2 ni hito tipo "$10k MRR". Es validación temprana.

**Por qué:** Pablo cambió la estructura para reducir overhead de coordinación (12+1 → 6+1) y delegar verticalmente por función ejecutiva, no por dominio técnico.

**Cuándo aplicar:**
- Cualquier agente que arranque sesión nueva debe leer esta memoria antes que `metodologia_orquestacion_12_conversaciones.md`.
- Al recibir un reporte de un dominio técnico viejo (ej. "el agente Landing reporta..."), traducirlo: probablemente es CTO o CPO ahora.
- El Orquestador opera sobre 6 inputs, no 12.
