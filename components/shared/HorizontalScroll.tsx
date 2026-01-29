'use client';

import { forwardRef } from 'react';

/**
 * Scroll horizontal: flex overflow-x-auto scrollbar-hide.
 * Usar en pestañas de fases, strips. Opcional: gradientes en bordes.
 * Cambiar aquí actualiza dashboard y /componentes.
 */
export interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  /** Mostrar gradientes de fade en los bordes (como en dashboard phase tabs). */
  fadeEdges?: boolean;
}

const HorizontalScroll = forwardRef<HTMLDivElement, HorizontalScrollProps>(
  function HorizontalScroll({ children, className = '', fadeEdges = false }, ref) {
    return (
      <div className="relative">
        {fadeEdges && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 w-6 sm:w-12 z-10 pointer-events-none bg-gradient-to-r from-white dark:from-gray-900 to-transparent"
              aria-hidden
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-6 sm:w-12 z-10 pointer-events-none bg-gradient-to-l from-white dark:from-gray-900 to-transparent"
              aria-hidden
            />
          </>
        )}
        <div
          ref={ref}
          className={`flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-2 px-4 sm:px-12 min-w-0 ${className}`}
          style={{ scrollBehavior: 'smooth' }}
        >
          {children}
        </div>
      </div>
    );
  }
);

export default HorizontalScroll;
