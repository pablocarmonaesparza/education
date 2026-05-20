"use client";

/**
 * /auth/signup — registro Apple-style del Simulador.
 *
 * Hermana visual de /auth/login: misma AuthNav, mismo display heading,
 * mismos inputs HeroUI, mismo flow OAuth Google. Cero imports del design
 * system legacy.
 *
 * Flow:
 *   1. signUp con name + email + password, o OAuth Google.
 *   2. Si vino con `?next=/path`, redirige ahí post-confirm.
 *   3. Si no, default a /onboarding/org (buyer flow).
 */

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Input } from "@heroui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthNav } from "@/components/simulador/AuthNav";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import "../../(app)/simulador.css";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

function translateError(errorMessage: string): string {
  if (
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("NetworkError")
  ) {
    return "No se pudo conectar al servidor. Verifica tu conexión.";
  }
  const map: Record<string, string> = {
    "User already registered": "Ya existe una cuenta con este email.",
    "Password should be at least 6 characters":
      "La contraseña debe tener al menos 6 caracteres.",
    "Unable to validate email address": "Email inválido.",
    "Signup disabled": "El registro está temporalmente deshabilitado.",
    "Email rate limit exceeded":
      "Demasiados intentos. Intenta de nuevo en unos minutos.",
  };
  for (const [k, v] of Object.entries(map)) {
    if (errorMessage.includes(k)) return v;
  }
  return errorMessage;
}

function SignupContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/onboarding/org";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [redirectingToGoogle, setRedirectingToGoogle] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) setError(decodeURIComponent(urlError));

    try {
      setSupabase(createClient());
    } catch (e) {
      console.error("[auth/signup] Supabase init failed", e);
      setError("No se pudo inicializar el cliente. Recarga la página.");
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?from=signup&next=${encodeURIComponent(next)}`;
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: redirectUrl,
        },
      });
      if (signUpErr) {
        setError(translateError(signUpErr.message));
      } else if (data?.session) {
        window.location.href = next;
      } else {
        setSuccess(
          "Te enviamos un correo. Abre el link para confirmar tu cuenta.",
        );
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (err) {
      setError(
        translateError(err instanceof Error ? err.message : "Error inesperado."),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?from=signup&next=${encodeURIComponent(next)}`;
      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthErr) {
        setError(
          translateError(oauthErr.message || "Error al iniciar con Google."),
        );
        setLoading(false);
        return;
      }
      if (data?.url) {
        setRedirectingToGoogle(true);
        window.location.href = data.url;
      } else {
        setError("No se pudo obtener la URL de Google.");
        setLoading(false);
      }
    } catch (err) {
      setError(
        translateError(err instanceof Error ? err.message : "Error inesperado."),
      );
      setLoading(false);
    }
  }

  if (redirectingToGoogle) {
    return (
      <div className="simulador-root min-h-screen surface-canvas grid place-items-center px-6">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          <p className="mt-6 text-[14px] text-[var(--text-secondary)]">
            Redirigiendo a Google…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <AuthNav mode="signup" next={next} />

      <main className="px-6 pt-10 sm:pt-14 pb-12">
        <div className="max-w-[400px] mx-auto">
          <motion.div {...fadeUp} className="text-center">
            <h1 className="display display-tight text-[40px] sm:text-[48px] text-[var(--text-primary)]">
              Empieza tu diagnóstico
            </h1>
          </motion.div>

          {error && (
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="mt-8 p-4 rounded-2xl bg-[var(--band-b-bg)] text-[var(--band-b-text)] text-[13.5px] text-center leading-[1.5]"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="mt-8 p-4 rounded-2xl bg-[var(--band-a-bg)] text-[var(--band-a-text)] text-[13.5px] text-center leading-[1.5]"
            >
              {success}
            </motion.div>
          )}

          <motion.form
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            onSubmit={handleSubmit}
            className="mt-8 space-y-2.5"
          >
            <Input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onValueChange={setName}
              isRequired
              size="lg"
              radius="lg"
              variant="bordered"
              autoComplete="name"
              classNames={{
                inputWrapper:
                  "h-12 bg-[var(--surface)] border-[var(--border)] data-[hover=true]:bg-[var(--surface)] group-data-[focus=true]:border-[var(--accent)] shadow-none",
                input: "text-[15px] text-[var(--text-primary)]",
              }}
            />

            <Input
              type="email"
              placeholder="email@empresa.com"
              value={email}
              onValueChange={setEmail}
              isRequired
              size="lg"
              radius="lg"
              variant="bordered"
              autoComplete="email"
              classNames={{
                inputWrapper:
                  "h-12 bg-[var(--surface)] border-[var(--border)] data-[hover=true]:bg-[var(--surface)] group-data-[focus=true]:border-[var(--accent)] shadow-none",
                input: "text-[15px] text-[var(--text-primary)]",
              }}
            />

            <Input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onValueChange={setPassword}
              isRequired
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
              isDisabled={loading || !email || !password || !name}
              radius="md"
              size="lg"
              className="w-full h-12 accent-bg text-white text-[15px] font-medium shadow-none mt-2"
            >
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </motion.form>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
            className="mt-6 flex items-center gap-4"
          >
            <div className="flex-1 h-px bg-[var(--hairline)]" />
            <span className="text-[12px] text-[var(--text-tertiary)] tracking-wide">
              o
            </span>
            <div className="flex-1 h-px bg-[var(--hairline)]" />
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.14 }}
            className="mt-4"
          >
            <Button
              type="button"
              onPress={handleGoogleSignup}
              isDisabled={loading}
              radius="md"
              size="lg"
              variant="bordered"
              className="w-full h-12 border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] text-[15px] font-medium gap-3 shadow-none"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>
                {loading ? "Conectando…" : "Continuar con Google"}
              </span>
            </Button>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.18 }}
            className="mt-7 text-center text-[14px] text-[var(--text-secondary)]"
          >
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/auth/login${next !== "/onboarding/org" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="text-[var(--accent)] hover:underline font-medium"
            >
              Inicia sesión
            </Link>
          </motion.p>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.22 }}
            className="mt-5 text-center text-[12px] text-[var(--text-tertiary)] leading-[1.55]"
          >
            Al continuar aceptas nuestros{" "}
            <Link href="/terms" className="underline hover:opacity-70 transition-opacity">
              términos
            </Link>{" "}
            y la{" "}
            <Link href="/privacy" className="underline hover:opacity-70 transition-opacity">
              política de privacidad
            </Link>
            .
          </motion.p>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="simulador-root min-h-screen surface-canvas grid place-items-center px-6">
          <div className="mx-auto h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
