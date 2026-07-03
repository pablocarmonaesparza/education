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

export function AppleSelect({
  classNames,
  label,
  listboxProps,
  popoverProps,
  ...props
}: SelectProps) {
  // Sistema: los selects muestran SOLO placeholder, sin label arriba (igual que
  // AppleInput). El texto del label se preserva como aria-label (accesibilidad).
  const a11yLabel = typeof label === "string" ? label : undefined;
  return (
    <Select
      labelPlacement="outside"
      variant="bordered"
      aria-label={a11yLabel}
      {...props}
      popoverProps={{
        placement: "bottom-start",
        offset: 6,
        ...popoverProps,
        // El popover se portea al <body> (fuera de `.simulador-root`), así que los
        // tokens de diseño (--surface, --border, --shadow-lg, --radius-md…) no
        // resolverían: viven scopeados a `.simulador-root`. Por eso le damos esa
        // clase al popover Y al content. El dark resuelve igual porque `html.dark`
        // (next-themes) sigue siendo ancestro del portal.
        //
        // Clave HeroUI v2: el slot que de verdad pinta la tarjeta es
        // `popoverProps.classNames.content` — el `classNames.popoverContent` del
        // Select es un slot muerto (se ignora). Sin esto el dropdown salía
        // transparente, sin borde/sombra y encogido (truncaba las opciones).
        // `w-full` hace que el content llene el positioner (que ya recibe el ancho
        // del trigger), evitando el truncado.
        classNames: {
          ...popoverProps?.classNames,
          base: cn("simulador-root z-50 w-full", popoverProps?.classNames?.base),
          content: cn(
            // `!flex !items-stretch` revierte el `inline-flex items-center
            // justify-center` default de HeroUI (que encogía y centraba el card);
            // `w-full` lo hace llenar el positioner (que ya recibe el ancho del
            // trigger). El `min-w` con fallback evita que opciones largas se
            // trunquen cuando el trigger es angosto (p.ej. el "Ordenar").
            "simulador-root !flex !items-stretch w-full min-w-[var(--trigger-width,16rem)] flex-col rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--text-primary)] [box-shadow:var(--shadow-lg)]",
            popoverProps?.classNames?.content,
          ),
        },
      }}
      listboxProps={{
        ...listboxProps,
        classNames: {
          ...listboxProps?.classNames,
          base: cn(
            "w-full bg-[var(--surface)] p-0 text-[var(--text-primary)]",
            listboxProps?.classNames?.base,
          ),
          list: cn("gap-1 p-0", listboxProps?.classNames?.list),
          emptyContent: cn(
            "ts-body text-[var(--text-tertiary)]",
            listboxProps?.classNames?.emptyContent,
          ),
        },
        itemClasses: {
          ...listboxProps?.itemClasses,
          base: cn(
            "rounded-[calc(var(--radius-md)-4px)] px-3 py-2 text-[var(--text-primary)] outline-none data-[hover=true]:bg-[var(--surface-2)] data-[focus=true]:bg-[var(--surface-2)] data-[focus-visible=true]:!outline-none data-[focus-visible=true]:!outline-offset-0 data-[focus-visible=true]:![box-shadow:inset_0_0_0_2px_var(--accent)] data-[selected=true]:!bg-[var(--accent-soft)] data-[selected=true]:![box-shadow:inset_0_0_0_2px_var(--accent)]",
            listboxProps?.itemClasses?.base,
          ),
          title: cn(
            "ts-body text-[var(--text-primary)]",
            listboxProps?.itemClasses?.title,
          ),
          description: cn(
            "ts-caption-1 text-[var(--text-tertiary)]",
            listboxProps?.itemClasses?.description,
          ),
          selectedIcon: cn(
            "text-[var(--accent)]",
            listboxProps?.itemClasses?.selectedIcon,
          ),
        },
      }}
      classNames={{
        ...classNames,
        label: cn(fieldClassNames.label, classNames?.label),
        trigger: cn(
          "min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] pe-11 shadow-none data-[hover=true]:bg-[var(--surface-2)] data-[focus=true]:border-[var(--accent)]",
          classNames?.trigger,
        ),
        value: cn(
          "ts-body text-[var(--text-primary)]",
          classNames?.value,
        ),
        selectorIcon: cn(
          "pointer-events-none !left-auto !right-3 text-[var(--text-tertiary)]",
          classNames?.selectorIcon,
        ),
        listboxWrapper: cn(
          "max-h-64 w-full overflow-y-auto bg-[var(--surface)] p-0",
          classNames?.listboxWrapper,
        ),
        listbox: cn(
          "bg-[var(--surface)] p-0 text-[var(--text-primary)]",
          classNames?.listbox,
        ),
        errorMessage: cn(fieldClassNames.errorMessage, classNames?.errorMessage),
        description: cn(fieldClassNames.description, classNames?.description),
      }}
    />
  );
}
