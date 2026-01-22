'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function ChatbotButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // No mostrar el botón si ya estamos en la página del tutor
  if (pathname === '/dashboard/tutor') return null;

  const handleClick = () => {
    if (isExpanded) {
      router.push('/dashboard/tutor');
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Mensaje tipo "burbuja" cuando está expandido */}
      {isExpanded && (
        <div className="bg-white shadow-xl rounded-2xl p-4 mb-2 w-72 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">Tutor IA</h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            ¿Tienes alguna duda sobre tu lección? Estoy aquí para ayudarte.
          </p>
          <button
            onClick={() => router.push('/dashboard/tutor')}
            className="w-full py-2 px-4 bg-[#1472FF] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
          >
            Abrir Chat Completo
          </button>
        </div>
      )}

      {/* Botón Flotante */}
      <button
        onClick={handleClick}
        className={`
          flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all duration-300
          bg-[#1472FF] text-white
          ${isExpanded ? 'w-12 h-12' : 'w-14 h-14 hover:scale-105'}
        `}
        aria-label="Abrir Tutor IA"
      >
        {isExpanded ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
}




