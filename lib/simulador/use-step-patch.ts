/**
 * useStepPatch — guardado debounced de respuestas del runtime a la BD.
 *
 * Cada llamada a `patch(stepKey, payload, metrics)` reemplaza el timer previo
 * del mismo step_key. Si en 800ms no llega otra llamada → dispara PATCH a
 * /api/sessions/[id]/responses.
 *
 * El servidor es append-only (audit trail completo) — múltiples PATCH del
 * mismo step solo agregan rows. Mantenemos el debounce en cliente para
 * evitar latigueo cuando el usuario teclea rápido.
 *
 * También expone `flush(stepKey?)` para forzar inmediato (útil antes de
 * navegar al siguiente section o al hacer `complete`).
 */

"use client";

import { useCallback, useEffect, useRef } from "react";

interface QueueEntry {
  payload: unknown;
  metrics?: Record<string, unknown>;
  timer: ReturnType<typeof setTimeout> | null;
}

const DEBOUNCE_MS = 800;

async function sendPatch(
  sessionId: string,
  stepKey: string,
  payload: unknown,
  metrics: Record<string, unknown> | undefined,
): Promise<void> {
  try {
    const res = await fetch(`/api/sessions/${sessionId}/responses`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        step_key: stepKey,
        payload: payload ?? {},
        metrics: metrics ?? {},
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      console.error(
        "[useStepPatch] PATCH failed",
        stepKey,
        res.status,
        data?.error,
      );
    }
  } catch (err) {
    // Best-effort: la sesión persiste local en estado React. Próximo intento
    // (siguiente patch o flush) lo manda de nuevo.
    console.error("[useStepPatch] network error", stepKey, err);
  }
}

export function useStepPatch(sessionId: string | null) {
  const queueRef = useRef<Map<string, QueueEntry>>(new Map());

  const patch = useCallback(
    (stepKey: string, payload: unknown, metrics?: Record<string, unknown>) => {
      if (!sessionId) return;

      const queue = queueRef.current;
      const existing = queue.get(stepKey);
      if (existing?.timer) clearTimeout(existing.timer);

      const timer = setTimeout(() => {
        queue.delete(stepKey);
        void sendPatch(sessionId, stepKey, payload, metrics);
      }, DEBOUNCE_MS);

      queue.set(stepKey, { payload, metrics, timer });
    },
    [sessionId],
  );

  /**
   * Fuerza envío inmediato del step pendiente (o todos si stepKey es
   * undefined). Devuelve la promesa de la(s) llamada(s).
   */
  const flush = useCallback(
    async (stepKey?: string): Promise<void> => {
      if (!sessionId) return;
      const queue = queueRef.current;
      const entries: [string, QueueEntry][] = stepKey
        ? queue.has(stepKey)
          ? [[stepKey, queue.get(stepKey)!]]
          : []
        : Array.from(queue.entries());

      await Promise.all(
        entries.map(async ([key, entry]) => {
          if (entry.timer) clearTimeout(entry.timer);
          queue.delete(key);
          await sendPatch(sessionId, key, entry.payload, entry.metrics);
        }),
      );
    },
    [sessionId],
  );

  // Cleanup en unmount: cancelar timers pendientes (la ref se captura en el
  // setup del efecto para evitar el warning de react-hooks/exhaustive-deps).
  useEffect(() => {
    const queue = queueRef.current;
    return () => {
      for (const [, entry] of queue) {
        if (entry.timer) clearTimeout(entry.timer);
      }
      // Nota: flush al unmount es opcional — el runtime hace flush manual
      // antes de navegar. Aquí solo limpiamos timers.
    };
  }, []);

  return { patch, flush };
}
