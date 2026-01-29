'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Icon Button · 42×42px
   Variants: primary (depth), outline (depth), ghost (flat)
   ─────────────────────────────────────────────────────────── */

const base =
  'rounded-xl flex items-center justify-center text-sm font-bold ' +
  'transition-all duration-150 flex-shrink-0';

const depthBase =
  'border-2 border-b-4 active:border-b-2 active:mt-[2px]';

const variantStyles = {
  /** Blue filled with #0E5FCC depth border */
  primary:
    `${depthBase} bg-[#1472FF] text-white border-[#0E5FCC] hover:bg-[#1265e0]`,

  /** White / dark-gray with neutral depth border */
  outline:
    `${depthBase} bg-white dark:bg-gray-900 text-[#4b4b4b] dark:text-gray-300 ` +
    'border-gray-200 dark:border-gray-950 border-b-gray-300 dark:border-b-gray-950 ' +
    'hover:bg-gray-50 dark:hover:bg-gray-800',

  /** No border, transparent bg, hover highlight only */
  ghost:
    'bg-transparent text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
} as const;

const sizeStyles = {
  sm: 'w-[42px] h-[42px]',
  md: 'w-[42px] h-[42px]',
  lg: 'w-[48px] h-[48px]',
} as const;

export type IconButtonVariant = keyof typeof variantStyles;
export type IconButtonSize = keyof typeof sizeStyles;

export interface IconButtonProps {
  /** Render as <button> (default) or <div> when nested inside another interactive. */
  as?: 'button' | 'div';
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: React.MouseEventHandler;
  'aria-label'?: string;
}

/**
 * 42×42 icon button matching the design system.
 *
 * ```tsx
 * <IconButton variant="primary" aria-label="Añadir"><PlusIcon /></IconButton>
 * <IconButton variant="outline" aria-label="Ajustes"><GearIcon /></IconButton>
 * <IconButton variant="ghost" aria-label="Menú"><MenuIcon /></IconButton>
 * <IconButton as="div" variant="primary">PC</IconButton>
 * ```
 */
export default function IconButton({
  as: Tag = 'button',
  variant = 'primary',
  size = 'sm',
  children,
  className = '',
  type = 'button',
  disabled,
  onClick,
  ...rest
}: IconButtonProps) {
  const isButton = Tag === 'button';

  const cls = [
    base,
    variantStyles[variant],
    sizeStyles[size],
    // Non-interactive divs don't need hover/active, but we keep the
    // visual variant so it looks the same.
    !isButton && 'cursor-default',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (Tag === 'div') {
    return (
      <div className={cls} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cls}
      {...rest}
    >
      {children}
    </button>
  );
}
