"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppleBadge, AppleButton } from "@/components/simulador/apple";
import { AdminMetric } from "./shared";

type Overview = {
  orgs: number | null;
  active_cases: number | null;
  draft_cases: number | null;
  active_lessons: number | null;
  draft_lessons: number | null;
};

export default function AdminIndexPage() {
  const [pulse, setPulse] = useState<Overview | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/overview", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as Overview;
        if (active) setPulse(json);
      } catch {
        // El pulso es best-effort: si falla, las tarjetas siguen navegables.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const m = (v: number | null | undefined) => (v == null ? "—" : v);

  return (
    <>
      <main className="surface-canvas min-h-screen px-6 py-12">
        <section className="mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="display display-tight ts-display text-[var(--text-primary)] sm:ts-display-lg">
                  operación del simulador
                </h1>
                <p className="mt-4 max-w-2xl ts-body leading-[1.6] text-[var(--text-secondary)]">
                  Entrada única del backoffice. Clientes, casos, lecciones, colas
                  humanas y salud del judge en un solo lugar.
                </p>
              </div>
              <AppleBadge tone="accent">cleanroom front</AppleBadge>
            </div>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <AdminMetric label="Clientes" value={m(pulse?.orgs)} compact />
            <AdminMetric
              label="Casos activos"
              value={m(pulse?.active_cases)}
              compact
            />
            <AdminMetric
              label="Casos borrador"
              value={m(pulse?.draft_cases)}
              compact
            />
            <AdminMetric
              label="Lecciones activas"
              value={m(pulse?.active_lessons)}
              compact
            />
            <AdminMetric
              label="Lecciones borrador"
              value={m(pulse?.draft_lessons)}
              compact
            />
          </div>

          <div className="mt-10">
            <AppleButton as={Link} href="/dashboard" tone="ghost">
              Volver al dashboard
            </AppleButton>
          </div>
        </section>
      </main>
    </>
  );
}
