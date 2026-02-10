import { Button, Card, ProgressBar, StatCard, Tag } from "@/components/ui";

export default function ExperimentHeroSection() {
  return (
    <section className="pt-32 pb-16 md:pt-36 md:pb-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <Tag variant="primary" className="mb-4">
              videos replaced by interactive practice
            </Tag>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white leading-tight">
              aprende con ejercicios cortos y feedback inmediato
            </h1>

            <p className="mt-5 text-lg text-[#4b4b4b] dark:text-gray-300 max-w-xl leading-relaxed">
              Esta demo muestra como se veria una pagina de aprendizaje centrada
              en practica: rutas por niveles, ejercicios activos, pistas
              inteligentes y habitos diarios.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                href="#ruta"
                variant="primary"
                depth="bottom"
                rounded2xl
                size="lg"
              >
                Ver ruta de ejercicios
              </Button>
              <Button
                href="#demo"
                variant="outline"
                rounded2xl
                size="lg"
              >
                Ir al demo interactivo
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard icon="🔥" value="7" label="Dias de racha" color="orange" />
              <StatCard icon="⚡" value="120" label="XP hoy" color="blue" />
              <StatCard icon="🎯" value="3/5" label="Meta diaria" color="green" />
            </div>
          </div>

          <Card variant="neutral" padding="lg" className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400">
                Flujo de sesion
              </p>
              <Tag variant="neutral">12 min promedio</Tag>
            </div>

            <ol className="space-y-4">
              <li className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1472FF]">
                  1. concepto en 45s
                </p>
                <p className="mt-1 text-sm text-[#4b4b4b] dark:text-gray-300">
                  Contexto minimo para resolver.
                </p>
              </li>
              <li className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1472FF]">
                  2. ejercicio guiado
                </p>
                <p className="mt-1 text-sm text-[#4b4b4b] dark:text-gray-300">
                  Respuesta activa con pista opcional.
                </p>
              </li>
              <li className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1472FF]">
                  3. retroalimentacion
                </p>
                <p className="mt-1 text-sm text-[#4b4b4b] dark:text-gray-300">
                  Explicacion clara + siguiente paso.
                </p>
              </li>
            </ol>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-[#4b4b4b] dark:text-gray-200">
                  Camino completado
                </p>
                <p className="text-sm font-bold text-[#1472FF]">36%</p>
              </div>
              <ProgressBar value={36} size="lg" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
