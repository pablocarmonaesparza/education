"use client";

/**
 * /staff/casos — biblioteca de casos (vista manager).
 *
 * Mismo grid que /casos employee pero con contexto manager. Copy honesto:
 * esto es el catálogo COMPLETO que el equipo puede jugar — el manager NO
 * asigna casos (las assignments las crea el auto-inicio del empleado desde
 * su dashboard) y no existe framing de sprint. Datos reales de GET
 * /api/cases (contrato R-29: lib/simulador/case-catalog — el mock murió).
 * Filtros solo sobre campos que el contrato real soporta: estado, nivel y
 * departamento.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { SelectItem } from "@heroui/react";
import { CaseCard } from "@/components/simulador/CaseCard";
import { CaseCardSkeleton } from "@/components/simulador/CaseCardSkeleton";
import {
  AppleButton,
  AppleEmptyState,
  AppleErrorState,
  AppleSelect,
  AppleTabs,
} from "@/components/simulador/apple";
import {
  LEVEL_LABEL,
  departmentLabel,
  type CaseCatalogItem,
  type CatalogLevel,
  type UserCaseStatus,
} from "@/lib/simulador/case-catalog";

type StatusFilter = "all" | UserCaseStatus;

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
      size="md"
      className={`min-w-[180px] flex-1 sm:max-w-[240px] ${value ? "is-filter-active" : ""}`}
    >
      {options.map((opt) => (
        <SelectItem key={opt.value}>{opt.label}</SelectItem>
      ))}
    </AppleSelect>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function StaffCasosPage() {
  const [cases, setCases] = useState<CaseCatalogItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<StatusFilter>("all");
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
      setCases(data.cases ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Departamentos presentes en el catálogo real (no lista fija: cada org
  // puede tener careers distintos).
  const departmentOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const c of cases ?? []) if (c.department) keys.add(c.department);
    return [...keys]
      .sort((a, b) => departmentLabel(a).localeCompare(departmentLabel(b), "en"))
      .map((value) => ({ value, label: departmentLabel(value) }));
  }, [cases]);

  const statusCounts = useMemo(() => {
    const all = cases ?? [];
    const count = (s: UserCaseStatus) =>
      all.filter((c) => c.userStatus === s).length;
    return {
      all: all.length,
      not_started: count("not_started"),
      in_progress: count("in_progress"),
      completed: count("completed"),
    };
  }, [cases]);

  const filtered = useMemo(() => {
    return (cases ?? []).filter((c) => {
      if (status !== "all" && c.userStatus !== status) return false;
      if (level && c.level !== level) return false;
      if (department && c.department !== department) return false;
      return true;
    });
  }, [cases, status, level, department]);

  const anyFilterActive = status !== "all" || level !== "" || department !== "";

  function clearAll() {
    setStatus("all");
    setLevel("");
    setDepartment("");
  }

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-8 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        {/* ============ HEADER ============ */}
        <header>
          <h1 className="display display-tight text-[var(--text-primary)] ts-display sm:ts-display-lg">
            Case library
          </h1>
          <p className="mt-3 ts-body text-[var(--text-secondary)] leading-[1.55] max-w-[640px]">
            Every case your team can play. Each person starts from their
            dashboard; results land in your reports.
          </p>
        </header>

        {/* ============ FILTROS ============ */}
        <section
          aria-label="Filters"
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <AppleTabs
            ariaLabel="Filter by status"
            value={status}
            onChange={(v) => setStatus(v as StatusFilter)}
            items={[
              {
                id: "all",
                label: "All",
                badge: cases ? statusCounts.all : undefined,
              },
              {
                id: "not_started",
                label: "Not started",
                badge: cases ? statusCounts.not_started : undefined,
              },
              {
                id: "in_progress",
                label: "In progress",
                badge: cases ? statusCounts.in_progress : undefined,
              },
              {
                id: "completed",
                label: "Completed",
                badge: cases ? statusCounts.completed : undefined,
              },
            ]}
          />
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

        {/* ============ RESULTS META ============ */}
        {cases !== null && !error && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <span className="ts-subhead text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "case" : "cases"}
              {anyFilterActive && (
                <span className="text-[var(--text-tertiary)]">
                  {" "}
                  of {cases.length}
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
        )}

        {/* ============ ESTADOS + GRID ============ */}
        {error ? (
          <div className="mt-10">
            <AppleErrorState
              title="We couldn't load the library"
              body={error}
              onAction={load}
            />
          </div>
        ) : cases === null ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <CaseCardSkeleton key={i} />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="mt-10">
            <AppleEmptyState
              title="No cases for your team yet"
              description="Once your organization activates cases, they show up here, ready for your team to play."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-5">
            <AppleEmptyState
              title="No cases match those filters"
              description="Try removing one, or clear them all to see the full library."
              action={
                <AppleButton tone="secondary" onPress={clearAll}>
                  Clear filters
                </AppleButton>
              }
            />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <CaseCard
                key={item.slug}
                item={item}
                reviewBasePath="/staff/casos"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
