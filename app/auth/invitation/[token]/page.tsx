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
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";
import { createClient } from "@/lib/supabase/client";

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
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full text-center"
        >
          {status === "checking" && (
            <p className="text-[15px] text-[var(--text-secondary)]">
              Verificando invitación…
            </p>
          )}

          {status === "needs_auth" && (
            <>
              <div className="eyebrow mb-4">Invitación al Simulador</div>
              <h1 className="display display-tight text-[var(--text-primary)] text-[28px] sm:text-[36px]">
                Te invitaron a un diagnóstico.
              </h1>
              <p className="mt-5 text-[16px] text-[var(--text-secondary)] leading-[1.55]">
                Inicia sesión o regístrate con el email al que te enviaron
                esta invitación. Después de autenticarte, la invitación se
                aceptará automáticamente.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Button
                  onPress={() =>
                    router.push(
                      `/auth/signup?next=/auth/invitation/${token}`,
                    )
                  }
                  radius="full"
                  size="lg"
                  className="accent-bg text-white h-12 text-[15px] font-medium shadow-none"
                >
                  Crear cuenta
                </Button>
                <Button
                  onPress={() =>
                    router.push(
                      `/auth/login?next=/auth/invitation/${token}`,
                    )
                  }
                  variant="bordered"
                  radius="full"
                  size="lg"
                  className="h-12 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)]"
                >
                  Ya tengo cuenta
                </Button>
              </div>
            </>
          )}

          {status === "accepting" && (
            <p className="text-[15px] text-[var(--text-secondary)]">
              Aceptando invitación…
            </p>
          )}

          {status === "done" && (
            <>
              <div className="mx-auto h-12 w-12 rounded-full accent-bg-soft grid place-items-center mb-6">
                <svg
                  className="h-6 w-6 text-[var(--accent)]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12L10 17L19 7"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="display text-[24px] text-[var(--text-primary)]">
                Listo. Redirigiendo al dashboard…
              </h1>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-[var(--band-b-text)] text-[16px] mb-4">
                ⚠ {errorMsg ?? "Algo salió mal."}
              </div>
              <Button
                onPress={() => router.push("/")}
                radius="full"
                size="lg"
                className="accent-bg text-white h-12 px-6 text-[15px] font-medium shadow-none"
              >
                Ir al inicio
              </Button>
            </>
          )}
        </motion.div>
      </main>
    </>
  );
}
