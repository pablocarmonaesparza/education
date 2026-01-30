import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui';

export default function CancelPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
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
        <h1 className="text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-4 tracking-tight">pago cancelado</h1>
        <p className="text-lg text-gray-700 mb-8">
          Tu proceso de pago ha sido cancelado. Puedes intentarlo de nuevo.
        </p>
        <Button variant="primary" size="lg" rounded2xl href="/pricing">
          Volver a Precios
        </Button>
      </section>
      <Footer />
    </main>
  );
}
