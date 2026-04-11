'use client';

import Button from '@/components/ui/Button';
import { Title, Body } from '@/components/ui/Typography';

export default function AltCtaSection() {
  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-6xl rounded-3xl bg-gray-900 dark:bg-gray-800 px-8 py-20 md:py-28 text-center space-y-8">
        <Title className="!text-3xl md:!text-5xl !text-white !leading-[1.15]">
          empieza a construir con IA hoy, no mañana
        </Title>
        <Body className="!text-lg text-gray-400 max-w-xl mx-auto">
          Describe tu proyecto y en minutos tendrás un curso personalizado con
          ejercicios prácticos, lecciones interactivas y retroalimentación en
          tiempo real.
        </Body>
        <div className="pt-4">
          <Button variant="primary" size="xl" href="/auth/signup">
            Crear mi curso gratis
          </Button>
        </div>
      </div>
    </section>
  );
}
