import Footer from '@/components/shared/Footer';
import { Title, Subtitle, Headline, Body, Caption } from '@/components/ui/Typography';
import Card from '@/components/ui/Card';

export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <section className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <Title className="mb-4">política de privacidad</Title>
          <Caption className="text-base">Última actualización: {currentDate}</Caption>
        </div>

        <Card variant="neutral" padding="lg" className="mb-6">
          <Body className="mb-4">
            Itera protege la información de personas y equipos que usan nuestro simulador de
            criterio de IA. Esta política explica qué recopilamos, para qué lo usamos y cómo
            puedes solicitar acceso, corrección o eliminación.
          </Body>
          <Body>
            El field-test público guarda respuestas por tiempo limitado para analizar el diagnóstico.
            Los flujos autenticados pueden guardar respuestas, eventos de sesión, reportes y datos
            de equipo necesarios para operar el producto.
          </Body>
        </Card>

        <div className="space-y-6">
          <section>
            <Headline className="mb-4">1. información que recopilamos</Headline>
            <Card variant="neutral" padding="md">
              <ul className="list-disc list-inside space-y-2 ml-4 text-ink dark:text-gray-300">
                <li>Datos de cuenta: nombre, correo, autenticación y organización.</li>
                <li>Datos de simulación: respuestas, decisiones, tiempos, eventos y reportes.</li>
                <li>Datos técnicos: IP, navegador, dispositivo, cookies esenciales y logs de seguridad.</li>
                <li>Datos de pago: procesados por Stripe; no almacenamos tarjetas completas.</li>
              </ul>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">2. cómo usamos la información</Headline>
            <Card variant="neutral" padding="md">
              <Body>
                Usamos la información para ejecutar casos, generar reportes, administrar equipos,
                mejorar rúbricas, prevenir abuso, dar soporte y cumplir obligaciones legales. No vendemos
                datos personales.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">3. proveedores</Headline>
            <Card variant="neutral" padding="md">
              <Body>
                Podemos usar proveedores como Supabase, Stripe, servicios de email, hosting, analytics
                y modelos de IA para operar el servicio. Estos proveedores reciben solo la información
                necesaria para cumplir su función.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">4. retención y eliminación</Headline>
            <Card variant="neutral" padding="md">
              <Body>
                Conservamos datos mientras sea necesario para operar el servicio, cumplir contratos,
                resolver soporte o cumplir obligaciones legales. Puedes pedir eliminación o acceso
                escribiendo a pablo@itera.la.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">5. seguridad</Headline>
            <Card variant="neutral" padding="md">
              <Body>
                Aplicamos controles técnicos y organizativos razonables: autenticación, permisos por rol,
                cifrado en tránsito, controles de acceso y monitoreo. Ningún sistema conectado a internet
                puede garantizar seguridad absoluta.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">6. contacto</Headline>
            <Card variant="neutral" padding="md">
              <Subtitle className="mb-2">Itera</Subtitle>
              <Body>Email: pablo@itera.la</Body>
            </Card>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
