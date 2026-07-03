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
import {
  ONBOARDING_ORG_ID_KEY,
  ONBOARDING_ORG_NAME_KEY,
  ONBOARDING_TEAM_ID_KEY,
  ONBOARDING_TEAM_NAME_KEY,
} from "@/lib/simulador/onboarding-progress";
import "../(app)/simulador.css";

const SURFACES: { group: string; routes: { path: string; label: string; note?: string }[] }[] = [
  {
    group: "públicas",
    routes: [
      { path: "/", label: "Landing" },
      { path: "/auth/login", label: "Login" },
      { path: "/auth/signup", label: "Signup" },
      { path: "/auth/invitation/demo-token-123", label: "Invitation (token demo)", note: "renderiza la invitación; acepta al autenticar" },
      { path: "/privacy", label: "Privacy" },
      { path: "/terms", label: "Terms" },
      { path: "/cancel", label: "Cancel (Stripe)" },
      { path: "/success", label: "Success (Stripe)" },
    ],
  },
  {
    group: "onboarding (6 steps)",
    routes: [
      { path: "/onboarding/org", label: "1. Organización" },
      { path: "/onboarding/team", label: "2. Equipo" },
      { path: "/onboarding/invite", label: "3. Invitar" },
      { path: "/onboarding/context", label: "4. Perfil de empresa", note: "pre-pago · orienta ejercicios y objetivos" },
      { path: "/onboarding/billing", label: "5. Plan + pago" },
      { path: "/onboarding/done", label: "6. Listo (pago confirmado)", note: "sin session_id muestra el estado de pago no procesado" },
    ],
  },
  {
    group: "cliente — manager (org_admin)",
    routes: [
      { path: "/staff", label: "Inicio del manager (sprint overview)" },
      { path: "/staff/equipo", label: "Equipo (miembros + matriz)" },
      { path: "/staff/reportes", label: "Reportes agregados del team" },
      { path: "/staff/casos", label: "Casos del team (catálogo)" },
      { path: "/staff/matriz", label: "Matriz dimensión × banda del equipo" },
      { path: "/staff/recomendaciones", label: "Recomendaciones por persona" },
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
    group: "motor de casos · runtime",
    routes: [
      { path: "/case-demo", label: "Demo jugable del caso (sin login)", note: "salida del motor · hoy: vértiz, 25 ejercicios" },
      { path: "/case/vertiz_backlog_entregas", label: "Runtime productivo (RuntimeExperienceV2)", note: "bypass · único motor del simulador, juega cualquier caso generado" },
      { path: "/case/no-existe-este-caso", label: "Caso inexistente", note: "404 diseñado (app/not-found.tsx) · no fallback roto" },
      { path: "/dashboard", label: "Dashboard router → /staff" },
      { path: "/report/demo-session-id", label: "Reporte (session demo)", note: "404 si session no existe" },
    ],
  },
  {
    group: "interno — Itera staff",
    routes: [
      { path: "/admin", label: "Admin index", note: "pulso + submenu" },
      { path: "/admin/review", label: "Review queue" },
      { path: "/admin/leads", label: "Leads" },
      { path: "/admin/orgs", label: "Orgs (clientes)" },
      { path: "/admin/captacion", label: "Captación", note: "prospectos DuckDB + score IA" },
      { path: "/admin/cases", label: "Casos", note: "bespoke + biblioteca global" },
      { path: "/admin/lecciones", label: "Lecciones", note: "practice beats + completion" },
      { path: "/admin/judge-health", label: "Judge health" },
      { path: "/admin/audit-log", label: "Audit log" },
    ],
  },
  {
    group: "labs internos (metodología de casos)",
    routes: [
      { path: "/exercise-lab", label: "Exercise lab — 11 bloques canónicos", note: "público · catálogo de interacciones" },
      { path: "/case-template", label: "Case template — plantilla vacía de un caso", note: "público · estructura fijo+variable" },
      { path: "/aprender-demo", label: "Aprender demo — motor educativo (segundo motor)", note: "dev-only · no indexa" },
    ],
  },
  {
    group: "system",
    routes: [
      { path: "/design", label: "Design system (editor de tokens en vivo)", note: "single source of truth" },
      { path: "/design/components", label: "Catálogo de componentes Apple", note: "todas las variantes/estados" },
      { path: "/not-found-test-page", label: "404 (404 intencional)" },
      { path: "/maintenance", label: "Maintenance" },
    ],
  },
];

const REVIEWED_KEY = "itera_dev_reviewed_routes";

// En production el bypass es opt-in con cookie `=1` (ver lib/dev/devBypass).
// Esta flag NEXT_PUBLIC es visible en cliente y está ON solo si el proyecto la
// habilitó en Vercel (NEXT_PUBLIC_DEV_BYPASS_ENABLED=1). Cuando lo está, /dev
// arma la cookie automáticamente al entrar, para que el tour de /admin/* y
// demás rutas protegidas funcione igual que en localhost — sin el dance manual
// de Desactivar→Activar.
const PROD_REVIEW_ENABLED =
  process.env.NEXT_PUBLIC_DEV_BYPASS_ENABLED === "1";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Todos los keys de flow-state del onboarding que el preview puede tocar.
const ONBOARDING_FLOW_KEYS = [
  ONBOARDING_ORG_ID_KEY,
  ONBOARDING_ORG_NAME_KEY,
  ONBOARDING_TEAM_ID_KEY,
  ONBOARDING_TEAM_NAME_KEY,
  "onboarding_invite_completed",
  "onboarding_context_completed",
  "onboarding_unlocked_step",
  "onboarding_company_profile",
];

const ORG_SEED: Record<string, string> = {
  [ONBOARDING_ORG_ID_KEY]: "dev-preview-org",
  [ONBOARDING_ORG_NAME_KEY]: "Organización de prueba",
};
const TEAM_SEED: Record<string, string> = {
  [ONBOARDING_TEAM_ID_KEY]: "dev-preview-team",
  [ONBOARDING_TEAM_NAME_KEY]: "Marketing",
};
const CONTEXT_SEED: Record<string, string> = {
  onboarding_context_completed: "true",
};

// Flow-state que se siembra al SALTAR a cada paso desde /dev. Cada paso siembra
// SOLO los pasos previos como completados, nunca el actual — así el gate de
// avance (chevron "siguiente" de OnboardingNav, que deriva de
// getOnboardingUnlockedStep) se respeta en QA igual que en producción: no
// avanzas hasta contestar el paso, y al regresar a un paso ya completado el
// avance se reactiva. Las APIs fallan con estos IDs, pero la UI se renderiza
// completa para revisar la pantalla sin rebotar a /onboarding/org.
const ONBOARDING_FLOW_STATE: Record<string, Record<string, string>> = {
  "/onboarding/org": {},
  "/onboarding/team": { ...ORG_SEED },
  "/onboarding/invite": { ...ORG_SEED, ...TEAM_SEED },
  "/onboarding/context": { ...ORG_SEED, ...TEAM_SEED },
  "/onboarding/billing": { ...ORG_SEED, ...TEAM_SEED, ...CONTEXT_SEED },
  "/onboarding/done": { ...ORG_SEED, ...TEAM_SEED, ...CONTEXT_SEED },
};

function seedOnboardingForPath(path: string) {
  if (typeof sessionStorage === "undefined") return;
  const state = ONBOARDING_FLOW_STATE[path];
  if (!state) return; // no es un paso de onboarding — no tocar nada
  // Parte del prefijo exacto de este paso: limpia el flow-state previo
  // (incluido cualquier unlocked_step heredado) y siembra solo lo anterior.
  for (const k of ONBOARDING_FLOW_KEYS) sessionStorage.removeItem(k);
  for (const [k, v] of Object.entries(state)) sessionStorage.setItem(k, v);
}

function clearOnboardingPreview() {
  if (typeof sessionStorage === "undefined") return;
  for (const k of ONBOARDING_FLOW_KEYS) sessionStorage.removeItem(k);
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
    let cookie = readCookie("itera_dev_bypass");
    // Production con review habilitado: si no hay cookie, la armamos a "1" para
    // que el bypass quede activo de una (igual que el default-on de localhost).
    // Si ya hay cookie (el usuario optó por 0 o 1), la respetamos.
    if (PROD_REVIEW_ENABLED && cookie === null) {
      document.cookie = `itera_dev_bypass=1; path=/; max-age=${7 * 24 * 60 * 60}`;
      cookie = "1";
    }
    setBypassActive(cookie !== "0");
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
      // El flow-state se siembra por-paso al hacer click en su link (abajo),
      // no global — así el gate de avance del onboarding se respeta en QA.
    } else {
      // Opt-out como cookie de SESIÓN (sin max-age): se borra al cerrar el
      // browser, así un "Desactivar" accidental no te atrapa en login durante
      // días — al reabrir vuelve el default-on de dev.
      document.cookie = "itera_dev_bypass=0; path=/";
      clearOnboardingPreview();
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
        <h1 className="display display-tight text-[var(--text-primary)] ts-display">
          Acceso a todas las pantallas
        </h1>

        <div className="mt-6 flex items-center gap-3 ts-subhead text-[var(--text-secondary)]">
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
                className="ts-subhead text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2"
              >
                Reset
              </button>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-2)] p-5">
          <div className="flex-1">
            <div className="ts-callout font-semibold text-[var(--text-primary)]">
              Auth bypass {bypassActive ? "activo" : "inactivo"}
            </div>
            <p className="mt-1 ts-subhead text-[var(--text-secondary)]">
              {bypassActive
                ? "Puedes navegar a /dashboard, /case/*, /report/*, /onboarding/*, /admin/* sin login."
                : "Las rutas protegidas redirigen a /auth/login. Activa el bypass para revisar libre."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleBypass}
            className={`rounded-[var(--radius-md)] px-5 py-2 ts-callout font-medium transition-colors ${
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
            <div className="ts-callout font-semibold text-[var(--text-primary)]">
              Theme · {theme === "system" ? `system (${resolvedTheme})` : theme}
            </div>
            <p className="mt-1 ts-subhead text-[var(--text-secondary)]">
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
                  className={`rounded-[calc(var(--radius-md)-4px)] px-3 py-1.5 ts-subhead font-medium transition-colors capitalize ${
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
                  <span className="ts-caption-1 text-[var(--text-tertiary)] tabular-nums">
                    {groupReviewed}/{group.routes.length}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {group.routes.map((r) => {
                    const isReviewed = reviewed.has(r.path);
                    return (
                      <li
                        key={r.path}
                        className={`flex items-stretch gap-0 overflow-hidden rounded-[var(--radius-md)] border transition-colors ${
                          isReviewed
                            ? "border-[var(--band-a-bar)] bg-[var(--band-a-bg)]"
                            : "border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
                        }`}
                      >
                        <Link
                          href={r.path}
                          onClick={() => seedOnboardingForPath(r.path)}
                          className="flex flex-1 items-center justify-between px-4 py-3"
                        >
                          <div>
                            <div className="ts-callout font-medium text-[var(--text-primary)]">
                              {r.label}
                            </div>
                            <div className="mt-0.5 ts-footnote text-[var(--text-tertiary)] font-mono">
                              {r.path}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {r.note && (
                              <span className="ts-caption-1 text-[var(--text-tertiary)]">
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
                          className={`flex w-12 items-center justify-center rounded-r-[calc(var(--radius-md)-1px)] border-l transition-colors ${
                            isReviewed
                              ? "border-[var(--band-a-bar)] bg-[var(--band-a-bar)] text-white hover:opacity-90"
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
          <div className="ts-subhead font-semibold text-[var(--text-primary)]">
            ¿Cómo funciona?
          </div>
          <p className="mt-2 ts-footnote text-[var(--text-secondary)] leading-[1.55]">
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
