import type { ReactNode } from "react";
import { legalCopy } from "@/lib/simulador/copy/legal";
import { AppleLink } from "@/components/simulador/apple";
import "../(app)/simulador.css";

/**
 * /terms — Términos de servicio.
 *
 * El contenido NO vive aquí: se renderiza desde la fuente canónica
 * `lib/simulador/copy/legal.ts` (legalCopy.terms_of_service). Editar el
 * texto legal se hace en ese archivo y esta página lo refleja.
 */

const { terms_of_service: tos, footer_disclaimer } = legalCopy;

const isEmail = (s: string) =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(s);

/** Convierte los emails dentro de un texto en AppleLink mailto. */
function withEmails(text: string): ReactNode[] {
  return text
    .split(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g)
    .map((part, i) =>
      isEmail(part) ? (
        <AppleLink key={i} href={`mailto:${part}`}>
          {part}
        </AppleLink>
      ) : (
        part
      ),
    );
}

export default function TermsPage() {
  return (
    <div className="simulador-root min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <main className="mx-auto max-w-[720px] px-6 py-16 sm:py-20">
        <h1 className="display display-tight text-[28px] sm:text-[32px] leading-[1.1] text-[var(--text-primary)]">
          {tos.headline}.
        </h1>
        <p className="mt-3 ts-footnote text-[var(--text-tertiary)]">
          Última actualización: {tos.last_updated}
        </p>

        <div className="mt-12 space-y-8">
          {tos.sections.map((s) => (
            <section key={s.title}>
              <h2 className="ts-headline font-semibold text-[var(--text-primary)]">
                {s.title}
              </h2>
              <p className="mt-2 ts-body leading-[1.6] text-[var(--text-secondary)]">
                {withEmails(s.body)}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-[var(--hairline)] pt-6 ts-footnote leading-[1.6] text-[var(--text-tertiary)]">
          {footer_disclaimer}
        </p>
      </main>
    </div>
  );
}
