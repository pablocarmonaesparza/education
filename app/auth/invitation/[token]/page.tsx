"use client";

/**
 * /auth/invitation/[token]
 *
 * Landing del invitee. Si el user no está logueado → muestra signup/login
 * pre-filled con el email de la invitación.
 * Si está logueado → POST /api/invitations/[token]/accept y redirige al
 * primer caso asignado (o al dashboard).
 */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AuthNav } from "@/components/simulador/AuthNav";
import { AppleButton, AppleErrorState, AppleIcon } from "@/components/simulador/apple";
import { createClient } from "@/lib/supabase/client";
import "../../../(app)/simulador.css";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export default function InvitationLandingPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [status, setStatus] = useState<
    "checking" | "needs_auth" | "accepting" | "done" | "error"
  >("checking");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setStatus("needs_auth");
        return;
      }

      // Está logueado → aceptar invitación.
      setStatus("accepting");
      try {
        const res = await fetch(`/api/invitations/${token}/accept`, {
          method: "POST",
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Error al aceptar invitación.");
        setStatus("done");
        // Redirige al dashboard después de 1.5s para que vean confirmación.
        setTimeout(() => router.push("/dashboard"), 1500);
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err instanceof Error ? err.message : "Error inesperado.");
        setStatus("error");
      }
    }

    if (token) run();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="simulador-root min-h-screen surface-canvas relative">
      <div className="absolute inset-x-0 top-0 z-20">
        <AuthNav />
      </div>

      <main className="px-6 py-16 min-h-screen flex items-center justify-center">
        <motion.div
          {...fadeUp}
          className="max-w-[400px] w-full mx-auto text-center"
        >
          {(status === "checking" || status === "accepting") && (
            <div className="flex flex-col items-center gap-5">
              <div className="h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
              <p className="text-[15px] text-[var(--text-secondary)]">
                {status === "checking"
                  ? "Verificando invitación…"
                  : "Aceptando invitación…"}
              </p>
            </div>
          )}

          {status === "needs_auth" && (
            <div className="flex flex-col gap-6">
              <h1 className="display display-tight text-[28px] sm:text-[32px] leading-[1.1] text-[var(--text-primary)]">
                Te invitaron a un diagnóstico.
              </h1>
              <p className="text-[15px] leading-[1.55] text-[var(--text-secondary)]">
                Inicia sesión o regístrate con el email al que te enviaron esta
                invitación. Al autenticarte, se acepta automáticamente.
              </p>
              <div className="flex flex-col gap-3">
                <AppleButton
                  onPress={() =>
                    router.push(`/auth/signup?next=/auth/invitation/${token}`)
                  }
                  size="lg"
                  className="w-full h-12 accent-bg text-white text-[15px] font-medium shadow-none"
                >
                  Crear cuenta
                </AppleButton>
                <AppleButton
                  onPress={() =>
                    router.push(`/auth/login?next=/auth/invitation/${token}`)
                  }
                  tone="secondary"
                  size="lg"
                  className="w-full h-12 border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] text-[15px] font-medium shadow-none"
                >
                  Ya tengo cuenta
                </AppleButton>
              </div>
            </div>
          )}

          {status === "done" && (
            <div className="flex flex-col items-center gap-6">
              <div className="h-12 w-12 rounded-full accent-bg-soft grid place-items-center">
                <AppleIcon name="check" className="text-[var(--accent)]" />
              </div>
              <h1 className="display display-tight text-[24px] leading-[1.15] text-[var(--text-primary)]">
                Listo. Redirigiendo al dashboard…
              </h1>
            </div>
          )}

          {status === "error" && (
            <AppleErrorState
              title="No pudimos aceptar la invitación."
              body={errorMsg ?? "Algo salió mal. Intenta de nuevo."}
              actionLabel="Ir al inicio"
              onAction={() => router.push("/")}
            />
          )}
        </motion.div>
      </main>
    </div>
  );
}
