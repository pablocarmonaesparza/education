---
type: vision
title: Product vision one-pager v0 — feel + tono + referencias visuales
date: 2026-05-19
authors: [claude]
reviewers: [pablo]
status: draft-v0-pending-pablo-correction
scope: define el feel visual + tono + referencias concretas para el front v2 cleanroom. Draft v0 inferido del trabajo previo + research + memory. Pablo debe corregir antes de empezar shell visual
---

# Product vision one-pager — Itera Simulador v2

> **Nota crítica:** este es **v0 draft**. Está inferido de research previo + decisiones M9-3 + brand_guidelines_v1 + buyer_persona. Pablo debe corregir cada sección antes de que codex empiece shell visual. Sin corrección explícita de Pablo, NO arrancar implementación.

## 1. Referencias visuales concretas

**Tres referencias que Itera Simulador debe sentirse como:**

1. **Linear (linear.app)** — issue density grids, drill-down patterns, accent color sutil, typography tight, lowercase corporate. **Usar de:** dashboard manager + admin queue
2. **Anthropic Console (console.anthropic.com)** — eval results grids, confidence visualization, premium serio sin ser corporate-bot. **Usar de:** judge evidence display + report ejecutivo
3. **Vercel Dashboard (vercel.com/dashboard)** — depth informacional + breathing room + tipografía generosa. **Usar de:** landing pública + onboarding wizard

**Una referencia que NO debe sentirse como:**

- **NO Notion-clone:** Itera no es app de productividad genérica
- **NO Coursera/Udemy/Khan Academy:** no somos LMS
- **NO Slack/Discord:** no somos messaging
- **NO Itera Courses (versión anterior):** no somos training/curso
- **NO Section AI / Wharton Interactive:** no somos cohort experience

## 2. Tono

**Premium B2B serio LATAM mid-market.** Específicamente:

- **Confianza sin arrogancia** — anchored research-grade (Stanford 88% / MIT NANDA 95% / Gallup 50%), no claims sin evidencia
- **Profesional sin corporate-bot** — Pablo personal voice, conversacional, lowercase corporate, español neutro LATAM
- **Premium sin lujo ostentoso** — Apple-style precision, no gold gradients
- **Honesto sin defensivismo** — admite límites (no certification, no compliance-grade hasta DPA enterprise, hybrid review for risk events high)

## 3. Densidad

**Dashboard ejecutivo + experiencia guiada por contexto.**

- **Dashboard manager:** Linear-style density. Matriz 3×5 + lista participantes + KPIs en 1 pantalla sin scroll vertical largo. El manager necesita visión panorámica en 5 segundos.
- **Runtime participante:** Stripe Atlas / Linear sign-up density. 1 sección por pantalla, breathing room, no abruma. Caso vivo es focus profundo, no quick task.
- **Landing pública:** Vercel-style mid-density. Hero generoso + stats + categorías + cases + pricing + footer. Scroll natural pero NO infinito.
- **Reporte ejecutivo:** Anthropic Console density. Datos densos pero legibles, evidencia textual citable, exportable a PDF.

## 4. Qué jamás debe parecer

| Anti-pattern visual | Por qué NO |
|---|---|
| Gradientes pastel + emojis + Lottie animations | rompe premium B2B serio |
| Cohort cards con "Module 1, Module 2..." | confunde con LMS |
| "Earn your certificate!" badges | rompe frame diagnóstico ≠ cert |
| Sidebars con 30 items navegación | sin scope claro, no es app productividad |
| Skeleton loaders Notion-style | no necesario — diagnóstico es evento, no consulta diaria |
| Color semáforo (verde/amarillo/rojo) para bandas | rompe frame "criterio no es juicio moral" — usar accent indigo + grays |
| Marketing copy AI-slop ("revoluciona", "transforma") | brand voice exige honestidad |
| Carousels en landing | clase de 2010, B2B serio LATAM 2026 NO |
| Chatbot widget en esquina | no somos support tool |
| Cookie banner agresivo | privacy by design, M9-3-D90 |

## 5. Principios de interacción

1. **Cada acción es decisión, no clic casual.** Botones primary son indigo accent, descansados pero no neon.
2. **Estados visibles inmediatamente.** Manager VE banda + risk events sin click. Participante VE su progreso sin doble click.
3. **Errores empáticos sin zalamería.** `errors.ts` ya tiene el tono — implementar consistent.
4. **Latency tolerable + estados de loading honestos.** Judge LLM toma 15-30s → mostrar "Evaluando tus decisiones contra la rúbrica. ~15-30 segundos" no spinners genéricos.
5. **Tooltips informativos, no decorativos.** Si un término es ambiguo (ej. "banda M"), tooltip explica. No tooltips en buttons obvios.
6. **Mobile-first NO aplica.** B2B LATAM mid-market manager usa desktop. Mobile usable pero NO optimized. Excepción: field-test público debe ser mobile-friendly (lead capture en cualquier device).
7. **Keyboard shortcuts solo para admin.** Esc cierra modals, Enter submit forms. NO power-user shortcuts complejos (no Linear-style ⌘K palette en v2).

## 6. Nivel de sofisticación

**Sofisticado pero accesible.** El comprador es Head/VP Marketing/Growth/Ops LATAM mid-market (M9-3-D14):

