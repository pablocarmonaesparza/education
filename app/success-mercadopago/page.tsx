import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Link from 'next/link';

export default function MercadoPagoSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <svg
          className="w-24 h-24 text-green-500 mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-4 tracking-tight">pago exitoso</h1>
        <p className="text-lg text-gray-700 mb-8">
          Tu compra se ha completado con éxito a través de Mercado Pago. ¡Gracias!
        </p>
        <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] active:border-b-2 active:mt-[2px] transition-all">
          Ir al Dashboard
        </Link>
      </section>
      <Footer />
    </main>
  );
}
