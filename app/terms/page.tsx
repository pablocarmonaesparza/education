import Footer from '@/components/shared/Footer';
import { Title, Subtitle, Headline, Body, Caption } from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <section className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <Title className="mb-4">términos y condiciones</Title>
          <Caption className="text-base">Última actualización: {currentDate}</Caption>
        </div>

        <Card variant="neutral" padding="lg" className="mb-6">
          <Body>
            Bienvenido a Itera. Estos términos rigen el uso del simulador de criterio de IA,
            sus diagnósticos, reportes y herramientas relacionadas para equipos.
          </Body>
        </Card>

        <div className="space-y-6">
          <section>
            <Headline className="mb-4">1. uso del servicio</Headline>
            <Card variant="neutral" padding="md">
              <Body>
                Itera permite a usuarios y organizaciones ejecutar casos simulados, registrar
                respuestas, generar evidencia de desempeño y revisar recomendaciones operativas.
                Debes usar el servicio con información veraz y con autorización de tu organización
                cuando participes como parte de un equipo.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">2. cuentas y acceso</Headline>
            <Card variant="neutral" padding="md">
              <Body>
                Eres responsable de mantener segura tu cuenta. Las rutas de dashboard, casos,
                reportes y administración pueden requerir autenticación y permisos de equipo.
                Podemos suspender accesos ante uso indebido, abuso técnico o violación de estos términos.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">3. datos y evaluaciones</Headline>
            <Card variant="neutral" padding="md">
              <Body>
                Las respuestas dentro de los casos pueden ser usadas para generar reportes,
                bandas de desempeño, eventos de riesgo y recomendaciones para managers. Los reportes
                son señales de apoyo para decisión y entrenamiento; no sustituyen criterio humano,
                políticas internas ni revisión legal, de seguridad o compliance.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">4. pagos</Headline>
            <Card variant="neutral" padding="md">
              <Body>
                Los precios se muestran en USD y los pagos se procesan mediante Stripe. No almacenamos
                información completa de tarjetas. Los reembolsos se revisan caso por caso conforme al
                acuerdo comercial aplicable.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">5. propiedad intelectual</Headline>
            <Card variant="neutral" padding="md">
              <Body>
                Itera conserva los derechos sobre la plataforma, casos, rúbricas, reportes base,
                diseño, código y metodología. Tú conservas tus derechos sobre la información que
                nos proporcionas, otorgándonos una licencia limitada para operar, evaluar, mejorar
                y entregar el servicio contratado.
              </Body>
            </Card>
          </section>

          <Divider />

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
