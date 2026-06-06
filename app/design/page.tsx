"use client";

/**
 * /design — Single source of truth del design system.
 *
 * Esta página es el control center del diseño Itera Simulador:
 *   - Lista TODOS los design tokens (tipografía, colores, radius, shadow, motion)
 *   - Permite editar cada uno en vivo (el cambio se aplica instantáneamente
 *     a esta página + a TODAS las surfaces de la app gracias al
 *     DesignOverridesInjector montado en root providers).
 *   - Los overrides persisten en `localStorage[itera_design_overrides]`.
 *   - Reset por token o global.
 *   - "Copy CSS" exporta el bloque listo para pegar en simulador.css.
 *
 * No requiere auth — vive como /dev. Cuando un cambio funciona en producción
 * visual, Pablo decide promoverlo: copy CSS → pegar en simulador.css → commit.
 *
 * Estilo: la página usa los mismos ts-* tokens que está editando, así que es
 * inmediatamente visible el efecto de cualquier cambio.
 */

import Link from "next/link";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import "../(app)/simulador.css";
import { DesignHubNav } from "./DesignHubNav";
import {
  ALL_TOKENS,
  OVERRIDES_STORAGE_KEY,
  TOKEN_SECTIONS,
  VALID_TOKEN_NAMES,
  type DesignToken,
  type OverridesPayload,
  type TokenSection,
} from "@/lib/simulador/design-tokens";

// ============================================================================
// State helpers
// ============================================================================

function readOverrides(): OverridesPayload {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const clean: OverridesPayload = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && VALID_TOKEN_NAMES.has(k)) clean[k] = v;
    }
    return clean;
  } catch {
    return {};
  }
}

function writeOverrides(next: OverridesPayload) {
  if (typeof localStorage === "undefined") return;
  if (Object.keys(next).length === 0) {
    localStorage.removeItem(OVERRIDES_STORAGE_KEY);
  } else {
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(next));
  }
  // Notifica al injector que viva en esta misma pestaña.
  window.dispatchEvent(new CustomEvent("itera:design-overrides:update"));
}

function buildCssBlock(overrides: OverridesPayload): string {
  const entries = Object.entries(overrides);
  if (entries.length === 0) return "/* No hay overrides activos. */";
  const decls = entries.map(([k, v]) => `  --${k}: ${v};`).join("\n");
  return `.simulador-root {\n${decls}\n}`;
}

// ============================================================================
// Editor controls — un input por kind
// ============================================================================

function TokenRow({
  token,
  effectiveValue,
  isOverridden,
  isDark,
  onChange,
  onReset,
}: {
  token: DesignToken;
  effectiveValue: string;
  isOverridden: boolean;
  isDark: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  const fallback =
    isDark && token.defaultDark ? token.defaultDark : token.defaultLight;

  return (
    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[260px_1fr_auto] items-start gap-3 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] p-3.5 transition-colors hover:border-[var(--border-strong)]">
      {/* Label + descripción */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <code className="ts-footnote font-mono text-[var(--text-primary)] truncate">
            --{token.name}
          </code>
          {isOverridden && (
            <span
              title="Override activo"
              className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] flex-none"
            />
          )}
        </div>
        <p className="mt-0.5 ts-caption-1 text-[var(--text-tertiary)] line-clamp-2">
          {token.description}
        </p>
      </div>

      {/* Preview + input */}
      <div className="col-span-2 sm:col-span-1 flex items-center gap-3 min-w-0">
        <TokenPreview token={token} value={effectiveValue} />
        <TokenInput
          token={token}
          value={effectiveValue}
          fallback={fallback}
          onChange={onChange}
        />
      </div>

      {/* Reset (oculto si no hay override) */}
      <button
        type="button"
        onClick={onReset}
        disabled={!isOverridden}
        className={`flex-none rounded-[var(--radius-sm)] px-2.5 py-1 ts-caption-1 font-medium transition-colors ${
          isOverridden
            ? "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
            : "text-[var(--text-disabled)] cursor-not-allowed"
        }`}
        aria-label="Reset al default"
      >
        Reset
      </button>
    </div>
  );
}

