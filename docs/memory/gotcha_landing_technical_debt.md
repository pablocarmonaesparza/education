---
type: gotcha
title: deuda técnica acumulada en components/landing/
date: 2026-04-22
tags: [landing, technical_debt, design_system, dead_code]
---

La carpeta `components/landing/` tiene dos problemas acumulados que no son bloqueantes pero importan:

**1. Dead code con copy viejo:**
`HeroSection.tsx`, `SocialProofSection.tsx`, `DifferentiatorsSection.tsx`, `ProblemSolutionSection.tsx` todavía mencionan "400+ videos de 1-3 minutos", "400 videos de 1-3 minutos me permitieron aprender", etc. Pero NO se importan en `app/page.tsx` — no se renderizan. Ocupan espacio mental y aparecen en `Grep`.

**2. Violaciones de CLAUDE.md (~15 lugares):**
- Hex inline (`text-[#4b4b4b]`, `bg-[#1472FF]`, `border-[#0E5FCC]`)
- `<h1>`/`<h2>` crudos en vez de `<Title>`/`<Subtitle>` del sistema
- Border manual (`border-4 border-b-8 active:border-b-4 active:mt-[4px]`) en vez de `depthBase`
- Badge "MÁS POPULAR" con clase CSS `uppercase` forzado (texto dice "más popular", CSS lo sube)
- CTAs `motion.button` custom en vez de `<Button>` del sistema

Inconsistencia importante: el **dashboard** sí respeta el contrato de `CLAUDE.md`; la **landing** lo rompe. Un prospect ve landing "estilo SaaS template" y entra a dashboard "estilo app pulida" — cognitive dissonance.

**Por qué:** la landing se escribió antes de que el design system se codificara en `CLAUDE.md` + `components/ui/`, y no se hizo un refactor de alineación cuando se añadieron los componentes. El dead code es residuo del posicionamiento viejo de "videos" (ver `decision_landing_pivote_ejercicios`).

**Cuándo aplicar:** si se va a hacer refactor visual de landing, atacar estos dos frentes juntos. Si solo se toca copy (como el pivote del 22 abril), no bloquear el merge. Antes de rediseñar hero con Claude Design (ver `experimento_hero_claude_design`), decidir si se borra dead code o se migra contenido reciclable. Si `/design-review` o `/health` reportan violaciones de diseño, esta memoria explica el contexto.
