"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "./utils";

// Easing Apple del sistema (igual que var(--motion-ease)). framer-motion espera
// el array de bezier, no la CSS var.
const APPLE_EASE = [0.16, 1, 0.3, 1] as const;
// Entrada = motion-slow (~450ms) según el HIG de Itera (enter/exit de componente).
const ENTER_DURATION = 0.45;

export interface AppleRevealProps {
  children: ReactNode;
  /** Retraso en segundos — úsalo para escalonar secciones (stagger <8 elementos). */
  delay?: number;
  /** Desplazamiento inicial en Y (px). */
  y?: number;
  className?: string;
  /** Etiqueta semántica del wrapper (section/header/div…). */
  as?: "div" | "section" | "header" | "li" | "article";
}

/**
 * Animación de ENTRADA del sistema (fade + subida sutil).
 *
 * Una sola fuente para las animaciones de aparición de las superficies del
 * empleado (Pablo: "no hay ningún efecto al abrir la página"). Reglas HIG:
 *
 * - solo ENTRADA, nunca animación permanente en dashboard
 * - duración motion-slow (~450ms) + easing Apple (0.16,1,0.3,1)
 * - escalonar con `delay` SOLO en grupos <8 elementos
 * - respeta `prefers-reduced-motion`: con reduced-motion activo cae a fade puro
 *   sin desplazamiento (gate de cierre P00.5)
 *
 *   <AppleReveal as="header">…</AppleReveal>
 *   <AppleReveal delay={0.06}>…</AppleReveal>
 */
export function AppleReveal({
  children,
  delay = 0,
  y = 12,
  className,
  as = "div",
}: AppleRevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: ENTER_DURATION, ease: APPLE_EASE, delay }}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}
