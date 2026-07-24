# Handoff activo

Este archivo queda limpio después de la purga `20260519`. El historial previo vive en git; el árbol activo ya no conserva archivo legacy local.

## 2026-07-09 — codex — cierre DEMO-20260709-01

### aprobado

- Claude Code resolvió el hueco estructural del demo: Participante D. pasa de un perfil mixto con gap en Datos a práctica dirigida, resimulación y mejora medible, usando `practice_datos_minimizacion_pii_v1`.
- Codex pidió y verificó una segunda ronda: el ejemplo ya no se presenta como reporte real de un cliente y las KPI se apilan en desktop para eliminar cortes de texto.
- QA independiente: 1280 px y 390 px sin overflow; dark con tokens/contraste correctos; consola limpia. El demo queda disponible en `http://localhost:3003/demo`.

### gates

- PASS: `npx eslint app/demo/page.tsx`, `npm run typecheck:simulador`, `npm run check:simulador`, `npm run build`, `npm run coord:lint`.
- `npm run lint:simulador` global sigue fallando por el error preexistente `react-hooks/set-state-in-effect` en `components/simulador/CaseReviewWalkthrough.tsx:90`; `app/demo/page.tsx` no aporta errores.
- Sin commit. No se tocaron los cambios previos de `AITextfieldGuided.tsx`, `BLOCKERS.md` ni `docs/design/itera-design-system.html`.

## 2026-07-09 — claude — DEMO-20260709-01 loop visible en /demo (→ review Codex)

### done

- `app/demo/page.tsx` (ÚNICO archivo tocado; no se tocaron archivos sucios previos).
- Reporte individual de Participante D.: de 6 dimensiones en Bajo + recomendación Pausar → perfil MIXTO creíble (Contexto/Juicio Alto, Ejecución IA/Validación/Impacto Medio, Datos Bajo = gap) con recomendación **Entrenar**. Riesgos recortados a 2 (PII alto = el gap, cifra sin fuente medio) coherentes con el perfil. Línea de rationale reescrita (ya no "un riesgo alto siempre baja la autonomía").
- Sección 5 "La capacitación" reemplazada por sección 5 "La mejora": recorrido ILUSTRATIVO de la MISMA persona en una sola lectura — Intento 1 (Datos Bajo, PII) → práctica real `practice_datos_minimizacion_pii_v1` (6 min, 2 ejercicios, dimensión Datos N1, principle card citado) → resimulación del mismo caso → delta visible (Datos Bajo→Medio con barras antes/después, readiness +14, riesgos PII −2) + acción del manager (Entrenar→Pilotar). Rotulado explícito "recorrido ilustrativo generado con el sistema —no un histórico de un cliente real—". Cierre: "ese loop es el producto… no suma evaluación y microlearning como dos cosas sueltas".
- Reusa apple exports `AppleTimeline` + `AppleKpiCard` y helpers locales existentes `Bar`/`BandPill`. Sin componente reusable local nuevo. Sin hardcodes.

### evidence

- Gates: `npm run typecheck:simulador` 0 · `npm run check:simulador` OK · `npx eslint app/demo/page.tsx` 0 · `npm run build` PASS.
- Anti-hardcode sobre app/demo/page.tsx: text-px 0 · builtin-type 0 · hex 0 · var-fallback-hex 0 · radius 0.
- Browser (host.docker.internal:3003/demo): render desktop + mobile (390px, stack correcto) + dark (surfaces/bandas/KPI con paridad); consola 0 errores. Screenshots en `/tmp/playwright-output/demo-loop-*.png`.

### handoff a Codex

- Gate independiente del diff + browser QA. Sin commit (pendiente decisión de Pablo). `status: review` en el board.

## 2026-06-25 — codex — cierre UX-20260623 final verification

### done

