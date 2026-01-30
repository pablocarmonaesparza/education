import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';

export default function DifferentiatorsSection() {
  const differentiators = [
    {
      title: "Personalización con IA",
      description: "Claude analiza tu proyecto y genera una ruta única para ti. No es un curso genérico.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      title: "Micro-Aprendizaje Efectivo",
      description: "400 videos de 1-3 minutos. Aprende en bloques pequeños, cualquier momento del día.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Español Neutral LatAm",
      description: "Contenido creado específicamente para profesionales latinoamericanos, en tu idioma.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
    },
    {
      title: "Cobertura Completa",
      description: "Desde fundamentos de IA hasta vender tu solución. MCP, RAG, Vibe-Coding y más.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Enfoque en Proyectos Reales",
      description: "No solo teoría. Cada módulo incluye checkpoints y artefactos aplicados a TU proyecto.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: "Hasta La Venta",
      description: "Aprende a monetizar. Incluye módulos sobre cómo vender y comercializar soluciones de IA.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#4b4b4b] dark:text-white mb-4">
            ¿Qué Hace Diferente a Este Curso?
          </h2>
          <p className="text-xl text-[#777777] dark:text-gray-400 max-w-3xl mx-auto">
            No es solo otro curso de IA. Es una experiencia de aprendizaje personalizada y práctica.
          </p>
        </div>

        {/* Differentiators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {differentiators.map((item, index) => (
            <Card
              key={index}
              variant="neutral"
              padding="lg"
              className="group relative"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-[#1472FF] opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300" />

              {/* Icon */}
              <div className="inline-flex p-3 rounded-xl bg-[#1472FF] text-white mb-4">
                {item.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#4b4b4b] dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-[#777777] dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard icon="📹" value="400+" label="Micro-Videos" color="blue" />
          <StatCard icon="📦" value="12" label="Módulos Especializados" color="blue" />
          <StatCard icon="⏱" value="1-3" label="Minutos por Video" color="blue" />
          <StatCard icon="🎯" value="100%" label="Personalizado" color="blue" />
        </div>
      </div>
    </section>
  );
}