- Lee LinkedIn diario, conoce Stanford/MIT/McKinsey research anchors
- NO es technical (no developer, no data scientist)
- Aprecia depth pero rechaza jargon innecesario
- Decide con 60-80% señal, no requiere certeza absoluta
- Reportes le sirven para C-suite handoff (debe ser legible por CMO/CEO)

**Implicación visual:**
- Gráficas usan accent color sutil + grayscale (no rainbow charts)
- Métricas en mono font (12-14px) con labels en sans-serif normal
- Evidencia textual en quotes destacados, no raw paste
- Risk events humanizados (no "exposed_pii_to_model" en UI — usar "PII expuesta al modelo sin clasificar")

## 7. Cómo se siente el runtime (caso vivo)

**Focus profundo + sin distracción + ritmo de decisión.**

- 1 sección por pantalla (Contexto → Datos → IA → Revisión → Decisión → Respuesta)
- Progress indicator visible top (6 dots o stepper minimalist)
- NO sidebar durante runtime — solo el caso
- Auto-save visible discretamente (1 línea bottom "Guardado hace 2s")
- Voice input opcional (Whisper) en respuestas largas
- Backbutton NO desconfía — permite navegar pero warning si vas a perder datos
- Submit final tiene confirmation modal explícito ("Una vez enviado, el judge evalúa. No podrás modificar.")
- Post-submit: pantalla "Evaluando..." con timer + frase honesta ("El judge LLM compara tus decisiones contra la rúbrica.")

## 8. Cómo se siente el reporte manager

**Documento ejecutivo serio + scannable + shareable.**

- Eyebrow "Reporte ejecutivo" + headline grande con nombre del participante
- Sección bandas: 5 dimensiones con barra horizontal + número (no semáforo)
- Sección recomendación: 1 chip prominent (Pilotar/Entrenar/Pausar/Escalar) + body 2-3 frases
- Sección risk events: lista con severity + evidence_text en quote
- Sección next 7-day actions: 3-4 bullets accionables
- Footer audit metadata: rubric version, judge model, calibration set version (transparencia para skeptical CTO)
- Disclaimer honesto: "Diagnóstico operativo. No es certificación ni assessment psicométrico."
- Botón "Exportar PDF" + "Compartir con stakeholders" (modal con scope explicito de quién verá)

## 9. Lo que el buyer debe pensar al primer touch

**Landing → 5 segundos primer scroll:**
> "Esto NO es otro curso de IA. Esto mide cómo decide mi equipo cuando usa IA en flujos reales. Quiero ver el demo."

**Demo call → 30 minutos:**
> "OK, no es certificación. Es diagnóstico operativo. El reporte ejecutivo lo puedo compartir con mi CMO sin avergonzarme. Vale los $4-8K."

**Post-sprint → reporte abierto:**
> "Wow, esto sí ve qué pasa en mi equipo cuando usa IA. La evidencia textual es real, no inventada. La recomendación es accionable."

**90 días después → NPS encuesta:**
> "Sí, lo recomendaría a otros Heads de Marketing. El reporte se ha quedado vivo en mi gestión."

## 10. Pantalla que debe impresionar primero

**Recomendación claude (Pablo decide):** el **dashboard manager con matriz 3×5** debe ser la "wow moment" del demo.

Por qué:
- Es el frame más diferenciador vs Section AI / Wharton (ellos NO tienen matriz operativa)
- Es lo que el buyer comparte con su C-suite (proof de seriedad)
- Reclama la categoría "criterio IA medible" (M9-3-D33 + B9-001-D2 cuando se cierre)

**Trade-off:** Codex marcó esto como pendiente B5-002 (no construido). Si la matriz 3×5 es el wow moment, debe entrar en el shell visual de Codex (no esperar a post-customer-zero).

**Alternativa si matriz se difiere:** el **reporte ejecutivo del participante** con evidencia textual citada del transcript es alternative wow moment. Anthropic Console-style. Más rápido de construir.

## 11. Coherencia cross-surface

Lo que une las 8 surfaces:
- **Mismo accent color** (indigo) en CTAs primary
- **Misma typography** (sans-serif system font o Inter, lowercase corporate)
- **Mismo spacing system** (Tailwind generous: lg+ default)
- **Mismas microcopy vocabulary** (criterio / banda / diagnóstico / manager / decidir — `brand_guidelines_v1.md`)
- **Misma voice Pablo conversacional** en emails (`emails.ts`), errors (`errors.ts`), microcopy

NO unen:
- Layouts diferentes según contexto (PublicNav / RoleNav / AdminShell — `FRONT_CONTRACT.md`)
- Densidad varía (landing breathing room vs dashboard density)
- Animaciones distintas (landing puede tener entrada sutil con Framer Motion, runtime NO debe distraer)

## Status v0 → corrección Pablo

**Pablo debe responder cada sección con uno de:**

- ✓ "OK, así" — sección queda lock
- ✏ "Corregir con [X]" — claude actualiza
- ✗ "Eliminar / re-pensar" — sección queda abierta hasta sesión específica

Sin sign-off explícito de Pablo, NO arrancar shell visual. Esto es lo que faltó hoy.

## Next steps

1. Pablo lee este doc + corrige (estimado 30-60 min)
2. Claude actualiza con corrections → v1 lock
3. Codex inicia shell visual con FRONT_CONTRACT.md + PRODUCT_VISION_ONE_PAGER.md v1 como blueprint
4. Cada surface implementada se valida contra ambos docs antes de commit (review = abrir la app, no leer código)