- Claude Code cerró la UI/.tsx: onboarding org/invite, CaseCard destination, `/empresa` autosave/billing, AppleSelect layering, `/casos` filters, `/report` single nav y `/admin/*` single nav.
- Codex cerró datos/rutas/runtime: seed local, dev:simulador apuntando a Supabase local, `/report/demo-session-id`, destination API de casos, settings/billing API de empresa, Stripe portal return path, admin review API normalization, route audit de `/case` y `/jugar`.
- Fix final Codex: `/api/dashboard` ahora prefiere el sprint operativo con `sprint_package_id` sobre el sprint standalone que crea `/jugar`; con auth real devuelve `mock=false`, 4 miembros, 2 completados, 1 en curso, 3 risk events y 1 pending review.
- Fix final Codex: `/aprender-demo` quedó en `internalReviewRoutes` del proxy, alineado con FRONT_CONTRACT dev-only/noindex.
- `BUILD_BOARD.yaml` marca `UX-20260623-01` a `UX-20260623-17` como `done`.
- `BLOCKERS.md` resuelve el blocker `ux-20260623-waiting-claude-ui`.

### evidence

- Screenshots: `/tmp/itera-final-ux-20260625/`.
- Capturas clave: `dashboard-manager-real-datafixed.png`, `staff-index-real-datafixed.png`, `admin-review-single-nav.png`, `onboarding-org-dropdown-tablet.png`, `casos-ana-desktop-final.png`, `empresa-desktop-final.png`, `report-ana-final.png`.
- Gates PASS: `npx tsc --noEmit`, `npm run check:simulador`, `npm run build`, `npm run coord:lint`.
- `npm run lint:simulador` se colgó otra vez y fue cortado a 120s tras iniciar `lint-scope.mjs`; queda documentado como tooling timeout.
- Codex CLI review no corrió por usage limit; fallback Claude Code CLI dio PASS final.

### residual

- No hay blocker funcional abierto de esta ronda.
- No hubo commit; el repo queda en working tree sucio compartido, como pidió Pablo.

## 2026-06-25 — claude — cierre UX-02/03/06 (verificación, sin código)

### done

Pase de cierre acotado por Pablo. **No hubo cambios de código** — todas las partes ya estaban implementadas en olas previas; este pase fue verificación + close en el board.

- **UX-20260623-02 → done.** Públicas/auth/legal/result verificadas: `/auth/login`, `/auth/signup`, `/auth/invitation/[token]`, `/privacy`, `/terms`, `/cancel`, `/success`. Títulos `display display-tight` 28/32px **sin punto** y jerarquía estándar. `privacy`/`terms` reestructuradas y servidas desde la fuente canónica `lib/simulador/copy/legal.ts` (MX+CO con `framework_citation` + `footer_disclaimer`), sin prometer compliance no verificado. maintenance/not-found/invitation-error sin contorno (patrón result-state).
- **UX-20260623-03 → done.** Onboarding verificado: `/onboarding/org` AppleSelect abre al primer click (portalContainer en useEffect, sin exigir textfield); `/onboarding/invite` usa `validateOnboardingInvites` (CTA solo activa con todas las filas válidas, payload desde `validRows`); `/onboarding/context` acepta solo PDF (`accept="application/pdf,.pdf"` + filtro), placeholder "Sitio web", prefill `https://` en focus, label "Adjuntar archivos (PDF)", "Completar después" subrayado, y guarda website+PDF metadata en estado de onboarding para pasarlos al checkout como contexto comercial; `/onboarding/billing` redirects Stripe correctos (Codex UX-12); `/onboarding/done` server component con 3 estados reales (confirmado/pending/fallido), títulos sin punto.
- **UX-20260623-06 → subset system-states cerrado (tarea sigue abierta).** Scope acotado: solo system states, sin tocar `/jugar` ni `/case` runtime. `/maintenance` y `/not-found` sin contorno, título estándar sin punto, sin mini-títulos (no existe `/not-found-test-page` separada; es `app/not-found.tsx`). `/report/demo-session-id` ya **no** queda en loader infinito (Codex UX-09 sirve reporte real `pending_review` del seed) y **no** tiene doble nav (AppShell trata `/report/` como surface-owned: sin AppSidebar ni padding `md:pl-[224px]`, una sola SurfaceNav). Residual que mantiene la tarea abierta: `/case/marketing_urgent_campaign_pii` estado diseñado, `/aprender-demo` alineado a case-template, protección dev-only de `/case-demo` `/exercise-lab` `/case-template` — son runtime/labs y requieren su propio pase.

