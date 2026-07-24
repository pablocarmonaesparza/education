"use client";

/**
 * /auth/login — login Apple-style del Simulador.
 *
 * Diseñado para integrarse con la landing pública (PublicNav arriba,
 * tipografía display, surfaces del design system del Simulador). Cero
 * imports del design system legacy de Itera Courses.
 *
 * Flow:
 *   1. signInWithPassword o OAuth Google.
 *   2. Si vino con `?next=/path`, redirige ahí (caso típico: aceptar invitación).
 *   3. Si no, default a /dashboard.
 */

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AuthNav } from "@/components/simulador/AuthNav";
import {
  AppleButton,
  AppleInput,
  AppleLink,
  AppleSlideButton,
} from "@/components/simulador/apple";
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
    return "Couldn't connect to the server. Check your connection.";
  }
  const map: Record<string, string> = {
    "Invalid login credentials": "Incorrect email or password.",
    "Email not confirmed": "Confirm your email before signing in.",
    "Password should be at least 6 characters":
      "Your password must be at least 6 characters.",
    "Unable to validate email address": "Invalid email.",
  };
  for (const [k, v] of Object.entries(map)) {
    if (errorMessage.includes(k)) return v;
  }
  return errorMessage;
}

function LoginContent() {
  const searchParams = useSearchParams();
  const next =
    searchParams.get("next") ?? searchParams.get("redirectedFrom") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectingToGoogle, setRedirectingToGoogle] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) setError(decodeURIComponent(urlError));

    try {
      setSupabase(createClient());
    } catch (e) {
      console.error("[auth/login] Supabase init failed", e);
      setError("Couldn't initialize the client. Reload the page.");
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Client not initialized. Reload the page.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword(
        { email, password },
      );
      if (signInErr) {
        setError(translateError(signInErr.message));
      } else if (data?.session) {
        window.location.href = next;
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch (err) {
      setError(
        translateError(
          err instanceof Error ? err.message : "Something went wrong.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!supabase) {
      setError("Client not initialized. Reload the page.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?from=login&next=${encodeURIComponent(next)}`;
      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthErr) {
        setError(
          translateError(oauthErr.message || "Couldn't sign in with Google."),
        );
        setLoading(false);
        return;
      }
      if (data?.url) {
        setRedirectingToGoogle(true);
        window.location.href = data.url;
      } else {
        setError("Couldn't get the Google URL. Try again.");
        setLoading(false);
      }
    } catch (err) {
      setError(
        translateError(err instanceof Error ? err.message : "Something went wrong."),
      );
      setLoading(false);
    }
  }

  if (redirectingToGoogle) {
    return (
      <div className="simulador-root min-h-screen surface-canvas grid place-items-center px-6">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          <p className="mt-6 ts-callout text-[var(--text-secondary)]">
            Redirecting to Google…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="simulador-root min-h-screen surface-canvas relative">
      <div className="absolute inset-x-0 top-0 z-20">
        <AuthNav />
      </div>

      <main className="px-6 py-16 min-h-screen flex items-center justify-center">
        <div className="max-w-[400px] w-full mx-auto flex flex-col gap-6">
          <motion.div {...fadeUp} className="text-center">
            <h1 className="display display-tight ts-title-1 sm:ts-display text-[var(--text-primary)] leading-[1.1]">
              Sign in
            </h1>
          </motion.div>

          {error && (
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="p-4 rounded-[var(--radius-lg)] bg-[var(--band-b-bg)] text-[var(--band-b-text)] ts-subhead text-center leading-[1.5]"
            >
              {error}
            </motion.div>
          )}

          <motion.form
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <AppleInput
              label="Email"
              type="email"
              placeholder="email@company.com"
              value={email}
              onValueChange={setEmail}
              isRequired
              size="md"
              autoComplete="email"
            />

            <AppleInput
              label="Password"
              type="password"
              placeholder="Password"
              value={password}
              onValueChange={setPassword}
              isRequired
              size="md"
              autoComplete="current-password"
            />

            <AppleSlideButton
              type="submit"
              fullWidth
              isLoading={loading}
              isDisabled={!email || !password}
            >
              {loading ? "Signing in…" : "Continue →"}
            </AppleSlideButton>
          </motion.form>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
            className="flex items-center gap-4"
          >
            <div className="flex-1 h-px bg-[var(--hairline)]" />
            <span className="ts-footnote text-[var(--text-tertiary)] tracking-wide">
              or
            </span>
            <div className="flex-1 h-px bg-[var(--hairline)]" />
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.14 }}
          >
            <AppleButton
              type="button"
              onPress={handleGoogleLogin}
              isDisabled={loading}
              tone="secondary"
              size="lg"
              className="w-full h-12 rounded-[var(--radius-md)] border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] ts-callout font-medium gap-3 shadow-none"
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
                {loading ? "Connecting…" : "Continue with Google"}
              </span>
            </AppleButton>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.18 }}
            className="text-center ts-callout text-[var(--text-secondary)]"
          >
            Don&apos;t have an account yet?{" "}
            <AppleLink
              href={`/auth/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-medium"
            >
              Create account
            </AppleLink>
          </motion.p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="simulador-root min-h-screen surface-canvas grid place-items-center px-6">
          <div className="mx-auto h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
