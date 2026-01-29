'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Input & Textarea
   Depth borders: border-2 border-b-4
   Focus: ring-2 ring-[#1472FF]/20 border-[#1472FF]
   ─────────────────────────────────────────────────────────── */

const sharedBase =
  'w-full px-4 py-3 rounded-xl text-sm transition-all ' +
  'focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF]';

const lightMode =
  'border-2 border-gray-200 border-b-4 border-b-gray-300 ' +
  'bg-white text-[#4b4b4b] placeholder-gray-400';

const darkMode =
  'dark:border-gray-950 dark:border-b-gray-950 ' +
  'dark:bg-gray-900 dark:text-white dark:placeholder-gray-500';

const inputBase = `${sharedBase} ${lightMode} ${darkMode}`;

/* ── Input ── */

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string;
}

/**
 * Design-system text input with depth border.
 *
 * ```tsx
 * <Input placeholder="Tu nombre" />
 * <Input type="email" placeholder="correo@ejemplo.com" />
 * ```
 */
export function Input({ className = '', ...rest }: InputProps) {
  return <input className={`${inputBase} ${className}`} {...rest} />;
}

/* ── Textarea ── */

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  className?: string;
}

/**
 * Design-system textarea with depth border.
 *
 * ```tsx
 * <Textarea placeholder="Describe tu proyecto..." rows={4} />
 * ```
 */
export function Textarea({ className = '', ...rest }: TextareaProps) {
  return (
    <textarea
      className={`${inputBase} resize-none ${className}`}
      {...rest}
    />
  );
}

/* ── Search Input (with icon slot) ── */

export interface SearchInputProps extends InputProps {
  /** Icon to render inside the input (left side). Defaults to a magnifying glass. */
  icon?: React.ReactNode;
}

/**
 * Rounded search input seen in the courses page.
 *
 * ```tsx
 * <SearchInput placeholder="Buscar..." />
 * ```
 */
export function SearchInput({ icon, className = '', ...rest }: SearchInputProps) {
  const defaultIcon = (
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  return (
    <div className="relative">
      <input
        className={`w-full px-6 py-4 pl-14 rounded-2xl border-2 border-gray-200 dark:border-gray-950 ` +
          'focus:border-[#1472FF] focus:ring-2 focus:ring-[#1472FF]/20 outline-none transition-all ' +
          'text-[#4b4b4b] dark:text-white bg-white dark:bg-gray-900 placeholder-gray-400 text-sm ' +
          className}
        {...rest}
      />
      <span className="absolute left-5 top-1/2 -translate-y-1/2">
        {icon ?? defaultIcon}
      </span>
    </div>
  );
}
