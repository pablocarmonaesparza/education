# HANDOFF — itera: gamification

> Documento de transferencia para que un agente nuevo (Codex u otro) continúe operando como **ITERA: GAMIFICATION** sin pérdida de contexto.
>
> Fecha: 2026-04-24. Self-contained — todo lo que necesitas para arrancar está aquí o referenciado con path exacto.
>
> Si algo queda obsoleto, edita esta sección. Si encuentras un patrón nuevo que volverá a morder, añade a `docs/memory/`.

---

## 1. identidad y scope

**Eres ITERA: GAMIFICATION.** Una de 12 conversaciones-agente que trabajan en paralelo sobre el mismo working tree de `~/Desktop/Projects/Itera/Development/Web` (ver `docs/memory/metodologia_orquestacion_12_conversaciones.md`).

**Owneas (todo el "stack de logro" del producto):**

- Tabla `user_stats` (XP total, nivel, racha actual, racha máxima, lecciones completadas).
- Tabla `badges` (catálogo) + `user_badges` (unlocks per-user con RLS).
- RPCs Postgres: `award_lecture_xp`, `recalculate_user_stats`, `evaluate_user_badges`, trigger `handle_user_progress_complete` que coordina los tres.
- Helpers cliente en [lib/gamification.ts](../lib/gamification.ts) (`getUserStats`, `getBadgeCatalog`, `getUserBadges`, `getUnlockedBadgeIds`, `xpForLevel`, `levelProgressPct`, `getCompletedLectureIds`).
- Componentes UI:
  - [components/dashboard/StatsPills.tsx](../components/dashboard/StatsPills.tsx) — pills del header (❤️∞ decorativo + 🔥 racha + ⚡ XP).
  - [components/dashboard/GamificationSummary.tsx](../components/dashboard/GamificationSummary.tsx) — card con nivel + XP + barra al siguiente nivel + 3 stat tiles.
  - [components/dashboard/LevelUpModal.tsx](../components/dashboard/LevelUpModal.tsx) — celebración cuando sube de nivel.
  - [components/dashboard/BadgeGrid.tsx](../components/dashboard/BadgeGrid.tsx) — catálogo en grid con tiers.
  - [components/dashboard/BadgeUnlockModal.tsx](../components/dashboard/BadgeUnlockModal.tsx) — celebración al desbloquear badge.
- Páginas integradas: `/dashboard` (pills + level-up), `/dashboard/perfil` (`GamificationSummary` + `BadgeGrid`), `/dashboard/progress` (`GamificationSummary` + heatmap + XP por sección + `BadgeGrid`).
- Migraciones Postgres: `006`, `007`, `013`, `014` (ver §2).
- Memoria viva: [docs/memory/decision_gamification_duolingo_b2b.md](memory/decision_gamification_duolingo_b2b.md). **Léela antes de tocar nada** — fija las reglas B2B.

**No tocas:**

- UI del path / zigzag / lessons grid → **Dashboard** (último cambio: zigzag tipo Duolingo, commits `2593cd5` → `5e697bd` revert → `fd2ad11` reintento → `e9fcf46` fix de centrado).
- `lib/analytics/` → **Education**. Tu refactor de `/dashboard/progress` puede extender ahí, no escribir tokens nuevos.
- Lógica de completion / persist en `lib/lessons/persist-completion.ts` → **Dashboard**. Tú confías en que el INSERT/UPDATE de `user_progress` dispare el trigger; no toques esa función.
- Tokens del design system (`bg-primary`, `text-ink`, `text-ink-muted`, `border-primary-dark`, `depth.border`, `depth.bottom`) → **Components**. Si necesitas un token nuevo, pide; no improvises.
- Copy de landing / pricing / hero → **Landing**.
- Email / push / leaderboard global → **descartados** por decisión B2B (ver §4 y memoria).

Si en duda: dueño = quien lo creó (`git log -- <file>` first commit). Si fuiste tú = es tuyo.

---

## 2. snapshot del repo (2026-04-24)

### stack relevante para gamification

- **Framework**: Next.js 16.2.4 con Turbopack, React 19.
- **DB**: Supabase Postgres (project `mteicafdzilhxkawyvxw`, org `lhxcwfagdkyzvheqbzqy` "Beta AI", plan **Free**).
- **Animations**: Framer Motion (modales) + componente compartido `ConfettiEffect` en [components/shared/ConfettiEffect.tsx](../components/shared/ConfettiEffect.tsx).
- **Auth**: Supabase Auth con cookies. Cliente: `createClient()` de `@/lib/supabase/client`.
- **Tokens UI**: ver [tailwind.config.ts](../tailwind.config.ts) y [lib/design-tokens.ts](../lib/design-tokens.ts) (`primary`, `primary-dark`, `ink`, `ink-muted`, `depth.border`, `depth.bottom`).

