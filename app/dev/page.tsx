/**
 * /dev — menú interno para revisar TODAS las surfaces del Simulador sin
 * tener que hacer login cada vez. Solo funciona en development.
 *
 * Vista de cuadrícula (3 col por sección) con PREVIEW EN VIVO de cada pantalla:
 * cada celda monta un <iframe> de la ruta (misma origin → X-Frame-Options
 * SAMEORIGIN lo permite) renderizado a un viewport de escritorio y escalado a
 * miniatura. La carga es diferida (IntersectionObserver): el iframe solo se
 * monta cuando la celda entra en viewport, para no disparar ~40 cargas del dev
 * server de golpe. Toggle "Previews" para apagarlo si molesta.
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
 * NUNCA funciona en producción real: isDevBypassEnabled() es false
 * incondicional en VERCEL_ENV=production (R-06, lib/dev/devBypass) y el proxy
 * (proxy.ts) responde 404 para /dev antes de llegar a esta página.
 */

"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    group: "onboarding (5 steps)",
    routes: [
      { path: "/onboarding/org", label: "1. Organización" },
      { path: "/onboarding/team", label: "2. Equipo" },
      { path: "/onboarding/invite", label: "3. Invitar" },
      { path: "/onboarding/billing", label: "4. Plan + pago" },
      { path: "/onboarding/done", label: "5. Listo (pago confirmado)", note: "sin session_id muestra el estado de pago no procesado" },
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
const PREVIEWS_KEY = "itera_dev_previews_on";

// Viewport de diseño del preview: se renderiza el iframe a este tamaño (un
// escritorio) y se escala a lo ancho de la celda. 16:10 = 1440x900 exacto, así
// el aspect-[16/10] del contenedor calza sin barras.
const DESIGN_W = 1440;
const DESIGN_H = 900;

// Flag de review NEXT_PUBLIC (visible en cliente), ON solo si el proyecto la
// habilitó en Vercel (NEXT_PUBLIC_DEV_BYPASS_ENABLED=1). SOLO tiene efecto
// fuera de producción real: en VERCEL_ENV=production el bypass está apagado
// incondicionalmente (R-06, lib/dev/devBypass) y /dev devuelve 404 desde el
// proxy, así que esta flag no puede encender nada ahí. En Vercel preview, con
// la flag ON, /dev arma la cookie automáticamente al entrar para que el tour
// de /admin/* y demás rutas protegidas funcione igual que en localhost — sin
// el dance manual de Desactivar→Activar.
const FLAG_REVIEW_ENABLED =
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

// Los previews en iframe comparten el sessionStorage de esta pestaña (misma
// origin). No podemos sembrar 6 estados distintos a la vez, así que sembramos
// el estado MÁS completo: con org+team+context+invite marcados, ningún paso de
// onboarding rebota a /onboarding/org y cada iframe renderiza su propia
// pantalla. El click real (seedOnboardingForPath) reajusta el gate por-paso.
const ONBOARDING_PREVIEW_SEED: Record<string, string> = {
  ...ORG_SEED,
  ...TEAM_SEED,
  ...CONTEXT_SEED,
  onboarding_invite_completed: "true",
};

function seedOnboardingPreview() {
  if (typeof sessionStorage === "undefined") return;
  for (const [k, v] of Object.entries(ONBOARDING_PREVIEW_SEED)) {
    if (sessionStorage.getItem(k) === null) sessionStorage.setItem(k, v);
  }
}

function seedOnboardingForPath(path: string) {
  if (typeof sessionStorage === "undefined") return;
  const state = ONBOARDING_FLOW_STATE[path];
  if (!state) return; // no es un paso de onboarding — no tocar nada
  // Parte del prefijo exacto de este paso: limpia el flow-state previo
  // (incluido cualquier unlocked_step heredado) y siembra solo lo anterior.
  for (const k of ONBOARDING_FLOW_KEYS) sessionStorage.removeItem(k);
  for (const [k, v] of Object.entries(state)) sessionStorage.setItem(k, v);
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

/**
 * Miniatura de una ruta: iframe a viewport de escritorio (1440x900) escalado a
 * lo ancho de la celda. Lazy vía IntersectionObserver (monta el iframe solo al
 * entrar en viewport). El iframe va pointer-events-none + aria-hidden; el click
 * lo captura el <Link> overlay de la card.
 */
function PreviewFrame({ path, enabled }: { path: string; enabled: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Lazy mount: monta el iframe cuando la celda se acerca al viewport.
  useEffect(() => {
    if (!enabled) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  // Escala responsiva: ancho de celda / ancho de diseño.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / DESIGN_W);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface-2)]"
    >
      {/* Placeholder mientras no está visible o mientras el iframe carga */}
      {(!visible || !loaded) && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="ts-caption-1 font-mono text-[var(--text-tertiary)]">
            {enabled ? (visible ? "cargando…" : path) : path}
          </span>
        </div>
      )}
      {visible && scale > 0 && (
        <iframe
          src={path}
          title={path}
          tabIndex={-1}
          aria-hidden
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms"
          onLoad={() => setLoaded(true)}
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          // Fade-in al cargar: mientras el iframe carga queda transparente para
          // que el "cargando…" de abajo se vea (si no, su bg opaco lo taparía).
          className={`pointer-events-none absolute left-0 top-0 border-0 bg-[var(--surface)] transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

export default function DevMenuPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [bypassActive, setBypassActive] = useState(false);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [previewsOn, setPreviewsOn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let cookie = readCookie("itera_dev_bypass");
    // Review habilitado (preview con flag ON): si no hay cookie, la armamos a
    // "1" para que el bypass quede activo de una (igual que el default-on de
    // localhost). Si ya hay cookie (el usuario optó por 0 o 1), la respetamos.
    // En producción real este código nunca corre: /dev 404ea en el proxy.
    if (FLAG_REVIEW_ENABLED && cookie === null) {
      document.cookie = `itera_dev_bypass=1; path=/; max-age=${7 * 24 * 60 * 60}`;
      cookie = "1";
    }
    setBypassActive(cookie !== "0");
    setReviewed(readReviewed());
    // Preferencia de previews (default on).
    if (typeof localStorage !== "undefined") {
      setPreviewsOn(localStorage.getItem(PREVIEWS_KEY) !== "0");
    }
    // Siembra el estado de onboarding para que sus previews en iframe rendericen.
    seedOnboardingPreview();
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
    }
    setBypassActive(newValue);
  }

  const togglePreviews = useCallback(() => {
    setPreviewsOn((prev) => {
      const next = !prev;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(PREVIEWS_KEY, next ? "1" : "0");
      }
      return next;
    });
  }, []);

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
      <div className="mx-auto max-w-6xl">
        <h1 className="display display-tight text-[var(--text-primary)] ts-display">
          Acceso a todas las pantallas
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3 ts-subhead text-[var(--text-secondary)]">
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

        {/* Controles: bypass · theme · previews */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-2)] p-5">
            <div className="flex-1">
              <div className="ts-callout font-semibold text-[var(--text-primary)]">
                Auth bypass {bypassActive ? "activo" : "inactivo"}
              </div>
              <p className="mt-1 ts-footnote text-[var(--text-secondary)]">
                {bypassActive
                  ? "Navega /dashboard, /case/*, /report/*, /onboarding/*, /admin/* sin login."
                  : "Las rutas protegidas redirigen a /auth/login."}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleBypass}
              className={`shrink-0 rounded-[var(--radius-md)] px-5 py-2 ts-callout font-medium transition-colors ${
                bypassActive
                  ? "bg-[var(--band-b-bar)] text-white hover:opacity-95"
                  : "accent-bg text-white hover:opacity-95"
              }`}
            >
              {bypassActive ? "Desactivar" : "Activar"}
            </button>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-2)] p-5">
            <div className="ts-callout font-semibold text-[var(--text-primary)]">
              Theme · {theme === "system" ? `system (${resolvedTheme})` : theme}
            </div>
            <p className="mt-1 ts-footnote text-[var(--text-secondary)]">
              Fuerza el tema para QA. Los previews lo heredan.
            </p>
            <div
              role="radiogroup"
              aria-label="Theme"
              className="mt-3 inline-flex rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] p-1"
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

          <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-2)] p-5">
            <div className="flex-1">
              <div className="ts-callout font-semibold text-[var(--text-primary)]">
                Previews {previewsOn ? "on" : "off"}
              </div>
              <p className="mt-1 ts-footnote text-[var(--text-secondary)]">
                {previewsOn
                  ? "Cada celda renderiza la pantalla en vivo (carga diferida al hacer scroll)."
                  : "Solo la etiqueta y la ruta, sin cargar iframes."}
              </p>
            </div>
            <button
              type="button"
              onClick={togglePreviews}
              aria-pressed={previewsOn}
              className={`shrink-0 rounded-[var(--radius-md)] px-5 py-2 ts-callout font-medium transition-colors ${
                previewsOn
                  ? "accent-bg text-white hover:opacity-95"
                  : "border border-[var(--hairline)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {previewsOn ? "Apagar" : "Encender"}
            </button>
          </div>
        </div>

        <div className="mt-12 space-y-12">
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
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.routes.map((r) => {
                    const isReviewed = reviewed.has(r.path);
                    return (
                      <div
                        key={r.path}
                        className={`group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border transition-colors ${
                          isReviewed
                            ? "border-[var(--band-a-bar)] bg-[var(--band-a-bg)]"
                            : "border-[var(--hairline)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                        }`}
                      >
                        {/* Preview (o placeholder si previews off) */}
                        <div className="relative border-b border-[var(--hairline)]">
                          {previewsOn ? (
                            <PreviewFrame path={r.path} enabled={previewsOn} />
                          ) : (
                            <div className="grid aspect-[16/10] w-full place-items-center bg-[var(--surface-2)]">
                              <span className="ts-caption-1 font-mono text-[var(--text-tertiary)]">
                                {r.path}
                              </span>
                            </div>
                          )}
                          {/* Overlay clickable: navega la pestaña top a la ruta */}
                          <Link
                            href={r.path}
                            onClick={() => seedOnboardingForPath(r.path)}
                            aria-label={`Abrir ${r.label}`}
                            className="absolute inset-0 z-10"
                          />
                          {/* Marca de revisada (encima del overlay) */}
                          <button
                            type="button"
                            onClick={() => toggleReviewed(r.path)}
                            aria-label={isReviewed ? "Marcar como pendiente" : "Marcar como revisada"}
                            aria-pressed={isReviewed}
                            title={isReviewed ? "Revisada — click para desmarcar" : "Marcar como revisada"}
                            className={`absolute right-2 top-2 z-20 grid h-8 w-8 place-items-center rounded-full border shadow-card transition-colors ${
                              isReviewed
                                ? "border-[var(--band-a-bar)] bg-[var(--band-a-bar)] text-white hover:opacity-90"
                                : "border-[var(--hairline)] bg-[var(--surface)]/90 text-[var(--text-tertiary)] backdrop-blur hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {isReviewed ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <circle cx="12" cy="12" r="9" />
                              </svg>
                            )}
                          </button>
                        </div>

                        {/* Footer: etiqueta + ruta + nota */}
                        <Link
                          href={r.path}
                          onClick={() => seedOnboardingForPath(r.path)}
                          className="flex flex-1 flex-col gap-1 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="ts-callout font-semibold leading-tight text-[var(--text-primary)]">
                              {r.label}
                            </span>
                            <span className="mt-0.5 shrink-0 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-0.5">
                              →
                            </span>
                          </div>
                          <span className="ts-footnote font-mono text-[var(--text-tertiary)]">
                            {r.path}
                          </span>
                          {r.note && (
                            <span className="mt-0.5 ts-caption-1 leading-snug text-[var(--text-tertiary)]">
                              {r.note}
                            </span>
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-16 rounded-[var(--radius-md)] border border-dashed border-[var(--hairline)] p-5">
          <div className="ts-subhead font-semibold text-[var(--text-primary)]">
            ¿Cómo funciona?
          </div>
          <p className="mt-2 ts-footnote text-[var(--text-secondary)] leading-[1.55]">
            Cada celda muestra un preview en vivo (iframe misma-origin, escalado a
            miniatura, carga diferida al hacer scroll). Click en la celda abre la
            pantalla completa. El bypass setea cookie{" "}
            <code className="font-mono">itera_dev_bypass=1</code> (7 días); los
            layouts la leen server-side y skip el redirect a /auth/login si{" "}
            <code className="font-mono">NODE_ENV !== &quot;production&quot;</code>.
            Las marcas de &quot;revisada&quot; y el toggle de previews viven en{" "}
            <code className="font-mono">localStorage</code> del browser.
          </p>
        </div>
      </div>
    </main>
  );
}
