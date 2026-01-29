'use client';

import { forwardRef } from 'react';

/**
 * Scroll vertical: overflow-y-auto overflow-x-hidden.
 * Usar en contenido principal, listas, chat. Opcional flex-1 en contenedores flex.
 * Cambiar aquí actualiza dashboard y /componentes.
 */
export interface VerticalScrollProps {
  children: React.ReactNode;
  className?: string;
  /** Añadir flex-1 para llenar espacio en contenedores flex. */
  flex1?: boolean;
}

const VerticalScroll = forwardRef<HTMLDivElement, VerticalScrollProps>(
  function VerticalScroll({ children, className = '', flex1 = false }, ref) {
    return (
      <div
        ref={ref}
        className={`overflow-y-auto overflow-x-hidden ${flex1 ? 'flex-1' : ''} ${className}`}
      >
        {children}
      </div>
    );
  }
);

export default VerticalScroll;