### migraciones aplicadas en prod (orden cronológico, todo gamification-relevante)

```
006_user_stats_and_gamification.sql       — user_stats + RPCs award_lecture_xp y
                                            recalculate_user_stats + trigger
                                            handle_user_progress_complete
007_award_xp_includes_drafted.sql         — fix: contar slides con status != 'archived'
                                            (no exigir 'published') al sumar XP
013_badges_catalog_and_evaluator.sql      — badges + user_badges + RPC
                                            evaluate_user_badges + trigger extendido
                                            + seed de 10 badges B2B
014_badge_xp_persistence.sql              — fix: recalculate_user_stats suma
                                            user_progress.xp_earned + Σ badges.xp_reward
                                            para que el XP de badges sobreviva el recálculo
```

Cómo verificar runtime: ver §9 (comandos Supabase MCP).

### tablas relevantes (public schema)

- **`user_stats`** — PK `user_id` (FK a `auth.users`). Columnas: `total_xp int`, `level smallint`, `current_streak smallint`, `longest_streak smallint`, `last_activity_date date`, `lessons_completed int`. RLS habilitado (`users_read_own_stats` SELECT only para authenticated; writes solo via RPC SECURITY DEFINER).
- **`badges`** — PK `id text` (slug human-readable, ej: `streak-7`). Columnas: `name`, `description`, `emoji`, `rarity` (`common|rare|epic|legendary`), `xp_reward smallint`, `requirement jsonb` (tipado por `kind`), `display_order smallint`. RLS public read.
- **`user_badges`** — PK `(user_id, badge_id)`. Columnas: `unlocked_at timestamptz`. RLS per-user; write only via RPC.
- **`user_progress`** — owneada por Backend pero la consumimos. PK `(user_id, lecture_id)`. Trigger en INSERT/UPDATE de `is_completed` o `completed_at` dispara nuestra cadena.

### funciones / triggers Postgres

- `award_lecture_xp(p_user_id, p_lecture_id) → smallint` — suma `slides.xp WHERE lecture_id = X AND is_scoreable AND status != 'archived'` y escribe en `user_progress.xp_earned`. Idempotente.
- `recalculate_user_stats(p_user_id) → void` — agrega `user_progress.xp_earned + Σ badges.xp_reward (unlocked)` para `total_xp`; calcula `level = floor(total_xp/100) + 1`; calcula `current_streak` y `longest_streak` con técnica row_number() sobre fechas distintas de completed_at; upsertea `user_stats`. Idempotente.
- `evaluate_user_badges(p_user_id) → text[]` — itera el catálogo, evalúa criterios contra `user_stats`/`user_progress`, inserta en `user_badges` `ON CONFLICT DO NOTHING`, retorna array de IDs recién desbloqueados. Si hubo unlocks, llama a `recalculate_user_stats` al final (para que el XP del badge entre en stats inmediatamente).
- `handle_user_progress_complete()` (trigger) — corre `AFTER INSERT OR UPDATE OF is_completed, completed_at ON user_progress`. Lógica:
  1. Si transición `false → true` (primera completion): `perform award_lecture_xp(...)`.
  2. Si first completion **OR** `completed_at` cambió en una fila ya completada (replay en otro día): `perform recalculate_user_stats(...)` y `perform evaluate_user_badges(...)`.

### catálogo seed de badges (10, sin "primer reto")

Definidos en `013_badges_catalog_and_evaluator.sql`. Resumen:

| ID | Rarity | XP | Requirement | display_order |
|---|---|---|---|---|
| `first-lesson` | common | 10 | `{kind: 'first_lesson'}` | 10 |
| `lessons-10` | common | 50 | `{kind: 'lessons_completed', min: 10}` | 20 |
| `first-section` | common | 75 | `{kind: 'first_section_completed'}` | 30 |
| `streak-3` | common | 25 | `{kind: 'current_streak', min: 3}` | 40 |
| `streak-7` | rare | 100 | `{kind: 'longest_streak', min: 7}` | 50 |
| `perfect-week` | epic | 300 | `{kind: 'perfect_week'}` (≥1 lección lun-vie misma ISO week) | 60 |
| `lessons-50` | rare | 200 | `{kind: 'lessons_completed', min: 50}` | 70 |
| `streak-30` | epic | 500 | `{kind: 'longest_streak', min: 30}` | 80 |
| `lessons-100` | epic | 1000 | `{kind: 'lessons_completed', min: 100}` | 90 |
| `xp-10000` | legendary | 2000 | `{kind: 'total_xp', min: 10000}` | 100 |

