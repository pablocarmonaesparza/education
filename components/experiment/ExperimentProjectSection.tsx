import { Button, Card, ProgressBar, SectionHeader, Tag } from "@/components/ui";

const checkpoints = [
  {
    name: "Configurar webhook y trigger",
    progress: 100,
    note: "Conecta entrada de datos y validacion inicial.",
  },
  {
    name: "Procesar respuesta con guardrails",
    progress: 70,
    note: "Evalua salida y bloquea respuestas sin evidencia.",
  },
  {
    name: "Enviar resultado a canal final",
    progress: 25,
    note: "Publica estado final y registra metricas.",
  },
];

export default function ExperimentProjectSection() {
  return (
    <section id="proyecto" className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="proyecto aplicado"
          subtitle="inspirado en mimo: cada bloque de teoria termina en una accion real de codigo o automatizacion."
          action={<Tag variant="primary">Build by doing</Tag>}
        />

        <Card variant="neutral" padding="lg" className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#1472FF]">
                Sprint activo
              </p>
              <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white">
                asistente de soporte con RAG
              </h3>
              <p className="mt-2 text-sm text-[#4b4b4b] dark:text-gray-300 max-w-2xl">
                El alumno no consume un bloque largo de video: completa micro
                ejercicios y avanza un checkpoint verificable del proyecto.
              </p>
            </div>

            <Button variant="primary" depth="full" rounded2xl>
              ejecutar checkpoint
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {checkpoints.map((checkpoint) => (
              <div
                key={checkpoint.name}
                className="rounded-2xl border-2 border-b-4 border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
              >
                <h4 className="text-base font-extrabold tracking-tight text-[#4b4b4b] dark:text-white">
                  {checkpoint.name}
                </h4>
                <p className="mt-2 text-sm text-[#4b4b4b] dark:text-gray-300 min-h-[40px]">
                  {checkpoint.note}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[#777777] dark:text-gray-400 mb-1">
                    <span>Progreso</span>
                    <span>{checkpoint.progress}%</span>
                  </div>
                  <ProgressBar value={checkpoint.progress} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
