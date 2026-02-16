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
            Bienvenido a Itera. Estos términos y condiciones ("Términos") rigen el uso de nuestra plataforma 
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
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300">
                <li>Generación de cursos personalizados basados en proyectos específicos del usuario</li>
                <li>Acceso a contenido educativo en formato de video</li>
                <li>Seguimiento de progreso y gamificación</li>
                <li>Herramientas de aprendizaje interactivas</li>
                <li>Soporte y tutoría mediante chat con IA</li>
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
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
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
            <Headline className="mb-4">4. propiedad intelectual y contenido</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Subtitle className="mb-3">4.1 Propiedad de Itera</Subtitle>
              <Body className="mb-4">
                Todos los derechos de propiedad intelectual sobre la plataforma, incluyendo pero no limitado a 
                el diseño, código fuente, logotipos, marcas comerciales, y contenido educativo creado por Itera, 
                son propiedad exclusiva de Itera o sus licenciantes.
              </Body>
              <Subtitle className="mb-3">4.2 Contenido del Usuario</Subtitle>
              <Body className="mb-3">
                Retienes todos los derechos sobre el contenido que creas o proporcionas a través de la plataforma 
                (como descripciones de proyectos, comentarios, etc.). Sin embargo, al utilizar nuestros servicios, 
                otorgas a Itera una licencia mundial, no exclusiva, libre de regalías para usar, reproducir, 
                modificar y distribuir dicho contenido únicamente para proporcionar y mejorar nuestros servicios.
              </Body>
              <Subtitle className="mb-3">4.3 Contenido Prohibido</Subtitle>
              <Body>
                No debes subir, publicar o transmitir contenido que sea ilegal, difamatorio, abusivo, acosador, 
                que viole derechos de propiedad intelectual, o que de cualquier otra manera viole estos Términos. 
                Nos reservamos el derecho de eliminar cualquier contenido que consideremos inapropiado.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">5. pagos y facturación</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Subtitle className="mb-3">5.1 Precios</Subtitle>
              <Body className="mb-4">
                Los precios de nuestros servicios se muestran en la plataforma y están sujetos a cambios sin 
                previo aviso. Todos los precios incluyen los impuestos aplicables, a menos que se indique lo contrario.
              </Body>
              <Subtitle className="mb-3">5.2 Procesamiento de Pagos</Subtitle>
              <Body className="mb-4">
                Los pagos se procesan a través de proveedores de servicios de pago de terceros (como Stripe y 
                MercadoPago). Al realizar un pago, aceptas los términos y condiciones de estos proveedores. 
                No almacenamos información completa de tarjetas de crédito en nuestros servidores.
              </Body>
              <Subtitle className="mb-3">5.3 Reembolsos</Subtitle>
              <Body className="mb-3">
                Nuestra política de reembolsos es la siguiente:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
                <li>Los reembolsos se consideran caso por caso dentro de los primeros 14 días de la compra</li>
                <li>No se otorgan reembolsos por contenido ya consumido o cursos completados</li>
                <li>Los reembolsos se procesarán al método de pago original dentro de 5-10 días hábiles</li>
              </ul>
              <Subtitle className="mb-3">5.4 Pagos Atrasados</Subtitle>
              <Body>
                Si un pago falla o se rechaza, nos reservamos el derecho de suspender o terminar tu acceso a 
                los servicios hasta que se resuelva el problema de pago.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">6. uso aceptable</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Al utilizar nuestros servicios, te comprometes a:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
                <li>Usar los servicios únicamente para fines legales y educativos</li>
                <li>No intentar acceder a áreas restringidas de la plataforma</li>
                <li>No interferir con el funcionamiento de la plataforma</li>
                <li>No usar bots, scripts automatizados o métodos similares para acceder a los servicios</li>
                <li>No compartir tu cuenta con terceros</li>
                <li>No intentar descargar o distribuir contenido de manera no autorizada</li>
                <li>Respetar los derechos de propiedad intelectual de otros</li>
              </ul>
              <Body>
                La violación de estas reglas puede resultar en la terminación inmediata de tu cuenta sin reembolso.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">7. limitación de responsabilidad</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                En la máxima medida permitida por la ley aplicable:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
                <li>Los servicios se proporcionan "tal cual" y "según disponibilidad" sin garantías de ningún tipo</li>
                <li>No garantizamos que los servicios estarán disponibles de manera ininterrumpida o libre de errores</li>
                <li>No seremos responsables de daños indirectos, incidentales, especiales o consecuentes</li>
                <li>Nuestra responsabilidad total no excederá el monto que hayas pagado por los servicios en los 
                    12 meses anteriores al evento que dio lugar a la reclamación</li>
              </ul>
              <Body>
                Algunas jurisdicciones no permiten la exclusión de garantías implícitas o la limitación de 
                responsabilidad por daños incidentales, por lo que algunas de las limitaciones anteriores pueden 
                no aplicarse a ti.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">8. indemnización</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body>
                Aceptas indemnizar, defender y mantener indemne a Itera, sus afiliados, directores, empleados 
                y agentes de y contra cualquier reclamación, responsabilidad, daño, pérdida o gasto (incluyendo 
                honorarios de abogados) que surja de o esté relacionado con tu uso de los servicios, tu violación 
                de estos Términos, o tu violación de cualquier derecho de otra persona.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">9. ley aplicable y jurisdicción</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body>
                Estos Términos se regirán e interpretarán de acuerdo con las leyes del país donde Itera opera, 
                sin dar efecto a ningún principio de conflictos de leyes. Cualquier disputa que surja de o esté 
                relacionada con estos Términos será sometida a la jurisdicción exclusiva de los tribunales 
                competentes en la ubicación de Itera.
              </Body>
            </Card>
          </section>

          <Divider />

          <section>
            <Headline className="mb-4">10. cambios en los términos</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body>
                Nos reservamos el derecho de modificar estos Términos en cualquier momento. Te notificaremos de 
                cambios materiales mediante un aviso en la plataforma o por correo electrónico. Tu uso continuado 
                de los servicios después de dichos cambios constituye tu aceptación de los nuevos términos.
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
                <strong>Email:</strong> legal@itera.com
              </Body>
              <Body>
                <strong>Dirección:</strong> [Dirección de la empresa]
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
