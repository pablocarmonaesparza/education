import Footer from '@/components/shared/Footer';

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center text-ink dark:text-white mb-8 tracking-tight">sobre nosotros</h1>
        <p className="text-lg text-center">
          Itera ayuda a equipos B2B a medir si están usando IA con criterio en flujos reales de trabajo.
        </p>
        <p className="text-lg text-center mt-4">
          El producto combina casos vivos, evaluación operativa y evidencia accionable para managers.
        </p>
      </section>
      <Footer />
    </main>
  );
}
