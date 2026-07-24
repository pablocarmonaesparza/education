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
  if (!iso) return "the end of your current period";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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
        throw new Error(data?.error ?? `We couldn't cancel (${res.status}).`);
      }
      setAccessUntil(data?.access_until ?? null);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
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
        Cancel subscription
      </button>

      <AppleModal isOpen={open} onOpenChange={setOpen}>
        <AppleModalContent>
          {status === "done" ? (
            <>
              <AppleModalHeader className="flex flex-col gap-1">
                Subscription canceled
              </AppleModalHeader>
              <AppleModalBody>
                <p className="ts-subhead leading-relaxed text-[var(--text-secondary)]">
                  Done. Your team keeps full access until{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {fmtDate(accessUntil)}
                  </span>
                  . You won&apos;t be charged again. You can reactivate before
                  that date from the billing portal.
                </p>
              </AppleModalBody>
              <AppleModalFooter>
                <AppleButton
                  tone="primary"
                  onPress={() => setOpen(false)}
                  className="px-5"
                >
                  Got it
                </AppleButton>
              </AppleModalFooter>
            </>
          ) : (
            <>
              <AppleModalHeader className="flex flex-col gap-1">
                Cancel your subscription?
              </AppleModalHeader>
              <AppleModalBody>
                <p className="ts-subhead leading-relaxed text-[var(--text-secondary)]">
                  Your team keeps full access until{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {renewsLabel ?? "the end of the period you already paid for"}
                  </span>
                  . No session in progress gets cut off, and you won&apos;t be
                  charged again.
                </p>
                <div className="mt-4">
                  <label className="ts-caption-1 text-[var(--text-tertiary)]">
                    What did we miss? (optional)
                  </label>
                  <div className="mt-1.5">
                    <AppleTextarea
                      value={reason}
                      onValueChange={setReason}
                      placeholder="This helps us improve. Tell us in one line."
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
                  Keep plan
                </AppleButton>
                <AppleButton
                  tone="primary"
                  onPress={confirmCancel}
                  isLoading={status === "submitting"}
                  className="px-5"
                >
                  Yes, cancel
                </AppleButton>
              </AppleModalFooter>
            </>
          )}
        </AppleModalContent>
      </AppleModal>
    </>
  );
}