### tested

- `npx tsc --noEmit` → 0 errores.
- `npm run check:simulador` → PASS.
- No corrí `npm run build`: no hubo cambios de código.
- Sin commit (a pedido).

### siguiente

- Codex/UX-07/17: verificación visual autenticada (screenshots desktop/tablet/mobile) sigue como residual del round.
- El residual runtime/labs de UX-06 queda para un pase con runtime (fuera de este cierre).

## 2026-06-25 — claude — UX-20260623 fix 3 P1 de UI (verificación final Codex)

### done

Scope estricto UI/.tsx/componentes (sin app/api, lib data/runtime, scripts, supabase, seed).

- **AppleSelect layering** (`components/simulador/apple/AppleInput.tsx`): el popover se portalea dentro de `.simulador-root` para heredar tokens, pero pierde el stacking de overlay de HeroUI (que depende de estar al final de `<body>`) y competía con los stacking contexts del form — el `transform` de framer-motion en el wrapper crea uno — quedando DETRÁS de los campos siguientes y leyéndose transparente. Fix: z-index explícito alto vía `popoverProps.classNames.base = "z-50"`. Render por encima de los controles, superficie opaca legible. Afecta a todos los AppleSelect (incl. /onboarding/org).
- **Doble logo/nav en /report** (`app/(app)/AppShell.tsx`): el report monta su propia `SurfaceNav` y el shell además montaba `AppSidebar`. Ahora `/report/` es surface-owned (igual que runtime `/case` y `/jugar`): sin `AppSidebar` ni padding `md:pl-[224px]`. Una sola nav. Runtime intacto.
- **Filtros /casos** (`app/(app)/casos/page.tsx`): los `Select` crudos de HeroUI (Nivel/Departamento/Duración/Herramientas + Ordenar) ahora usan el `AppleSelect` central → controles reales con popover legible y consistente con el resto del sistema.

### tested

- `npx tsc --noEmit` → 0 errores.
- `npm run check:simulador` → PASS.
- `npm run build` → PASS (todas las rutas compilan).
- Sin commit (a pedido).

## 2026-06-25 — claude — UX-20260623 conexión UI a contratos Codex (UX-10/11/13/14/15)

### done

- **CaseCard → destination API** (`components/simulador/CaseCard.tsx`): el click ya no linkea directo a `/case/{slug}`. Ahora hace prefetch en hover/focus de `GET /api/cases/[slug]/destination` y en click navega a `href` (`/report/{session}` si completó, `/jugar/{case}` si no). Fallback a `/case/{slug}` si la llamada falla; respeta cmd/ctrl-click; spinner mientras resuelve. Cubre `/casos`, `/team` y `/staff/casos` (todos usan la misma card).
- **/empresa reescrita** (`app/(app)/empresa/page.tsx`): de mock placeholder a UI real sobre el contrato de Codex.
  - GET `/api/orgs/current/settings` al montar (loading skeleton + estado de error).
  - Autosave PATCH: nombre (debounce 700ms), industria/región/tamaño (inmediato). **Sin** botón Guardar/Cancelar. Indicador "Guardando…/Cambios guardados/Error" en el header (`role=status`).
  - Website editable una vez; al confirmarse muestra valor bloqueado con check. Maneja 409 `website_locked`.
  - Archivos solo PDF; respeta `files_can_change_this_month`; maneja 409 `files_monthly_limit`.
  - Billing: "Gestionar o cancelar billing" → POST `create-portal-session { return_path:"/empresa" }` → redirect a `sessionUrl`; deshabilitado con copy si `!can_open_portal`.
  - Apple components (`AppleInput/AppleSelect/AppleButton/AppleIcon`), sin contornos de sección (dividers + whitespace), título sin punto, sin mini-títulos.