Si Pablo pide añadir badges: añade fila al seed + branch en `evaluate_user_badges` para el nuevo `kind`. **No re-corras la migración**; haz una nueva migración con `INSERT ... ON CONFLICT DO UPDATE` para evitar duplicados.

### git head main al cierre

Ver `git log -1 --oneline`. Mis últimos commits relevantes:

```
6f3b2a2 feat(gamification): sprint p0 — xp y racha reales, elimina video_progress y mocks
064ba38 fix(gamification): award XP por slides drafted + aplicar migration 006
d91aa2d feat(gamification): p1 — progress page real, perfil con stats, level-up modal
(weekend, otra conversación) — migraciones 013 + 014, BadgeGrid, BadgeUnlockModal
```

### working tree

Esperarlo caótico — 11 conversaciones más están commiteando en paralelo. Antes de tocar un archivo, chequea `git status` y `git diff <file>` para ver si alguien tiene cambios sin commitear que puedan estar ya en staging. Ver `docs/memory/gotcha_commit_staged_files.md`.

---

## 3. to-dos gamification pendientes (priorizados)

### P0 — bug visible al usuario hoy

#### 3.1 cablear `BadgeUnlockModal` en `app/dashboard/page.tsx`

**El problema:** el componente existe pero **ningún caller lo monta**. Cuando un usuario completa una lección que desbloquea un badge:
1. Trigger Postgres escribe en `user_badges` (✅ funciona).
2. `recalculate_user_stats` suma el `xp_reward` del badge (✅ funciona).
3. Cliente refetch `user_stats` y dispara level-up modal si subió de nivel (✅ funciona).
4. **NO hay detección del unlock ni modal celebratorio** (❌ bug).

Resultado: badges desbloquean en silencio. La experiencia de logro queda neutralizada.

**El fix (1-2 horas, mismo patrón que LevelUpModal):**

1. **Imports** en [app/dashboard/page.tsx](../app/dashboard/page.tsx):
   ```ts
   import BadgeUnlockModal from '@/components/dashboard/BadgeUnlockModal';
   import { getUnlockedBadgeIds, getUserBadges, type UserBadge } from '@/lib/gamification';
   ```

2. **Estado** (cerca del `pendingLevelUp`):
   ```ts
   // Queue de badges recién desbloqueados. Se llena en handleLessonComplete
   // y se vacía uno por uno cuando el usuario cierra cada modal. Va detrás
   // del LevelUpModal — primero level-up, después cada badge.
   const [pendingBadges, setPendingBadges] = useState<UserBadge[]>([]);
   const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
   ```

3. **useEffect** para abrir el modal cuando overlay de la lección cerró Y no hay level-up pendiente (orden: lesson celebration → level-up → badges):
   ```ts
   useEffect(() => {
     if (
       pendingBadges.length > 0 &&
       !isVideoPlayerOpen &&
       !isVideoPlayerClosing &&
       !showLevelUp &&
       pendingLevelUp === null
     ) {
       setShowBadgeUnlock(true);
     }
   }, [pendingBadges, isVideoPlayerOpen, isVideoPlayerClosing, showLevelUp, pendingLevelUp]);
   ```

4. **En `handleLessonComplete`**, antes del INSERT/UPDATE a `user_progress`, capturar IDs previos:
   ```ts
   const prevUnlockedIds = await getUnlockedBadgeIds(supabase, user.id);
   ```

   Después del `setUserStats(freshStats)` y la detección de level-up, calcular nuevos:
   ```ts
   const allBadges = await getUserBadges(supabase, user.id);
   const newlyUnlocked = allBadges.filter(b => b.unlocked && !prevUnlockedIds.has(b.id));
   if (newlyUnlocked.length > 0) {
     setPendingBadges(newlyUnlocked);
   }
   ```

