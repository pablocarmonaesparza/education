import { redirect } from "next/navigation";
import {
  isTerminalSimuladorPaymentSyncReason,
  syncSimuladorPaymentFromSession,
} from "@/lib/stripe/simuladorBilling";
import { AppleButtonLink, AppleIcon, AppleLink } from "@/components/simulador/apple";
import "../(app)/simulador.css";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

const PRIMARY_BTN =
  "w-full h-12 accent-bg text-white text-[15px] font-medium shadow-none";

/**
 * Server component — cierra el race con el webhook de Stripe.
 * Al llegar aquí (redirect desde Stripe Checkout), verificamos el session_id
 * contra la API de Stripe y escribimos la suscripción en simulador.subscriptions
 * nosotros mismos. El webhook eventualmente escribe lo mismo — idempotente.
 */
export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    redirect("/auth/signup?next=%2Fonboarding%2Forg");
  }

  const sync = await syncSimuladorPaymentFromSession(sessionId);

  if (!sync.ok && sync.reason === "payment_pending") {
    return (
      <div className="simulador-root min-h-screen surface-canvas">
        <main className="px-6 py-16 min-h-screen flex items-center justify-center">
          <div className="max-w-[400px] w-full mx-auto text-center flex flex-col items-center gap-6">
            <div className="h-14 w-14 rounded-full grid place-items-center bg-[var(--band-m-bg)]">
              <AppleIcon
                name="clock"
                size="lg"
                className="text-[var(--band-m-text)]"
              />
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="display display-tight text-[28px] sm:text-[32px] leading-[1.1] text-[var(--text-primary)]">
                Verificando tu pago.
              </h1>
              <p className="text-[15px] leading-[1.55] text-[var(--text-secondary)]">
                Stripe aún no confirma el pago. Esto toma unos segundos. Vuelve a
                verificar si no avanza solo.
              </p>
            </div>
            <AppleButtonLink
              href={`/success?session_id=${sessionId}`}
              className={PRIMARY_BTN}
            >
              Volver a verificar
            </AppleButtonLink>
          </div>
        </main>
      </div>
    );
  }

  if (!sync.ok) {
    console.error("[/success] sync failed:", sync.reason);
    if (isTerminalSimuladorPaymentSyncReason(sync.reason)) {
      return (
        <div className="simulador-root min-h-screen surface-canvas">
          <main className="px-6 py-16 min-h-screen flex items-center justify-center">
            <div className="max-w-[400px] w-full mx-auto text-center flex flex-col items-center gap-6">
              <div className="h-14 w-14 rounded-full grid place-items-center bg-[var(--band-b-bg)]">
                <AppleIcon
                  name="alert"
                  size="lg"
                  className="text-[var(--band-b-text)]"
                />
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="display display-tight text-[28px] sm:text-[32px] leading-[1.1] text-[var(--text-primary)]">
                  No pudimos asociar el pago.
                </h1>
                <p className="text-[15px] leading-[1.55] text-[var(--text-secondary)]">
                  Tu pago se procesó pero no pudimos asociarlo a tu organización.
                  Escríbenos a{" "}
                  <AppleLink href="mailto:hola@itera.la">hola@itera.la</AppleLink>{" "}
                  con tu email y te ayudamos en el momento.
                </p>
              </div>
            </div>
          </main>
        </div>
      );
    }
    redirect("/auth/signup?next=%2Fonboarding%2Forg");
  }

  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <main className="px-6 py-16 min-h-screen flex items-center justify-center">
        <div className="max-w-[400px] w-full mx-auto text-center flex flex-col items-center gap-6">
          <div className="h-14 w-14 rounded-full grid place-items-center bg-[var(--band-a-bg)]">
            <AppleIcon
              name="check"
              size="lg"
              className="text-[var(--band-a-text)]"
            />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="display display-tight text-[28px] sm:text-[32px] leading-[1.1] text-[var(--text-primary)]">
              Pago exitoso.
            </h1>
            <p className="text-[15px] leading-[1.55] text-[var(--text-secondary)]">
              Tu suscripción está activa. Ya puedes entrar al dashboard del
              simulador.
            </p>
          </div>
          <AppleButtonLink href="/dashboard" className={PRIMARY_BTN}>
            Ir al dashboard
          </AppleButtonLink>
        </div>
      </main>
    </div>
  );
}