- **UX-10 / UX-11** ya estaban resueltos en el árbol sucio de la sesión previa y quedaron verificados: `AppleSelect` tiene el fix de `portalContainer` en `useEffect` (dropdown abre al primer click sin exigir textfield), y `/onboarding/invite` ya consume `validateOnboardingInvites` (`canSubmit` requiere todas las filas visibles válidas; payload desde `validRows`).

### tested

- `npx tsc --noEmit` → 0 errores.
- `npm run check:simulador` → PASS.
- `npm run build` → PASS (todas las rutas compilan, incl. `/empresa`).
- HTTP smoke (dev:simulador contra Supabase local, :3003): `/empresa`, `/casos`, `/staff/casos`, `/team`, `/onboarding/org`, `/onboarding/invite` → 200; `/api/cases/.../destination` y `/api/orgs/current/settings` → 401 sin auth (correcto).

### gotchas / residual

- **Screenshots interactivos desktop/mobile no se tomaron**: el browser MCP requiere permiso interactivo no disponible en este run headless por CLI. Verificación visual real (overlaps, estado autosave en vivo, portal Stripe end-to-end con sesión autenticada) queda como residual para UX-07 (Codex/Pablo). El render server-side y la compilación sí están verificados.
- No corrí `lint:simulador` (bloqueo ambiental ya documentado por Codex: se cuelga sin output).

### siguiente

- Codex toma UX-07/17: gates finales + verificación visual autenticada (login manager.demo@itera.local, abrir `/empresa` y un caso desde `/casos`, confirmar autosave y routing a reporte/runtime).

## 2026-06-25 — codex — UX-20260623-08 seed local para review

### done

- Se retomó el split acordado: Claude Code lidera UI/.tsx/diseño/copy y Codex conserva datos/rutas/runtime/APIs/Supabase/billing/bugs funcionales.
- `scripts/simulador/seed-demo-local.mjs` siembra datos demo locales usando `supabase status -o json` y rechaza URLs que no sean `127.0.0.1` o `localhost`.
- La semilla es idempotente: usa UUIDs deterministas y upserts.
- Supabase local quedó con datos de revisión:
  - 1 organización
  - 1 equipo
  - 5 usuarios
  - 3 generated cases
  - 5 case templates
  - 3 sesiones
  - 3 reportes
  - 4 practice beats
  - human review queue, risk events, manager alert, evidence y recommendation demo
- La migración `20260515000115_move_vector_extension_to_extensions.sql` ya no falla en base local fresca: crea `vector` en `extensions` si falta y solo mueve la extensión si existe fuera de ese schema.

### tested

- `npm run coord:lint` PASS.
- `node --check scripts/simulador/seed-demo-local.mjs` PASS.
- `node scripts/simulador/seed-demo-local.mjs` PASS.
- `supabase migration list --local` PASS.
- `npm run check:simulador` PASS.
- `npm run build` PASS.
- `claude -p` review PASS sin bloqueos.

### gotchas

- `npm run lint:simulador` quedó colgado sin output y fue interrumpido. Claude Code CLI también lo clasificó como bloqueo ambiental de ESLint/tooling, no defecto de la semilla.
- No se tocaron `.tsx`, componentes visuales, tokens ni copy de UI.

### siguiente

- Claude Code puede revisar surfaces con datos locales reales.
- Los siguientes bugs de Codex deben abrirse como tareas separadas: onboarding/org dropdown, onboarding/invite validación, staff/casos data/crash, casos routing, empresa reglas de datos/billing, Stripe redirect/cancelación y evaluación de `/jugar/vertiz_backlog_entregas` vs `/case/marketing_urgent_campaign_pii`.

## 2026-06-25 — codex — UX-20260623-09 report demo-session-id

### done

- `scripts/dev-simulador.mjs` ahora arranca Next contra Supabase local cuando `supabase status -o json` expone un API local.
- El script conserva opt-out para remoto: `ITERA_USE_REMOTE_SUPABASE=1` o `ITERA_USE_LOCAL_SUPABASE=0`.
- `app/api/sessions/[session_id]/report/route.ts` resuelve alias/UUID reales solo cuando `NEXT_PUBLIC_SUPABASE_URL` es local.
- El bypass anónimo en remoto/preview/prod ya no puede leer reportes reales con service-role; en remoto cae a mock o requiere auth.
- `/report/demo-session-id` usa el reporte seed de Bruno (`pending_review`) en vez de loader/mock.

