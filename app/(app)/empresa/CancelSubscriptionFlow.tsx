"use client";

/**
 * CancelSubscriptionFlow — cancelación in-app (F3), complementa el portal de
 * Stripe. Confirmación de un solo foco (estilo Typeform): explica que el acceso
 * sigue hasta el fin del periodo pagado, pide un motivo opcional, y confirma.
 * Llama a POST /api/stripe/cancel-subscription (cancel_at_period_end).
 */

import { useState } from "react";
import {
  AppleButton,
  AppleModal,
  AppleModalBody,
  AppleModalContent,
  AppleModalFooter,
  AppleModalHeader,
  AppleTextarea,
} from "@/components/simulador/apple";

function fmtDate(iso: string | null): string {
  if (!iso) return "el fin de tu periodo actual";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CancelSubscriptionFlow({
  renewsLabel,
}: {
  renewsLabel?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [accessUntil, setAccessUntil] = useState<string | null>(null);

  function reset() {
    setReason("");
    setStatus("idle");
    setError(null);
    setAccessUntil(null);
  }

  async function confirmCancel() {
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? `No pudimos cancelar (${res.status}).`);
      }
      setAccessUntil(data?.access_until ?? null);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Error inesperado.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="self-start ts-caption-1 text-[var(--text-tertiary)] underline-offset-2 transition-colors hover:text-[var(--band-b-text)] hover:underline"
      >
        Cancelar suscripción
      </button>

      <AppleModal isOpen={open} onOpenChange={setOpen}>
        <AppleModalContent>
          {status === "done" ? (
            <>
              <AppleModalHeader className="flex flex-col gap-1">
                Suscripción cancelada
              </AppleModalHeader>
              <AppleModalBody>
                <p className="ts-subhead leading-relaxed text-[var(--text-secondary)]">
                  Listo. Tu equipo conserva acceso completo hasta{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {fmtDate(accessUntil)}
                  </span>
                  . No se hará ningún cobro nuevo. Puedes reactivar antes de esa
                  fecha desde el portal de facturación.
                </p>
              </AppleModalBody>
              <AppleModalFooter>
                <AppleButton
                  tone="primary"
                  onPress={() => setOpen(false)}
                  className="px-5"
                >
                  Entendido
                </AppleButton>
              </AppleModalFooter>
            </>
          ) : (
            <>
              <AppleModalHeader className="flex flex-col gap-1">
                ¿Cancelar tu suscripción?
              </AppleModalHeader>
              <AppleModalBody>
                <p className="ts-subhead leading-relaxed text-[var(--text-secondary)]">
                  Tu equipo mantiene acceso completo hasta{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {renewsLabel ?? "el fin del periodo ya pagado"}
                  </span>
                  . No se cortará ninguna sesión en curso ni habrá cobros nuevos.
                </p>
                <div className="mt-4">
                  <label className="ts-caption-1 text-[var(--text-tertiary)]">
                    ¿Qué nos faltó? (opcional)
                  </label>
                  <div className="mt-1.5">
                    <AppleTextarea
                      value={reason}
                      onValueChange={setReason}
                      placeholder="Nos ayuda a mejorar. Cuéntanos en una línea."
                      minRows={2}
                      maxRows={4}
                    />
                  </div>
                </div>
                {error && (
                  <p className="mt-3 ts-caption-1 text-[var(--band-b-text)]">
                    {error}
                  </p>
                )}
              </AppleModalBody>
              <AppleModalFooter>
                <AppleButton
                  tone="secondary"
                  onPress={() => setOpen(false)}
                  className="px-5"
                >
                  Mantener plan
                </AppleButton>
                <AppleButton
                  tone="primary"
                  onPress={confirmCancel}
                  isLoading={status === "submitting"}
                  className="px-5"
                >
                  Sí, cancelar
                </AppleButton>
              </AppleModalFooter>
            </>
          )}
        </AppleModalContent>
      </AppleModal>
    </>
  );
}
