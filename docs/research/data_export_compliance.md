---
type: research
title: Data export compliance — qué export podemos ofrecer (LFPDPPP / Ley 1581 / GDPR)
date: 2026-05-19
author: claude
reviewers: [pablo, codex, legal-counsel-LATAM-cuando-aplique]
status: published-draft
scope: define qué export de datos podemos legalmente y operacionalmente ofrecer a customers + data subjects cuando soliciten. Disclaimer: NO es asesoría legal — es framework para Pablo + counsel local cuando aplique
related:
  - docs/research/legal_dpa_template_v1.md (DPA structure)
  - lib/simulador/copy/legal.ts (consent + privacy policy)
  - lib/simulador/copy/auth.ts (data subject rights mentions)
  - lib/simulador/copy/errors.ts (data not found edge cases)
---

# Data export compliance — specs operacionales

## TL;DR + disclaimer

Claude NO es lawyer. Este doc es framework operacional + boilerplate template. Decisiones legales finales (qué EXACTAMENTE export, qué redactar) requieren counsel local (los del DPA template).

**Posición v1:** Itera Simulador procesa datos personales de participantes empleados. Por LFPDPPP MX (DOF 2025-03-20) + Ley 1581 CO + GDPR Article 15-20, data subjects pueden solicitar:

1. **Acceso** — saber qué datos tenemos
2. **Portabilidad** — recibir datos en formato structured/machine-readable
3. **Rectificación** — corregir errors
4. **Eliminación** — borrar (con caveats retention)
5. **Oposición** — detener processing específico

Este doc define export para 1 + 2. Eliminación + rectificación quedan en flow operacional separado (M9-3-D57 DPA template Section 9).

**Trigger build:** primer customer pide export O primer participante pide acceso a sus datos. NO build proactivamente.

## Categorías de datos export

### Categoría 1: Datos del participante (data subject scope)

**Cuándo activa:** participant individual pide acceso a sus datos.

**Datos a export por participant:**

| Tabla source | Datos | Format |
|---|---|---|
| `simulador.users` | email, full_name, created_at | JSON |
| `simulador.simulation_sessions` | session IDs, started_at, completed_at, status | JSON |
| `simulador.simulation_responses` | step responses, raw text input | JSON |
| `simulador.llm_interactions` | prompts del participante + model responses | JSON |
| `simulador.behavior_events` | events del participante (paste detection, time spent, etc.) | JSON |
| `simulador.reports` (su reporte propio) | bandas, recommendation, evidence text | JSON + PDF |
| `simulador.risk_events` (los que aplican a él/ella) | event_type, severity, evidence_text | JSON |

**NO exportar:**
- Datos de otros participantes del mismo team (privacy violation)
- Internal scoring debug (judge confidence raw, prompt-builder internals)
- Sub-processor secrets (Stripe customer IDs, Supabase user UUIDs internal)

**Format:** JSON estructurado + PDF del reporte. Bundle en .zip.

**Timeline:** dentro de 5 días business (LFPDPPP Art 8 standard).

### Categoría 2: Datos del team del manager (Controller scope)

**Cuándo activa:** customer (Controller) pide export de su team data.

**Datos a export por organization:**

| Tabla source | Datos | Format |
|---|---|---|
| `simulador.organizations` | org_id, name, created_at, plan, billing | JSON |
| `simulador.users` (team members) | emails (no full PII de otros), roles | JSON |
| `simulador.simulation_sessions` (all team) | sessions list con statuses agregados | JSON |
| `simulador.reports` (all team) | reports IDs + summaries (no full content) | JSON |
| `simulador.behavior_events` (aggregated) | aggregate stats (sin per-participant detail) | JSON |
| `simulador.risk_events` (all team) | risk events list con resolution status | JSON |

**Caveat:** export Controller-level NO incluye per-participant full reports en bulk. Cada reporte individual requiere consent del participant (M9-3-D14 latent "trust" concern). Customer puede ver bandas + recomendaciones pero NO transcripts completos por default.

**Format:** JSON estructurado bundle.

**Timeline:** dentro de 10 días business (más complex query).

### Categoría 3: Aggregate export para CFO/CMO

**Cuándo activa:** post-sprint, manager pide aggregate report para compartir con C-suite.

**Datos a export:**

- Team aggregate matrix 3×5 (bandas por dimensión × N participants)
- Risk events count por type (sin per-participant detail)
- Average duration session
- Completion rate
- Compliance summary (sin PII)

**Format:** PDF executive report + CSV de raw aggregate.

**NO incluye:** datos identificables de individuals.

**Timeline:** instantáneo desde dashboard (already feature en M9-3-D2 matrix 3×5).

### Categoría 4: Audit log export (compliance scope)

**Cuándo activa:** customer enterprise pide compliance audit trail.

**Datos a export:**

