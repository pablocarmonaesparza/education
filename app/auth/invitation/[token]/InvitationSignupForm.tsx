"use client";

/**
 * Form de signup inline para invitados (/auth/invitation/[token]).
 *
 * Por qué un form propio y no /auth/signup:
 *   - El email viene de la invitación y se muestra pre-filled read-only.
 *     El endpoint POST /api/invitations/[token]/signup-and-accept lo toma
 *     del token (no del cliente) para prevenir hijacking, así que aquí el
 *     campo es solo contexto visual.
 *   - Ese endpoint crea la cuenta con email pre-confirmado Y acepta la
 *     invitación en el mismo paso: el invitado no espera email de confirm
 *     ni pasa por /onboarding/org.
 *
 * Tras crear la cuenta hacemos signInWithPassword y avisamos al padre
 * (onAccepted) para que muestre la confirmación. El destino post-accept
 * (/dashboard) no cambia respecto al flujo existente.
 */

import { useState, FormEvent } from "react";
import {
  AppleCheckbox,
  AppleInput,
  AppleLink,
  AppleSlideButton,
} from "@/components/simulador/apple";
import { createClient } from "@/lib/supabase/client";

interface InvitationSignupFormProps {
  token: string;
  /** Email destinatario de la invitación (pre-fill, read-only). */
  email: string;
  /** Nombre de la org para el CTA ("Join Acme →"); null → copy genérico. */
  orgName: string | null;
  /** El padre muestra la confirmación y redirige a /dashboard. */
  onAccepted: () => void;
}

export function InvitationSignupForm({
  token,
  email,
  orgName,
  onAccepted,
}: InvitationSignupFormProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cuando el email ya tiene cuenta, el error incluye un link directo a login
  // con next de vuelta a esta invitación (sigue pending → se acepta al volver).
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const loginNext = encodeURIComponent(`/auth/invitation/${token}`);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setAlreadyRegistered(false);

    // Espeja las validaciones del endpoint para fallar rápido en cliente.
    if (name.trim().length < 2) {
      setError("Your name must be at least 2 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/invitations/${token}/signup-and-accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setAlreadyRegistered(data?.code === "email_already_registered");
        setError(data?.error ?? "We could not create your account. Try again.");
        setLoading(false);
        return;
      }

      // Cuenta creada + invitación aceptada → iniciar sesión con el password.
      const supabase = createClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        // La invitación ya quedó aceptada; si el signin automático falla,
        // mandamos a login con destino /dashboard (NO de vuelta a esta página,
        // que re-intentaría un accept ya consumido).
        window.location.href = "/auth/login?next=%2Fdashboard";
        return;
      }

      onAccepted();
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("Failed to fetch")
          ? "Couldn't connect to the server. Check your connection."
          : "Something went wrong. Try again.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--band-b-bg)] text-[var(--band-b-text)] ts-subhead text-center leading-[1.5]">
          {error}
          {alreadyRegistered && (
            <>
              {" "}
              <AppleLink
                href={`/auth/login?next=${loginNext}`}
                className="font-medium"
              >
                Sign in
              </AppleLink>
            </>
          )}
        </div>
      )}

      <AppleInput
        label="Email"
        type="email"
        value={email}
        isReadOnly
        size="md"
        description="Your invitation is tied to this email."
      />

      <AppleInput
        label="Full name"
        type="text"
        placeholder="Your name"
        value={name}
        onValueChange={setName}
        isRequired
        size="md"
        autoComplete="name"
      />

      <AppleInput
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="At least 6 characters"
        value={password}
        onValueChange={setPassword}
        isRequired
        size="md"
        autoComplete="new-password"
        endContent={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
          >
            {showPassword ? (
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.22A10.48 10.48 0 001.93 12C3.23 16.34 7.24 19.5 12 19.5c.99 0 1.95-.14 2.86-.4M6.23 6.23A10.45 10.45 0 0112 4.5c4.76 0 8.77 3.16 10.07 7.5a10.52 10.52 0 01-4.3 5.77M6.23 6.23L3 3m3.23 3.23l3.65 3.65m7.89 7.89L21 21m-3.23-3.23l-3.65-3.65m0 0a3 3 0 10-4.24-4.24m4.24 4.24L9.88 9.88" />
              </svg>
            ) : (
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.04 12.32a1.01 1.01 0 010-.64C3.42 7.51 7.36 4.5 12 4.5c4.64 0 8.57 3.01 9.96 7.18.07.21.07.43 0 .64C20.58 16.49 16.64 19.5 12 19.5c-4.64 0-8.58-3.01-9.96-7.18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        }
      />

      <AppleCheckbox
        isSelected={acceptedTerms}
        onValueChange={setAcceptedTerms}
        isRequired
      >
        I accept the{" "}
        <AppleLink muted href="/terms" onClick={(e) => e.stopPropagation()}>
          terms
        </AppleLink>{" "}
        and the{" "}
        <AppleLink muted href="/privacy" onClick={(e) => e.stopPropagation()}>
          privacy policy
        </AppleLink>
        .
      </AppleCheckbox>

      <AppleSlideButton
        type="submit"
        fullWidth
        isLoading={loading}
        isDisabled={!name || !password || !acceptedTerms}
      >
        {loading
          ? "Creating your account…"
          : orgName
            ? `Join ${orgName} →`
            : "Accept invitation →"}
      </AppleSlideButton>
    </form>
  );
}