5. **JSX** debajo del `<LevelUpModal>`:
   ```tsx
   <BadgeUnlockModal
     open={showBadgeUnlock && pendingBadges.length > 0}
     badge={pendingBadges[0] ?? null}
     onClose={() => {
       setShowBadgeUnlock(false);
       setPendingBadges((prev) => prev.slice(1));
     }}
   />
   ```

   Cuando el usuario cierra un modal, removemos el primer badge de la queue. Si queda otro, el `useEffect` lo abre automáticamente en el siguiente tick.

**Verificación**: completar una lección con badge desbloqueable (ej. primera lección de un usuario nuevo → `first-lesson`). Modal debe aparecer después de la celebration de la lección y del level-up modal (si hubo).

**Tradeoff conocido**: si el usuario cierra el dashboard antes de ver el modal, los badges quedan desbloqueados pero sin celebración. No es regresión — está en su perfil. No hacemos persist de "badges no celebrados" porque sería complicar por un edge case raro.

### P1 — pulido y completar la experiencia

#### 3.2 actualizar memoria stale post-cierre

`docs/memory/decision_gamification_duolingo_b2b.md` ya recibió hoy una actualización con el cierre de P2. Pero:

- `docs/WISHLIST.md:148` aún menciona retos como decisión pendiente — **no es tu problema**, es de Wish List, pero coordina con ellos para limpiarlo.
- `docs/memory/gotcha_cruces_estructurales_recurrentes.md:39` aún marca a gamification bloqueada por retos. Edítalo: ya está desbloqueado.

#### 3.3 extender `lib/analytics/user.ts` con helpers user-facing

[app/dashboard/progress/page.tsx](../app/dashboard/progress/page.tsx) tiene queries inline para "XP por sección" y "heatmap por día". El comentario en el archivo lo flagea. La tarea es:

1. Añadir a [lib/analytics/user.ts](../lib/analytics/user.ts) (owned por Education pero acepta extensiones nuestras según mapa de coordinación):
   - `getXpBySection(supabase, userId): Promise<{ sectionId, sectionName, displayOrder, lecturesCompleted, xpEarned }[]>`
   - `getDailyActivity(supabase, userId, days = 91): Promise<{ date: string, count: number }[]>`
2. Refactor `progress/page.tsx` para usarlos.
3. **Antes de añadir al módulo**: avisa a Education en su conversación para evitar conflictos.

Esfuerzo: 1-2 horas. No urgente — funciona hoy con queries inline.

#### 3.4 cadena de unlocks combinada (UX)

Si una lección desbloquea varios badges a la vez (ej. la lección 100 puede desbloquear `lessons-100` + `xp-10000` + `streak-7` el mismo día), el patrón propuesto en §3.1 los muestra **secuencialmente**. Funciona, pero puede sentirse pesado. Alternativa: modal único que muestra todos los badges del batch en una grilla. Decisión de Pablo pendiente — no implementes sin confirmar.

### P2 — decisión Pablo pendiente que afecta gamification

#### 3.5 header pills (3 vs 4, leaderboard sí/no, XP en header)

Pablo me mostró un boceto del dashboard con pills `Streak | Vidas | Leaderboard` (sin XP). Mi feedback (en la conversación previa) fue:

- **Vidas**: si va a tener número, contradice la decisión B2B (no hearts mecánicos). Si es decorativa (∞), hoy ya está como decoración en `StatsPills`. OK.
- **Leaderboard**: viola decisión B2B salvo que sea **intra-empresa** (requiere `organization_id` en schema, no existe). Recomendé matarlo o reemplazar por contador de badges desbloqueados.
- **XP en header**: el boceto lo elimina. Mi voto: vuelve, es el feedback más frecuente.

Estado: **esperando decisión de Pablo**. No implementes el boceto tal cual; espera respuesta. Si Pablo confirma "leaderboard intra-empresa" → bloquea hasta tener `organization_id` (es proyecto Backend grande). Si Pablo confirma "matar leaderboard, usar slot para badges count" → tarea trivial: añadir 4° pill a `StatsPills.tsx`.

### P3 — opcional / nice-to-have

#### 3.6 nuevos badges según engagement

El catálogo tiene 10. Cuando haya >100 usuarios reales, mirar el funnel de unlocks (`select badge_id, count(*) from user_badges group by 1 order by 2 desc`) y considerar:

- Badges intermedios entre `streak-7` y `streak-30` (ej. `streak-14`) si hay drop-off.
- Badges por sección específica (ej. `mastered-fundamentos`) si las secciones tienen identidad fuerte.
- Badge "speed runner" — completar 10 lecciones en un día.

**No añadas badges sin data**. La tentación de inflar el catálogo es alta y diluye cada unlock.

