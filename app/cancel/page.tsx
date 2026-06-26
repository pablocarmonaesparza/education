import { AppleButtonLink, AppleIcon } from "@/components/simulador/apple";
import "../(app)/simulador.css";

/**
 * /cancel — el usuario abortó el checkout de Stripe. No se cobró nada.
 * Estado neutral (no error): se le invita a retomar el diagnóstico.
 */
export default function CancelPage() {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <main className="px-6 py-16 min-h-screen flex items-center justify-center">
        <div className="max-w-[400px] w-full mx-auto text-center flex flex-col items-center gap-6">
          <div className="h-14 w-14 rounded-full grid place-items-center bg-[var(--surface-3)]">
            <AppleIcon
              name="x"
              size="lg"
              className="text-[var(--text-secondary)]"
            />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="display display-tight ts-title-1 sm:ts-display leading-[1.1] text-[var(--text-primary)]">
              Pago cancelado
            </h1>
            <p className="ts-body leading-[1.55] text-[var(--text-secondary)]">
              No se cobró nada. Puedes volver al diagnóstico y retomarlo cuando
              estés listo.
            </p>
          </div>
          <AppleButtonLink
            href="/auth/signup?next=%2Fonboarding%2Forg"
            className="w-full h-12 accent-bg text-white ts-body font-medium shadow-none"
          >
            Volver al diagnóstico
          </AppleButtonLink>
        </div>
      </main>
    </div>
  );
}
