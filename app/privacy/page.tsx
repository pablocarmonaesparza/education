import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Title, Subtitle, Headline, Body, Caption } from '@/components/ui/Typography';
import Card from '@/components/ui/Card';

export default function PrivacyPage() {
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
          <Title className="mb-4">política de privacidad</Title>
          <Caption className="text-base">
            Última actualización: {currentDate}
          </Caption>
        </div>

        <Card variant="neutral" padding="lg" className="mb-6">
          <Body className="mb-4">
            En Itera, nos comprometemos a proteger tu privacidad y tus datos personales. Esta Política de 
            Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos tu información personal 
            cuando utilizas nuestra plataforma de cursos personalizados de inteligencia artificial.
          </Body>
          <Body>
            Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política. Si no estás 
            de acuerdo con esta política, por favor no utilices nuestros servicios.
          </Body>
        </Card>

        <div className="space-y-6">
          <section>
            <Headline className="mb-4">1. información que recopilamos</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Subtitle className="mb-3">1.1 Información que Proporcionas</Subtitle>
              <Body className="mb-3">
                Recopilamos información que nos proporcionas directamente, incluyendo:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
                <li><strong>Información de cuenta:</strong> nombre, dirección de correo electrónico, contraseña 
                    (encriptada), y foto de perfil</li>
                <li><strong>Información de perfil:</strong> descripción de proyectos, preferencias de aprendizaje, 
                    y objetivos educativos</li>
                <li><strong>Información de pago:</strong> procesada a través de proveedores de terceros (Stripe, 
                    MercadoPago). No almacenamos información completa de tarjetas de crédito</li>
                <li><strong>Contenido generado:</strong> descripciones de proyectos, interacciones con el tutor de IA, 
                    comentarios y feedback</li>
              </ul>
              <Subtitle className="mb-3">1.2 Información Recopilada Automáticamente</Subtitle>
              <Body className="mb-3">
                Cuando utilizas nuestros servicios, recopilamos automáticamente:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
                <li><strong>Datos de uso:</strong> páginas visitadas, tiempo de permanencia, videos visualizados, 
                    progreso en cursos</li>
                <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo, 
                    dispositivo utilizado</li>
                <li><strong>Cookies y tecnologías similares:</strong> utilizamos cookies para mejorar tu experiencia 
                    y analizar el uso de la plataforma</li>
                <li><strong>Datos de gamificación:</strong> XP ganado, niveles alcanzados, rachas de días, 
                    logros desbloqueados</li>
              </ul>
              <Subtitle className="mb-3">1.3 Información de Terceros</Subtitle>
              <Body>
                Podemos recibir información sobre ti de proveedores de servicios de terceros, como servicios de 
                autenticación (Google OAuth) y proveedores de análisis, siempre de acuerdo con sus políticas de 
                privacidad.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">2. cómo utilizamos tu información</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Utilizamos la información recopilada para los siguientes propósitos:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
                <li><strong>Proporcionar servicios:</strong> generar cursos personalizados, gestionar tu cuenta, 
                    procesar pagos y proporcionar soporte</li>
                <li><strong>Mejorar nuestros servicios:</strong> analizar el uso de la plataforma para mejorar 
                    la experiencia del usuario y desarrollar nuevas funcionalidades</li>
                <li><strong>Comunicación:</strong> enviarte actualizaciones sobre tu progreso, notificaciones 
                    importantes y respuestas a tus consultas</li>
                <li><strong>Personalización:</strong> adaptar el contenido educativo a tus necesidades y preferencias</li>
                <li><strong>Seguridad:</strong> detectar y prevenir fraudes, abusos y actividades no autorizadas</li>
                <li><strong>Cumplimiento legal:</strong> cumplir con obligaciones legales y responder a solicitudes 
                    legales</li>
              </ul>
              <Body>
                <strong>Base legal (GDPR):</strong> Procesamos tus datos personales basándonos en tu consentimiento, 
                la ejecución de un contrato, el cumplimiento de obligaciones legales, y nuestros intereses legítimos 
                de mejorar nuestros servicios y mantener la seguridad de la plataforma.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">3. compartir tu información</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                No vendemos tu información personal. Compartimos tu información únicamente en las siguientes 
                circunstancias:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
                <li><strong>Proveedores de servicios:</strong> con terceros que nos ayudan a operar nuestra plataforma 
                    (hosting, procesamiento de pagos, análisis, autenticación). Estos proveedores están obligados 
                    contractualmente a proteger tu información</li>
                <li><strong>Cumplimiento legal:</strong> cuando sea requerido por ley, orden judicial o proceso legal</li>
                <li><strong>Protección de derechos:</strong> para proteger nuestros derechos, propiedad o seguridad, 
                    o la de nuestros usuarios</li>
                <li><strong>Con tu consentimiento:</strong> cuando nos hayas dado permiso explícito para compartir 
                    tu información</li>
                <li><strong>Transferencias comerciales:</strong> en caso de fusión, adquisición o venta de activos, 
                    tu información puede ser transferida como parte de la transacción</li>
              </ul>
              <Subtitle className="mb-3">3.1 Transferencias Internacionales</Subtitle>
              <Body>
                Tus datos pueden ser transferidos y procesados en países fuera del Espacio Económico Europeo (EEE). 
                Cuando realizamos transferencias internacionales, implementamos salvaguardas apropiadas, incluyendo 
                cláusulas contractuales estándar aprobadas por la Comisión Europea, para garantizar que tus datos 
                reciban un nivel adecuado de protección.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">4. almacenamiento y seguridad</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Subtitle className="mb-3">4.1 Retención de Datos</Subtitle>
              <Body className="mb-4">
                Conservamos tu información personal durante el tiempo necesario para cumplir con los propósitos 
                descritos en esta política, a menos que la ley requiera o permita un período de retención más largo. 
                Cuando elimines tu cuenta, eliminaremos o anonimizaremos tu información personal, excepto cuando 
                estemos legalmente obligados a conservarla.
              </Body>
              <Subtitle className="mb-3">4.2 Seguridad</Subtitle>
              <Body className="mb-3">
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información 
                personal contra acceso no autorizado, alteración, divulgación o destrucción, incluyendo:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
                <li>Encriptación de datos en tránsito y en reposo</li>
                <li>Autenticación segura y gestión de contraseñas</li>
                <li>Acceso restringido a datos personales solo para personal autorizado</li>
                <li>Monitoreo regular de sistemas para detectar vulnerabilidades</li>
                <li>Copias de seguridad regulares y planes de recuperación ante desastres</li>
              </ul>
              <Body>
                Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. 
                Aunque nos esforzamos por proteger tu información, no podemos garantizar seguridad absoluta.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">5. tus derechos (GDPR y otras leyes de privacidad)</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Dependiendo de tu ubicación, tienes los siguientes derechos respecto a tus datos personales:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
                <li><strong>Derecho de acceso:</strong> puedes solicitar una copia de los datos personales que 
                    tenemos sobre ti</li>
                <li><strong>Derecho de rectificación:</strong> puedes solicitar que corrijamos información 
                    inexacta o incompleta</li>
                <li><strong>Derecho al olvido:</strong> puedes solicitar que eliminemos tus datos personales en 
                    ciertas circunstancias</li>
                <li><strong>Derecho a la limitación del procesamiento:</strong> puedes solicitar que limitemos 
                    cómo procesamos tus datos</li>
                <li><strong>Derecho a la portabilidad de datos:</strong> puedes solicitar que transfiramos tus 
                    datos a otro proveedor de servicios</li>
                <li><strong>Derecho de oposición:</strong> puedes oponerte al procesamiento de tus datos para 
                    ciertos fines</li>
                <li><strong>Derecho a retirar el consentimiento:</strong> cuando el procesamiento se basa en tu 
                    consentimiento, puedes retirarlo en cualquier momento</li>
              </ul>
              <Body className="mb-3">
                Para ejercer estos derechos, puedes contactarnos en privacy@itera.com. Responderemos a tu solicitud 
                dentro de un plazo razonable y de acuerdo con la ley aplicable.
              </Body>
              <Body>
                También tienes derecho a presentar una queja ante la autoridad de protección de datos de tu país si 
                consideras que hemos violado tus derechos de privacidad.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">6. cookies y tecnologías de seguimiento</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Utilizamos cookies y tecnologías similares para:
              </Body>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#4b4b4b] dark:text-gray-300 mb-4">
                <li><strong>Cookies esenciales:</strong> necesarias para el funcionamiento básico de la plataforma</li>
                <li><strong>Cookies de funcionalidad:</strong> para recordar tus preferencias y mejorar tu experiencia</li>
                <li><strong>Cookies de análisis:</strong> para entender cómo los usuarios interactúan con nuestra plataforma</li>
                <li><strong>Cookies de marketing:</strong> para personalizar contenido y medir la efectividad de campañas</li>
              </ul>
              <Body>
                Puedes controlar y gestionar las cookies a través de la configuración de tu navegador. Ten en cuenta 
                que deshabilitar ciertas cookies puede afectar la funcionalidad de la plataforma.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">7. privacidad de menores</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body>
                Nuestros servicios están dirigidos a usuarios mayores de 18 años. No recopilamos intencionalmente 
                información personal de menores de 18 años. Si descubrimos que hemos recopilado información de un 
                menor sin el consentimiento de los padres, tomaremos medidas para eliminar esa información 
                inmediatamente. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información personal, 
                contáctanos en privacy@itera.com.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">8. cambios a esta política</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body>
                Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras 
                prácticas o por razones legales, operativas o regulatorias. Te notificaremos de cambios materiales 
                mediante un aviso prominente en la plataforma o por correo electrónico. La fecha de "Última 
                actualización" en la parte superior de esta página indica cuándo se realizó la última revisión. 
                Te recomendamos revisar esta política periódicamente.
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">9. información de contacto</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Body className="mb-3">
                Si tienes preguntas, preocupaciones o solicitudes relacionadas con esta Política de Privacidad o 
                el procesamiento de tus datos personales, puedes contactarnos:
              </Body>
              <Body className="mb-2">
                <strong>Email de Privacidad:</strong> privacy@itera.com
              </Body>
              <Body className="mb-2">
                <strong>Email General:</strong> support@itera.com
              </Body>
              <Body>
                <strong>Dirección:</strong> [Dirección de la empresa]
              </Body>
            </Card>
          </section>

          <section>
            <Headline className="mb-4">10. información específica por región</Headline>
            <Card variant="neutral" padding="md" className="mb-4">
              <Subtitle className="mb-3">10.1 Usuarios del Espacio Económico Europeo (EEE)</Subtitle>
              <Body className="mb-4">
                Si eres residente del EEE, tienes derechos adicionales bajo el Reglamento General de Protección 
                de Datos (GDPR). Esta política cumple con los requisitos del GDPR. Tu información se procesa 
                según las bases legales descritas en la Sección 2.
              </Body>
              <Subtitle className="mb-3">10.2 Usuarios de California (CCPA)</Subtitle>
              <Body className="mb-4">
                Si eres residente de California, tienes derechos adicionales bajo la Ley de Privacidad del 
                Consumidor de California (CCPA), incluyendo el derecho a saber qué información personal recopilamos, 
                el derecho a solicitar la eliminación de tu información personal, y el derecho a optar por no 
                vender tu información personal (aunque no vendemos información personal).
              </Body>
              <Subtitle className="mb-3">10.3 Usuarios de otros países</Subtitle>
              <Body>
                Respetamos las leyes de privacidad aplicables en tu jurisdicción. Si tienes preguntas sobre cómo 
                se aplican estas leyes a tu información, contáctanos.
              </Body>
            </Card>
          </section>
        </div>

        <Card variant="neutral" padding="md" className="mt-8">
          <Body className="text-center">
            Al utilizar nuestros servicios, reconoces que has leído y entendido esta Política de Privacidad y 
            consientes el procesamiento de tus datos personales según se describe aquí.
          </Body>
        </Card>
      </section>
      <Footer />
    </main>
  );
}
