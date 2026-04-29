'use client';

import { useEffect, useState } from 'react';
import { depth } from '@/lib/design-tokens';
import { useSidebar } from '@/contexts/SidebarContext';
import TutorChatPanel from './TutorChatPanel';

/**
 * FloatingChat — chat del Tutor IA en formato pop-up flotante (FAB).
 *
 * Reemplaza el sidebar derecho que antes contenía el chat. Estados:
 *   - **Cerrado**: FAB redondo abajo a la derecha con un icono de chat.
 *   - **Abierto**: panel flotante 384×600 (desktop) anclado bottom-right
 *     con el contenido completo del chat (`TutorChatPanel`).
 *
 * En desktop el FAB se ancla a la izquierda del `GamificationSidebar`
 * (right-[280px] = 256 sidebar + 24 gap). En mobile cae en la esquina del
 * viewport (right-6).
 *
 * **Accesibilidad / z-index:**
 *   - El panel usa `role="region"` (no `dialog`) porque NO es modal —
 *     el usuario sigue pudiendo interactuar con el contenido detrás. Si
 *     en el futuro se decide hacerlo modal, agregar focus trap + restaurar
 *     foco al cerrar.
 *   - En mobile, cuando el menú lateral (drawer) está abierto, el FAB se
 *     oculta para no quedar encima del overlay del drawer (ambos en z-50).
 *     `useSidebar().mobileOpen` viene del `SidebarProvider` que envuelve el
 *     dashboard layout.
 *   - Escape cierra el panel — affordance estándar de pop-ups.
 *
 * No reemplaza ni mueve los modales de gamification (`LevelUpModal`,
 * `BadgeUnlockModal`) — esos siguen disparándose desde
 * `app/dashboard/page.tsx` y se renderizan encima de todo via z-[100].
 */
export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { mobileOpen } = useSidebar();

  // Cerrar con Escape — affordance estándar de pop-ups
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Si el drawer mobile está abierto, ocultamos el FAB y el panel para
  // evitar competir con el overlay del menú (ambos viven en z-50). En
  // desktop `mobileOpen` siempre es false porque el drawer sólo se abre
  // en breakpoints < md.
  if (mobileOpen) return null;

  return (
    <>
      {/* FAB — abajo a la derecha del contenido principal. En desktop se
          ancla a la izquierda del GamificationSidebar (256px + 24px de
          gap = right-[280px]); en mobile el sidebar derecho está oculto, así
          que cae en la esquina del viewport. */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Cerrar tutor IA' : 'Abrir tutor IA'}
        aria-expanded={isOpen}
        aria-controls="tutor-ia-panel"
        className={`fixed bottom-6 right-6 md:right-[280px] z-50 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center ${depth.border} ${depth.bottom} border-primary-dark border-b-primary-dark hover:bg-primary-hover ${depth.active} ${depth.transition} shadow-lg`}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Panel flotante — montado solo cuando isOpen para que useTutorChat
          no haga la query de conversaciones de fondo. Se ancla a la izquierda
          del GamificationSidebar en desktop (mismo offset que el FAB).
          `role="region"` (no dialog) porque no es modal. */}
      {isOpen && (
        <section
          id="tutor-ia-panel"
          role="region"
          aria-label="Tutor IA"
          className={`fixed bottom-24 right-6 md:right-[280px] z-50 w-[calc(100vw-3rem)] sm:w-[384px] h-[calc(100vh-7.5rem)] sm:h-[600px] sm:max-h-[calc(100vh-7.5rem)] rounded-2xl ${depth.border} ${depth.bottom} border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex flex-col`}
        >
          <TutorChatPanel onClose={() => setIsOpen(false)} showCloseButton />
        </section>
      )}
    </>
  );
}
