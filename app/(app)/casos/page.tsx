"use client";

/**
 * /casos — catálogo de casos disponibles.
 *
 * Consume el contrato REAL del catálogo (R-29): tipos de
 * lib/simulador/case-catalog + datos de GET /api/cases. El mock
 * lib/simulador/cases.ts murió. La card compartida vive en
 * components/simulador/CaseCard.tsx (misma en /team y /staff/casos).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { SelectItem } from "@heroui/react";
import {
  AppleButton,
  AppleEmptyState,
  AppleErrorState,
  AppleReveal,
  AppleSelect,
  AppleSkeleton,
} from "@/components/simulador/apple";
import { CaseCard } from "@/components/simulador/CaseCard";
import {
  LEVEL_LABEL,
  departmentLabel,
  type CaseCatalogItem,
  type CatalogLevel,
} from "@/lib/simulador/case-catalog";

// Sentinel para casos sin career_key: departmentLabel(undefined) → "General".
const GENERAL_DEPARTMENT = "general";

const LEVEL_OPTIONS = (Object.keys(LEVEL_LABEL) as CatalogLevel[]).map(
  (value) => ({ value, label: LEVEL_LABEL[value] }),
);

// ============================================================================
// FilterSelect — wrapper de AppleSelect (design system) con los defaults de filtros.
// ============================================================================

function FilterSelect<T extends string>({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (v: T | "") => void;
}) {
  return (
    <AppleSelect
      placeholder={placeholder}
      aria-label={placeholder}
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const next = Array.from(keys)[0] as T | undefined;
        onChange(next ?? "");
      }}
      isClearable={!!value}
      onClear={() => onChange("")}
      size="lg"
      className={`min-w-[180px] flex-1 ${value ? "is-filter-active" : ""}`}
    >
      {options.map((opt) => (
        <SelectItem key={opt.value}>{opt.label}</SelectItem>
      ))}
    </AppleSelect>
  );
}

// ============================================================================
// CaseCardSkeleton — placeholder de carga con la misma silueta que CaseCard.
// (El borde replica el de CaseCard, regla explícita: las cards sí llevan borde.)
// ============================================================================

function CaseCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5"
    >
      <div className="flex items-center gap-2">
        <AppleSkeleton className="h-5 w-24" />
        <AppleSkeleton className="h-4 w-12" />
      </div>
      <AppleSkeleton className="mt-4 h-5 w-4/5" />
      <AppleSkeleton className="mt-3 h-4 w-full" />
      <AppleSkeleton className="mt-1.5 h-4 w-2/3" />
      <AppleSkeleton className="mt-5 h-4 w-28" />
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function CasosPage() {
  const [cases, setCases] = useState<CaseCatalogItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<CatalogLevel | "">("");
  const [department, setDepartment] = useState<string>("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/cases", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      const data = (await res.json()) as { cases: CaseCatalogItem[] };
      setCases(data.cases);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Departamentos derivados de los datos reales presentes en el catálogo.
  const departmentOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of cases ?? []) {
      const key = c.department ?? GENERAL_DEPARTMENT;
      if (!seen.has(key)) seen.set(key, departmentLabel(c.department));
    }
    return Array.from(seen, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label, "en"),
    );
  }, [cases]);

  const filtered = useMemo(() => {
    return (cases ?? []).filter((c) => {
      if (level && c.level !== level) return false;
      if (department && (c.department ?? GENERAL_DEPARTMENT) !== department) {
        return false;
      }
      return true;
    });
  }, [cases, level, department]);

  const anyFilterActive = level !== "" || department !== "";
  const loading = cases === null && !error;

  function clearAll() {
    setLevel("");
    setDepartment("");
  }

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-8 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        {/* ============ HEADER ============ */}
        <AppleReveal as="header">
          <h1 className="display display-tight text-[var(--text-primary)] ts-display sm:ts-display-lg">
            Case catalog
          </h1>
          <p className="mt-3 ts-body text-[var(--text-secondary)] leading-[1.55] max-w-[640px]">
            Pick a case to start your assessment. Each case measures your
            judgment under real pressure with AI, not your recall.
          </p>
        </AppleReveal>

        {/* ============ FILTROS ============ */}
        <AppleReveal delay={0.04} className="mt-10">
          <section
            aria-label="Filters"
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <FilterSelect
              placeholder="Level"
              options={LEVEL_OPTIONS}
              value={level}
              onChange={setLevel}
            />
            <FilterSelect
              placeholder="Department"
              options={departmentOptions}
              value={department}
              onChange={setDepartment}
            />
          </section>
        </AppleReveal>

        {/* ============ RESULTADOS ============ */}
        <AppleReveal delay={0.08} className="mt-10">
          {error ? (
            <AppleErrorState
              title="We could not load the catalog"
              body={error}
              actionLabel="Try again"
              onAction={load}
            />
          ) : loading ? (
            <div role="status" aria-label="Loading cases">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <CaseCardSkeleton key={i} />
                ))}
              </div>
              <span className="sr-only">Loading cases…</span>
            </div>
          ) : cases !== null && cases.length === 0 ? (
            <AppleEmptyState
              title="No cases available yet"
              description="Your organization has no active cases yet. The first one will show up here as soon as it publishes."
              action={
                <AppleButton tone="secondary" size="sm" onPress={load}>
                  Refresh
                </AppleButton>
              }
            />
          ) : (
            <>
              {/* Contador derivado de los datos reales */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="ts-subhead text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {filtered.length}
                  </span>{" "}
                  {filtered.length === 1 ? "case" : "cases"}
                  {anyFilterActive && (
                    <span className="text-[var(--text-tertiary)]">
                      {" "}
                      of {cases?.length ?? 0}
                    </span>
                  )}
                </span>
                {anyFilterActive && (
                  <AppleButton
                    size="inline"
                    tone="secondary"
                    onPress={clearAll}
                    className="ts-subhead"
                  >
                    Clear filters
                  </AppleButton>
                )}
              </div>

              {/* ============ GRID ============ */}
              {filtered.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((item) => (
                    <CaseCard key={item.slug} item={item} />
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <AppleEmptyState
                    title="No cases match those filters"
                    description="Try removing one, or clear them all to see the full catalog."
                    action={
                      <AppleButton tone="secondary" size="sm" onPress={clearAll}>
                        Clear filters
                      </AppleButton>
                    }
                  />
                </div>
              )}
            </>
          )}
        </AppleReveal>
      </div>
    </main>
  );
}
