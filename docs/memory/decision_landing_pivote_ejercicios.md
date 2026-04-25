---
type: decision
title: landing realineada a ejercicios interactivos + dos rutas
date: 2026-04-22
tags: [landing, copy, pivote, ejercicios]
dept: [cpo, cmo]
---

Se realinearon 5 archivos de `components/landing/` del posicionamiento viejo ("curso personalizado de videos") al nuevo ("ejercicios interactivos + dos rutas: completa y personalizada"). Scope: copy only, cero cambios de layout/componentes/visuales.

**Archivos tocados:**
- `NewHeroSection.tsx` — 5 suggestion chips (B2B jargon → escenarios trabajo/negocio), placeholder nuevo.
- `HowItWorksSection.tsx` — 3 steps reescritos: videos → ejercicios; tesis "no te falta información, te falta practicarla".
- `AvailableCoursesSection.tsx` — 11 course types re-etiquetados a las 10 secciones reales + "prompting que funciona"; subtítulo "1,000 videos" → "100 lecciones interactivas".
- `PricingSection.tsx` — CTAs lowercase ("COMENZAR MENSUAL" → "empezar mensual"); features alineadas a ejercicios/rutas.
- `FAQSection.tsx` — 4 FAQs actualizadas + 1 nueva "¿Son videos?" que ataca el mayor malentendido.

**Por qué:** la landing anterior decía "videos ordenados paso a paso" y "nuestra IA analiza miles de videos" pero el producto real entrega `lectures` → `slides` (10 por lección) con 11 tipos de ejercicios interactivos. Divergencia explícita entre marketing y producto = churn garantizado. `CONTEXT.md` establece que el formato principal son ejercicios, no videos.

**Cuándo aplicar:** antes de tocar copy de landing, volver a leer esta memoria para no regresar al lenguaje de "videos". Si se añade sección nueva o se modifica copy existente, alinear con "ejercicios interactivos" y "dos rutas". Los archivos `HeroSection.tsx`, `SocialProofSection.tsx`, `DifferentiatorsSection.tsx`, `ProblemSolutionSection.tsx` todavía tienen copy viejo pero están muertos (ver `gotcha_landing_technical_debt`).
