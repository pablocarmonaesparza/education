import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center text-[#4b4b4b] dark:text-white mb-8 tracking-tight">sobre nosotros</h1>
        <p className="text-lg text-center">
          Aquí irá la información sobre la plataforma, su misión, visión y el equipo detrás.
        </p>
        <p className="text-lg text-center mt-4">
          Nuestro objetivo es empoderar a profesionales con conocimientos de Inteligencia Artificial y Automatización.
        </p>
      </section>
      <Footer />
    </main>
  );
}
