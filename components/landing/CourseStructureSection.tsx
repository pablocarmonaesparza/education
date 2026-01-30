"use client";

import Image from "next/image";
import Card from '@/components/ui/Card';

const sections = [
  {
    id: 1,
    title: "Fundamentos de IA",
    description: "Conceptos, tipos de IA, y modelos de lenguaje.",
    image: "/images/module-fundamentals.webp",
  },
  {
    id: 2,
    title: "Prompt Engineering",
    description: "Comunícate efectivamente con la IA.",
    image: "/images/module-prompting.webp",
  },
  {
    id: 3,
    title: "APIs y Automatización",
    description: "Integra IA en tus workflows y aplicaciones.",
    image: "/images/module-apis.webp",
  },
  {
    id: 4,
    title: "Generación Aumentada por Recuperación (RAG)",
    description: "Crea sistemas de IA con tu base de conocimiento.",
    image: "/images/module-rag.webp",
  },
  {
    id: 5,
    title: "Protocolo de Contexto de Modelo (MCP)",
    description: "Expande las capacidades de la IA.",
    image: "/images/module-mcp.webp",
  },
  {
    id: 6,
    title: "Agentes de IA",
    description: "Construye agentes autónomos que ejecutan tareas.",
    image: "/images/module-agents.webp",
  },
];

export default function CourseStructureSection() {
  return (
    <section id="course-structure" className="bg-white dark:bg-gray-800 py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-[#4b4b4b] dark:text-white mb-4 leading-tight">
            Un Currículum Práctico
          </h2>
          <p className="text-xl md:text-2xl text-center text-[#777777] dark:text-gray-400 max-w-3xl mx-auto font-light">
            Aprende las habilidades clave para construir con inteligencia
            artificial.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sections.map((section) => (
            <Card
              key={section.id}
              variant="neutral"
              padding="lg"
              className="relative overflow-hidden group"
            >
              <Image
                src={section.image}
                alt={section.title}
                layout="fill"
                objectFit="cover"
                className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
              />
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-[#4b4b4b] dark:text-white mb-3">
                  {section.title}
                </h3>
                <p className="text-base md:text-lg text-[#777777] dark:text-gray-400 leading-relaxed">{section.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
