/**
 * Tokens de diseño del sistema.
 * Cambiar aquí actualiza botones, cards, inputs y cualquier UI que los use.
 *
 * Regla: todo nuevo UI debe usar solo estos tokens y los componentes compartidos.
 */

/** Contorno estándar (border). 2px en todos los lados. */
export const DEPTH_BORDER_PX = 2;
/** Profundidad (border-bottom). 4px. */
export const DEPTH_BOTTOM_PX = 4;
/** En active: border-bottom pasa a 2px y se compensa con mt 2px. */
export const DEPTH_ACTIVE_BOTTOM_PX = 2;
export const DEPTH_ACTIVE_MT_PX = 2;

/** Clases Tailwind para depth (estructura solo; colores van por variante). */
export const depth = {
  border: 'border-2',
  bottom: 'border-b-4',
  active: 'active:border-b-2 active:mt-[2px]',
  disabledActive: 'disabled:active:border-b-4 disabled:active:mt-0',
  transition: 'transition-all duration-150',
} as const;

export const depthBase =
  `${depth.border} ${depth.bottom} ${depth.active} ${depth.disabledActive} ${depth.transition}`;

/** Depth sin active (para cards que usan group-active). */
export const depthStructure = `${depth.border} ${depth.bottom} ${depth.transition}`;

/** Active en elementos dentro de `group` (p. ej. LessonItem). */
export const depthActiveGroup = 'group-active:border-b-2 group-active:mt-[2px]';
