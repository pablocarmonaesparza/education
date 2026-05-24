# Handoff activo

Este archivo queda limpio después de la purga `20260519`. El historial previo vive en git; el árbol activo ya no conserva archivo legacy local.

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
