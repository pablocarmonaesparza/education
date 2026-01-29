/* ───────────────────────────────────────────────────────────
   components/ui — Itera Design System
   Barrel export for all UI primitives.
   ─────────────────────────────────────────────────────────── */

// Button
export { default as Button, depthClasses, depthPrimaryColors, depthOutlineColors } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// IconButton
export { default as IconButton } from './IconButton';
export type { IconButtonProps, IconButtonVariant, IconButtonSize } from './IconButton';

// Card
export { default as Card, CardFlat } from './Card';
export type { CardProps, CardVariant } from './Card';

// Input
export { Input, Textarea, SearchInput } from './Input';
export type { InputProps, TextareaProps, SearchInputProps } from './Input';

// Divider
export { default as Divider } from './Divider';
export type { DividerProps } from './Divider';

// Typography
export { default as Typography, Title, Subtitle, Headline, Body, Caption } from './Typography';
export type { TypographyProps, TypographyLevel } from './Typography';

// ProgressBar
export { default as ProgressBar } from './ProgressBar';
export type { ProgressBarProps, ProgressBarSize } from './ProgressBar';

// StatCard
export { default as StatCard } from './StatCard';
export type { StatCardProps, StatCardColor } from './StatCard';

// Tag
export { default as Tag } from './Tag';
export type { TagProps, TagVariant } from './Tag';

// Spinner
export { default as Spinner, SpinnerPage } from './Spinner';
export type { SpinnerProps, SpinnerSize } from './Spinner';

// SectionHeader
export { default as SectionHeader } from './SectionHeader';
export type { SectionHeaderProps } from './SectionHeader';

// EmptyState
export { default as EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
