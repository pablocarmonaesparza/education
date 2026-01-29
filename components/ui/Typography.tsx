'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────
   Design-system Typography
   Font: Darker Grotesque (inherited from layout)

   Level       Size          Weight         Case         Color (light)   Color (dark)
   ─────────   ───────────   ────────────   ──────────   ─────────────   ────────────
   title       text-2xl      extrabold      lowercase    #4b4b4b         white
   subtitle    text-lg       bold           lowercase    #4b4b4b         gray-300
   headline    text-sm       bold           UPPERCASE    #4b4b4b         gray-300
   body        text-base     normal         normal       #4b4b4b         gray-300
   caption     text-xs       normal         normal       #777777         gray-400
   ─────────────────────────────────────────────────────────── */

const levels = {
  title:
    'text-2xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white leading-tight normal-case',
  subtitle:
    'text-lg font-bold tracking-wide text-[#4b4b4b] dark:text-gray-300 normal-case',
  headline:
    'text-sm font-bold uppercase tracking-wider text-[#4b4b4b] dark:text-gray-300',
  body:
    'text-base text-[#4b4b4b] dark:text-gray-300',
  caption:
    'text-xs text-[#777777] dark:text-gray-400',
} as const;

export type TypographyLevel = keyof typeof levels;

/** Default HTML tag for each level. */
const defaultTags: Record<TypographyLevel, keyof JSX.IntrinsicElements> = {
  title: 'h1',
  subtitle: 'h2',
  headline: 'h3',
  body: 'p',
  caption: 'p',
};

export interface TypographyProps {
  level?: TypographyLevel;
  /** Override the rendered HTML element. */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Design-system text component.
 *
 * ```tsx
 * <Typography level="title">curso personalizado para tu proyecto</Typography>
 * <Typography level="subtitle">Videos a medida con IA</Typography>
 * <Typography level="headline">Sección</Typography>
 * <Typography level="body">Texto de párrafo normal.</Typography>
 * <Typography level="caption">Texto secundario o pie.</Typography>
 * ```
 *
 * **Regla:** títulos y subtítulos siempre en minúsculas, salvo nombres propios.
 */
export default function Typography({
  level = 'body',
  as,
  className = '',
  children,
}: TypographyProps) {
  const Tag = (as ?? defaultTags[level]) as any;

  return <Tag className={`${levels[level]} ${className}`}>{children}</Tag>;
}

/* ── Named convenience exports ── */

export function Title(props: Omit<TypographyProps, 'level'>) {
  return <Typography level="title" {...props} />;
}

export function Subtitle(props: Omit<TypographyProps, 'level'>) {
  return <Typography level="subtitle" {...props} />;
}

export function Headline(props: Omit<TypographyProps, 'level'>) {
  return <Typography level="headline" {...props} />;
}

export function Body(props: Omit<TypographyProps, 'level'>) {
  return <Typography level="body" {...props} />;
}

export function Caption(props: Omit<TypographyProps, 'level'>) {
  return <Typography level="caption" {...props} />;
}
