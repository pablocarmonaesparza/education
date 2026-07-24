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

// Lenguaje v2 (fuente: LandingPage.tsx, rediseño Duolingo-craft):
//   - primary/danger llevan "labio" 3D (--shadow-lip*, box-shadow 0 4px 0
//     accent-lip) y press hundido AUTÉNTICO: al presionar, el labio desaparece
//     (active:shadow-none) y el botón baja EXACTAMENTE la altura del labio
//     (translate-y-[4px] = los 4px de --shadow-lip). Así el borde inferior se
//     queda clavado y la cara del botón se mete a ras del hueco — el gesto
//     Duolingo. (Con 2px el borde inferior SUBÍA y se leía como "se encogió",
//     no como "se hundió".) Ni box-shadow ni transform tocan el layout, así que
//     la altura de flujo NUNCA cambia — el vecino no salta.
//   - secondary/ghost NO llevan labio (regla dura); conservan el press sutil
//     por escala del sistema anterior.
//   - Sólidos usan --accent-strong (DEC-009: blanco encima pasa AA); se usa
//     bg-[var(--accent-strong)] en vez de la utility .accent-bg para que
//     disabled:bg-* pueda ganar por especificidad.
//   - data-[pressed=true]:scale-100 neutraliza el scale-[0.97] que HeroUI
//     aplica por defecto al presionar (chocaría con el press hundido).
const lipPress =
  "hover:brightness-110 active:translate-y-[4px] active:shadow-none data-[pressed=true]:translate-y-[4px] data-[pressed=true]:shadow-none data-[pressed=true]:scale-100 disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)] disabled:shadow-none disabled:brightness-100 disabled:cursor-not-allowed";

const toneClass: Record<AppleButtonTone, string> = {
  primary: cn(
    "bg-[var(--accent-strong)] text-white border border-transparent font-extrabold tracking-[0.3px] shadow-lip",
    lipPress,
  ),
  secondary:
    "bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] font-extrabold hover:border-[var(--border-strong)] active:scale-[0.98] disabled:text-[var(--text-disabled)] disabled:border-[var(--surface-3)] disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-[var(--text-primary)] border border-transparent font-bold hover:bg-[var(--surface-3)] active:scale-[0.98] disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed",
  danger: cn(
    "bg-[var(--v2-red-strong)] text-white border border-transparent font-extrabold tracking-[0.3px] shadow-lip-danger focus-visible:outline-[var(--v2-red)]",
    lipPress,
  ),
  destructive: cn(
    "bg-[var(--v2-red-strong)] text-white border border-transparent font-extrabold tracking-[0.3px] shadow-lip-danger focus-visible:outline-[var(--v2-red)]",
    lipPress,
  ),
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
        // Base sin peso ni sombra: cada tone define su labio (o su ausencia) y
        // su peso v2. box-shadow y filter entran a la transición para que el
        // labio y el hover:brightness animen con los tokens de motion.
        "min-h-11 !rounded-[var(--radius-md)] px-4 ts-body transition-[transform,box-shadow,filter,opacity,background-color,border-color,color] duration-[var(--motion-fast)] ease-[var(--motion-ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:scale-100",
        toneClass[tone],
        className,
      )}
    />
  );
}
