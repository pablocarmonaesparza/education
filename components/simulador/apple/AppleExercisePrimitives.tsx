/**
 * Primitivos de formulario/selección reutilizados entre los bloques ricos del
 * exercise lab (Label, ChoiceButton, GuidedOption, Range10, CompareCard…).
 *
 * Promovido al design system desde `app/exercise-lab/_shared/ui-primitives.tsx`
 * (a su vez extraído del monolito `ExerciseLabClient.tsx` de Codex). Markup
 * EXACTO — fuente única acá; el lab lo consume vía el shim
 * `_shared/ui-primitives.tsx`. Hereda los tokens del ancestro `.simulador-root`.
 *
 * Nota: estos nombres NO llevan prefijo `Apple` a propósito — preservan la API
 * que ya consumen los bloques, para que el shim sea transparente y no haya
 * churn de imports en el runtime. Radios ya normalizados a tokens v2
 * (--radius-md/--radius-lg); la escala tipográfica fina queda como follow-up
 * coordinado con Codex.
 *
 * v2 (Duolingo-craft): labels de opción en font-bold y estado seleccionado
 * canónico accent-border + accent-soft (antes ChoiceButton iba en acento
 * sólido — desviación corregida para unificar con GuidedOption/CompareCard).
 */

"use client";

import type React from "react";

export function Label({ children }: { children: React.ReactNode }) {
  // v2: labels en bold (jerarquía con peso del rediseño Duolingo-craft)
  return (
    <div className="ts-callout font-bold text-[var(--text-primary)]">
      {children}
    </div>
  );
}

export function ChoiceButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-[var(--radius-md)] border px-3 ts-subhead font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

export function GuidedOption({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid min-h-11 grid-cols-[20px_1fr] items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-2 text-left ts-subhead transition-colors ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
          : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border ${
          selected ? "border-[var(--accent)] bg-[var(--accent-strong)] text-white" : "border-[var(--border-strong)]"
        }`}
        aria-hidden
      >
        {selected && (
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.2L5 8.7L9.5 3.8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
          </svg>
        )}
      </span>
      {/* v2: label de opción en bold */}
      <span className="font-bold leading-snug">{children}</span>
    </button>
  );
}

export function GuidedInputCard({
  children,
}: {
  children: React.ReactNode;
}) {
  // min-h-52 (208px, escala estándar): reserva altura para que la card no salte entre slides
  return <div className="min-h-52 rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-3">{children}</div>;
}

export function GuidedSlideOptions({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <GuidedOption key={option} selected={value === option} onClick={() => onChange(option)}>
          {option}
        </GuidedOption>
      ))}
    </div>
  );
}

export function Range10({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="grid grid-cols-[72px_1fr_36px] items-center gap-3 ts-subhead">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--surface-3)] accent-[var(--accent)]"
        />
        <span className="mono text-[var(--text-primary)]">{value}</span>
      </label>
    </div>
  );
}

export function ProcessAnswer({
  index,
  label,
  value,
  muted = false,
}: {
  index: number;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="grid grid-cols-[28px_1fr] gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <span
        className={`grid h-7 w-7 place-items-center rounded-full ts-footnote font-semibold ${
          muted ? "bg-[var(--surface)] text-[var(--text-tertiary)]" : "bg-[var(--accent-strong)] text-white"
        }`}
      >
        {index}
      </span>
      <span className="min-w-0">
        <span className="block ts-footnote font-medium text-[var(--text-tertiary)]">{label}</span>
        <span
          className={`mt-1 block ts-callout leading-snug ${
            muted ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
          }`}
        >
          {value || " "}
        </span>
      </span>
    </div>
  );
}

export function CompareCard({
  selected,
  onClick,
  title,
  body,
}: {
  id?: string;
  selected: boolean;
  onClick: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-56 rounded-[var(--radius-lg)] border p-5 text-left transition-colors ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
      }`}
    >
      <span className="block ts-body font-bold text-[var(--text-primary)]">{title}</span>
      <span className="mt-4 block ts-body leading-6 text-[var(--text-secondary)]">{body}</span>
    </button>
  );
}

export function AgentBriefLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="ts-footnote text-[var(--text-tertiary)]">{label}</div>
      <div
        className={`mt-1 min-h-5 ts-callout leading-snug ${
          value ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
        }`}
      >
        {value || " "}
      </div>
    </div>
  );
}
