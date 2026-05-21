"use client";

/**
 * /auth/invitation/[token]
 *
 * Landing del invitado. Tiene su propio signup INLINE (no redirige al
 * signup de buyer) porque el invitado:
 *   - Ya tiene su email validado por la invitación → no requiere
 *     confirmación por email.
 *   - YA pertenece a una org → no debe pasar por /onboarding/org.
 *   - Aporta su nombre + puesto que el report usa para contextualizar
 *     ("Ana López · Growth Manager").
 *
 * Estados:
 *   loading      → GET /api/invitations/[token]
 *   invalid      → token no encontrado / expirado / ya aceptado
 *   needs_signup → form inline con email readonly + nombre + puesto + password
 *   submitting   → POST signup-and-accept en curso
 *   signing_in   → cuenta creada, cliente hace signInWithPassword
 *   done         → redirect a dashboard / primer caso
 *
 * Si el invitado YA tiene cuenta (email_already_registered):
 *   pega un link a /auth/login?next=/auth/invitation/[token] que después
 *   del login dispara el flow de accept estándar (POST /accept).
 */

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthNav } from "@/components/simulador/AuthNav";
import { createClient } from "@/lib/supabase/client";
import "../../../(app)/simulador.css";

type Status =
  | "loading"
  | "invalid"
  | "needs_signup"
  | "checking_session"
  | "accepting_existing"
  | "submitting"
  | "signing_in"
  | "done";

interface InvitationInfo {
  email: string;
  organization_name: string | null;
  inviter_name: string | null;
  intended_role: string;
  status: string;
  expired: boolean;
  usable: boolean;
}

