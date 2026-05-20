const adminSections = [
  {
    title: "leads",
    description: "capturas del field-test y solicitudes comerciales listas para revisar.",
    status: "activo en backend",
  },
  {
    title: "review queue",
    description: "sesiones con riesgo alto que requieren revisión humana antes de publicarse.",
    status: "activo en backend",
  },
  {
    title: "orgs",
    description: "estado operativo de organizaciones, equipos y actividad reciente.",
    status: "activo en backend",
  },
  {
    title: "judge health",
    description: "señales de latencia, calibración y errores del evaluador.",
    status: "activo en backend",
  },
];

export default function AdminIndexPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="space-y-3">
        <div className="text-xs uppercase tracking-widest text-gray-500">admin itera</div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              operación del simulador
            </h1>
            <p className="max-w-2xl leading-7 text-gray-700 dark:text-gray-300">
              Entrada única del backoffice. Las subrutas antiguas quedaron en bodega durante el cleanroom; esta pantalla será la base del admin visual nuevo.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
            cleanroom front
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {adminSections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {section.description}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-full border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                {section.status}
              </span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
