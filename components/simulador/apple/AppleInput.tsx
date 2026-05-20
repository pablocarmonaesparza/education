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
  label: "text-[13px] font-medium text-[var(--text-secondary)]",
  input:
    "text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
  inputWrapper:
    "min-h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] shadow-none data-[hover=true]:bg-[var(--surface-2)] group-data-[focus=true]:border-[var(--accent)]",
  errorMessage: "text-[13px] text-[var(--band-b-text)]",
  description: "text-[13px] text-[var(--text-tertiary)]",
};

export function AppleInput({ classNames, ...props }: InputProps) {
  return (
    <Input
      labelPlacement="outside"
      variant="bordered"
      {...props}
      classNames={{
        ...fieldClassNames,
        ...classNames,
        inputWrapper: cn(fieldClassNames.inputWrapper, classNames?.inputWrapper),
      }}
    />
  );
}

export function AppleTextarea({ classNames, minRows = 4, ...props }: TextAreaProps) {
  return (
    <Textarea
      labelPlacement="outside"
      variant="bordered"
      minRows={minRows}
      {...props}
      classNames={{
        ...fieldClassNames,
        ...classNames,
        inputWrapper: cn(fieldClassNames.inputWrapper, classNames?.inputWrapper),
      }}
    />
  );
}

export function AppleSelect({ classNames, ...props }: SelectProps) {
  return (
    <Select
      labelPlacement="outside"
      variant="bordered"
      {...props}
      classNames={{
        label: fieldClassNames.label,
        trigger:
          "min-h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] shadow-none data-[hover=true]:bg-[var(--surface-2)] data-[focus=true]:border-[var(--accent)]",
        value: "text-[15px] text-[var(--text-primary)]",
        errorMessage: fieldClassNames.errorMessage,
        description: fieldClassNames.description,
        ...classNames,
      }}
    />
  );
}
