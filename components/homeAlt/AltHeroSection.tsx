'use client';

import Button from '@/components/ui/Button';
import { Title, Body } from '@/components/ui/Typography';

export default function AltHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-950 overflow-hidden">
      {/* Gradient orb backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, #1472FF 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center space-y-8">
        <Title className="!text-5xl md:!text-7xl !text-white !leading-[1.1]">
          aprende IA construyendo tu propio proyecto
        </Title>

        <Body className="!text-lg md:!text-xl text-gray-400 max-w-2xl mx-auto">
          Cursos personalizados con inteligencia artificial. Describe tu idea y
          generamos un camino de aprendizaje hecho a tu medida.
        </Body>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button variant="primary" size="xl" href="/auth/signup">
            Empieza gratis
          </Button>
          <Button variant="outline" size="xl" href="#cursos" className="!text-white !border-gray-700 hover:!border-white">
            Ver cursos
          </Button>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-950 to-transparent"
      />
    </section>
  );
}
