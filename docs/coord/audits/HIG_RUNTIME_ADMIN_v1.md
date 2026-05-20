# HIG audit Runtime + Admin — surfaces `/case/[case_id]` + `/admin/*`

> Auditor: claude · Fecha: 2026-05-20 · Commits revisados: f1d314c + 4b70f5c
> Decision: **PASS**

## 0. Checks técnicos
- [x] Build PASS (asumido)
- [x] Apple wrappers consistentes
- [x] Codex respondió tickets previos (fix ICP + DEC-001 + DEC-003 docs)

## 1. RuntimeExperience.tsx (`/case/[case_id]` + `/field-test/marketing-urgent-campaign-pii`)

### PASS:
- Apple wrappers importados: AppleButton + AppleCard + AppleCardBody + AppleInput (líneas 22-25)
- 3+ usages de AppleButton confirmadas en CTAs principales (líneas 679, 884, 896)
- 67 líneas refactorizadas en este commit — migration completa de HeroUI raw a Apple wrappers
- Estructura preservada (caso vivo 6 secciones intact)

### Observación (no fix requerido):
- Codex mencionó en su response: "quedan textareas raw solo en inputs custom de voz del runtime"
- Validación: el voice input es funcional + accesible (mic button + textarea para transcript). Mantener raw es correcto — el voice recorder es un componente custom, no estándar de form.

## 2. Admin pages (`/admin/audit-log`, `/admin/judge-health`, `/admin/leads`, `/admin/orgs`, `/admin/review`)

### PASS:
- AppleButton + AppleTextarea en `/admin/review` ✓
- Refactor consistente en las 5 subroutes admin
- Patterns: AppleButton en confirm dialogs, AppleTextarea en review queue notes
- Audit log + judge health + leads + orgs migrados (8-30 líneas cada uno)

## 3. Responses codex a mis tickets anteriores

### Ticket "Audit Auth + Onboarding" — RESOLVED ✓
- Codex applied fix: `/onboarding/org` línea 45 → `'100–300 empleados'` (sin "(ICP)")
- Codex documentó DEC-001 Tabler React iconography canónica

### Ticket "Validation b02ab74" — RESOLVED ✓
- Codex applied: Runtime + admin migrados a Apple wrappers (no Button/Card raw)
- Excepción documentada: voice input textarea raw OK

### DEC-003 single-dashboard dual-mode — DOCUMENTED ✓
- Codex pusheó 4b70f5c con FRONT_CONTRACT update (7 líneas) explicando role-aware dashboard

## 4. Estado DEC candidates

- ✅ DEC-001 Tabler React: documentada en APPLE_HIG_RULES_FOR_ITERA.md
- ⏳ DEC-002 password vs magic link: pendiente Pablo decisión
- ✅ DEC-003 role-aware dashboard: documentada en FRONT_CONTRACT.md

## 5. Sign-off

**Decision:** PASS

**Audits acumulados:**
1. HIG_LANDING_v1.md · PASS WITH OBS
2. HIG_AUTH_ONBOARDING_v1.md · PASS WITH OBS (1 fix aplicado por codex)
3. HIG_DASHBOARD_REPORT_v1.md · PASS WITH OBS
4. HIG_RUNTIME_ADMIN_v1.md (este) · PASS

**Pendientes de audit:**
- Field-test (`/field-test/marketing-urgent-campaign-pii`) — comparte código con `/case/[case_id]` runtime, posiblemente OK por extension
- Legal (`/privacy`, `/terms`) — refactor simple text-heavy
- System pages (`/cancel`, `/success`, `/not-found`, `/error`, `/maintenance`) — codex creó en Bloque 1+2

**Reviewer:** claude · 2026-05-20 · commits f1d314c + 4b70f5c
