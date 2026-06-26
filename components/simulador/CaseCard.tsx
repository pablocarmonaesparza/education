"use client";

/**
 * CaseCard — card individual del catálogo de casos.
 *
 * Misma card visual usada en:
 *   - /casos (catálogo completo con filtros)
 *   - /team (recomendados en el Inicio del employee)
 *   - Cualquier otra surface que liste casos
 *
 * No reinventar el wheel: si necesitas un slot adicional, agrega prop aquí.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
  BAND_LABEL,
  DEPARTMENT_LABEL,
  INDUSTRY_LABEL,
  LEVEL_CARD_LABEL,
  SENIORITY_LABEL,
  TOOL_BRAND,
  TOOL_DEFAULT,
  type CaseItem,
  type Freshness,
} from "@/lib/simulador/cases";

// Resuelve a dónde lleva un click en el caso: si ya lo completó y tiene
// reporte → /report/{session}; si no → runtime. La decisión vive en el
// backend (GET /api/cases/[slug]/destination) para no duplicar reglas de
// estado en la UI. Devuelve el href de fallback (/case/{slug}) si falla.
async function fetchCaseDestination(slug: string): Promise<string> {
  const fallback = `/case/${slug}`;
  try {
    const res = await fetch(`/api/cases/${encodeURIComponent(slug)}/destination`);
    if (!res.ok) return fallback;
    const data = (await res.json()) as { href?: string };
    return typeof data.href === "string" && data.href ? data.href : fallback;
  } catch {
    return fallback;
  }
}

function FreshnessBadge({
  freshness,
  lastVerifiedAt,
}: {
  freshness: Freshness;
  lastVerifiedAt?: string;
}) {
  if (freshness === "evergreen") return null;
  const dateLabel = lastVerifiedAt
    ? new Date(lastVerifiedAt).toLocaleDateString("es-ES", {
        month: "short",
        year: "numeric",
      })
    : null;
  return (
    <span className="inline-flex items-center gap-1 ts-caption-1 text-[var(--text-tertiary)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      {dateLabel ? `act. ${dateLabel}` : "actualizado"}
    </span>
  );
}

function StatusBadge({ item }: { item: CaseItem }) {
  if (item.userStatus === "completed") {
    return (
      <span className="inline-flex items-center gap-1 ts-caption-1 font-medium text-[var(--band-a-text)]">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Completado
      </span>
    );
  }
  if (item.userStatus === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 ts-caption-1 font-medium text-[var(--accent)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        En progreso
      </span>
    );
  }
  return (
    <FreshnessBadge
      freshness={item.freshnessType}
      lastVerifiedAt={item.lastVerifiedAt}
    />
  );
}

export function CaseCard({ item }: { item: CaseItem }) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  // Prefetch del destino al hacer hover/focus: cuando el usuario hace click
  // el push es instantáneo. Se cachea por tarjeta para no repetir la llamada.
  const destinationRef = useRef<Promise<string> | null>(null);

  const prefetchDestination = useCallback(() => {
    if (!destinationRef.current) {
      destinationRef.current = fetchCaseDestination(item.slug);
    }
  }, [item.slug]);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Respetar modificadores (abrir en pestaña nueva, etc.).
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      e.preventDefault();
      if (navigating) return;
      setNavigating(true);
      prefetchDestination();
      const href = await destinationRef.current!;
      router.push(href);
    },
    [navigating, prefetchDestination, router],
  );

  return (
    <Link
      href={`/case/${item.slug}`}
      onClick={handleClick}
      onMouseEnter={prefetchDestination}
      onFocus={prefetchDestination}
      aria-busy={navigating}
      className="group relative flex flex-col rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[0_4px_16px_var(--shadow)]"
    >
      {navigating && (
        <span
          aria-hidden
          className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-[var(--hairline)] border-t-[var(--accent)]"
        />
      )}
      {/* TOP: nivel chip + duración + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 ts-caption-1 font-semibold text-[var(--accent)]">
            {LEVEL_CARD_LABEL[item.level]}
          </span>
          <span className="ts-caption-1 text-[var(--text-tertiary)]">
            {item.estimatedMinutes} min
          </span>
        </div>
        <StatusBadge item={item} />
      </div>

      {/* TITLE */}
      <h3 className="mt-4 ts-headline font-semibold leading-[1.3] tracking-tight text-[var(--text-primary)]">
        {item.title}
      </h3>

      {/* PITCH = primary_question del manager_outcome */}
      <p className="mt-2 ts-subhead leading-[1.5] text-[var(--text-secondary)] line-clamp-3">
        {item.primaryQuestion}
      </p>

      {/* TOOLS — coloreados por brand */}
      <div className="mt-4 flex flex-wrap gap-1">
        {item.toolsRequired.slice(0, 3).map((tool) => {
          const brand = TOOL_BRAND[tool] ?? TOOL_DEFAULT;
          return (
            <span
              key={tool}
              className="inline-flex items-center rounded-md px-1.5 py-0.5 ts-caption-1 font-medium"
              style={{ backgroundColor: brand.bg, color: brand.text }}
            >
              {tool}
            </span>
          );
        })}
      </div>

      {/* FOOTER: depto · seniority · industria + (si completed) banda */}
      <div className="mt-5 flex items-center justify-between gap-2 ts-caption-1 text-[var(--text-tertiary)]">
        <div className="flex items-center gap-1.5 truncate">
          <span>{DEPARTMENT_LABEL[item.department]}</span>
          <span aria-hidden>·</span>
          <span>{SENIORITY_LABEL[item.seniority]}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{INDUSTRY_LABEL[item.industry]}</span>
        </div>
        {item.userStatus === "completed" && item.userBand && (
          <span
            className={`inline-flex flex-none items-center rounded-md px-1.5 py-0.5 ts-caption-2 font-semibold ${
              item.userBand === "A"
                ? "bg-[var(--band-a-bg)] text-[var(--band-a-text)]"
                : item.userBand === "M"
                  ? "bg-[var(--band-m-bg)] text-[var(--band-m-text)]"
                  : "bg-[var(--band-b-bg)] text-[var(--band-b-text)]"
            }`}
          >
            {BAND_LABEL[item.userBand]}
          </span>
        )}
      </div>
    </Link>
  );
}
