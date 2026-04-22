# Auditoría del sistema de gamification — Dashboard Itera

**Fecha:** 2026-04-22
**Producto:** Itera es B2B — empresas compran licencias para empleados. Eso descarta mecánicas B2C (vidas limitadas, email reminders virales, leaderboards, competencia). La gamification debe ser **progreso visible y completion-oriented**, no engagement adictivo.

---

## Glosario rápido

- **`user_progress`**: tabla nueva (schema v1) que escribe una fila por lección completada. Keys por `lecture_id` (UUID). Definida en [supabase/migrations/003_user_progress_and_analytics.sql:18-57](supabase/migrations/003_user_progress_and_analytics.sql). Es la tabla que debería ser fuente de verdad.
- **`video_progress`**: tabla anterior definida en [supabase-schema.sql:30-41](supabase-schema.sql), keys por `video_id` (text). Sigue viva: la escriben 2 sitios, la leen 5. Coexiste en paralelo con `user_progress` sin sync — este es el problema estructural (ver §1.4).
- **`slides.xp`**: columna smallint en [supabase/migrations/001_init_content_schema.sql:236](supabase/migrations/001_init_content_schema.sql). Define XP por slide. Nadie la suma.

---

## TL;DR

**El sistema es una fachada sin backend: muchas superficies muestran números que no se leen de la DB.** Reproduje el síntoma que mencionaste (la pill de XP arriba a la derecha que no cambia) y encontré que **no es un caso aislado — es un patrón en toda la gamification**. Las 9 desconexiones UI↔DB concretas están en §2.

Síntomas combinados:

- El panel del tutor (derecha, visible en todo `/dashboard`) muestra `∞ vidas`, `🔥 5 días`, `⚡ 150 XP` — los tres son **literales hardcoded**, no leen DB. [components/dashboard/TutorChatButton.tsx:221-236](components/dashboard/TutorChatButton.tsx)
- Dentro de la lección, el XP sí se calcula correcto en estado local de React (`setXp((x) => x + gain)` en [ExperimentLesson.tsx:575-580](components/experiment/ExperimentLesson.tsx)). Al terminar, el `onComplete` del dashboard escribe `xp_earned: 0` a la DB [app/dashboard/page.tsx:873](app/dashboard/page.tsx) → el XP ganado se pierde.
- Al volver al dashboard, el query ni siquiera selecciona `xp_earned` ([app/dashboard/page.tsx:324](app/dashboard/page.tsx) — solo trae `lecture_id, is_completed`), así que aunque el XP estuviera guardado, no llegaría al UI.
- La "racha de 5 días" mostrada en `TutorChatButton:229` y en la celebration (`DAILY_STREAK = 5` en [ExperimentLesson.tsx:265](components/experiment/ExperimentLesson.tsx)) son constantes — no son el streak real. Dentro de la lección hay otro `streak` local que cuenta respuestas correctas consecutivas (no días), pero se resetea a 0 cuando cierras la lección.
- `GamificationStats` y `AchievementBadges` son **código muerto** — no se importan en ninguna página (verificado con grep).
- `/dashboard/progress` es un placeholder literal.

**Origen arquitectónico:** dos tablas de progreso coexisten (`user_progress` y `video_progress`) con keys distintos y sin sync. Main dashboard lee una, retos/tutor/stats leen la otra. Antes de meter gamification real, hay que unificar.

---

## 1. Inventario

### 1.1 Superficies visibles con valores hardcoded (mocks vivos)

| Ubicación | Valor visible | Fuente real | Ref |
|---|---|---|---|
| Panel tutor (persistente en `/dashboard`), pill de vidas | `∞` | literal en JSX | [TutorChatButton.tsx:225](components/dashboard/TutorChatButton.tsx) |
| Panel tutor, pill de racha | `🔥 5` | literal | [TutorChatButton.tsx:229](components/dashboard/TutorChatButton.tsx) |
| Panel tutor, pill de XP | `⚡ 150` | literal | [TutorChatButton.tsx:235](components/dashboard/TutorChatButton.tsx) |
| Celebration slide al acertar, pill de racha | `🔥 {DAILY_STREAK} días` → `🔥 5 días` | `const DAILY_STREAK = 5` | [ExperimentLesson.tsx:265, 1841](components/experiment/ExperimentLesson.tsx) |
| Celebration slide, pill de XP | `+{xpGained} XP` | estado local React, no se persiste | [ExperimentLesson.tsx:1844](components/experiment/ExperimentLesson.tsx) |
| Feature flag de vidas ilimitadas | (no-op, no hay sistema de vidas) | `const HAS_UNLIMITED_LIVES = true` | [ExperimentLesson.tsx:262](components/experiment/ExperimentLesson.tsx) |
| Barra inferior del dashboard (% completadas) | `N / M` | **sí** real, desde `user_progress` | [app/dashboard/page.tsx:1248](app/dashboard/page.tsx) |

