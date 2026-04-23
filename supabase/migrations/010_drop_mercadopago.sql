-- ============================================================================
-- Migration 010 — eliminar infraestructura de MercadoPago
-- ----------------------------------------------------------------------------
-- Pablo confirmó el 22-abril-2026: Itera es B2B empresa-first. Los rails
-- Pix/OXXO/Boleto son B2C y no aplican. Stripe es el único procesador.
-- Ver docs/memory/gotcha_posicionamiento_empresa_vs_latam.md.
--
-- Pre-estado verificado:
--   - users.mercadopago_customer_id: 0 filas con valor → drop seguro.
--   - payments con provider='mercadopago': 0 filas → restringir check seguro.
--   - Ningún índice referencia mercadopago_customer_id.
--   - Código de frontend/API ya eliminado (commits previos de otros agentes
--     + los 4 files staged en este commit: app/api/mercadopago/*,
--     app/cancel-mercadopago/, app/pending-mercadopago/, app/success-mercadopago/).
--
-- Si en el futuro hay que volver a rails LATAM para B2C, esta migration se
-- revierte escribiendo la inversa (columna nullable text + check con
-- 'mercadopago' de vuelta en el array).
-- ============================================================================

-- 1. Drop columna mercadopago_customer_id
ALTER TABLE public.users
  DROP COLUMN IF EXISTS mercadopago_customer_id;

-- 2. Reemplazar check constraint de payments.provider para aceptar solo 'stripe'
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_provider_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_provider_check
  CHECK (provider = 'stripe');

-- 3. Verificación
DO $$
DECLARE
  v_col_exists boolean;
  v_constraint_def text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'mercadopago_customer_id'
  ) INTO v_col_exists;

  SELECT pg_get_constraintdef(oid) INTO v_constraint_def
  FROM pg_constraint WHERE conname = 'payments_provider_check';

  IF v_col_exists THEN
    RAISE EXCEPTION 'Migration 010 falló: users.mercadopago_customer_id sigue existiendo';
  END IF;

  IF v_constraint_def NOT LIKE '%stripe%' OR v_constraint_def LIKE '%mercadopago%' THEN
    RAISE EXCEPTION 'Migration 010 falló: check constraint de payments.provider no es solo stripe (actual: %)', v_constraint_def;
  END IF;

  RAISE NOTICE 'Migration 010 OK: columna dropeada, constraint ahora %', v_constraint_def;
END $$;