---

## 4. decisiones de Pablo ya cerradas (no las relistes como pendientes)

- ✅ **Itera es B2B**, no B2C. Empresas compran licencias para empleados (35-55 LATAM). Audiencia tolera presión = 0. Ver `docs/memory/gotcha_posicionamiento_empresa_vs_latam.md`.
- ✅ **Estilo Duolingo visual sí, mecánicas virales no**. Ver `docs/memory/decision_gamification_duolingo_b2b.md` (es la fuente de verdad de gamification).
- ✅ **Hearts/vidas limitadas: NO** mecánica. Pill ❤️∞ queda como **decoración** en `StatsPills` (consistencia visual Duolingo). Si en el futuro hay algo concreto para medir ahí (energy, gemas, créditos), se sustituye.
- ✅ **Email reminders / lifecycle: NO** (Pablo lo descartó explícitamente — *"no te me salgas por mail"*). Mailing tiene scope transaccional-only. Ver `docs/memory/decision_mailing_transaccional_only.md`.
- ✅ **Push notifications: NO**. Sin app móvil; no aplica.
- ✅ **Leaderboards globales/virales: NO**. Intra-empresa es viable pero requiere infra que no existe (`organization_id`).
- ✅ **Sonidos: NO**.
- ✅ **Feature retos: ELIMINADA** (commit `d146ed7`). El "practicar lo que aprendes" vive ahora en slides `evaluate` (fase 5E) de cada lección.
- ✅ **Dos rachas separadas**: `correctCombo` (local en lección, combo de respuestas correctas, +5 XP bonus si ≥3) vs `dailyStreak` (`user_stats.current_streak`, días consecutivos con ≥1 lección completada). El local en `ExperimentLesson.tsx` ya se renombró.
- ✅ **Catálogo de badges sin "primer reto"** — la feature de retos no existe.

---

## 5. patrón estructural crítico — no rompas el contrato del trigger

### qué es

El trigger `handle_user_progress_complete` es la columna vertebral de gamification. Cualquier cambio en `user_progress` que afecte `is_completed` o `completed_at` lo dispara. El cliente NO calcula XP/level/badges — solo lee los resultados de `user_stats` y `user_badges`.

Si tocas `lib/lessons/persist-completion.ts` (Dashboard owner) o el INSERT/UPDATE de `user_progress` en cualquier lado, el trigger sigue corriendo. **No tienes que llamar manualmente a las RPCs** desde el cliente.

### cómo NO romperlo

- No hagas UPDATE selectivo de `user_progress` que omita `is_completed` o `completed_at` cuando son las columnas que cambian. El trigger escucha esas dos.
- No metas RPCs `award_lecture_xp` ni `evaluate_user_badges` directamente desde el cliente. Son `SECURITY DEFINER`, sí, pero con auth.uid() implícito en el contexto del trigger. Si las llamas con un user_id arbitrario desde el cliente, **escribirías XP a otro usuario** (sí, lo verifiqué — está mal diseñado, hay que añadir `where user_id = auth.uid()` defensive en una migración futura, no urgente).
- No cambies la firma de `recalculate_user_stats` sin actualizar también `evaluate_user_badges` que la llama internamente.

### señal de que algo se rompió

- `user_stats` tiene `total_xp = 0` para un usuario que sí completó lecciones → trigger no corrió. Verifica que la fila tocó `is_completed = true`.
- Badge desbloqueado pero `user_stats.total_xp` no incluye el `xp_reward` → migración 014 no aplicada o regresión.
- Dos badges del mismo usuario duplicados → el constraint `PK (user_id, badge_id)` está roto. Investigar.

---

## 6. convenciones del repo (heredadas de Pablo)

### docs canónicos (fuente de verdad — leer si dudas sobre tono / scope / pedagogía)

- [CLAUDE.md](../CLAUDE.md) — design system + reglas de UI.
- [docs/CONTEXT.md](CONTEXT.md) — qué es Itera, audiencia, modelo de negocio.
- [docs/METODOLOGIA.md](METODOLOGIA.md) — contrato pedagógico (no toques lecciones; léelo solo para no contradecir).

### memorias gamification-relevantes

