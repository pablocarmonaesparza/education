import ProgressCard from '@/components/dashboard/ProgressCard';
import CourseCard from '@/components/dashboard/CourseCard';
import Link from 'next/link';

export const metadata = {
  title: 'Demo Dashboard | IA & Automatización',
  description: 'Vista previa del dashboard del estudiante',
};

export default function DemoPage() {
  const sections = [
    {
      id: '1',
      title: 'Fundamentos de IA',
      description: 'Conceptos básicos, tipos de IA, modelos de lenguaje, y casos de uso.',
      icon: '🧠',
      videoCount: 25,
      duration: '45-60 min',
      progress: 0,
    },
    {
      id: '2',
      title: 'Prompt Engineering',
      description: 'Técnicas avanzadas para comunicarte efectivamente con modelos de IA.',
      icon: '✍️',
      videoCount: 35,
      duration: '60-75 min',
      progress: 0,
    },
    {
      id: '3',
      title: 'APIs y Automatización',
      description: 'Integra IA en tus workflows usando APIs de Claude, GPT y más.',
      icon: '🔌',
      videoCount: 40,
      duration: '90-120 min',
      progress: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] text-white py-3 px-4 text-center">
        <p className="text-sm">
          📺 <strong>VISTA DEMO</strong> - Esta es una vista previa del dashboard. {' '}
          <Link href="/auth/signup" className="underline font-semibold">
            Crea tu cuenta
          </Link>{' '}
          para acceder al curso completo.
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido al Dashboard! 👋
          </h1>
          <p className="text-gray-600">
            Así es como se ve tu panel de estudiante
          </p>
        </div>

        {/* Progress Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ProgressCard
            title="Videos Vistos"
            progress={0}
            total={366}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          />
          <ProgressCard
            title="Módulos Completados"
            progress={0}
            total={12}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <ProgressCard
            title="Checkpoints"
            progress={0}
            total={24}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          />
        </div>

        {/* Continue Learning */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Continúa Aprendiendo</h2>
          <div className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Comienza tu primera lección</h3>
                <p className="opacity-90">
                  Empieza con Fundamentos de IA y conoce el mundo de la inteligencia artificial
                </p>
              </div>
              <Link
                href="/demo/video"
                className="bg-white text-[#1472FF] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Ver Demo de Video
              </Link>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulos del Curso</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <CourseCard key={section.id} {...section} />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-3xl font-bold text-[#1472FF] mb-2">366</div>
            <div className="text-sm text-gray-600">Videos Totales</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-3xl font-bold text-[#1472FF] mb-2">12</div>
            <div className="text-sm text-gray-600">Módulos</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-3xl font-bold text-[#1472FF] mb-2">10-20h</div>
            <div className="text-sm text-gray-600">Duración Total</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-3xl font-bold text-[#1472FF] mb-2">100%</div>
            <div className="text-sm text-gray-600">Personalizado</div>
          </div>
        </div>

        {/* CTA to signup */}
        <div className="mt-12 text-center bg-white rounded-lg shadow-md p-8 border border-[#1472FF]/20">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Listo para comenzar tu aprendizaje?
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu cuenta gratis y accede a todo el contenido del curso
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              href="/auth/login"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
