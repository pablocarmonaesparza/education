# Handoff a Codex — Wish List agent (Itera)

> Documento self-contained. Si lo lees con cero contexto previo, deberías poder retomar el trabajo sin preguntar nada. Si algo no está acá, asume que el handoff falló y bájate del frente hasta confirmar con Pablo.
>
> **Última actualización**: 2026-04-23.
> **Branch activo**: `main`. **Commits recientes míos**: `31ceeb5`, `6353114` — ya pushed a `origin/main`.

---

## 0. Cómo usar este doc

1. Lee §1 (rol). Si vas a actuar fuera del rol Wish List, **ESCALA** antes de tocar código.
2. Lee §2 (estado) y §3 (decisión #18) para entender qué pasó hoy y por qué.
3. Lee §4 para saber qué hacer ahora.
4. Lee §5 (convenciones) **antes** de escribir código o copy.
5. Lee §8 (working tree warning) **antes** de cualquier `git add`.
6. Usa §9 como mapa de archivos canónicos. Si algo contradice este handoff, esos archivos ganan.

---

## 1. Identidad y rol

**Eres el Wish List agent en el sistema multi-agente de Itera.**

- **Tu single source of truth**: `docs/WISHLIST.md`. Lo mantienes tú. Lo lees antes de cualquier acción.
- **Tu output principal**: actualizar el tracker, surfacear blockers a Pablo, auditar empíricamente cuando una decisión depende de evidencia.
- **NO ejecutas código de otras lanes**: Dashboard, Education, Landing, Backend, Finance, Gamification, Illustrations, Mailing, Onboarding, WhatsApp/Telegram, Components son lanes separadas. Tú solo coordinas y trackeas.
- **NO tomas decisiones estratégicas a nombre de Pablo**. Cross-model tension es información, no permiso.
- **SÍ ejecutas trabajo cuando es Wish List-lane puro**: editar WISHLIST.md, escribir audits en `docs/research/`, surfacing decisiones, cleanup de docs stale.

Pablo es founder de Itera. La métrica de éxito de tu trabajo: ¿el doc le ahorra tiempo? ¿está resolviendo el problema correcto? Si no, vuelve al briefing.

---

## 2. Estado del repo al cierre de la sesión anterior

### Commits hechos por el Wish List agent (ya en `origin/main`)

```
6353114 docs(wishlist): reformular #18 (Opción 4) + audit empírico Evaluate slides + SEO audit con P0 cerrados
31ceeb5 feat(seo): fix P0 infrastructure — sin aggregateRating falsa, robots/sitemap/OG dinámico, locale es_419
```

**Commit 31ceeb5 toca 5 archivos (código)**:
- `app/layout.tsx` (M) — locale `es_ES` → `es_419`, description sin claims falsas, sin hardcode `og-image.jpg`.
- `app/opengraph-image.tsx` (nuevo) — OG dinámico vía `next/og` edge runtime.
- `app/robots.ts` (nuevo) — disallow 19 rutas privadas + sitemap link.
- `app/sitemap.ts` (nuevo) — 5 rutas públicas con priority/freq.
- `components/shared/StructuredData.tsx` (M) — `@graph` unificado, sin `aggregateRating` falsa, sin placeholders, precio $19 USD.

**Commit 6353114 toca 3 archivos (docs)**:
- `docs/WISHLIST.md` (nuevo) — backlog priorizado, fuente de verdad.
- `docs/research/EVALUATE_SLIDES_AUDIT.md` (nuevo) — audit empírico que produjo Opción 4 de #18.
- `docs/research/SEO_AUDIT_v1.md` — pre-existía untracked, ahora committed con tabla §3 actualizada para reflejar P0 ✅.

### Items procesados en la sesión anterior

| Item | Resultado |
|---|---|
| #17 feedback usuarios | ✅ verificado — Education ya lo construyó (T1.1+T1.2): `slide_flags`, `SlideFlagButton`, `/api/slides/[id]/flag`, `/dashboard/admin/funnel`, `lib/analytics/`. |
| #19a SEO audit | ✅ pre-existía completo, ratificado. |
| #19b SEO P0 fixes | ✅ 4 P0 + 1 P1 ejecutados (5 archivos código en commit 31ceeb5). |
| #18 retos | ✅ reformulado a **Opción 4** (rewrite celebration slides), no rebuild retos. Detalle en §3. |
| Research R15 | ✅ destrabado — recomienda PostHog cloud US. Espera adopción de Pablo. |

---

## 3. Decisión clave #18: rewrite de celebration slides (Opción 4)

### Por qué el framing original era stale

- El commit `d146ed7` ("publicar curso v1 + eliminar feature retos") **eliminó la feature de retos intencionalmente** después de 10 commits de iteración. No fue accidente.
- Las tablas `user_exercises`, `exercise_progress`, `checkpoint_submissions` se borraron en `000_nuke_legacy.sql`.
- WISHLIST.md previo decía "decisión pendiente de rebuild sí/no" — pero esa decisión ya estaba tomada.

### Por qué Opción 1 (ratificar pasivamente) era complaciente

Outside voice de codex auditó el repo y mostró:
- METODOLOGIA §Evaluate la define como "verificar comprensión", **no** "ejecutar trabajo real".
- 100/100 lecciones tienen `evaluate = mcq + celebration`. 0/100 tienen `ai-prompt`. Solo 5/100 usan `build-prompt`.
- El pipeline pre-`d146ed7` tenía steps 4/5 que generaban ejercicios con `deliverable` aplicado al proyecto del user. Eso se eliminó **sin reemplazo**.
- Itera vende "retención + ejecución" (CONTEXT.md:13, R13_icp_definition.md:102). Hoy solo medimos `slides_completed`, `xp_earned`, `attempts` = completion tracking.
- **Riesgo estratégico**: deslizamiento de "AI operator para empresa" → "curso bonito con buena completion".

### Por qué Opción 4 ganó vs 1/2/3

| | Opción 1 ratificar | Opción 2 capa deliverable nueva | Opción 3 congelar | **Opción 4 rewrite celebration** |
|---|---|---|---|---|
| Honra `d146ed7` | ✅ | ⚠️ similar a retos 2.0 | ✅ | ✅ |
| Cumple Rubric #4 | ❌ | ✅ | aplaza | ✅ |
| Scope | 0 | L | 0 | S-M |
| Schema/feature nueva | ❌ | ✅ | ❌ | ❌ |
| Reversible | sí | difícil | sí | sí (git) |
| Alinea con tesis | ❌ | ✅ | aplaza | ✅ |

**Opción 4 = rewrite del body de las 100 celebration slides para cumplir METODOLOGIA Rubric #4** (cada lección entrega uno de: prompt copy-paste-able, decisión con criterio, checklist repetible, prompt final producido). Sin rebuild retos, sin schema, sin feature nueva, sin nuevo slide kind.

### Audit empírico que sustenta la decisión

Sample de 5 lecciones (`docs/research/EVALUATE_SLIDES_AUDIT.md` §4):

| Lección | Rubric #4 |
|---|---|
| 4 ingredientes del prompt | PARTIAL (checklist nombrado, sin template) |
| Iterar un prompt | PARTIAL (3 pasos nombrados, sin worked example) |
| Cold email con AI | FAIL ("ahora ya sabes") |
| Qué es vibe coding | PARTIAL (decisión gesticulada) |
| Qué es MCP | FAIL (cliffhanger sin deliverable) |

PASS: 0/5. PARTIAL: 3/5. FAIL: 2/5.

### Freeze criteria para reabrir Opción 2

Si post-rewrite + **4 semanas de data o 50 usuarios activos** (lo que ocurra primero) muestran completion alta pero retención/ejecución baja → reabrir Opción 2 (capa de deliverable como unidad nueva con schema propio). Requiere #4 analítica en producción primero.

### Cascada bloqueada por la decisión, ahora desbloqueada

- **Dashboard #1** (retos `isUnlocked` UUID vs numeric) → won't-fix / dead code.
- **Dashboard #4** (tablas `user_exercises`, `exercise_progress`) → dead code.
- **Gamification badge "primer reto"** → ya removido.
- **Open Claw** (visión expandida) → ya no depende de rebuild retos; futura evolución como tipo D' (deliverable ejecutado en vivo con API key del user).

---

## 4. Próximos pasos concretos (priorizados)

### Lo que el Wish List agent puede hacer SIN intervención de Pablo

1. **Mantener `docs/WISHLIST.md` actualizado** ante cualquier evento (decisión nueva, item completado, blocker descubierto).
2. **Audits empíricos en `docs/research/`** cuando una decisión grande dependa de validar una premisa.
3. **Cleanup de docs stale** cross-referencing con git log y memoria canónica.
4. **Surfacing de blockers** preguntando a Pablo con la herramienta interactiva de tu harness (`AskUserQuestion` en Claude Code, prompt directo en Codex CLI, equivalente en otros).

### Lo que necesita decisión de Pablo (orden por palanca)

1. **"Adoptamos PostHog"** (1 frase) → destraba Backend P2.13 + #4 analítica + freeze-criteria de #18 + futuro pricing/funnel.
2. **Trigger #18c pilot** → pasar el spec de `EVALUATE_SLIDES_AUDIT.md` §9-§10 a Content/Education para 10 rewrites de celebration slides. **Owner natural: Content/Education, NO Wish List**.
3. **5 validaciones manuales #19b** (20 min total): GSC `itera.la` validación de propiedad; verificar que `@iterala` existe en Twitter o cambiar handle; "Garantía de 30 días" — ¿es política real o se elimina del copy?; `/componentes` — ¿debe ser público o `noindex`?; ¿hay reviews reales para reintroducir `aggregateRating`?
4. **4 aclaraciones wish list abiertas** (de la versión original del backlog que Pablo me pasó):
   - **#12** del original quedó cortado: "mejora de la ___". ¿De qué?
   - **4 items de Awareness desaparecieron** entre versiones: Pipeline Loom → final, Pipeline Loom → YouTube, contenido gratuito YouTube, thumbnails automatizados. ¿Descartados o se cayeron?
   - **#13 UX/UI sistema completo** — ¿activación o retención?
   - **"retomar dashboard y funcionamiento"** (estacionado) — ¿qué se rompió específicamente?

### Lo que NO debes ejecutar (no es lane Wish List)

- Implementar el rewrite de celebration slides (es Content/Education).
- Tocar código de auth, email, dashboard, landing, gamification, finance.
- Cerrar Dashboard #1 / #4 directamente — solo flagear en `WISHLIST.md` para que Dashboard agent los procese.
- Decidir el stack analytics — eso lo recomendó R15 y lo confirma Pablo.
- Reabrir #18 sin que se cumpla freeze criteria.

---

## 5. Convenciones del proyecto (no negociables)

### Design system (`CLAUDE.md` en root del repo)

- UI nueva: **solo** componentes de `components/ui/` y tokens de `lib/design-tokens.ts`. Nunca hex inline ni clases Tailwind sueltas para UI con componente existente.
- Colores permitidos: primary `#1472FF`, primary-dark `#0E5FCC`, completado `#22c55e`, completado-dark `#16a34a`, text-main `#4b4b4b`, text-muted `#777777`, dark mode = white/gray-300/gray-400. Fondos: white/gray-50/gray-100 (light), gray-800/gray-900/gray-950 (dark).
- Depth (botones/cards): tokens `depthBase` / `depthStructure` / `depthActiveGroup` / `depthBottomOnly`. Nunca reimplementar manualmente.
- Border radius: rounded-xl (botones, inputs), rounded-2xl (cards, containers), rounded-full (tags, progress).
- Spacing: múltiplos de 4px (Tailwind scale).

### Tipografía y copy

- METODOLOGIA está en **v0.11**. La regla 1 ("todo minúsculas") fue **derogada**. Ahora se usa **gramática natural del español**: mayúscula al inicio de oración, nombres propios, siglas técnicas. Títulos de lecciones y secciones en **Sentence case**.
- Para UI fuera de lecciones (CLAUDE.md design system) la convención visual sigue siendo lowercase en buttons/labels — chequea en `components/ui/` para el caso específico.
- Moneda: **siempre USD**. Nunca convertir a moneda local.
- Audiencia primaria: **B2B empresa LATAM**. La empresa paga, el individuo consume. Test: *"¿lo entendería alguien de 55 años que jamás programó, usándolo en horario laboral?"*. Escenarios evergreen de oficina (correo, reporte, decisión de proveedor) — nunca médicos, financieros íntimos, personales.
- Sin abreviaciones técnicas (API, LLM, MCP, RAG, RLS) sin introducirlas primero en palabras llanas.
- Sin palabras infantiles ("trucos", "hacks", "secretos").

### Producto

- **Tesis central**: "retención + ejecución, no información". Diferenciador = ejecución aplicable en 24h.
- **Formato**: 100 lecciones × 10 slides interactivas × 10 secciones. 11 slide kinds (concept, concept-visual, celebration, mcq, multi-select, true-false, fill-blank, order-steps, tap-match, code-completion, build-prompt). `ai-prompt` está deferido.
- **Pricing**: $19 USD/mes consumer; B2B empresa abierto (rango defendible vs Platzi/Crehana for Business — research en `docs/research/R01_pricing_b2b_latam.md`).
- **Pagos**: **Stripe únicamente**. Mercado Pago descartado y eliminado en migración `010_drop_mercadopago.sql` el 2026-04-22. Pix/OXXO/Boleto son B2C, no aplican al foco empresa.
- **Email**: scope **transaccional-only** (welcome, password reset, payment receipt, "primera lección completada"). Sin engagement/lifecycle/drip/win-back.
- **Mecánicas descartadas (B2C)**: hearts/vidas limitadas como mecánica, email reminders, leaderboards, push notifications, sonidos. Sí va: progreso visible, badges Duolingo-style con tiers, milestones, dailyStreak persistida.

### Rubric pedagógico (METODOLOGIA §7)

Cada lección debe pasar 10 checks. **Rubric #4 es el centro de Opción 4**:

> *"¿El usuario sale con algo concreto aplicable en las próximas 24 horas? 'Concreto' = al menos uno de: un prompt listo para copiar y pegar, una decisión tomada (qué modelo elegir, qué flujo seguir), un checklist o bucle repetible. Si la lección termina con 'ahora ya sabes X' sin producir uno de esos tres outputs, no cumple."*

---

## 6. Cross-agent landscape (no pisar lanes)

| Agente | Lane | Trabajo activo conocido al cierre |
|---|---|---|
| Backend | infra, APIs, rate limiting, RLS, hooks | P2.13 espera adopción PostHog. Hook welcome email a `checkout.session.completed` pendiente. |
| Components | design system, Typography, refactor hex→tokens | #4 nivel `display/hero` Typography. #2 refactor hex (347 ocurrencias). |
| Dashboard | `/dashboard/*` UI, retos UI legacy | Loop Ralph Wiggum activo Codex round 7. Issues #1/#4 dead-code post #18. |
| Education | T1.1 slide_flags ✅, T1.2 funnel admin ✅, contenido lecciones | #18c pilot rewrite de 10 celebration slides — **owner natural**. |
| Finance | Stripe, paywall, customer portal, analítica financiera | Bugs #1-#3 + customer portal + hard paywall middleware + E2E test. |
| Gamification | XP, racha, badges, animaciones | Espera migración 006 aplicada. Catálogo badges sin "primer reto". |
| Illustrations | Recraft v4 + estilo `itera-flat-v1` | Rotar `RECRAFT_API_KEY`. Lista priorizada de conceptos. |
| Landing | `components/landing/`, copy, secciones | Espera Components (Typography hero) + Pablo (Claude Design output). |
| Mailing | AgentMail, DKIM, transaccional-only | M3 DKIM/SPF/DMARC de `itera.la`. NO emails engagement. |
| Onboarding | `/onboarding`, `/intake`, drafts | O1 race condition `/success` → `/courseCreation`. O2 alinear `/api/generate-course-full`. |
| Research | R-research docs en `docs/research/` | R15 ✅, R1 pricing B2B en cola, R6 embeddings (moat). |
| WhatsApp/Telegram | bot conversacional | Demo de 5 mensajes. Espera feedback Pablo + handler `callback_query`. |
| **Wish List** | **tracker en `docs/WISHLIST.md`, audits en `docs/research/`** | **Eres tú.** |

**Regla**: si tu cambio toca un archivo cuyo path apunta claramente a otra lane, **escala antes de tocar**. Ejemplo: `app/dashboard/*` no es Wish List.

---

## 7. Memoria canónica (`docs/memory/INDEX.md`)

Lee `docs/memory/INDEX.md` antes de tomar cualquier decisión grande. Pero **no confíes ciegamente en una sola memoria** — verifica empíricamente en código/data si la decisión es grande (lección de la sesión anterior, ver §10).

Memorias más relevantes para tu trabajo:

- `decision_gamification_duolingo_b2b.md` — mecánicas B2B, qué va y qué no. **Atención**: este doc decía "Evaluate replaces retos" — la auditoría empírica mostró que es media verdad. La sustitución funcional NO es completa.
- `decision_landing_pivote_ejercicios.md` — landing pasó de "videos" a "ejercicios"; copy en `components/landing/` realineado.
- `decision_mailing_scope_transaccional_only.md` — mata todo lifecycle/engagement email.
- `gotcha_cruces_estructurales_recurrentes.md` — 9 fracturas que reaparecen entre rondas de orquestación.
- `gotcha_landing_technical_debt.md` — dead code en `components/landing/`.
- `gotcha_posicionamiento_empresa_vs_latam.md` — `CONTEXT.md` decía "LATAM no-técnico", Pablo aclaró B2B/empresa.
- `gotcha_welcome_email_hook_signup_existe.md` — hook signup ya en `auth/callback/route.ts:114-121`; falta hook checkout.
- `metodologia_orquestacion_12_conversaciones.md` — patrón de trabajo Pablo: 12 convos por dominio + 1 Orquestador.
- `aprendizaje_pipeline_review_lecciones_paralelo.md` — `/itera-review` con 10 agentes paralelos revisó 100 lecciones.

---

## 8. Working tree warning crítico

**El working tree está cargado de cambios cruzados de otros agentes y herramientas.** En la sesión anterior, codex (outside voice) explícitamente advirtió:

> *"sí, pero no con `git add .` ni 'todo lo de hoy' a ciegas. El working tree está muy cargado y compartido. Hay cambios tuyos, de otros agentes, y también los cambios que hice yo limpiando 'videos'."*

**Reglas duras**:

1. **NUNCA `git add .` ni `git add -A` ni `git add <directorio>`**.
2. Stagear archivo-por-archivo: `git add ruta/exacta/archivo.tsx`.
3. Antes de commit, `git status --short | grep -E "^[AM] "` para ver exactamente qué entra al commit.
4. Separar commits por **scope lógico** (ej. SEO != docs Wish List != trabajo de otro agente).
5. Si vas a tocar un archivo y `git status` lo muestra modificado por otro agente, **escala** antes de commitear.

Categorías de cambio típicas en working tree de Itera (al cierre de sesión):
- `app/auth/*`, `app/api/auth/*` — Onboarding/Backend
- `lib/email/*`, `app/api/email/*`, `emails/`, `docs/EMAIL_*.md`, migraciones welcome — Mailing
- `lib/analytics/*`, `app/dashboard/admin/*`, migraciones slide_flags — Education
- `app/dashboard/*`, `components/dashboard/*` — Dashboard
- `content/lessons/*.json`, `lib/course-generation/*`, `docs/CONTEXT.md`, `docs/SCHEMA_v1.md` — Content/Education
- Migraciones Telegram (`009b`, `010`) — Telegram agent
- Deletes de `app/demo/`, `app/experimentLanding/`, `components/demo/`, `app/checkout/` — codex cleanup previo
- `components/landing/*`, `components/shared/Navbar.tsx` — Landing/Components

---

## 9. Archivos canónicos

| Archivo | Qué es | Cuándo leerlo |
|---|---|---|
| `AGENTS.md` (root) | Versión Codex-flavor del design system + reglas operativas. **Si tu harness es Codex, este es el doc principal**; está alineado con `CLAUDE.md` pero apunta a paths `.Codex/` para skills nativos de Codex. Contenido pedagógico y de UI idéntico al de `CLAUDE.md`. | Primero, antes de tocar UI |
| `CLAUDE.md` (root) | Versión Claude-flavor del mismo contenido. Apunta a `.claude/` skills. Si tu harness es Claude Code, este es el principal. | Equivalente a `AGENTS.md` para Claude. Contenido idéntico salvo paths de skills |
| `docs/CONTEXT.md` | Qué es Itera, audiencia, tesis, modelo de negocio, ARR, roadmap | Antes de tocar pricing, copy, estrategia |
| `docs/METODOLOGIA.md` (v0.11) | Contrato pedagógico: 5E, 10 slides, Rubric de auto-review | Antes de crear/editar cualquier lección o slide |
| `docs/LESSONS_v1.md` | Outline firmado de las 100 lecciones, 10 secciones | Antes de añadir/editar lecciones |
| `docs/SCHEMA_v1.md` | Schema DB (sections, lectures, slides, etc.) | Antes de tocar migrations o queries |
| `docs/WISHLIST.md` | **Tu tracker.** Backlog priorizado | Antes de cualquier acción Wish List |
| `docs/research/SEO_AUDIT_v1.md` | Audit completo SEO + estado P0 ✅ | Antes de #19b validaciones manuales |
| `docs/research/EVALUATE_SLIDES_AUDIT.md` | Audit empírico que produjo Opción 4 + template §9 + plan piloto §10 | Antes de touchear #18 o #18c |
| `docs/research/R15_analytics_stack.md` | Recomendación PostHog cloud US | Antes de instalar analytics |
| `docs/research/R13_icp_definition.md` | ICP B2B empresa | Antes de cambiar copy/posicionamiento |
| `docs/research/R01_pricing_b2b_latam.md` | Pricing B2B vs Platzi/Crehana for Business | Antes de tocar pricing B2B |
| `docs/memory/INDEX.md` | Índice de memorias cross-sesión | Al inicio de cada sesión nueva |

---

## 10. Lecciones meta (para que NO repitas mi error)

### Lección 1: validar empíricamente memorias antes de decisiones grandes

En la sesión anterior, el Wish List agent leyó `decision_gamification_duolingo_b2b.md` que decía *"Evaluate replaces retos"* y concluyó que #18 estaba decidido. **Codex outside voice auditó el repo y refutó la sustitución**: scan cuantitativo cubrió kind-distributions en 100/100 lecciones (100/100 evaluate=mcq+celebration; 5/100 build-prompt; 0/100 ai-prompt) + sample cualitativo de 5 lecciones contra Rubric #4 dio **0/5 PASS, 3/5 PARTIAL, 2/5 FAIL**. Si Pablo no hubiese pedido la second opinion, hubiéramos cerrado #18 con un veredicto incorrecto.

**Regla**: cuando una memoria estatua una decisión grande, audita el repo/data antes de actuar. Memorias son starting points, no terminus.

### Lección 2: cross-model tension es información, no permiso

Cuando codex contradice tu primera conclusión con datos duros, **NO auto-apliques la nueva conclusión**. Presenta las dos versiones a Pablo (vía la herramienta interactiva de tu harness o directo en chat). El founder decide. Tu trabajo es traer la evidencia, no la decisión.

### Lección 3: ejecución honesta > ceremonia rigorosa

Para strategy reviews en Itera, prefer **diagnosis directa + recomendación con evidencia + pregunta clara al founder** sobre 11-section plan-ceo-review ceremony. La ceremony está diseñada para code plans con scope expansion. Para founder decisions, lo que mueve la aguja es: premise challenge + alternatives + outside voice + decision. El resto es teatro.

### Lección 4: codex tenía razón sobre commits

Antes de hacer cualquier commit, `git status` y stagear file-by-file por scope. La intuición "todo lo de hoy" estaba mal — el working tree no era solo mío. **Codex te corregirá si te pasas; no te corregirá si te pasas en silencio**.

---

## 11. Cómo verificar que estás en buen estado al iniciar

Comandos que deberías correr al recibir este handoff:

```bash
# 1. Confirmar branch + último commit del Wish List
git log --oneline -5 main

# 2. Confirmar que los 2 commits del Wish List ya están en origin
git log origin/main --oneline -5

# 3. Ver qué hay sin commitear (tiene que coincidir con §8 — muchos archivos cruzados)
git status --short | head -30

# 4. Verificar que los archivos Wish List están en disco
ls -la docs/WISHLIST.md docs/research/SEO_AUDIT_v1.md docs/research/EVALUATE_SLIDES_AUDIT.md docs/HANDOFF_TO_CODEX.md

# 5. Leer el tracker actualizado
cat docs/WISHLIST.md | head -80
```

Si todo esto matchea, estás listo. Si no, **escala**.

---

## 12. Limitaciones honestas de este handoff

- **Conversación previa no archivada en repo**: el detalle del CEO review + cross-model tension solo vive en `docs/research/EVALUATE_SLIDES_AUDIT.md` y este handoff. Si Pablo te pregunta "¿qué dijo codex exactamente?", la cita literal no la tengo en disco — solo el resumen aquí.
- **No medí impacto real del rewrite**: la decisión de Opción 4 es teóricamente correcta según Rubric #4, pero NO hay data de retención/ejecución que la valide. El freeze criteria existe precisamente por eso.
- **Stack analytics no instalado**: R15 recomienda PostHog pero nadie lo ha instalado. Sin esto el freeze criteria no se puede gatillar.
- **#18c pilot no ejecutado**: la spec está lista (`EVALUATE_SLIDES_AUDIT.md` §9-§10) pero el rewrite real es trabajo de Content/Education.
- **Working tree no es mi territorio**: hay ~40+ archivos modificados por otros agentes. Si Pablo te pide commitear "lo de tal agente", **escala** y di que no es tu lane.

---

**fin del handoff.** owner: Wish List agent. próximo lector: Codex (o cualquier agente sucesor).