**Observación:** el botón/pill "arriba a la derecha" que mencionaste es el bloque de 3 pills del `TutorChatButton` (panel del tutor, derecha del viewport, fijo en todo `/dashboard`). Confirmo: XP = 150 literal, nunca se actualiza. Ver §2.3 para el camino que rompe.

### 1.2 Código muerto (no se importa en ninguna página)

| Componente | Path | Verificación |
|---|---|---|
| `GamificationStats` (level + XP + racha + meta semanal) | [components/dashboard/GamificationStats.tsx](components/dashboard/GamificationStats.tsx) | `grep GamificationStats` → solo archivo + README |
| `AchievementBadges` (grid de 12 badges hardcoded) | [components/dashboard/AchievementBadges.tsx](components/dashboard/AchievementBadges.tsx) | `grep AchievementBadges` → solo archivo + README |

Existen ~400 líneas de UI lista que no llegan al usuario.

### 1.3 Lo que sí funciona (datos reales)

| Feature | Path | Nota |
|---|---|---|
| Barra de progreso al pie | [app/dashboard/page.tsx:1248](app/dashboard/page.tsx) | Lee `completedCount/totalCount` desde `user_progress`. |
| `user_progress` writes al completar lección | [app/dashboard/page.tsx:850-877](app/dashboard/page.tsx) | Escribe `is_completed`, `slides_completed`, `attempts`, timestamps. **Excepto `xp_earned`: hardcoded a 0.** |
| Retos: unlock mediante `video_progress` | [app/dashboard/retos/page.tsx:80-94](app/dashboard/retos/page.tsx) | ⚠️ El query **no filtra `completed=true`** — cualquier fila desbloquea, ver §2.8. |
| `RetoItem` UI con estados locked/unlocked/completed | [components/dashboard/RetoItem.tsx](components/dashboard/RetoItem.tsx) | Render correcto. |
| Celebration visual (confetti + animaciones Framer Motion) | [ExperimentLesson.tsx:1766-1901](components/experiment/ExperimentLesson.tsx) | Bonito; solo los datos son fake. |
| Cálculo de XP per-lesson en estado local | [ExperimentLesson.tsx:448, 575-580](components/experiment/ExperimentLesson.tsx) | Fórmula correcta: `base + streakBonus(5 si ≥3)`. No se persiste. |
| Views `section_analytics`, `lecture_funnel` | [supabase/migrations/003_user_progress_and_analytics.sql:79-179](supabase/migrations/003_user_progress_and_analytics.sql) | Útiles para admin; no se exponen al usuario. |

### 1.4 El problema del doble modelo de progreso

Dos tablas viviendo en paralelo sin sync:

- **`user_progress`** (schema v1, más rico):
  - Lectura: main dashboard [app/dashboard/page.tsx:318-335](app/dashboard/page.tsx).
  - Escritura: [app/dashboard/page.tsx:850-877](app/dashboard/page.tsx) al terminar la `ExperimentLesson`.

- **`video_progress`** (tabla previa, sigue activa):
  - Escritura: [app/dashboard/my-path/video/[phaseId]/[videoId]/page.tsx:141-158](app/dashboard/my-path/video/[phaseId]/[videoId]/page.tsx) (`handleMarkComplete` upsert con `completed=true`); [app/api/dashboard/progress/route.ts:42-49](app/api/dashboard/progress/route.ts) vía `updateVideoProgress`.
  - Lectura: [my-path video page](app/dashboard/my-path/video/[phaseId]/[videoId]/page.tsx), [retos/page.tsx](app/dashboard/retos/page.tsx), [lib/supabase/dashboard.ts](lib/supabase/dashboard.ts), [lib/tutor/context.ts](lib/tutor/context.ts), [TutorContent.tsx](components/dashboard/TutorContent.tsx).

Las dos tablas tienen keys distintos (`lecture_id UUID` vs `video_id TEXT`) y no hay sync. Resultado: **el main dashboard considera "completado" lo que escribe la ExperimentLesson; retos/stats/tutor consideran "completado" lo que escribe my-path video**. Son dos mundos. Cualquier gamification real construida sobre uno ignora al otro. **Antes de construir, hay que unificar.**

### 1.5 Páginas placeholder / con mock

