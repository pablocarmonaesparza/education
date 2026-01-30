'use client';

import { depthStructure } from '@/lib/design-tokens';

/**
 * Caja compuesta: leading | content | trailing.
 * Misma depth que cards (border-2 border-b-4). Usar en selector de proyecto, etc.
 * Cambiar estilos aquí actualiza dashboard y /componentes.
 */
export interface CompositeCardProps {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const cardBase =
  'relative rounded-2xl p-3 sm:p-4 ' +
  'bg-white dark:bg-gray-800 ' +
  'border-2 border-gray-200 dark:border-gray-900 border-b-4 border-b-gray-300 dark:border-b-gray-900 ' +
  depthStructure;

export default function CompositeCard({
  leading,
  trailing,
  children,
  className = '',
  contentClassName = '',
}: CompositeCardProps) {
  return (
    <div className={`${cardBase} ${className}`}>
      {leading != null && (
        <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10">
          {leading}
        </div>
      )}
      <div
        className={`min-w-0 text-center ${leading != null ? 'pl-10 sm:pl-12' : ''} ${trailing != null ? 'pr-10 sm:pr-12' : ''} ${contentClassName}`}
      >
        {children}
      </div>
      {trailing != null && (
        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10">
          {trailing}
        </div>
      )}
    </div>
  );
}
