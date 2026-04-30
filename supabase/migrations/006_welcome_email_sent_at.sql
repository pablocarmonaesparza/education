-- ============================================================================
-- Migration 006 — welcome email idempotency
-- ----------------------------------------------------------------------------
-- Añade la columna `welcome_email_sent_at` a `public.users` para usarla como
-- señal de idempotencia del welcome email.
--
-- Contexto: el flujo actual infería "primera vez" a partir de "no existe fila
-- en public.users". Esta heurística se rompe con paths que crean la fila sin
-- mandar correo (auto-login, generate-course que hace upsert). Con la columna
-- explícita, el callback manda welcome sólo cuando `welcome_email_sent_at IS
-- NULL` y lo marca inmediatamente después — idempotente y resistente a
-- creaciones alternativas de la fila.
--
-- Futuro (Backend): también usar este gate desde el hook de
-- `checkout.session.completed` (doble disparador — signup + primera compra).
-- ============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz;

COMMENT ON COLUMN public.users.welcome_email_sent_at IS
  'Timestamp del envío exitoso del welcome email. NULL = nunca enviado. '
  'Se setea al momento del envío para garantizar idempotencia frente a '
  'múltiples callbacks / signups parciales / creación de la fila desde '
  'otros paths (auto-login, generate-course).';

-- Backfill: los usuarios existentes ya pasaron el onboarding en su momento.
-- Los marcamos como "ya enviado" para no spammear a la base viva con un
-- correo de bienvenida retroactivo. created_at es un proxy aceptable.
UPDATE public.users
  SET welcome_email_sent_at = created_at
  WHERE welcome_email_sent_at IS NULL;
