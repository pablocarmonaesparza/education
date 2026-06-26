"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { cn } from "./utils";

type AppleButtonTone =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "destructive";

type AppleButtonSize = "sm" | "md" | "lg" | "inline";

const toneClass: Record<AppleButtonTone, string> = {
  primary:
    "accent-bg text-white border border-transparent hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
  secondary:
    "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
  ghost:
    "bg-transparent text-[var(--text-primary)] border border-transparent hover:bg-[var(--surface-3)]",
  danger:
    "bg-[var(--band-b-bar)] text-white border border-transparent hover:opacity-95",
  destructive:
    "bg-[var(--band-b-bar)] text-white border border-transparent hover:opacity-95",
};

// Variante inline: tonos solo-texto (sin fill), para acciones tipo
// "Limpiar filtros" / "Quitar" que viven dentro del flujo de texto.
const inlineToneClass: Record<AppleButtonTone, string> = {
  primary: "text-[var(--accent)] hover:opacity-80",
  secondary: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
  ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
  danger: "text-[var(--text-tertiary)] hover:text-[var(--band-b-text)]",
  destructive: "text-[var(--band-b-text)] hover:opacity-80",
};

export function AppleButton({
  className,
  tone = "primary",
  size = "md",
  ...props
}: Omit<ButtonProps, "size"> & {
  tone?: AppleButtonTone;
  size?: AppleButtonSize;
}) {
  // Variante "inline": botón de texto SIN chrome — sin min-height, sin padding
  // horizontal, sin tamaño de fuente forzado (hereda del contexto). Es el
  // primitivo correcto para los text-links de acción (no navegación) tipo
  // "Limpiar filtros", "Quitar", "Completar después". HeroUI Button no puede
  // colapsar a esto sin pelearse con su sizing, así que renderizamos un
  // <button> nativo que comparte la misma API (tone, onPress, isDisabled).
  if (size === "inline") {
    const {
      onPress,
      isDisabled,
      type,
      children,
      title,
      id,
      "aria-label": ariaLabel,
    } = props;
    return (
      <button
        type={type ?? "button"}
        id={id}
        title={title}
        aria-label={ariaLabel}
        disabled={isDisabled}
        onClick={onPress ? (e) => onPress(e as never) : undefined}
        className={cn(
          "inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-transparent font-medium shadow-none transition-colors duration-[var(--motion-fast)] ease-[var(--motion-ease)] disabled:opacity-50 disabled:pointer-events-none",
          inlineToneClass[tone],
          className,
        )}
      >
        {children}
      </button>
    );
  }

  // Sistema (DEC-005): TODO control redondeado usa el mismo radio que los
  // textfields (--radius-md). Se fuerza después de {...props} para que ningún
  // uso pueda romper la consistencia con un radius distinto.
  return (
    <Button
      size={size}
      {...props}
      radius="md"
      className={cn(
        "min-h-11 !rounded-[var(--radius-md)] px-4 ts-body font-medium shadow-none transition-[transform,opacity,background-color,border-color] duration-[var(--motion-fast)] ease-[var(--motion-ease)] active:scale-[0.98] active:opacity-95 disabled:scale-100",
        toneClass[tone],
        className,
      )}
    />
  );
}