| Página | Estado |
|---|---|
| `/dashboard/progress` | Placeholder literal: *"Aquí se mostrará tu progreso general"*. [app/dashboard/progress/page.tsx](app/dashboard/progress/page.tsx) |
| `/dashboard/network` | Mock de 6 perfiles ficticios hardcoded. [app/dashboard/network/page.tsx:26-99](app/dashboard/network/page.tsx) |
| `/dashboard/perfil` | **No muestra gamification**: solo nombre, email, plan, proyecto. Sin XP total, sin lecciones completadas, sin nivel. [app/dashboard/perfil/page.tsx](app/dashboard/perfil/page.tsx) |

---

## 2. Las 9 desconexiones UI ↔ DB

### 2.1 Pill de vidas hardcoded a `∞` ❌

[TutorChatButton.tsx:225](components/dashboard/TutorChatButton.tsx)
- UI: `∞` siempre, para todo usuario.
- Fuente: literal en JSX.
- Rompe: nada funcional hoy (no existe sistema de vidas). Es una promesa vacía.
- Acción: **eliminar la pill** (B2B no necesita sistema de vidas).

### 2.2 Pill de racha hardcoded a `🔥 5` ❌

[TutorChatButton.tsx:229](components/dashboard/TutorChatButton.tsx)
- UI: `5` siempre.
- Fuente real debería ser: días consecutivos con lección completada — agregado de `user_progress.completed_at WHERE is_completed=true`.
- Rompe: la racha real que el usuario construye no se refleja. Existe `calculateStreak()` en [lib/supabase/dashboard.ts:370-427](lib/supabase/dashboard.ts) pero (a) lee `video_progress` no `user_progress`, (b) no filtra `completed=true` (línea 342 solo filtra para `minutesWatched`, la racha usa todas las filas), (c) el resultado nunca llega a este componente.

### 2.3 Pill de XP hardcoded a `⚡ 150` ❌ **[el síntoma que reportaste]**

[TutorChatButton.tsx:235](components/dashboard/TutorChatButton.tsx)
- UI: `150` siempre.
- Fuente real debería ser: `SUM(user_progress.xp_earned) WHERE user_id = ?`.
- Rompe: el XP ganado dentro de una lección (+10, +15, +20 con animación) se pierde al cerrar. La pill nunca cambia.

### 2.4 XP se calcula en cliente pero **no se persiste** ❌

[ExperimentLesson.tsx:448, 575-580](components/experiment/ExperimentLesson.tsx)
- Fórmula correcta: `base = getStepXp(step); streakBonus = newStreak >= 3 ? 5 : 0; setXp((x) => x + base + streakBonus)`.
- Pero el callback `onComplete` no pasa el XP al dashboard ([ExperimentLesson.tsx:415](components/experiment/ExperimentLesson.tsx)).
- Dashboard escribe `xp_earned: 0` [app/dashboard/page.tsx:873](app/dashboard/page.tsx).
- Rompe: el XP que se calcula bien nunca cruza a la DB.

### 2.5 El query del dashboard **no lee `xp_earned`** ❌

[app/dashboard/page.tsx:324](app/dashboard/page.tsx):

```ts
.select('lecture_id, is_completed')
```

Aun si `xp_earned` estuviera poblado, no llega al UI. Hay que añadir `xp_earned` al select y agregar por usuario.

### 2.6 El `streak` en la lección es "respuestas correctas", no "días" ⚠️

[ExperimentLesson.tsx:445](components/experiment/ExperimentLesson.tsx): `const [streak, setStreak] = useState(0)`. Se incrementa con cada respuesta correcta (línea 573) y se resetea en `handleRestart` (línea 554).

Esto **no es una racha diaria** — es un combo de ejercicio. Pero el nombre `streak` + el emoji `🔥` + la pill "🔥 5 días" en la celebration genera la falsa impresión de que sí es diario. Dos conceptos distintos bajo el mismo significante.

Propuesta: renombrar el local a `correctCombo` y tener `dailyStreak` desde DB como fuente separada.

### 2.7 `DAILY_STREAK = 5` constante en la celebration ❌

[ExperimentLesson.tsx:265, 1841](components/experiment/ExperimentLesson.tsx)
- UI al completar lección: `🔥 5 días` para todos.
- Acción: reemplazar por prop, llenar desde `user_stats.current_streak` (tabla a crear).

### 2.8 `HAS_UNLIMITED_LIVES = true` — promesa vacía ⚠️

[ExperimentLesson.tsx:262](components/experiment/ExperimentLesson.tsx). Flag que sugiere que existe un sistema de vidas opcional. No existe. Como Itera es B2B y no vamos a implementar vidas, **quitar el flag y cualquier referencia visual**.