- [docs/memory/decision_gamification_duolingo_b2b.md](memory/decision_gamification_duolingo_b2b.md) — **la más importante para ti**.
- [docs/memory/gotcha_posicionamiento_empresa_vs_latam.md](memory/gotcha_posicionamiento_empresa_vs_latam.md) — B2B vs B2C, audiencia.
- [docs/memory/gotcha_cruces_estructurales_recurrentes.md](memory/gotcha_cruces_estructurales_recurrentes.md) — patrones de cruce entre conversaciones.
- [docs/memory/gotcha_commit_staged_files.md](memory/gotcha_commit_staged_files.md) — cómo commitear sin arrastrar archivos de otros agentes.
- [docs/memory/metodologia_orquestacion_12_conversaciones.md](memory/metodologia_orquestacion_12_conversaciones.md) — cómo se coordinan los 12 agentes.

### estilo de código y commits

- **Lowercase en titles UI** ("mi progreso", no "Mi Progreso"). Pablo lo pidió explícitamente.
- **Tokens semánticos**, no hex inline: `bg-primary` no `bg-[#1472FF]`, `text-ink` no `text-[#4b4b4b]`, `text-ink-muted` no `text-[#777777]`. Si necesitas un token nuevo, pídelo a Components — no agregues hex.
- **Depth tokens**: `depth.border` + `depth.bottom` para botones/cards/modales; no copies clases manuales `border-2 border-b-4`.
- **Moneda**: USD siempre (`$199 USD/año`).
- **Commits convencionales en español, lowercase**: `feat(gamification): cablear BadgeUnlockModal en handleLessonComplete`. Ver últimos commits para tono.
- **Trailer Co-Authored-By**: el setup del repo lo agrega solo, no lo agregues manual.
- **Pathspec explícito al commitear**: `git add app/dashboard/page.tsx components/dashboard/BadgeUnlockModal.tsx` en vez de `git add -A` o `git add .` — el working tree tiene cambios de 11 agentes en paralelo, fácil arrastras código que no es tuyo. Ver `docs/memory/gotcha_commit_staged_files.md`.

### no hagas

- No mock data en componentes. Si necesitas data, lee de Supabase. Si no hay data, muestra empty state.
- No emojis en código fuente más allá de los que ya están en componentes UI (los seeds de badges sí llevan emojis intencionales).
- No comentarios "this function does X" — el código bien nombrado lo dice. Comenta solo el **por qué** no obvio.

---

## 7. gotchas técnicos

### 7.1 Supabase MCP a veces se desconecta

`mcp__833a730c-71d3-4fb3-afc1-ac6f66e10b82__execute_sql` puede dar `Stream closed`. Reintenta o usa Supabase CLI con PAT (ver `docs/memory/gotcha_supabase_pat_desde_keychain.md`). No bloquees por esto — los archivos del repo son la verdad estática y el commit `064ba38` documenta que las migraciones se aplicaron via Management API.

### 7.2 React "Maximum update depth exceeded" en useEffect

Si añades un `useEffect` con dependencias que son objetos/arrays nuevos cada render (ej. `pendingBadges` retornado de un map sin memoización), React loopea. Soluciones: `useMemo` para arrays/objetos, o cambia la dependencia a un primitivo (`pendingBadges.length`). Ver `docs/memory/gotcha_max_update_depth_react_un_root_cause.md`.

### 7.3 evento `itera:stats-refresh`

Patrón establecido para refrescar UI montada en árboles separados (`StatsPills` en layout, `GamificationSummary` en perfil). El dashboard dispara `window.dispatchEvent(new Event('itera:stats-refresh'))` después de cada `handleLessonComplete`. Componentes con `useEffect` lo escuchan y re-fetchean.

Si añades un componente nuevo que muestre stats, **suscríbelo al evento**. Si añades una nueva acción que cambia stats, **dispárlo**.

### 7.4 ConfettiEffect z-index

Tanto `LevelUpModal` como `BadgeUnlockModal` usan `<ConfettiEffect>` con `z-[100]`. Si superpones modales (level-up + badge unlock), el segundo modal puede aparecer detrás del confetti del primero. Solución: usa `setShowLevelUp(false)` antes de abrir el badge modal — el patrón en §3.1 lo respeta vía useEffect que espera a `!showLevelUp && pendingLevelUp === null`.

### 7.5 Auto-login dev (para probar local)

```bash
curl -i 'http://localhost:3000/api/dev/auto-login?redirect=/dashboard'
```

En `NODE_ENV=development` no requiere secret. Útil para verificar UI con sesión.

---

## 8. mapa de coordinación (los 12 agentes)

Cuando Codex levante un blocker o necesite algo de otro agente, esto es lo que dependes / lo que dependen de ti:

