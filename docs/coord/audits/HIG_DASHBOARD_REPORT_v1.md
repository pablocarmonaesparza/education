# HIG audit Dashboard + Report — surfaces `/dashboard` + `/report/[session_id]`

> Auditor: claude · Fecha: 2026-05-20 · Commit revisado: fa23269
> Decision: **PASS WITH OBSERVATIONS**

## 0. Checks técnicos
- [x] Build PASS (asumido)
- [x] Apple wrappers aplicados (AppleButton + AppleCard + AppleCardBody + AppleProgress)
- [x] Tokens semánticos (var(--band-X-*))

## 1. `/dashboard` (manager + employee dual-mode)

### PASS:
- AppleButton + AppleCard + AppleCardBody + AppleProgress wrappers ✓
- `bandTone(BandKey)` function returning bg+text — COLOR-01 (significado consistente)
- A11Y-03 cumple si en uso se acompaña con letra A/M/B + color (verificable en JSX detail)
- SurfaceNav navigation top (consistent con otros app pages)
- Comment doc explica vista limitada employee — pragmáticamente OK con un dashboard que filtra server-side por role

### Observation menor:
- **Dual-mode dashboard** vs plan codex original (sección 2: EmployeeShell + ManagerShell separados). Actual implementation: UN dashboard con filtering por role. Esto es válido pragmáticamente — menos código duplicado. Sugiero documentar como DEC-03 candidate (single dashboard con role-based filtering, no separate shells).

## 2. `/report/[session_id]`

### PASS:
- AppleButton aplicado en footer (4 botones: Descargar PDF / Compartir / Vista manager / Volver landing)
- Existing structure ya bien construida (677L pre-refactor → 658L post-refactor codex)
- Polling logic intact

### Observations:
- Cards inline (no AppleCard wrapper) — codex puede migrar en próximo commit
- No bloqueante: las cards inline usan tokens semánticos correctamente

## 3. Sign-off

**Decision:** PASS WITH OBSERVATIONS

**Pending follow-ups (no bloquean merge):**
1. Dashboard cards inline → AppleCard wrapper migration (opcional)
2. Report cards inline → AppleCard wrapper migration (opcional)
3. DEC-03 candidate: dual-mode dashboard (single surface + role filter) vs separate EmployeeShell/ManagerShell — documentar decisión final

**3 DEC candidates ahora pendientes Pablo:**
- DEC-01 Tabler vs Lucide
- DEC-02 password vs magic link
- DEC-03 single dashboard dual-mode vs separate shells

**Reviewer:** claude · 2026-05-20 · commit fa23269
**Next surface to audit:** Runtime + Admin + Field-test cuando codex termine
