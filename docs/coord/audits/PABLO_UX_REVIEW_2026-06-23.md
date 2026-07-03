# Pablo UX review 2026-06-23

Fuente: lista enviada por Pablo a Claude Code el 2026-06-23 para correcciones de UI, copy, rutas y verificación visual.

## Veredicto de orquestación

Esto no debe ejecutarse como una bolsa de fixes sueltos. Es una ronda de estabilización front con tres capas:

1. Fundación visual: botones, dropdowns, títulos, contornos, dividers, loaders, motion y componentes centrales.
2. Superficies por rol: públicas, onboarding, empleado, manager, admin, motor de casos, labs y system states.
3. Verificación real: screenshots desktop/mobile, rutas con datos de revisión, HIG form, `check:simulador`, `lint:simulador` y `build`.

## Reglas globales de cierre

- No tocar código sin revisar `FRONT_CONTRACT.md` y sin dejar la tarea en `BUILD_BOARD.yaml`.
- No revivir LMS/cursos ni copy antiguo.
- No mostrar mini-títulos tipo `Dashboard del manager`.
- Los títulos principales no llevan punto final y deben usar tamaño/jerarquía estándar.
- El diseño debe apuntar a `/design`, `/design/components`, `components/simulador/apple/*`, `lib/simulador/design-tokens.ts` y `app/(app)/simulador.css`.
- Botones, inputs, selects, dropdowns, cards, toggles y loaders deben reutilizar componentes centrales.
- Evitar contornos como separador de secciones; usar dividers y whitespace. Excepción: cards de casos u objetos realmente repetidos.
- Las pantallas para revisión no deben quedarse en fallback vacío. Usar datos demo/review controlados.
- Nada de loaders infinitos ni animaciones que aparenten avance si no hay progreso real.
- Todo dropdown roto se corrige desde el componente central, no como parche local.
- Motion debe existir donde Pablo la pidió, pero con `prefers-reduced-motion`.
- Cada surface cerrada requiere screenshot desktop y mobile.

## Reparto Claude / Codex

Codex lidera:

- cambios en `app/`, `components/`, `lib/`, APIs, auth, billing, Stripe, tests, build y smoke.
- promoción de componentes a `components/simulador/apple/*`.
- verificación final de rutas y no-regresión.

Claude apoya:

- copy, legal wording, HIG review forms, jerarquía visual, crítica de screenshots y checklist por surface.
- no debe editar `app/`, `components/`, `lib/` ni `app/(app)/simulador.css` en paralelo sin dejar aviso en `INBOX_CODEX.md`.
- si no hay respuesta en 5 minutos, avanzar en docs/audits o copy proposals, no en archivos compartidos de implementación.

## Checklist por superficie

### Públicas

- [ ] `/auth/login`: revisar si la `o` entre CTA y Google necesita acento según copy final; quitar punto final en título; unificar largo/estilo del botón con onboarding.
- [ ] `/auth/signup`: igualar espaciado entre términos y CTA; quitar punto final en título.
- [ ] `/auth/invitation/demo-token-123`: error de token con instrucciones claras para manager o `ayuda@itera.la`; título estándar sin punto; quitar contorno y alinear con `/cancel` y `/success`.
- [ ] `/privacy`: título sin punto; reestructurar documento legal con estilo serio y estándar.
- [ ] `/terms`: título sin punto; reestructurar documento legal con estilo serio y estándar.
- [ ] `/cancel`: título sin punto y shell result consistente.
- [ ] `/success`: título sin punto y shell result consistente.

### Onboarding

- [ ] `/onboarding/org`: dropdowns deben funcionar sin exigir primero un textfield.
- [ ] `/onboarding/team`: sin notas.
- [ ] `/onboarding/invite`: CTA solo activo cuando todos los invitados visibles sean válidos o se eliminen filas vacías/incorrectas.
- [ ] `/onboarding/context`: placeholder de website como `Sitio web`; prefill/focus con `https://` si aplica; copy nuevo de instrucciones; aceptar solo PDF; label `Adjuntar archivos (PDF)`; botón subrayado `Completar después`; registrar decisión sobre uso futuro del sitio/PDFs.
- [ ] `/onboarding/billing`: verificar que abre Stripe correcto.
- [ ] `/onboarding/done`: revisar si es confirmación real o pago fallido; copy debe hablar de ejercicios en creación; botones consistentes.

