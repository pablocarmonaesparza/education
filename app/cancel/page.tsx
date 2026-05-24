import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <svg
          className="w-24 h-24 text-red-500 mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          pago cancelado
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-400 mb-8 max-w-xl">
          no se cobró nada. puedes volver al diagnóstico y retomarlo cuando estés listo.
        </p>
        <Link
          href="/auth/signup?next=%2Fonboarding%2Forg"
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          volver al diagnóstico
        </Link>
      </section>
      <footer className="border-t border-gray-200 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Itera
      </footer>
    </main>
  );
}
