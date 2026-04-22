---
type: decision
title: gamification estilo duolingo pero b2b — visual sí, mecánicas virales no
date: 2026-04-22
tags: [gamification, b2b, duolingo, badges, racha, xp]
---

Para el sistema de gamification de Itera, Pablo eligió **look-and-feel estilo Duolingo** (badges con tiers de rareza, unlock celebrations, progreso visible, catálogo amplio) pero descartando explícitamente las mecánicas virales B2C. Además hay **dos conceptos distintos de "racha"** que viven en variables separadas.

**Sí va (estilo Duolingo):**
- Catálogo amplio de badges con tiers `common / rare / epic / legendary`.
- Animación de unlock (confetti + emoji + delta de XP).
- XP persistido, nivel calculado, racha persistida.
- Progreso visible en dashboard, perfil y página de progreso.
- Milestones celebrables (primera lección, sección completa, racha 7/30, 10/50/100 lecciones, primer reto, semana laboral completa).

**No va (B2C):**
- Hearts / vidas limitadas como **mecánica** (drainage por error, gating de
  contenido, bloqueo por fallar). El **slot visual** del corazón ∞ sí se
  mantiene en `StatsPills` como decoración / placeholder por consistencia
  con el lenguaje visual Duolingo — cuando haya algo concreto que medir
  ahí (lives, energy, gemas, créditos) se sustituye por la métrica real.
- Email reminders antes de perder racha.
- Push notifications.
- Leaderboards / ligas / competencia entre usuarios.
- Sonidos.

**Dos rachas separadas:**
- `correctCombo` (local en la lección) — cuenta respuestas correctas consecutivas, se resetea al cerrar lección. Usado para otorgar bonus de XP (+5 al combo ≥3).
- `dailyStreak` (persistido en `user_stats`) — cuenta días consecutivos con ≥1 lección completada. Visible en dashboard/perfil/celebration. Se actualiza vía trigger `on_lecture_completed` comparando `last_activity_date` con la fecha actual.

El `streak` local en `ExperimentLesson.tsx:445` debe renombrarse a `correctCombo` para evitar la confusión entre combo de respuestas y racha diaria.

**Por qué:** literal de Pablo: *"Si vamos a tener que contruir uno estilo duolingo. [...] hagamos las dos."* — quiere la riqueza visual de Duolingo sin las mecánicas que no aplican al empleado corporativo (la empresa compra licencia, no se necesita viralidad individual). Y quiere explícitamente ambos conceptos de racha diferenciados.

**Cuándo aplicar:** al tocar cualquier componente de gamification, schema de `user_stats`/`badges`/`user_badges`, o UI de celebración. Si surge la tentación de añadir ligas, email reminders o hearts → revisar esta memoria primero. Si surge confusión entre combo y racha, aplicar los nombres correctos.
