# Itera — Wishlist

> Fuente única de verdad de **qué estamos construyendo y qué no**. Versionado en el repo.
> Cada item tiene: tesis (por qué), entregable (primer chunk ejecutable), estado, esfuerzo, dependencias.
> Última actualización: 2026-04-22 (v2 — post-coordinación cross-agent).
>
> **nota de rol:** este doc lo mantiene el agente *Wish List*. Los items cuyo owner es otro agente (Onboarding, Landing, Finance, Gamification, etc.) se trackean aquí pero se ejecutan allá.

**Leyenda**
- estado: ⚪ pendiente · 🟡 en curso · ✅ hecho · 🗄️ estacionado · ⚠️ por aclarar
- esfuerzo: S (1-3 días) · M (1-2 semanas) · L (3+ semanas)
- numeración: mantiene IDs originales del roadmap anterior para poder referenciar con `#N`

---

## estado actual del doc

✅ **cerrado hoy**: #17 feedback de usuarios — Education (T1.1 + T1.2) ya lo construyó end-to-end con granularidad slide-level.
✅ **cerrado hoy**: #19a SEO audit — `docs/research/SEO_AUDIT_v1.md` ya existía completo al iniciar.
✅ **P0 de #19b ejecutados hoy**: rewrite `StructuredData.tsx` sin aggregateRating falsa, `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx` dinámico, locale `es_419`.
✅ **destrabado hoy**: R15 research ✅ done (recomienda PostHog cloud US) — #4 pasa de ⛔ bloqueado a 🟡 adopción pendiente.
✅ **#18 decidido hoy (Opción 4)**: audit `EVALUATE_SLIDES_AUDIT.md` reveló que el problema no era "falta retos" sino que 0/5 lecciones cumplen Rubric #4 de METODOLOGIA. Decisión: **rewrite de celebration slides, sin rebuild retos**. Pilot = #18c (ready). Dashboard #1/#4 flaggeados won't-fix. Freeze criteria para reabrir Opción 2: 4 semanas de data o 50 usuarios activos.
⛔ **quedan bloqueadas**: decisión "adoptamos PostHog" de Pablo + 4 aclaraciones Wish List + 5 validaciones manuales de #19b.

---

## to-dos inmediatos (revisados post-#17-cerrado)

Ordenado por "qué puede moverse sin esperar a nadie":

1. 🟢 **#18c pilot rewrite** (S, 1-2 días) — 10 celebration slides con template Rubric #4. Ejecución por Content/Education. Spec lista en `EVALUATE_SLIDES_AUDIT.md` §9-§10. **Este es el trabajo real que mueve la tesis "ejecución" post-CEO review.**
2. 🟢 **cascada retos a won't-fix** (S, independiente) — Dashboard #1 + #4 se flaggan como dead-code cuando Dashboard agent revise backlog.
3. 🔓 **decisión R15/#4 adopción** — "adoptamos PostHog" de Pablo → Backend P2.13 instala. Una frase desbloquea tracking; sin esto no se puede medir el impacto del pilot #18c ni gatillar el freeze criteria.
4. ✅ **#19a SEO audit** — cerrado.
5. ✅ **#19b P0 fixes** — ejecutados (StructuredData, robots, sitemap, OG dinámico, locale).
4. 🟡 **#1 onboarding + #2 pitch** — Onboarding agent lidera. Wish List solo trackea.
5. 🟡 **#3 landing update** — Landing agent trabajando; espera Components (Typography hero level) + Pablo (Claude Design output).
6. ⛔ **#14 + #15 + #16 "curso vivo"** (L) — **no arrancar hasta PMF confirmado** con datos reales en prod.
7. ⏸️ **#17 feedback** — ✅ cerrado hoy por Education.

---

## dependencias cross-agent (qué agente espera qué)

