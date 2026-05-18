'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { depth } from '@/lib/design-tokens';
import { useSidebar } from '@/contexts/SidebarContext';
import TutorChatPanel from './TutorChatPanel';

/**
 * FloatingChat — chat del Tutor IA en formato pop-up flotante.
 *
 * Reemplaza el sidebar derecho que antes contenía el chat. Estados:
 *   - **Cerrado**: botón rectangular `<Button variant="primary">` con
 *     icono + label "tutor ia" pegado al borde derecho del contenido
 *     principal (a la izquierda del `GamificationSidebar`).
 *   - **Abierto**: panel flotante 384×600 (desktop) anclado al mismo
 *     lado derecho, con el contenido completo del chat (`TutorChatPanel`).
 *
 * **Forma del trigger (después del fix de Pablo 2026-04-29):**
 * - NO es un FAB redondo. Pablo nunca usa círculos en UI.
 * - Es un `<Button variant="primary">` rectangular del design system,
 *   con icono + texto "tutor ia". Mismo lenguaje visual que el resto
 *   de buttons primarios del proyecto.
 *
 * **Posicionamiento (después del fix de Pablo 2026-04-29):**
 * - Botón y panel pegados al borde derecho del viewport (`right-6`),
 *   encima del `GamificationSidebar` cuando el chat está abierto. Pablo
 *   pidió que esté "del lado derecho", interpretado como pegado al borde
 *   derecho de la pantalla — patrón estándar de chat overlay (Intercom,
 *   Drift, Crisp). El sidebar de gamification queda detrás visible
 *   parcialmente cuando el chat está cerrado, y queda cubierto cuando
 *   está abierto (interacción activa pesa más que info pasiva).
 *
 * **Accesibilidad / z-index:**
 *   - El panel usa `role="region"` (no `dialog`) porque NO es modal.
 *   - En mobile, cuando el menú lateral (drawer) está abierto, el botón
 *     y el panel se ocultan totalmente para no competir con el overlay
 *     del drawer (ambos en z-50).
 *   - Escape cierra el panel.
 */
export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { mobileOpen } = useSidebar();

  // Cerrar con Escape — affordance estándar de pop-ups.
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Si el drawer mobile está abierto, ocultamos todo el FloatingChat
  // (botón + panel) para no quedar encima del overlay del drawer.
  if (mobileOpen) return null;

  return (
    <>
      {/* Botón trigger — rectangular, design system. */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? 'Cerrar tutor ia' : 'Abrir tutor ia'}
          aria-expanded={isOpen}
          aria-controls="tutor-ia-panel"
          className="flex items-center gap-2"
        >
          {isOpen ? (
            <svg
              className="w-4 h-4"
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
              className="w-4 h-4"
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
          tutor ia
        </Button>
      </div>

      {/* Panel flotante — anclado al mismo lado derecho que el botón. */}
      {isOpen && (
        <section
          id="tutor-ia-panel"
          role="region"
          aria-label="Tutor IA"
          className={`fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[384px] h-[calc(100vh-7.5rem)] sm:h-[600px] sm:max-h-[calc(100vh-7.5rem)] rounded-2xl ${depth.border} ${depth.bottom} border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex flex-col`}
        >
          <TutorChatPanel onClose={() => setIsOpen(false)} showCloseButton />
        </section>
      )}
    </>
  );
}
