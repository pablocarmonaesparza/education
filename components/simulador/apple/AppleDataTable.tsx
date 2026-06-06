"use client";

import { cn } from "./utils";

export interface AppleDataTableColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
}

export interface AppleDataTableProps {
  columns: AppleDataTableColumn[];
  rows: Array<Record<string, string | number>>;
  caption?: string;
  className?: string;
}

/**
 * AppleDataTable — tabla informativa de solo lectura (caption + columnas + filas).
 * Extraída del bloque reading_data_table; el bloque la consume. Hereda los
 * tokens de color del ancestro `.simulador-root`.
 */
export function AppleDataTable({
  columns,
  rows,
  caption,
  className,
}: AppleDataTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]",
        className,
      )}
    >
      {caption && (
        <div className="border-b border-[var(--hairline)] px-4 py-3 ts-caption-1 font-medium text-[var(--text-tertiary)]">
          {caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full ts-subhead">
          <thead>
            <tr className="bg-[var(--surface-2)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-2.5 ts-caption-1 font-medium text-[var(--text-tertiary)] ${alignClass(col.align)}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={idx < rows.length - 1 ? "border-b border-[var(--hairline)]" : ""}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-[var(--text-primary)] ${alignClass(col.align)} ${col.align === "right" ? "tabular-nums" : ""}`}
                  >
                    {row[col.key] ?? "·"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function alignClass(align?: "left" | "right" | "center"): string {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}