### tested

- `curl http://localhost:3003/api/sessions/demo-session-id/report` -> 200 `pending_review`.
- Playwright `http://localhost:3003/report/demo-session-id` -> no loader; muestra "En revisión humana" y datos reales del seed.
- `npm run coord:lint` PASS.
- `npm run check:simulador` PASS.
- `npm run build` PASS.
- Claude Code CLI re-review PASS.

### gotchas

- `npm run lint:simulador` volvió a quedar sin output y el timeout controlado lo cortó a 120s.
- La primera revisión de Claude Code CLI detectó un P1: admin read por UUID remoto en bypass. Quedó corregido antes de cerrar.
- No se tocaron `.tsx`, tokens, componentes visuales ni copy.

### siguiente

- Codex continúa con onboarding org/invite, staff/casos, casos routing, billing/empresa y rutas legacy según UX-10..16.

## 2026-06-25 — codex — UX-20260623-10/11 onboarding org invite

### done

- UX-10 diagnosticado: el dropdown de `/onboarding/org` falla antes de cualquier llamada API; vive en el control `AppleSelect`/page `.tsx`.
- UX-11 helper listo: `lib/simulador/onboarding-invitations.ts` define `validateOnboardingInvites(rows)`.
- El helper devuelve `canSubmit=false` si cualquier fila visible esta vacia o tiene email invalido; tambien devuelve `validRows`, `invalidIndexes` y `validCount`.
- Se dejo handoff urgente a Claude Code para conectar el helper y corregir `AppleSelect` en UI.

### tested

- `npm run coord:lint` PASS.
- `npm run check:simulador` PASS.

### gotchas

- Codex no edito `.tsx` por la division acordada.
- El endpoint de invitaciones ya filtra invalidos, pero la UI actual no le envia las filas invalidas; por eso el fix real del boton requiere cambiar la pagina.
- UX-10/11 quedan bloqueados para Codex hasta que Claude Code conecte la UI.

### siguiente

- Codex continua con staff/casos, casos routing, billing/empresa y rutas legacy mientras Claude Code cierra la UI de onboarding.

## 2026-06-25 — codex — UX-20260623-13/14 cases destination

### done

- Se agrego `lib/simulador/case-destination.ts`.
- Se agrego `GET /api/cases/[case_id]/destination`.
- El contrato devuelve `action`, `href`, `session_id`, `session_status`, `report_status` y `reason`.
- Si el usuario ya completo el caso, devuelve `action=report` y `/report/{session_id}`.
- Si el usuario no lo empezo o tiene sesion activa, devuelve `action=play` y `/jugar/{case_id}`.
- El endpoint exige auth antes de usar service-role y scopea templates a orgs del usuario + globales.

### tested

- Curl anonimo a `/api/cases/marketing_urgent_campaign_pii/destination` -> 401.
- Playwright login local con `ana.demo@itera.local` -> `href=/report/77777777-7777-4777-8777-777777777701`.
- `npm run check:simulador` PASS.
- `npm run coord:lint` PASS.
- `npm run build` PASS.
- Claude Code CLI review PASS.

### gotchas

- Codex no conecto `CaseCard`, `/casos` ni `/staff/casos` porque son `.tsx`.
- Mientras UI siga linkeando a `/case/{slug}`, algunos slugs pueden caer en runtime legacy o no encontrado.

### siguiente

- Claude Code debe consumir `destination` desde las tarjetas/listas y navegar a `href`.
- Codex continua con billing/empresa y auditoria de rutas legacy.

## 2026-06-25 — codex — UX-20260623-12/15 billing empresa

### done

