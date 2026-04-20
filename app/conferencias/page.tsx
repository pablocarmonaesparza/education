import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Title, Subtitle, Body } from '@/components/ui/Typography';
import Card from '@/components/ui/Card';

export default function ConferenciasPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <section className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-12 text-center">
          <Title className="mb-4">conferencias</Title>
          <Body className="text-ink-muted dark:text-gray-400">
            Próximamente: eventos y charlas sobre IA y automatización
          </Body>
        </div>

        <Card variant="neutral" padding="lg">
          <Subtitle className="mb-4">próximos eventos</Subtitle>
          <Body className="text-ink-muted dark:text-gray-400">
            Estamos preparando contenido para esta sección. Regresa pronto para conocer nuestras próximas conferencias, webinars y eventos.
          </Body>
        </Card>
      </section>
      <Footer />
    </main>
  );
}