### 2.9 Unlock de retos no filtra `completed=true` ❌

[app/dashboard/retos/page.tsx:80-94](app/dashboard/retos/page.tsx):

```ts
const { data: videoProgressData } = await supabase
  .from('video_progress')
  .select('video_id')
  .eq('user_id', user.id);
// ↑ no hay .eq('completed', true)
```

Cualquier fila de `video_progress` del usuario cuenta como "video completado" para abrir el reto, sin importar el valor de `completed`. El schema ([supabase-schema.sql:30-41](supabase-schema.sql)) permite filas con `completed=false` (el default es `false`), y la ruta [app/api/dashboard/progress/route.ts:42-49](app/api/dashboard/progress/route.ts) acepta el parámetro `completed` explícitamente.

**Fix:** `.eq('completed', true)` en el query, o mejor: después de unificar §1.4, leer desde `user_progress WHERE is_completed=true`.

---

## 3. Qué más falta (fuera de las desconexiones)

### 3.1 Schema DB

No existen:

```sql
user_stats (
  user_id uuid PK,
  total_xp int default 0,
  level smallint default 1,
  current_streak smallint default 0,
  longest_streak smallint default 0,
  last_activity_date date,
  lessons_completed int default 0,
  updated_at timestamptz
)

badges (id, name, description, requirement jsonb, xp_reward, rarity)
user_badges (user_id, badge_id, unlocked_at, PK(user_id, badge_id))
```

Sin `user_stats`, cada vista que muestre XP total, nivel o racha tiene que agregar al vuelo. No hay forma de detectar "subió de nivel ahora" atómicamente para disparar celebración.

### 3.2 Lógica server-side

Trigger / RPC / edge function `on_lecture_completed` que al cambiar `user_progress.is_completed → true`:
- Sume `SUM(slides.xp) WHERE lecture_id = X` → escribe `user_progress.xp_earned`.
- Actualice `user_stats.total_xp += xp_earned` y recalcule `level`.
- Actualice racha (compara `last_activity_date` con hoy).
- Evalúe badges desbloqueables y escriba en `user_badges`.
- Retorne el delta `{ xpGained, leveledUp, badgesUnlocked }` para que el cliente pueda animar.

Hoy no existe nada de esto.

### 3.3 Timezone

No existe columna `timezone` en ningún schema de `users`. Confirmado con grep. Como descartamos email reminders (es B2B), **timezone no es prerequisito**. Si en algún momento quieres mostrar "llevas X días" en la zona del usuario, sacarlo con `Intl.DateTimeFormat().resolvedOptions().timeZone` en cliente es suficiente.

### 3.4 Páginas que necesitan gamification visible y no la tienen

- `/dashboard/progress`: placeholder.
- `/dashboard/perfil`: solo datos demográficos; debería mostrar XP total, lecciones completadas, nivel, racha, badges.

### 3.5 UX faltante

- Indicador visible y **real** de XP/racha/nivel en el dashboard.
- Animación de level-up cuando `user_stats.level` cambia.
- Animación de badge unlock.
- Página `/dashboard/progress` con heatmap por día, XP por sección, racha histórica.

---

## 4. Plan recomendado, en orden

Sin email reminders, sin hearts, sin leaderboards (descartados por ser B2C).

### P0 — Corregir las mentiras visibles y unificar schema

*Tamaño: ~3-4 días de trabajo.*

1. **Unificar `video_progress` ↔ `user_progress`** (§1.4).
   Recomiendo migrar lecturas a `user_progress` y deprecar `video_progress` (o convertirla en vista). Toca 5 archivos listados en §1.4. Incluir migración que copie filas históricas si hace falta.
2. **Eliminar mocks visibles**:
   - Quitar la pill `∞ vidas` del `TutorChatButton` (B2B, no va).
   - Quitar `HAS_UNLIMITED_LIVES` y referencias relacionadas en `ExperimentLesson`.
   - Reemplazar pills de racha y XP por props reales (o por "—" hasta tener datos).
3. **Persistir XP** con RPC `award_lecture_xp(user_id, lecture_id)` que sume `slides.xp` y actualice `user_stats.total_xp` atómicamente.
4. **Arreglar cálculo de racha** desde `user_progress WHERE is_completed=true` usando `completed_at`; persistir en `user_stats.current_streak`.
5. **Crear tabla `user_stats`**.
6. **Arreglar unlock de retos** (`.eq('completed', true)` mínimo, unificación completa ideal §2.9).

### P1 — Páginas de progreso reales

