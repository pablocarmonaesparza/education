'use client';

import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Title, Subtitle, Body } from '@/components/ui/Typography';

const COURSES = [
  {
    emoji: '💬',
    title: 'chatbots inteligentes',
    desc: 'Construye asistentes conversacionales con GPT, RAG y memory que resuelvan problemas reales de tus usuarios.',
    tags: ['LLMs', 'RAG', 'Prompting'],
  },
  {
    emoji: '⚙️',
    title: 'automatización con IA',
    desc: 'Conecta modelos de lenguaje con APIs, bases de datos y herramientas para automatizar flujos de trabajo complejos.',
    tags: ['Agentes', 'APIs', 'Workflows'],
  },
  {
    emoji: '📊',
    title: 'análisis de datos con IA',
    desc: 'Aprende a extraer insights de datos no estructurados usando NLP, embeddings y técnicas de clustering.',
    tags: ['NLP', 'Embeddings', 'Python'],
  },
  {
    emoji: '🚀',
    title: 'productos con IA',
    desc: 'Diseña, construye y lanza productos digitales potenciados por inteligencia artificial desde cero.',
    tags: ['Producto', 'UX', 'Deploy'],
  },
];

export default function AltServicesSection() {
  return (
    <section id="cursos" className="py-24 md:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-6 space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <Title className="!text-3xl md:!text-4xl">
            cursos que se construyen alrededor de tu proyecto
          </Title>
          <Body className="text-[#777777] dark:text-gray-400 !text-lg">
            Elige un camino o describe tu idea. La IA genera un curso
            personalizado con ejercicios prácticos.
          </Body>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {COURSES.map((c) => (
            <Card
              key={c.title}
              variant="neutral"
              padding="lg"
              interactive
              className="space-y-4"
            >
              <div className="text-4xl">{c.emoji}</div>
              <Subtitle>{c.title}</Subtitle>
              <Body className="text-[#777777] dark:text-gray-400">{c.desc}</Body>
              <div className="flex flex-wrap gap-2 pt-2">
                {c.tags.map((t) => (
                  <Tag key={t} variant="outline">
                    {t}
                  </Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
