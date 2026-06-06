"use client";

import {
  Input,
  Select,
  Textarea,
  type InputProps,
  type SelectProps,
  type TextAreaProps,
} from "@heroui/react";
import { cn } from "./utils";

const fieldClassNames = {
  label: "text-[13.5px] font-medium text-[var(--text-secondary)]",
  input:
    "text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
  inputWrapper:
    "min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-none data-[hover=true]:bg-[var(--surface-2)] group-data-[focus=true]:border-[var(--accent)]",
  errorMessage: "text-[13.5px] text-[var(--band-b-text)]",
  description: "text-[13.5px] text-[var(--text-tertiary)]",
};

export function AppleInput({ classNames, label, ...props }: InputProps) {
  // Sistema: los textfields muestran SOLO placeholder, sin label arriba.
  // El texto del label se preserva como aria-label (accesibilidad).
  const a11yLabel = typeof label === "string" ? label : undefined;
  return (
    <Input
      labelPlacement="outside"
      variant="bordered"
      aria-label={a11yLabel}
      {...props}
      classNames={{
        ...fieldClassNames,
        ...classNames,
        inputWrapper: cn(fieldClassNames.inputWrapper, classNames?.inputWrapper),
      }}
    />
  );
}

export function AppleTextarea({ classNames, label, minRows = 4, ...props }: TextAreaProps) {
  // Sistema: sin label arriba — solo placeholder. Label preservado como aria-label.
  const a11yLabel = typeof label === "string" ? label : undefined;
  return (
    <Textarea
      labelPlacement="outside"
      variant="bordered"
      minRows={minRows}
      aria-label={a11yLabel}
      {...props}
      classNames={{
        ...fieldClassNames,
        ...classNames,
        inputWrapper: cn(fieldClassNames.inputWrapper, classNames?.inputWrapper),
      }}
    />
  );
}

export function AppleSelect({ classNames, label, ...props }: SelectProps) {
  // Sistema: los selects muestran SOLO placeholder, sin label arriba (igual que
  // AppleInput). El texto del label se preserva como aria-label (accesibilidad).
  const a11yLabel = typeof label === "string" ? label : undefined;
  return (
    <Select
      labelPlacement="outside"
      variant="bordered"
      aria-label={a11yLabel}
      {...props}
      classNames={{
        label: fieldClassNames.label,
        trigger:
          "min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-none data-[hover=true]:bg-[var(--surface-2)] data-[focus=true]:border-[var(--accent)]",
        value: "text-[15px] text-[var(--text-primary)]",
        errorMessage: fieldClassNames.errorMessage,
        description: fieldClassNames.description,
        ...classNames,
      }}
    />
  );
}