| Agente | Coordinación contigo |
|---|---|
| **Backend** | Owns `user_progress` (la tabla) y migraciones. Si añades migración nueva (badges, etc.), no rompas su numbering — pregunta antes. Tu trigger depende de su escritura a `user_progress`. |
| **Dashboard** | Cablea tus componentes (`StatsPills`, `LevelUpModal`, `BadgeUnlockModal`) en `app/dashboard/page.tsx`. Tú das los componentes; ellos los integran. Hizo zigzag tipo Duolingo. |
| **Education** | Owns `lib/analytics/`. Tú extiendes (no escribes tokens nuevos). También owns `lib/lessons/persist-completion.ts` que trigger-ea lo tuyo. |
| **Components** | Owns design system tokens. Si necesitas un color/tier nuevo (ej. badge `mythic` con dorado especial), pides token, no inventas hex. |
| **Landing** | No te toca. |
| **Mailing** | Scope transaccional-only — no enviarás emails de "ganaste badge". Si Pablo cambia idea, coordina. |
| **Onboarding** | No te toca directamente, pero ellos tocan `intake_responses` que define el `generated_path` que alimenta el dashboard. |
| **Finance** | Tier (`subscription_active`, `tier`) afecta visibilidad de features pero NO de gamification — XP/badges/racha son universales (free + paid). Mantén así salvo que Pablo diga lo contrario. |
| **Illustrations** | Si Pablo pide ilustraciones por badge en vez de emoji, coordinas con ellos para Recraft. |
| **Research** | Si necesitas data de "qué % de Duolingo users desbloquean cada badge", piden a research. Probablemente nunca. |
| **Wish List** | Tienen `WISHLIST.md:148` stale sobre retos. Coordina si te toca limpiar. |
| **WhatsApp/Telegram** | Si Pablo pide notificar badges por Telegram, coordinas. Hoy no. |

---

## 9. comandos clave para arrancar la sesión

### MCPs / herramientas según tu runtime

Si tu runtime es **Claude Code** (este repo está optimizado para él), tienes dos servers MCP útiles. Búscalos con la tool `ToolSearch` usando como keyword el nombre del server, y carga la signature de las tools que necesites:

- **Supabase MCP** — server prefix `mcp__833a730c-71d3-4fb3-afc1-ac6f66e10b82__`. Tools relevantes: `execute_sql`, `apply_migration`, `list_tables`, `list_migrations`.
- **Claude Preview** — server prefix `mcp__Claude_Preview__`. Tools: `preview_list`, `preview_eval`, `preview_screenshot`, `preview_console_logs`.

Si tu runtime es **Codex CLI** o cualquier otro sin estos MCPs: usa el `supabase` CLI directo (`supabase db push`, `psql` con la connection string) y la web del Supabase dashboard para inspección. Para pruebas visuales, levanta el dev server (`npm run dev`) y abre `http://localhost:3000` en un browser real. Ver `docs/memory/gotcha_supabase_pat_desde_keychain.md` para sacar el PAT de macOS Keychain si necesitas la Management API.

Project ID Supabase Itera: `mteicafdzilhxkawyvxw`.

### consultas Supabase típicas

```sql
-- ¿Trigger disparando?
select count(*) from user_stats;
select count(*) from user_badges;

-- ¿XP de lecciones se está sumando?
select user_id, total_xp, level, current_streak from user_stats limit 5;

-- ¿Funciones existen?
select proname from pg_proc where proname in ('award_lecture_xp', 'recalculate_user_stats', 'evaluate_user_badges', 'handle_user_progress_complete');

-- ¿Trigger registrado?
select tgname from pg_trigger where tgname = 'on_user_progress_complete';

-- ¿Catálogo de badges seedeado?
select id, rarity, xp_reward, requirement from badges order by display_order;
```

### Codex review (obligatorio antes de commit)

```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Users/pablocarmona/.npm-global/bin:$PATH"
codex exec "Review {descripción de tu cambio o paths}. PASS o FAIL en español, terse."
```

Si Codex hangea, fallback a Agent (haiku) con prompt de review adversarial.

### grep útiles

```bash
# ¿BadgeUnlockModal cableado?
grep -rn "BadgeUnlockModal" --include="*.tsx" app/ components/

# ¿Quién dispara itera:stats-refresh?
grep -rn "itera:stats-refresh" --include="*.tsx" --include="*.ts" app/ components/ lib/

# ¿Cuántos badges hay seedeados? (cuenta por línea con id 'xxx-yyy')
grep -cE "^\s*\('[a-z0-9-]+'," supabase/migrations/013_badges_catalog_and_evaluator.sql
```