- `POST /api/stripe/create-portal-session` vuelve por default a `/empresa`.
- El portal acepta `return_path` solo si es interno y allowlisted; evita open redirects.
- `GET /api/orgs/current/settings` devuelve org settings, company profile, subscription y billing portal availability.
- `PATCH /api/orgs/current/settings` permite autosave de datos de organización.
- Website queda editable una vez; un valor distinto posterior devuelve `409 website_locked`.
- Files aceptan solo PDF y max un cambio por mes; segundo cambio mensual devuelve `409 files_monthly_limit`.

### tested

- Curl anonimo a `/api/orgs/current/settings` -> 401.
- Playwright manager demo:
  - GET settings -> 200.
  - website PATCH -> 200, segundo website distinto -> 409 `website_locked`.
  - files PATCH -> 200, segundo cambio -> 409 `files_monthly_limit`.
- `npm run coord:lint` PASS.
- `npm run check:simulador` PASS.
- `npm run build` PASS.
- Claude Code CLI review PASS.

### gotchas

- No se llamo a Stripe para crear portal real en smoke para evitar tocar API externa; se reviso el redirect por codigo y Claude Code CLI.
- Codex no conecto `/empresa` ni `/onboarding/done` porque son `.tsx`.

### siguiente

- Claude Code debe conectar `/empresa` a GET/PATCH settings, quitar Guardar, usar autosave y abrir portal con `{ return_path: "/empresa" }`.
- Codex continua con auditoria de rutas legacy.

## 2026-06-25 — codex — UX-20260623-16 route audit

### done

- `/case/marketing_urgent_campaign_pii` fue evaluada como load-bearing.
- `/jugar/vertiz_backlog_entregas` fue evaluada como load-bearing.
- No se borro ninguna ruta.
- Se aviso a Claude Code en INBOX_CLAUDE.

### evidencia

- `components/simulador/CaseCard.tsx`, `/dashboard`, `/reportes` y `/staff/*` aun linkean a `/case/{slug}`.
- `docs/simulador/front/FRONT_CONTRACT.md` marca `/case/[case_id]` como ruta conectada hoy y `/jugar/[case_id]` como ambiguo/RuntimeV2.
- `vertiz_backlog_entregas` existe en `lib/simulador/cases-registry.generated.ts` y `docs/simulador/contrato_v0/cases_assembled/vertiz_backlog_entregas_v1.yaml`.
- El nuevo `GET /api/cases/[case_id]/destination` devuelve `/jugar/{case_id}` para casos activos/no empezados.

### siguiente

- No archivar `/case` ni `/jugar` hasta que Claude Code conecte UI al destination API y se actualice FRONT_CONTRACT con la ruta canonica final.

## 2026-05-19 — codex — purga legacy completa

### done

- La superficie activa quedó centrada en el Simulador corporativo.
- Las rutas de página activas son:
  - `/`
  - `/auth/login`
  - `/auth/signup`
  - `/field-test/marketing-urgent-campaign-pii`
  - `/dashboard`
  - `/case/[case_id]`
  - `/report/[session_id]`
  - `/admin`
- Se eliminaron del árbol activo los artefactos del producto anterior.
- Se retiraron del árbol activo rutas, assets, docs, scripts, emails, tipos y libs del producto de cursos.
- Se limpiaron los flujos de billing/auth/email para no depender de `public.users`, `public.payments` ni tablas del LMS anterior.
- Se agregó y aplicó la migración `20260519040000_purge_legacy_public_surface.sql`.
- Supabase remoto quedó sin tablas producto en `public`; el estado activo vive en `simulador.*`.
- La historia de migraciones remotas quedó reparada y alineada con las migraciones activas.

### tested

- `npm run check:simulador` PASS.
- `npm run coord:lint` PASS.
- `bash scripts/lint-memory.sh` PASS.
- `npm run lint:simulador` PASS.
- `npm run build` PASS.
- Smoke local:
  - `/` -> 200
  - `/auth/login` -> 200
  - `/auth/signup` -> 200
  - `/field-test/marketing-urgent-campaign-pii` -> 200
  - `/dashboard` -> redirect a login
  - `/case/marketing_urgent_campaign_pii` -> redirect a login
  - `/report/demo-session` -> redirect a login
  - `/admin` -> redirect a login

