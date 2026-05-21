"use client";

/**
 * /casos — catálogo de casos disponibles.
 *
 * Modelo + mock data + CaseCard viven en lib/simulador/cases.ts y
 * components/simulador/CaseCard.tsx para que /team y otras surfaces
 * usen exactamente la misma card sin duplicar código.
 */

import { useMemo, useState } from "react";
import { Select, SelectItem } from "@heroui/react";
import { CaseCard } from "@/components/simulador/CaseCard";
import {
  CASES,
  DEPARTMENT_OPTIONS,
  DURACION_OPTIONS,
  LEVEL_OPTIONS,
  SORT_OPTIONS,
  TOOL_OPTIONS,
  type Department,
  type DuracionBucket,
  type Level,
  type SortKey,
} from "@/lib/simulador/cases";

// ============================================================================
// FilterSelect — wrapper de HeroUI Select con los defaults de filtros.
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
    <Select
      placeholder={placeholder}
      aria-label={placeholder}
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const next = Array.from(keys)[0] as T | undefined;
        onChange(next ?? "");
      }}
      isClearable={!!value}
      onClear={() => onChange("")}
      variant="bordered"
      radius="lg"
      size="lg"
      className={`min-w-[180px] flex-1 ${value ? "is-filter-active" : ""}`}
    >
      {options.map((opt) => (
        <SelectItem key={opt.value}>{opt.label}</SelectItem>
      ))}
    </Select>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function CasosPage() {
  const [level, setLevel] = useState<Level | "">("");
  const [department, setDepartment] = useState<Department | "">("");
  const [duracion, setDuracion] = useState<DuracionBucket | "">("");
  const [tool, setTool] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("recientes");

  const filteredSorted = useMemo(() => {
    const filtered = CASES.filter((c) => {
      if (level && c.level !== level) return false;
      if (department && c.department !== department) return false;
      if (tool && !c.toolsRequired.includes(tool)) return false;
      if (duracion) {
        const d = DURACION_OPTIONS.find((x) => x.value === duracion);
        if (d && !d.check(c.estimatedMinutes)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "abecedario") {
        return a.title.localeCompare(b.title, "es");
      }
      const aDate = a.lastVerifiedAt ?? "0000-00-00";
      const bDate = b.lastVerifiedAt ?? "0000-00-00";
      return bDate.localeCompare(aDate);
    });
  }, [level, department, duracion, tool, sortBy]);

  const anyFilterActive =
    level !== "" || department !== "" || duracion !== "" || tool !== "";

  function clearAll() {
    setLevel("");
    setDepartment("");
    setDuracion("");
    setTool("");
  }

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-8 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        {/* ============ HEADER ============ */}
        <header>
          <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
            Catálogo de casos
          </h1>
          <p className="mt-3 text-[15px] text-[var(--text-secondary)] leading-[1.55] max-w-[640px]">
            Elige un caso para empezar tu diagnóstico. Cada caso mide tu
            criterio operativo bajo presión real con IA — no tu memoria.
          </p>
        </header>

        {/* ============ FILTROS ============ */}
        <section
          aria-label="Filtros"
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
        >
          <FilterSelect
            placeholder="Nivel"
            options={LEVEL_OPTIONS}
            value={level}
            onChange={setLevel}
          />
          <FilterSelect
            placeholder="Departamento"
            options={DEPARTMENT_OPTIONS}
            value={department}
            onChange={setDepartment}
          />
          <FilterSelect
            placeholder="Duración"
            options={DURACION_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
            value={duracion}
            onChange={setDuracion}
          />
          <FilterSelect
            placeholder="Herramientas"
            options={TOOL_OPTIONS}
            value={tool}
            onChange={setTool}
          />
        </section>

        {/* ============ RESULTS META + SORT ============ */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {filteredSorted.length}
            </span>{" "}
            {filteredSorted.length === 1 ? "caso" : "casos"}
            {anyFilterActive && (
              <span className="text-[var(--text-tertiary)]">
                {" "}
                de {CASES.length}
              </span>
            )}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--text-tertiary)]">
                Ordenar
              </span>
              <Select
                aria-label="Ordenar"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0] as SortKey | undefined;
                  if (next) setSortBy(next);
                }}
                variant="bordered"
                radius="md"
                size="sm"
                className="w-[180px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value}>{opt.label}</SelectItem>
                ))}
              </Select>
            </div>
            {anyFilterActive && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* ============ GRID ============ */}
        {filteredSorted.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSorted.map((item) => (
              <CaseCard key={item.slug} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--hairline)] py-20 text-center">
            <div className="text-[15px] font-medium text-[var(--text-primary)]">
              No hay casos con esos filtros
            </div>
            <p className="mt-2 text-[13.5px] text-[var(--text-secondary)] max-w-[360px]">
              Prueba quitando alguno o limpia todos arriba.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
