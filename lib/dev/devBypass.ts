/**
 * Helper compartido: ¿está habilitado el dev bypass de auth?
 *
 * Mientras Itera está en fase de QA pre-launch, el bypass está habilitado
 * en TODOS los environments (dev local, Vercel preview, Vercel production).
 * La cookie `itera_dev_bypass=1` es la gate real — solo se setea desde
 * /dev (URL no linkeada públicamente), así que actúa como passphrase
 * implícita.
 *
 * Hard-disable check: el env var NEXT_PUBLIC_DEV_BYPASS_DISABLED=1 fuerza
 * a OFF en cualquier environment. Antes del launch real seteamos ese flag
 * en Vercel production y removemos /dev + DevReturnButton.
 *
 * TODO post-launch:
 *   1. Setear NEXT_PUBLIC_DEV_BYPASS_DISABLED=1 en Vercel production
 *   2. (opcional) Eliminar /dev + components/simulador/DevReturnButton.tsx
 *   3. (opcional) Reintroducir env-gate: solo preview deploys
 */

export function isDevBypassEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_DISABLED === "1") return false;
  return true;
}
