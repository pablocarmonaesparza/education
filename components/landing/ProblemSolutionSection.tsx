import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';

export default function ProblemSolutionSection() {
  const problems = [
    {
      icon: "⏰",
      title: "Falta de Tiempo",
      description: "Los cursos tradicionales requieren 50+ horas lineales. No tienes tiempo para ver todo.",
    },
    {
      icon: "📚",
      title: "Contenido Irrelevante",
      description: "Aprendes cosas que nunca usarás. El 70% del contenido no aplica a tu proyecto.",
    },
    {
      icon: "🎯",
      title: "Sin Dirección Clara",
      description: "No sabes qué aprender primero, ni cómo aplicarlo a tu caso específico.",
    },
    {
      icon: "🔄",
      title: "Falta de Personalización",
      description: "Todos reciben el mismo curso, sin importar su industria, experiencia o meta.",
    },
  ];

  const solutions = [
    {
      icon: "🤖",
      title: "IA Analiza Tu Proyecto",
      description: "Respondes 5-7 preguntas sobre tu proyecto y la IA crea tu ruta personalizada.",
    },
    {
      icon: "⚡",
      title: "Micro-Aprendizaje",
      description: "Videos de 1-3 minutos. Aprende en bloques cortos que caben en tu agenda.",
    },
    {
      icon: "🎨",
      title: "Solo Lo Relevante",
      description: "Tu ruta incluye SOLO los módulos que necesitas para tu proyecto específico.",
    },
    {
      icon: "📈",
      title: "De Teoría a Venta",
      description: "No solo aprendes a construir. Aprendes a vender y monetizar tu solución de IA.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink dark:text-white mb-4">
            ¿Por Qué Los Cursos Tradicionales No Funcionan?
          </h2>
          <p className="text-xl text-ink-muted dark:text-gray-400 max-w-3xl mx-auto">
            Los cursos lineales asumen que todos tienen las mismas necesidades. La realidad es diferente.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-ink dark:text-white mb-8">
            Los Problemas Que Enfrentas
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, index) => (
              <Card
                key={index}
                variant="neutral"
                padding="lg"
                className="border-l-4 border-l-gray-300 dark:border-l-gray-600"
              >
                <div className="text-4xl mb-4">{problem.icon}</div>
                <h4 className="text-lg font-bold text-ink dark:text-white mb-2">
                  {problem.title}
                </h4>
                <p className="text-ink-muted dark:text-gray-400">{problem.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-20">
          <Divider title="✨" className="max-w-2xl w-full" />
        </div>

        {/* Solutions Grid */}
        <div>
          <h3 className="text-2xl font-bold text-center text-ink dark:text-white mb-8">
            Nuestra Solución: Aprendizaje Personalizado con IA
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => (
              <Card
                key={index}
                variant="neutral"
                padding="lg"
                className="border-l-4 border-l-primary bg-primary/10 dark:bg-primary/10"
              >
                <div className="text-4xl mb-4">{solution.icon}</div>
                <h4 className="text-lg font-bold text-ink dark:text-white mb-2">
                  {solution.title}
                </h4>
                <p className="text-ink dark:text-gray-300">{solution.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card variant="primary" padding="lg" className="max-w-3xl mx-auto py-8">
            <h3 className="text-2xl font-bold mb-4">
              Deja de Perder Tiempo en Contenido Irrelevante
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Obtén una ruta personalizada basada en tu proyecto real en menos de 5 minutos.
            </p>
            <Button
              variant="outline"
              size="lg"
              href="/auth/signup"
              className="text-primary-dark dark:text-primary-dark bg-white dark:bg-white hover:bg-gray-100 dark:hover:bg-gray-100"
            >
              Crear Cuenta Gratis
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