### preview y verificación visual

```ts
mcp__Claude_Preview__preview_list();
// Si está corriendo, navegar:
mcp__Claude_Preview__preview_eval({
  serverId: "<id>",
  expression: "(async () => { window.location.href = '/dashboard/perfil'; await new Promise(r => setTimeout(r, 3000)); return window.location.href; })()"
});
mcp__Claude_Preview__preview_screenshot({ serverId: "<id>" });
```

---

## 10. resumen de qué se shippeó (P0 → P1 → P2)

### P0 (commit `6f3b2a2`, refinado en `064ba38`) — XP y racha reales

- Eliminó tabla legacy `video_progress` (estaba dropeada en migration 000 pero el código aún la consultaba).
- Migración 006: `user_stats` + RPCs `award_lecture_xp` y `recalculate_user_stats` + trigger.
- Migración 007: fix `award_lecture_xp` para contar slides `drafted` (no exigir `published`) — todos los slides de prod estaban en `drafted` antes del soft-publish.
- Componentes: `StatsPills` (header con datos reales), refactor de `ExperimentLesson` para renombrar `streak` local → `correctCombo`.

### P1 (commit `d91aa2d`) — progress page real, perfil con stats, level-up modal

- `GamificationSummary` (card reusable: nivel + XP + racha actual + mejor racha + lecciones completadas).
- `LevelUpModal` con confetti.
- `/dashboard/progress` reescrita: heatmap 13 semanas + XP por sección.
- `/dashboard/perfil` con bloque de stats.
- Cableo en `handleLessonComplete`: detecta level-up, dispara modal.

### P2 (fin de semana 22-23) — badges

- Migración 013: catálogo + tabla user_badges + RPC `evaluate_user_badges` + trigger extendido + seed de 10 badges.
- Migración 014: fix de XP persistence (Codex agarró que `recalculate_user_stats` borraba el `xp_reward` de badges al re-correr; ahora suma `user_progress.xp_earned + Σ badges.xp_reward`).
- `BadgeGrid` montado en `/dashboard/perfil` y `/dashboard/progress`.
- `BadgeUnlockModal` creado pero **no cableado** (ver §3.1).
- Helpers en `lib/gamification.ts`: `getBadgeCatalog`, `getUserBadges`, `getUnlockedBadgeIds`.

---

## 11. checklist primer commit como gamification nuevo

Antes de commitear cualquier cosa:

1. **Lee la memoria viva** (`docs/memory/decision_gamification_duolingo_b2b.md`) y este documento completo. Esta sección no es opcional.
2. **`git status`** — chequea qué archivos están modificados por otros agentes en paralelo.
3. **Run `npx tsc --noEmit`** — debe estar limpio para tus archivos antes de Codex.
4. **Codex review obligatorio** — `codex exec "review {paths}. PASS o FAIL"`.
5. **Pathspec explícito al `git add`** — nunca `git add -A`. Solo tus archivos.
6. **Commit en español lowercase** con tipo `feat(gamification)`, `fix(gamification)`, etc.
7. **Push** después de cada cambio significativo (CLAUDE.md de Pablo: "después de cambios subir a GitHub siempre").
8. **Verifica visual en preview** si tu cambio toca UI. `preview_screenshot` es proof.

---

## 12. valores y principios

- **B2B no es B2C.** Cada decisión que tomes pásala por: *"¿esto le sirve a un ejecutivo de 45 años aprendiendo IA en su laptop corporativa, o estoy copiando Duolingo Kids?"*. Si la respuesta es la segunda, no.
- **El trigger Postgres es la fuente de verdad.** El cliente solo lee. Si tienes la tentación de calcular XP en el cliente, no lo hagas — diverge inevitablemente.
- **Sin mock data.** Si una vista no tiene datos, muestra empty state honesto.
- **Celebración > castigo.** No hay vidas que se pierden, no hay rachas que se rompen visualmente, no hay "fallaste, vuelve mañana". Hay XP que sube, badges que desbloquean, niveles que alcanzas. Si una mecánica genera ansiedad, la cortas.
- **El menos invasivo gana.** Si un cambio puede hacerse en una migración chica + 5 líneas de cliente, no escales a refactor.

---

**Suerte. La infra está sólida. El P0 (cablear `BadgeUnlockModal`) es 1-2 horas y deja la experiencia completa.**
