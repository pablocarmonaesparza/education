import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Title, Subtitle, Headline, Body, Caption } from '@/components/ui/Typography';
import Card from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <section className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <Title className="mb-4">términos y condiciones</Title>
          <Caption className="text-base">
            Última actualización: {currentDate}
          </Caption>
        </div>

        <Card variant="neutral" padding="lg" className="mb-6">
          <Body className="mb-4">
            Bienvenido a Itera. Estos términos y condiciones (&quot;Términos&quot;) rigen el uso de nuestra plataforma 
            de cursos personalizados de inteligencia artificial y automatización. Al acceder o utilizar nuestros 
            servicios, aceptas estar sujeto a estos Términos. Si no estás de acuerdo con alguna parte de estos 
            términos, no debes utilizar nuestros servicios.
          </Body>
        </Card>

        <div className="space-y-6">
          <section>
            <Headline className="mb-4">1. aceptación de los términos</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Al crear una cuenta, acceder o utilizar cualquier parte de la plataforma Itera, aceptas estos 
                Términos y nuestra Política de Privacidad. Si no aceptas estos términos, no debes utilizar nuestros 
                servicios.
              </Body>
              <Body>
                Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las modificaciones 
                entrarán en vigor cuando se publiquen en esta página. Tu uso continuado de los servicios después 
                de cualquier modificación constituye tu aceptación de los nuevos términos.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">2. descripción del servicio</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Itera es una plataforma SaaS que ofrece cursos personalizados de inteligencia artificial y 
                automatización generados mediante tecnología de IA. Nuestros servicios incluyen:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-ink dark:text-gray-300">
                <li>Generación de cursos personalizados basados en proyectos específicos del usuario</li>
                <li>Acceso a lecciones y ejercicios interactivos</li>
                <li>Seguimiento de progreso y gamificación</li>
                <li>Herramientas de aprendizaje interactivas</li>
                <li>Soporte y tutoría mediante chat con IA</li>
                <li>Publicación de contenido educativo en redes sociales (incluyendo TikTok)</li>
              </ul>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">3. registro y cuentas de usuario</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Subtitle className="mb-3">3.1 Creación de Cuenta</Subtitle>
              <Body className="mb-4">
                Para utilizar nuestros servicios, debes crear una cuenta proporcionando información precisa, 
                actualizada y completa. Eres responsable de mantener la confidencialidad de tu contraseña y 
                de todas las actividades que ocurran bajo tu cuenta.
              </Body>
              <Subtitle className="mb-3">3.2 Responsabilidades del Usuario</Subtitle>
              <Body className="mb-3">
                Te comprometes a:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-ink dark:text-gray-300 mb-4">
                <li>Proporcionar información veraz y actualizada</li>
                <li>Mantener la seguridad de tu cuenta y contraseña</li>
                <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
                <li>Ser responsable de todas las actividades bajo tu cuenta</li>
                <li>Cumplir con todas las leyes y regulaciones aplicables</li>
              </ul>
              <Subtitle className="mb-3">3.3 Terminación de Cuenta</Subtitle>
              <Body>
                Nos reservamos el derecho de suspender o terminar tu cuenta en cualquier momento, con o sin 
                causa, con o sin previo aviso, por cualquier motivo, incluyendo pero no limitado a violaciones 
                de estos Términos.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">4. integración con tiktok y terceros</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Itera se integra con servicios de terceros para mejorar la experiencia educativa:
              </Body>
              <Subtitle className="mb-3">4.1 TikTok</Subtitle>
              <Body className="mb-3">
                Itera utiliza la API de TikTok para permitirte publicar contenido educativo en tu perfil de TikTok. 
                Al conectar tu cuenta de TikTok:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-ink dark:text-gray-300 mb-4">
                <li>Autorizas a Itera a acceder a tu información básica de perfil (nombre, avatar)</li>
                <li>Autorizas a Itera a subir y publicar videos en tu perfil <strong>solo cuando tú lo solicites</strong></li>
                <li>Puedes revocar estos permisos en cualquier momento desde la configuración de tu cuenta o desde TikTok</li>
              </ul>
              <Body className="mb-4">
                El uso de TikTok está sujeto a los Términos de Servicio y Política de Privacidad de TikTok.
              </Body>
              <Subtitle className="mb-3">4.2 Otros Servicios</Subtitle>
              <ul className="list-disc list-inside space-y-2 ml-4 text-ink dark:text-gray-300">
                <li><strong>Stripe:</strong> procesamiento de pagos</li>
                <li><strong>Supabase:</strong> almacenamiento de datos y autenticación</li>
                <li><strong>Servicios de IA:</strong> personalización del aprendizaje</li>
              </ul>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">5. propiedad intelectual y contenido</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Subtitle className="mb-3">5.1 Propiedad de Itera</Subtitle>
              <Body className="mb-4">
                Todos los derechos de propiedad intelectual sobre la plataforma, incluyendo pero no limitado a 
                el diseño, código fuente, logotipos, marcas comerciales, y contenido educativo creado por Itera, 
                son propiedad exclusiva de Itera o sus licenciantes.
              </Body>
              <Subtitle className="mb-3">5.2 Contenido del Usuario</Subtitle>
              <Body className="mb-3">
                Retienes todos los derechos sobre el contenido que creas o proporcionas a través de la plataforma. 
                Al utilizar nuestros servicios, otorgas a Itera una licencia mundial, no exclusiva, libre de regalías 
                para usar, reproducir, modificar y distribuir dicho contenido únicamente para proporcionar y mejorar 
                nuestros servicios.
              </Body>
              <Subtitle className="mb-3">5.3 Contenido Prohibido</Subtitle>
              <Body>
                No debes subir, publicar o transmitir contenido que sea ilegal, difamatorio, abusivo, acosador, 
                que viole derechos de propiedad intelectual, o que de cualquier otra manera viole estos Términos.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">6. pagos y facturación</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Los precios se muestran en la plataforma. Los pagos se procesan a través de Stripe. No almacenamos
                información completa de tarjetas de crédito. Los reembolsos se consideran caso por caso dentro de
                los primeros 14 días de la compra.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">7. uso aceptable</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Al utilizar nuestros servicios, te comprometes a no usar la plataforma para fines ilegales, 
                no interferir con su funcionamiento, no usar herramientas automatizadas para extraer contenido, 
                y respetar los derechos de propiedad intelectual de otros. La violación puede resultar en la 
                terminación inmediata de tu cuenta.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">8. limitación de responsabilidad</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body>
                Los servicios se proporcionan &quot;tal cual&quot; y &quot;según disponibilidad&quot;. No garantizamos que los 
                servicios sean ininterrumpidos o libres de errores. En la máxima medida permitida por la ley, 
                no seremos responsables de daños indirectos, incidentales, especiales o consecuentes.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">9. ley aplicable y jurisdicción</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body>
                Estos Términos se regirán e interpretarán de conformidad con las leyes de los Estados Unidos 
                Mexicanos. Cualquier controversia derivada de estos Términos será sometida a la jurisdicción 
                de los tribunales competentes de la Ciudad de México, México.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">10. cambios en los términos</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body>
                Nos reservamos el derecho de modificar estos Términos en cualquier momento. Te notificaremos de 
                cambios materiales mediante un aviso en la plataforma o por correo electrónico.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">11. contacto</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Si tienes preguntas sobre estos Términos, puedes contactarnos:
              </Body>
              <Body className="mb-2">
                <strong>Email:</strong> pablo@itera.la
              </Body>
              <Body>
                <strong>Ubicación:</strong> Playa del Carmen, Quintana Roo, México
              </Body>
            </Card>
          </section>
        </div>

        <Card variant="neutral" padding="md" className="mt-8">
          <Body className="text-center">
            Al utilizar nuestros servicios, reconoces que has leído, entendido y aceptado estos Términos y Condiciones.
          </Body>
        </Card>
      </section>
      <Footer />
    </main>
  );
}