| Wish List item | Owner de ejecución | Espera a |
|---|---|---|
| #4 analítica | Backend (P2.13) | ~~Research R15~~ → **R15 ya recomendó PostHog**. Espera adopción de Pablo/Backend. |
| #17 feedback | Education (T1.1+T1.2) | ✅ hecho. Solo #17b triage parked. |
| #1 onboarding | Onboarding (O1, O2) | Finance (O1 puede usar su endpoint `stripe.checkout.sessions.retrieve`) |
| #2 pitch | Components/Landing | #4 para medir impacto |
| #3 landing | Landing | Components (#4 Typography), Pablo (Claude Design output) |
| #8 redes sociales | marketing / Wish List | #4 + Illustrations `itera-flat-v1` |
| #10+#11 speaker | Wish List / backend-scraper | #2 pitch base listo |
| #14-#16 curso vivo | Education + Wish List | PMF gate (requiere #4 + feedback en prod) |
| #18 retos | decisión Pablo → Dashboard + Gamification | Pablo |
| #19a SEO audit (snapshot) | Wish List | — (puede arrancar hoy, audita estado actual) |
| #19b SEO fixes | Wish List | #19a + #3 landing estable |
| #20 finanzas | Finance | #4 analítica |
| Open Claw (visión) | producto | #18 retos resuelto |

---

## atracción

### #8 estrategia de crecimiento en redes sociales
- **tesis**: hoy dependemos de canales cerrados; sin orgánico, el CAC sube y el funnel no escala.
- **entregable**: documento de estrategia (niche + formato + cadencia) + 1 canal priorizado (ej. TikTok o LinkedIn).
- **estado**: ⚪
- **esfuerzo**: M
- **deps**: identidad visual v1 (✅ ya existe), #4 analítica

### #10 posicionamiento como speaker
- **tesis**: 1 conferencia a la audiencia correcta = 100-500 leads calificados sin ad spend. Leverage altísimo.
- **entregable**: pitch base + lista de 10 eventos LATAM objetivo + estrategia de aplicación.
- **estado**: 🟡 (existe `app/conferencias/page.tsx`, revisar qué tanto)
- **esfuerzo**: M
- **deps**: #2 pitch comercial

### #11 búsqueda de conferencias + scraping
- **tesis**: habilita #10 sin buscar eventos a mano cada semana.
- **entregable**: scraper de eventos LATAM de IA/emprendimiento → tabla con fecha, CFP deadline, contacto.
- **estado**: 🟡 (posible en `app/conferencias/`)
- **esfuerzo**: S-M
- **deps**: —

---

## activación

### #1 corrección del sistema de onboarding y creación de cursos
- **tesis**: es la puerta. Si hay fricción o bugs aquí, todo lo demás es vanidad.
- **entregable**: auditoría de flujo actual (`app/onboarding/`, `app/intake/`, `app/courseCreation/`) + lista priorizada de bugs + fix.
- **estado**: 🟡 (código existe, "corrección" implica issues conocidos — listar)
- **esfuerzo**: S-M
- **deps**: —

### #2 modernización del pitch comercial
- **tesis**: el pitch es lo que convierte visitante a registro. Si no venga en 5 segundos, pierdes al usuario.
- **entregable**: rediseño de `app/dashboard/pitch/` + A/B test vs actual.
- **estado**: 🟡 (existe la ruta)
- **esfuerzo**: S
- **deps**: #4 analítica (para medir si movió aguja)

### #3 actualización general de la página web
- **tesis**: la landing es el primer contacto con gente que no nos conoce. Hoy mezcla componentes viejos y nuevos (se borraron `demo/` y `experimentLanding/` pero quedó inconsistencia).
- **entregable**: consolidar `components/landing/` a una sola narrativa coherente (hero + problema + solución + cómo funciona + pricing + faq).
- **estado**: 🟡 (en proceso, componentes dispersos)
- **esfuerzo**: M
- **deps**: identidad visual v1 (✅)

### #13 mejora UX/UI del sistema completo
- **tesis**: el design system ya existe (CLAUDE.md lo documenta); falta aplicarlo de forma pareja.
- **entregable**: audit de inconsistencias + lista priorizada (no un rediseño).
- **estado**: ⚠️ sin sección definida — Pablo, ¿aquí o en retención?
- **esfuerzo**: M
- **deps**: —