function TokenInput({
  token,
  value,
  fallback,
  onChange,
}: {
  token: DesignToken;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  // PX o RADIUS o MS: número + unidad fija
  if (token.kind === "px" || token.kind === "radius" || token.kind === "ms") {
    const unit = token.kind === "ms" ? "ms" : "px";
    const numericPart = value.replace(/[^\d.]/g, "");
    return (
      <div className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 focus-within:border-[var(--accent)]">
        <input
          type="number"
          step={token.kind === "ms" ? 10 : 0.5}
          min={0}
          value={numericPart}
          placeholder={fallback.replace(/[^\d.]/g, "")}
          onChange={(e) => onChange(`${e.target.value}${unit}`)}
          className="w-16 bg-transparent ts-subhead tabular-nums text-[var(--text-primary)] focus:outline-none"
        />
        <span className="ts-caption-1 text-[var(--text-tertiary)]">{unit}</span>
      </div>
    );
  }

  // COLOR: swatch + hex input
  if (token.kind === "color") {
    // Color picker browser solo entiende #hex — para rgba/hsla mostramos solo text input.
    const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 focus-within:border-[var(--accent)]">
        {isHex ? (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
            aria-label="Color picker"
          />
        ) : (
          <span
            className="h-6 w-6 rounded border border-[var(--hairline)]"
            style={{ backgroundColor: value }}
            aria-hidden
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent ts-subhead font-mono text-[var(--text-primary)] focus:outline-none"
        />
      </div>
    );
  }

  // SHADOW o EASE: solo text input largo
  return (
    <div className="flex-1 min-w-0 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 focus-within:border-[var(--accent)]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="w-full bg-transparent ts-footnote font-mono text-[var(--text-primary)] focus:outline-none"
      />
    </div>
  );
}

function TokenPreview({ token, value }: { token: DesignToken; value: string }) {
  if (token.kind === "px") {
    return (
      <span
        style={{ fontSize: value }}
        className="text-[var(--text-primary)] leading-none whitespace-nowrap"
      >
        Aa
      </span>
    );
  }
  if (token.kind === "color") {
    return (
      <span
        className="h-7 w-7 rounded-[var(--radius-sm)] border border-[var(--hairline)] flex-none"
        style={{ backgroundColor: value }}
        aria-hidden
      />
    );
  }
  if (token.kind === "radius") {
    return (
      <span
        className="h-7 w-7 border border-[var(--border-strong)] bg-[var(--surface-2)] flex-none"
        style={{ borderRadius: value }}
        aria-hidden
      />
    );
  }
  if (token.kind === "shadow") {
    return (
      <span
        className="h-7 w-7 rounded-[var(--radius-sm)] bg-[var(--surface)] flex-none"
        style={{ boxShadow: value }}
        aria-hidden
      />
    );
  }
  if (token.kind === "ms") {
    return (
      <span
        className="h-2.5 w-2.5 rounded-full bg-[var(--accent)] flex-none"
        style={{
          animation: `pulse-soft ${value} ease-in-out infinite`,
        }}
        aria-hidden
      />
    );
  }
  // ease: muestra una mini curva conceptual
  return (
    <span
      className="ts-caption-1 font-mono text-[var(--text-tertiary)] flex-none whitespace-nowrap"
      aria-hidden
    >
      f(t)
    </span>
  );
}

// ============================================================================
// Section block
// ============================================================================

function SectionBlock({
  section,
  overrides,
  isDark,
  onChange,
  onReset,
}: {
  section: TokenSection;
  overrides: OverridesPayload;
  isDark: boolean;
  onChange: (name: string, value: string) => void;
  onReset: (name: string) => void;
}) {
  return (
    <section id={section.id} className="scroll-mt-20">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="eyebrow">{section.id}</div>
          <h2 className="mt-1 ts-title-2 font-semibold text-[var(--text-primary)] tracking-tight">
            {section.title}
          </h2>
          <p className="mt-1 ts-subhead text-[var(--text-secondary)] max-w-[640px]">
            {section.blurb}
          </p>
        </div>
        <span className="ts-caption-1 text-[var(--text-tertiary)] tabular-nums">
          {section.tokens.length} tokens
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {section.tokens.map((token) => {
          const fallback =
            isDark && token.defaultDark ? token.defaultDark : token.defaultLight;
          const overridden = token.name in overrides;
          const effective = overridden ? overrides[token.name] : fallback;
          return (
            <TokenRow
              key={token.name}
              token={token}
              effectiveValue={effective}
              isOverridden={overridden}
              isDark={isDark}
              onChange={(v) => onChange(token.name, v)}
              onReset={() => onReset(token.name)}
            />
          );
        })}
      </div>
    </section>
  );
}

// ============================================================================
// Component catalog — read-only ejemplos vivos
// ============================================================================

function Catalog() {
  return (
    <section id="catalogo" className="scroll-mt-20">
      <div className="eyebrow">catálogo</div>
      <h2 className="mt-1 ts-title-2 font-semibold text-[var(--text-primary)] tracking-tight">
        Componentes
      </h2>
      <p className="mt-1 ts-subhead text-[var(--text-secondary)] max-w-[640px]">
        Vista previa de los componentes que respiran del sistema. Cualquier
        edición arriba se refleja aquí en vivo.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Typography */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5">
          <div className="eyebrow">tipografía en acción</div>
          <div className="mt-3 space-y-2">
            <div className="display ts-display-lg text-[var(--text-primary)]">Display 40</div>
            <div className="ts-title-1 font-semibold text-[var(--text-primary)]">Title 1 — 28</div>
            <div className="ts-headline font-semibold text-[var(--text-primary)]">Headline 17</div>
            <p className="ts-body text-[var(--text-secondary)]">Body 15 — párrafo principal con el tono general de descripción.</p>
            <p className="ts-subhead text-[var(--text-secondary)]">Subhead 13.5 — texto secundario que aparece dentro de cards.</p>
            <p className="ts-caption-1 text-[var(--text-tertiary)]">caption · meta</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5">
          <div className="eyebrow">botones</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-[var(--radius-md)] accent-bg text-white px-4 py-2 ts-callout font-medium"
            >
              Primary
            </button>
            <button
              type="button"
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] px-4 py-2 ts-callout font-medium hover:border-[var(--border-strong)]"
            >
              Secundario
            </button>
            <button
              type="button"
              className="rounded-[var(--radius-md)] text-[var(--accent)] px-4 py-2 ts-callout font-medium hover:bg-[var(--accent-soft)]"
            >
              Ghost
            </button>
            <button
              type="button"
              disabled
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-disabled)] px-4 py-2 ts-callout font-medium cursor-not-allowed"
            >
              Disabled
            </button>
          </div>
        </div>

        {/* Chips + Bandas */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5">
          <div className="eyebrow">chips + bandas</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-[var(--radius-sm)] accent-bg-soft accent-text px-2 py-0.5 ts-caption-1 font-semibold">
              Accent
            </span>
            <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--surface-2)] text-[var(--text-secondary)] px-2 py-0.5 ts-caption-1 font-medium">
              Neutral
            </span>
            <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--band-a-bg)] text-[var(--band-a-text)] px-2 py-0.5 ts-caption-1 font-semibold">
              Alto
            </span>
            <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--band-m-bg)] text-[var(--band-m-text)] px-2 py-0.5 ts-caption-1 font-semibold">
              Medio
            </span>
            <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--band-b-bg)] text-[var(--band-b-text)] px-2 py-0.5 ts-caption-1 font-semibold">
              Bajo
            </span>
          </div>
        </div>

        {/* Progress bars */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5">
          <div className="eyebrow">barras</div>
          <div className="mt-3 space-y-3">
            {[
              { v: 82, color: "var(--band-a-bar)", label: "Contexto" },
              { v: 65, color: "var(--band-m-bar)", label: "Validación" },
              { v: 38, color: "var(--band-b-bar)", label: "Datos" },
              { v: 71, color: "var(--accent)",     label: "Promedio" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-[90px] ts-footnote text-[var(--text-secondary)]">{row.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${row.v}%`, background: row.color }}
                  />
                </div>
                <span className="w-8 text-right ts-footnote font-medium tabular-nums text-[var(--text-primary)]">
                  {row.v}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card mockup */}
        <div className="lg:col-span-2 rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5">
          <div className="eyebrow">card de caso</div>
          <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-[var(--radius-sm)] accent-bg-soft accent-text px-1.5 py-0.5 ts-caption-1 font-semibold">
                  Nivel 2
                </span>
                <span className="ts-caption-1 text-[var(--text-tertiary)]">18 min</span>
              </div>
              <span className="ts-caption-1 font-medium text-[var(--band-a-text)]">Completado</span>
            </div>
            <h3 className="mt-4 ts-headline font-semibold leading-[1.3] tracking-tight text-[var(--text-primary)]">
              Campaña de retargeting con presupuesto reducido
            </h3>
            <p className="mt-2 ts-subhead leading-[1.5] text-[var(--text-secondary)]">
              ¿Cómo priorizas audiencias cuando el ROAS cae y solo te quedan tres días para revertirlo?
            </p>
            <div className="mt-4 flex items-center justify-between gap-2 ts-caption-1 text-[var(--text-tertiary)]">
              <div className="flex items-center gap-1.5">
                <span>Marketing</span>
                <span aria-hidden>·</span>
                <span>Senior</span>
                <span aria-hidden>·</span>
                <span>E-commerce</span>
              </div>
              <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--band-a-bg)] text-[var(--band-a-text)] px-1.5 py-0.5 ts-caption-2 font-semibold">
                Alto
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function DesignSystemPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [overrides, setOverrides] = useState<OverridesPayload>({});
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOverrides(readOverrides());
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const setToken = useCallback((name: string, value: string) => {
    setOverrides((prev) => {
      const next = { ...prev, [name]: value };
      writeOverrides(next);
      return next;
    });
  }, []);

  const resetToken = useCallback((name: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[name];
      writeOverrides(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setOverrides({});
    writeOverrides({});
  }, []);

  const cssBlock = useMemo(() => buildCssBlock(overrides), [overrides]);
  const overrideCount = Object.keys(overrides).length;
  const totalTokens = ALL_TOKENS.length;

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(cssBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback silencioso
    }
  }

  if (!mounted) return null;

  return (
    <main className="simulador-root min-h-screen surface-canvas">
      <DesignHubNav />
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-10 lg:flex-row lg:gap-10 lg:px-10 lg:py-14">
        {/* ============== SIDEBAR / TOC ============== */}
        <aside className="lg:sticky lg:top-10 lg:h-[calc(100vh-5rem)] lg:w-[220px] flex-none">
          <div className="eyebrow">/design</div>
          <h1 className="mt-1 ts-title-1 font-semibold text-[var(--text-primary)] tracking-tight">
            Design System
          </h1>
          <p className="mt-2 ts-subhead text-[var(--text-secondary)] leading-[1.5]">
            Editas un token, se aplica a TODA la app. De aquí salen todas las
            decisiones visuales.
          </p>

          <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--surface-2)] px-3 py-2.5">
            <div className="ts-caption-1 text-[var(--text-tertiary)]">Estado</div>
            <div className="mt-1 ts-subhead text-[var(--text-primary)]">
              <span className="font-semibold">{overrideCount}</span>
              <span className="text-[var(--text-tertiary)]"> / {totalTokens} overrideados</span>
            </div>
          </div>

          <nav aria-label="Secciones" className="mt-6 flex flex-col gap-0.5">
            {TOKEN_SECTIONS.map((s) => (
              <Link
                key={s.id}
                href={`#${s.id}`}
                className="rounded-[var(--radius-sm)] px-2 py-1.5 ts-subhead text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
              >
                {s.title}
              </Link>
            ))}
            <Link
              href="#catalogo"
              className="rounded-[var(--radius-sm)] px-2 py-1.5 ts-subhead text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
            >
              Componentes
            </Link>
            <Link
              href="#export"
              className="rounded-[var(--radius-sm)] px-2 py-1.5 ts-subhead text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
            >
              Export CSS
            </Link>
          </nav>

          {/* Theme switcher */}
          <div className="mt-8">
            <div className="eyebrow">tema</div>
            <div
              role="radiogroup"
              aria-label="Theme"
              className="mt-2 inline-flex rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] p-1"
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
            <p className="mt-2 ts-caption-1 text-[var(--text-tertiary)] leading-snug">
              Default sigue OS. Override aquí solo para QA visual.
            </p>
          </div>

          {/* Quick reset */}
          <div className="mt-8">
            <button
              type="button"
              onClick={resetAll}
              disabled={overrideCount === 0}
              className={`w-full rounded-[var(--radius-md)] border px-3 py-2 ts-subhead font-medium transition-colors ${
                overrideCount === 0
                  ? "border-[var(--hairline)] text-[var(--text-disabled)] cursor-not-allowed"
                  : "border-[var(--band-b-bar)] text-[var(--band-b-text)] hover:bg-[var(--band-b-bg)]"
              }`}
            >
              Reset all overrides
            </button>
          </div>

          <div className="mt-6">
            <Link
              href="/dev"
              className="ts-caption-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2"
            >
              ← /dev (navegación)
            </Link>
          </div>
        </aside>

        {/* ============== EDITOR PRINCIPAL ============== */}
        <div className="flex-1 min-w-0 flex flex-col gap-12">
          {TOKEN_SECTIONS.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              overrides={overrides}
              isDark={isDark}
              onChange={setToken}
              onReset={resetToken}
            />
          ))}

          <Catalog />

          {/* Export CSS */}
          <section id="export" className="scroll-mt-20">
            <div className="eyebrow">export</div>
            <h2 className="mt-1 ts-title-2 font-semibold text-[var(--text-primary)] tracking-tight">
              CSS para pegar en simulador.css
            </h2>
            <p className="mt-1 ts-subhead text-[var(--text-secondary)]">
              Cuando un override te gusta y quieres promoverlo al sistema:
              copia este bloque y pégalo en{" "}
              <code className="font-mono ts-footnote">app/(app)/simulador.css</code>{" "}
              dentro del bloque <code className="font-mono ts-footnote">.simulador-root</code>.
            </p>
            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-2)] p-4 font-mono ts-footnote leading-[1.55] text-[var(--text-primary)] whitespace-pre overflow-x-auto">
              {cssBlock}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={copyCss}
                disabled={overrideCount === 0}
                className={`rounded-[var(--radius-md)] px-4 py-2 ts-callout font-medium transition-colors ${
                  overrideCount === 0
                    ? "bg-[var(--surface-2)] text-[var(--text-disabled)] cursor-not-allowed"
                    : "accent-bg text-white hover:opacity-95"
                }`}
              >
                {copied ? "Copiado ✓" : "Copy CSS"}
              </button>
              <span className="ts-caption-1 text-[var(--text-tertiary)]">
                {overrideCount} {overrideCount === 1 ? "override" : "overrides"} activos
              </span>
            </div>
          </section>

          {/* Footer note */}
          <section className="mt-6 rounded-[var(--radius-md)] border border-dashed border-[var(--hairline)] p-5">
            <div className="ts-subhead font-semibold text-[var(--text-primary)]">
              ¿Cómo funciona?
            </div>
            <p className="mt-2 ts-footnote text-[var(--text-secondary)] leading-[1.55]">
              Cada edición se persiste en{" "}
              <code className="font-mono">localStorage[itera_design_overrides]</code>.
              El componente <code className="font-mono">DesignOverridesInjector</code>{" "}
              (montado en root providers) lee ese storage en cada page mount y
              emite un <code className="font-mono">&lt;style&gt;</code> que pisa los
              tokens de <code className="font-mono">.simulador-root</code>. Por eso
              ves el cambio en TODAS las pantallas (landing, app, admin) al instante.
              Los overrides son locales del browser — para que sean producción, copia
              el CSS y pégalo en <code className="font-mono">simulador.css</code>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
