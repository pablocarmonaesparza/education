import { redirect } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui';
import { syncSubscriptionFromSession } from '@/lib/stripe/syncFromSession';

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

/**
 * Server component — cierra el race con el webhook de Stripe.
 * Al llegar aquí (redirect desde Stripe Checkout), verificamos el session_id
 * contra la API de Stripe y escribimos subscription_active=true nosotros
 * mismos. El webhook eventualmente escribe lo mismo — idempotente.
 *
 * Si Stripe reporta pago pendiente (raro, casi siempre paga ya al redirect),
 * mostramos un estado de "verificando" con un refresh manual; el polling
 * automático no está — preferimos dar al usuario un botón explícito.
 */
export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    // Sin session_id no podemos verificar — fallback al flujo manual.
    redirect('/paywall?canceled=1');
  }

  const sync = await syncSubscriptionFromSession(sessionId);

  // Si el pago está pendiente, mostramos estado intermedio con botón para
  // reintentar la verificación (no polling automático — el user ve qué pasa).
  if (!sync.ok && sync.reason === 'payment_pending') {
    return (
      <main className="min-h-screen flex flex-col bg-white dark:bg-gray-800">
        <Navbar />
        <section className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-ink dark:text-white mb-4 tracking-tight">
            verificando tu pago
          </h1>
          <p className="text-lg text-ink-muted dark:text-gray-400 mb-8 max-w-md">
            stripe aún no confirma el pago. esto toma unos segundos. recarga
            esta página si no avanza sola.
          </p>
          <Button variant="primary" size="lg" rounded2xl href={`/success?session_id=${sessionId}`}>
            volver a verificar
          </Button>
        </section>
        <Footer />
      </main>
    );
  }

  // Si falla por otra razón (sesión inválida, stripe caído), mandamos al
  // paywall con mensaje. El webhook puede compensar más tarde.
  if (!sync.ok) {
    console.error('[/success] sync failed:', sync.reason);
    // No redirigimos en error "no_user_id_in_session" (serio, requiere soporte)
    if (sync.reason === 'no_user_id_in_session') {
      return (
        <main className="min-h-screen flex flex-col bg-white dark:bg-gray-800">
          <Navbar />
          <section className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-extrabold text-ink dark:text-white mb-4 tracking-tight">
              no pudimos asociar el pago
            </h1>
            <p className="text-lg text-ink-muted dark:text-gray-400 mb-8 max-w-md">
              tu pago se procesó pero no pudimos asociarlo a tu cuenta. escríbenos
              a hola@itera.la con tu email y te ayudamos en el momento.
            </p>
          </section>
          <Footer />
        </main>
      );
    }
    redirect('/paywall?canceled=1');
  }

  // Pago confirmado y DB escrita. Mostramos confirmación + CTA a courseCreation.
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-gray-800">
      <Navbar />
      <section className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-ink dark:text-white mb-4 tracking-tight">
          pago exitoso
        </h1>
        <p className="text-lg text-ink-muted dark:text-gray-400 mb-8">
          tu suscripción está activa. ahora generamos tu ruta personalizada.
        </p>
        <Button variant="primary" size="lg" rounded2xl href="/courseCreation">
          generar mi ruta
        </Button>
      </section>
      <Footer />
    </main>
  );
}
