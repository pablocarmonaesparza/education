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
 *
 * Layout de documento: header con eyebrow + título display + intro y
 * secciones numeradas (el número del copy "1. …" se separa en un badge de
 * acento para dar jerarquía). Sin contornos: dividers + bloque de surface.
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

/** Separa "1. Qué es Itera" → { num: "01", title: "Qué es Itera" }. */
function splitNumberedTitle(raw: string, fallbackIndex: number) {
  const m = raw.match(/^(\d+)\.\s*(.*)$/);
  if (m) return { num: m[1].padStart(2, "0"), title: m[2] };
  return { num: String(fallbackIndex + 1).padStart(2, "0"), title: raw };
}

export default function TermsPage() {
  return (
    <div className="simulador-root min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <main className="mx-auto max-w-[760px] px-6 py-16 sm:py-24">
        {/* ============ Document header ============ */}
        <header className="flex flex-col gap-3">
          <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Legal
          </span>
          <h1 className="display display-tight ts-display sm:ts-display-lg leading-[1.05] text-[var(--text-primary)]">
            {tos.headline}
          </h1>
          <p className="max-w-[58ch] ts-body leading-[1.6] text-[var(--text-secondary)]">
            The rules for using Itera: what it is, who can use it, how we bill,
            what your organization gets, and what you agree not to do with a
            report.
          </p>
          <p className="mt-1 ts-footnote text-[var(--text-tertiary)]">
            Last updated · {tos.last_updated}
          </p>
        </header>

        {/* ============ Sections ============ */}
        <div className="mt-14 flex flex-col gap-7">
          {tos.sections.map((s, i) => {
            const { num, title } = splitNumberedTitle(s.title, i);
            return (
              <section key={s.title} className="flex gap-4">
                <span className="mt-0.5 w-6 flex-none ts-caption-1 font-semibold tabular-nums text-[var(--accent)]">
                  {num}
                </span>
                <div className="flex-1">
                  <h2 className="ts-headline font-semibold text-[var(--text-primary)]">
                    {title}
                  </h2>
                  <p className="mt-1.5 ts-body leading-[1.6] text-[var(--text-secondary)]">
                    {withEmails(s.body)}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

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
