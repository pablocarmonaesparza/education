# Copy package — Itera Simulador front

> Esta carpeta contiene el copy completo del producto, segmentado por surface.
> Lee `00_VOICE_GUIDE.md` ANTES de cualquier otro doc.

## Orden de lectura

1. **`00_VOICE_GUIDE.md`** — voz Itera, capitalización, anti-patterns, vocabulario consistente
2. **`01_LANDING_COPY.md`** — `/` (hero, FAQ, footer, CTAs)
3. **`02_AUTH_COPY.md`** — `/auth/login`, `/auth/signup`, `/auth/callback`, `/auth/confirm`, `/auth/invitation/[token]`
4. **`03_ONBOARDING_COPY.md`** — `/onboarding/{org,team,billing,invite,done}`
5. **`04_RUNTIME_COPY.md`** — `/case/[case_id]` (6 steps + Camila brief + voice + keyboard)
6. **`05_DASHBOARD_EMPLOYEE_COPY.md`** — `/dashboard` (EmployeeShell)
7. **`06_DASHBOARD_MANAGER_COPY.md`** — `/dashboard` (ManagerShell) — wow moment #1
8. **`07_REPORT_COPY.md`** — `/report/[session_id]` — wow moment #2
9. **`08_ADMIN_COPY.md`** — `/admin/*` (review queue, orgs, leads, judge health, audit log)
10. **`09_FIELD_TEST_COPY.md`** — `/field-test/marketing-urgent-campaign-pii` (público + lead capture + mini-reporte)
11. **`10_i18n_LATAM.md`** — format helpers + marcos legales por jurisdicción + vocabulario LATAM
12. **`11_SYSTEM_STATES.md`** — 404, 500, loading, empty, maintenance, toasts, modals
13. **`12_SEO_METADATA.md`** — titles, descriptions, OG, sitemap, robots, brand assets

## Cómo usar

Cuando implementes una surface:

1. Lee el copy doc correspondiente
2. Copia el copy literal o reemplaza variables `{N}` `{name}` `{date}` con tu data
3. Si tienes que escribir copy NUEVO no cubierto aquí: respeta `00_VOICE_GUIDE.md` y agrega tu copy a este doc al final con marca `// NUEVO {fecha}`
4. Si tienes dudas de voz/tono/capitalization: vuelve a `00_VOICE_GUIDE.md`

## Reglas de modificación

- **Claude lead:** todo el copy de estos docs lo escribe claude
- **Codex implementa:** integra el copy en JSX components sin cambiar wording
- **Si codex necesita ajustar copy:** propone cambio en `INBOX_CLAUDE.md` con razón técnica; claude aprueba/modifica
- **Pablo veta:** si Pablo dice "no me gusta esta línea", claude reescribe en el doc Y todas las surfaces que la usan

## Cobertura

| Surface (de las 20 v2) | Cubierta |
|---|---|
| `/` | ✓ 01 |
| `/auth/login` | ✓ 02 |
| `/auth/signup` | ✓ 02 |
| `/auth/callback` | ✓ 02 |
| `/auth/confirm` | ✓ 02 |
| `/auth/invitation/[token]` | ✓ 02 |
| `/field-test/marketing-urgent-campaign-pii` | ✓ 09 |
| `/onboarding/org` | ✓ 03 |
| `/onboarding/team` | ✓ 03 |
| `/onboarding/billing` | ✓ 03 |
| `/onboarding/invite` | ✓ 03 |
| `/onboarding/done` | ✓ 03 |
| `/dashboard` (empleado) | ✓ 05 |
| `/dashboard` (manager) | ✓ 06 |
| `/case/[case_id]` | ✓ 04 |
| `/report/[session_id]` | ✓ 07 |
| `/admin` (→ /admin/review) | ✓ 08 |
| `/admin/orgs` | ✓ 08 |
| `/admin/leads` | ✓ 08 |
| `/admin/judge-health` | ✓ 08 |
| `/admin/audit-log` | ✓ 08 |
| `/admin/review` | ✓ 08 |
| `/privacy` | parcial (legal) — usar 10 + plantilla existente |
| `/terms` | parcial (legal) — usar 10 + plantilla existente |
| `/cancel` | ✓ 11 (transactional pattern) |
| `/success` | ✓ 11 (transactional pattern) |

System states (404, 500, maintenance, etc): ✓ 11

i18n LATAM (format + legal + fiscal): ✓ 10

SEO + brand: ✓ 12

— claude · 2026-05-20
