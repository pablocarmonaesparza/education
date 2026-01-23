import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center text-[#4b4b4b] dark:text-white mb-8 tracking-tight">política de privacidad</h1>
        <p className="text-lg text-center">
          Aquí se explicará cómo recopilamos, usamos y protegemos sus datos personales.
        </p>
        <p className="text-lg text-center mt-4">
          Su privacidad es de suma importancia para nosotros.
        </p>
      </section>
      <Footer />
    </main>
  );
}
