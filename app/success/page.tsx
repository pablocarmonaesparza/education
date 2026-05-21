/**
 * /success — landing post-Stripe Checkout.
 *
 * Server component que cierra el race con el webhook: verifica session_id
 * contra Stripe y escribe subscription_active=true directamente (idempotente
 * con el webhook que eventualmente hace lo mismo).
 *
 * Estados:
 *   - OK → confirmación + CTA al dashboard
 *   - payment_pending → estado "verificando" con botón refresh
 *   - no_user_id_in_session → error grave, contacto soporte
 *   - otros → redirect silencioso al onboarding
 *
 * UI estilo Apple/HIG: surface-canvas + AuthNav + columna centrada.
 * Cero imports del DS legacy.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthNav } from "@/components/simulador/AuthNav";
import { syncSubscriptionFromSession } from "@/lib/stripe/syncFromSession";
import { isDevBypassEnabled } from "@/lib/dev/devBypass";
import "../(app)/simulador.css";

export const metadata: Metadata = {
  title: "Pago confirmado · Itera",
  robots: { index: false, follow: false },
};

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

/**
 * Vista del estado OK (pago confirmado).
 * Extraída como componente para poder reusarla en preview de /dev sin
 * tener que pasar por la verificación contra Stripe.
 */
function SuccessConfirmedView() {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <AuthNav mode="login" next="/" />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
        <div className="max-w-[440px] w-full text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-[var(--band-a-bg)] grid place-items-center">
            <svg
              className="h-7 w-7 text-[var(--band-a-text)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="display display-tight mt-7 text-[var(--text-primary)] text-[28px] sm:text-[32px]">
            Pago confirmado
          </h1>
          <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
            Tu suscripción está activa. Puedes entrar al dashboard del
            simulador.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] accent-bg px-6 text-[15px] font-medium text-white hover:opacity-95 transition-opacity"
            >
              Ir al dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  // En dev local o Vercel preview sin session_id (acceso desde /dev menú):
  // preview del estado OK sin tocar Stripe. En producción real seguimos
  // protegiendo con redirect.
  if (!sessionId) {
    if (isDevBypassEnabled()) {
      return <SuccessConfirmedView />;
    }
    redirect("/auth/signup?next=%2Fonboarding%2Forg");
  }

  const sync = await syncSubscriptionFromSession(sessionId);

  // ============ PAGO PENDIENTE ============
  if (!sync.ok && sync.reason === "payment_pending") {
    return (
      <div className="simulador-root min-h-screen surface-canvas">
        <AuthNav mode="login" next="/" />
        <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
          <div className="max-w-[440px] w-full text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[var(--accent-soft)] grid place-items-center">
              <svg
                className="h-7 w-7 text-[var(--accent)] animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.25"
                />
                <path
                  d="M12 3a9 9 0 0 1 9 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="display display-tight mt-7 text-[var(--text-primary)] text-[28px] sm:text-[32px]">
              Verificando tu pago
            </h1>
            <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
              Stripe aún no confirma el cobro. Suele tardar unos segundos.
              Recarga si no avanza solo.
            </p>
            <div className="mt-8">
              <Link
                href={`/success?session_id=${sessionId}`}
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] accent-bg px-6 text-[15px] font-medium text-white hover:opacity-95 transition-opacity"
              >
                Volver a verificar
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============ ERROR GRAVE: pago sin cuenta asociada ============
  if (!sync.ok && sync.reason === "no_user_id_in_session") {
    return (
      <div className="simulador-root min-h-screen surface-canvas">
        <AuthNav mode="login" next="/" />
        <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
          <div className="max-w-[440px] w-full text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[var(--band-b-bg)] grid place-items-center">
              <svg
                className="h-7 w-7 text-[var(--band-b-bar)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="display display-tight mt-7 text-[var(--text-primary)] text-[28px] sm:text-[32px]">
              No pudimos asociar el pago
            </h1>
            <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
              Tu pago se procesó pero no logramos asociarlo a una cuenta.
              Escríbenos con tu email y lo resolvemos en el momento.
            </p>
            <div className="mt-8">
              <a
                href="mailto:hola@itera.la"
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] accent-bg px-6 text-[15px] font-medium text-white hover:opacity-95 transition-opacity"
              >
                Escribir a soporte
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============ OTROS ERRORES → silencio + redirect ============
  if (!sync.ok) {
    console.error("[/success] sync failed:", sync.reason);
    redirect("/auth/signup?next=%2Fonboarding%2Forg");
  }

  // ============ PAGO CONFIRMADO ============
  return <SuccessConfirmedView />;
}
