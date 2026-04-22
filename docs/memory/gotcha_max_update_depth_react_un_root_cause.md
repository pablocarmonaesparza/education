---
type: gotcha
title: "maximum update depth exceeded" casi siempre tiene un solo root cause
date: 2026-04-21
tags: [react, debugging, performance]
---

Cuando React reporta "Maximum update depth exceeded" en varios componentes a la vez (XpBar, useTutorChat, dashboard, etc.), normalmente hay **un solo infinite loop** — los demás errores son colaterales porque React reporta cada setState que ocurre durante el mismo render ciclo. No persigas cada mensaje; busca la causa raíz.

Silver bullet en este repo: en `app/dashboard/page.tsx` había un `useEffect` con dep `videosByPhase` que se recreaba en cada render (objeto nuevo). Se arregló con `useMemo` para `videosByPhase` y `orderedPhaseEntries`. Al arreglar ese loop, los 4 errores desaparecieron juntos.

**Por qué:** React batched renders hacen que un setState en loop dispare re-renders en toda la tree, lo que causa que cualquier otro componente con un setState legítimo durante el render también aparezca en el stack trace. Perseguir XpBar o useTutorChat individualmente era una pérdida de tiempo.

**Cuándo aplicar:** cada vez que veas múltiples "Maximum update depth exceeded" de componentes distintos en una misma sesión. Primer paso: buscar `useEffect` con dependencias que sean objetos/arrays creados inline en el render. Sospechar de cualquier `.reduce()`, `.map()`, `.filter()`, o spread en el cuerpo del componente que después se usa como dep.
