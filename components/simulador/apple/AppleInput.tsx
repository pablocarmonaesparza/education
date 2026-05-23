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
  label: "ts-subhead font-medium text-[var(--text-secondary)]",
  input:
    "ts-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
  inputWrapper:
    "min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-none data-[hover=true]:bg-[var(--surface-2)] group-data-[focus=true]:border-[var(--accent)]",
  errorMessage: "ts-subhead text-[var(--band-b-text)]",
  description: "ts-subhead text-[var(--text-tertiary)]",
};

export function AppleInput({ classNames, radius = "md", ...props }: InputProps) {
  return (
    <Input
      labelPlacement="outside"
      variant="bordered"
      radius={radius}
      {...props}
      classNames={{
        ...fieldClassNames,
        ...classNames,
        inputWrapper: cn(fieldClassNames.inputWrapper, classNames?.inputWrapper),
      }}
    />
  );
}

export function AppleTextarea({ classNames, minRows = 4, radius = "md", ...props }: TextAreaProps) {
  return (
    <Textarea
      labelPlacement="outside"
      variant="bordered"
      radius={radius}
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

export function AppleSelect({ classNames, radius = "md", ...props }: SelectProps) {
  return (
    <Select
      labelPlacement="outside"
      variant="bordered"
      radius={radius}
      {...props}
      classNames={{
        label: fieldClassNames.label,
        trigger:
          "min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-none data-[hover=true]:bg-[var(--surface-2)] data-[focus=true]:border-[var(--accent)]",
        value: "ts-body text-[var(--text-primary)]",
        errorMessage: fieldClassNames.errorMessage,
        description: fieldClassNames.description,
        ...classNames,
      }}
    />
  );
}