| Tabla source | Datos |
|---|---|
| `simulador.behavior_events` | all events filtered por org_id + time range |
| `simulador.session_events` | session lifecycle events |
| Audit logs Stripe (vía Stripe API) | billing events |
| Auth logs Supabase | login attempts, password changes |

**Format:** CSV estructurado + manifest JSON con time range + integrity hash.

**Timeline:** dentro de 30 días business (complex query, multiple sources).

## Implementación operacional

### v1 manual (pre-customer-zero a F1)

Sin automation — Pablo + Codex ejecutan manual queries cuando llegue solicitud:

**Workflow:**

1. Customer/participant emails request → Pablo triages
2. Pablo verifies identity (email match + Org membership lookup)
3. Pablo escalates to Codex con specific scope
4. Codex queries Supabase con SQL filter por user_id o org_id
5. Codex exports JSON via psql or Supabase dashboard
6. Codex packages en .zip + PDF report si applica
7. Pablo emails customer con secure link (Vercel temporary link OR Drive link con expiration)

**Effort estimate:**
- Categoría 1 (participant): ~30-45 min Codex
- Categoría 2 (team): ~1-2 horas Codex
- Categoría 3 (aggregate): ya feature dashboard, <5 min
- Categoría 4 (audit log): ~2-3 horas Codex

**Sustainable hasta:** ~5-10 requests/mes. Después, automate.

### v2 automated (F1 v2 roadmap o post 10 customers)

Build endpoints + admin UI:

- `/admin/data-export?type=participant&user_id=<uuid>` — auth-protected, staff-only
- `/admin/data-export?type=team&org_id=<uuid>` — staff-only
- `/admin/data-export?type=audit&org_id=<uuid>&from=<date>&to=<date>` — staff-only
- `/api/data-export/[token]/download` — secure temporary link

**Effort estimate codex:** ~2-3 semanas (security implications high).

**Trigger build:** ≥3 export requests OR enterprise customer DPA con explicit data export SLA.

## Templates response

### Template 1 — Acuse de recibo (participant request)

```
Hola [participant],

Recibí tu solicitud de acceso a tus datos en Itera Simulador. 
Conforme a la LFPDPPP (México) / Ley 1581 (Colombia), tienes 
derecho a recibir esta información.

Voy a preparar el export en los próximos 5 días business. Te 
mando un secure link cuando esté listo.

Verificamos identidad antes de export: ¿el email desde el que 
escribes ([email]) es el mismo con el que creaste tu cuenta en 
Itera? Confirma para proceder.

Pablo
```

### Template 2 — Delivery (participant export)

```
Hola [participant],

Aquí tu export de datos en Itera Simulador. Contenido:

- Datos básicos de tu cuenta (email, fechas)
- Sessions del diagnóstico que completaste
- Tus respuestas al caso vivo (texto que enviaste al modelo, 
  prompts, decisiones)
- Tu reporte ejecutivo (PDF)
- Risk events detectados (si aplican)

[Secure download link — expires in 7 días]

Si quieres rectificación de algún dato o eliminación completa, 
escribe directo y procesamos según la política (eliminación toma 
hasta 30 días, conforme regulación).

Pablo
privacy@itera.la
```

### Template 3 — Acuse customer team export

```
Hola [manager],

Recibí solicitud de export de team data de [organization]. 
Voy a preparar bundle JSON con:

- Lista de team members (emails, roles)
- Sessions completadas (statuses, timing)
- Reports IDs + summaries
- Risk events aggregated

Importante: por privacy de participantes individuales, el export 
NO incluye transcripts completos por defecto. Solo bandas + 
recomendación de cada reporte. Si necesitas detalle por persona 
específica, cada participant debe consent individually (process 
separate).

Timeline: 10 días business. Te aviso cuando esté listo.

Pablo
```

### Template 4 — Rechazo / partial export

```
Hola [name],

Recibí tu solicitud. Pero hay una limitación:

[Caso 1: pide datos de otros participantes]
No puedo exportarte transcripts de [other participant] sin su 
consent. Si necesitas eso, manda solicitud desde [other 
participant] directly o pídele consent escrito.

[Caso 2: pide datos pre-cuenta o de otra org]
No tengo datos asociados a tu cuenta [email] anterior a [date] 
o de [other org]. Solo procesamos data desde que firmaste con 
Itera.

[Caso 3: pide datos identificables agregados]
El export agregado del team NO incluye identificación de 
participants individuales (privacy by design). Si necesitas 
data nivel persona, pídeme por participant específico.

Si estoy malentendiendo la solicitud, dime más detalle y vemos.

Pablo
```

### Template 5 — Delivery customer team

