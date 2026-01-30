import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui';

export default function SuccessPage() {
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
        <h1 className="text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-4 tracking-tight">pago exitoso</h1>
        <p className="text-lg text-[#777777] dark:text-gray-400 mb-8">
          Tu compra se ha completado con éxito. ¡Gracias!
        </p>
        <Button variant="primary" size="lg" rounded2xl href="/dashboard">
          IR AL DASHBOARD
        </Button>
      </section>
      <Footer />
    </main>
  );
}
