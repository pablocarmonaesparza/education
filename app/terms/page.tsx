/**
 * /terms — términos y condiciones estilo Apple/HIG.
 *
 * Cero imports del DS legacy de Itera Courses. Surface canvas + AuthNav + columna
 * estrecha de lectura. Hermana visual de /privacy.
 */

import type { Metadata } from "next";
import { AuthNav } from "@/components/simulador/AuthNav";
import "../(app)/simulador.css";

export const metadata: Metadata = {
  title: "Términos y condiciones · Itera",
  description:
    "Términos que rigen el uso del simulador de criterio de IA de Itera, sus diagnósticos, reportes y herramientas relacionadas.",
};

export default function TermsPage() {
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
            Términos y condiciones
          </h1>
          <p className="mt-4 text-[13px] text-[var(--text-tertiary)]">
            Última actualización · {currentDate}
          </p>

          <p className="mt-12 text-[17px] text-[var(--text-secondary)] leading-[1.6]">
            Estos términos rigen el uso del simulador de criterio de IA de
            Itera, sus diagnósticos, reportes y herramientas relacionadas para
            equipos. Al usar el servicio aceptas estos términos.
          </p>

          <section className="mt-16">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Uso del servicio
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Itera permite a usuarios y organizaciones ejecutar casos
              simulados, registrar respuestas, generar evidencia de desempeño y
              revisar recomendaciones operativas. Debes usar el servicio con
              información veraz y con autorización de tu organización cuando
              participes como parte de un equipo.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Cuentas y acceso
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Eres responsable de mantener segura tu cuenta. Las rutas de
              dashboard, casos, reportes y administración pueden requerir
              autenticación y permisos de equipo. Podemos suspender accesos ante
              uso indebido, abuso técnico o violación de estos términos.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Datos y evaluaciones
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Las respuestas dentro de los casos pueden ser usadas para generar
              reportes, bandas de desempeño, eventos de riesgo y recomendaciones
              para managers. Los reportes son señales de apoyo para decisión y
              entrenamiento; no sustituyen criterio humano, políticas internas
              ni revisión legal, de seguridad o compliance.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Pagos
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Los precios se muestran en USD y los pagos se procesan mediante
              Stripe. No almacenamos información completa de tarjetas. Los
              reembolsos se revisan caso por caso conforme al acuerdo comercial
              aplicable.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Propiedad intelectual
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Itera conserva los derechos sobre la plataforma, casos, rúbricas,
              reportes base, diseño, código y metodología. Tú conservas tus
              derechos sobre la información que nos proporcionas, otorgándonos
              una licencia limitada para operar, evaluar, mejorar y entregar el
              servicio contratado.
            </p>
          </section>

          <section className="mt-20 pt-10 border-t border-[var(--hairline)]">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              Contacto
            </h2>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              ¿Dudas sobre los términos? Escríbenos a{" "}
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
