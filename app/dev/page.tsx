/**
 * /dev — menú interno para revisar TODAS las surfaces del Simulador sin
 * tener que hacer login cada vez. Solo funciona en development.
 *
 * Activar/desactivar el bypass del auth guard via cookie `itera_dev_bypass`.
 * Cuando está activado, los layouts (app)/(onboarding) skip el redirect
 * a /auth/login y se renderizan sin sesión válida (las APIs pueden devolver
 * empty/error, pero la UI se ve completa).
 *
 * Cada ruta tiene un botón "marcar como revisada" que persiste en
 * localStorage (key: itera_dev_reviewed_routes) para trackear progreso
 * de QA visual.
 *
 * NUNCA funciona en producción (chequeo de NODE_ENV en los layouts y aquí
 * también — devuelve 404).
 */

"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
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
    group: "cliente — manager (org_admin)",
    routes: [
      { path: "/staff", label: "Inicio del manager (sprint overview)" },
      { path: "/staff/equipo", label: "Equipo (miembros + matriz)" },
      { path: "/staff/reportes", label: "Reportes agregados del team" },
      { path: "/staff/casos", label: "Casos del team (catálogo)" },
      { path: "/empresa", label: "Empresa (settings org)" },
    ],
  },
  {
    group: "cliente — employee",
    routes: [
      { path: "/team", label: "Inicio (bento: performance + leaderboard + recomendados)" },
      { path: "/casos", label: "Catálogo de casos" },
      { path: "/reportes", label: "Mis reportes" },
      { path: "/perfil", label: "Perfil (settings personales)" },
    ],
  },
  {
    group: "app — flow del caso",
    routes: [
      { path: "/dashboard", label: "Dashboard router → /staff" },
      { path: "/case/marketing_urgent_campaign_pii", label: "Caso runtime" },
      { path: "/report/demo-session-id", label: "Reporte (session demo)", note: "404 si session no existe" },
    ],
  },
  {
    group: "interno — Itera staff",
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
    group: "labs internos (metodología de casos)",
    routes: [
      { path: "/exercise-lab", label: "Exercise lab — 11 bloques canónicos", note: "público · catálogo de interacciones" },
      { path: "/case-template", label: "Case template — plantilla vacía de un caso", note: "público · estructura fijo+variable" },
    ],
  },
  {
    group: "system",
    routes: [
      { path: "/design", label: "Design system (editor de tokens en vivo)", note: "single source of truth" },
      { path: "/not-found-test-page", label: "404 (404 intencional)" },
      { path: "/maintenance", label: "Maintenance" },
    ],
  },
];

const REVIEWED_KEY = "itera_dev_reviewed_routes";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function readReviewed(): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(REVIEWED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

function writeReviewed(set: Set<string>) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(REVIEWED_KEY, JSON.stringify(Array.from(set)));
}

export default function DevMenuPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [bypassActive, setBypassActive] = useState(false);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBypassActive(readCookie("itera_dev_bypass") === "1");
    setReviewed(readReviewed());
  }, []);

  const totalRoutes = useMemo(
    () => SURFACES.reduce((acc, g) => acc + g.routes.length, 0),
    [],
  );

  function toggleBypass() {
    const newValue = !bypassActive;
    if (newValue) {
      document.cookie = `itera_dev_bypass=1; path=/; max-age=${7 * 24 * 60 * 60}`;
    } else {
      document.cookie = "itera_dev_bypass=; path=/; max-age=0";
    }
    setBypassActive(newValue);
  }

  function toggleReviewed(path: string) {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      writeReviewed(next);
      return next;
    });
  }

  function resetReviewed() {
    setReviewed(new Set());
    writeReviewed(new Set());
  }

  if (!mounted) return null;

  return (
    <main className="simulador-root min-h-screen surface-canvas px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="display display-tight text-[var(--text-primary)] text-[32px]">
          Acceso a todas las pantallas
        </h1>

        <div className="mt-6 flex items-center gap-3 text-[13px] text-[var(--text-secondary)]">
          <span>
            <span className="font-semibold text-[var(--text-primary)]">{reviewed.size}</span>
            <span> / {totalRoutes} revisadas</span>
          </span>
          {reviewed.size > 0 && (
            <>
              <span className="text-[var(--hairline-strong)]">·</span>
              <button
                type="button"
                onClick={resetReviewed}
                className="text-[13px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2"
              >
                Reset
              </button>
            </>
          )}
        </div>

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

        <div className="mt-4 flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-2)] p-5">
          <div className="flex-1">
            <div className="text-[14px] font-semibold text-[var(--text-primary)]">
              Theme · {theme === "system" ? `system (${resolvedTheme})` : theme}
            </div>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
              Por default sigue `prefers-color-scheme` de tu sistema operativo.
              Aquí puedes forzar manualmente para QA visual.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Theme"
            className="inline-flex rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] p-1"
          >
            {(["light", "system", "dark"] as const).map((t) => {
              const isActive = theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setTheme(t)}
                  className={`rounded-[calc(var(--radius-md)-4px)] px-3 py-1.5 text-[13px] font-medium transition-colors capitalize ${
                    isActive
                      ? "accent-bg text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t === "system" ? "auto" : t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 space-y-10">
          {SURFACES.map((group) => {
            const groupReviewed = group.routes.filter((r) => reviewed.has(r.path)).length;
            return (
              <section key={group.group}>
                <div className="flex items-center gap-2">
                  <div className="eyebrow">{group.group}</div>
                  <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums">
                    {groupReviewed}/{group.routes.length}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {group.routes.map((r) => {
                    const isReviewed = reviewed.has(r.path);
                    return (
                      <li
                        key={r.path}
                        className={`flex items-stretch gap-0 rounded-[var(--radius-md)] border transition-colors ${
                          isReviewed
                            ? "border-[#16a34a]/30 bg-[#22c55e]/5"
                            : "border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
                        }`}
                      >
                        <Link
                          href={r.path}
                          className="flex flex-1 items-center justify-between px-4 py-3"
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
                        <button
                          type="button"
                          onClick={() => toggleReviewed(r.path)}
                          aria-label={isReviewed ? "Marcar como pendiente" : "Marcar como revisada"}
                          aria-pressed={isReviewed}
                          title={isReviewed ? "Revisada — click para desmarcar" : "Marcar como revisada"}
                          className={`flex w-12 items-center justify-center border-l transition-colors ${
                            isReviewed
                              ? "border-[#16a34a]/30 bg-[#22c55e] text-white hover:bg-[#16a34a]"
                              : "border-[var(--hairline)] bg-transparent text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {isReviewed ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <circle cx="12" cy="12" r="9" />
                            </svg>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-16 rounded-[var(--radius-md)] border border-dashed border-[var(--hairline)] p-5">
          <div className="text-[13px] font-semibold text-[var(--text-primary)]">
            ¿Cómo funciona?
          </div>
          <p className="mt-2 text-[12px] text-[var(--text-secondary)] leading-[1.55]">
            El bypass setea cookie <code className="font-mono">itera_dev_bypass=1</code> (7 días).
            Los layouts (app) y (onboarding) la leen en server-side y skip el redirect a /auth/login
            si <code className="font-mono">NODE_ENV !== &quot;production&quot;</code>. En prod la cookie no tiene
            efecto. Las marcas de "revisada" viven en <code className="font-mono">localStorage</code> del
            browser (no se sincronizan entre dispositivos). Para limpiar todo: click "Reset" arriba.
          </p>
        </div>
      </div>
    </main>
  );
}
