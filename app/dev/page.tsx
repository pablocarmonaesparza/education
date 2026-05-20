/**
 * /dev — menú interno para revisar TODAS las surfaces del Simulador sin
 * tener que hacer login cada vez. Solo funciona en development.
 *
 * Activar/desactivar el bypass del auth guard via cookie `itera_dev_bypass`.
 * Cuando está activado, los layouts (app)/(onboarding) skip el redirect
 * a /auth/login y se renderizan sin sesión válida (las APIs pueden devolver
 * empty/error, pero la UI se ve completa).
 *
 * NUNCA funciona en producción (chequeo de NODE_ENV en los layouts y aquí
 * también — devuelve 404).
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "../(app)/simulador.css";

const SURFACES: { group: string; routes: { path: string; label: string; note?: string }[] }[] = [
  {
    group: "públicas",
    routes: [
      { path: "/", label: "Landing" },
      { path: "/auth/login", label: "Login" },
      { path: "/auth/signup", label: "Signup" },
      { path: "/auth/invitation/demo-token-123", label: "Invitation (token demo)", note: "404 si token no existe" },
      { path: "/field-test/marketing-urgent-campaign-pii", label: "Field-test público" },
      { path: "/privacy", label: "Privacy" },
      { path: "/terms", label: "Terms" },
      { path: "/cancel", label: "Cancel (Stripe)" },
      { path: "/success", label: "Success (Stripe)" },
    ],
  },
  {
    group: "onboarding (5 steps)",
    routes: [
      { path: "/onboarding/org", label: "1. Organización" },
      { path: "/onboarding/team", label: "2. Equipo" },
      { path: "/onboarding/invite", label: "3. Invitar" },
      { path: "/onboarding/billing", label: "4. Plan + pago" },
      { path: "/onboarding/done", label: "5. Listo" },
    ],
  },
  {
    group: "app autenticada",
    routes: [
      { path: "/dashboard", label: "Dashboard (role-aware)" },
      { path: "/case/marketing_urgent_campaign_pii", label: "Caso runtime" },
      { path: "/report/demo-session-id", label: "Reporte (session demo)", note: "404 si session no existe" },
    ],
  },
  {
    group: "admin staff Itera",
    routes: [
      { path: "/admin", label: "Admin index" },
      { path: "/admin/review", label: "Review queue" },
      { path: "/admin/leads", label: "Leads" },
      { path: "/admin/orgs", label: "Orgs" },
      { path: "/admin/judge-health", label: "Judge health" },
      { path: "/admin/audit-log", label: "Audit log" },
    ],
  },
  {
    group: "system",
    routes: [
      { path: "/not-found-test-page", label: "404 (404 intencional)" },
      { path: "/maintenance", label: "Maintenance" },
    ],
  },
];

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function DevMenuPage() {
  const [bypassActive, setBypassActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBypassActive(readCookie("itera_dev_bypass") === "1");
  }, []);

  function toggleBypass() {
    const newValue = !bypassActive;
    if (newValue) {
      // Set cookie for 7 days
      document.cookie = `itera_dev_bypass=1; path=/; max-age=${7 * 24 * 60 * 60}`;
    } else {
      // Remove cookie
      document.cookie = "itera_dev_bypass=; path=/; max-age=0";
    }
    setBypassActive(newValue);
  }

  if (!mounted) return null;

  return (
    <main className="simulador-root min-h-screen surface-canvas px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="eyebrow">Dev menu</div>
        <h1 className="display display-tight mt-4 text-[var(--text-primary)] text-[32px]">
          Acceso a todas las pantallas.
        </h1>
        <p className="mt-3 text-[15px] text-[var(--text-secondary)] leading-[1.5]">
          Esta página solo existe en development. Activa el bypass para entrar
          a rutas protegidas sin login. Algunas APIs devuelven empty/error sin
          sesión real — el layout y copy sí se renderizan.
        </p>

        <div className="mt-8 flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-2)] p-5">
          <div className="flex-1">
            <div className="text-[14px] font-semibold text-[var(--text-primary)]">
              Auth bypass {bypassActive ? "activo" : "inactivo"}
            </div>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
              {bypassActive
                ? "Puedes navegar a /dashboard, /case/*, /report/*, /onboarding/*, /admin/* sin login."
                : "Las rutas protegidas redirigen a /auth/login. Activa el bypass para revisar libre."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleBypass}
            className={`rounded-[var(--radius-md)] px-5 py-2 text-[14px] font-medium transition-colors ${
              bypassActive
                ? "bg-[var(--band-b-bar)] text-white hover:opacity-95"
                : "accent-bg text-white hover:opacity-95"
            }`}
          >
            {bypassActive ? "Desactivar" : "Activar"}
          </button>
        </div>

        <div className="mt-12 space-y-10">
          {SURFACES.map((group) => (
            <section key={group.group}>
              <div className="eyebrow">{group.group}</div>
              <ul className="mt-4 space-y-2">
                {group.routes.map((r) => (
                  <li key={r.path}>
                    <Link
                      href={r.path}
                      className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3 transition-colors hover:bg-[var(--surface-2)]"
                    >
                      <div>
                        <div className="text-[14px] font-medium text-[var(--text-primary)]">
                          {r.label}
                        </div>
                        <div className="mt-0.5 text-[12px] text-[var(--text-tertiary)] font-mono">
                          {r.path}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {r.note && (
                          <span className="text-[11px] text-[var(--text-tertiary)]">
                            {r.note}
                          </span>
                        )}
                        <span className="text-[var(--text-tertiary)]">→</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-[var(--radius-md)] border border-dashed border-[var(--hairline)] p-5">
          <div className="text-[13px] font-semibold text-[var(--text-primary)]">
            ¿Cómo funciona?
          </div>
          <p className="mt-2 text-[12px] text-[var(--text-secondary)] leading-[1.55]">
            El bypass setea cookie <code className="font-mono">itera_dev_bypass=1</code> (7 días).
            Los layouts (app) y (onboarding) la leen en server-side y skip el redirect a /auth/login
            si <code className="font-mono">NODE_ENV !== "production"</code>. En prod la cookie no tiene
            efecto. Para limpiar: click "Desactivar".
          </p>
        </div>
      </div>
    </main>
  );
}
