import type { ReactNode } from "react";
import { legalCopy } from "@/lib/simulador/copy/legal";
import { AppleLink } from "@/components/simulador/apple";
import "../(app)/simulador.css";

/**
 * /privacy — Aviso de privacidad.
 *
 * El contenido NO vive aquí: se renderiza desde la fuente canónica
 * `lib/simulador/copy/legal.ts` (legalCopy.privacy_policy, versión por
 * jurisdicción MX + CO). Editar el texto legal se hace en ese archivo.
 */

const { privacy_policy: pp, footer_disclaimer } = legalCopy;

const JURISDICTIONS = [
  { label: "México", policy: pp.MX },
  { label: "Colombia", policy: pp.CO },
];

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

export default function PrivacyPage() {
  return (
    <div className="simulador-root min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <main className="mx-auto max-w-[720px] px-6 py-16 sm:py-20">
        <h1 className="display display-tight text-[28px] sm:text-[32px] leading-[1.1] text-[var(--text-primary)]">
          Aviso de privacidad.
        </h1>
        <p className="mt-3 ts-footnote text-[var(--text-tertiary)]">
          Última actualización: {pp.MX.last_updated}
        </p>

        {JURISDICTIONS.map(({ label, policy }) => (
          <section key={label} className="mt-14">
            <div className="border-b border-[var(--hairline)] pb-3">
              <h2 className="ts-body-lg font-semibold text-[var(--text-primary)]">
                {label}
              </h2>
              <p className="mt-1.5 ts-subhead leading-[1.5] text-[var(--text-tertiary)]">
                {policy.framework_citation}
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {policy.sections.map((s) => (
                <div key={s.title}>
                  <h3 className="ts-headline font-semibold text-[var(--text-primary)]">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 ts-body leading-[1.6] text-[var(--text-secondary)]">
                    {withEmails(s.body)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <p className="mt-14 border-t border-[var(--hairline)] pt-6 ts-footnote leading-[1.6] text-[var(--text-tertiary)]">
          {footer_disclaimer}
        </p>
      </main>
    </div>
  );
}
