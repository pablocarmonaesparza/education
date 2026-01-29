'use client';

import Link from 'next/link';

const baseCommon =
  'font-bold uppercase tracking-wide transition-all duration-150 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const baseDepth =
  baseCommon +
  ' border-2 border-b-4 active:border-b-2 active:mt-[2px] disabled:active:border-b-4 disabled:active:mt-0';

const baseFlat = baseCommon;

const depthVariants = ['primary', 'secondary', 'outline', 'nav-active', 'icon'] as const;
const flatVariants = ['ghost', 'nav-inactive', 'icon-ghost'] as const;

const variants = {
  primary:
    'bg-[#1472FF] text-white border-[#0E5FCC] hover:bg-[#1265e0]',
  secondary:
    'bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border-gray-200 dark:border-gray-950 border-b-gray-300 dark:border-b-gray-950 hover:bg-gray-50 dark:hover:bg-gray-700',
  ghost:
    'bg-transparent text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  outline:
    'bg-white dark:bg-gray-900 text-[#4b4b4b] dark:text-gray-300 border-gray-200 dark:border-gray-950 border-b-gray-300 dark:border-b-gray-950 hover:bg-gray-50 dark:hover:bg-gray-800',
  'nav-active':
    'bg-[#1472FF] text-white border-[#0E5FCC] hover:bg-[#1265e0]',
  'nav-inactive':
    'bg-transparent text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  icon:
    'bg-[#1472FF] text-white border-[#0E5FCC] hover:bg-[#1265e0] p-0 flex items-center justify-center',
  'icon-ghost':
    'bg-transparent text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-0 flex items-center justify-center',
} as const;

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-3 text-sm',
  xl: 'px-6 py-4 text-base',
  icon: 'w-[42px] h-[42px]',
  'icon-sm': 'w-[42px] h-[42px]',
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: Variant;
  size?: Size;
  /** When provided, renders as Next.js Link instead of button. */
  href?: string;
  /** Use rounded-2xl instead of rounded-xl (e.g. nav links). */
  rounded2xl?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  rounded2xl,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const useDepth = (depthVariants as readonly string[]).includes(variant);
  const root = [
    useDepth ? baseDepth : baseFlat,
    rounded2xl ? 'rounded-2xl' : 'rounded-xl',
    variants[variant],
    size in sizes ? sizes[size as Size] : sizes.md,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href && !disabled) {
    const { type: _t, ...linkRest } = rest;
    return (
      <Link href={href} className={root} aria-disabled={undefined} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { type, ...buttonRest } = rest;
  return (
    <button type={type ?? 'button'} className={root} disabled={disabled} {...buttonRest}>
      {children}
    </button>
  );
}

/** Canonical depth + active styles only (no bg/border colors). Use for custom UIs like LessonItem. */
export const depthStyle =
  'border-2 border-b-4 transition-all duration-150 active:border-b-2 active:mt-[2px]';

/** Tailwind class for primary depth colors. */
export const depthPrimary =
  'bg-[#1472FF] border-[#0E5FCC] hover:bg-[#1265e0]';

/** Tailwind class for secondary depth colors. */
export const depthSecondary =
  'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-950 hover:bg-gray-50 dark:hover:bg-gray-700';