### ⚠️ #12 — por aclarar
- **nota**: quedó cortado en la versión de Pablo: "mejora de la ___". Necesito el resto antes de planearlo.

---

## retención

### #14 sistema de actualización diaria del curso
- **tesis**: el mundo de IA cambia semanalmente. Si a los 3 meses el curso menciona herramientas muertas, perdimos la tesis de "ejecución relevante hoy". Este es el diferenciador real.
- **entregable**: pipeline que (1) detecte cambios en modelos/tools mencionados en lecciones y (2) marque lecciones como "revisar".
- **estado**: ⛔ gated por PMF
- **esfuerzo**: L
- **deps**: #15 comparte infra, #16 es la salida humana
- **gate**: **no arrancar antes de que #4 + #17 estén en producción con ≥2 semanas de datos reales.** Sin eso, invertimos L esfuerzo en un diferenciador sin validación.

### #15 detección de clases obsoletas y reemplazo
- **tesis**: complemento de #14. Sin criterio claro de "obsoleto", #14 genera ruido.
- **entregable**: regla de decisión (ej. "modelo deprecado" / "API changed" / "mejor alternativa disponible") + job que la aplique semanalmente.
- **estado**: ⚪
- **esfuerzo**: M
- **deps**: #14

### #16 reporte semanal de clases actualizadas
- **tesis**: salida humana del pipeline. Decide qué grabar/actualizar cada semana.
- **entregable**: email interno los lunes con: lecciones marcadas, tipo de actualización sugerida, prioridad.
- **estado**: ⚪
- **esfuerzo**: S
- **deps**: #14, #15

### #17 sistema de feedback de usuarios
- **tesis**: sin canal de señal estructurada, priorizamos a ciegas.
- **entregable original**: botón "reportar" por lección + tabla `feedback` en Supabase + dashboard simple.
- **estado**: ✅ **hecho por Education (T1.1 + T1.2)** — granularidad elevada a slide-level, mejor señal que lecture-level.
- **esfuerzo**: 0 (ya construido)
- **evidencia**:
  - Schema: `supabase/migrations/009_slide_flags.sql` (tabla + view admin), `011_global_engagement_view.sql`, `012_slide_flags_admin_v2.sql` (view v2 con `open_reasons` + `open_flags_by_section`)
  - UI: `components/experiment/SlideFlagButton.tsx` — modal con 6 reasons predefinidos, textarea solo cuando el user elige `other`, dedupe server-side (unique index + `23505` → 200 OK)
  - Integración: `components/experiment/ExperimentLesson.tsx:709` — botón vive en cada slide
  - API: `app/api/slides/[id]/flag/route.ts` — POST auth-gated, valida UUID, dedupea `23505`
  - Admin: `app/dashboard/admin/funnel/page.tsx` — KPIs globales + top-flagged + flags por sección + peores completion
  - Lib: `lib/analytics/{flags,funnel,sections,global,user,types}.ts` — queries compartidas
  - Auth: `lib/auth/isAdmin.ts` — whitelist por email `@itera.la`
- **caveat**: rutas de demo estática sin slide_id renderizan sin botón (esperado — sin id no hay dónde reportar).
- **gap identificado**: no hay triage/detail workflow (ver comentarios en bruto del user, inspeccionar `user_attempt`, cambiar `status` → `triaged`/`resolved`/`wontfix`). Hoy requiere edit directo en DB. Schema ya lo soporta (`status`, `resolved_at`, `resolved_notes`). → ver **#17b** en estacionado.

