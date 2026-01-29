'use client';

/**
 * Canonical icon-style control: same look as the dashboard search bar blue icon.
 * Use as "button" for clickable icons, as "div" when inside another button (e.g. PC avatar).
 */
const base =
  'rounded-xl border-2 border-b-4 border-[#0E5FCC] bg-[#1472FF] text-white flex items-center justify-center text-sm font-bold transition-all duration-150 flex-shrink-0';
const interactive =
  'hover:bg-[#1265e0] active:border-b-2 active:mt-[2px]';

const sizes = {
  sm: 'w-[42px] h-[42px]',
  lg: 'w-[42px] h-[42px]',
} as const;

export interface IconButtonProps {
  /** Render as "button" (default) or "div" when used inside another button (e.g. avatar). */
  as?: 'button' | 'div';
  children?: React.ReactNode;
  className?: string;
  size?: keyof typeof sizes;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: React.MouseEventHandler;
  /** Button-only: accessibility label when icon has no visible text. */
  'aria-label'?: string;
}

export default function IconButton({
  as: As = 'button',
  children,
  className = '',
  size = 'sm',
  type = 'button',
  disabled,
  onClick,
  ...rest
}: IconButtonProps) {
  const isButton = As === 'button';
  const cls = [base, isButton && interactive, sizes[size], className]
    .filter(Boolean)
    .join(' ');

  if (As === 'button') {
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

  return <div className={cls} {...rest}>{children}</div>;
}