export default function InvitationLandingPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [status, setStatus] = useState<Status>("loading");
  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [password, setPassword] = useState("");

  const finishAndRedirect = useCallback(() => {
    setStatus("done");
    setTimeout(() => router.push("/dashboard"), 1200);
  }, [router]);

  // 1. Load invitation info + decidir flow inicial.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch(`/api/invitations/${token}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Invitación inválida.");
          setStatus("invalid");
          return;
        }
        if (!data.usable) {
          setError(
            data.expired
              ? "Esta invitación expiró. Pídele al admin que reenvíe el invite."
              : data.status === "accepted"
                ? "Esta invitación ya fue aceptada. Inicia sesión con tu cuenta."
                : `Invitación ${data.status}.`,
          );
          setStatus("invalid");
          setInfo(data);
          return;
        }
        setInfo(data);

        // ¿Ya hay sesión? Si sí, vamos directo al flow de accept estándar.
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;

        if (user) {
          // User logueado → acepta directamente (verifica que el email coincida).
          setStatus("accepting_existing");
          const acceptRes = await fetch(
            `/api/invitations/${token}/accept`,
            { method: "POST" },
          );
          const acceptData = await acceptRes.json();
          if (cancelled) return;
          if (!acceptRes.ok) {
            setError(acceptData.error ?? "Error al aceptar invitación.");
            setStatus("invalid");
            return;
          }
          finishAndRedirect();
          return;
        }

        setStatus("needs_signup");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error inesperado.");
        setStatus("invalid");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, finishAndRedirect]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !info) return;
    setError(null);
    setEmailAlreadyRegistered(false);
    setStatus("submitting");
    try {
      const res = await fetch(
        `/api/invitations/${token}/signup-and-accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            password,
            job_title: jobTitle.trim() || undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "email_already_registered") {
          setEmailAlreadyRegistered(true);
        }
        setError(data.error ?? "Error al crear cuenta.");
        setStatus("needs_signup");
        return;
      }

      // Cuenta creada en server. Ahora montamos la sesión en el cliente
      // con la misma password.
      setStatus("signing_in");
      const supabase = createClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: info.email,
        password,
      });
      if (signInErr) {
        setError(
          `Cuenta creada pero no pudimos iniciar sesión: ${signInErr.message}. Intenta loguearte manualmente.`,
        );
        setStatus("invalid");
        return;
      }
      finishAndRedirect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setStatus("needs_signup");
    }
  }

  // ============ RENDER ============

  if (status === "loading" || status === "checking_session") {
    return (
      <div className="simulador-root min-h-screen surface-canvas">
        <AuthNav mode="signup" next={`/auth/invitation/${token ?? ""}`} />
        <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
            <p className="mt-4 text-[14px] text-[var(--text-secondary)]">
              Verificando invitación…
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (status === "accepting_existing") {
    return (
      <div className="simulador-root min-h-screen surface-canvas">
        <AuthNav mode="signup" next={`/auth/invitation/${token ?? ""}`} />
        <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
            <p className="mt-4 text-[14px] text-[var(--text-secondary)]">
              Aceptando invitación…
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (status === "signing_in") {
    return (
      <div className="simulador-root min-h-screen surface-canvas">
        <AuthNav mode="signup" next={`/auth/invitation/${token ?? ""}`} />
        <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
            <p className="mt-4 text-[14px] text-[var(--text-secondary)]">
              Iniciando tu sesión…
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="simulador-root min-h-screen surface-canvas">
        <AuthNav mode="signup" next={`/auth/invitation/${token ?? ""}`} />
        <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
          <div className="max-w-[440px] text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[var(--band-a-bg)] grid place-items-center">
              <svg
                className="h-7 w-7 text-[var(--band-a-text)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="display display-tight mt-6 text-[var(--text-primary)] text-[28px]">
              Listo, redirigiendo
            </h1>
          </div>
        </main>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="simulador-root min-h-screen surface-canvas">
        <AuthNav mode="signup" next={`/auth/invitation/${token ?? ""}`} />
        <main className="surface-canvas min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
          <div className="max-w-[440px] w-full text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[var(--surface-2)] border border-[var(--hairline)] grid place-items-center">
              <svg
                className="h-7 w-7 text-[var(--text-tertiary)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="display display-tight mt-7 text-[var(--text-primary)] text-[28px]">
              Invitación no disponible
            </h1>
            <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
              {error ?? "Esta invitación no es válida."}
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] px-6 text-[15px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============ needs_signup / submitting (form) ============
  const submitting = status === "submitting";
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <AuthNav mode="signup" next={`/auth/invitation/${token ?? ""}`} />
      <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[420px] w-full"
        >
          <h1 className="display display-tight text-[var(--text-primary)] text-[28px] sm:text-[32px] text-center">
            Crea tu cuenta
          </h1>
          {info && (
            <p className="mt-3 text-[14px] text-[var(--text-secondary)] leading-[1.55] text-center">
              {info.inviter_name && info.organization_name
                ? `${info.inviter_name} te invitó a ${info.organization_name}.`
                : info.organization_name
                  ? `Te invitaron a ${info.organization_name}.`
                  : "Te invitaron al diagnóstico de tu equipo."}
            </p>
          )}

          {error && (
            <div className="mt-6 rounded-[var(--radius-md)] bg-[var(--band-b-bg)] px-4 py-2.5 text-[13px] text-[var(--band-b-text)] leading-[1.5]">
              {error}
              {emailAlreadyRegistered && (
                <div className="mt-2">
                  <Link
                    href={`/auth/login?next=/auth/invitation/${token}`}
                    className="text-[var(--band-b-text)] underline"
                  >
                    Iniciar sesión →
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSignup} className="mt-8 space-y-2.5">
            {info && (
              <div className="rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-2)] px-4 py-3 text-[14px]">
                <div className="text-[11px] text-[var(--text-tertiary)]">Email</div>
                <div className="text-[var(--text-primary)] mt-0.5">
                  {info.email}
                </div>
              </div>
            )}
            <Input
              type="text"
              placeholder="Tu nombre completo"
              value={name}
              onValueChange={setName}
              size="lg"
              radius="lg"
              variant="bordered"
              autoComplete="name"
              autoFocus
              classNames={{
                inputWrapper:
                  "h-12 bg-[var(--surface)] border-[var(--border)] data-[hover=true]:bg-[var(--surface)] group-data-[focus=true]:border-[var(--accent)] shadow-none",
                input: "text-[15px] text-[var(--text-primary)]",
              }}
            />
            <Input
              type="text"
              placeholder="Puesto (opcional, ej. Growth Manager)"
              value={jobTitle}
              onValueChange={setJobTitle}
              size="lg"
              radius="lg"
              variant="bordered"
              autoComplete="organization-title"
              classNames={{
                inputWrapper:
                  "h-12 bg-[var(--surface)] border-[var(--border)] data-[hover=true]:bg-[var(--surface)] group-data-[focus=true]:border-[var(--accent)] shadow-none",
                input: "text-[15px] text-[var(--text-primary)]",
              }}
            />
            <Input
              type="password"
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onValueChange={setPassword}
              size="lg"
              radius="lg"
              variant="bordered"
              autoComplete="new-password"
              classNames={{
                inputWrapper:
                  "h-12 bg-[var(--surface)] border-[var(--border)] data-[hover=true]:bg-[var(--surface)] group-data-[focus=true]:border-[var(--accent)] shadow-none",
                input: "text-[15px] text-[var(--text-primary)]",
              }}
            />

            <Button
              type="submit"
              isLoading={submitting}
              isDisabled={
                submitting ||
                name.trim().length < 2 ||
                password.length < 6
              }
              radius="md"
              size="lg"
              className="w-full h-12 accent-bg text-white text-[15px] font-medium shadow-none mt-2"
            >
              {submitting ? "Creando cuenta…" : "Aceptar invitación"}
            </Button>
          </form>

          <p className="mt-7 text-center text-[13px] text-[var(--text-secondary)]">
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/auth/login?next=/auth/invitation/${token}`}
              className="text-[var(--accent)] hover:underline font-medium"
            >
              Inicia sesión
            </Link>
          </p>

          <p className="mt-8 text-center text-[11px] text-[var(--text-tertiary)] leading-[1.55]">
            Al continuar aceptas los{" "}
            <Link href="/terms" className="underline hover:opacity-70">
              Términos
            </Link>{" "}
            y la{" "}
            <Link href="/privacy" className="underline hover:opacity-70">
              Política de privacidad
            </Link>
            .
          </p>
        </motion.div>
      </main>
    </div>
  );
}