```
Hola [manager],

Listo, aquí el export de team data de [organization]:

[Secure download link — expires in 7 días]

Contenido:
- organizations.json
- team_members.json (emails + roles)
- sessions.json (statuses + timing)
- reports_summary.json
- risk_events_aggregated.json
- README.md (con scope + data dictionary)

Si necesitas detalle adicional (transcripts por participant, 
audit log full), avísame.

Pablo
privacy@itera.la
```

## Edge cases

### Edge case 1: participant ya no es empleado de la org

**Scenario:** participant left customer org. Pide export 6 meses después.

**Acción:** export OK. Data subject rights persisten independiente de employment status. Solo confirmar identidad (email match).

### Edge case 2: customer org ya no está activo (sprint expired, NO renewal)

**Scenario:** organization plan expired. Participant pide export.

**Acción:** export OK. Retention policy v1 (M9-3-D58 sub-processors) retains data por períodos defined. Si dentro de window, exportable. Si fuera, response "datos ya eliminados conforme política de retención".

### Edge case 3: legal request from autoridad (subpoena, court order)

**Scenario:** PROFECO MX o SIC CO emit formal request.

**Acción:** STOP + counsel local (M9-3-D78). Pablo NO responde sin counsel sign-off.

### Edge case 4: bulk export request (todos los participants)

**Scenario:** customer pide export bulk de TODOS sus participants en un archivo.

**Acción:** decline bulk personal data en single export. Workaround: aggregate team export (Categoría 3, sin per-participant PII) OR individual exports per-participant (Categoría 1).

### Edge case 5: export que rompe judge integrity (transcripts + internal scoring)

**Scenario:** participant pide raw judge confidence scores, rationale internal, etc.

**Acción:** Categoría 1 incluye sus propios datos + judge OUTPUTS (rationale, evidence_text public-facing). NO incluye internal scoring (confidence raw, prompt-builder logic). Sin esto, judge methodology defendibility (M9-3-D28) preservada.

## Métricas a trackear

| Métrica | Target verde v1 |
|---|---|
| Data export requests/mes | n/a (track without target) |
| Time to respond acuse | <12h business |
| Time to complete export | dentro de policy (5/10/30 días según categoría) |
| Rejection rate (declined exports) | <10% (mostly Edge cases 4) |
| Counsel escalations (Edge case 3) | 0 ideally |

**Post-customer-zero:** review métricas. Si requests/mes >5, accelerate F1 v2 automation.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D89
    decision: "Data export framework v1 manual: 4 categorías (participant individual / team Controller / aggregate / audit log compliance). Build automation (F1 v2 endpoints + admin UI) trigger ≥3 requests/mes O enterprise DPA SLA explícita"
    rationale: "Pre-customer-zero NO build sin demand signal. Manual workflow Codex + Pablo cubre primer 5-10 requests/mes sostenible. Build automation cuando volume justifique (~2-3 semanas codex effort)."
    change_type: data_compliance
    files_to_touch:
      - docs/research/data_export_compliance.md
      - app/(app)/admin/data-export/ (futuro F1 v2)
      - app/api/data-export/ (futuro F1 v2)
    owner: pablo (operations) + codex (automation when triggered)
    blocked_by: []
    priority: normal

  - id: M9-3-D90
    decision: "Aggregate team export (Categoría 3) NO incluye per-participant PII by default. Sin consent explícito de cada participant, manager solo recibe bandas + recomendaciones aggregadas. Privacy by design alineado con M9-3-D14 buyer 'trust' concern"
    rationale: "Per-participant transcripts en bulk a manager rompe trust framework. Participants completaron diagnóstico con expectation de privacy individual + transparency aggregate. Workaround: per-participant export con consent individual."
    change_type: privacy_design
    files_to_touch:
      - docs/research/data_export_compliance.md
      - lib/simulador/copy/legal.ts (consent banner verify alignment)
      - lib/simulador/copy/manager.ts (set expectations en dashboard)
    owner: claude (specs)
    blocked_by: []
    priority: normal

  - id: M9-3-D91
    decision: "Edge case 3 (subpoena/court order) escalate to counsel local SIEMPRE. Pablo NUNCA responde formal autoridad sin counsel sign-off. Holding response 48h template + immediate counsel contact"
    rationale: "Legal autoridad requests carry severe penalties si mishandled. Pablo no es lawyer. Counsel cost ($3-8K USD per case) marginal vs penalties potenciales (fines LFPDPPP MX up to 320,000 UMAs = ~MXN 36M)."
    change_type: legal_protocol
    files_to_touch:
      - docs/research/data_export_compliance.md
      - docs/research/dispute_resolution_playbook.md (cross-ref Categoría 6)
    owner: pablo
    blocked_by: []
    priority: high
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** framework ready. NO action hasta export request llegue.
2. **Primer export request:** Pablo follows workflow manual + Codex queries.
3. **Post 5 customers:** review export request volume. Si ≥3/mes, accelerate automation F1 v2.
4. **Q3 audit:** trimestral review métricas export + counsel escalation count.