### #18 retos — decisión reformulada post-CEO review (2026-04-23)
- **estado del framing original**: ⚠️ stale. El commit `d146ed7` eliminó retos **intencionalmente** (founder curation, no accidente). Los cascade bugs Dashboard #1 + #4 son dead code. Gamification badge "primer reto" ya removido. **No hay "decisión pendiente de rebuild sí/no"** — eso fue decidido.
- **decisión real que sí está pendiente** (descubierta por codex outside voice):
  - Evidencia empírica: 100/100 lecciones usan `evaluate = mcq + celebration` (retrieval practice, NO "ejecución real"). Solo 5/100 usan `build-prompt`, 0/100 usan `ai-prompt`.
  - METODOLOGIA §Evaluate la define como "verificar comprensión", no como "ejecutar trabajo real".
  - El pipeline pre-`d146ed7` tenía steps 4/5 que generaban ejercicios con `deliverable` aplicado al proyecto del user. Eso se eliminó sin reemplazo.
  - Tablas `user_exercises`, `exercise_progress`, `checkpoint_submissions` borradas (`000_nuke_legacy.sql`).
  - **Hoy solo medimos `slides_completed`, `xp_earned`, `attempts` — pasamos de "práctica personalizada con deliverable" a "completion tracking"**.
  - Gap vs tesis: `CONTEXT.md:13` + `R13_icp_definition.md:102` + `EMAIL_STRATEGY.archived.md:171` dicen que Itera vende "retención + ejecución reportada, no completion". Hoy no capturamos artefactos ni outcome.
  - **Riesgo estratégico**: Itera se desliza de "AI operator para empresa" → "curso bonito con buena completion".
- **audit empírico adicional** (2026-04-23, `docs/research/EVALUATE_SLIDES_AUDIT.md`): 100/100 lecciones cierran con `celebration`; 0/5 samples cumplen plenamente Rubric #4 de la propia METODOLOGIA (3/5 PARTIAL, 2/5 FAIL). El problema no es "falta feature retos" — **el contenido no cumple su propio contrato pedagógico**.
- **opciones que se evaluaron**:
  1. **Ratificar-complaciente** — retos dead, limpiar docs, Open Claw Q3. Bajo esfuerzo, alto riesgo estratégico.
  2. **Restaurar capa de deliverable** como unidad nueva con schema propio — scope L.
  3. **Congelar hasta datos** — ship MVP, esperar PostHog + 4 semanas.
  4. **Rewrite de celebration slides para cumplir Rubric #4** — scope S-M, content-only, sin schema, sin feature nueva.
- **decisión tomada (Pablo 2026-04-23, post-audit)**: ✅ **Opción 4**. Conserva tesis de ejecución sin arquitectura nueva. Ver `EVALUATE_SLIDES_AUDIT.md` §8 (implicación) y §9 (template) y §10 (plan piloto). Las Opciones 1/2/3 quedan como fallback según freeze criteria abajo.
- **freeze criteria para reconsiderar Opción 2** (codex): reabrir si post-rewrite + **4 semanas de data o 50 usuarios activos** (lo que ocurra primero) muestran completion alta pero retención/ejecución baja. Requiere #4 analítica en prod primero.
- **cascada inmediata (ya desbloqueada por la decisión)**:
  - Dashboard #1 (retos `isUnlocked` UUID vs numeric) y #4 (tablas `user_exercises`): **won't-fix / dead code** — flaggear en backlog Dashboard.
  - Gamification badge "primer reto": ya removido, confirmado en `decision_gamification_duolingo_b2b.md`.
  - Open Claw (visión expandida): ya no depende de rebuild retos; puede evolucionar como tipo D' futuro (deliverable ejecutado en vivo con API key del user) sin bloquear el rewrite actual.
- **referencia**: `docs/research/EVALUATE_SLIDES_AUDIT.md`, CEO review + codex outside voice 2026-04-23.

### #18c (Opción 4 en ejecución) — pilot rewrite de 10 celebration slides
- **tesis**: validar cualitativamente el template Rubric #4 en 10 lecciones antes de hacer rollout a las 100. Evita que el rewrite masivo resulte mejor teoría que producto.
- **entregable**: 10 lecciones rewritten con celebration body cumpliendo template de `EVALUATE_SLIDES_AUDIT.md` §9 (3× tipo A plantilla, 3× tipo C checklist, 2× tipo B decisión, 2× tipo D prompt final) + 10 de control para comparación cualitativa.
- **estado**: ⚪ ready — spec completa en el audit doc, listo para ejecución.
- **esfuerzo**: S (1-2 días con asistencia AI + Pablo firmando cada rewrite).
- **dueño natural**: Content / Education (no es lane del Wish List agent — yo solo mantengo tracker + spec).
- **decisión post-pilot**: si la muestra se siente más "ejecución" y menos "curso" → rollout a 100/100. Si no → revisar template o considerar Opción 2 con data.