*Tamaño: ~2-3 días.*

7. `/dashboard/progress` real: XP total, lecciones completadas, racha actual vs máxima, heatmap por día, breakdown por sección (usa `section_analytics` que ya existe).
8. Sección de gamification en `/dashboard/perfil`: resumen numérico + badges ganados.
9. Pill de XP/racha en el panel tutor **conectada a datos reales** (y con la opción de expandir al hover para ver nivel + progreso al siguiente nivel).

### P2 — Badges con lógica real

*Tamaño: ~3-5 días.*

10. Tablas `badges` + `user_badges`, catálogo en DB.
11. Evaluator dentro del trigger `on_lecture_completed`.
12. Animación de unlock (modal + confetti + emoji + `+N XP`).
13. Catálogo apropiado para empleado corporativo:
    - Primera lección.
    - Primera sección completa.
    - Racha 3 / 7 / 30 días.
    - 10 / 50 / 100 lecciones completadas.
    - Primer reto entregado.
    - "Week completa" (al menos 1 lección cada día laboral de la semana).

### Cleanup (al final de P2, no al principio)

14. Borrar `GamificationStats.tsx` y `AchievementBadges.tsx` una vez que sus reemplazos conectados estén vivos.

### Explícitamente fuera del plan (descartado por B2B)

- Sistema de vidas/hearts.
- Email reminders antes de perder racha.
- Push notifications.
- Leaderboards globales o por liga.
- Competencia entre usuarios.
- Sonidos.

---

## 5. Archivos a tocar (lista operativa)

### Crear

- `supabase/migrations/006_unify_progress.sql` — migrar `video_progress` → `user_progress` (o vista).
- `supabase/migrations/007_gamification_stats.sql` — `user_stats`, `badges`, `user_badges` + trigger `on_lecture_completed`.
- `lib/gamification/awardXp.ts` — RPC helper / server action.
- `lib/gamification/evaluateBadges.ts`.
- `lib/gamification/streak.ts` — desde `user_progress`.
- `components/dashboard/StatsPills.tsx` — pills compactas racha/XP/nivel con datos reales.
- `components/dashboard/GamificationSummary.tsx` — bloque reutilizable para perfil y página de progreso.

### Modificar

- [app/dashboard/page.tsx:850-877, 324](app/dashboard/page.tsx) — llamar `award_lecture_xp`; `select` incluye `xp_earned`.
- [components/dashboard/TutorChatButton.tsx:220-237](components/dashboard/TutorChatButton.tsx) — reemplazar pills hardcoded por `<StatsPills>` con props reales; quitar pill de vidas.
- [components/experiment/ExperimentLesson.tsx:262-265, 445, 1841, 415](components/experiment/ExperimentLesson.tsx) — quitar `HAS_UNLIMITED_LIVES`, renombrar `streak` a `correctCombo`, reemplazar `DAILY_STREAK` por prop, pasar `xpGained` en `onComplete`.
- [lib/supabase/dashboard.ts:336-427](lib/supabase/dashboard.ts) — racha y stats desde `user_progress`.
- [app/dashboard/retos/page.tsx:80](app/dashboard/retos/page.tsx) — `.eq('completed', true)` o migrar a `user_progress`.
- [app/dashboard/progress/page.tsx](app/dashboard/progress/page.tsx) — reemplazar placeholder.
- [app/dashboard/perfil/page.tsx](app/dashboard/perfil/page.tsx) — añadir sección de gamification.
- Los 5 archivos que leen `video_progress` (ver §1.4).

### Borrar al final

- `components/dashboard/GamificationStats.tsx`
- `components/dashboard/AchievementBadges.tsx`

---

## 6. Preguntas abiertas

1. **Unificación `video_progress` → `user_progress`**: ¿ok migración destructiva (eliminar `video_progress` tras migrar datos históricos), o prefieres mantenerla como vista por compat?
2. **Badges para empleado corporativo**: ¿te sirve el catálogo propuesto (primera lección, sección, racha, N lecciones, reto, week completa) o hay badges que por la naturaleza B2B tengan más sentido (ej. "terminó el onboarding de su empresa", "completó las 5 lecciones asignadas por su manager")?
3. **"Racha" vs "combo de respuestas"**: ¿ok renombrar el streak local de la lección a `correctCombo` para no confundir? O prefieres mantener el nombre y que la pill siempre refleje la racha diaria real.
4. **Tamaño del primer sprint**: ¿ejecuto P0 completo (3-4 días) o solo los puntos 2-3 de P0 (quitar mentiras visibles + persistir XP) en ~1 día y el resto después?
