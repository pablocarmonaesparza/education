'use client';

import Link from 'next/link';
import { depthBase } from '@/lib/design-tokens';

const baseCommon =
  'font-bold uppercase tracking-wide transition-all duration-150 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const baseDepth = baseCommon + ' ' + depthBase;

const baseFlat = baseCommon;

const depthVariants = ['primary', 'secondary', 'outline', 'nav-active', 'icon'] as const;
const flatVariants = ['ghost', 'nav-inactive', 'icon-ghost'] as const;

const variants = {
  primary:
    'bg-[#1472FF] text-white border-[#0E5FCC] hover:bg-[#0E5FCC]',
  secondary:
    'bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 hover:bg-gray-300 dark:hover:bg-gray-900',
  ghost:
    'bg-transparent text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  outline:
    'bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 hover:bg-gray-300 dark:hover:bg-gray-900',
  'nav-active':
    'bg-[#1472FF] text-white border-[#0E5FCC] hover:bg-[#0E5FCC]',
  'nav-inactive':
    'bg-transparent text-[#4b4b4b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  icon:
    'bg-[#1472FF] text-white border-[#0E5FCC] hover:bg-[#0E5FCC] p-0 flex items-center justify-center',
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

/** Depth structure only (from design tokens). Use with color classes in LessonItem, cards, etc. */
export { depthStructure as depthStyle } from '@/lib/design-tokens';

/** Tailwind class for primary depth colors. */
export const depthPrimary =
  'bg-[#1472FF] border-[#0E5FCC] hover:bg-[#0E5FCC]';

/** Tailwind class for secondary depth colors. */
export const depthSecondary =
  'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-900 hover:bg-gray-300 dark:hover:bg-gray-900';
