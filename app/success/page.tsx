import { redirect } from "next/navigation";
import Link from "next/link";
import { syncSubscriptionFromSession } from "@/lib/stripe/syncFromSession";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

/**
 * Server component — cierra el race con el webhook de Stripe.
 * Al llegar aquí (redirect desde Stripe Checkout), verificamos el session_id
 * contra la API de Stripe y escribimos subscription_active=true nosotros
 * mismos. El webhook eventualmente escribe lo mismo — idempotente.
 */
export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    redirect("/auth/signup?next=%2Fonboarding%2Forg");
  }

  const sync = await syncSubscriptionFromSession(sessionId);

  if (!sync.ok && sync.reason === "payment_pending") {
    return (
      <main className="min-h-screen flex flex-col bg-white dark:bg-gray-800">
        <section className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            verificando tu pago
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-400 mb-8 max-w-md">
            stripe aún no confirma el pago. esto toma unos segundos. recarga esta página si no avanza sola.
          </p>
          <Link
            href={`/success?session_id=${sessionId}`}
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            volver a verificar
          </Link>
        </section>
        <footer className="border-t border-gray-200 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Itera
        </footer>
      </main>
    );
  }

  if (!sync.ok) {
    console.error("[/success] sync failed:", sync.reason);
    if (sync.reason === "no_user_id_in_session") {
      return (
        <main className="min-h-screen flex flex-col bg-white dark:bg-gray-800">
          <section className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              no pudimos asociar el pago
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-400 mb-8 max-w-md">
              tu pago se procesó pero no pudimos asociarlo a tu cuenta. escríbenos a hola@itera.la con tu email y te ayudamos en el momento.
            </p>
          </section>
          <footer className="border-t border-gray-200 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Itera
          </footer>
        </main>
      );
    }
    redirect("/auth/signup?next=%2Fonboarding%2Forg");
  }

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-gray-800">
      <section className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          pago exitoso
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-400 mb-8">
          tu suscripción está activa. puedes entrar al dashboard del simulador.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          ir al dashboard
        </Link>
      </section>
      <footer className="border-t border-gray-200 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Itera
      </footer>
    </main>
  );
}
