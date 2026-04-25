---
type: decision
title: landing — estado al cerrar agente Landing 22-23 abril
date: 2026-04-23
tags: [landing, handoff, estructura, b2b, hero-shader]
---

Cierre del agente Landing tras 11 commits del fin de semana 22-23 abril. Estado para que el próximo agente que tome el frente Landing entre con contexto sin reconstruirlo desde `git log`.

**Landing en producción (`/`) actual:**

```
Hero (NewHeroSection)
  - shader interactivo de Claude Design (HeroShader.tsx, partículas con
    mouse repulsion + click shockwaves, ResizeObserver + IntersectionObserver
    para perf en mobile)
  - eyebrow "lecciones nuevas diariamente"
  - H1 "ai de 0 a 100" con accent "0 a 100" en text-primary
  - sub "Más de 100 lecciones de AI, Automatización, Vibe Coding y mucho más"
  - CTA primary "empezar gratis" → auth modal con AuthForm
  - chevron "Precios ↓" → scroll a #pricing
   ↓
Pricing (3 tiers)
  - free: primeras 20 lecciones + sección de fundamentos
  - monthly $19/mes (CTA primary, único signal de "recomendado")
  - yearly $199/año con sub-línea "Ahorras $X vs. mensual"
  - sin badge "más popular" (eliminado por matar armonía visual)
   ↓
FAQ (5 preguntas, tono explicativo)
  - sin pregunta defensiva "¿son videos?"
  - tipografía sin uppercase forzado en preguntas
  - footer integrado dentro de la sección
```

**Navbar:**
- Inicio · Precios · FAQ (3 links, indicator pill activo desde page load porque `useState<string|null>("hero")`).
- bg siempre visible (`bg-white/40` + `backdrop-blur-sm` al top, `bg-white/90` al scrollear).
- CTA "Comenzar →" a `/auth/signup` con `depth="full"`.

**Componentes archivados** (vivos en `components/landing/` pero no rendereados; imports comentados en `app/page.tsx` para re-habilitar trivial):
- `HowItWorksSection.tsx` — bloqueado en `experimento_how_it_works_visual` (Remotion vs screenshots vs keep illustrations).
- `AvailableCoursesSection.tsx` — funcional, archivada junto con HowItWorks.
- `ProjectInputSection.tsx` — textarea "describe tu proyecto" + redirect a signup con `pendingProjectIdea` en sessionStorage. Archivada por Pablo (decisión final pendiente entre borrar permanente o preservar para revival).

**Página experimental viva:** `/landingPrueba` — 6 secciones candidatas (curriculum preview, para-quién, prueba-mcq interactivo, metodología, garantía, herramientas). Espera evaluación de Pablo para decidir cuál(es) mover a la landing real. Commit `54f61f9`.

**Por qué:** Pablo decidió mover el posicionamiento de "describe tu idea / curso modular personalizado" hacia "aprender AI para tu empresa" (B2B empresa-first, ver `gotcha_posicionamiento_empresa_vs_latam.md`). Hero + pricing + faq es el landing que comunica eso bien sin ruido. Las secciones archivadas hablaban en lenguaje B2C / proyecto-personal.

**Cuándo aplicar:**
- Antes de tocar `app/page.tsx` o cualquier sección de `components/landing/`: leer este memo + `gotcha_posicionamiento_empresa_vs_latam.md` (B2B real) + `gotcha_landing_technical_debt.md` (parcialmente desactualizado, ver abajo).
- Si Pablo decide qué secciones de `/landingPrueba` van a producción, **el código en `app/landingPrueba/page.tsx` usa data hardcodeada** para curriculum y herramientas. En producción la sección de curriculum debe leer de Supabase (`sections` + `lectures` tablas, ver `lib/lessons/fromSupabase.ts` para el patrón).
- **Tokens semánticos aplicados.** Components agent refactoreó hex inline → tokens (`text-primary` en vez de `text-[#1472FF]`, `text-ink` en vez de `text-[#4b4b4b]`, `text-ink-muted`, `border-primary`, `bg-primary`, etc.) en todos los archivos de landing. `gotcha_landing_technical_debt.md` decía "~15 violaciones" — ya no aplica para landing, sigue válido para otras carpetas. Usar tokens semánticos en cualquier componente nuevo.
- **5 imports muertos en `app/page.tsx`** (HowItWorksSection, AvailableCoursesSection, ProjectInputSection y los componentes que importan). ESLint no falla pero ensucian. Cleanup pendiente low-priority — fácil de incluir junto con cualquier edit estructural a page.tsx.

**Decisiones de Pablo pendientes (orden de impacto):**
1. `/landingPrueba` — qué secciones van a producción y en qué orden.
2. `experimento_how_it_works_visual` — Remotion vs screenshots vs keep ilustraciones genéricas. Bloquea revival de HowItWorksSection.
3. ProjectInputSection — borrar permanente o preservar archivada.
4. Páginas nuevas propuestas: `/empresa` (B2B dedicated), `/manifesto` (founder story), `/catalogo` (100 lecciones indexables).

**Mea culpa metodológico para próximas sesiones:**
Antes de ejecutar `/ralph-wiggum` sobre archivos compartidos como `app/page.tsx`, hacer `git diff HEAD` + leer cada import en el archivo para entender qué cambios sin commit hicieron otros agentes. En esta sesión yo re-habilité secciones viejas (commit `d612f05`, revertido en `473ab07`) porque no vi que `<ProjectInputSection />` ya estaba en el render — creado por agente Onboarding en sesión paralela y nunca commiteado. La regla: **auditar working tree completo antes de ejecutar calls estructurales sin pedir confirmación.**