### #19a SEO audit del estado actual (snapshot)
- **tesis**: audit del estado vigente del sitio. No requiere #3 estable — justamente para saber qué romper y qué preservar cuando Landing itere.
- **entregable**: `docs/research/SEO_AUDIT_v1.md` con inventario completo + top-10 issues priorizados + validaciones pendientes de Pablo.
- **estado**: ✅ **hecho** 2026-04-23 — audit completo, 10 issues identificados (4 P0 + 5 P1 + 1 P2).
- **esfuerzo**: 0 (ya existía al iniciar esta sesión)
- **deps**: —

### #19b SEO fixes
- **tesis**: aplicar los top-10 issues de #19a. Los P0 (infraestructura) son independientes de #3 landing; los P1 (copy, per-page metadata) sí esperan landing estable.
- **entregable (P0)**: ✅ **hecho** 2026-04-23 — rewrite `StructuredData.tsx` sin fakes, `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx` dinámico, locale `es_419` en layout.
- **entregable (P1+)**: per-page `generateMetadata` (privacy, terms, about, conferencias), rewrite `/about` con contenido real, limpiar `ignoreBuildErrors` en next.config, `apple-icon`, dynamic OG per `/lecture/[slug]`.
- **estado**: 🟡 P0 hechos, P1+ en espera de #3 landing.
- **esfuerzo**: P0 = S (hecho) · P1+ = M
- **deps P1+**: #3 landing estable + validaciones manuales de Pablo (ver SEO_AUDIT_v1.md §5).
- **validaciones pendientes de Pablo (20 min)**: GSC `itera.la`, Twitter `@iterala` existe?, "Garantía 30 días" es real?, `/componentes` debe ser público?, hay reviews reales para reintroducir aggregateRating?

---

## monetización + ops

### #4 sistema de seguimiento y analítica web
- **tesis**: bloqueante universal. Sin eventos trackeados, cada otra priorización es opinión.
- **entregable**: PostHog (recomendado por R15) + 4 eventos críticos: `signup`, `onboarding_completed`, `first_lesson_done`, `d7_return`.
- **estado**: 🟡 research done, adopción pendiente — `docs/research/R15_analytics_stack.md` recomienda **PostHog cloud US**, free tier 1M eventos/mes.
- **esfuerzo**: S
- **deps**: confirmación de Pablo ("adoptamos PostHog") + Backend P2.13 ejecuta install + eventos.
- **plan B si PostHog no convence**: Mixpanel (R15 lo lista como fallback). Plan C si enterprise-client lo exige: Amplitude.

### #20 sistema financiero de control de ingresos
- **tesis**: Stripe ya procesa pagos; falta visibilidad ejecutiva (MRR, churn, LTV, refunds) sin meterse al dashboard de Stripe.
- **entregable**: página `dashboard/finanzas` que lea de Stripe + Supabase: MRR actual, nuevos subs este mes, churn %, LTV promedio.
- **estado**: ⚪
- **esfuerzo**: M
- **deps**: #4 analítica (para cruzar acquisition con revenue)

---

## producto expandido (visión, no ahora)

### conectar cuenta de ChatGPT / Claude del usuario (estilo Open Claw)
- **tesis**: hypercorrection requiere práctica real, no teoría. Conectar el LLM del user permite ejecutar retos en vivo dentro de la lección. Diferenciador mayor vs cualquier curso de LATAM.
- **entregable**: input de API key user + 1 reto ejecutable en vivo en 1 lección piloto.
- **estado**: 🗄️
- **esfuerzo**: L
- **deps**: #18 retos resuelto primero

