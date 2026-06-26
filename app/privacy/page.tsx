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
 *
 * Layout de documento: header con eyebrow + título display + intro, cada
 * jurisdicción como una "parte" numerada, y secciones con número en acento
 * para dar jerarquía (no muro de texto). Sin contornos: dividers + bloques
 * de surface.
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
      <main className="mx-auto max-w-[760px] px-6 py-16 sm:py-24">
        {/* ============ Document header ============ */}
        <header className="flex flex-col gap-3">
          <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Legal
          </span>
          <h1 className="display display-tight ts-display sm:ts-display-lg leading-[1.05] text-[var(--text-primary)]">
            Aviso de privacidad
          </h1>
          <p className="max-w-[58ch] ts-body leading-[1.6] text-[var(--text-secondary)]">
            Cómo Itera recolecta, usa y protege tus datos personales. Este aviso
            cubre México (LFPDPPP) y Colombia (Ley 1581); aplica el marco de tu
            jurisdicción.
          </p>
          <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
            Última actualización · {pp.MX.last_updated}
          </p>
        </header>

        {/* ============ Jurisdictions ============ */}
        {JURISDICTIONS.map(({ label, policy }, ji) => (
          <section key={label} className="mt-16">
            <div className="flex items-center gap-3 border-b border-[var(--hairline)] pb-4">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[var(--surface-3)] ts-caption-1 font-semibold tabular-nums text-[var(--text-secondary)]">
                {ji + 1}
              </span>
              <h2 className="ts-title-3 font-semibold text-[var(--text-primary)]">
                {label}
              </h2>
            </div>
            <p className="mt-3 ts-subhead leading-[1.55] text-[var(--text-tertiary)]">
              {policy.framework_citation}
            </p>

            <div className="mt-8 flex flex-col gap-7">
              {policy.sections.map((s, i) => (
                <div key={s.title} className="flex gap-4">
                  <span className="mt-0.5 w-6 flex-none ts-caption-1 font-semibold tabular-nums text-[var(--accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <h3 className="ts-headline font-semibold text-[var(--text-primary)]">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 ts-body leading-[1.6] text-[var(--text-secondary)]">
                      {withEmails(s.body)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* ============ Footer disclaimer ============ */}
        <div className="mt-16 rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5">
          <p className="ts-footnote leading-[1.6] text-[var(--text-tertiary)]">
            {footer_disclaimer}
          </p>
        </div>
      </main>
    </div>
  );
}
