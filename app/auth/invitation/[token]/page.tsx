"use client";

/**
 * /auth/invitation/[token]
 *
 * Landing del invitee. Deja de ser ciega: llama a GET /api/invitations/[token]
 * (público, no sensible) para mostrar QUIÉN invita y A QUÉ org antes de pedir
 * cuenta.
 *
 * Flujos:
 *   - No logueado + invitación usable → header contextual ("{inviter} invited
 *     you to {org}") + signup inline (InvitationSignupForm) con el email de la
 *     invitación pre-filled. El endpoint signup-and-accept crea cuenta y acepta
 *     en un paso.
 *   - No logueado + token inválido/expirado/usado → estado de error.
 *   - Logueado → POST /api/invitations/[token]/accept y redirige a /dashboard
 *     (flujo existente, sin cambios).
 */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AuthNav } from "@/components/simulador/AuthNav";
import {
  AppleButton,
  AppleCard,
  AppleIcon,
  AppleLink,
  AppleSkeleton,
} from "@/components/simulador/apple";
import { createClient } from "@/lib/supabase/client";
import { InvitationSignupForm } from "./InvitationSignupForm";
import "../../../(app)/simulador.css";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

/** Respuesta de GET /api/invitations/[token]. team_name es opcional: el GET
 *  aún no lo devuelve; si Codex lo agrega, se muestra sin tocar esta página. */
interface InvitationMeta {
  email: string;
  organization_name: string | null;
  inviter_name: string | null;
  team_name?: string | null;
  intended_role?: string | null;
  status: string;
  expired: boolean;
  usable: boolean;
}

export default function InvitationLandingPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [status, setStatus] = useState<
    "checking" | "needs_auth" | "accepting" | "done" | "error"
  >("checking");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [meta, setMeta] = useState<InvitationMeta | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = createClient();

      // Auth check y metadata de la invitación en paralelo: el GET es público
      // y da el contexto (inviter/org/email) sin requerir sesión.
      const [userRes, metaRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch(`/api/invitations/${token}`)
          .then(async (res) => ({
            ok: res.ok,
            data: (await res.json().catch(() => null)) as InvitationMeta | null,
          }))
          .catch(() => null),
      ]);

      if (cancelled) return;

      const user = userRes.data.user;

      if (!user) {
        // Sin sesión → decidir con la metadata pública.
        if (!metaRes || !metaRes.ok || !metaRes.data) {
          setErrorMsg(null); // usa el copy default del estado de error
          setStatus("error");
          return;
        }
        const inv = metaRes.data;
        if (!inv.usable) {
          setErrorMsg(
            inv.expired
              ? "This invitation expired. Ask your organization admin to send a new one."
              : inv.status === "accepted"
                ? "This invitation was already accepted. Sign in with your account."
                : "This invitation is no longer active.",
          );
          setStatus("error");
          return;
        }
        setMeta(inv);
        setStatus("needs_auth");
        return;
      }

      // Está logueado → aceptar invitación (flujo existente, sin cambios).
      setStatus("accepting");
      try {
        const res = await fetch(`/api/invitations/${token}/accept`, {
          method: "POST",
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Couldn't accept the invitation.");
        setStatus("done");
        // Redirige al dashboard después de 1.5s para que vean confirmación.
        setTimeout(() => router.push("/dashboard"), 1500);
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
        setStatus("error");
      }
    }

    if (token) run();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  // Signup inline exitoso: la cuenta ya existe y la invitación ya está
  // aceptada. Full navigation (no router.push) para que el server vea la
  // sesión recién creada. Destino post-accept sin cambios: /dashboard.
  function handleSignupAccepted() {
    setStatus("done");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  }

  const headline = meta
    ? meta.inviter_name && meta.organization_name
      ? `${meta.inviter_name} invited you to ${meta.organization_name}`
      : meta.organization_name
        ? `You've been invited to ${meta.organization_name}`
        : "You've been invited to an assessment"
    : "You've been invited to an assessment";

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
          {status === "checking" && (
            <div className="flex flex-col gap-6" aria-hidden>
              <div className="flex flex-col items-center gap-3">
                <AppleSkeleton className="h-9 w-3/4" />
                <AppleSkeleton className="h-4 w-full max-w-[300px]" />
              </div>
              <AppleCard padding="md">
                <div className="flex flex-col gap-4">
                  <AppleSkeleton className="h-11 w-full" />
                  <AppleSkeleton className="h-11 w-full" />
                  <AppleSkeleton className="h-11 w-full" />
                  <AppleSkeleton className="h-12 w-full" />
                </div>
              </AppleCard>
            </div>
          )}

          {status === "accepting" && (
            <div className="flex flex-col items-center gap-5">
              <div className="h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
              <p className="ts-body text-[var(--text-secondary)]">
                Accepting invitation…
              </p>
            </div>
          )}

          {status === "needs_auth" && meta && token && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h1 className="display display-tight ts-title-1 sm:ts-display leading-[1.1] text-[var(--text-primary)]">
                  {headline}
                </h1>
                <p className="ts-body leading-[1.55] text-[var(--text-secondary)]">
                  {meta.team_name ? `You'll join the ${meta.team_name} team. ` : ""}
                  Create your account to accept the invitation and start your
                  assessment.
                </p>
              </div>

              <AppleCard padding="md" className="text-left">
                <InvitationSignupForm
                  token={token}
                  email={meta.email}
                  orgName={meta.organization_name}
                  onAccepted={handleSignupAccepted}
                />
              </AppleCard>

              <p className="ts-callout text-[var(--text-secondary)]">
                Already have an account?{" "}
                <AppleLink
                  href={`/auth/login?next=${encodeURIComponent(`/auth/invitation/${token}`)}`}
                  className="font-medium"
                >
                  Sign in
                </AppleLink>
              </p>
            </div>
          )}

          {status === "done" && (
            <div className="flex flex-col items-center gap-6">
              <div className="h-14 w-14 rounded-full grid place-items-center bg-[var(--band-a-bg)]">
                <AppleIcon
                  name="check"
                  size="lg"
                  className="text-[var(--band-a-text)]"
                />
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="display display-tight ts-title-1 sm:ts-display leading-[1.1] text-[var(--text-primary)]">
                  Invitation accepted
                </h1>
                <p className="ts-body leading-[1.55] text-[var(--text-secondary)]">
                  Taking you to your dashboard…
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-6">
              <div className="h-14 w-14 rounded-full grid place-items-center bg-[var(--band-b-bg)]">
                <AppleIcon
                  name="alert"
                  size="lg"
                  className="text-[var(--band-b-text)]"
                />
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="display display-tight ts-title-1 sm:ts-display leading-[1.1] text-[var(--text-primary)]">
                  We couldn&apos;t open this invitation
                </h1>
                <p className="ts-body leading-[1.55] text-[var(--text-secondary)]">
                  {errorMsg
                    ? `${errorMsg} `
                    : "It may have expired or already been used. "}
                  Ask whoever invited you to resend the access, or write to{" "}
                  <AppleLink href="mailto:ayuda@itera.la">
                    ayuda@itera.la
                  </AppleLink>{" "}
                  and we&apos;ll help.
                </p>
              </div>
              <AppleButton
                onPress={() => router.push("/")}
                tone="secondary"
                size="lg"
                className="w-full"
              >
                Go home
              </AppleButton>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
