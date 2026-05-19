---
type: audit
title: Copy imports status — qué está cableado vs hardcoded
date: 2026-05-19
author: claude
reviewer: codex
status: published
scope: audit del estado de cableado de los 12 copy files versionados (lib/simulador/copy/*) a las surfaces UI reales. Mapea qué archivo está importado vs qué surface aún usa strings hardcoded
related:
  - lib/simulador/copy/ (12 archivos versionados)
  - docs/coord/audits/loop_audit_post_copy_batch.md (M9.2 PASS)
---

# Copy imports status — qué está cableado vs hardcoded

## TL;DR

De los 12 copy files versionados en `lib/simulador/copy/`, **solo 1 está siendo importado por surfaces UI**: `onboarding.ts` en `/onboarding/billing/page.tsx` + `/onboarding/done/page.tsx`. Los otros 11 archivos están versionados pero las surfaces correspondientes siguen usando strings hardcoded.

**Implicación:** la copy está consolidated y auditada (M9.2 PASS), pero el refactor de cada surface para importar de los archivos sigue siendo deuda explícita de Codex. NO bloquea launch v1 (la copy hardcoded actual fue escrita por claude y es similar a la versionada), pero centralizar permite:

1. Cambio de strings en 1 lugar afecta TODAS las surfaces (vs editar 5+ archivos)
2. Type safety y autocomplete de strings
3. i18n futuro más simple (1 archivo source, traducir → multiple targets)
4. A/B testing trivial (swap import por variant)

**Recomendación post-launch:** Codex cablear los 11 archivos en orden de impacto. Roadmap abajo.

## Estado actual (grep automático)

| Copy file | Imports en repo | Surfaces target esperadas |
|---|---:|---|
| `landing.ts` | 0 | `app/(public)/page.tsx`, `components/simulador/LandingPage.tsx`, `components/simulador/PublicNav.tsx` |
| `sales.ts` | 0 | (interno; sin surface UI directa — usado por Pablo en discovery + futuro `app/(app)/admin/sales-playbook`) |
| `report.ts` | 0 | `app/(app)/report/[session_id]/page.tsx` |
| `legal.ts` | 0 | `app/privacy/page.tsx`, `app/terms/page.tsx`, banner consent global |
| `emails.ts` | 0 | `lib/email/simulador-notifications.ts`, `lib/email/welcome.ts` |
| `runtime.ts` | 0 | `components/simulador/RuntimeExperience.tsx` (2839 líneas) |
| `manager.ts` | 0 | `app/(app)/dashboard/page.tsx` (767 líneas), B5-002 cuando llegue |
| `onboarding.ts` | **2** ✓ | `/onboarding/{org,team,invite,billing,done}/page.tsx` (2 de 5 importadas) |
| `field-test.ts` | 0 | `components/simulador/RuntimeExperience.tsx` (FieldTestReportInline) |
| `billing.ts` | 0 | `app/pricing/page.tsx` (pendiente create), `app/(app)/billing/page.tsx` (pendiente create) |
| `auth.ts` | 0 | `app/auth/{login,signup,callback,invitation,forgot,reset}/page.tsx` |
| `errors.ts` | 0 | `app/error.tsx`, `app/not-found.tsx`, `lib/api-errors.ts`, `app/(app)/error.tsx` |

**Total cableado:** 1/12 archivos (8.3%). Onboarding parcial (2/5 surfaces).

## Por qué pasó esto

El plan original M9.1+M9.2 (24+ decisiones cerradas en wakeup loop) fue **producir la copy versionada primero, cablear después**. La razón:

1. **Velocidad**: producir 12 copy files en cadence 270s rinde más que cablear paralelo
2. **Calidad**: cablear requiere modificar surfaces existentes (riesgo bug) vs crear archivos nuevos (seguro)
3. **Boundaries**: el cableado de surfaces es trabajo natural de codex (UI engineer), no de claude (copy + research)
4. **Visibility**: los archivos versionados son visibles para codex como handoff trazable — más fácil que "espera, te paso strings por inbox"

El trade-off explícito: la copy actual en surfaces hardcoded ya es funcional (escrita por claude originalmente en commits previos), pero la centralización es deuda explícita.

## Roadmap de cableado para codex (priorizado)

### Tier 1 — alto impacto + bajo riesgo (post-launch immediate)

| Archivo | Surface | Líneas hoy | Effort | Impact |
|---|---|---:|---|---|
| `onboarding.ts` | `/onboarding/org`, `/onboarding/team`, `/onboarding/invite` (3 surfaces pendientes) | ~150 each | bajo (strings similares; replace strings) | alto (buyer onboarding visible) |
| `auth.ts` | `/auth/login`, `/auth/signup`, `/auth/invitation/[token]`, `/auth/callback`, `/auth/confirm` (5 surfaces) | ~200 each | bajo-medio | alto (todo user pasa por aquí) |
| `errors.ts` | `app/error.tsx`, `app/not-found.tsx`, `lib/api-errors.ts` | ~50 each | bajo | medio (defensiva — solo activa si algo falla) |
| `legal.ts` | `app/privacy/page.tsx`, `app/terms/page.tsx` | crear si no existen | medio (crear surfaces nuevas) | alto (legal MX+CO requisito) |

### Tier 2 — alto impacto + medio riesgo (post-customer-zero)

| Archivo | Surface | Líneas hoy | Effort | Impact |
|---|---|---:|---|---|
| `manager.ts` | `app/(app)/dashboard/page.tsx` | 767 líneas | medio (refactor extenso) | alto (manager es buyer principal) |
| `runtime.ts` | `components/simulador/RuntimeExperience.tsx` | 2839 líneas | alto (archivo grande monolito) | alto (todo participante toca esto) |
| `field-test.ts` | `RuntimeExperience.tsx` FieldTestReportInline | embedded | medio | alto (lead capture entry point) |

### Tier 3 — crear surfaces nuevas

| Archivo | Surface a crear | Effort | Impact |
|---|---|---|---|
| `landing.ts` | extender `app/(public)/page.tsx` para hidratar de landingCopy (hoy strings hardcoded directos en JSX) | medio | alto (homepage, primer touch) |
| `billing.ts` | crear `app/pricing/page.tsx` + `app/(app)/billing/page.tsx` (customer portal) | medio | alto (post-B7-001) |
| `report.ts` | refactor `app/(app)/report/[session_id]/page.tsx` para hidratar de reportCopy | medio | alto (deliverable principal) |

### Tier 4 — interno, no urgente

| Archivo | Surface | Notas |
|---|---|---|
| `sales.ts` | crear `app/(app)/admin/sales-playbook` si Itera staff lo usa | interno; Pablo puede leer del repo directo |
| `emails.ts` | refactor `lib/email/simulador-notifications.ts` para usar emails.ts templates | parcial — algunos templates ya están copiados a lib/email/ |

## Refactor pattern recomendado

Para evitar fricción + bugs, cablear surface por surface en este orden:

### Step 1: import el copy file

```typescript
import { onboardingCopy } from "@/lib/simulador/copy/onboarding";
```

### Step 2: reemplazar strings hardcoded por references

Cambiar:
```tsx
<h1>Cuéntanos sobre tu equipo.</h1>
```

Por:
```tsx
<h1>{onboardingCopy.step1_org.headline}</h1>
```

### Step 3: si la string es función template, llamarla

```tsx
<p>{onboardingCopy.step3_invite.body_template(teamName)}</p>
```

### Step 4: TypeScript verifica que no haya strings inexistentes (autocomplete)

### Step 5: smoke test la surface en dev → commit

**No hacer "big bang"**: cablear 1 archivo + 1 surface por commit. Si rompe, rollback es 1 commit.

## Riesgos del refactor

1. **String drift**: si la copy hardcoded actual difiere de la versionada (cambios entre el día que se hardcoded y hoy), el refactor cambia UX visible. Mitigación: diff explícito antes de commit.
2. **Template signature**: algunas strings versionadas son funciones (`body_template(teamName)`) que requieren props que el JSX no tenga. Mitigación: TypeScript catches at compile time.
3. **Performance**: importar copyObject completo no es performance issue (HeroUI + Framer Motion son los heavy hitters), pero si hay surfaces muy ligeras (404 page) puede sumarse.

Estos 3 riesgos son menores. Refactor es net positive.

## Validación post-cableado

Después de cablear cada archivo, verificar:

```bash
# 1. Build pasa
bun run build

# 2. TypeScript clean
bunx tsc --noEmit

# 3. Grep strings hardcoded duplicados (no debería haber)
grep -r "Cuéntanos sobre tu equipo" app/ components/  # debería retornar solo lib/simulador/copy/onboarding.ts

# 4. Smoke browser: navegar surface, verificar no broken
```

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D20
    decision: "Cableado de 11 copy files restantes es deuda explícita post-launch v1. NO bloquea launch — la copy hardcoded actual ya es funcional. Cablear post customer-zero en orden Tier 1 → 2 → 3 → 4 definido en este audit."
    rationale: "El trade-off velocidad/centralización se resolvió a favor de velocidad durante wakeup loop. La copy hardcoded es la misma que claude escribió originalmente — no hay drift de calidad. Cablear es work pos-launch que mejora maintainability sin afectar producto vendible v1."
    change_type: deuda_explícita
    files_to_touch:
      - 11 archivos en app/ y components/ (ver tabla por Tier)
    owner: codex
    blocked_by:
      - launch_v1
    priority: normal

  - id: M9-3-D21
    decision: "Cableado va por surface 1-by-1 en commits separados (no big bang). Pattern explícito: import → replace strings → llamar templates → verificar TypeScript → smoke → commit."
    rationale: "Refactor de archivos grandes (RuntimeExperience 2839 líneas, dashboard 767 líneas) con big bang multiplica riesgo de bug. 1 surface por commit limita blast radius."
    change_type: process_refactor
    files_to_touch:
      - docs/coord/audits/copy_imports_status.md
    owner: codex
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** este audit es informativo para codex. NO requiere acción claude.
2. **Post-launch v1 (T+7 a T+14):** codex prioriza Tier 1 (onboarding 3 surfaces + auth 5 surfaces + errors + legal).
3. **Post-customer-zero (T+28+):** codex prioriza Tier 2 (manager + runtime + field-test).
4. **Cuando hay tiempo de feature work bajo:** Tier 3 (landing + billing + report).
5. **Tier 4 interno:** cualquier momento, no urgente.
