import { Button, Card, ProgressBar, SectionHeader, Tag } from "@/components/ui";

const units = [
  {
    title: "fundamentos del problema",
    goal: "Elegir el flujo correcto para automatizar.",
    drills: 6,
    xp: 90,
    progress: 100,
    status: "completado",
  },
  {
    title: "prompts y validaciones",
    goal: "Reducir errores con instrucciones robustas.",
    drills: 8,
    xp: 120,
    progress: 62,
    status: "en curso",
  },
  {
    title: "integraciones y APIs",
    goal: "Conectar acciones reales con baja friccion.",
    drills: 7,
    xp: 110,
    progress: 15,
    status: "pendiente",
  },
  {
    title: "proyecto final guiado",
    goal: "Construir el flujo completo end-to-end.",
    drills: 5,
    xp: 180,
    progress: 0,
    status: "bloqueado",
  },
];

export default function ExperimentPathSection() {
  return (
    <section id="ruta" className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="ruta de practica"
          subtitle="inspirado en path progresivo: una sola siguiente accion, avance visible y dificultad incremental."
          action={
            <Tag variant="outline" className="hidden md:inline-flex">
              26 ejercicios totales
            </Tag>
          }
        />

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 items-start">
          <div className="space-y-4">
            {units.map((unit, index) => {
              const statusTag =
                unit.status === "completado"
                  ? { label: "Completado", variant: "success" as const }
                  : unit.status === "en curso"
                    ? { label: "En curso", variant: "primary" as const }
                    : unit.status === "pendiente"
                      ? { label: "Pendiente", variant: "neutral" as const }
                      : { label: "Bloqueado", variant: "warning" as const };

              return (
                <Card key={unit.title} variant="neutral" padding="lg" className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#1472FF]">
                        Unidad {index + 1}
                      </p>
                      <h3 className="text-xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white mt-1">
                        {unit.title}
                      </h3>
                    </div>
                    <Tag variant={statusTag.variant}>{statusTag.label}</Tag>
                  </div>

                  <p className="text-sm text-[#4b4b4b] dark:text-gray-300">
                    {unit.goal}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                      <p className="text-xs uppercase font-bold tracking-wide text-[#777777] dark:text-gray-400">
                        Ejercicios
                      </p>
                      <p className="text-lg font-extrabold text-[#4b4b4b] dark:text-white">
                        {unit.drills}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                      <p className="text-xs uppercase font-bold tracking-wide text-[#777777] dark:text-gray-400">
                        XP
                      </p>
                      <p className="text-lg font-extrabold text-[#4b4b4b] dark:text-white">
                        {unit.xp}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                      <p className="text-xs uppercase font-bold tracking-wide text-[#777777] dark:text-gray-400">
                        Dominio
                      </p>
                      <p className="text-lg font-extrabold text-[#4b4b4b] dark:text-white">
                        {unit.progress}%
                      </p>
                    </div>
                  </div>

                  <ProgressBar value={unit.progress} size="md" />
                </Card>
              );
            })}
          </div>

          <Card variant="primary" padding="lg" className="space-y-5 xl:sticky xl:top-24">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">
              siguiente accion recomendada
            </p>
            <h3 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
              ejercicio 2.4: prompt con verificacion
            </h3>
            <p className="text-sm text-white/90 leading-relaxed">
              Practica en 4 pasos: identificar error, ajustar instruccion,
              validar salida y repetir con un caso borde.
            </p>

            <ul className="space-y-2 text-sm text-white/90">
              <li>• Duracion estimada: 6 minutos</li>
              <li>• Recompensa: +25 XP</li>
              <li>• Si fallas, se desbloquea pista contextual</li>
            </ul>

            <Button
              href="#demo"
              variant="secondary"
              rounded2xl
              className="w-full justify-center"
            >
              empezar ahora
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