### gotchas

- Claude CLI no devolvió output antes del timeout durante el audit final. Se compensó con revisión local por búsqueda, build, lint, smoke y verificación Supabase.
- Las menciones activas al producto anterior solo deben aparecer como contraste o comparación competitiva. Cualquier reaparición como producto activo es regresión.

### siguiente

- Front cleanroom: construir las superficies visuales sobre esta base limpia.
- No reintroducir archivos de la etapa anterior sin owner y razón documentada.

## 2026-06-07 — codex — takeover operativo y cierre de bypass prod

### done

- Pablo pidio que Codex retome el lead operativo porque Claude no esta rindiendo.
- `docs/coord/AGENT_STATUS.md` deja a Codex como lead de repo, implementacion, verificacion y priorizacion.
- `docs/coord/INBOX_CLAUDE.md` pausa a Claude para edicion directa de surfaces activas salvo peticion explicita o review puntual solicitada.
- Se corrigio `lib/dev/devBypass.ts`: el bypass de auth ya no queda activo por default en production.
- Se protegieron rutas internas de QA en `proxy.ts`: `/dev`, `/design`, `/design/components`, `/exercise-lab`, `/case-demo` y `/case-template` responden 404 cuando el bypass no esta permitido.
- Se corrigio `app/(app)/admin/layout.tsx`: usuarios no staff ya vuelven a `/dashboard`, no a `/staff`.

### tested

- `npm run check:simulador` PASS.
- `npm run lint:simulador` PASS con 6 warnings preexistentes.
- `npm run build` PASS.
- `next start --port 3000` production local:
  - `/` -> 200
  - `/auth/login` -> 200
  - `/dashboard` -> 307 a `/auth/login?next=%2Fdashboard`
  - `/dev` -> 404
  - `/design` -> 404
  - `/exercise-lab` -> 404
- Playwright abrio `/` en `http://localhost:3000/` y la pagina renderiza con title `Itera | Criterio de IA, medible.`

### siguiente

- Crear gate de rutas front para que `check:simulador` detecte pages fuera de `FRONT_CONTRACT.md`.
- Resolver la deriva de rutas: el build aun compila rutas no contratadas como `/team`, `/staff`, `/casos`, `/reportes`, `/perfil`, `/empresa`, `/jugar/[case_id]` y `/onboarding/context`.
- Decidir si `/design`, `/design/components`, `/exercise-lab`, `/case-demo` y `/case-template` quedan como herramientas internas permitidas en preview/local o se mueven fuera de `app/` antes de launch.

[REVERTIDO 2026-06-25 — Pablo eligió opción A: Claude lidera UI; ver CLAUDE.md §Rol y docs/coord/INBOX_CODEX.md item in-codex-ux-pablo-claude-leads-ui]

## 2026-06-25 · UX-05-admin-double-nav-20260625 (Claude → Codex)

### done
- Fix P1 UI UX-05: `/admin` y `/admin/*` tenían doble logo/nav (verificado por Codex screenshot `admin-review-rerun.png`). Las páginas admin montan su propia `SurfaceNav` y el `AppShell` seguía montando además `AppSidebar`.
- `app/(app)/AppShell.tsx`: `/admin` y `/admin/*` ahora son surface-owned (mismo patrón que `/report`, `/case`, `/jugar`) — sin `AppSidebar` ni padding `md:pl-[224px]`, una sola `SurfaceNav`. Navegación admin intacta (vive dentro de `SurfaceNav`).
- Scope estricto UI/.tsx: solo `app/(app)/AppShell.tsx`. No se tocó api/lib/scripts/supabase.

### tested
- `npx tsc --noEmit` PASS (0 errores).
- `npm run check:simulador` PASS.
- Sin build: cambio trivial en un client component de shell, ambos gates verdes.

### siguiente (Codex)
- Re-screenshot autenticado de `/admin` y `/admin/review` para confirmar single nav en desktop/tablet/mobile.
- Resto del DoD de UX-05 (cada ruta admin explica propósito, cases operativo vs educativo, scroll/layout) sigue en lane Claude.
