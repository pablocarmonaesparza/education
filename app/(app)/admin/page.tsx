"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppleCard, AppleCardBody, AppleKpiCard } from "@/components/simulador/apple";

type Overview = {
  orgs: number | null;
  active_cases: number | null;
  draft_cases: number | null;
  active_lessons: number | null;
  draft_lessons: number | null;
  review_pending: number | null;
  review_overdue: number | null;
  leads_new: number | null;
};

type AttentionItem = {
  href: string;
  tone: "danger" | "warning" | "default";
  title: string;
  detail: string;
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

  const v = (n: number | null | undefined) => (n == null ? "—" : String(n));

  const overdue = pulse?.review_overdue ?? 0;
  const pendingNotOverdue = Math.max((pulse?.review_pending ?? 0) - overdue, 0);
  const newLeads = pulse?.leads_new ?? 0;

  const attention: AttentionItem[] = [];
  if (overdue > 0) {
    attention.push({
      href: "/admin/review",
      tone: "danger",
      title: `${overdue} review${overdue === 1 ? "" : "s"} con SLA vencido`,
      detail: "Reports retenidos esperando doble firma. Resolver primero.",
    });
  }
  if (pendingNotOverdue > 0) {
    attention.push({
      href: "/admin/review",
      tone: "warning",
      title: `${pendingNotOverdue} en cola de review`,
      detail: "Dentro de SLA todavía, pero esperando firma humana.",
    });
  }
  if (newLeads > 0) {
    attention.push({
      href: "/admin/leads",
      tone: "default",
      title: `${newLeads} lead${newLeads === 1 ? "" : "s"} sin triage`,
      detail: "Terminaron el diagnóstico y pidieron contacto comercial.",
    });
  }

  return (
    <main className="surface-canvas min-h-screen px-6 py-12">
      <section className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="display ts-display text-[var(--text-primary)] sm:ts-display-lg">
            operación del simulador
          </h1>
          <p className="mt-4 max-w-2xl ts-body leading-[1.6] text-[var(--text-secondary)]">
            Entrada única del backoffice. Lo que necesita una decisión ahora,
            primero; el pulso general del simulador, después.
          </p>
        </motion.div>

        <div className="mt-10">
          {pulse === null ? (
            <div className="ts-callout text-[var(--text-tertiary)]">
              Cargando pulso…
            </div>
          ) : attention.length === 0 ? (
            <div className="ts-callout text-[var(--text-tertiary)]">
              Nada pendiente ahora mismo.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {attention.map((item) => (
                <Link key={item.title} href={item.href}>
                  <AppleCard
                    variant={item.tone === "default" ? "default" : item.tone}
                    padding="md"
                    isPressable
                  >
                    <AppleCardBody>
                      <div className="ts-headline font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </div>
                      <p className="mt-1 ts-subhead leading-[1.4] text-[var(--text-secondary)]">
                        {item.detail}
                      </p>
                    </AppleCardBody>
                  </AppleCard>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <div className="ts-caption-1 font-medium text-[var(--text-tertiary)]">
            Pulso general
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <AppleKpiCard label="Clientes" value={v(pulse?.orgs)} />
            <AppleKpiCard label="Casos activos" value={v(pulse?.active_cases)} />
            <AppleKpiCard label="Casos borrador" value={v(pulse?.draft_cases)} />
            <AppleKpiCard label="Lecciones activas" value={v(pulse?.active_lessons)} />
            <AppleKpiCard label="Lecciones borrador" value={v(pulse?.draft_lessons)} />
          </div>
        </div>
      </section>
    </main>
  );
}