### retomar sistema de seleccionar clases por idea/producto del usuario
- **tesis**: parte de la promesa "curso personalizado para tu proyecto". Hoy el onboarding pregunta, pero la ruta no se personaliza profundamente.
- **entregable**: engine que mapee (idea del user + tiempo disponible) → subset de lecciones + orden.
- **estado**: 🗄️
- **esfuerzo**: L
- **deps**: #1 onboarding resuelto, #18 retos definidos

---

## estacionado (no tocar ahora)

| Item | Nota |
|---|---|
| sistema retención basado en proyectos | superposición con "producto expandido"; decidir cuál prima |
| reenfocar y crear rutas especializadas en temario | depende de traccción; premature hoy |
| scraping gigs + entrega personalizada | visión de largo plazo (marketplace de productos); requiere masa crítica de usuarios primero |
| retomar dashboard y funcionamiento | falta claridad de qué "retomar" significa — Pablo, expandir |
| optimización de contenido en redes (futuro) | post-#8 |
| reportes automatizados de mercado (futuro) | utility, no urgente |
| agenda crecimiento speaker + networking (futuro) | post-#10, #11 |
| **#17b triage/detail workflow para flags admin** | gap detectado al cerrar #17: ver comentarios del user + `user_attempt` JSONB + cambiar `status`. Schema ya lo soporta (`status`, `resolved_at`, `resolved_notes`). Dueño natural: Education. S esfuerzo. |

---

## decisiones pendientes de Pablo

### bloqueantes directos del Wish List (5)

1. **#12**: quedó cortado — "mejora de la ___". ¿De qué?
2. **items originales de Awareness** que desaparecieron en la nueva versión: Pipeline Loom → sistema final, Pipeline Loom → YouTube, Estrategia de contenido gratuito en YouTube, Sistema automatizado de thumbnails. ¿Descartados o se cayeron sin querer?
3. **#18 retos**: ¿rebuild o salen de la lista? **🔓 destraba 3 agentes.**
4. **#13 UX/UI sistema completo**: ¿va en activación o en retención?
5. **"retomar dashboard y funcionamiento"** (estacionado): ¿qué se rompió / qué falta?

### transversales que tocan al Wish List (heredadas de otras conversaciones)

6. ~~**Research R15 (stack de analytics)**~~ → ✅ **R15 done, recomienda PostHog cloud US**. Pablo solo debe confirmar ("adoptamos PostHog") para que Backend P2.13 arranque instalación.
7. **`experimento_how_it_works_visual`**: Remotion vs screenshots vs ilustraciones. Afecta #3 landing.
8. **Illustrations: piel LATAM + ropa plana monocolor sí/no**: afecta #8 (redes) y potencialmente #3 (hero rediseñado).
9. **Landing CTA "cómo funciona →" roto**: cambiar, eliminar, o apuntar a FAQ. Afecta #3.
10. **Landing L2 (tier gratis canibaliza $19)**: qué se quita del gratis. Afecta narrativa #3.

### orden propuesto para destrabar

1. **#18 retos** (palanca más alta: 3 agentes + Open Claw)
2. **confirmar "adoptamos PostHog"** para #4 (R15 ya recomendó; una frase desbloquea Backend P2.13)
3. **5 aclaraciones Wish List** (destraba este doc)
4. **decisiones de landing** (destraba #3)
5. **illustrations** (estética transversal)

---

## cosas ya hechas que no estaban en la wishlist (meter para que quede limpio)

- **estrategia de email v1** (`docs/EMAIL_STRATEGY.md`, `lib/email/`, `emails/WelcomeEmail.tsx`, `app/api/email/welcome`) — research Duolingo + welcome mail. Encaja en **retención**.
- **identidad visual v1** (`docs/IDENTIDAD_VISUAL.md`, `docs/identidad-visual/`) — motor de imágenes (Recraft v4 + estilo itera-flat-v1). Transversal.
- **gamification** (`lib/gamification.ts`, `docs/GAMIFICATION_AUDIT.md`) — sistema parcial de streaks/badges. Encaja en **retención**.
- **migración Mercadopago → Stripe** — rutas MP eliminadas. ¿Intencional? Si sí, cerrado.
