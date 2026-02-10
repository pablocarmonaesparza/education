import { Card, SectionHeader, StatCard, Tag } from "@/components/ui";

const reviewQueue = [
  { topic: "Prompts con guardrails", due: "Hoy", priority: "Alta" },
  { topic: "Normalizacion de inputs", due: "Manana", priority: "Media" },
  { topic: "Errores de timeout API", due: "En 3 dias", priority: "Media" },
];

export default function ExperimentHabitSection() {
  return (
    <section id="habito" className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="sistema de habito"
          subtitle="duolingo y mimo priorizan constancia diaria: metas chicas, racha visible y recordatorio de repaso."
          action={<Tag variant="outline">Rutina de 10-15 min</Tag>}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card variant="neutral" padding="lg" className="lg:col-span-2 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400">
              cola de revision espaciada
            </p>

            <div className="space-y-3">
              {reviewQueue.map((item) => (
                <div
                  key={item.topic}
                  className="rounded-2xl border-2 border-b-4 border-gray-200 dark:border-gray-700 p-4 bg-white/80 dark:bg-gray-800/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-extrabold tracking-tight text-[#4b4b4b] dark:text-white">
                      {item.topic}
                    </h3>
                    <Tag
                      variant={item.priority === "Alta" ? "warning" : "neutral"}
                    >
                      {item.priority}
                    </Tag>
                  </div>
                  <p className="mt-1 text-sm text-[#4b4b4b] dark:text-gray-300">
                    Proximo repaso: {item.due}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <StatCard icon="🔥" value="7" label="Racha actual" color="orange" />
            <StatCard icon="🎯" value="5/5" label="Meta diaria" color="green" />
            <StatCard icon="🧠" value="3" label="Reviews hoy" color="blue" />
          </div>
        </div>
      </div>
    </section>
  );
}
