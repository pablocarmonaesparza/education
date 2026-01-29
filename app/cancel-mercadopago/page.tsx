import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Link from 'next/link';

export default function MercadoPagoCancelPage() {
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
          Tu proceso de pago con Mercado Pago ha sido cancelado. Puedes intentarlo de nuevo.
        </p>
        <Link href="/pricing" className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide bg-[#1472FF] text-white border-2 border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-2 active:mt-[2px] transition-all">
          Volver a Precios
        </Link>
      </section>
      <Footer />
    </main>
  );
}
