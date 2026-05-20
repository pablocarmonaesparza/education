import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import { Body, Caption, Headline, Title } from "@/components/ui/Typography";

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
        <Headline>admin itera</Headline>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Title>operación del simulador</Title>
            <Body className="max-w-2xl leading-7">
              Entrada única del backoffice. Las subrutas antiguas quedaron en
              bodega durante el cleanroom; esta pantalla será la base del admin
              visual nuevo.
            </Body>
          </div>
          <Tag variant="neutral">cleanroom front</Tag>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {adminSections.map((section) => (
          <Card key={section.title} padding="lg">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Title as="h2" className="text-xl">
                  {section.title}
                </Title>
                <Caption className="text-sm leading-6">{section.description}</Caption>
              </div>
              <Tag variant="outline" className="shrink-0">
                {section.status}
              </Tag>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
