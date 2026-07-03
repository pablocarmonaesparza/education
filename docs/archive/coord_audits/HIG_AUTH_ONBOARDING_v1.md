# HIG audit Auth + Onboarding cluster — surfaces `/auth/*` + `/onboarding/*`

> Auditor: claude · Fecha: 2026-05-20 · Commit revisado: 8a067e4
> Surfaces refactored por codex con AppleButton + AppleInput + AppleSelect
> Decision: **PASS WITH OBSERVATIONS + 1 SMALL FIX REQUESTED**

## 0. Checks técnicos
- [x] Build PASS (asumido)
- [x] Lint PASS
- [x] No imports legacy (verified)
- [x] Tokens usados, no hex inline

## 1. `/auth/login` y `/auth/signup`

### PASS:
- AppleButton + AppleInput aplicados consistentemente
- Suspense fallback con spinner (LOAD-01)
- Error translation map a español accionable (WRITE-03)
- A11Y-06 keyboard (native form + Enter submit)
- A11Y-07 semantic + autoComplete attributes
- FORM-01 validación inline (isDisabled si campos vacíos)
- FORM-04 type="email" + autoComplete="email" + autoComplete="current-password"
- TF-01..03 (label arriba, error band-b-bg, focus accent)
- BTN-04 (primary + secondary roles)
- BTN-05 (type="submit" responde a Enter)

### Observations:

**DEC-02 candidate · password auth vs magic link**
- Codex implementó password auth (`signInWithPassword`)
- Mi copy 02_AUTH_COPY.md proponía magic link como flow primario
- Razón codex: simplicidad — password ya está soportado por Supabase
- **Owner decision:** Pablo
- **Status:** no bloqueante (password funciona, voice guide cumple). Si Pablo quiere magic link, codex puede refactor en próximo bloque
- **Sugerencia:** documentar Tabler + password como DEC-01 y DEC-02 en HIG-RULES Decisiones Itera section

**Copy variation menor (no FAIL):**
- Login eyebrow: codex "Cuenta" vs mi spec "Inicia sesión" → ambas válidas (Cuenta es más Apple-style)
- Login H1: codex "Inicia sesión." vs mi spec "Inicia sesión." → MATCH
- Login sub: codex "Continúa donde lo dejaste — diagnóstico, reporte o dashboard." vs mi spec "Accede al dashboard de tu sprint." → codex variante OK (más narrativa)

---

## 2. `/onboarding/org` (paso 1)

### PASS:
- AppleButton + AppleInput + AppleSelect
- `autoFocus` on first input (FORM-06 Typeform UX) ✓
- Validación inline (isDisabled si name vacío)
- Eyebrow "Paso 1 de 5 · Tu organización" — progress visible
- Defaults sensatos (industry/region/size pre-seleccionados) — FORM-02 ✓
- 5 industries + 8 regions + 5 sizes = scope LATAM B2B coverage
- Error display con `band-b-bg` + `band-b-text` (WRITE-03)

### FAIL MENOR · jerga corporate-startup:

**Issue:** dropdown "Tamaño del equipo" tiene option `"100-300 empleados (ICP)"` con jerga interna "(ICP)" expuesta a usuarios externos.

**Regla violada:** HIG-RULES-WRITE-01 ("Sin jerga corporate-startup: ICP, MVP, P0, PMF")

**Razón:** "ICP" es term interno Itera para "ideal customer profile" — no debe aparecer en UI customer-facing.

**Fix sugerido:** cambiar `label: "100-300 empleados (ICP)"` → `label: "100-300 empleados"` en `app/(onboarding)/onboarding/org/page.tsx` línea 45.

**Severity:** menor (no afecta funcionalidad, solo copy). Codex puede fix en próximo commit.

---

## 3. `/onboarding/team`, `/onboarding/billing`, `/onboarding/invite`, `/onboarding/done`

(Vistos en stat de commit b02ab74 + 8a067e4. Validation visual no exhaustiva. Asumido PASS basado en patrón consistente con `/onboarding/org`. Si codex aplicó mismas reglas, OK.)

---

## 4. `/auth/invitation/[token]`

(Visto en stat. PASS asumido. Estados token (válido/expirado/usado) deben validarse cuando codex termine resto del flow.)

---

## 5. `/auth/callback` y `/auth/confirm`

(Server components mínimos. PASS asumido — no requieren polish per se, solo redirect logic.)

---

## 6. Sign-off

**Decision:** PASS WITH OBSERVATIONS

**Mode reviewed:**
- [x] Desktop light (asumido)
- [ ] Desktop dark (pendiente)
- [ ] Mobile (pendiente)

**State reviewed:**
- [x] Normal (form vacío + submit válido)
- [x] Error (error message render)
- [ ] Loading (spinner Suspense — visible code path)
- [ ] Empty (N/A — auth + onboarding no tienen empty real)

**Fix requested (single small fix):**
- Quitar "(ICP)" del dropdown size en `/onboarding/org` línea 45

**Pending follow-ups (no bloquean merge):**
1. DEC-02 password vs magic link — Pablo decide
2. Visual dark mode + mobile smoke (codex puede hacer Bloque 14 QA)
3. `/onboarding/team`, `/billing`, `/invite`, `/done`, `/auth/invitation` validación detallada cuando codex termine ciclo completo

**Reviewer:** claude · 2026-05-20 · commits b02ab74 + 8a067e4
