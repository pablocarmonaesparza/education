---
type: decision
title: gamification estilo duolingo pero b2b — visual sí, mecánicas virales no
date: 2026-04-22
tags: [gamification, b2b, duolingo, badges, racha, xp]
dept: [cpo, cgo]
---

Para el sistema de gamification de Itera, Pablo eligió **look-and-feel estilo Duolingo** (badges con tiers de rareza, unlock celebrations, progreso visible, catálogo amplio) pero descartando explícitamente las mecánicas virales B2C. Además hay **dos conceptos distintos de "racha"** que viven en variables separadas.

**Sí va (estilo Duolingo):**
- Catálogo amplio de badges con tiers `common / rare / epic / legendary`.
- Animación de unlock (confetti + emoji + delta de XP).
- XP persistido, nivel calculado, racha persistida.
- Progreso visible en dashboard, perfil y página de progreso.
- Milestones celebrables (primera lección, sección completa, racha 7/30, 10/50/100 lecciones, semana laboral completa).

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

### Actualización 2026-04-22 — feature retos eliminada

La feature de retos fue **eliminada del código** en commit `d146ed7` (feat(content+cleanup): publicar curso v1 + eliminar feature retos). Consecuencia para el catálogo P2 de badges:

- ❌ Quitado del catálogo: `primer reto`.
- El "practicar lo que aprendes" ahora vive dentro de los slides `evaluate` (fase 5E) de cada lección, no en retos separados.
- Los badges que dependen de ejercicios/retos completados no existen; todo lo demás (primera lección, secciones, rachas, milestones de lecciones/XP, semana laboral) sigue válido.

Docs paralelos (WISHLIST.md, gotcha_cruces_estructurales_recurrentes) pueden seguir mencionando retos como decisión pendiente — están stale. La decisión vive en el commit `d146ed7`.

### Actualización 2026-04-24 — cierre P2 (badges) + bug pendiente

P2 de gamification cerrado durante el fin de semana 22-23 abril:

- **Migración 013** (`013_badges_catalog_and_evaluator.sql`): tablas `badges` (catálogo) + `user_badges` (unlocks per-user con RLS) + RPC `evaluate_user_badges(user_id)` + extensión del trigger `on_user_progress_complete` para llamar al evaluator después de `recalculate_user_stats`. Seed inicial con 10 badges B2B.
- **Migración 014** (`014_badge_xp_persistence.sql`): fix de un bug que Codex agarró — el XP de badges se borraba al recalcular stats. Ahora `recalculate_user_stats` suma `user_progress.xp_earned + Σ badges.xp_reward` sobre badges desbloqueados del usuario.
- **Componentes UI**: `BadgeGrid.tsx` (renderiza catálogo con tiers + locked/unlocked) y `BadgeUnlockModal.tsx` (celebración).
- **Helpers cliente**: `getBadgeCatalog`, `getUserBadges`, `getUnlockedBadgeIds` en [lib/gamification.ts](../../lib/gamification.ts).
- **Integración UI**: `BadgeGrid` montado en `/dashboard/perfil` y `/dashboard/progress`.

**Bug visible activo (P0 para próxima sesión):** `BadgeUnlockModal` existe pero **no está cableado en `app/dashboard/page.tsx`**. Cuando el usuario completa una lección que desbloquea un badge, el trigger Postgres lo escribe en `user_badges` pero el cliente no detecta el unlock ni dispara el modal. Mismo patrón que `LevelUpModal` (que sí está cableado): hay que hacer diff de `getUnlockedBadgeIds` antes/después de `handleLessonComplete`, encolar los nuevos IDs en estado, y abrir el modal cuando el overlay de la lección cierre. Ver §3 P0 del HANDOFF_GAMIFICATION_2026-04-24.md.

**Decisiones pendientes de Pablo (impactan a Gamification, no bloquean el bug del modal):**
- Header pills en el dashboard: ¿3 o 4 slots? ¿Vuelve XP al header? ¿Leaderboard intra-empresa o se mata? Ver feedback que di sobre el boceto del 2026-04-24 en la conversación con Dashboard.