### Cliente manager

- [ ] `/staff`: usar datos demo/review, no fallback vacío; quitar mini-títulos.
- [ ] `/staff/equipo`: usar datos demo/review, no fallback vacío; quitar mini-títulos.
- [ ] `/staff/reportes`: usar datos demo/review, no fallback vacío; quitar mini-títulos.
- [ ] `/staff/casos`: arreglar dropdowns; al abrir caso no debe crashear; crear/reusar vista de revisión de caso para administrativo/empresa según contrato.
- [ ] `/staff/matriz`: usar datos demo/review, no fallback vacío; quitar mini-títulos.
- [ ] `/staff/recomendaciones`: usar datos demo/review, no fallback vacío; quitar mini-títulos.
- [ ] `/empresa`: rediseño sin contornos; dropdown país consistente; cancelar billing dentro de Itera o copy claro; archivos empresa; restricción mensual; website editable solo hasta fijarse; autosave sin botón guardar.

### Cliente empleado

- [ ] `/team`: motion de entrada; reemplazar contornos por dividers; solo cards de casos con contorno.
- [ ] `/casos`: arreglar dropdowns; click en caso debe llevar a resultado si completado o runtime si pendiente; eliminar loading horrible.
- [ ] `/reportes`: mantener dirección que gusta; sustituir contornos innecesarios por dividers.
- [ ] `/perfil`: rediseñar; quitar contornos; botón logout consistente; dropdown idioma central; toggle email consistente y bien alineado.

### Motor de casos

- [ ] `/case-demo`: sin cambios salvo no romper.
- [ ] `/jugar/vertiz_backlog_entregas`: no debe quedar expuesto; verificar dependencias, actualizar `FRONT_CONTRACT.md` y archivar/redirigir sin romper rutas activas.
- [ ] `/case/marketing_urgent_campaign_pii`: debe abrir o fallar con estado diseñado; nada de fallback sin título ni mini-títulos.
- [ ] `/dashboard`: no fallback vacío para review; quitar mini-títulos; clarificar relación con `/team` y `/staff`.
- [ ] `/report/demo-session-id`: no loader infinito; no mini-títulos; usar estado demo/review verificable.

### Interno

- [ ] `/admin`: dashboard real, no pantalla de opciones + sidebar vieja; no doble logo; sin deuda visual.
- [ ] `/admin/review`: no vacío; sidebar/logo coherentes; sin mini-títulos.
- [ ] `/admin/leads`: aclarar propósito; eliminar scroll innecesario; shell consistente.
- [ ] `/admin/orgs`: aclarar propósito; eliminar scroll innecesario; shell consistente.
- [ ] `/admin/cases`: diferenciar casos operativos y educativos; shell consistente.
- [ ] `/admin/lecciones`: aclarar propósito; shell consistente.
- [ ] `/admin/judge-health`: aclarar propósito; shell consistente.
- [ ] `/admin/audit-log`: aclarar propósito; shell consistente.

### Labs y system

- [ ] `/exercise-lab`: proteger, es pilar del sistema.
- [ ] `/case-template`: proteger, es pilar del sistema.
- [ ] `/aprender-demo`: rehacer desde `case-template`; centrar verticalmente; reducir texto; seguir estilo del motor.
- [ ] `/design`: verificar que cambios globales realmente nacen aquí.
- [ ] `/design/components`: verificar que componentes nuevos/promovidos están aquí.
- [ ] `/not-found-test-page`: si existe, quitar contorno; icono/título/tamaño estándar.
- [ ] `/maintenance`: quitar contorno; título estándar; sin mini-títulos.

## Orden recomendado

1. Congelar coordinación y mapear archivos tocados por la refactorización abierta.
2. Arreglar componentes centrales: botones, dropdowns, result shells, title component, empty/demo states, dividers, loader/skeleton, motion base.
3. Aplicar públicas + onboarding.
4. Aplicar employee + manager.
5. Aplicar admin + motor + labs.
6. Correr verificación visual y gates completos.

## Gates

- `npm run check:simulador`
- `npm run lint:simulador`
- `npm run build`
- browser screenshots: desktop 1440, tablet 1024, mobile 390
- HIG form por grupo de surfaces
- Codex review PASS o lista de bloqueos reales
