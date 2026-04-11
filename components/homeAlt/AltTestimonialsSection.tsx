'use client';

import Card from '@/components/ui/Card';
import { Title, Body, Caption } from '@/components/ui/Typography';

const TESTIMONIALS = [
  {
    quote:
      'En dos semanas construí un chatbot RAG para mi empresa. El curso se adaptó exactamente a mi stack técnico.',
    name: 'María García',
    role: 'CTO, Fintech Startup',
  },
  {
    quote:
      'Nunca había tocado una API de IA. Ahora tengo 3 automatizaciones en producción. Los ejercicios interactivos son adictivos.',
    name: 'Carlos Mendoza',
    role: 'Product Manager',
  },
  {
    quote:
      'Lo que más me gustó es que no es un curso genérico. Cada lección usaba ejemplos de mi propio proyecto.',
    name: 'Ana Rodríguez',
    role: 'Data Scientist',
  },
];

export default function AltTestimonialsSection() {
  return (
    <section className="py-24 md:py-32 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-6 space-y-12">
        <Title className="!text-3xl md:!text-4xl text-center">
          lo que dicen quienes ya aprendieron
        </Title>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} variant="neutral" padding="lg" className="space-y-4">
              <Body className="text-[#4b4b4b] dark:text-gray-200 italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </Body>
              <div>
                <Body className="!font-bold !text-sm">{t.name}</Body>
                <Caption className="text-[#777777] dark:text-gray-400">
                  {t.role}
                </Caption>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
