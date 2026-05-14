/**
 * useSession — lifecycle hook para el runtime del Simulador.
 *
 * Comportamiento:
 *   1. Al montar, POST /api/sessions con { case_slug } para crear/resumir.
 *   2. Si la API responde `resumed: true`, GET /api/sessions/[id] para
 *      restaurar las respuestas previas (por step_key).
 *   3. Expone `status` ('creating' | 'ready' | 'error') + datos derivados.
 *
 * Uso:
 *   const session = useSession("marketing_urgent_campaign_pii");
 *   if (session.status === 'creating') return <Spinner />;
 *   if (session.status === 'error') return <ErrorBanner msg={session.error} />;
 *   // session.sessionId, session.responses, session.caseTemplateId disponibles.
 *
 * No se llama a `complete` aquí — el runtime decide cuándo cerrar (ver
 * useSessionComplete o invocar fetch directo desde el handler de submit).
 */

"use client";

import { useEffect, useState } from "react";

export type SessionStatus = "creating" | "ready" | "error";

export interface UseSessionState {
  status: SessionStatus;
  sessionId: string | null;
  caseTemplateId: string | null;
  caseVariantId: string | null;
  /** Respuestas previas indexadas por step_key. Vacío si es sesión nueva. */
  responses: Record<string, unknown>;
  /** True si la API devolvió una sesión existente (no recién creada). */
  resumed: boolean;
  error: string | null;
}

export function useSession(caseSlug: string | null | undefined): UseSessionState {
  const [state, setState] = useState<UseSessionState>({
    status: "creating",
    sessionId: null,
    caseTemplateId: null,
    caseVariantId: null,
    responses: {},
    resumed: false,
    error: null,
  });

  useEffect(() => {
    if (!caseSlug) return;
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ case_slug: caseSlug }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(
            typeof data?.error === "string"
              ? data.error
              : "No se pudo iniciar la sesión.",
          );
        }

        // Resume → traer respuestas previas.
        let responses: Record<string, unknown> = {};
        if (data.resumed) {
          const r = await fetch(`/api/sessions/${data.session_id}`, {
            cache: "no-store",
          });
          if (cancelled) return;
          const d = await r.json();
          if (r.ok && d?.responses && typeof d.responses === "object") {
            responses = d.responses as Record<string, unknown>;
          }
        }

        if (cancelled) return;
        setState({
          status: "ready",
          sessionId: data.session_id,
          caseTemplateId: data.case_template_id ?? null,
          caseVariantId: data.case_variant_id ?? null,
          responses,
          resumed: Boolean(data.resumed),
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          sessionId: null,
          caseTemplateId: null,
          caseVariantId: null,
          responses: {},
          resumed: false,
          error: err instanceof Error ? err.message : "Error inesperado.",
        });
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [caseSlug]);

  return state;
}
