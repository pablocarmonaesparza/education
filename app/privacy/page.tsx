/**
 * /privacy — política de privacidad estilo Apple/HIG.
 *
 * Cero imports del DS legacy de Itera Courses (Card, Typography, Footer, etc).
 * Layout: surface-canvas + AuthNav minimal + columna estrecha de lectura con
 * jerarquía tipográfica sutil. Mismo lenguaje visual que /auth/*.
 */

import type { Metadata } from "next";
import { AuthNav } from "@/components/simulador/AuthNav";
import "../(app)/simulador.css";

export const metadata: Metadata = {
  title: "Política de privacidad · Itera",
  description:
    "Cómo Itera recopila, usa y protege la información de personas y equipos que usan el simulador.",
};

export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <AuthNav mode="login" next="/" />

      <main className="px-6 pb-24 pt-12 sm:pt-20">
        <article className="max-w-[640px] mx-auto">
          <h1 className="display display-tight text-[var(--text-primary)] text-[36px] sm:text-[44px] leading-[1.05]">
            Política de privacidad
          </h1>
          <p className="mt-4 text-[13px] text-[var(--text-tertiary)]">
            Última actualización · {currentDate}
          </p>

          <p className="mt-12 text-[17px] text-[var(--text-secondary)] leading-[1.6]">
            Itera protege la información de las personas y los equipos que usan
            nuestro simulador de criterio de IA. Esta política explica qué
            recopilamos, para qué lo usamos y cómo puedes solicitar acceso,
            corrección o eliminación.
          </p>

          <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.6]">
            El field-test público guarda respuestas por tiempo limitado para
            analizar el diagnóstico. Los flujos autenticados pueden guardar
            respuestas, eventos de sesión, reportes y datos de equipo necesarios
            para operar el producto.
          </p>

          <section className="mt-16">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Información que recopilamos
            </h2>
            <ul className="mt-5 space-y-3 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              <li>
                <span className="text-[var(--text-primary)] font-medium">
                  Datos de cuenta
                </span>{" "}
                · nombre, correo, autenticación y organización.
              </li>
              <li>
                <span className="text-[var(--text-primary)] font-medium">
                  Datos de simulación
                </span>{" "}
                · respuestas, decisiones, tiempos, eventos y reportes.
              </li>
              <li>
                <span className="text-[var(--text-primary)] font-medium">
                  Datos técnicos
                </span>{" "}
                · IP, navegador, dispositivo, cookies esenciales y logs de
                seguridad.
              </li>
              <li>
                <span className="text-[var(--text-primary)] font-medium">
                  Datos de pago
                </span>{" "}
                · procesados por Stripe. No almacenamos tarjetas completas.
              </li>
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Cómo usamos la información
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Usamos la información para ejecutar casos, generar reportes,
              administrar equipos, mejorar rúbricas, prevenir abuso, dar soporte
              y cumplir obligaciones legales. No vendemos datos personales.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Proveedores
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Podemos usar proveedores como Supabase, Stripe, servicios de
              email, hosting, analytics y modelos de IA para operar el servicio.
              Estos proveedores reciben solo la información necesaria para
              cumplir su función.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Retención y eliminación
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Conservamos datos mientras sea necesario para operar el servicio,
              cumplir contratos, resolver soporte o cumplir obligaciones
              legales. Puedes pedir eliminación o acceso escribiendo a{" "}
              <a
                href="mailto:pablo@itera.la"
                className="text-[var(--accent)] underline hover:opacity-70 transition-opacity"
              >
                pablo@itera.la
              </a>
              .
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Seguridad
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Aplicamos controles técnicos y organizativos razonables:
              autenticación, permisos por rol, cifrado en tránsito, controles de
              acceso y monitoreo. Ningún sistema conectado a internet puede
              garantizar seguridad absoluta.
            </p>
          </section>

          <section className="mt-20 pt-10 border-t border-[var(--hairline)]">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Contacto
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              ¿Preguntas o solicitudes sobre tus datos? Escríbenos a{" "}
              <a
                href="mailto:pablo@itera.la"
                className="text-[var(--accent)] underline hover:opacity-70 transition-opacity"
              >
                pablo@itera.la
              </a>
              .
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
