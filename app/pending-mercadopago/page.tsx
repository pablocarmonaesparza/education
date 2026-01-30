import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui';

export default function MercadoPagoPendingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <svg
          className="w-24 h-24 text-yellow-500 mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-4 tracking-tight">pago pendiente</h1>
        <p className="text-lg text-gray-700 mb-8">
          Tu pago está en proceso. Te notificaremos cuando se complete.
        </p>
        <Button variant="primary" size="lg" rounded2xl href="/dashboard">
          Ir al Dashboard
        </Button>
      </section>
      <Footer />
    </main>
  );
}
